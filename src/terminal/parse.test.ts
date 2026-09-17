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
    });
  });

  it("parses git switch --detach", () => {
    expect(parse("git switch --detach C2")).toEqual({
      kind: "switch",
      target: "C2",
      detach: true,
    });
  });

  it("parses git checkout", () => {
    expect(parse("git checkout C2")).toEqual({
      kind: "checkout",
      target: "C2",
    });
  });

  it("parses git merge", () => {
    expect(parse("git merge feature")).toEqual({
      kind: "merge",
      branch: "feature",
    });
  });

  it("rejects empty input", () => {
    expect(parse("")).toEqual({
      errorClass: "UnknownCommand",
    });
  });

  it("rejects non-git command", () => {
    expect(parse("commit")).toEqual({
      errorClass: "UnknownCommand",
    });
  });

  it("rejects unknown subcommand", () => {
    expect(parse("git foobar")).toEqual({
      errorClass: "UnknownCommand",
    });
  });

  it("rejects missing commit message", () => {
    expect(parse("git commit -m")).toEqual({
      errorClass: "MissingArgument",
    });
  });

  it("rejects merge without branch", () => {
    expect(parse("git merge")).toEqual({
      errorClass: "MissingArgument",
    });
  });

  it("rejects switch without target", () => {
    expect(parse("git switch")).toEqual({
      errorClass: "MissingArgument",
    });
  });
});