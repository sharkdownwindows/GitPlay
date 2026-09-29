# Browser render benchmark (#49, #50)

Run `npm run bench:browser` from the repository root with Chrome installed. Set
`GITSCOPE_BROWSER` to another Chromium executable if needed. The command starts
a local Vite server and an isolated headless Chrome profile, measures the real
`GraphView` SVG with deterministic synthetic DAGs (seed 42), and writes raw
samples and environment metadata to `harness/bench/browser-results.json`.
`npm run report` includes browser series only when that file's commit SHA matches
the code commit used by the differential run. The report keeps `layout()`,
`SVG render`, and `animation frame` as separate series.

For SVG render, each size has one warm-up and five fresh DOM mounts. A sample
starts before React's synchronous commit and ends after two animation frames,
so it includes browser rendering and paint scheduling. The layout baseline is
measured separately before each mount; it is not subtracted from render time.
For n=200, two warm-ups precede ten 350 ms animations from a 199-commit graph
to a 200-commit graph. `requestAnimationFrame` timestamps provide frame
intervals, including the first render interval. The raw file records all
samples. Each browser case has a 30-second timeout, recorded as `timeout`
rather than as a made-up scaling point.

The observed saturation rule for SVG render is p95 > 100 ms or timeout.
The animation target is p95 <= 16.7 ms. The run on 2026-09-29 at
`5c3084e93ca5d772a5d0e89bf0ce3384b1890d73` used headless Chrome
154.0.8037.57 on Windows 10.0.26200 x64, Node v24.16.0 and Git
2.31.1.windows.1. SVG render p95 was 32.6, 150.3 and 1613.5 ms at n=100,
1,000 and 10,000. Saturation began at n=1,000. At n=200, 215 frame
intervals had p95 16.8 ms. Browser layout p95 for those four sizes was
0.3, 1.7, 17.9 and 0.4 ms respectively. These numbers describe one local
headless run using Vite's development server; repeat on the deployment browser
and hardware before treating the threshold crossing as a user-facing regression.
The SVG extends far below the 1280x800 viewport at larger n, so the render
measurement covers DOM construction and browser scheduling but cannot prove
that every offscreen node was rasterized.

## Draft optimization issue (not posted)

**Title:** Inspect graph animation frame budget at 200 commits

**Observation:** Ten measured 199-to-200-commit `GraphView` animations produced
215 frame intervals with p95 16.8 ms, slightly above the 16.7 ms target. The
separately measured layout p95 was 0.4 ms. Chrome 154 headless, Windows
10.0.26200 x64, viewport 1280x800 at 1x; raw samples and metadata are in
`harness/bench/browser-results.json`.

**Reproduction:** On this commit run `npm run bench:browser`; inspect the
`frame` and `layout` arrays in the output JSON. Repeat on a visible browser
and deployment build to distinguish display cadence and headless scheduling
from application work. Do not optimize until the excess is reproduced there.
