import type { LayoutNode } from "./layout";

export interface RefLabelProps {
  node: LayoutNode;
  branches: string[];
  head: {
    detached: boolean;
    ref: string | null;
    commit: string | null;
  };
}

export function RefLabel({ node, branches, head }: RefLabelProps) {
  const isDetachedHere = head.detached && head.commit === node.id;
  const attachedBranch = !head.detached ? head.ref : null;

  const branchItems: Array<{
    type: "attached-head" | "branch";
    branchName: string;
  }> = [];

  for (const branch of branches) {
    if (branch === attachedBranch) {
      branchItems.push({ type: "attached-head", branchName: branch });
    } else {
      branchItems.push({ type: "branch", branchName: branch });
    }
  }

  const rightStartX = node.x + 28;
  const itemHeight = 26;
  const totalRightHeight = branchItems.length * itemHeight;
  const startRightY = node.y - totalRightHeight / 2 + 2;

  // NHÃN HEAD DETACHED: Thiết kế 2 dòng (xuống dòng) gọn gàng và đặt ở BÊN TRÁI commit node
  // Không bị đè bởi các node/branch bên phải và chữ không bao giờ bị tràn
  const detachedBadgeWidth = 96;
  const detachedBadgeHeight = 32;
  const leftStartX = node.x - 40 - detachedBadgeWidth;
  const leftStartY = node.y - detachedBadgeHeight / 2;

  return (
    <g className="ref-labels" aria-label={`Refs at commit ${node.id}`}>
      {/* 1. Nhãn HEAD Detached (2 dòng) ở BÊN TRÁI của commit node */}
      {isDetachedHere && (
        <g key="head-detached-group">
          {/* Đường nối nét đứt màu đỏ sang trái */}
          <line
            x1={node.x - 20}
            y1={node.y}
            x2={node.x - 40}
            y2={node.y}
            stroke="#ef4444"
            strokeWidth={1.5}
            strokeDasharray="3 2"
          />

          <g
            className="ref-detached-head"
            transform={`translate(${leftStartX}, ${leftStartY})`}
          >
            <title>{`HEAD is detached at ${node.id}`}</title>
            {/* Nền badge đỏ nổi bật */}
            <rect
              x={0}
              y={0}
              width={detachedBadgeWidth}
              height={detachedBadgeHeight}
              rx={5}
              fill="#dc2626"
              stroke="#fca5a5"
              strokeWidth={1.5}
              className="drop-shadow-sm"
            />
            {/* Dòng 1: Chấm tròn vàng + Chữ HEAD */}
            <circle cx={14} cy={11} r={3} fill="#fef08a" />
            <text
              x={22}
              y={11.5}
              dominantBaseline="central"
              fill="#ffffff"
              fontSize={11}
              fontWeight="800"
              fontFamily="ui-monospace, monospace"
              letterSpacing="0.04em"
            >
              HEAD
            </text>

            {/* Dòng 2: (detached) xuống dòng, căn giữa badge */}
            <text
              x={detachedBadgeWidth / 2}
              y={23}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#fecaca"
              fontSize={9}
              fontWeight="600"
              fontFamily="ui-monospace, monospace"
              letterSpacing="0.02em"
            >
              (detached)
            </text>
          </g>
        </g>
      )}

      {/* 2. Nhóm nhãn Branch / Attached HEAD ở BÊN PHẢI của commit node */}
      {branchItems.length > 0 && (
        <g key="branch-group">
          {/* Đường nối sang phải */}
          <line
            x1={node.x + 20}
            y1={node.y}
            x2={rightStartX}
            y2={node.y}
            stroke="#64748b"
            strokeWidth={1.5}
          />

          {branchItems.map((item, idx) => {
            const itemY = startRightY + idx * itemHeight;

            if (item.type === "attached-head") {
              const branchName = item.branchName;
              const charWidth = 7.5;
              const headPartWidth = 46;
              const branchPartWidth = Math.max(
                branchName.length * charWidth + 14,
                42,
              );
              const totalWidth = headPartWidth + branchPartWidth;
              const badgeHeight = 22;

              return (
                <g
                  key={`head-attached-${branchName}`}
                  className="ref-attached-head"
                  transform={`translate(${rightStartX}, ${itemY})`}
                >
                  <title>{`HEAD is attached to branch '${branchName}'`}</title>
                  <rect
                    x={0}
                    y={0}
                    width={totalWidth}
                    height={badgeHeight}
                    rx={4}
                    fill="#0f172a"
                    stroke="#334155"
                    strokeWidth={1}
                  />
                  <rect
                    x={0}
                    y={0}
                    width={headPartWidth}
                    height={badgeHeight}
                    rx={4}
                    fill="#ef4444"
                  />
                  <rect
                    x={headPartWidth - 4}
                    y={0}
                    width={4}
                    height={badgeHeight}
                    fill="#ef4444"
                  />
                  <text
                    x={headPartWidth / 2 - 3}
                    y={badgeHeight / 2 + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize={10}
                    fontWeight="800"
                    fontFamily="ui-monospace, monospace"
                  >
                    HEAD
                  </text>
                  <text
                    x={headPartWidth + 2}
                    y={badgeHeight / 2}
                    dominantBaseline="central"
                    fill="#94a3b8"
                    fontSize={11}
                  >
                    →
                  </text>
                  <rect
                    x={headPartWidth + 14}
                    y={2}
                    width={branchPartWidth - 16}
                    height={badgeHeight - 4}
                    rx={3}
                    fill="#10b981"
                  />
                  <text
                    x={headPartWidth + 14 + (branchPartWidth - 16) / 2}
                    y={badgeHeight / 2 + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize={10}
                    fontWeight="700"
                    fontFamily="ui-monospace, monospace"
                  >
                    {branchName}
                  </text>
                </g>
              );
            }

            const branchName = item.branchName;
            const charWidth = 7.5;
            const badgeWidth = Math.max(branchName.length * charWidth + 18, 48);
            const badgeHeight = 22;

            return (
              <g
                key={`branch-${branchName}`}
                className="ref-branch"
                transform={`translate(${rightStartX}, ${itemY})`}
              >
                <title>{`Branch: ${branchName}`}</title>
                <rect
                  x={0}
                  y={0}
                  width={badgeWidth}
                  height={badgeHeight}
                  rx={4}
                  fill="#059669"
                  stroke="#34d399"
                  strokeWidth={1}
                />
                <circle cx={9} cy={badgeHeight / 2} r={2.5} fill="#a7f3d0" />
                <text
                  x={17 + (badgeWidth - 22) / 2}
                  y={badgeHeight / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#ffffff"
                  fontSize={10}
                  fontWeight="700"
                  fontFamily="ui-monospace, monospace"
                >
                  {branchName}
                </text>
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
}
