import { describe, expect, it } from "vitest";
import { parse } from "./parse";

describe("parse", () => {
  it("parses git commit", () => {
    expect(parse("git commit")).toEqual({
      kind: "commit",
    });
  });

  it("parses git commit with message", () => {
    expect(parse('git commit -m "hello"')).toEqual({
      kind: "commit",
      message: "hello",
    });
  });

  it("parses quoted commit message with spaces", () => {
    expect(parse('git commit -m "hello world"')).toEqual({
      kind: "commit",
      message: "hello world",
    });
  });

  it("parses git branch", () => {
    expect(parse("git branch")).toEqual({
      kind: "branch",
    });
  });

  it("parses git branch with name", () => {
    expect(parse("git branch feature")).toEqual({
      kind: "branch",
      name: "feature",
    });
  });

  it("parses git switch", () => {
    expect(parse("git switch main")).toEqual({
      kind: "switch",
      target: "main",
      detach: false,
      create: false,
    });
  });

  it("parses git switch --detach", () => {
    expect(parse("git switch --detach C2")).toEqual({
      kind: "switch",
      target: "C2",
      detach: true,
      create: false,
    });
  });

  it("parses git switch -c", () => {
    expect(parse("git switch -c feature")).toEqual({
      kind: "switch",
      target: "feature",
      detach: false,
      create: true,
    });
  });

  it("parses git checkout", () => {
    expect(parse("git checkout C2")).toEqual({
      kind: "checkout",
      target: "C2",
      create: false,
    });
  });

  it("parses git checkout -b", () => {
    expect(parse("git checkout -b feature")).toEqual({
      kind: "checkout",
      target: "feature",
      create: true,
    });
  });

  it("parses git merge", () => {
    expect(parse("git merge feature")).toEqual({
      kind: "merge",
      branch: "feature",
    });
  });

  it("rejects empty input", () => {
    expect(parse("")).toMatchObject({
      ok: false,
      errorClass: "NotGitCommand",
    });
  });

  it("rejects non-git command", () => {
    expect(parse("commit")).toMatchObject({
      ok: false,
      errorClass: "NotGitCommand",
    });
  });

  it("rejects unknown subcommand", () => {
    expect(parse("git foobar")).toMatchObject({
      ok: false,
      errorClass: "UnknownSubcommand",
    });
  });

  it("rejects missing commit message", () => {
    expect(parse("git commit -m")).toMatchObject({
      ok: false,
      errorClass: "MissingArgument",
    });
  });

  it("rejects merge without branch", () => {
    expect(parse("git merge")).toMatchObject({
      ok: false,
      errorClass: "MissingArgument",
    });
  });

  it("rejects switch without target", () => {
    expect(parse("git switch")).toMatchObject({
      ok: false,
      errorClass: "MissingArgument",
    });
  });

  it("rejects switch -c without branch name", () => {
    expect(parse("git switch -c")).toMatchObject({
      ok: false,
      errorClass: "MissingArgument",
    });
  });

  it("rejects checkout -b without branch name", () => {
    expect(parse("git checkout -b")).toMatchObject({
      ok: false,
      errorClass: "MissingArgument",
    });
  });

  it("trims surrounding whitespace", () => {
    expect(parse("   git branch feature   ")).toEqual({
      kind: "branch",
      name: "feature",
    });
  });
});