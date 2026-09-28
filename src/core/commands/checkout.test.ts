import { describe, expect, it } from "vitest";
import { execute } from "../engine";
import { emptyState, type RepoState } from "../types";

function state(): RepoState {
  const repo = emptyState();
  repo.commits = {
    c1: { id: "c1", message: "root", parents: [], timestamp: "2020-01-01T00:00:00.000Z" },
    c2: { id: "c2", message: "main", parents: ["c1"], timestamp: "2020-01-02T00:00:00.000Z" },
  };
  repo.branches = { main: "c2", feature: "c1" };
  return repo;
}

describe("checkout", () => {
  it("attaches HEAD to an existing branch", () => {
    const initial = state();
    const result = execute(initial, { kind: "checkout", target: "feature", create: false });
    expect(result.ok).toBe(true);
    expect(result.state.head).toEqual({ detached: false, ref: "feature", commit: null });
    expect(result.state.branches).toEqual(initial.branches);
  });

  it("checks out a commit as detached HEAD with a warning", () => {
    const result = execute(state(), { kind: "checkout", target: "c1", create: false });
    expect(result.ok).toBe(true);
    expect(result.state.head).toEqual({ detached: true, ref: null, commit: "c1" });
    expect(result.output.join("\n")).toContain("detached HEAD");
  });

  it("creates a branch at current commit with -b", () => {
    const result = execute(state(), { kind: "checkout", target: "topic", create: true });
    expect(result.ok).toBe(true);
    expect(result.state.branches.topic).toBe("c2");
    expect(result.state.head).toEqual({ detached: false, ref: "topic", commit: null });
  });

  it("returns classified failures and leaves input unchanged", () => {
    const cases = [
      { target: "missing", create: false, errorClass: "PathspecNotFound" },
      { target: "feature", create: true, errorClass: "BranchAlreadyExists" },
      { target: "bad name", create: true, errorClass: "InvalidRefName" },
    ] as const;
    for (const testCase of cases) {
      const initial = state();
      const before = structuredClone(initial);
      const result = execute(initial, { kind: "checkout", target: testCase.target, create: testCase.create });
      expect(result).toMatchObject({ ok: false, errorClass: testCase.errorClass, state: initial });
      expect(result.output[0]?.length).toBeGreaterThan(0);
      expect(initial).toEqual(before);
    }
  });

  it("cannot create a branch in an unborn repository", () => {
    const initial = emptyState();
    expect(execute(initial, { kind: "checkout", target: "topic", create: true }))
      .toMatchObject({ ok: false, errorClass: "NoCommitsYet", state: initial });
  });
});
