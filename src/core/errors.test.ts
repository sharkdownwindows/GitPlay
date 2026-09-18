import { describe, expect, it } from "vitest";
import { ERROR_TEXT, errorText } from "./errors";

describe("errorText", () => {
  it("formats NotGitCommand", () => {
    expect(
      errorText("NotGitCommand", "foo"),
    ).toBe("foo: command not found");
  });

  it("formats UnknownSubcommand", () => {
    expect(
      errorText("UnknownSubcommand", "foobar"),
    ).toBe(
      "git: 'foobar' is not a git command. See 'git --help'.",
    );
  });

  it("formats BranchAlreadyExists", () => {
    expect(
      errorText("BranchAlreadyExists", "feature"),
    ).toBe(
      "fatal: a branch named 'feature' already exists",
    );
  });

  it("formats InvalidRefName", () => {
    expect(
      errorText("InvalidRefName", "bad name"),
    ).toBe(
      "fatal: 'bad name' is not a valid branch name",
    );
  });

  it("formats PathspecNotFound", () => {
    expect(
      errorText("PathspecNotFound", "does-not-exist"),
    ).toBe(
      "error: pathspec 'does-not-exist' did not match any file(s) known to git",
    );
  });

  it("has no empty error messages", () => {
    for (const message of Object.values(ERROR_TEXT)) {
      expect(message.trim().length).toBeGreaterThan(0);
    }
  });
});