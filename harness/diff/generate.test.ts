import { describe, expect, it } from "vitest";
import { ACTIONS, FIXTURES, generateSequences } from "./generate";

describe("fixed exhaustive command generation", () => {
  it("enumerates every suffix of length zero through two for each fixture", () => {
    const cases = generateSequences(2);
    expect(cases).toHaveLength(FIXTURES.length * (1 + ACTIONS.length + ACTIONS.length ** 2));
    expect(cases).toHaveLength(482);
    expect(cases).toEqual(generateSequences(2));
    expect(new Set(cases.map((item) => JSON.stringify(item.commands))).size).toBe(cases.length);
    expect(cases.every((item) => item.commands.length === item.setupLength + item.suffix.length)).toBe(true);
    expect(new Set(cases.flatMap((item) => item.suffix.map((command) => command.kind))))
      .toEqual(new Set(["commit", "branch", "switch", "checkout", "merge"]));
  });

  it("retains invalid actions and all merge outcomes", () => {
    const cases = generateSequences(2);
    expect(cases.some((item) => item.fixture === "empty" && item.suffix.some((command) =>
      command.kind === "branch" && command.name === "--list"))).toBe(true);
    expect(cases.some((item) => item.fixture === "empty" && item.suffix.some((command) =>
      command.kind === "merge" && command.branch === "missing"))).toBe(true);
    expect(cases.some((item) => item.fixture === "fork" && item.suffix.some((command) =>
      command.kind === "merge" && command.branch === "feature"))).toBe(true);
    expect(cases.some((item) => item.fixture === "fork" && item.suffix.some((command) =>
      command.kind === "merge" && command.branch === "main"))).toBe(true);
  });
});
