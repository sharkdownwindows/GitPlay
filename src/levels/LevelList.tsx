import type { Level } from "./schema";
import type { ProgressSet } from "../progress/types";

interface Props {
  levels: readonly Level[];
  progress: ProgressSet;
  selectedId: string;
  onSelect: (levelId: string) => void;
}

export function LevelList({ levels, progress, selectedId, onSelect }: Props) {
  return (
    <nav aria-label="Levels">
      <ol className="space-y-2">
        {[...levels].sort((a, b) => a.order - b.order).map((level) => (
          <li key={level.id}>
            <button type="button" aria-current={selectedId === level.id ? "step" : undefined}
              onClick={() => onSelect(level.id)}
              className="w-full rounded border border-neutral-700 px-3 py-2 text-left text-sm">
              {level.order.toString().padStart(2, "0")}. {level.title}
              {Object.hasOwn(progress, level.id) && <span className="ml-2 text-green-400">Completed</span>}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
