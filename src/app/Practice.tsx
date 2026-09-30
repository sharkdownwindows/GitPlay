import { useEffect } from "react";
import { Terminal } from "../terminal/Terminal";
import { GraphView } from "../viz/GraphView";
import { useRepo } from "./store";

export const GRAPH_ANIMATION_MS = 300;

export function scheduleInputUnlock(dispatch: (action: { type: "unlockInput" }) => void): () => void {
  const timer = setTimeout(() => dispatch({ type: "unlockInput" }), GRAPH_ANIMATION_MS);
  return () => clearTimeout(timer);
}

export function Practice() {
  const { state, dispatch, run } = useRepo();

  useEffect(() => {
    if (!state.inputLocked) return;
    return scheduleInputUnlock(dispatch);
  }, [state.inputLocked, dispatch]);

  const onCommand = (command: Parameters<typeof run>[0]) =>
    run(command, !window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);

  return (
    <section>
      <h1 className="text-lg font-semibold">Practice</h1>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <Terminal onCommand={onCommand} output={state.output} disabled={state.inputLocked} />
        <div className="overflow-auto rounded-lg border border-line bg-bg p-4">
          <GraphView state={state.repo} />
        </div>
      </div>
    </section>
  );
}
