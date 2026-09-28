import { describe, expect, it } from "vitest";
import { initialAppState, reducer } from "./store";

describe("app reducer", () => {
  it("dispatch command thành công đổi RepoState và lưu undo snapshot", () => {
    const initial = initialAppState();
    const next = reducer(initial, { type: "run", command: { kind: "commit", message: "root" } });
    expect(next.repo).not.toBe(initial.repo);
    expect(Object.keys(next.repo.commits)).toHaveLength(1);
    expect(next.past).toEqual([initial.repo]);
    expect(next.future).toEqual([]);
    expect(initial.repo.commits).toEqual({});
  });

  it("command lỗi giữ RepoState và không thêm undo snapshot", () => {
    const initial = initialAppState();
    const next = reducer(initial, { type: "run", command: { kind: "branch", name: "feature" } });
    expect(next.repo).toBe(initial.repo);
    expect(next.past).toEqual([]);
    expect(next.future).toEqual([]);
    expect(next.output).toHaveLength(1);
  });

  it("command mới sau undo xóa redo stack", () => {
    const root = reducer(initialAppState(), { type: "run", command: { kind: "commit", message: "root" } });
    const second = reducer(root, { type: "run", command: { kind: "commit", message: "second" } });
    const undone = reducer(second, { type: "undo" });
    expect(undone.future).toEqual([second.repo]);

    const branched = reducer(undone, { type: "run", command: { kind: "branch", name: "feature" } });
    expect(branched.repo.branches.feature).toBe(root.repo.branches.main);
    expect(branched.future).toEqual([]);
    expect(reducer(branched, { type: "redo" })).toBe(branched);
  });
});
