import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CommandRefPanel } from "./CommandRefPanel";
import { commandReferences } from "./data";
import { MiniDiagram } from "./MiniDiagram";

describe("CommandRefPanel", () => {
  it("shows syntax, summary, effect, gotcha and real graphs for all five entries", () => {
    const html = renderToStaticMarkup(createElement(CommandRefPanel));
    expect(html.match(/<details\b/g)).toHaveLength(5);
    expect(html.match(/aria-label="Git commit graph"/g)).toHaveLength(10);
    for (const entry of commandReferences) {
      expect(html).toContain(entry.syntax.replaceAll('"', '&quot;'));
      expect(html).toContain(entry.description);
      expect(html).toContain(entry.effect);
      expect(html).toContain(`Gotcha: ${entry.gotcha}`);
    }
  });

  it("shows attached HEAD before checkout and detached HEAD afterward", () => {
    const checkout = commandReferences.find((entry) => entry.key === "checkout")!;
    const html = renderToStaticMarkup(createElement(MiniDiagram, { entry: checkout }));
    expect(html).toContain('aria-label="HEAD attached to main"');
    expect(html).toContain('aria-label="HEAD detached at c1"');
    expect(html).toContain('data-ref-kind="detached"');
  });
});
