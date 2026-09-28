import { useState, type KeyboardEvent } from "react";
import type { Command } from "../core/types";
import {
  editInput,
  initialTerminalSession,
  nextCommand,
  previousCommand,
  submitInput,
} from "./session";

interface Props {
  onCommand: (command: Command) => void;
  output: readonly string[];
}

export function Terminal({ onCommand, output }: Props) {
  const [session, setSession] = useState(initialTerminalSession);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") {
      event.preventDefault();
      setSession(submitInput(session, onCommand));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSession(previousCommand);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setSession(nextCommand);
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
          aria-label="Git command"
          autoComplete="off"
          spellCheck={false}
          value={session.input}
          onChange={(event) => setSession((current) => editInput(current, event.target.value))}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 bg-transparent outline-none"
        />
      </label>
    </section>
  );
}
