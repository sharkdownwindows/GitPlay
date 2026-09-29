import { commandReferences } from "./data";
import { MiniDiagram } from "./MiniDiagram";

export function CommandRefPanel() {
  return (
    <section aria-label="Command reference">
      <h1 className="text-lg font-semibold">Command reference</h1>
      <p className="mt-2 text-sm text-neutral-400">See how each command changes commits, branches and HEAD.</p>
      <div className="mt-5 space-y-3">
        {commandReferences.map((entry) => (
          <details key={entry.key} className="rounded border border-neutral-700 bg-neutral-900 p-4">
            <summary className="cursor-pointer font-medium">git {entry.key} — {entry.description}</summary>
            <code className="mt-4 block text-sm text-sky-300">{entry.syntax}</code>
            <p className="mt-3 text-sm">{entry.effect}</p>
            <p className="mt-2 text-sm text-amber-300">Gotcha: {entry.gotcha}</p>
            <MiniDiagram entry={entry} />
          </details>
        ))}
      </div>
    </section>
  );
}
