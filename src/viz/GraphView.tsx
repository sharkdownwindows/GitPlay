import type { RepoState } from "../core/types";
import { layout } from "./layout";
import { RefLabel } from "./RefLabel";

interface Props {
  state: RepoState;
  width?: number;
  height?: number;
}

/** SVG view of the repository. CSS animates positions; layout() remains the source of truth. */
export function GraphView({ state, width, height }: Props) {
  const graph = layout(state);
  const positions = new Map(graph.nodes.map((node) => [node.id, node]));
  const branches = Object.entries(state.branches).sort(([a], [b]) => a.localeCompare(b));
  const naturalWidth = Math.max(graph.width + 160, 240);
  const naturalHeight = Math.max(graph.height + 80, 100);

  return (
    <svg
      width={width ?? naturalWidth}
      height={height ?? naturalHeight}
      viewBox={`0 0 ${naturalWidth} ${naturalHeight}`}
      role="img"
      aria-label="Git commit graph"
    >
      {graph.nodes.length === 0 && (
        <>
          <text x={16} y={32} fill="currentColor">No commits yet</text>
          <RefLabel x={90} y={42} kind={state.head.detached ? "detached" : "attached"}
            ariaLabel={state.head.detached ? "HEAD detached" : `HEAD attached to ${state.head.ref}`}
            label={state.head.detached ? "HEAD detached" : `HEAD → ${state.head.ref ?? "?"} (unborn)`} />
        </>
      )}

      {graph.edges.map((edge) => {
        const from = positions.get(edge.from)!;
        const to = positions.get(edge.to)!;
        return (
          <line
            key={`${edge.from}:${edge.to}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="#64748b"
            strokeWidth={2}
          />
        );
      })}

      {graph.nodes.map((node) => {
        const names = branches
          .filter(([, commitId]) => commitId === node.id)
          .map(([name]) => name);
        const attached = !state.head.detached && names.includes(state.head.ref ?? "");
        const detached = state.head.detached && state.head.commit === node.id;

        return (
          <g key={node.id} data-commit-id={node.id} className="graph-node"
            style={{ transform: `translate(${node.x}px, ${node.y}px)` }}>
            <circle cx={0} cy={0} r={14} fill="#0f172a" stroke="#38bdf8" strokeWidth={2} />
            <text x={0} y={4} textAnchor="middle" fontSize={10} fill="white">
              {node.id}
            </text>
            {names.map((name, index) => (
              <RefLabel key={name} x={0} y={20 + index * 20}
                label={name} kind="branch" ariaLabel={`branch ${name}`} />
            ))}
            {(attached || detached) && (
              <RefLabel
                x={0}
                y={20 + names.length * 20}
                kind={attached ? "attached" : "detached"}
                ariaLabel={attached
                  ? `HEAD attached to ${state.head.ref}`
                  : `HEAD detached at ${node.id}`}
                label={attached ? `HEAD → ${state.head.ref}` : `HEAD detached at ${node.id}`}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
