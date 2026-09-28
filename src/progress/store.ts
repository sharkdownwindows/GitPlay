import { mergeProgress } from "./merge";
import type { LevelRecord, ProgressSet } from "./types";

const STORAGE_KEY = "gitscope.progress.v1";

type Listener = (progress: ProgressSet) => void;

/**
 * localStorage LÀ NGUỒN SỰ THẬT DUY NHẤT TRONG PHIÊN.
 * Store này hoàn toàn offline-first và không biết server tồn tại:
 * CẤM import các module mạng ngoài, CẤM gọi HTTP trực tiếp.
 *
 * Chiều phụ thuộc là một chiều: progress phát sự kiện qua observer,
 * các module bên ngoài tự lắng nghe và xử lý best-effort.
 */
class ProgressStore {
  private progress: ProgressSet = {};
  private listeners = new Set<Listener>();

  /**
   * Đọc dữ liệu từ localStorage.
   * Nếu storage trống, bị hỏng, hoặc JSON sai cú pháp:
   * an toàn trả về tập rỗng {}, TUYỆT ĐỐI KHÔNG CRASH hay throw.
   */
  load(): Promise<void> {
    this.progress = readStorage();
    this.emit();
    return Promise.resolve();
  }

  /** Lấy toàn bộ tập tiến độ hiện tại. */
  get(): ProgressSet {
    return { ...this.progress };
  }

  /** Alias cho get() để tương thích ngược */
  getAll(): ProgressSet {
    return this.get();
  }

  /** Kiểm tra xem một level đã hoàn thành chưa. */
  isComplete(levelId: string): boolean {
    return levelId in this.progress;
  }

  /**
   * Ghi nhận hoàn thành level.
   * Ghi localStorage ĐỒNG BỘ rồi mới gọi observer (commit point của UI).
   * Mọi xử lý sau điểm này (gửi lên server, animation, v.v.) đều là tùy chọn
   * và được phép thất bại im lặng mà không ảnh hưởng tới tiến độ của user.
   */
  markComplete(
    levelId: string,
    commandCount: number,
    completedAt: string = new Date().toISOString()
  ): void {
    const record: LevelRecord = {
      levelId,
      completedAt,
      commandCount,
    };
    this.progress = mergeProgress(this.progress, { [levelId]: record });
    writeStorage(this.progress);
    this.emit();
  }

  /** Alias cho markComplete khi nhận LevelRecord trực tiếp */
  complete(record: LevelRecord): void {
    this.markComplete(record.levelId, record.commandCount, record.completedAt);
  }

  /**
   * Tier 2 gọi vào đây khi nhận được tiến độ từ server.
   * Dùng phép hợp mergeProgress, không bao giờ ghi đè làm mất tiến độ local.
   */
  applyRemote(remote: ProgressSet): void {
    this.progress = mergeProgress(this.progress, remote);
    writeStorage(this.progress);
    this.emit();
  }

  /**
   * Đăng ký lắng nghe thay đổi trạng thái tiến độ.
   * Trả về hàm hủy đăng ký (unsubscribe).
   */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Xóa sạch toàn bộ tiến độ trong bộ nhớ và localStorage.
   * Phục vụ nút reset của người dùng và reset fixture khi chạy test.
   */
  reset(): void {
    this.progress = {};
    clearStorage();
    this.emit();
  }

  private emit(): void {
    const snapshot = this.get();
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch {
        // Observer hỏng không được phép làm sập store.
      }
    }
  }
}

function readStorage(): ProgressSet {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    return parsed as ProgressSet;
  } catch {
    return {};
  }
}

function writeStorage(progress: ProgressSet): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Quota đầy, chế độ private browsing hoặc localStorage bị tắt:
    // Thất bại im lặng, giữ ứng dụng hoạt động không crash.
  }
}

function clearStorage(): void {
  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    // Thất bại im lặng nếu storage không khả dụng.
  }
}

export const progressStore = new ProgressStore();
export type { ProgressStore };
