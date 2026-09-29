import { useRef, useState, type KeyboardEvent } from "react";
import type { Command } from "../core/types";
import {
  editInput,
  initialTerminalSession,
  nextCommand,
  previousCommand,
  submitInput,
} from "./session";

interface Props {
  onCommand: (command: Command) => boolean | void;
  output: readonly string[];
  disabled?: boolean;
}

export function Terminal({ onCommand, output, disabled = false }: Props) {
  const [session, setSession] = useState(initialTerminalSession);
  const sessionRef = useRef(session);

  function updateSession(next: typeof session): void {
    sessionRef.current = next;
    setSession(next);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") {
      event.preventDefault();
      if (disabled) return;
      updateSession(submitInput(sessionRef.current, onCommand));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      updateSession(previousCommand(sessionRef.current));
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      updateSession(nextCommand(sessionRef.current));
    }
  }

  return (
    <section aria-label="Git terminal" className="rounded border border-neutral-700 bg-neutral-950 p-4 font-mono text-sm text-neutral-100">
      <div role="log" aria-label="Command history" className="space-y-1 whitespace-pre-wrap">
        {session.entries.map((entry, index) => (
          <div key={index}>
            <div>$ {entry.command}</div>
            {entry.error.map((line, lineIndex) => <div key={lineIndex}>{line}</div>)}
          </div>
        ))}
      </div>
      <div role="log" aria-label="Command output" className="whitespace-pre-wrap">
        {output.map((line, index) => <div key={index}>{line}</div>)}
      </div>
      <label className="mt-3 flex gap-2">
        <span aria-hidden="true">$</span>
        <input
          type="text"
          disabled={disabled}
          aria-label="Git command"
          autoComplete="off"
          spellCheck={false}
          value={session.input}
          onChange={(event) => updateSession(editInput(sessionRef.current, event.target.value))}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 bg-transparent outline-none"
        />
      </label>
    </section>
  );
}
