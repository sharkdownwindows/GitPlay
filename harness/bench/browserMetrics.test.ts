import { describe, expect, it } from "vitest";
import { browserSeriesForReport, classifySaturation, percentile, toScalingSeries } from "./browserMetrics";

describe("browser measurement summaries", () => {
  it("uses nearest-rank percentiles without mutating samples", () => {
    const samples = [9, 1, 5, 3, 7];
    expect(percentile(samples, 0.5)).toBe(5);
    expect(percentile(samples, 0.95)).toBe(9);
    expect(samples).toEqual([9, 1, 5, 3, 7]);
    expect(() => percentile([], 0.95)).toThrow();
  });

  it("classifies a timeout or exceeded measured budget as saturation", () => {
    expect(classifySaturation({ n: 10_000, status: "timeout", samplesMs: [] }, 100)).toBe(true);
    expect(classifySaturation({ n: 1_000, status: "ok", samplesMs: [80, 90, 140] }, 100)).toBe(true);
    expect(classifySaturation({ n: 100, status: "ok", samplesMs: [20, 30, 40] }, 100)).toBe(false);
  });

  it("exports only completed browser measurements to ScalingSeries", () => {
    const series = toScalingSeries("SVG render", [
      { n: 100, status: "ok", samplesMs: [30, 20, 40] },
      { n: 1_000, status: "timeout", samplesMs: [] },
    ]);
    expect(series).toEqual({ label: "SVG render", points: [
      { n: 100, medianMs: 30, p95Ms: 40, iterations: 3 },
    ] });
  });

  it("rejects stale or malformed browser samples before report inclusion", () => {
    const measurement = { commitSha: "abc", render: [
      { n: 100, status: "ok", samplesMs: [20, 30] }], frame: [
      { n: 200, status: "ok", samplesMs: [16, 17] }] };
    expect(browserSeriesForReport(measurement, "abc").map((series) => series.label))
      .toEqual(["SVG render", "animation frame"]);
    expect(browserSeriesForReport(measurement, "different")).toEqual([]);
    expect(() => browserSeriesForReport({ ...measurement, render: [
      { n: 100, status: "ok", samplesMs: [0] }] }, "abc")).toThrow();
  });
});
