import type { AbstractCommand } from "./adapter";

/** Fixed action alphabet. Invalid transitions remain in the search space. */
export const ACTIONS = [
  "commit", "branch-feature", "branch-list", "branch-invalid",
  "switch-main", "switch-feature", "switch-create", "switch-missing",
  "checkout-main", "checkout-c1", "checkout-create", "checkout-missing",
  "merge-main", "merge-feature", "merge-missing",
] as const;

export interface Fixture { name: string; setup: AbstractCommand[] }
export const FIXTURES: readonly Fixture[] = [
  { name: "empty", setup: [] },
  { name: "fork", setup: [
    { kind: "commit", message: "C0" },
    { kind: "branch", name: "feature" },
    { kind: "switch", target: "feature", detach: false, create: false },
    { kind: "commit", message: "C1" },
    { kind: "checkout", target: "main", create: false },
  ] },
];

export interface DifferentialCase { fixture: string; setupLength: number; suffix: AbstractCommand[]; commands: AbstractCommand[] }

function action(key: typeof ACTIONS[number], position: number): AbstractCommand {
  switch (key) {
    case "commit": return { kind: "commit", message: `C${position + 2}` };
    case "branch-feature": return { kind: "branch", name: "feature" };
    case "branch-list": return { kind: "branch" };
    case "branch-invalid": return { kind: "branch", name: "--list" };
    case "switch-main": return { kind: "switch", target: "main", create: false, detach: false };
    case "switch-feature": return { kind: "switch", target: "feature", create: false, detach: false };
    case "switch-create": return { kind: "switch", target: "topic", create: true, detach: false };
    case "switch-missing": return { kind: "switch", target: "--help", create: false, detach: false };
    case "checkout-main": return { kind: "checkout", target: "main", create: false };
    case "checkout-c1": return { kind: "checkout", target: "c1", create: false };
    case "checkout-create": return { kind: "checkout", target: "topic", create: true };
    case "checkout-missing": return { kind: "checkout", target: "--help", create: false };
    case "merge-main": return { kind: "merge", branch: "main" };
    case "merge-feature": return { kind: "merge", branch: "feature" };
    case "merge-missing": return { kind: "merge", branch: "missing" };
  }
}

/** Exhaustive Cartesian products of the alphabet, including the empty suffix. */
export function generateSequences(depth: number): DifferentialCase[] {
  if (!Number.isInteger(depth) || depth < 0) throw new RangeError("depth must be non-negative");
  const cases: DifferentialCase[] = [];
  for (const fixture of FIXTURES) {
    let frontier: AbstractCommand[][] = [[]];
    for (let level = 0; level <= depth; level++) {
      for (const suffix of frontier) cases.push({ fixture: fixture.name, setupLength: fixture.setup.length,
        suffix, commands: [...fixture.setup, ...suffix] });
      frontier = frontier.flatMap((suffix) => ACTIONS.map((key) => [...suffix, action(key, suffix.length)]));
    }
  }
  return cases;
}
