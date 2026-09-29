import { performance } from "node:perf_hooks";
import { pathToFileURL } from "node:url";
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import type { Command, ErrorClass } from "../../src/core/types";
import { isVerificationReport, type CoverageByCommand, type DiffTestSummary, type Divergence } from "../../src/verification/report";
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
  commitSha: string;
  coverage: CoverageByCommand;
}

export function formatDivergenceLog(result: DifferentialResult): string {
  const hard = result.divergences.filter((item) => item.severity === "hard");
  const soft = result.divergences.filter((item) => item.severity === "soft");
  const lines = [
    "# Differential divergence log", "",
    "## Run metadata", "",
    `Commit SHA: ${result.commitSha}`,
    `Git version: ${result.gitVersion}`,
    `Seed: ${result.summary.seed}`,
    `Exhaustive depth: ${result.summary.exhaustiveDepth}`,
    `Cases: ${result.sequences}`,
    `Hard failures: ${result.summary.failed}`,
    `Output warnings: ${result.summary.warnings}`,
    `Alphabet size: ${result.alphabetSize}`,
    `Fixtures: ${result.fixtures.map((fixture) => `${fixture.name} (setup ${fixture.setupLength})`).join(", ")}`, "",
    "Setup commands do not count toward exhaustive depth. Output warnings are a soft gate.", "",
    "## Hard divergences", "",
  ];
  if (hard.length === 0) lines.push("No hard divergences observed; no harness-detected hard divergence has a verified fixing commit.", "");
  for (const divergence of hard) {
    lines.push(
      `### ${divergence.id} — ${divergence.kind}`, "",
      "Minimal command sequence:", "```text", ...divergence.commands, "```", "",
      "Expected (Git):", "```text", divergence.expected, "```", "",
      "Actual (GitScope):", "```text", divergence.actual, "```", "",
      "Root-cause status: Pending investigation.", "",
      "Fixing commit: Pending.", "",
    );
  }
  lines.push("## Soft output differences", "");
  if (soft.length === 0) lines.push("No output warnings observed.", "");
  const groups = new Map<string, Divergence[]>();
  for (const item of soft) {
    const command = item.commands.at(-1) ?? "unknown";
    const kind = command.match(/^git (\S+)/)?.[1] ?? "unknown";
    groups.set(kind, [...(groups.get(kind) ?? []), item]);
  }
  for (const [kind, items] of [...groups].sort(([a], [b]) => a.localeCompare(b))) {
    const sample = items[0]!;
    lines.push(`### ${kind} (${items.length} warnings)`, "",
      "Representative command sequence:", "```text", ...sample.commands, "```", "",
      "Expected (Git):", "```text", sample.expected, "```", "",
      "Actual (GitScope):", "```text", sample.actual, "```", "",
      "Grouped by the command producing the output difference; other wording may differ within this group.", "");
  }
  return lines.join("\n");
}

export function runDifferential(
  depth: number,
  engine: (commands: readonly AbstractCommand[]) => EngineRun = runEngine,
  real: (commands: readonly AbstractCommand[]) => RealRun = runReal,
): DifferentialResult {
  const start = performance.now();
  const cases = generateSequences(depth);
  const coverage: CoverageByCommand = { commit: 0, branch: 0, switch: 0, checkout: 0, merge: 0 };
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
    for (const kind of new Set(testCase.commands.map((command) => command.kind))) coverage[kind]++;
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
    commitSha: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(), coverage,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes("--from-report")) {
    const report: unknown = JSON.parse(readFileSync("public/verification.json", "utf8"));
    if (!isVerificationReport(report)) throw new Error("Invalid verification report");
    const result: DifferentialResult = {
      summary: report.diffTest, divergences: report.divergences, gitVersion: report.gitVersion,
      sequences: report.diffTest.totalCases, alphabetSize: ACTIONS.length,
      fixtures: FIXTURES.map(({ name, setup }) => ({ name, setupLength: setup.length })),
      commitSha: report.commitSha, coverage: report.coverage,
    };
    writeFileSync("docs/divergences.md", formatDivergenceLog(result));
    console.log(`Wrote divergence log from ${result.sequences} measured cases`);
    process.exit(0);
  }
  const flag = process.argv.indexOf("--exhaustive");
  const depth = flag < 0 ? 2 : Number(process.argv[flag + 1]);
  if (!Number.isInteger(depth) || depth < 0) throw new Error("Invalid --exhaustive depth");
  const result = runDifferential(depth);
  console.log(`Git: ${result.gitVersion}${isPinnedGit(result.gitVersion) ? " (CI pin 2.43)" : " (local version differs from CI pin 2.43)"}`);
  console.log(`Alphabet: ${result.alphabetSize}; fixtures: ${result.fixtures.map((fixture) => `${fixture.name}(${fixture.setupLength})`).join(", ")}; suffix depth: ${depth}`);
  console.log(`Sequences: ${result.sequences}; runtime: ${result.summary.durationMs.toFixed(0)} ms`);
  console.log(`Passed: ${result.summary.passed}; hard-failed cases: ${result.summary.failed}; distinct output warnings: ${result.summary.warnings}`);
  for (const divergence of result.divergences.filter((item) => item.severity === "hard")) {
    console.log(JSON.stringify(divergence));
  }
  if (process.argv.includes("--write-log")) writeFileSync("docs/divergences.md", formatDivergenceLog(result));
  if (result.summary.failed > 0) process.exitCode = 1;
}
