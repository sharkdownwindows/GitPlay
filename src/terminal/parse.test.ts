import { describe, expect, it } from "vitest";
import { parseCommand, tokenize } from "./parse";

describe("terminal/parse.ts", () => {
  it("tokenize tách đúng các tham số và giữ nguyên chuỗi trong dấu nháy kép / đơn", () => {
    expect(tokenize('git commit -m "first commit"')).toEqual([
      "git",
      "commit",
      "-m",
      "first commit",
    ]);
    expect(tokenize("git branch feature-1")).toEqual([
      "git",
      "branch",
      "feature-1",
    ]);
  });

  it("parse commit command với flag -m hoặc không flag", () => {
    expect(parseCommand('git commit -m "initial commit"')).toEqual({
      kind: "commit",
      message: "initial commit",
    });
    expect(parseCommand("commit")).toEqual({
      kind: "commit",
      message: undefined,
    });
  });

  it("parse branch command", () => {
    expect(parseCommand("git branch feature")).toEqual({
      kind: "branch",
      name: "feature",
    });
    expect(parseCommand("branch")).toEqual({
      kind: "branch",
      name: undefined,
    });
  });

  it("parse switch command với flag -d / --detach", () => {
    expect(parseCommand("git switch main")).toEqual({
      kind: "switch",
      target: "main",
      detach: false,
      create: false,
    });
    expect(parseCommand("git switch -d c1")).toEqual({
      kind: "switch",
      target: "c1",
      detach: true,
      create: false,
    });
  });

  it("parse switch command với flag -c / --create tạo branch mới", () => {
    expect(parseCommand("git switch -c feature")).toEqual({
      kind: "switch",
      target: "feature",
      detach: false,
      create: true,
    });
    expect(parseCommand("git switch --create new-branch")).toEqual({
      kind: "switch",
      target: "new-branch",
      detach: false,
      create: true,
    });
  });

  it("parse checkout command với flag -b tạo branch mới", () => {
    expect(parseCommand("git checkout feature")).toEqual({
      kind: "checkout",
      target: "feature",
      create: false,
    });
    expect(parseCommand("git checkout -b hotfix")).toEqual({
      kind: "checkout",
      target: "hotfix",
      create: true,
    });
  });

  it("parse merge command", () => {
    expect(parseCommand("git merge feature")).toEqual({
      kind: "merge",
      branch: "feature",
    });
  });

  it("trả về unknown cho lệnh rỗng hoặc không xác định", () => {
    expect(parseCommand("")).toEqual({ kind: "unknown" });
    expect(parseCommand("git status")).toEqual({ kind: "unknown" });
  });
});
