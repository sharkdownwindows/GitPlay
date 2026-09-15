// ─────────────────────────────────────────────────────────────────────────────
// CONTRACT 3 — ĐÓNG BĂNG NGÀY 1
// Cùng MỘT kiểu cho ba nơi: localStorage, payload API, hàng SQLite.
// Nhờ vậy merge() test được bằng unit test thuần — không mạng, không database.
// ─────────────────────────────────────────────────────────────────────────────

export interface LevelRecord {
  levelId: string;
  /** ISO 8601. */
  completedAt: string;
  commandCount: number;
}

/** Khóa = levelId. Trùng với LevelRecord.levelId. */
export type ProgressSet = Record<string, LevelRecord>;
