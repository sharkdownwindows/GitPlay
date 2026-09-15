import { useCallback, useReducer } from "react";
import { execute } from "../core/engine";
import { emptyState, type Command, type RepoState } from "../core/types";

/**
 * useReducer bọc engine — không Redux, không Zustand. Engine đã là single
 * source of truth; thêm một thư viện state nữa chỉ là thêm một nguồn sự thật
 * thứ hai để hai nguồn lệch nhau.
 *
 * Các module UI KHÔNG import lẫn nhau — chúng gặp nhau ở đây.
 */
export interface AppState {
  repo: RepoState;
  output: string[];
  past: RepoState[];
  future: RepoState[];
}

export type Action =
  | { type: "run"; command: Command }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset"; state?: RepoState };

export function initialAppState(repo: RepoState = emptyState()): AppState {
  return { repo, output: [], past: [], future: [] };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "run": {
      const result = execute(state.repo, action.command);
      if (!result.ok) {
        // Lỗi không tạo bước undo — Git thật cũng không có gì để hoàn tác.
        return { ...state, output: [...state.output, ...result.output] };
      }
      return {
        repo: result.state,
        output: [...state.output, ...result.output],
        past: [...state.past, state.repo],
        future: [],
      };
    }
    case "undo": {
      const previous = state.past.at(-1);
      if (!previous) return state;
      return {
        ...state,
        repo: previous,
        past: state.past.slice(0, -1),
        future: [state.repo, ...state.future],
      };
    }
    case "redo": {
      const next = state.future[0];
      if (!next) return state;
      return {
        ...state,
        repo: next,
        past: [...state.past, state.repo],
        future: state.future.slice(1),
      };
    }
    case "reset":
      return initialAppState(action.state);
  }
}

export function useRepo(initial?: RepoState) {
  const [state, dispatch] = useReducer(reducer, initial, initialAppState);
  const run = useCallback((command: Command) => dispatch({ type: "run", command }), []);
  return { state, dispatch, run };
}
