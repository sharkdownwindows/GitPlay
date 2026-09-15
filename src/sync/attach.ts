import type { ProgressStore } from "../progress/store";

/**
 * TIER 2 — ĐIỂM NỐI DUY NHẤT với Tier 1.
 * Được gọi đúng một lần, từ app/bootstrap.ts, qua dynamic import().
 *
 * STUB ngày 1. Best-effort tuyệt đối: mọi lỗi bị nuốt. Mất mạng, server chết,
 * chưa đăng nhập — app vẫn chạy như chưa từng có Tier 2.
 */
export function attachSync(store: ProgressStore): () => void {
  const unsubscribe = store.subscribe(() => {
    // TODO(D5): đẩy tiến độ lên server qua sync/client.ts, nuốt mọi lỗi.
  });
  return unsubscribe;
}
