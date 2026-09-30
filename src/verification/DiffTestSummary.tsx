import type { CoverageByCommand, DiffTestSummary as Summary } from "./report";

interface Props {
  summary: Summary;
  coverage: CoverageByCommand;
}

const commands = ["commit", "branch", "switch", "checkout", "merge"] as const;

export function DiffTestSummary({ summary, coverage }: Props) {
  return (
    <section className="rounded-lg border border-line bg-surface p-4" aria-label="Differential tests">
      <h2 className="font-semibold">Differential tests</h2>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div><dt className="text-fg-muted">Total</dt><dd>{summary.totalCases}</dd></div>
        <div><dt className="text-fg-muted">Passed</dt><dd>{summary.passed}</dd></div>
        <div><dt className="text-fg-muted">Failed (hard divergences)</dt><dd>{summary.failed}</dd></div>
        <div><dt className="text-fg-muted">Warnings (soft output)</dt><dd>{summary.warnings}</dd></div>
      </dl>
      <p className="mt-3 text-sm text-fg-muted">
        Exhaustive depth: {summary.exhaustiveDepth} · Random cases: {summary.randomCases} ·
        Seed: {summary.seed} · Duration: {summary.durationMs} ms
      </p>
      <h3 className="mt-4 text-sm font-medium">Command coverage</h3>
      <ul className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
        {commands.map((command) => (
          <li key={command} className="rounded-md border border-line bg-bg px-3 py-2">
            <span className="text-fg-muted">{command}</span>: {coverage[command]}
          </li>
        ))}
      </ul>
    </section>
  );
}
