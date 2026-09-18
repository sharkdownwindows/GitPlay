import type {
  Command,
  ErrorClass,
  ParseError,
} from "../core/types";

export type ParseResult = Command | ParseError;

/**
 * Tạo ParseError đúng Contract 1.
 *
 * errorClass là phần quan trọng nhất vì differential test
 * dùng nó làm hard gate.
 */
function parseError(
  errorClass: ErrorClass,
  message: string,
): ParseError {
  return {
    ok: false,
    output: [message],
    errorClass,
  };
}

/**
 * Tách command thành token nhưng vẫn giữ nội dung trong quote
 * thành một token.
 *
 * Ví dụ:
 * git commit -m "hello world"
 *
 * =>
 * ["git", "commit", "-m", "hello world"]
 */
function tokenize(input: string): string[] {
  const tokens: string[] = [];

  const regex = /"([^"]*)"|'([^']*)'|(\S+)/g;

  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    const token = match[1] ?? match[2] ?? match[3];

if (token !== undefined) {
  tokens.push(token);
  }
}

  return tokens;
}

/**
 * Parse raw terminal input thành Command.
 *
 * Parser chỉ kiểm tra CÚ PHÁP.
 *
 * Parser KHÔNG kiểm tra:
 * - branch có tồn tại không
 * - commit có tồn tại không
 * - merge có hợp lệ với state không
 *
 * Những việc đó thuộc engine.
 */
export function parse(input: string): ParseResult {
  const trimmed = input.trim();

  // Input rỗng.
  if (!trimmed) {
    return parseError(
      "NotGitCommand",
      "fatal: not a git command",
    );
  }

  const tokens = tokenize(trimmed);

  // Token đầu tiên bắt buộc là "git".
  if (tokens[0] !== "git") {
    return parseError(
      "NotGitCommand",
      "fatal: not a git command",
    );
  }

  // Có "git" nhưng chưa có subcommand.
  const subcommand = tokens[1];

  if (!subcommand) {
    return parseError(
      "UnknownSubcommand",
      "fatal: missing git subcommand",
    );
  }

  const args = tokens.slice(2);

  switch (subcommand) {
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
      return parseError(
        "UnknownSubcommand",
        `git: '${subcommand}' is not a supported command`,
      );
  }
}

/**
 * Supported:
 *
 * git commit
 * git commit -m "message"
 */
function parseCommit(args: string[]): ParseResult {
  // git commit
  if (args.length === 0) {
    return {
      kind: "commit",
    };
  }

  // Chỉ hỗ trợ -m.
  if (args[0] !== "-m") {
    return parseError(
      "UnknownCommand",
      "fatal: unsupported commit syntax",
    );
  }

  // git commit -m
  if (args.length < 2) {
    return parseError(
      "MissingArgument",
      "fatal: commit message is required after -m",
    );
  }

  // Sau tokenizer, message trong quote phải chỉ còn 1 token.
  if (args.length > 2) {
    return parseError(
      "UnknownCommand",
      "fatal: unsupported commit syntax",
    );
  }

  return {
    kind: "commit",
    message: args[1],
  };
}

/**
 * Supported:
 *
 * git branch
 * git branch <name>
 */
function parseBranch(args: string[]): ParseResult {
  // git branch
  if (args.length === 0) {
    return {
      kind: "branch",
    };
  }

  // git branch feature
  if (args.length === 1) {
    return {
      kind: "branch",
      name: args[0],
    };
  }

  return parseError(
    "UnknownCommand",
    "fatal: unsupported branch syntax",
  );
}

/**
 * Supported:
 *
 * git switch <branch>
 * git switch -c <branch>
 * git switch --detach <commit>
 */
function parseSwitch(args: string[]): ParseResult {
  if (args.length === 0) {
    return parseError(
      "MissingArgument",
      "fatal: you must specify a target",
    );
  }

  if (args[0] === "-c") {
    if (args.length < 2) {
      return parseError(
        "MissingArgument",
        "fatal: you must specify a branch name",
      );
    }

    if (args.length > 2) {
      return parseError(
        "UnknownCommand",
        "fatal: unsupported switch syntax",
      );
    }

    return {
      kind: "switch",
      target: args[1]!,
      detach: false,
      create: true,
    };
  }

  if (args[0] === "--detach") {
    if (args.length < 2) {
      return parseError(
        "MissingArgument",
        "fatal: you must specify a target",
      );
    }

    if (args.length > 2) {
      return parseError(
        "UnknownCommand",
        "fatal: unsupported switch syntax",
      );
    }

    return {
      kind: "switch",
      target: args[1]!,
      detach: true,
      create: false,
    };
  }

  if (args.length === 1) {
    return {
      kind: "switch",
      target: args[0]!,
      detach: false,
      create: false,
    };
  }

  return parseError(
    "UnknownCommand",
    "fatal: unsupported switch syntax",
  );
}
function parseCheckout(args: string[]): ParseResult {
  if (args.length === 0) {
    return parseError(
      "MissingArgument",
      "fatal: you must specify a target",
    );
  }

  // git checkout -b feature
  if (args[0] === "-b") {
    if (args.length < 2) {
      return parseError(
        "MissingArgument",
        "fatal: you must specify a branch name",
      );
    }

    if (args.length > 2) {
      return parseError(
        "UnknownCommand",
        "fatal: unsupported checkout syntax",
      );
    }

    return {
      kind: "checkout",
      target: args[1]!,
      create: true,
    };
  }

  // git checkout C2
  // git checkout main
  if (args.length === 1) {
    return {
      kind: "checkout",
      target: args[0]!,
      create: false,
    };
  }

  return parseError(
    "UnknownCommand",
    "fatal: unsupported checkout syntax",
  );
}

/**
 * Supported:
 *
 * git merge <branch>
 */
function parseMerge(args: string[]): ParseResult {
  if (args.length === 0) {
    return parseError(
      "MissingArgument",
      "fatal: you must specify a branch",
    );
  }

  if (args.length > 1) {
    return parseError(
      "UnknownCommand",
      "fatal: unsupported merge syntax",
    );
  }

  return {
    kind: "merge",
    branch: args[0]!,
  };
}