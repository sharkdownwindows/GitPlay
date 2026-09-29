import type { RepoState } from "../core/types";
import { GraphView } from "./GraphView";

interface Props {
  state: RepoState;
  width?: number;
  height?: number;
}

/** Shares GraphView's layout, nodes, edges and ref labels. */
export function MiniGraph({ state, width = 320, height = 320 }: Props) {
  return <GraphView state={state} width={width} height={height} />;
}
