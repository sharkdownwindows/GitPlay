import { beforeEach, describe, expect, it } from "vitest";
import { progressStore } from "./store";
import type { ProgressSet } from "./types";

const STORAGE_KEY = "gitscope.progress.v1";

// Mock localStorage helper
function createMockStorage(initialData: Record<string, string> = {}) {
  const store: Record<string, string> = { ...initialData };
  return {
    store,
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
  };
}

describe("ProgressStore (Tier 1 Offline-First Store)", () => {
  let mockStorage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    mockStorage = createMockStorage();
    Object.defineProperty(globalThis, "localStorage", {
      value: mockStorage,
      writable: true,
      configurable: true,
    });
    progressStore.reset();
  });

  it("1. khoi tao rong va get() tra ve ban sao an toan", () => {
    expect(progressStore.get()).toEqual({});
    const snapshot = progressStore.get();
    (snapshot as Record<string, unknown>)["hack"] = 123;
    expect(progressStore.get()).toEqual({});
  });

  it("2. markComplete ghi dong bo vao localStorage va cap nhat bo nho", () => {
    progressStore.markComplete("01-first-commit", 3, "2026-03-01T00:00:00.000Z");

    // Kiem tra bo nho
    expect(progressStore.isComplete("01-first-commit")).toBe(true);
    expect(progressStore.isComplete("02-branching")).toBe(false);

    const record = progressStore.get()["01-first-commit"];
    expect(record).toBeDefined();
    expect(record!.levelId).toBe("01-first-commit");
    expect(record!.commandCount).toBe(3);
    expect(record!.completedAt).toBe("2026-03-01T00:00:00.000Z");

    // Kiem tra da ghi vao localStorage dong bo
    const raw = mockStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    const saved = JSON.parse(raw!) as ProgressSet;
    expect(saved["01-first-commit"]).toEqual(record);
  });

  it("3. mo phong reload trang: doc lai tu localStorage van con nguyen", () => {
    progressStore.markComplete("01-first-commit", 4, "2026-03-01T10:00:00.000Z");
    progressStore.markComplete("02-branching", 2, "2026-03-02T10:00:00.000Z");

    // Gia lap khoi dong lai ung dung bang cach goi load()
    return progressStore.load().then(() => {
      const current = progressStore.get();
      expect(Object.keys(current)).toHaveLength(2);
      expect(current["01-first-commit"]?.commandCount).toBe(4);
      expect(current["02-branching"]?.commandCount).toBe(2);
    });
  });

  it("4. localStorage bi hong hoac JSON sai cu phap -> khong crash, tra ve rong", () => {
    const invalidPayloads = [
      "not-a-valid-json{{{",
      "12345",
      "true",
      '"just-a-string"',
      "[1, 2, 3]",
      "null",
    ];

    let chain = Promise.resolve();
    for (const bad of invalidPayloads) {
      chain = chain.then(() => {
        mockStorage.setItem(STORAGE_KEY, bad);
        return expect(progressStore.load()).resolves.toBeUndefined().then(() => {
          expect(progressStore.get()).toEqual({});
        });
      });
    }
    return chain;
  });

  it("5. subscribe phat su kien khi co thay doi va ho tro unsubscribe", () => {
    const events: ProgressSet[] = [];
    const unsubscribe = progressStore.subscribe((p) => {
      events.push(p);
    });

    progressStore.markComplete("01-first-commit", 5);
    expect(events).toHaveLength(1);
    expect(events[0]!["01-first-commit"]).toBeDefined();

    // Huy dang ky
    unsubscribe();
    progressStore.markComplete("02-branching", 3);
    // Khong nhan them su kien sau khi da unsubscribe
    expect(events).toHaveLength(1);
  });

  it("6. loi trong observer khong lam sap store va khong chan listener khac", () => {
    let secondCalled = false;
    progressStore.subscribe(() => {
      throw new Error("Observer crashed intentionally");
    });
    progressStore.subscribe(() => {
      secondCalled = true;
    });

    expect(() => {
      progressStore.markComplete("01-first-commit", 2);
    }).not.toThrow();
    expect(secondCalled).toBe(true);
  });

  it("7. reset() xoa sach ca bo nho va localStorage, thong bao cho listener", () => {
    progressStore.markComplete("01-first-commit", 3);
    expect(mockStorage.getItem(STORAGE_KEY)).toBeTruthy();

    let notifiedWithEmpty = false;
    progressStore.subscribe((p) => {
      if (Object.keys(p).length === 0) notifiedWithEmpty = true;
    });

    progressStore.reset();

    expect(progressStore.get()).toEqual({});
    expect(mockStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(notifiedWithEmpty).toBe(true);
  });

  it("8. applyRemote hop nhat tien do tu nguon ngoai ma khong de mat tien do local", () => {
    progressStore.markComplete("01-first-commit", 5, "2026-03-01T10:00:00.000Z");

    progressStore.applyRemote({
      "01-first-commit": {
        levelId: "01-first-commit",
        completedAt: "2026-03-05T10:00:00.000Z", // muộn hơn
        commandCount: 2,
      },
      "02-branching": {
        levelId: "02-branching",
        completedAt: "2026-03-02T10:00:00.000Z",
        commandCount: 4,
      },
    });

    const state = progressStore.get();
    expect(Object.keys(state)).toHaveLength(2);
    // Ban ghi local som hon van duoc giu
    expect(state["01-first-commit"]?.completedAt).toBe("2026-03-01T10:00:00.000Z");
    expect(state["02-branching"]?.commandCount).toBe(4);
  });

  it("9. ghi storage bi loi (quota day hoac private mode) -> that bai im lang, khong crash", () => {
    mockStorage.setItem = () => {
      throw new Error("QuotaExceededError");
    };

    expect(() => {
      progressStore.markComplete("01-first-commit", 3);
    }).not.toThrow();
    expect(progressStore.isComplete("01-first-commit")).toBe(true);
  });
});
