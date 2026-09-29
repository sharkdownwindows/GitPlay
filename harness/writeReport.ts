import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import type { ScalingSeries, VerificationReport } from "../src/verification/report";
import { SCHEMA_VERSION } from "../src/verification/report";
import { benchmarkLayout } from "./bench/layout";
import { formatDivergenceLog, runDifferential, type DifferentialResult } from "./diff/run";

export function makeVerificationReport(diff: DifferentialResult, scaling: ScalingSeries): VerificationReport {
  return {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    commitSha: diff.commitSha,
    gitVersion: diff.gitVersion,
    nodeVersion: process.version,
    diffTest: diff.summary,
    coverage: diff.coverage,
    scaling: [scaling],
    divergences: diff.divergences,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const diff = runDifferential(2);
  const report = makeVerificationReport(diff, benchmarkLayout());
  writeFileSync("public/verification.json", `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync("docs/divergences.md", formatDivergenceLog(diff));
  console.log(`Report: ${report.commitSha}; ${report.diffTest.totalCases} depth-2 cases; ${report.diffTest.failed} hard failures; ${report.diffTest.warnings} output warnings`);
  if (report.diffTest.failed > 0) process.exitCode = 1;
}
