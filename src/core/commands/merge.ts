import { succeed } from "../errors";
import type { DetectConflicts, RepoState, Result } from "../types";

/**
 * Seam 4 — ranh giới hàm conflict, có mặt từ v1 và LUÔN trả null.
 * v1 chưa có nội dung file nên không thể có conflict. Three-way merge thật
 * chỉ thay thân hàm này, không đụng tới Contract 1.
 */
export const detectConflicts: DetectConflicts = () => null;

/** STUB ngày 1 — trả state không đổi, đúng kiểu, không throw. TODO(D1): triển khai thật. */
export function merge(state: RepoState, branchName: string): Result {
  return succeed(state, [`[stub] would merge: ${branchName}`]);
}
