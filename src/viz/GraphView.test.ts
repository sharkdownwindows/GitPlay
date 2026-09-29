import { readFileSync, readdirSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { emptyState, type RepoState } from "../core/types";
import { GraphView } from "./GraphView";
import { layout } from "./layout";

function sampleState(): RepoState {
  const state = emptyState();
  state.commits = {
    c1: { id: "c1", parents: [], message: "root", timestamp: "2020-01-01T00:00:00Z" },
    c2: { id: "c2", parents: ["c1"], message: "next", timestamp: "2020-01-02T00:00:00Z" },
  };
  state.branches = { main: "c2", feature: "c1" };
  return state;
}

function render(state: RepoState): string {
  return renderToStaticMarkup(createElement(GraphView, { state }));
}

describe("GraphView", () => {
  it("repo rỗng vẫn render SVG và HEAD unborn", () => {
    const html = render(emptyState());
    expect(html).toContain("<svg");
    expect(html).toContain("No commits yet");
    expect(html).toContain("HEAD → main (unborn)");
    expect(html).not.toContain("<circle");
    expect(html).not.toContain("<line");
  });

  it("render node và cạnh tại tọa độ layout thật", () => {
    const state = sampleState();
    const html = render(state);
    const positions = new Map(layout(state).nodes.map((node) => [node.id, node]));
    const child = positions.get("c2")!;
    const parent = positions.get("c1")!;
    expect(html).toContain('data-commit-id="c1"');
    expect(html).toContain('data-commit-id="c2"');
    expect(html.match(/<circle\b/g)).toHaveLength(2);
    expect(html).toContain(`<circle cx="${child.x}" cy="${child.y}"`);
    expect(html).toContain(`<circle cx="${parent.x}" cy="${parent.y}"`);
    expect(html).toContain(
      `<line x1="${child.x}" y1="${child.y}" x2="${parent.x}" y2="${parent.y}"`,
    );
  });

  it("hiển thị branch labels và attached HEAD trên đúng commit", () => {
    const html = render(sampleState());
    expect(html).toContain('aria-label="branch feature"');
    expect(html).toContain('aria-label="branch main"');
    expect(html).toContain('aria-label="HEAD attached to main"');
    expect(html).toContain("HEAD → main");
    expect(html.match(/data-ref-kind="branch"/g)).toHaveLength(2);
    expect(html).toContain('data-ref-kind="attached"');
    expect(html).not.toContain('data-ref-kind="detached"');
    expect(html).toContain('fill="#92400e"');
  });

  it("hiển thị detached HEAD tại commit thay vì gắn với branch", () => {
    const state = sampleState();
    state.head = { detached: true, ref: null, commit: "c1" };
    const html = render(state);
    expect(html).toContain('aria-label="HEAD detached at c1"');
    expect(html).toContain("HEAD detached");
    expect(html).not.toContain("HEAD → main");
    expect(html).toContain('data-ref-kind="detached"');
    expect(html).not.toContain('data-ref-kind="attached"');
    expect(html).toContain('fill="#b91c1c"');
  });

  it("không mutate RepoState và không tạo animation", () => {
    const state = sampleState();
    const before = structuredClone(state);
    const html = render(state);
    expect(state).toEqual(before);
    expect(html).not.toMatch(/<animate\b|transition|animation/i);
  });

  it("viz không import terminal, levels hoặc verification", () => {
    for (const file of readdirSync(new URL(".", import.meta.url))) {
      if (!/\.tsx?$/.test(file) || file.endsWith(".test.ts")) continue;
      const source = readFileSync(new URL(file, import.meta.url), "utf8");
      expect(source).not.toMatch(/\bfrom\s*["'][^"']*\/(terminal|levels|verification)(?:\/|["'])/);
    }
  });
});
