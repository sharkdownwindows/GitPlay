import type { Command, ErrorClass } from "../core/types";

export interface ParseError {
  errorClass: ErrorClass;
}

export type ParseResult = Command | ParseError;

function parseError(errorClass: ErrorClass): ParseError {
  return { errorClass };
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  const regex = /"([^"]*)"|'([^']*)'|(\S+)/g;

  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    tokens.push(match[1] ?? match[2] ?? match[3]);
  }

  return tokens;
}

export function parse(input: string): ParseResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return parseError("UnknownCommand");
  }

  const tokens = tokenize(trimmed);

  if (tokens[0] !== "git") {
    return parseError("UnknownCommand");
  }

  const command = tokens[1];

  if (!command) {
    return parseError("UnknownCommand");
  }

  const args = tokens.slice(2);

  switch (command) {
    case "commit":
      return parseCommit(args);

    case "branch":
      return parseBranch(args);

    case "switch":
      return parseSwitch(args);

    case "checkout":
      return parseCheckout(args);

    case "merge":
      return parseMerge(args);

    default:
      return parseError("UnknownCommand");
  }
}

function parseCommit(args: string[]): ParseResult {
  if (args.length === 0) {
    return { kind: "commit" };
  }

  if (args[0] !== "-m") {
    return parseError("UnknownCommand");
  }

  if (args.length < 2) {
    return parseError("MissingArgument");
  }

  if (args.length > 2) {
    return parseError("UnknownCommand");
  }

  return {
    kind: "commit",
    message: args[1],
  };
}

function parseBranch(args: string[]): ParseResult {
  if (args.length === 0) {
    return { kind: "branch" };
  }

  if (args.length === 1) {
    return {
      kind: "branch",
      name: args[0],
    };
  }

  return parseError("UnknownCommand");
}

function parseSwitch(args: string[]): ParseResult {
  if (args.length === 0) {
    return parseError("MissingArgument");
  }

  if (args[0] === "--detach") {
    if (args.length < 2) {
      return parseError("MissingArgument");
    }

    if (args.length > 2) {
      return parseError("UnknownCommand");
    }

    return {
      kind: "switch",
      target: args[1],
      detach: true,
    };
  }

  if (args.length > 1) {
    return parseError("UnknownCommand");
  }

  return {
    kind: "switch",
    target: args[0],
    detach: false,
  };
}

function parseCheckout(args: string[]): ParseResult {
  if (args.length === 0) {
    return parseError("MissingArgument");
  }

  if (args.length > 1) {
    return parseError("UnknownCommand");
  }

  return {
    kind: "checkout",
    target: args[0],
  };
}

function parseMerge(args: string[]): ParseResult {
  if (args.length === 0) {
    return parseError("MissingArgument");
  }

  if (args.length > 1) {
    return parseError("UnknownCommand");
  }

  return {
    kind: "merge",
    branch: args[0],
  };
}