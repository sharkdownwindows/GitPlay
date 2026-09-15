import { merge } from "./merge";
import type { LevelRecord, ProgressSet } from "./types";

const STORAGE_KEY = "gitscope.progress.v1";

type Listener = (progress: ProgressSet) => void;

/**
 * localStorage LÀ NGUỒN SỰ THẬT. Store này không biết server tồn tại:
 * cấm import sync/, cấm gọi fetch. Chiều phụ thuộc là một chiều —
 * progress phát sự kiện, sync lắng nghe. Đảo chiều làm hỏng offline-first
 * và sẽ không lộ ra cho tới lúc demo mất mạng.
 */
class ProgressStore {
  private progress: ProgressSet = {};
  private listeners = new Set<Listener>();

  /** Đọc localStorage. Hỏng hoặc không có → tập rỗng, không bao giờ throw. */
  async load(): Promise<void> {
    this.progress = readStorage();
    this.emit();
  }

  getAll(): ProgressSet {
    return this.progress;
  }

  isComplete(levelId: string): boolean {
    return levelId in this.progress;
  }

  /** Ghi nhận hoàn thành level. Giữ lần giải tốt hơn nếu đã có. */
  complete(record: LevelRecord): void {
    this.progress = merge(this.progress, { [record.levelId]: record });
    writeStorage(this.progress);
    this.emit();
  }

  /** Tier 2 gọi vào đây khi server trả tiến độ về. Union, không ghi đè. */
  applyRemote(remote: ProgressSet): void {
    this.progress = merge(this.progress, remote);
    writeStorage(this.progress);
    this.emit();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.progress);
      } catch {
        // Observer hỏng không được làm sập store.
      }
    }
  }
}

function readStorage(): ProgressSet {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressSet) : {};
  } catch {
    return {};
  }
}

function writeStorage(progress: ProgressSet): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Quota đầy hoặc chế độ riêng tư — mất tiến độ còn hơn sập app.
  }
}

export const progressStore = new ProgressStore();
export type { ProgressStore };
