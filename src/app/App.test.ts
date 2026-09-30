import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./App";
import { countCompletedLevels, nextTabIndex } from "./tabNavigation";

describe("App shell navigation", () => {
  it("wires the four tabs to one labelled panel with roving tabindex", () => {
    const html = renderToStaticMarkup(createElement(App));

    expect(html.match(/role="tab"/g)).toHaveLength(4);
    expect(html).toContain('id="practice-tab"');
    expect(html).toContain('aria-controls="practice-panel"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('tabindex="0"');
    expect(html.match(/tabindex="-1"/g)).toHaveLength(3);
    expect(html).toContain('role="tabpanel"');
    expect(html).toContain('aria-labelledby="practice-tab"');
    expect(html).toContain('href="#terminal-input"');
  });

  it("moves focus indexes with arrows and Home/End without activating a tab", () => {
    expect(nextTabIndex(0, "ArrowRight", 4)).toBe(1);
    expect(nextTabIndex(3, "ArrowRight", 4)).toBe(0);
    expect(nextTabIndex(0, "ArrowLeft", 4)).toBe(3);
    expect(nextTabIndex(2, "Home", 4)).toBe(0);
    expect(nextTabIndex(1, "End", 4)).toBe(3);
    // Activation is handled separately from focus movement in App.
    expect(nextTabIndex(1, "Enter", 4)).toBeNull();
  });

  it("counts only progress records that belong to the eight current levels", () => {
    expect(countCompletedLevels({
      "01-first-commit": {
        levelId: "01-first-commit",
        completedAt: "2026-09-30T00:00:00.000Z",
        commandCount: 1,
      },
      removed: {
        levelId: "removed",
        completedAt: "2026-09-30T00:00:00.000Z",
        commandCount: 1,
      },
    })).toBe(1);
  });
});
