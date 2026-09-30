import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import currentReport from "../../public/verification.json";
import { isVerificationReport, type VerificationReport } from "./report";
import { verificationReportFixture } from "./fixtures/report";
import { DiffTestSummary } from "./DiffTestSummary";
import { ScalingChart } from "./ScalingChart";
import { loadVerificationReport, VerificationContent, VerificationTab } from "./VerificationTab";

const render = (element: React.ReactElement) => renderToStaticMarkup(element);
const fixture = verificationReportFixture;

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("committed verification report", () => {
  it("public/verification.json conforms to the current report schema", () => {
    expect(isVerificationReport(currentReport)).toBe(true);
  });
});

describe("verification report loading", () => {
  it("loads and validates /verification.json", async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => fixture }));
    vi.stubGlobal("fetch", fetchMock);
    const loaded = await loadVerificationReport();
    expect(fetchMock).toHaveBeenCalledWith("/verification.json");
    expect(loaded).toEqual({ report: fixture, error: null });
    const html = render(createElement(VerificationContent, loaded));
    expect(html).toContain(fixture.commitSha);
    expect(html).toContain(fixture.gitVersion);
    expect(html).toContain(fixture.nodeVersion);
    expect(html).toContain(fixture.generatedAt);
    expect(html).toContain("Exhaustive depth: 3");
    expect(html).toContain("Random cases: 5000");
    expect(html).toContain("Seed: 42");
    expect(html).not.toContain("Verification evidence incomplete");
    expect(html).not.toMatch(/sample report|placeholder/i);
  });

  it.each([
    ["missing file", async () => ({ ok: false, status: 404, json: async () => fixture })],
    ["invalid schema", async () => ({ ok: true, json: async () => ({ ...fixture, schemaVersion: 2 }) })],
    ["invalid JSON", async () => ({ ok: true, json: async () => { throw new SyntaxError("bad JSON"); } })],
    ["network failure", async () => { throw new Error("offline"); }],
  ])("shows an empty state for %s", async (_case, response) => {
    vi.stubGlobal("fetch", vi.fn(response));
    const loaded = await loadVerificationReport();
    expect(loaded.report).toBeNull();
    const html = render(createElement(VerificationContent, loaded));
    expect(html).toContain(loaded.error);
    expect(html).not.toContain("Differential tests");
  });

  it("renders a loading state before fetch completes", () => {
    expect(render(createElement(VerificationTab))).toContain("Loading verification report");
  });
});

describe("verification presentation", () => {
  it("renders differential counts and command coverage", () => {
    const html = render(createElement(DiffTestSummary, {
      summary: { ...fixture.diffTest, totalCases: 8, passed: 6, failed: 2, warnings: 1 },
      coverage: { ...fixture.coverage, commit: 4, branch: 3 },
    }));
    expect(html).toContain("Total</dt><dd>8");
    expect(html).toContain("Passed</dt><dd>6");
    expect(html).toContain("Failed (hard divergences)</dt><dd>2");
    expect(html).toContain("Warnings (soft output)</dt><dd>1");
    expect(html).toContain("commit</span>: 4");
    expect(html).toContain("branch</span>: 3");
  });

  it("shows a hard failure and its divergence details", () => {
    const hard: VerificationReport = {
      ...fixture,
      diffTest: { ...fixture.diffTest, totalCases: 10, passed: 9, failed: 1 },
      divergences: [{ id: "hard-1", kind: "state", severity: "hard",
        commands: ["git commit -m first"], expected: "main at c1", actual: "main at c2" }],
    };
    const html = render(createElement(VerificationContent, { report: hard, error: null }));
    expect(html).toContain("Hard divergence");
    expect(html).toContain("Failed (hard divergences)</dt><dd>1");
    expect(html).toContain("main at c1");
    expect(html).toContain("main at c2");
  });

  it("distinguishes soft output warnings from hard failures", () => {
    const html = render(createElement(VerificationContent, { report: fixture, error: null }));
    expect(html).toContain("Soft output warning");
    expect(html).toContain("Warnings (soft output)</dt><dd>1");
    expect(html).toContain("Failed (hard divergences)</dt><dd>0");
    expect(html).not.toContain("Hard divergence ·");
  });

  it("marks missing browser series as incomplete", () => {
    const report: VerificationReport = { ...fixture, scaling: fixture.scaling.slice(0, 1) };
    const html = render(createElement(VerificationContent, { report, error: null }));
    expect(html).toContain("Verification evidence incomplete");
    expect(html).toContain("scaling measurements missing");
    expect(html).toContain('aria-label="layout() scaling chart"');
    expect(html).not.toContain('aria-label="SVG render scaling chart"');
  });

  it("renders layout, SVG render and animation frame series separately", () => {
    const html = render(createElement(VerificationContent, { report: fixture, error: null }));
    for (const label of ["layout()", "SVG render", "animation frame"]) {
      expect(html).toContain(`aria-label="${label}"`);
      expect(html).toContain(`aria-label="${label} scaling chart"`);
    }
    expect(html).toContain("Iterations");
    expect(html).toContain(">7</td>");
    expect(html).toContain(">5</td>");
    expect(html).toContain(">215</td>");
  });

  it("renders a complete report without an incomplete-evidence message", () => {
    const html = render(createElement(VerificationContent, { report: fixture, error: null }));
    expect(html).toContain(fixture.commitSha);
    expect(html).toContain("Exhaustive depth: 3");
    expect(html).toContain("Random cases: 5000");
    expect(html).not.toContain("Verification evidence incomplete");
  });

  it("renders duplicate commit counts without React key warnings", () => {
    const spy = vi.spyOn(console, "error");
    const html = render(createElement(ScalingChart, { series: [{ label: "layout()", points: [
      { n: 100, medianMs: 1, p95Ms: 2, iterations: 5 },
      { n: 100, medianMs: 1.2, p95Ms: 2.2, iterations: 5 },
    ] }] }));
    expect(html.match(/data-n="100"/g)).toHaveLength(4);
    expect(spy).not.toHaveBeenCalled();
  });
});
