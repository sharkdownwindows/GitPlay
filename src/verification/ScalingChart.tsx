import type { ScalingPoint, ScalingSeries } from "./report";

const LEFT = 68;
const RIGHT = 610;
const TOP = 28;
const BOTTOM = 245;

interface KeyedScalingPoint extends ScalingPoint { key: string }

function withPointKeys(points: ScalingPoint[]): KeyedScalingPoint[] {
  const pointOccurrences = new Map<string, number>();
  return points.map((point) => {
    const identity = JSON.stringify([point.n, point.medianMs, point.p95Ms, point.iterations]);
    const occurrence = pointOccurrences.get(identity) ?? 0;
    pointOccurrences.set(identity, occurrence + 1);
    return { ...point, key: `${identity}:${occurrence}` };
  });
}

function SeriesChart({ label, points }: { label: string; points: KeyedScalingPoint[] }) {
  const ordered = [...points].sort((a, b) => a.n - b.n);
  const ticks = [...new Map(ordered.map((point) => [point.n, point])).values()];
  const xs = ordered.map((point) => Math.log10(point.n));
  const ys = ordered.flatMap((point) => [Math.log10(point.medianMs), Math.log10(point.p95Ms)]);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const x = (n: number) => xMin === xMax ? (LEFT + RIGHT) / 2
    : LEFT + (Math.log10(n) - xMin) / (xMax - xMin) * (RIGHT - LEFT);
  const y = (ms: number) => yMin === yMax ? (TOP + BOTTOM) / 2
    : BOTTOM - (Math.log10(ms) - yMin) / (yMax - yMin) * (BOTTOM - TOP);
  const line = (metric: "medianMs" | "p95Ms") => ordered
    .map((point, index) => `${index === 0 ? "M" : "L"}${x(point.n)},${y(point[metric])}`).join(" ");

  return <svg className="mt-3 w-full" viewBox="0 0 640 300" role="img" aria-label={`${label} scaling chart`}>
    <title>{`${label} by commit count`}</title>
    <desc>Logarithmic axes. Solid line: median time; dashed line: p95 time.</desc>
    <line x1={LEFT} y1={BOTTOM} x2={RIGHT} y2={BOTTOM} stroke="currentColor" />
    <line x1={LEFT} y1={TOP} x2={LEFT} y2={BOTTOM} stroke="currentColor" />
    {ticks.map((point) => <text key={point.n} x={x(point.n)} y={BOTTOM + 18} textAnchor="middle" fontSize={11} fill="currentColor">{point.n}</text>)}
    <text x={(LEFT + RIGHT) / 2} y={288} textAnchor="middle" fontSize={12} fill="currentColor">Commits (log scale)</text>
    <text x={12} y={TOP + 8} fontSize={11} fill="currentColor">Time (ms, log scale)</text>
    <text x={LEFT - 8} y={TOP + 4} textAnchor="end" fontSize={10} fill="currentColor">{(10 ** yMax).toPrecision(2)}</text>
    <text x={LEFT - 8} y={BOTTOM + 4} textAnchor="end" fontSize={10} fill="currentColor">{(10 ** yMin).toPrecision(2)}</text>
    <path d={line("medianMs")} fill="none" stroke="#38bdf8" strokeWidth={2} />
    <path d={line("p95Ms")} fill="none" stroke="#fbbf24" strokeWidth={2} strokeDasharray="5 4" />
    {ordered.flatMap((point) => (["medianMs", "p95Ms"] as const).map((metric) =>
      <circle key={`${point.key}-${metric}`} cx={x(point.n)} cy={y(point[metric])} r={4}
        fill={metric === "medianMs" ? "#38bdf8" : "#fbbf24"}
        data-series={label} data-n={point.n} data-metric={metric}
        aria-label={`${point.n} commits, ${metric === "medianMs" ? "median" : "p95"} ${point[metric]} ms`} />
    ))}
  </svg>;
}

export function ScalingChart({ series }: { series: ScalingSeries[] }) {
  if (series.length === 0) {
    return <section className="rounded border border-neutral-700 p-4" aria-label="Scaling data">
      <h2 className="font-semibold">Scaling data</h2>
      <p className="mt-2 text-sm text-neutral-400">No measured scaling data available.</p>
    </section>;
  }

  const seriesOccurrences = new Map<string, number>();
  const keyedSeries = series.map((item) => {
    const occurrence = seriesOccurrences.get(item.label) ?? 0;
    seriesOccurrences.set(item.label, occurrence + 1);
    return { ...item, key: `${item.label}:${occurrence}` };
  });
  return <section className="space-y-4" aria-label="Scaling data">
    <h2 className="font-semibold">Scaling data</h2>
    {keyedSeries.map((item) => {
      const points = withPointKeys(item.points.filter((point) =>
        point.n > 0 && point.medianMs > 0 && point.p95Ms > 0 && point.iterations > 0 &&
        Number.isFinite(point.n) && Number.isFinite(point.medianMs) && Number.isFinite(point.p95Ms) &&
        Number.isFinite(point.iterations)));
      return <section key={item.key} className="rounded border border-neutral-700 p-4" aria-label={item.label}>
        <h3 className="font-medium">{item.label}</h3>
        {points.length === 0 ? <p className="mt-2 text-sm text-neutral-400">No measured scaling data available.</p> : <>
          <SeriesChart label={item.label} points={points} />
          <p className="text-sm text-neutral-400">Median: solid blue · p95: dashed amber · time in ms</p>
          <table className="mt-2 w-full text-left text-sm">
            <thead><tr><th scope="col">Commits (n)</th><th scope="col">Median (ms)</th><th scope="col">p95 (ms)</th><th scope="col">Iterations</th></tr></thead>
            <tbody>{points.map((point) => <tr key={point.key}>
              <td>{point.n}</td><td>{point.medianMs.toPrecision(4)}</td><td>{point.p95Ms.toPrecision(4)}</td><td>{point.iterations}</td>
            </tr>)}</tbody>
          </table>
        </>}
      </section>;
    })}
  </section>;
}
