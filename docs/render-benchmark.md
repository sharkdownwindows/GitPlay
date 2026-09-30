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
The animation target is p95 <= 16.7 ms. Nightly Verification run
[36685786989](https://github.com/sharkdownwindows/GitPlay/actions/runs/36685786989)
measured source SHA `4448efb8aaecea310266c3ab002b6928362db466` with headless
Chrome 154.0.8037.92 on Linux x64, Node 24 and Git 2.43.0. SVG render p95
was 32.3, 206.3 and 1744.9 ms at n=100, 1,000 and 10,000. Saturation began
at n=1,000. At n=200, 220 frame intervals had p95 16.7 ms. Browser layout
p95 for those four sizes was 0.3, 3.8, 19.0 and 0.5 ms respectively. These
numbers describe one headless CI run using Vite's development server; repeat
on the deployment browser and production build before treating the threshold
as a user-facing regression. The SVG extends far below the 1280x800 viewport
at larger n, so the render measurement covers DOM construction and browser
scheduling but cannot prove that every offscreen node was rasterized.

## Open follow-up: production build recheck

**Title:** Inspect graph animation frame budget at 200 commits

**Observation:** Ten measured 199-to-200-commit `GraphView` animations in
Nightly Verification produced 220 frame intervals with p95 16.7 ms, at the
16.7 ms target. GitHub issue [#47](https://github.com/sharkdownwindows/GitPlay/issues/47)
tracks a production-build recheck of an earlier local 16.8 ms result. The CI
measurement used Chrome 154 headless on Linux x64, viewport 1280x800 at 1x;
raw samples and metadata are in the workflow artifact.

**Reproduction:** The current `npm run bench:browser` starts Vite's development
server. Measure the equivalent animation using the production bundle, then
repeat on a visible browser and deployment hardware to distinguish display
cadence and headless scheduling from application work. Do not optimize until
the excess is reproduced there.
