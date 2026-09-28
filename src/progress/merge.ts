import type { LevelRecord, ProgressSet } from "./types";

/**
 * Phép hợp hai ProgressSet (local và server).
 * Hàm THUẦN — không I/O, không truy cập thời gian hệ thống, không random.
 *
 * Lập luận giải quyết xung đột (Q&A: "Tại sao không cần cơ chế xử lý xung đột phức tạp?"):
 * 1. Tiến độ là dữ liệu CHỈ TĂNG (monotonically increasing data).
 * 2. Không bao giờ có thao tác "bỏ hoàn thành" (un-complete a level).
 * 3. Do đó không tồn tại xung đột dữ liệu thực sự giữa hai thiết bị hay client/server.
 *
 * Quy tắc giải quyết khi trùng `levelId`:
 * 1. Giữ bản có `completedAt` SỚM HƠN (lần hoàn thành đầu tiên mới là thành tích thật,
 *    thành tích đã đạt không bị mất đi khi người dùng đăng nhập ở máy khác).
 * 2. Trường hợp bằng nhau về `completedAt` → giữ bản có `commandCount` nhỏ hơn (lời giải tối ưu hơn).
 */
export function mergeProgress(local: ProgressSet, server: ProgressSet): ProgressSet {
  const out: ProgressSet = { ...local };
  for (const [levelId, incoming] of Object.entries(server)) {
    const current = out[levelId];
    out[levelId] = current ? pickBetterRecord(current, incoming) : incoming;
  }
  return out;
}

/** Alias cho mergeProgress để giữ tương thích ngược */
export const merge = mergeProgress;

function pickBetterRecord(a: LevelRecord, b: LevelRecord): LevelRecord {
  if (a.completedAt !== b.completedAt) {
    return a.completedAt < b.completedAt ? a : b;
  }
  return a.commandCount <= b.commandCount ? a : b;
}
