# GitScope engineering instructions

## Objective

Build a reliable educational Git simulator for a six-person,
three-week university project.

GitScope is a Tier 1-only product. Remaining work focuses on UI polish,
user evaluation, stability, and the demo:
- Git engine for commit, branch, switch, checkout, merge
- terminal
- graph visualizer
- levels and automatic goal checking
- undo/redo
- local progress
- differential testing
- layout benchmark

Do not implement `add`, authentication, a server, or synchronization.

## Source of truth

Before implementing a milestone, read:
- docs/PRD.md
- docs/TECHNICAL_OVERVIEW.md
- docs/ISSUES.md
- the relevant milestone document
- existing code and tests

Repository contracts and accepted requirements take precedence over
newly written tests when they conflict.

## Architecture constraints

- Core engine must not depend on React, DOM, browser APIs or UI modules.
- Parser validates syntax; engine validates repository state.
- Layout must be deterministic and must not modify RepoState.
- UI state changes must go through the application store.
- Progress is stored locally in localStorage; there is no backend.
- Do not add dependencies unless necessary.
- Do not refactor unrelated code.
- Do not implement speculative features.

## Workflow

For each task:

1. Inspect the current implementation.
2. State the root cause or missing behavior.
3. Make the smallest correct change.
4. Add or update focused tests.
5. Run relevant tests.
6. Run typecheck and build.
7. Review the final diff for regressions.

If validation fails, fix it before starting another milestone.

## Validation

Normal validation:

- npm run typecheck
- npm test
- npm run build
- npm run lint:imports

Run when relevant:

- npm run diff:quick
- npm run bench

## Completion report

At the end of a task report:

- files changed
- behavior implemented
- tests executed and results
- remaining risks
- requirements intentionally not implemented
