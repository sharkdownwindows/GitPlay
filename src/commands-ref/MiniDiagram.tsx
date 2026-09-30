import { MiniGraph } from "../viz/MiniGraph";
import type { CommandReference } from "./data";
import { referenceAfter } from "./referenceAfter";

export function MiniDiagram({ entry }: { entry: CommandReference }) {
  const after = referenceAfter(entry);
  if (after === null) return <p>Example unavailable.</p>;
  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2" aria-label={`${entry.key} before and after`}>
      <figure className="overflow-auto">
        <figcaption className="mb-2 text-sm text-fg-muted">Before</figcaption>
        <MiniGraph state={entry.before} />
      </figure>
      <figure className="overflow-auto">
        <figcaption className="mb-2 text-sm text-fg-muted">After</figcaption>
        <MiniGraph state={after} />
      </figure>
    </div>
  );
}
