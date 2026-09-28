import { describe, expect, it } from "vitest";
import { merge, mergeProgress } from "./merge";
import type { LevelRecord, ProgressSet } from "./types";

describe("mergeProgress (Contract 3 - Pure Union)", () => {
  const recA1: LevelRecord = {
    levelId: "01-first-commit",
    completedAt: "2026-03-01T10:00:00.000Z",
    commandCount: 5,
  };

  const recA2Earlier: LevelRecord = {
    levelId: "01-first-commit",
    completedAt: "2026-02-28T09:00:00.000Z",
    commandCount: 7,
  };

  const recA3Later: LevelRecord = {
    levelId: "01-first-commit",
    completedAt: "2026-03-05T12:00:00.000Z",
    commandCount: 3,
  };

  const recB: LevelRecord = {
    levelId: "02-branching",
    completedAt: "2026-03-02T11:00:00.000Z",
    commandCount: 4,
  };

  const recC: LevelRecord = {
    levelId: "03-switch-vs-checkout",
    completedAt: "2026-03-03T14:00:00.000Z",
    commandCount: 6,
  };

  it("1. rỗng ∪ rỗng -> rỗng", () => {
    const local: ProgressSet = {};
    const server: ProgressSet = {};
    const result = mergeProgress(local, server);
    expect(result).toEqual({});
  });

  it("2. rỗng ∪ có -> giữ nguyên server", () => {
    const local: ProgressSet = {};
    const server: ProgressSet = {
      [recA1.levelId]: recA1,
      [recB.levelId]: recB,
    };
    const result = mergeProgress(local, server);
    expect(result).toEqual(server);
  });

  it("3. có ∪ rỗng -> giữ nguyên local", () => {
    const local: ProgressSet = {
      [recA1.levelId]: recA1,
      [recB.levelId]: recB,
    };
    const server: ProgressSet = {};
    const result = mergeProgress(local, server);
    expect(result).toEqual(local);
  });

  it("4. rời nhau (disjoint) -> tập hợp gồm tất cả các level", () => {
    const local: ProgressSet = { [recA1.levelId]: recA1 };
    const server: ProgressSet = { [recB.levelId]: recB, [recC.levelId]: recC };
    const result = mergeProgress(local, server);

    expect(Object.keys(result)).toHaveLength(3);
    expect(result["01-first-commit"]).toEqual(recA1);
    expect(result["02-branching"]).toEqual(recB);
    expect(result["03-switch-vs-checkout"]).toEqual(recC);
  });

  it("5. giao nhau (overlapping) -> giữ cả hai và giải quyết đúng bản ghi trùng", () => {
    const local: ProgressSet = {
      [recA1.levelId]: recA1,
      [recB.levelId]: recB,
    };
    const server: ProgressSet = {
      [recA1.levelId]: recA3Later, // later date
      [recC.levelId]: recC,
    };
    const result = mergeProgress(local, server);

    expect(Object.keys(result).sort()).toEqual([
      "01-first-commit",
      "02-branching",
      "03-switch-vs-checkout",
    ]);
    expect(result["01-first-commit"]).toEqual(recA1); // local earlier date wins
    expect(result["02-branching"]).toEqual(recB);
    expect(result["03-switch-vs-checkout"]).toEqual(recC);
  });

  it("6. trùng khác completedAt -> bản ghi có completedAt sớm hơn luôn thắng", () => {
    // Case 6a: Server earlier than local
    const resServerWins = mergeProgress(
      { [recA1.levelId]: recA1 },
      { [recA1.levelId]: recA2Earlier }
    );
    expect(resServerWins["01-first-commit"]).toEqual(recA2Earlier);

    // Case 6b: Local earlier than server
    const resLocalWins = mergeProgress(
      { [recA1.levelId]: recA2Earlier },
      { [recA1.levelId]: recA1 }
    );
    expect(resLocalWins["01-first-commit"]).toEqual(recA2Earlier);
  });

  it("7. trùng cùng completedAt nhưng khác commandCount -> commandCount nhỏ hơn thắng", () => {
    const recBetter: LevelRecord = {
      levelId: "01-first-commit",
      completedAt: "2026-03-01T10:00:00.000Z",
      commandCount: 3,
    };
    const recWorse: LevelRecord = {
      levelId: "01-first-commit",
      completedAt: "2026-03-01T10:00:00.000Z",
      commandCount: 8,
    };

    const res1 = mergeProgress(
      { [recBetter.levelId]: recBetter },
      { [recWorse.levelId]: recWorse }
    );
    expect(res1["01-first-commit"]).toEqual(recBetter);

    const res2 = mergeProgress(
      { [recWorse.levelId]: recWorse },
      { [recBetter.levelId]: recBetter }
    );
    expect(res2["01-first-commit"]).toEqual(recBetter);
  });

  it("8. hàm thuần (pure function) -> không thay đổi input tham chiếu", () => {
    const local: ProgressSet = { [recA1.levelId]: recA1 };
    const server: ProgressSet = { [recB.levelId]: recB };

    const localSnapshot = JSON.stringify(local);
    const serverSnapshot = JSON.stringify(server);

    const result = mergeProgress(local, server);

    expect(JSON.stringify(local)).toBe(localSnapshot);
    expect(JSON.stringify(server)).toBe(serverSnapshot);
    expect(result).not.toBe(local);
    expect(result).not.toBe(server);
  });

  it("9. alias `merge` hoạt động đồng nhất với `mergeProgress`", () => {
    const local = { [recA1.levelId]: recA1 };
    const server = { [recB.levelId]: recB };
    expect(merge(local, server)).toEqual(mergeProgress(local, server));
  });
});
