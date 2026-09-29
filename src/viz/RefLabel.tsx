interface RefLabelProps {
  x: number;
  y: number;
  label: string;
  kind: "branch" | "attached" | "detached";
  ariaLabel: string;
}

/** A visible badge for every branch ref and HEAD position. */
export function RefLabel({ x, y, label, kind, ariaLabel }: RefLabelProps) {
  const width = Math.max(56, label.length * 7 + 16);
  const left = Math.max(4, x - width / 2);
  const fill = kind === "branch" ? "#166534" : kind === "attached" ? "#92400e" : "#b91c1c";

  return (
    <g aria-label={ariaLabel} data-ref-kind={kind}>
      <rect x={left} y={y} width={width} height={18} rx={4} fill={fill} />
      <text x={left + width / 2} y={y + 13} textAnchor="middle" fontSize={11} fontWeight="bold" fill="white">
        {label}
      </text>
    </g>
  );
}
