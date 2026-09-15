import { succeed } from "../errors";
import type { RepoState, Result } from "../types";

/** STUB ngày 1 — trả state không đổi, đúng kiểu, không throw. TODO(D1): triển khai thật. */
export function checkout(state: RepoState, target: string): Result {
  return succeed(state, [`[stub] would checkout: ${target}`]);
}
