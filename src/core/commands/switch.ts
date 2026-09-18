import { succeed } from "../errors";
import type { RepoState, Result } from "../types";

/** STUB ngày 1 — trả state không đổi, đúng kiểu, không throw. TODO(D1): triển khai thật. */
export function switchTo(
  state: RepoState,
  target: string,
  detach: boolean,
  create: boolean,
): Result {
  const how = detach ? " (detached)" : "";
  const via = create ? " (creating branch)" : "";
  return succeed(state, [`[stub] would switch to: ${target}${how}${via}`]);
}
