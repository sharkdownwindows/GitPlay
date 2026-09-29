import { describe, expect, it } from "vitest";
import { isVerificationReport } from "../src/verification/report";
import { runDifferential } from "./diff/run";
import { combineValidResults, makeVerificationReport, validateGeneratedReport } from "./writeReport";

describe("verification report generator", () => {
  it("uses measured differential metadata and supplied scaling data", () => {
    const diff = runDifferential(0);
    const scaling = { label: "layout()", points: [100, 1000, 10000, 100000].map((n) =>
      ({ n, medianMs: 1.2, p95Ms: 1.5, iterations: 7 })) };
    const report = makeVerificationReport(diff, scaling);
    expect(isVerificationReport(report)).toBe(true);
    expect(report.commitSha).toBe(diff.commitSha);
    expect(report.gitVersion).toBe(diff.gitVersion);
    expect(report.diffTest).toEqual(diff.summary);
    expect(report.diffTest.exhaustiveDepth).toBe(0);
    expect(report.diffTest.randomCases).toBe(0);
    expect(report.coverage).toEqual(diff.coverage);
    expect(Object.values(report.coverage).every((cases) => cases <= report.diffTest.totalCases)).toBe(true);
    expect(report.scaling).toEqual([scaling]);
    expect(makeVerificationReport(diff, scaling, [{ label: "SVG render", points: [
      { n: 100, medianMs: 30, p95Ms: 40, iterations: 5 },
    ] }]).scaling.map((series) => series.label)).toEqual(["layout()", "SVG render"]);
    expect(new Date(report.generatedAt).toISOString()).toBe(report.generatedAt);
    expect(() => validateGeneratedReport(report)).not.toThrow();
    expect(() => validateGeneratedReport({ ...report, commitSha: "0".repeat(40) })).toThrow();
    expect(() => validateGeneratedReport({ ...report, scaling: [{ label: "layout()", points: [
      { n: 100, medianMs: 0, p95Ms: 1, iterations: 7 },
    ] }] })).toThrow();
  });

  it("keeps invalid cases separate from valid totals and records random seed", () => {
    const exhaustive = runDifferential(0);
    const random = { ...exhaustive, summary: { ...exhaustive.summary,
      totalCases: 0, passed: 0, failed: 0, randomCases: 0, seed: 42 } };
    const combined = combineValidResults(exhaustive, random);
    expect(combined.summary.totalCases).toBe(exhaustive.summary.totalCases);
    expect(combined.summary.seed).toBe(42);
    expect(combined.summary.randomCases).toBe(0);
  });
});
