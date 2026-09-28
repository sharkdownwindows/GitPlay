import { Terminal } from "../terminal/Terminal";
import { GraphView } from "../viz/GraphView";
import { useRepo } from "./store";

export function Practice() {
  const { state, run } = useRepo();

  return (
    <section>
      <h1 className="text-lg font-semibold">Practice</h1>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <Terminal onCommand={run} output={state.output} />
        <div className="overflow-auto rounded border border-neutral-700 bg-neutral-950 p-4">
          <GraphView state={state.repo} />
        </div>
      </div>
    </section>
  );
}
