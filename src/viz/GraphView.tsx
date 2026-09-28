import type { RepoState } from "../core/types";
import { layout } from "./layout";

interface Props {
  state: RepoState;
}

/** Static SVG view of the repository. All positions come from layout(). */
export function GraphView({ state }: Props) {
  const graph = layout(state);
  const positions = new Map(graph.nodes.map((node) => [node.id, node]));
  const branches = Object.entries(state.branches).sort(([a], [b]) => a.localeCompare(b));
  const width = Math.max(graph.width + 160, 240);
  const height = Math.max(graph.height + 80, 100);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Git commit graph"
    >
      {graph.nodes.length === 0 && (
        <>
          <text x={16} y={32} fill="currentColor">No commits yet</text>
          <text x={16} y={56} fill="currentColor">
            {state.head.detached
              ? "HEAD detached"
              : `HEAD → ${state.head.ref ?? "?"} (unborn)`}
          </text>
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
          <g key={node.id} data-commit-id={node.id}>
            <circle cx={node.x} cy={node.y} r={14} fill="#0f172a" stroke="#38bdf8" strokeWidth={2} />
            <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize={10} fill="white">
              {node.id}
            </text>
            {names.map((name, index) => (
              <text
                key={name}
                x={node.x}
                y={node.y + 28 + index * 16}
                textAnchor="middle"
                fontSize={11}
                fill="#22c55e"
                aria-label={`branch ${name}`}
              >
                {name}
              </text>
            ))}
            {(attached || detached) && (
              <text
                x={node.x}
                y={node.y + 28 + names.length * 16}
                textAnchor="middle"
                fontSize={11}
                fontWeight="bold"
                fill="#fbbf24"
                aria-label={attached
                  ? `HEAD attached to ${state.head.ref}`
                  : `HEAD detached at ${node.id}`}
              >
                {attached ? `HEAD → ${state.head.ref}` : "HEAD detached"}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
