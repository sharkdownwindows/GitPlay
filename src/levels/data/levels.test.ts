import { describe, expect, it } from "vitest";
import { execute } from "../../core/engine";
import { emptyState, type CommandKind, type RepoState } from "../../core/types";
import { parse } from "../../terminal/parse";
import { check } from "../check";
import type { RepoShape } from "../schema";
import { levels } from ".";

function repo(shape: RepoShape): RepoState {
  return {
    ...emptyState(),
    commits: Object.fromEntries(Object.entries(shape.parents).map(([id, parents], index) => [
      id, { id, parents: [...parents], message: `seed ${index}`,
        timestamp: new Date(Date.UTC(2020, 0, 1) + index * 1000).toISOString() },
    ])),
    branches: { ...shape.branches },
    head: { ...shape.head },
  };
}

const solutions: readonly (readonly (readonly string[])[])[] = [
  [["git commit -m first"], ["git commit"]],
  [["git branch feature"], ["git switch -c feature", "git switch main"]],
  [["git switch feature"], ["git checkout feature"]],
  [["git checkout first"], ["git switch --detach first"]],
];

describe("levels 01–04", () => {
  it("contains four valid, ordered Level and RepoShape values", () => {
    expect(levels.map((level) => level.order)).toEqual([1, 2, 3, 4]);
    expect(new Set(levels.map((level) => level.id)).size).toBe(4);
    const kinds = new Set<CommandKind>(["commit", "branch", "switch", "checkout", "merge"]);
    for (const level of levels) {
      expect(level.title.trim()).not.toBe("");
      expect(level.goal.trim()).not.toBe("");
      expect(level.allowed.length).toBeGreaterThan(0);
      expect(level.allowed.every((kind) => kinds.has(kind))).toBe(true);
      expect(check(repo(level.initial), level.initial)).toBe(true);
      expect(level.target).not.toBeNull();
      expect(check(repo(level.target!), level.target)).toBe(true);
    }
  });

  it.each([0, 1, 2, 3])("accepts two parser-and-engine solutions for level %i", (index) => {
    const level = levels[index]!;
    const paths = solutions[index]!;
    expect(paths).toHaveLength(2);
    expect(paths[0]).not.toEqual(paths[1]);
    for (const path of paths) {
      let state = repo(level.initial);
      for (const input of path) {
        const command = parse(input);
        expect("kind" in command, input).toBe(true);
        if (!("kind" in command)) throw new Error(`Cannot parse ${input}`);
        expect(level.allowed).toContain(command.kind);
        const result = execute(state, command);
        expect(result.ok, input).toBe(true);
        state = result.state;
      }
      expect(check(state, level.target)).toBe(true);
    }
  });

  it.each([0, 1, 2, 3])("rejects unsolved and structurally wrong states for level %i", (index) => {
    const level = levels[index]!;
    expect(check(repo(level.initial), level.target)).toBe(false);
    const target = repo(level.target!);
    const firstId = Object.keys(target.commits)[0]!;
    const wrong = { ...target, branches: { ...target.branches, extra: firstId } };
    expect(check(wrong, level.target)).toBe(false);
  });
});
