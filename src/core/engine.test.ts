import { describe, expect, it } from "vitest";
import { execute } from "./engine";
import { emptyState, type Command } from "./types";

const ALL_KINDS: Command[] = [
  { kind: "commit", message: "hello" },
  { kind: "branch", name: "feature" },
  { kind: "switch", target: "main", detach: false },
  { kind: "checkout", target: "main" },
  { kind: "merge", branch: "feature" },
];

describe("execute", () => {
  it("xử lý được cả 5 kind và không bao giờ throw", () => {
    for (const command of ALL_KINDS) {
      const result = execute(emptyState(), command);
      expect(result.ok).toBe(true);
      expect(Array.isArray(result.output)).toBe(true);
      expect(result.state).toBeDefined();
    }
  });

  it("bốn seam staging luôn null ở v1", () => {
    const { state } = execute(emptyState(), { kind: "commit", message: "x" });
    expect(state.snapshot).toBeNull();
    expect(state.workingTree).toBeNull();
    expect(state.index).toBeNull();
    expect(state.conflicts).toBeNull();
  });

  it("lệnh không hợp lệ trả Result lỗi chứ không throw", () => {
    const bogus = { kind: "rebase" } as unknown as Command;
    const result = execute(emptyState(), bogus);
    expect(result.ok).toBe(false);
    expect(result.errorClass).toBe("UnknownCommand");
  });
});
