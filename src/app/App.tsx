import React, { useReducer, useState, useRef, useEffect } from "react";
import { appReducer, initialAppState } from "./store";
import { GraphView } from "../viz/GraphView";
import type { RepoState } from "../core/types";

/**
 * Mốc M2: Visualizer tĩnh + useReducer bọc engine + Các sơ đồ mẫu.
 *
 * Practice tab tích hợp:
 *   - Sơ đồ Live tương tác thời gian thực với engine & terminal
 *   - Các sơ đồ Git mẫu: 4 commit + 2 branch (HEAD attached), HEAD detached, 3 commit thẳng hàng
 *   - Terminal Output log tự động cuộn
 *   - Input nhập lệnh hỗ trợ phím ↑/↓ duyệt lịch sử
 *   - Các nút Undo, Redo, Reset
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

type ViewMode = "live" | "sample-attached" | "sample-detached" | "sample-linear";

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>("practice");
  const [state, dispatch] = useReducer(appReducer, undefined, initialAppState);
  const [viewMode, setViewMode] = useState<ViewMode>("live");

  const [inputVal, setInputVal] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const currentTab = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  // Tự động cuộn xuống dòng mới nhất của Terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.outputLines]);

  const handleRunCommand = (cmdText: string) => {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    // Chuyển sang chế độ live khi gõ lệnh
    setViewMode("live");

    // Lưu vào lịch sử gõ phím của terminal
    setCmdHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);
    setInputVal("");

    // Dispatch tới store
    dispatch({ type: "exec", input: trimmed });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleRunCommand(inputVal);
    } else if (e.key === "ArrowUp") {
      // ↑ lấy lại lệnh trước
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIndex =
        historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputVal(cmdHistory[nextIndex] ?? "");
    } else if (e.key === "ArrowDown") {
      // ↓ tiến tới lệnh sau
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= cmdHistory.length) {
        setHistoryIndex(-1);
        setInputVal("");
      } else {
        setHistoryIndex(nextIndex);
        setInputVal(cmdHistory[nextIndex] ?? "");
      }
    }
  };

  // Xác định đồ thị hiển thị theo viewMode
  const getDisplayedRepo = (): RepoState => {
    switch (viewMode) {
      case "sample-attached":
        return SAMPLE_STATE_ATTACHED;
      case "sample-detached":
        return SAMPLE_STATE_DETACHED;
      case "sample-linear":
        return SAMPLE_STATE_LINEAR;
      case "live":
      default:
        return state.repo;
    }
  };

  const displayedRepo = getDisplayedRepo();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* 1. Header Navigation */}
      <header className="overflow-auto border-b border-neutral-800 bg-neutral-950/80 backdrop-blur sticky top-0 z-10">
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
                  aria-selected={tab.id === activeTab}
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-all " +
                    (tab.id === activeTab
                      ? "bg-neutral-800 text-neutral-100 shadow-sm"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900")
                  }
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="mx-auto max-w-5xl w-full flex-1 px-6 py-6 flex flex-col gap-4" role="tabpanel">
        {activeTab === "practice" ? (
          <div className="flex flex-col gap-4 flex-1">
            {/* Top Toolbar: Bộ chọn chế độ xem (Live / Mẫu) & Thao tác Undo/Redo/Reset */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-neutral-400 text-xs font-medium uppercase tracking-wider">
                  Chế độ xem:
                </span>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setViewMode("live")}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${viewMode === "live"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      }`}
                  >
                    ● Live (Tương tác)
                  </button>
                  <button
                    onClick={() => setViewMode("sample-attached")}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${viewMode === "sample-attached"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      }`}
                  >
                    Mẫu 4 commit (HEAD attached)
                  </button>
                  <button
                    onClick={() => setViewMode("sample-detached")}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${viewMode === "sample-detached"
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      }`}
                  >
                    Mẫu HEAD detached
                  </button>
                  <button
                    onClick={() => setViewMode("sample-linear")}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${viewMode === "sample-linear"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      }`}
                  >
                    Mẫu 3 commit thẳng
                  </button>
                </div>
              </div>

              {/* Điều khiển Undo / Redo / Reset */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setViewMode("live");
                    dispatch({ type: "undo" });
                  }}
                  disabled={state.history.length === 0}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors"
                  title="Hoàn tác lệnh trước"
                >
                  ↩ Undo ({state.history.length})
                </button>
                <button
                  onClick={() => {
                    setViewMode("live");
                    dispatch({ type: "redo" });
                  }}
                  disabled={state.future.length === 0}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors"
                  title="Làm lại lệnh vừa hoàn tác"
                >
                  ↪ Redo ({state.future.length})
                </button>
                <button
                  onClick={() => {
                    setViewMode("live");
                    dispatch({ type: "reset" });
                  }}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-red-950/60 hover:text-red-400 text-xs font-medium transition-colors"
                  title="Đặt lại trạng thái ban đầu"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* 1. Hiển thị Git Graph */}
            <div className="h-[360px] w-full">
              <GraphView state={displayedRepo} />
            </div>

            {/* Gợi ý lệnh nhanh */}
            <div className="flex items-center justify-between px-2 text-xs text-neutral-400 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 font-mono">Gợi ý nhanh:</span>
                <button
                  onClick={() => handleRunCommand("git commit")}
                  className="px-2 py-0.5 rounded bg-neutral-800/80 hover:bg-neutral-700 font-mono text-neutral-300"
                >
                  git commit
                </button>
                <button
                  onClick={() => handleRunCommand("git branch feature")}
                  className="px-2 py-0.5 rounded bg-neutral-800/80 hover:bg-neutral-700 font-mono text-neutral-300"
                >
                  git branch feature
                </button>
                <button
                  onClick={() => handleRunCommand("git switch feature")}
                  className="px-2 py-0.5 rounded bg-neutral-800/80 hover:bg-neutral-700 font-mono text-neutral-300"
                >
                  git switch feature
                </button>
              </div>
              <div className="flex items-center gap-3">
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

            {/* 2. Hiển thị Output / Terminal & Input */}
            <div className="flex flex-col rounded-xl border border-neutral-800 bg-neutral-900/90 overflow-hidden shadow-lg">
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-neutral-950/60 text-xs text-neutral-400 font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block"></span>
                  <span className="ml-2 text-neutral-300">Terminal Output</span>
                </div>
                <span>Dùng ↑/↓ để lấy lại lệnh</span>
              </div>

              {/* Terminal Output Log */}
              <div className="p-4 font-mono text-xs max-h-[160px] overflow-y-auto space-y-1 text-neutral-300 scrollbar-thin">
                {state.outputLines.length === 0 ? (
                  <div className="text-neutral-500 italic">
                    Chưa có kết quả lệnh. Gõ "git commit" để bắt đầu.
                  </div>
                ) : (
                  state.outputLines.map((line, index) => (
                    <div
                      key={index}
                      className={
                        line.startsWith("fatal:") || line.startsWith("error:")
                          ? "text-red-400"
                          : "text-neutral-300"
                      }
                    >
                      {line}
                    </div>
                  ))
                )}
                <div ref={terminalEndRef} />
              </div>

              {/* 3. Input nhập lệnh */}
              <div className="flex items-center border-t border-neutral-800 bg-neutral-950 px-3 py-2 font-mono text-sm">
                <span className="text-emerald-400 mr-2 select-none">$</span>
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập lệnh Git (ví dụ: git commit, git branch feature)..."
                  className="w-full bg-transparent text-neutral-100 placeholder-neutral-500 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-8 text-center">
            <h1 className="text-lg font-medium">{currentTab.label}</h1>
            <p className="mt-2 text-sm text-neutral-500">
              Tab trống — chờ {currentTab.owner}.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
