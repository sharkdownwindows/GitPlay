import { useCallback, useReducer } from "react";
import { execute } from "../core/engine";
import { initialHistory, recordResult, redo, undo, type HistoryState } from "../core/history";
import { emptyState, type Command, type RepoState } from "../core/types";

/**
 * useReducer bọc engine — không Redux, không Zustand. Engine đã là single
 * source of truth; thêm một thư viện state nữa chỉ là thêm một nguồn sự thật
 * thứ hai để hai nguồn lệch nhau.
 *
 * Các module UI KHÔNG import lẫn nhau — chúng gặp nhau ở đây.
 */
export interface AppState extends HistoryState {
  output: string[];
}

export type Action =
  | { type: "run"; command: Command }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset"; state?: RepoState };

export function initialAppState(repo: RepoState = emptyState()): AppState {
  return { ...initialHistory(repo), output: [] };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "run": {
      const result = execute(state.repo, action.command);
      return {
        ...recordResult(state, result),
        output: [...state.output, ...result.output],
      };
    }
    case "undo": {
      const history = undo(state);
      return history === state ? state : { ...state, ...history };
    }
    case "redo": {
      const history = redo(state);
      return history === state ? state : { ...state, ...history };
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
