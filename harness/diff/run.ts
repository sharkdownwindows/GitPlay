import { performance } from "node:perf_hooks";
import { pathToFileURL } from "node:url";
import { writeFileSync } from "node:fs";
import type { Command, ErrorClass } from "../../src/core/types";
import type { DiffTestSummary, Divergence } from "../../src/verification/report";
import { commandText, runEngine, type AbstractCommand } from "./adapter";
import { ACTIONS, FIXTURES, generateSequences } from "./generate";
import { normalizeEngine, normalizeReal } from "./normalize";
import { gitVersion, isPinnedGit, runReal, type GitInvocation } from "./runReal";

type EngineRun = ReturnType<typeof runEngine>;
type RealRun = ReturnType<typeof runReal>;

/** Only known, command-specific Git failures receive an ErrorClass. */
export function gitErrorClass(command: Command, result: GitInvocation): ErrorClass | undefined {
  if (result.status === 0) return undefined;
  const output = result.output.toLowerCase();
  if (command.kind === "branch" || command.kind === "switch" || command.kind === "checkout") {
    if (/already exists/.test(output)) return "BranchAlreadyExists";
    if (/not a valid object name|does not have any commits|not a valid branch point/.test(output)) return "NoCommitsYet";
    if (/not a valid branch name|not a valid refname|invalid branch name|invalid ref name/.test(output)) return "InvalidRefName";
    if (command.kind === "branch" && /not found/.test(output)) return "NoCommitsYet";
    if (command.kind !== "branch" &&
        /invalid reference|unknown revision|did not match any file|pathspec|a branch is expected|not a valid reference/.test(output)) {
      return "PathspecNotFound";
    }
  }
  if (command.kind === "merge") {
    if (/not something we can merge|not a valid object name/.test(output)) return "PathspecNotFound";
    if (/conflict/.test(output)) return "MergeConflict";
  }
  // Unknown output stays unclassified and is a hard mismatch, never a guessed pathspec.
  return undefined;
}

export interface DifferentialResult {
  summary: DiffTestSummary;
  divergences: Divergence[];
  gitVersion: string;
  sequences: number;
  alphabetSize: number;
  fixtures: { name: string; setupLength: number }[];
}

export function formatDivergenceLog(result: DifferentialResult): string {
  const lines = [
    "# Differential divergence log", "",
    "## Execution policy", "",
    "Execution policy: depth 2 on every pull request; depth 3 nightly for now. Nightly automation is not configured yet. The local Git process spike measured a 29.21 ms mean.",
    `This corrected local depth-2 run took ${(result.summary.durationMs / 1000).toFixed(1)} seconds. Revisit the policy after the first GitHub CI run using Git 2.43.`, "",
    `Observed with ${result.gitVersion}; fixed alphabet ${result.alphabetSize}; seed ${result.summary.seed}; exhaustive suffix depth ${result.summary.exhaustiveDepth}.`,
    `Fixtures: ${result.fixtures.map((fixture) => `${fixture.name} (setup ${fixture.setupLength})`).join(", ")}. Setup commands do not count toward suffix depth.`,
    `Cases: ${result.sequences}; hard-failed cases: ${result.summary.failed}; distinct output warnings: ${result.summary.warnings}.`, "",
    "Divergences are deduplicated by kind and minimal failing command prefix. Hard failures remain correctness defects.",
    "Reproduce sequences through the typed harness adapter: synthetic cN commit targets are resolved to real Git hashes before invocation.",
    "Soft warnings are accepted output-format differences; no code fix is required under the accepted contract.", "",
    "The alphabet covers typed Tier 1 commands. Parser-only classes (NotGitCommand, UnknownSubcommand, MissingArgument), NothingToCommit, AlreadyOnBranch, BranchNotFullyMerged and UnknownCommand are outside this CLI gate.", "",
  ];
  if (result.divergences.length === 0) lines.push("No divergences have been observed yet.", "");
  for (const divergence of result.divergences) {
    lines.push(
      `## ${divergence.id} — ${divergence.kind} (${divergence.severity})`, "",
      "Command sequence:", "```text", ...divergence.commands, "```", "",
      "Expected (Git):", "```text", divergence.expected, "```", "",
      "Actual (GitScope):", "```text", divergence.actual, "```", "",
      divergence.severity === "soft"
        ? "Cause: not established; accepted output-only difference."
        : "Cause: not established; requires investigation.", "",
      divergence.severity === "soft"
        ? "Fixing commit: None; no code fix is required under the accepted contract."
        : "Fixing commit: Pending.", "",
    );
  }
  lines.push("## Entry template", "", "Command sequence:", "```text", "git ...", "```", "",
    "Expected (Git):", "```text", "...", "```", "",
    "Actual (GitScope):", "```text", "...", "```", "",
    "Cause: To be established from a reproduction.", "", "Fixing commit: Pending.", "");
  return lines.join("\n");
}

