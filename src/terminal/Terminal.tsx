import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

interface TerminalProps {
  output: string[];
  onExecute: (input: string) => void;
}

export function Terminal({
  output,
  onExecute,
}: TerminalProps) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] =
    useState<number | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Tự cuộn xuống cuối mỗi khi có output mới.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [output]);

  function executeCurrentInput() {
    const command = input.trim();

    // Không chạy command rỗng.
    if (!command) {
      return;
    }

    onExecute(command);

    // Giữ cả command trùng nhau.
    setHistory((previous) => [
      ...previous,
      command,
    ]);

    // Sau Enter: clear input và thoát chế độ browse history.
    setInput("");
    setHistoryIndex(null);
  }

  function historyUp() {
    if (history.length === 0) {
      return;
    }

    const nextIndex =
      historyIndex === null
        ? history.length - 1
        : Math.max(0, historyIndex - 1);

    setHistoryIndex(nextIndex);
    setInput(history[nextIndex] ?? "");
  }

  function historyDown() {
    if (historyIndex === null) {
      return;
    }

    // Đi qua command mới nhất -> trở về input rỗng.
    if (historyIndex >= history.length - 1) {
      setHistoryIndex(null);
      setInput("");
      return;
    }

    const nextIndex = historyIndex + 1;

    setHistoryIndex(nextIndex);
    setInput(history[nextIndex] ?? "");
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    switch (event.key) {
      case "Enter":
        event.preventDefault();
        executeCurrentInput();
        break;

      case "ArrowUp":
        event.preventDefault();
        historyUp();
        break;

      case "ArrowDown":
        event.preventDefault();
        historyDown();
        break;
    }
  }

  return (
    <section
      className="
        flex h-80 flex-col overflow-hidden
        rounded-lg border border-neutral-800
        bg-neutral-950 font-mono text-sm
      "
      aria-label="Git terminal"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Output */}
      <div className="flex-1 overflow-y-auto p-4">
        {output.map((line, index) => (
          <div
            key={index}
            className="whitespace-pre-wrap text-neutral-300"
          >
            {line}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Prompt */}
      <div
        className="
          flex items-center gap-2
          border-t border-neutral-800
          px-4 py-3
        "
      >
        <span
          className="select-none text-green-400"
          aria-hidden="true"
        >
          $
        </span>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Git command"
          placeholder="git commit"
          className="
            min-w-0 flex-1
            bg-transparent
            text-neutral-100
            outline-none
            placeholder:text-neutral-600
          "
        />
      </div>
    </section>
  );
}