import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { generateSyntheticDag } from "./synth";
import { layout } from "../../src/viz/layout";
import { GraphView } from "../../src/viz/GraphView";

const params = new URLSearchParams(location.search);
const n = Number(params.get("n"));
const mode = params.get("mode");
const seed = 42;
const root = createRoot(document.getElementById("root")!);
const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const afterPaint = async () => { await nextFrame(); await nextFrame(); };

async function measureRender(): Promise<{ render: number[]; layout: number[] }> {
  const state = generateSyntheticDag(n, seed);
  const render: number[] = [];
  const layouts: number[] = [];
  for (let i = 0; i < 6; i++) {
    flushSync(() => root.render(null));
    const layoutStart = performance.now();
    layout(state);
    const layoutMs = performance.now() - layoutStart;
    const start = performance.now();
    flushSync(() => root.render(createElement(GraphView, { state })));
    await afterPaint();
    if (i > 0) { render.push(performance.now() - start); layouts.push(layoutMs); }
  }
  return { render, layout: layouts };
}

async function measureFrames(): Promise<{ frame: number[]; layout: number[] }> {
  const before = generateSyntheticDag(n - 1, seed);
  const after = generateSyntheticDag(n, seed);
  const frames: number[] = [];
  const layouts: number[] = [];
  for (let i = 0; i < 12; i++) {
    flushSync(() => root.render(createElement(GraphView, { state: before })));
    await afterPaint();
    const layoutStart = performance.now();
    layout(after);
    const layoutMs = performance.now() - layoutStart;
    let last = performance.now();
    const samples: number[] = [];
    const start = performance.now();
    flushSync(() => root.render(createElement(GraphView, { state: after })));
    while (performance.now() - start < 350) {
      await new Promise<void>((resolve) => requestAnimationFrame((time) => {
        samples.push(time - last);
        last = time;
        resolve();
      }));
    }
    if (i >= 2) { frames.push(...samples); layouts.push(layoutMs); }
  }
  return { frame: frames, layout: layouts };
}

void (async () => {
  try {
    const result = mode === "frame" ? await measureFrames() : await measureRender();
    document.body.dataset.result = JSON.stringify({ ok: true, ...result });
  } catch (error) {
    document.body.dataset.result = JSON.stringify({ ok: false, error: String(error) });
  }
})();
