import type { LevelRecord, ProgressSet } from "./types";

/**
 * Union hai ProgressSet. Hàm THUẦN — không I/O, không thời gian, không random.
 *
 * Luật giải xung đột khi cùng levelId có ở cả hai bên:
 *   1. Giữ bản hoàn thành SỚM hơn (completedAt nhỏ hơn) — thành tích đã đạt
 *      thì không mất đi vì đăng nhập ở máy khác.
 *   2. Bằng nhau về thời gian → giữ commandCount nhỏ hơn (lời giải tốt hơn).
 *
 * Union chứ không phải "bên nào thắng": không bao giờ xóa tiến độ, kể cả khi
 * server trả về tập rỗng vì tài khoản mới.
 */
export function merge(local: ProgressSet, remote: ProgressSet): ProgressSet {
  const out: ProgressSet = { ...local };
  for (const [levelId, incoming] of Object.entries(remote)) {
    const current = out[levelId];
    out[levelId] = current ? better(current, incoming) : incoming;
  }
  return out;
}

function better(a: LevelRecord, b: LevelRecord): LevelRecord {
  if (a.completedAt !== b.completedAt) {
    return a.completedAt < b.completedAt ? a : b;
  }
  return a.commandCount <= b.commandCount ? a : b;
}
