import { succeed } from "../errors";
import type { RepoState, Result } from "../types";

/** STUB ngày 1 — trả state không đổi, đúng kiểu, không throw. TODO(D1): triển khai thật. */
export function branch(state: RepoState, name?: string): Result {
  if (name === undefined) {
    return succeed(state, Object.keys(state.branches));
  }
  return succeed(state, [`[stub] would create branch: ${name}`]);
}
