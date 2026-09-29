import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import fixture from "../../public/verification.json";
import { DiffTestSummary } from "./DiffTestSummary";
import { ScalingChart } from "./ScalingChart";
import type { VerificationReport } from "./report";
import { loadVerificationReport, VerificationContent, VerificationTab } from "./VerificationTab";

const render = (element: React.ReactElement) => renderToStaticMarkup(element);

afterEach(() => vi.unstubAllGlobals());

describe("verification report loading", () => {
  it("loads and validates /verification.json", async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => fixture }));
    vi.stubGlobal("fetch", fetchMock);
    const report = await loadVerificationReport();
    expect(fetchMock).toHaveBeenCalledWith("/verification.json");
    expect(report).toEqual(fixture);
    const html = render(createElement(VerificationContent, { report }));
    expect(html).toContain(fixture.commitSha);
    expect(html).toContain(fixture.gitVersion);
    expect(html).toContain(fixture.nodeVersion);
    expect(html).toContain(fixture.generatedAt);
    expect(html).not.toContain("Sample report");
  });

  it.each([
    ["404", async () => ({ ok: false, json: async () => fixture })],
    ["invalid schema", async () => ({ ok: true, json: async () => ({ ...fixture, schemaVersion: 2 }) })],
    ["invalid JSON", async () => ({ ok: true, json: async () => { throw new SyntaxError("bad JSON"); } })],
    ["network failure", async () => { throw new Error("offline"); }],
  ])("shows an empty state for %s", async (_case, response) => {
    vi.stubGlobal("fetch", vi.fn(response));
    const report = await loadVerificationReport();
    expect(report).toBeNull();
    const html = render(createElement(VerificationContent, { report }));
    expect(html).toContain("Verification report unavailable");
    expect(html).not.toContain("Differential tests");
  });

  it("renders a loading state before fetch completes", () => {
    expect(render(createElement(VerificationTab))).toContain("Loading verification report");
  });
});

describe("verification presentation", () => {
  const report = fixture as VerificationReport;

  it("renders differential counts and command coverage", () => {
    const html = render(createElement(DiffTestSummary, {
      summary: { ...report.diffTest, totalCases: 8, passed: 6, failed: 1, warnings: 1 },
      coverage: { ...report.coverage, commit: 4, branch: 3 },
    }));
    expect(html).toContain("Total</dt><dd>8");
    expect(html).toContain("Passed</dt><dd>6");
    expect(html).toContain("Failed</dt><dd>1");
    expect(html).toContain("Warnings</dt><dd>1");
    expect(html).toContain("commit</span>: 4");
    expect(html).toContain("branch</span>: 3");
  });

  it("plots measured scaling data", () => {
    const html = render(createElement(ScalingChart, { series: [{ label: "layout()", points: [
      { n: 100, medianMs: 1, p95Ms: 2, iterations: 7 },
      { n: 100000, medianMs: 100, p95Ms: 120, iterations: 7 },
    ] }] }));
    expect(html).toContain("<circle");
    expect(html).toContain("100000");
  });

  it("shows no divergences or the actual divergence list", () => {
    expect(render(createElement(VerificationContent, { report: { ...report, divergences: [] } })))
      .toContain("No divergences recorded.");
    const withDivergence: VerificationReport = {
      ...report,
      divergences: [{
        id: "case-1", kind: "state", severity: "hard", commands: ["git commit -m first"],
        expected: "main at c1", actual: "main at c2",
      }],
    };
    const html = render(createElement(VerificationContent, { report: withDivergence }));
    expect(html).toContain("case-1");
    expect(html).toContain("main at c1");
    expect(html).toContain("main at c2");
  });
});
