import { useCallback, useRef, useState } from "react";
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
  inputLocked: boolean;
}

export type Action =
  | { type: "run"; command: Command; animate?: boolean }
  | { type: "unlockInput" }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset"; state?: RepoState };

export function initialAppState(repo: RepoState = emptyState()): AppState {
  return { ...initialHistory(repo), output: [], inputLocked: false };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "run": {
      if (state.inputLocked) return state;
      const result = execute(state.repo, action.command);
      return {
        ...recordResult(state, result),
        output: [...state.output, ...result.output],
        inputLocked: Boolean(action.animate && result.ok && result.state !== state.repo),
      };
    }
    case "unlockInput":
      return state.inputLocked ? { ...state, inputLocked: false } : state;
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
  const [state, setState] = useState(() => initialAppState(initial));
  const current = useRef(state);
  const dispatch = useCallback((action: Action) => {
    current.current = reducer(current.current, action);
    setState(current.current);
  }, []);
  const run = useCallback((command: Command, animate = false): boolean => {
    if (current.current.inputLocked) return false;
    dispatch({ type: "run", command, animate });
    return true;
  }, [dispatch]);
  return { state, dispatch, run };
}
