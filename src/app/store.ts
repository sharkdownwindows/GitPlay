import { useCallback, useReducer } from "react";
import { execute } from "../core/engine";
import { emptyState, type Command, type RepoState } from "../core/types";
import { parseCommand } from "../terminal/parse";

/**
 * useReducer bọc engine — không Redux, không Zustand. Engine đã là single
 * source of truth; thêm một thư viện state nữa chỉ là thêm một nguồn sự thật
 * thứ hai để hai nguồn lệch nhau.
 *
 * Các module UI KHÔNG import lẫn nhau — chúng gặp nhau ở đây.
 */

export interface AppState {
  repo: RepoState;
  outputLines: string[];
  history: RepoState[]; // undo stack
  future: RepoState[]; // redo stack
}

export type Action =
  | { type: "exec"; input: string }
  | { type: "run"; command: Command }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset"; state?: RepoState };

export function initialAppState(repo: RepoState = emptyState()): AppState {
  return {
    repo,
    outputLines: [],
    history: [],
    future: [],
  };
}

export const appReducer = reducer;

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "exec": {
      const command = parseCommand(action.input);
      const result = execute(state.repo, command);
      if (!result.ok) {
        // Lỗi không tạo bước undo — Git thật cũng không có gì để hoàn tác.
        return {
          ...state,
          outputLines: [...state.outputLines, ...result.output],
        };
      }
      return {
        repo: result.state,
        outputLines: [...state.outputLines, ...result.output],
        history: [...state.history, state.repo],
        future: [],
      };
    }

    case "run": {
      const result = execute(state.repo, action.command);
      if (!result.ok) {
        // Lỗi không tạo bước undo — Git thật cũng không có gì để hoàn tác.
        return {
          ...state,
          outputLines: [...state.outputLines, ...result.output],
        };
      }
      return {
        repo: result.state,
        outputLines: [...state.outputLines, ...result.output],
        history: [...state.history, state.repo],
        future: [],
      };
    }

    case "undo": {
      const previous = state.history.at(-1);
      if (!previous) return state;
      return {
        ...state,
        repo: previous,
        history: state.history.slice(0, -1),
        future: [state.repo, ...state.future],
      };
    }

    case "redo": {
      const next = state.future[0];
      if (!next) return state;
      return {
        ...state,
        repo: next,
        history: [...state.history, state.repo],
        future: state.future.slice(1),
      };
    }

    case "reset":
      return initialAppState(action.state);
  }
}

export function useRepo(initial?: RepoState) {
  const [state, dispatch] = useReducer(reducer, initial, initialAppState);

  const exec = useCallback(
    (input: string) => dispatch({ type: "exec", input }),
    [],
  );

  const run = useCallback(
    (command: Command) => dispatch({ type: "run", command }),
    [],
  );

  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);
  const reset = useCallback(
    (nextState?: RepoState) => dispatch({ type: "reset", state: nextState }),
    [],
  );

  return { state, dispatch, exec, run, undo, redo, reset };
}
