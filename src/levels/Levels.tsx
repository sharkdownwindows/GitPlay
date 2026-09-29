import { useEffect } from "react";
import { useLevelStore } from "../app/levelStore";
import { progressStore } from "../progress/store";
import { levels } from "./data";
import { LevelList } from "./LevelList";
import { LevelPanel } from "./LevelPanel";

export function Levels() {
  const { state, dispatch } = useLevelStore();
  const selected = levels.find((level) => level.id === state.selectedId)!;

  useEffect(() => {
    const unsubscribe = progressStore.subscribe((progress) => dispatch({ type: "progressLoaded", progress }));
    void progressStore.load();
    return unsubscribe;
  }, [dispatch]);

  useEffect(() => {
    if (state.latestCompletion) progressStore.complete(state.latestCompletion);
  }, [state.latestCompletion]);

  return (
    <section className="space-y-4">
      <h1 className="text-lg font-semibold">Levels</h1>
      <div className="grid gap-6 md:grid-cols-[15rem_minmax(0,1fr)]">
        <LevelList levels={levels} progress={state.progress} selectedId={state.selectedId}
          onSelect={(levelId) => dispatch({ type: "select", levelId })} />
        <LevelPanel key={selected.id} level={selected} repo={state.repo} output={state.output}
          onCommand={(command) => dispatch({ type: "run", command, completedAt: new Date().toISOString() })} />
      </div>
    </section>
  );
}
