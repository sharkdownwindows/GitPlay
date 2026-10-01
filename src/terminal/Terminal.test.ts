import { readFileSync, readdirSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { isNearLogBottom, Terminal } from "./Terminal";
import { editInput, initialTerminalSession, nextCommand, previousCommand, submitInput } from "./session";

describe("Terminal", () => {
  it("render ô nhập và output từ store", () => {
    const html = renderToStaticMarkup(createElement(Terminal, {
      onCommand: vi.fn(),
      output: ["[main c1] root"],
    }));
    expect(html).toContain('aria-label="Git command"');
    expect(html).toContain('type="text"');
    expect(html).toContain("[main c1] root");
  });

  it("Enter trên command hợp lệ gửi Command đã parse qua callback", () => {
    const onCommand = vi.fn(() => ({ accepted: true, ok: true, output: ["[main c1] hello world"] }));
    const input = editInput(initialTerminalSession(), 'git commit -m "hello world"');
    const next = submitInput(input, onCommand);
    expect(onCommand).toHaveBeenCalledExactlyOnceWith({ kind: "commit", message: "hello world" });
    expect(next.entries).toEqual([{
      command: 'git commit -m "hello world"',
      output: ["[main c1] hello world"],
      isError: false,
    }]);
    expect(next.history).toEqual(['git commit -m "hello world"']);
    expect(next.input).toBe("");
  });

  it("parse error hiển thị trong history nhưng không gọi callback", () => {
    const onCommand = vi.fn();
    const next = submitInput(editInput(initialTerminalSession(), "git merge"), onCommand);
    expect(onCommand).not.toHaveBeenCalled();
    expect(next.entries).toEqual([
      { command: "git merge", output: ["fatal: you must specify a target"], isError: true },
    ]);
    expect(next.history).toEqual(["git merge"]);
  });

  it("ArrowUp/ArrowDown duyệt history và khôi phục draft", () => {
    const onCommand = vi.fn();
    let session = submitInput(editInput(initialTerminalSession(), "git branch"), onCommand);
    session = submitInput(editInput(session, "git commit -m two"), onCommand);
    session = editInput(session, "git sw");

    session = previousCommand(session);
    expect(session.input).toBe("git commit -m two");
    session = previousCommand(session);
    expect(session.input).toBe("git branch");
    expect(previousCommand(session).input).toBe("git branch");
    session = nextCommand(session);
    expect(session.input).toBe("git commit -m two");
    session = nextCommand(session);
    expect(session.input).toBe("git sw");
    expect(nextCommand(session).input).toBe("git sw");
  });

  it("Enter trên input rỗng không lưu history hoặc gọi callback", () => {
    const onCommand = vi.fn();
    const initial = editInput(initialTerminalSession(), "   ");
    expect(submitInput(initial, onCommand)).toBe(initial);
    expect(onCommand).not.toHaveBeenCalled();
  });

  it("gắn output lỗi engine ngay dưới command tương ứng", () => {
    const next = submitInput(
      editInput(initialTerminalSession(), "git branch feature"),
      () => ({ accepted: true, ok: false, output: ["fatal: not a valid object name: 'main'"] }),
    );
    expect(next.entries[0]).toEqual({
      command: "git branch feature",
      output: ["fatal: not a valid object name: 'main'"],
      isError: true,
    });
    expect(next.lastSubmissionErrored).toBe(true);
    expect(editInput(next, "g").lastSubmissionErrored).toBe(false);
  });

  it("render Practice empty guidance, examples, Run và chỉ một unified log", () => {
    const html = renderToStaticMarkup(createElement(Terminal, {
      onCommand: vi.fn(),
      variant: "practice",
    }));
    expect(html).toContain("Type a Git command below and press Enter.");
    expect(html).toContain('git commit -m &quot;first&quot;');
    expect(html).toContain("git branch feature");
    expect(html).toContain("Run ↵");
    expect(html.match(/role="log"/g)).toHaveLength(1);
    expect(html).toContain('aria-live="polite"');
  });

  it("announces the graph update lock without disabling or moving the command input", () => {
    const html = renderToStaticMarkup(createElement(Terminal, {
      onCommand: vi.fn(),
      variant: "practice",
      locked: true,
    }));
    expect(html).toContain('<p class="terminal__hint" role="status">Updating graph…</p>');
    expect(html).not.toMatch(/<input[^>]*\sdisabled(?:=|\s|>)/);
  });

  it("giữ auto-scroll khi cách đáy không quá 40px", () => {
    expect(isNearLogBottom({ scrollHeight: 600, scrollTop: 360, clientHeight: 200 })).toBe(true);
    expect(isNearLogBottom({ scrollHeight: 600, scrollTop: 359, clientHeight: 200 })).toBe(false);
  });

  it("terminal không import viz hoặc levels", () => {
    for (const file of readdirSync(new URL(".", import.meta.url))) {
      if (!/\.tsx?$/.test(file) || file.endsWith(".test.ts")) continue;
      const source = readFileSync(new URL(file, import.meta.url), "utf8");
      expect(source).not.toMatch(/\bfrom\s*["'][^"']*\/(viz|levels)(?:\/|["'])/);
    }
  });
});
