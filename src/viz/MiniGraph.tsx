import type { RepoState } from "../core/types";

interface Props {
  state: RepoState;
  width?: number;
  height?: number;
}

/**
 * STUB ngày 1 — render đúng một hình chữ nhật.
 *
 * Tồn tại để D4 (commands-ref) import được NGAY mà không phải chờ D2 làm xong
 * visualizer. Interface đã chốt: nhận RepoState, trả SVG. D2 thay phần ruột sau,
 * D4 không phải sửa gì.
 */
export function MiniGraph({ state, width = 160, height = 60 }: Props) {
  const count = Object.keys(state.commits).length;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Sơ đồ mini: ${count} commit`}
    >
      <rect
        x={1}
        y={1}
        width={width - 2}
        height={height - 2}
        rx={6}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeDasharray="4 3"
        opacity={0.5}
      />
      <text
        x={width / 2}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={11}
        fill="currentColor"
        opacity={0.6}
      >
        MiniGraph · {count} commit
      </text>
    </svg>
  );
}
