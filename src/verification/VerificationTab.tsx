import { useEffect, useState } from "react";
import { DiffTestSummary } from "./DiffTestSummary";
import { isVerificationReport, type VerificationReport } from "./report";
import { ScalingChart } from "./ScalingChart";

export async function loadVerificationReport(): Promise<VerificationReport | null> {
  try {
    const response = await fetch("/verification.json");
    if (!response.ok) return null;
    const data: unknown = await response.json();
    return isVerificationReport(data) ? data : null;
  } catch {
    return null;
  }
}

export function VerificationTab() {
  const [report, setReport] = useState<VerificationReport | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    void loadVerificationReport().then((loaded) => {
      if (active) setReport(loaded);
    });
    return () => { active = false; };
  }, []);

  if (report === undefined) {
    return <p role="status" className="text-sm text-neutral-400">Loading verification report…</p>;
  }
  return <VerificationContent report={report} />;
}

export function VerificationContent({ report }: { report: VerificationReport | null }) {
  if (report === null) {
    return (
      <section>
        <h1 className="text-lg font-semibold">Verification</h1>
        <p role="status" className="mt-2 text-sm text-neutral-400">
          Verification report unavailable. The file may be missing or invalid.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <h1 className="text-lg font-semibold">Verification</h1>
      {/^0{40}$/.test(report.commitSha) && (
        <p className="rounded border border-amber-800 px-3 py-2 text-sm text-amber-300">
          Sample report — these values are placeholders.
        </p>
      )}
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div><dt className="text-neutral-400">Commit SHA</dt><dd className="break-all font-mono">{report.commitSha}</dd></div>
        <div><dt className="text-neutral-400">Generated</dt><dd>{report.generatedAt}</dd></div>
        <div><dt className="text-neutral-400">Git version</dt><dd>{report.gitVersion}</dd></div>
        <div><dt className="text-neutral-400">Node version</dt><dd>{report.nodeVersion}</dd></div>
      </dl>
      <DiffTestSummary summary={report.diffTest} coverage={report.coverage} />
      <section className="rounded border border-neutral-700 p-4" aria-label="Divergences">
        <h2 className="font-semibold">Divergences</h2>
        {report.divergences.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-400">No divergences recorded.</p>
        ) : (
          <ul className="mt-2 space-y-3 text-sm">
            {report.divergences.map((item) => (
              <li key={item.id} className="rounded bg-neutral-900 p-3">
                <p className="font-medium">{item.id} · {item.kind} · {item.severity}</p>
                <p className="mt-1 font-mono">{item.commands.join(" → ")}</p>
                <p className="mt-1">Expected: {item.expected}</p>
                <p>Actual: {item.actual}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <ScalingChart series={report.scaling} />
    </section>
  );
}
