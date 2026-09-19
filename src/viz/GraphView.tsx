import type { RepoState, Commit } from "../core/types";
import { layout } from "./layout";
import { Edges } from "./edges";
import { CommitNode } from "./CommitNode";
import { RefLabel } from "./RefLabel";

export interface GraphViewProps {
  state: RepoState;
  className?: string;
  width?: number | string;
  height?: number | string;
}

export function GraphView({
  state,
  className = "",
  width = "100%",
  height = "100%",
}: GraphViewProps) {
  const graphLayout = layout(state);

  // Nhóm các branch theo commitId
  const branchesByCommit = new Map<string, string[]>();
  if (state.branches) {
    for (const [branchName, commitId] of Object.entries(state.branches)) {
      if (!commitId) continue;
      const list = branchesByCommit.get(commitId) ?? [];
      list.push(branchName);
      branchesByCommit.set(commitId, list);
    }
  }

  // Chuyển commits sang map để lookup nhanh thông tin commit
  const commitMap = new Map<string, Commit>();
  if (state.commits) {
    for (const [id, c] of Object.entries(state.commits)) {
      commitMap.set(id, c);
    }
  }

  // Xử lý khi chưa có commit nào (RepoState rỗng)
  if (graphLayout.nodes.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-8 text-neutral-400 border border-dashed border-neutral-800 rounded-xl bg-neutral-900/40 min-h-[240px] ${className}`}
        role="region"
        aria-label="Git Graph View"
      >
        <div className="w-10 h-10 mb-3 rounded-full border-2 border-dashed border-neutral-700 flex items-center justify-center text-neutral-500 font-mono text-xs">
          0
        </div>
        <p className="text-sm font-medium text-neutral-300">
          Chưa có commit nào
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          Gõ <code className="text-neutral-300 font-mono bg-neutral-800 px-1.5 py-0.5 rounded">git commit</code> để tạo commit đầu tiên.
        </p>
      </div>
    );
  }

  // Tính toán viewBox linh hoạt:
  // Nếu có HEAD detached ở bên trái, mở rộng minX về âm để nhãn hiển thị trọn vẹn mà không cắt góc
  const isDetached = Boolean(state.head?.detached && state.head.commit);
  const minX = isDetached ? -160 : -20;
  const minY = -10;
  const svgWidth = isDetached
    ? Math.max(graphLayout.width + 160 + 200, 520)
    : Math.max(graphLayout.width + 200 + 20, 400);
  const svgHeight = Math.max(graphLayout.height + 40, 220);

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-auto rounded-xl bg-neutral-950/70 border border-neutral-800 p-4 ${className}`}
      role="region"
      aria-label="Git Graph View"
    >
      <svg
        width={width}
        height={height}
        viewBox={`${minX} ${minY} ${svgWidth} ${svgHeight}`}
        className="max-w-full max-h-full select-none"
        style={{ minWidth: Math.min(svgWidth, 520) }}
      >
        <defs>
          {/* Mũi tên chỉ thị hướng cạnh trỏ từ child về parent */}
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="26"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#64748b" />
          </marker>

          {/* Gradient nhẹ cho nền */}
          <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Lớp Cạnh (Edges) */}
        <Edges edges={graphLayout.edges} nodes={graphLayout.nodes} />

        {/* 2. Lớp Commit Nodes */}
        <g className="nodes" aria-label="Commit Nodes">
          {graphLayout.nodes.map((node) => {
            const commit = commitMap.get(node.id);
            const isDetachedHere =
              state.head?.detached && state.head.commit === node.id;
            const branchesHere = branchesByCommit.get(node.id) || [];
            const isAttachedHere =
              !state.head?.detached &&
              state.head?.ref !== null &&
              branchesHere.includes(state.head.ref);

            return (
              <CommitNode
                key={node.id}
                node={node}
                commit={commit}
                isDetachedHead={isDetachedHere}
                isAttachedHead={isAttachedHere}
              />
            );
          })}
        </g>

        {/* 3. Lớp Nhãn Refs (Branches & HEAD) */}
        <g className="refs" aria-label="Ref Labels">
          {graphLayout.nodes.map((node) => {
            const branches = branchesByCommit.get(node.id) || [];
            return (
              <RefLabel
                key={`refs-${node.id}`}
                node={node}
                branches={branches}
                head={state.head}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
