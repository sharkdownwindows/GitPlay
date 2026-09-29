import type { Command, RepoState } from "../core/types";
import { Terminal } from "../terminal/Terminal";
import { GraphView } from "../viz/GraphView";
import type { Level } from "./schema";

interface Props {
  level: Level;
  repo: RepoState;
  output: readonly string[];
  onCommand: (command: Command) => void;
}

export function LevelPanel({ level, repo, output, onCommand }: Props) {
  return (
    <section className="space-y-4" aria-label={`Level ${level.order}`}>
      <h2 className="text-lg font-semibold">{level.title}</h2>
      <p className="text-sm text-neutral-300">{level.goal}</p>
      <p className="text-xs text-neutral-400">Available commands: {level.allowed.join(", ")}</p>
      <div className="grid gap-4 xl:grid-cols-2">
        <Terminal onCommand={onCommand} output={output} />
        <div className="overflow-auto rounded border border-neutral-700 bg-neutral-950 p-4">
          <GraphView state={repo} />
        </div>
      </div>
    </section>
  );
}
