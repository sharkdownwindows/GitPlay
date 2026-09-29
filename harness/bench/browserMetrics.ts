import type { ScalingSeries } from "../../src/verification/report";

export interface BrowserPoint {
  n: number;
  samplesMs: number[];
  status: "ok" | "timeout";
}

export interface BrowserMeasurement {
  commitSha: string;
  generatedAt: string;
  browser: string;
  os: string;
  nodeVersion: string;
  gitVersion: string;
  seed: number;
  warmups: { render: number; frame: number };
  renderIterations: number;
  animationRuns: number;
  viewport: string;
  mode: "headless";
  render: BrowserPoint[];
  frame: BrowserPoint[];
  layout: BrowserPoint[];
}

export function percentile(samples: readonly number[], quantile: number): number {
  if (!samples.length || samples.some((n) => !Number.isFinite(n) || n < 0) || quantile < 0 || quantile > 1) {
    throw new RangeError("Expected finite nonnegative samples and a quantile from 0 to 1");
  }
  const sorted = [...samples].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(quantile * sorted.length) - 1)]!;
}

export function classifySaturation(point: BrowserPoint, budgetMs: number): boolean {
  return point.status === "timeout" ||
    (point.samplesMs.length > 0 && percentile(point.samplesMs, 0.95) > budgetMs);
}

export function toScalingSeries(label: string, points: readonly BrowserPoint[]): ScalingSeries {
  return { label, points: points.filter((point) => point.status === "ok" && point.samplesMs.length > 0)
    .map((point) => ({ n: point.n, medianMs: percentile(point.samplesMs, 0.5),
      p95Ms: percentile(point.samplesMs, 0.95), iterations: point.samplesMs.length })) };
}

export function browserSeriesForReport(value: unknown, commitSha: string): ScalingSeries[] {
  if (!value || typeof value !== "object") throw new Error("Invalid browser measurement");
  const measurement = value as BrowserMeasurement;
  if (measurement.commitSha !== commitSha) return [];
  if (!Array.isArray(measurement.render) || !Array.isArray(measurement.frame) ||
      !measurement.render.every(validPoint) || !measurement.frame.every(validPoint)) {
    throw new Error("Invalid browser measurement points");
  }
  return [toScalingSeries("SVG render", measurement.render),
    toScalingSeries("animation frame", measurement.frame)].filter((series) => series.points.length > 0);
}

function validPoint(point: BrowserPoint): boolean {
  return Number.isSafeInteger(point?.n) && point.n > 0 &&
    ["ok", "timeout"].includes(point.status) && Array.isArray(point.samplesMs) &&
    point.samplesMs.every((sample) => Number.isFinite(sample) && sample > 0) &&
    (point.status === "timeout" || point.samplesMs.length > 0);
}
