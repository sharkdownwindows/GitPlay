import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ScalingChart } from "./ScalingChart";
import type { ScalingSeries } from "./report";

const render = (series: ScalingSeries[]) => renderToStaticMarkup(createElement(ScalingChart, { series }));

describe("ScalingChart", () => {
  it("shows an empty state with no measurements", () => {
    expect(render([])).toContain("No measured scaling data available.");
  });

  it("centers a single point and labels both metrics", () => {
    const html = render([{ label: "layout()", points: [{ n: 100, medianMs: 2, p95Ms: 3, iterations: 7 }] }]);
    expect(html).toContain('role="img"');
    expect(html).toContain('data-n="100" data-metric="medianMs"');
    expect(html).toContain('data-n="100" data-metric="p95Ms"');
    expect(html).toContain('cx="339"');
    expect(html).not.toContain("NaN");
  });

  it("scales multiple series and increasing runtimes on log axes", () => {
    const html = render([
      { label: "A", points: [
        { n: 100, medianMs: 1, p95Ms: 2, iterations: 7 },
        { n: 10_000, medianMs: 100, p95Ms: 200, iterations: 7 },
      ] },
      { label: "B", points: [{ n: 1_000, medianMs: 10, p95Ms: 20, iterations: 7 }] },
    ]);
    expect(html).toContain('data-series="A"');
    expect(html).toContain('data-series="B"');
    expect(html).toContain('cx="68"');
    expect(html).toContain('cx="339"');
    expect(html).toContain('cx="610"');
    expect(html.match(/<circle/g)).toHaveLength(6);
    expect(html).toContain("Median (ms): solid");
    expect(html).toContain("p95 (ms): dashed");
  });
});
