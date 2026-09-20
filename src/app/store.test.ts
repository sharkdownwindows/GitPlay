import { describe, expect, it } from "vitest";
import { reducer, initialAppState, type AppState } from "./store";
import type { RepoState } from "../core/types";

describe("app/store.ts (Issue #8 · D2-3)", () => {
  const baseState: RepoState = {
    commits: {
      c1: { id: "c1", message: "init", parents: [], timestamp: "2026-01-01" },
    },
    branches: { main: "c1" },
    head: { detached: false, ref: "main", commit: null },
    snapshot: null,
    workingTree: null,
    index: null,
    conflicts: null,
  };

  // 1. Acceptance Criterion: Dispatch `exec` làm state đổi
  it("dispatch exec với lệnh hợp lệ làm thay đổi state.repo và đẩy vào history", () => {
    const initialState = initialAppState(baseState);

    // Chạy lệnh commit
    const nextState = reducer(initialState, {
      type: "exec",
      input: "git commit -m 'second'",
    });

    expect(nextState.history).toHaveLength(1);
    expect(nextState.history[0]).toEqual(baseState);
    expect(nextState.future).toHaveLength(0);
    expect(nextState.outputLines.length).toBeGreaterThan(0);
  });

  // 2. Acceptance Criterion: Lệnh lỗi KHÔNG tạo entry undo (không thêm vào history)
  it("lệnh lỗi chỉ ghi nhận outputLines mà KHÔNG tạo entry trong history", () => {
    const initialState = initialAppState(baseState);

    // Lệnh không hợp lệ
    const failedState = reducer(initialState, {
      type: "exec",
      input: "git invalid-cmd-xyz",
    });

    // repo giữ nguyên
    expect(failedState.repo).toEqual(baseState);
    // history KHÔNG bị thay đổi
    expect(failedState.history).toHaveLength(0);
    // future giữ nguyên
    expect(failedState.future).toHaveLength(0);
    // outputLines ghi nhận thông báo lỗi
    expect(failedState.outputLines.length).toBeGreaterThan(0);
  });

  // 3. Acceptance Criterion: Undo 3 lần rồi redo 3 lần cho lại state ban đầu
  it("undo 3 lần rồi redo 3 lần phục hồi đúng các trạng thái", () => {
    let state: AppState = initialAppState(baseState);

    // Thực hiện 3 bước commit liên tiếp
    state = reducer(state, { type: "exec", input: "git commit -m 'c2'" });
    state = reducer(state, { type: "exec", input: "git commit -m 'c3'" });
    state = reducer(state, { type: "exec", input: "git commit -m 'c4'" });

    expect(state.history).toHaveLength(3);
    const finalRepo = state.repo;

    // Undo lần 1
    state = reducer(state, { type: "undo" });
    expect(state.history).toHaveLength(2);
    expect(state.future).toHaveLength(1);

    // Undo lần 2
    state = reducer(state, { type: "undo" });
    expect(state.history).toHaveLength(1);
    expect(state.future).toHaveLength(2);

    // Undo lần 3 -> Về state ban đầu
    state = reducer(state, { type: "undo" });
    expect(state.history).toHaveLength(0);
    expect(state.future).toHaveLength(3);
    expect(state.repo).toEqual(baseState);

    // Thử undo thêm khi history rỗng -> state không đổi
    const noopUndo = reducer(state, { type: "undo" });
    expect(noopUndo).toEqual(state);

    // Redo lần 1
    state = reducer(state, { type: "redo" });
    expect(state.history).toHaveLength(1);
    expect(state.future).toHaveLength(2);

    // Redo lần 2
    state = reducer(state, { type: "redo" });
    expect(state.history).toHaveLength(2);
    expect(state.future).toHaveLength(1);

    // Redo lần 3 -> Khôi phục lại trạng thái cuối cùng
    state = reducer(state, { type: "redo" });
    expect(state.history).toHaveLength(3);
    expect(state.future).toHaveLength(0);
    expect(state.repo).toEqual(finalRepo);

    // Thử redo thêm khi future rỗng -> state không đổi
    const noopRedo = reducer(state, { type: "redo" });
    expect(noopRedo).toEqual(state);
  });

  // 4. Reset action
  it("reset khôi phục lại trạng thái ban đầu sạch", () => {
    let state = initialAppState(baseState);
    state = reducer(state, { type: "exec", input: "git commit -m 'c2'" });
    expect(state.history).toHaveLength(1);

    const resetState = reducer(state, { type: "reset" });
    expect(resetState.history).toHaveLength(0);
    expect(resetState.future).toHaveLength(0);
    expect(resetState.outputLines).toHaveLength(0);
  });

  // 5. Reducer là hàm thuần
  it("reducer không làm thay đổi trực tiếp (mutate) state gốc", () => {
    const initialState = initialAppState(baseState);
    const frozenState = Object.freeze({ ...initialState });

    const result = reducer(frozenState, {
      type: "exec",
      input: "git commit -m 'c2'",
    });

    expect(result).not.toBe(frozenState);
    expect(frozenState.history).toHaveLength(0);
  });
});
