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
    expect(report).toEqual({ report: fixture, error: null });
    const html = render(createElement(VerificationContent, report));
    expect(html).toContain(fixture.commitSha);
    expect(html).toContain(fixture.gitVersion);
    expect(html).toContain(fixture.nodeVersion);
    expect(html).toContain(fixture.generatedAt);
    expect(html).toContain("Total</dt><dd>133");
    expect(html).toContain("Exhaustive depth: 2");
    expect(html).toContain("Random cases: 0");
    expect(html).toContain("Seed: 42");
    expect(html).toContain("Duration:");
    for (const command of ["commit", "branch", "switch", "checkout", "merge"]) {
      expect(html).toContain(`${command}</span>: ${fixture.coverage[command as keyof typeof fixture.coverage]}`);
    }
    expect(html).not.toContain("Sample report");
    expect(html).not.toContain("placeholder");
  });

  it.each([
    ["404", async () => ({ ok: false, status: 404, json: async () => fixture })],
    ["invalid schema", async () => ({ ok: true, json: async () => ({ ...fixture, schemaVersion: 2 }) })],
    ["invalid JSON", async () => ({ ok: true, json: async () => { throw new SyntaxError("bad JSON"); } })],
    ["network failure", async () => { throw new Error("offline"); }],
  ])("shows an empty state for %s", async (_case, response) => {
    vi.stubGlobal("fetch", vi.fn(response));
    const report = await loadVerificationReport();
    expect(report.report).toBeNull();
    const html = render(createElement(VerificationContent, report));
    expect(html).toContain(report.error);
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
    expect(html).toContain("Failed (hard divergences)</dt><dd>1");
    expect(html).toContain("Warnings (soft output)</dt><dd>1");
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
    expect(render(createElement(VerificationContent, { report: { ...report, divergences: [] }, error: null })))
      .toContain("No divergences recorded.");
    const withDivergence: VerificationReport = {
      ...report,
      diffTest: { ...report.diffTest, passed: report.diffTest.passed - 1, failed: 1 },
      divergences: [{
        id: "case-1", kind: "state", severity: "hard", commands: ["git commit -m first"],
        expected: "main at c1", actual: "main at c2",
      }],
    };
    const html = render(createElement(VerificationContent, { report: withDivergence, error: null }));
    expect(html).toContain("case-1");
    expect(html).toContain("Hard divergence");
    expect(html).toContain("Failed (hard divergences)</dt><dd>1");
    expect(html).toContain("main at c1");
    expect(html).toContain("main at c2");
  });

  it("distinguishes soft warnings from hard failures", () => {
    const soft: VerificationReport = {
      ...report,
      diffTest: { ...report.diffTest, failed: 0, warnings: 1, randomCases: 5000 },
      divergences: [{ id: "output-1", kind: "output", severity: "soft", commands: ["git branch"],
        expected: "a", actual: "b" }],
    };
    const html = render(createElement(VerificationContent, { report: soft, error: null }));
    expect(html).toContain("Soft output warning");
    expect(html).toContain("Failed (hard divergences)</dt><dd>0");
    expect(html).not.toContain("Hard divergence ·");
  });

  it("marks missing random and scaling evidence as incomplete", () => {
    const html = render(createElement(VerificationContent, {
      report: { ...report, scaling: [], diffTest: { ...report.diffTest, randomCases: 0 } }, error: null,
    }));
    expect(html).toContain("Verification evidence incomplete");
    expect(html).toContain("no random run recorded");
    expect(html).toContain("scaling measurements missing");
    expect(html).toContain("No measured scaling data available");
  });

  it("renders all real scaling series separately with iterations", () => {
    const html = render(createElement(VerificationContent, { report, error: null }));
    for (const label of ["layout()", "SVG render", "animation frame"]) {
      expect(html).toContain(`aria-label="${label}"`);
      expect(html).toContain(`aria-label="${label} scaling chart"`);
    }
    expect(html).toContain("Iterations");
    expect(html).toContain(">7</td>");
    expect(html).toContain(">5</td>");
    expect(html).toContain(">215</td>");
    expect(html).toContain("Median (ms)");
  });

  it("renders a complete report without an incomplete-evidence message", () => {
    const complete: VerificationReport = {
      ...report,
      diffTest: { ...report.diffTest, exhaustiveDepth: 3, randomCases: 5000 },
    };
    const html = render(createElement(VerificationContent, { report: complete, error: null }));
    expect(html).toContain(complete.commitSha);
    expect(html).toContain("Random cases: 5000");
    expect(html).not.toContain("Verification evidence incomplete");
    expect(html).not.toMatch(/sample report|placeholder/i);
  });

  it("marks a missing browser scaling series as incomplete", () => {
    const html = render(createElement(VerificationContent, {
      report: { ...report, scaling: report.scaling.slice(0, 1),
        diffTest: { ...report.diffTest, exhaustiveDepth: 3, randomCases: 5000 } }, error: null,
    }));
    expect(html).toContain("scaling measurements missing");
  });
});