export function runDifferential(
  depth: number,
  engine: (commands: readonly AbstractCommand[]) => EngineRun = runEngine,
  real: (commands: readonly AbstractCommand[]) => RealRun = runReal,
): DifferentialResult {
  const start = performance.now();
  const cases = generateSequences(depth);
  const divergences: Divergence[] = [];
  const seen = new Set<string>();
  let failed = 0;
  let warnings = 0;
  const record = (entry: Omit<Divergence, "id">): void => {
    const key = JSON.stringify([entry.kind, entry.commands]);
    if (seen.has(key)) return;
    seen.add(key);
    divergences.push({ id: `d${divergences.length + 1}`, ...entry });
    if (entry.severity === "soft") warnings++;
  };
  for (const testCase of cases) {
    const actual = engine(testCase.commands);
    const expected = real(testCase.commands);
    if (actual.steps.length !== testCase.commands.length || expected.steps.length !== testCase.commands.length) {
      throw new Error(`Adapter omitted steps for ${testCase.fixture}`);
    }
    let caseHard = false;
    const count = Math.max(1, testCase.commands.length);
    for (let i = 0; i < count; i++) {
      const command = testCase.commands[i];
      const actualStep = actual.steps[i]?.result;
      const expectedStep = expected.steps[i]?.result;
      const prefix = testCase.commands.slice(0, i + 1).map(commandText);
      let stepHard = false;
      const outputDiff = actualStep && expectedStep
        ? expectedStep.output !== actualStep.output.join("\n") : false;
      let expectedState: string;
      let actualState: string;
      try { expectedState = JSON.stringify(normalizeReal(expected.steps[i]?.state ?? expected.state)); }
      catch (error) { expectedState = `normalization error: ${String(error)}`; }
      try { actualState = JSON.stringify(normalizeEngine(actualStep?.state ?? actual.state)); }
      catch (error) { actualState = `normalization error: ${String(error)}`; }
      if (command && actualStep && expectedStep) {
        const expectedClass = gitErrorClass(command, expectedStep);
        if ((expectedStep.status === 0) !== actualStep.ok || expectedClass !== actualStep.errorClass) {
          caseHard = stepHard = true;
          record({ kind: "errorClass", severity: "hard", commands: prefix,
            expected: `status=${expectedStep.status}; class=${expectedClass ?? "unclassified"}; ${expectedStep.output}`,
            actual: `ok=${actualStep.ok}; class=${actualStep.errorClass ?? "none"}; ${actualStep.output.join("\n")}`,
            expectedErrorClass: expectedClass ?? null, actualErrorClass: actualStep.errorClass ?? null });
        }
      }
      if (expectedState !== actualState || expectedState.startsWith("normalization error:") || actualState.startsWith("normalization error:")) {
        caseHard = stepHard = true;
        record({ kind: "state", severity: "hard", commands: prefix, expected: expectedState, actual: actualState });
      }
      // Output is checked at every step; only output-only differences are soft warnings.
      if (!caseHard && !stepHard && actualStep && expectedStep && outputDiff) {
        record({ kind: "output", severity: "soft", commands: prefix,
          expected: expectedStep.output, actual: actualStep.output.join("\n") });
      }
    }
    if (caseHard) failed++;
  }
  return {
    summary: { totalCases: cases.length, passed: cases.length - failed, failed, warnings,
      exhaustiveDepth: depth, randomCases: 0, seed: 0, durationMs: performance.now() - start },
    divergences, gitVersion: gitVersion(), sequences: cases.length, alphabetSize: ACTIONS.length,
    fixtures: FIXTURES.map(({ name, setup }) => ({ name, setupLength: setup.length })),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const flag = process.argv.indexOf("--exhaustive");
  const depth = flag < 0 ? 2 : Number(process.argv[flag + 1]);
  if (!Number.isInteger(depth) || depth < 0) throw new Error("Invalid --exhaustive depth");
  const result = runDifferential(depth);
  console.log(`Git: ${result.gitVersion}${isPinnedGit(result.gitVersion) ? " (CI pin 2.43)" : " (local version differs from CI pin 2.43)"}`);
  console.log(`Alphabet: ${result.alphabetSize}; fixtures: ${result.fixtures.map((fixture) => `${fixture.name}(${fixture.setupLength})`).join(", ")}; suffix depth: ${depth}`);
  console.log(`Sequences: ${result.sequences}; runtime: ${result.summary.durationMs.toFixed(0)} ms`);
  console.log(`Passed: ${result.summary.passed}; hard-failed cases: ${result.summary.failed}; distinct output warnings: ${result.summary.warnings}`);
  for (const divergence of result.divergences) console.log(JSON.stringify(divergence));
  if (process.argv.includes("--write-log")) writeFileSync("docs/divergences.md", formatDivergenceLog(result));
  if (result.summary.failed > 0) process.exitCode = 1;
}
