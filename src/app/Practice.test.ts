import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Command } from "../core/types";
import { Terminal } from "../terminal/Terminal";
import { editInput, initialTerminalSession, previousCommand, submitInput } from "../terminal/session";
import { GraphView } from "../viz/GraphView";
import { App } from "./App";
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
