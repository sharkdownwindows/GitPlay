import type { ScalingSeries } from "./report";

export function ScalingChart({ series }: { series: ScalingSeries[] }) {
  return (
    <section className="rounded border border-neutral-700 p-4" aria-label="Scaling data">
      <h2 className="font-semibold">Scaling data</h2>
      {series.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-400">No scaling data available.</p>
      ) : series.map((item) => (
        <div key={item.label} className="mt-3 overflow-x-auto">
          <h3 className="text-sm font-medium">{item.label}</h3>
          <table className="mt-2 w-full text-left text-sm">
            <thead className="text-neutral-400">
              <tr><th className="py-1 pr-4">Commits</th><th className="pr-4">Median (ms)</th><th className="pr-4">p95 (ms)</th><th>Runs</th></tr>
            </thead>
            <tbody>
              {item.points.map((point) => (
                <tr key={point.n} className="border-t border-neutral-800">
                  <td className="py-1 pr-4">{point.n}</td>
                  <td className="pr-4">{point.medianMs}</td>
                  <td className="pr-4">{point.p95Ms}</td>
                  <td>{point.iterations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );
}
