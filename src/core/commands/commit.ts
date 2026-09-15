import { succeed } from "../errors";
import type { RepoState, Result } from "../types";

/** STUB ngày 1 — trả state không đổi, đúng kiểu, không throw. TODO(D1): triển khai thật. */
export function commit(state: RepoState, message?: string): Result {
  const msg = message ?? "";
  return succeed(state, [`[stub] would create commit: ${msg}`]);
}
