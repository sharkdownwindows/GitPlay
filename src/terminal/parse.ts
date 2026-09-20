import type { Command } from "../core/types";

/**
 * Phân tích chuỗi dòng lệnh thành Command object.
 * Hỗ trợ các lệnh: commit, branch, switch, checkout, merge (có hoặc không có tiền tố `git`).
 */

export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(input)) !== null) {
    if (match[1] !== undefined) {
      tokens.push(match[1]);
    } else if (match[2] !== undefined) {
      tokens.push(match[2]);
    } else {
      tokens.push(match[0]);
    }
  }
  return tokens;
}

export function parseCommand(input: string): Command {
  const rawTokens = tokenize(input.trim());
  if (rawTokens.length === 0) {
    return { kind: "unknown" } as unknown as Command;
  }

  // Bỏ qua tiền tố "git" nếu người dùng gõ `git commit`, `git branch`...
  const firstToken = rawTokens[0];
  const tokens =
    firstToken && firstToken.toLowerCase() === "git"
      ? rawTokens.slice(1)
      : rawTokens;

  if (tokens.length === 0) {
    return { kind: "unknown" } as unknown as Command;
  }

  const verb = (tokens[0] ?? "").toLowerCase();

  switch (verb) {
    case "commit": {
      let message: string | undefined = undefined;
      for (let i = 1; i < tokens.length; i++) {
        if (tokens[i] === "-m" || tokens[i] === "--message") {
          message = tokens[i + 1] ?? "";
          break;
        }
      }
      return { kind: "commit", message };
    }

    case "branch": {
      const name = tokens[1];
      return { kind: "branch", name };
    }

    case "switch": {
      let detach = false;
      let target = "";
      for (let i = 1; i < tokens.length; i++) {
        const token = tokens[i] ?? "";
        if (token === "-d" || token === "--detach") {
          detach = true;
        } else if (!target) {
          target = token;
        }
      }
      return { kind: "switch", target, detach };
    }

    case "checkout": {
      const target = tokens[1] ?? "";
      return { kind: "checkout", target };
    }

    case "merge": {
      const branchName = tokens[1] ?? "";
      return { kind: "merge", branch: branchName };
    }

    default:
      return { kind: "unknown" } as unknown as Command;
  }
}
