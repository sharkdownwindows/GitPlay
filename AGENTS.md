# GitScope engineering instructions

## Objective

Build a reliable educational Git simulator for a six-person,
three-week university project.

Tier 1 is the priority:
- Git engine for commit, branch, switch, checkout, merge
- terminal
- graph visualizer
- levels and automatic goal checking
- undo/redo
- local progress
- differential testing
- layout benchmark

Tier 2 account and server synchronization are optional.
Do not expand Tier 2 before the M4 gate passes.

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
- Tier 1 must run without the backend.
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

Do not run `npm run check:tier1` in the working repository because
the script deletes Tier 2 directories. Run it only in CI or a disposable
clean worktree.

## Completion report

At the end of a task report:

- files changed
- behavior implemented
- tests executed and results
- remaining risks
- requirements intentionally not implemented
