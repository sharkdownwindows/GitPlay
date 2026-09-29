import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Command } from "../core/types";
import { Terminal } from "../terminal/Terminal";
import { editInput, initialTerminalSession, previousCommand, submitInput } from "../terminal/session";
import { GraphView } from "../viz/GraphView";
import { App } from "./App";
import { GRAPH_ANIMATION_MS, scheduleInputUnlock } from "./Practice";
import { initialAppState, reducer } from "./store";

describe("M2 Practice", () => {
  it("render Terminal và GraphView từ store rỗng, giữ bốn tab", () => {
    const html = renderToStaticMarkup(createElement(App));
    expect(html.match(/role="tab"/g)).toHaveLength(4);
    expect(html).toContain('aria-label="Git terminal"');
    expect(html).toContain('aria-label="Git command"');
    expect(html).toContain('aria-label="Git commit graph"');
    expect(html).toContain("HEAD → main (unborn)");
  });

  it("commit → output/graph → branch label → ArrowUp đi qua cùng repo state", () => {
    let app = initialAppState();
    let terminal = initialTerminalSession();
    const run = (command: Command) => {
      app = reducer(app, { type: "run", command });
    };

    terminal = submitInput(editInput(terminal, 'git commit -m "first"'), run);
    expect(renderToStaticMarkup(createElement(Terminal, { onCommand: run, output: app.output })))
      .toContain("[main (root-commit) c1] first");
    expect(renderToStaticMarkup(createElement(GraphView, { state: app.repo })))
      .toContain('data-commit-id="c1"');

    terminal = submitInput(editInput(terminal, "git branch feature"), run);
    expect(renderToStaticMarkup(createElement(GraphView, { state: app.repo })))
      .toContain('aria-label="branch feature"');
    expect(previousCommand(terminal).input).toBe("git branch feature");
  });
});

afterEach(() => vi.useRealTimers());

describe("Practice animation lock", () => {
  it("locks for the 300 ms animation and releases at the deadline", () => {
    vi.useFakeTimers();
    let state = reducer(initialAppState(), { type: "run", command: { kind: "commit", message: "root" }, animate: true });
    expect(state.inputLocked).toBe(true);
    expect(renderToStaticMarkup(createElement(Terminal, { onCommand: () => {}, output: state.output, disabled: state.inputLocked })))
      .toContain('disabled=""');
    const cleanup = scheduleInputUnlock((action) => { state = reducer(state, action); });
    expect(GRAPH_ANIMATION_MS).toBeLessThanOrEqual(400);
    vi.advanceTimersByTime(GRAPH_ANIMATION_MS - 1);
    expect(state.inputLocked).toBe(true);
    vi.advanceTimersByTime(1);
    expect(state.inputLocked).toBe(false);
    cleanup();
  });

  it("does not lock parser errors, engine failures, no-op commands or reduced motion", () => {
    const initial = initialAppState();
    const parser = submitInput(editInput(initialTerminalSession(), "git merge"), () => {
      throw new Error("parser should reject this command");
    });
    expect(parser.entries[0]?.error.length).toBeGreaterThan(0);
    const failed = reducer(initial, { type: "run", command: { kind: "branch", name: "feature" }, animate: true });
    expect(failed.inputLocked).toBe(false);
    const root = reducer(initial, { type: "run", command: { kind: "commit" } });
    const noOp = reducer(root, { type: "run", command: { kind: "merge", branch: "main" }, animate: true });
    expect(noOp.repo).toBe(root.repo);
    expect(noOp.inputLocked).toBe(false);
    expect(reducer(initial, { type: "run", command: { kind: "commit" }, animate: false }).inputLocked).toBe(false);
  });

  it("rejects a second rapid submit while locked without diverging from the store", () => {
    let state = initialAppState();
    const run = (command: Command): boolean => {
      if (state.inputLocked) return false;
      state = reducer(state, { type: "run", command, animate: true });
      return true;
    };
    const first = submitInput(editInput(initialTerminalSession(), "git commit -m first"), run);
    const second = submitInput(editInput(first, "git commit -m second"), run);
    expect(second.entries).toHaveLength(1);
    expect(second.input).toBe("git commit -m second");
    expect(Object.keys(state.repo.commits)).toHaveLength(1);
    expect(state.repo.branches.main).toBe("c1");
  });

  it("cleans up the unlock timer on unmount", () => {
    vi.useFakeTimers();
    const dispatch = vi.fn();
    const cleanup = scheduleInputUnlock(dispatch);
    expect(vi.getTimerCount()).toBe(1);
    cleanup();
    vi.advanceTimersByTime(GRAPH_ANIMATION_MS);
    expect(dispatch).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
