import type { Command } from "../core/types";
import { parse } from "./parse";

export interface TerminalEntry {
  command: string;
  error: string[];
}

export interface TerminalSession {
  input: string;
  history: string[];
  cursor: number | null;
  draft: string;
  entries: TerminalEntry[];
}

export function initialTerminalSession(): TerminalSession {
  return { input: "", history: [], cursor: null, draft: "", entries: [] };
}

export function editInput(session: TerminalSession, input: string): TerminalSession {
  return { ...session, input };
}

export function previousCommand(session: TerminalSession): TerminalSession {
  if (session.history.length === 0) return session;
  const cursor = session.cursor === null
    ? session.history.length - 1
    : Math.max(0, session.cursor - 1);
  return {
    ...session,
    input: session.history[cursor]!,
    cursor,
    draft: session.cursor === null ? session.input : session.draft,
  };
}

export function nextCommand(session: TerminalSession): TerminalSession {
  if (session.cursor === null) return session;
  const cursor = session.cursor + 1;
  if (cursor === session.history.length) {
    return { ...session, input: session.draft, cursor: null };
  }
  return { ...session, input: session.history[cursor]!, cursor };
}

export function submitInput(
  session: TerminalSession,
  onCommand: (command: Command) => void,
): TerminalSession {
  const command = session.input.trim();
  if (command === "") return session;

  const parsed = parse(command);
  const error = "ok" in parsed ? parsed.output : [];
  if (!("ok" in parsed)) onCommand(parsed);

  return {
    input: "",
    history: [...session.history, command],
    cursor: null,
    draft: "",
    entries: [...session.entries, { command, error }],
  };
}
