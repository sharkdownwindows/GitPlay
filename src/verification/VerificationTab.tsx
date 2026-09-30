import { useEffect, useState } from "react";
import { DiffTestSummary } from "./DiffTestSummary";
import { isVerificationReport, type VerificationReport } from "./report";
import { ScalingChart } from "./ScalingChart";

type ReportLoadResult =
  | { report: VerificationReport; error: null }
  | { report: null; error: string };

export async function loadVerificationReport(): Promise<ReportLoadResult> {
  let response: Response;
  try {
    response = await fetch("/verification.json");
  } catch {
    return { report: null, error: "Verification report could not be fetched." };
  }
  if (!response.ok) return { report: null, error: response.status === 404
    ? "Verification report file is missing."
    : `Verification report could not be fetched (HTTP ${response.status}).` };
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return { report: null, error: "Verification report contains invalid JSON." };
  }
  if (!isVerificationReport(data)) return { report: null, error: "Verification report has an invalid schema or unsupported schema version." };
  return { report: data, error: null };
}

export function VerificationTab() {
  const [result, setResult] = useState<ReportLoadResult | null>(null);

  useEffect(() => {
    let active = true;
    void loadVerificationReport().then((loaded) => {
      if (active) setResult(loaded);
    });
    return () => { active = false; };
  }, []);

  if (result === null) {
    return <p role="status" className="text-sm text-fg-muted">Loading verification report…</p>;
  }
  return <VerificationContent {...result} />;
}

export function VerificationContent({ report, error }: ReportLoadResult) {
  if (report === null) {
    return (
      <section>
        <h1 className="text-lg font-semibold">Verification</h1>
        <p role="status" className="mt-2 text-sm text-fg-muted">
          {error}
        </p>
      </section>
    );
  }

  const missingScaling = ["layout()", "SVG render", "animation frame"].some((label) =>
    !report.scaling.some((series) => series.label === label && series.points.length > 0));
  const evidenceIssues = [
    report.diffTest.exhaustiveDepth < 3 && "exhaustive depth is below 3",
    report.diffTest.randomCases === 0 && "no random run recorded",
    missingScaling && "scaling measurements missing",
  ].filter(Boolean);

  return (
    <section className="space-y-5">
      <h1 className="text-lg font-semibold">Verification</h1>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div><dt className="text-fg-muted">Commit SHA</dt><dd className="break-all font-mono">{report.commitSha}</dd></div>
        <div><dt className="text-fg-muted">Generated</dt><dd>{report.generatedAt}</dd></div>
        <div><dt className="text-fg-muted">Git version</dt><dd>{report.gitVersion}</dd></div>
        <div><dt className="text-fg-muted">Node version</dt><dd>{report.nodeVersion}</dd></div>
      </dl>
      <DiffTestSummary summary={report.diffTest} coverage={report.coverage} />
      {evidenceIssues.length > 0 && (
        <p role="status" className="text-sm text-warning">
          Verification evidence incomplete: {evidenceIssues.join("; ")}.
        </p>
      )}
      <section className="rounded-lg border border-line bg-surface p-4" aria-label="Divergences">
        <h2 className="font-semibold">Divergences</h2>
        {report.divergences.length === 0 ? (
          <p className="mt-2 text-sm text-fg-muted">No divergences recorded.</p>
        ) : (
          <ul className="mt-2 space-y-3 text-sm">
            {[...report.divergences].sort((a, b) => Number(b.severity === "hard") - Number(a.severity === "hard")).map((item) => (
              <li key={item.id} className="rounded-md border border-line bg-bg p-3">
                <p className={item.severity === "hard" ? "font-medium text-danger" : "font-medium text-warning"}>
                  {item.severity === "hard" ? "Hard divergence" : "Soft output warning"} · {item.id} · {item.kind}
                </p>
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
