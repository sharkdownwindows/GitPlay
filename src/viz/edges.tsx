import type { LayoutEdge, LayoutNode } from "./layout";

export interface EdgesProps {
  edges: LayoutEdge[];
  nodes: LayoutNode[];
}

export function Edges({ edges, nodes }: EdgesProps) {
  const nodeMap = new Map<string, LayoutNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  return (
    <g className="edges" aria-label="Commit Graph Edges">
      {edges.map((edge) => {
        const fromNode = nodeMap.get(edge.from);
        const toNode = nodeMap.get(edge.to);

        if (!fromNode || !toNode) {
          return null;
        }

        return (
          <g key={`${edge.from}->${edge.to}`} className="edge-group">
            {/* Đường nối giữa child (fromNode) và parent (toNode) */}
            <line
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke="#64748b"
              strokeWidth={2.5}
              strokeLinecap="round"
              markerEnd="url(#arrowhead)"
              className="transition-all duration-200"
            />
          </g>
        );
      })}
    </g>
  );
}
