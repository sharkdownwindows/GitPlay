import type { Commit } from "../core/types";
import type { LayoutNode } from "./layout";

export interface CommitNodeProps {
  node: LayoutNode;
  commit?: Commit;
  isDetachedHead?: boolean;
  isAttachedHead?: boolean;
}

export function CommitNode({
  node,
  commit,
  isDetachedHead = false,
  isAttachedHead = false,
}: CommitNodeProps) {
  const displayLabel = commit?.message ? commit.message : node.id;
  // Giới hạn chiều dài nhãn hiển thị trong vòng tròn nếu quá dài
  const shortLabel =
    displayLabel.length > 6 ? displayLabel.slice(0, 5) + "…" : displayLabel;

  return (
    <g
      className={`commit-node cursor-pointer group ${
        isDetachedHead ? "detached-head-node" : ""
      }`}
      transform={`translate(${node.x}, ${node.y})`}
    >
      <title>{`${node.id}: ${commit?.message || "No message"}`}</title>

      {/* Vòng sáng nổi bật khi HEAD detached trực tiếp tại commit này */}
      {isDetachedHead && (
        <circle
          r={28}
          fill="none"
          stroke="#ef4444"
          strokeWidth={2}
          strokeDasharray="4 3"
          className="animate-pulse"
          opacity={0.85}
        />
      )}

      {/* Vòng sáng nhẹ nếu HEAD attached đang trỏ tới branch ở commit này */}
      {isAttachedHead && !isDetachedHead && (
        <circle
          r={25}
          fill="none"
          stroke="#10b981"
          strokeWidth={1.5}
          opacity={0.4}
        />
      )}

      {/* Vòng tròn commit chính r=20 */}
      <circle
        r={20}
        fill="#1e293b"
        stroke={isDetachedHead ? "#ef4444" : isAttachedHead ? "#38bdf8" : "#64748b"}
        strokeWidth={isDetachedHead || isAttachedHead ? 3 : 2}
        className="transition-colors duration-150 group-hover:stroke-blue-400"
      />

      {/* Nhãn message hoặc id ở giữa commit node */}
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#f8fafc"
        fontSize={11}
        fontWeight="600"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        className="pointer-events-none select-none"
      >
        {shortLabel}
      </text>
    </g>
  );
}
