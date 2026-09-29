import { describe, expect, it } from "vitest";
import { isVerificationReport } from "../src/verification/report";
import { runDifferential } from "./diff/run";
import { makeVerificationReport } from "./writeReport";

describe("verification report generator", () => {
  it("uses measured differential metadata and supplied scaling data", () => {
    const diff = runDifferential(0);
    const scaling = { label: "layout()", points: [{ n: 100, medianMs: 1.2, p95Ms: 1.5, iterations: 7 }] };
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
    expect(new Date(report.generatedAt).toISOString()).toBe(report.generatedAt);
  });
});
