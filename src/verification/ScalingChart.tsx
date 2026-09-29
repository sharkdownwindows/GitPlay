import type { ScalingSeries } from "./report";

const WIDTH = 640;
const HEIGHT = 320;
const LEFT = 68;
const RIGHT = 610;
const TOP = 28;
const BOTTOM = 260;
const COLORS = ["#38bdf8", "#fbbf24", "#4ade80", "#f472b6"];

export function ScalingChart({ series }: { series: ScalingSeries[] }) {
  const measured = series.map((item) => ({
    label: item.label,
    points: item.points.filter((point) =>
      point.n > 0 && point.medianMs > 0 && point.p95Ms > 0 && point.iterations > 0 &&
      Number.isFinite(point.n) && Number.isFinite(point.medianMs) && Number.isFinite(point.p95Ms)),
  })).filter((item) => item.points.length > 0);

  if (measured.length === 0) {
    return (
      <section className="rounded border border-neutral-700 p-4" aria-label="Scaling data">
        <h2 className="font-semibold">Scaling data</h2>
        <p className="mt-2 text-sm text-neutral-400">No measured scaling data available.</p>
      </section>
    );
  }

  const points = measured.flatMap((item) => item.points);
  const xValues = points.map((point) => Math.log10(point.n));
  const yValues = points.flatMap((point) => [Math.log10(point.medianMs), Math.log10(point.p95Ms)]);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const x = (n: number) => xMin === xMax ? (LEFT + RIGHT) / 2
    : LEFT + (Math.log10(n) - xMin) / (xMax - xMin) * (RIGHT - LEFT);
  const y = (ms: number) => yMin === yMax ? (TOP + BOTTOM) / 2
    : BOTTOM - (Math.log10(ms) - yMin) / (yMax - yMin) * (BOTTOM - TOP);
  const ticks = [...new Set(points.map((point) => point.n))].sort((a, b) => a - b);

  return (
    <section className="rounded border border-neutral-700 p-4" aria-label="Scaling data">
      <h2 className="font-semibold">Scaling data</h2>
      <svg className="mt-3 w-full" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Layout scaling chart">
        <title>Layout scaling by commit count</title>
        <desc>Logarithmic axes. Solid lines show median time; dashed lines show p95 time.</desc>
        <line x1={LEFT} y1={BOTTOM} x2={RIGHT} y2={BOTTOM} stroke="currentColor" />
        <line x1={LEFT} y1={TOP} x2={LEFT} y2={BOTTOM} stroke="currentColor" />
        {ticks.map((n) => (
          <text key={n} x={x(n)} y={BOTTOM + 18} textAnchor="middle" fontSize={11} fill="currentColor">{n}</text>
        ))}
        <text x={(LEFT + RIGHT) / 2} y={HEIGHT - 12} textAnchor="middle" fontSize={12} fill="currentColor">Commits (log scale)</text>
        <text x={12} y={TOP + 8} fontSize={11} fill="currentColor">Time (ms, log scale)</text>
        <text x={LEFT - 8} y={TOP + 4} textAnchor="end" fontSize={10} fill="currentColor">{(10 ** yMax).toPrecision(2)}</text>
        <text x={LEFT - 8} y={BOTTOM + 4} textAnchor="end" fontSize={10} fill="currentColor">{(10 ** yMin).toPrecision(2)}</text>
        {measured.map((item, index) => {
          const color = COLORS[index % COLORS.length]!;
          const ordered = [...item.points].sort((a, b) => a.n - b.n);
          const line = (metric: "medianMs" | "p95Ms") => ordered
            .map((point, pointIndex) => `${pointIndex === 0 ? "M" : "L"}${x(point.n)},${y(point[metric])}`).join(" ");
          return (
            <g key={`${item.label}-${index}`}>
              <path d={line("medianMs")} fill="none" stroke={color} strokeWidth={2} />
              <path d={line("p95Ms")} fill="none" stroke={color} strokeWidth={2} strokeDasharray="5 4" />
              {ordered.flatMap((point) => (["medianMs", "p95Ms"] as const).map((metric) => (
                <circle key={`${point.n}-${metric}`} cx={x(point.n)} cy={y(point[metric])} r={4}
                  fill={color} data-series={item.label} data-n={point.n} data-metric={metric}
                  aria-label={`${item.label}: ${point.n} commits, ${metric === "medianMs" ? "median" : "p95"} ${point[metric]} ms`} />
              )))}
              <text x={RIGHT - 130} y={TOP + 16 + index * 17} fontSize={11} fill={color}>{item.label}</text>
            </g>
          );
        })}
        <text x={RIGHT - 130} y={BOTTOM - 25} fontSize={11} fill="currentColor">Median (ms): solid</text>
        <text x={RIGHT - 130} y={BOTTOM - 10} fontSize={11} fill="currentColor">p95 (ms): dashed</text>
      </svg>
    </section>
  );
}
