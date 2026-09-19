import { useState } from "react";
import { GraphView } from "../viz/GraphView";
import { useRepo } from "./store";
import type { RepoState } from "../core/types";

/**
 * Mốc M2: Visualizer tĩnh (GraphView, CommitNode, RefLabel, Edges).
 *
 * Practice tab tích hợp GraphView và các chế độ mẫu:
 *   - 4 commit + 2 branch (HEAD attached)
 *   - HEAD detached tại commit
 *   - 3 commit thẳng hàng (git commit x3)
 *   - Live state kết nối useRepo()
 */

const TABS = [
  { id: "practice", label: "Practice", owner: "D2 · D3" },
  { id: "levels", label: "Levels", owner: "D4" },
  { id: "reference", label: "Reference", owner: "D4" },
  { id: "verification", label: "Verification", owner: "D6" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// Mẫu 1: 4 commit + 2 branch (HEAD attached vào main)
const SAMPLE_STATE_ATTACHED: RepoState = {
  commits: {
    c1: { id: "c1", message: "init", parents: [], timestamp: "2026-01-01T00:00:00Z" },
    c2: { id: "c2", message: "feat-a", parents: ["c1"], timestamp: "2026-01-02T00:00:00Z" },
    c3: { id: "c3", message: "feat-b", parents: ["c1"], timestamp: "2026-01-03T00:00:00Z" },
    c4: { id: "c4", message: "merge", parents: ["c2", "c3"], timestamp: "2026-01-04T00:00:00Z" },
  },
  branches: {
    main: "c4",
    feature: "c3",
  },
  head: {
    detached: false,
    ref: "main",
    commit: null,
  },
  snapshot: null,
  workingTree: null,
  index: null,
  conflicts: null,
};

// Mẫu 2: HEAD detached tại commit c2
const SAMPLE_STATE_DETACHED: RepoState = {
  ...SAMPLE_STATE_ATTACHED,
  head: {
    detached: true,
    ref: null,
    commit: "c2",
  },
};

// Mẫu 3: 3 commit thẳng hàng
const SAMPLE_STATE_LINEAR: RepoState = {
  commits: {
    c1: { id: "c1", message: "init", parents: [], timestamp: "2026-01-01T00:00:00Z" },
    c2: { id: "c2", message: "c2", parents: ["c1"], timestamp: "2026-01-02T00:00:00Z" },
    c3: { id: "c3", message: "c3", parents: ["c2"], timestamp: "2026-01-03T00:00:00Z" },
  },
  branches: {
    main: "c3",
    feature: "c3",
  },
  head: {
    detached: false,
    ref: "main",
    commit: null,
  },
  snapshot: null,
  workingTree: null,
  index: null,
  conflicts: null,
};

type PresetId = "sample-attached" | "sample-detached" | "sample-linear" | "live";

export function App() {
  const [active, setActive] = useState<TabId>("practice");
  const [preset, setPreset] = useState<PresetId>("sample-attached");
  const { state: liveState } = useRepo();

  const current = TABS.find((t) => t.id === active) ?? TABS[0];

  const getDisplayedRepo = (): RepoState => {
    switch (preset) {
      case "sample-attached":
        return SAMPLE_STATE_ATTACHED;
      case "sample-detached":
        return SAMPLE_STATE_DETACHED;
      case "sample-linear":
        return SAMPLE_STATE_LINEAR;
      case "live":
        return liveState.repo;
    }
  };

  const displayedRepo = getDisplayedRepo();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-6">
            <span className="font-bold tracking-tight text-lg bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              GitScope
            </span>
            <nav className="flex gap-1" role="tablist" aria-label="Khu vực chính">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={tab.id === active}
                  onClick={() => setActive(tab.id)}
                  className={
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-all " +
                    (tab.id === active
                      ? "bg-neutral-800 text-neutral-100 shadow-sm"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900")
                  }
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          <span className="text-xs text-neutral-500 font-mono">
            M2 · Visualizer (D2)
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl w-full flex-1 px-6 py-6" role="tabpanel">
        {active === "practice" ? (
          <div className="space-y-4">
            {/* Top Toolbar / Preset Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-neutral-400 text-xs font-medium uppercase tracking-wider">
                  Trạng thái mẫu:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setPreset("sample-attached")}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${preset === "sample-attached"
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      }`}
                  >
                    4 commit + 2 branch (HEAD attached)
                  </button>
                  <button
                    onClick={() => setPreset("sample-detached")}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${preset === "sample-detached"
                        ? "bg-red-600 text-white"
                        : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      }`}
                  >
                    HEAD detached
                  </button>
                  <button
                    onClick={() => setPreset("sample-linear")}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${preset === "sample-linear"
                        ? "bg-emerald-600 text-white"
                        : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      }`}
                  >
                    3 commit thẳng hàng
                  </button>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                  HEAD (Đỏ)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span>
                  Branch (Xanh lá)
                </span>
              </div>
            </div>

            {/* Graph Visualizer Panel */}
            <div className="h-[420px] w-full">
              <GraphView state={displayedRepo} />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-8 text-center">
            <h1 className="text-lg font-medium">{current.label}</h1>
            <p className="mt-2 text-sm text-neutral-500">
              Tab trống — chờ {current.owner}.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
