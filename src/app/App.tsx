import { useState } from "react";

/**
 * SHELL — ĐÓNG BĂNG NGÀY 1.
 *
 * Cả 4 tab được stub sẵn ngay hôm nay để về sau gần như không ai phải sửa file
 * này. "Ai thêm tab cũng phải sửa App.tsx" là nguồn conflict lớn nhất của một
 * shell dùng chung; cách chữa là không còn tab nào để thêm.
 *
 * Mỗi tab là chỗ trống của đúng một người:
 *   Practice     → D2 (viz) + D3 (terminal)
 *   Levels       → D4
 *   Reference    → D4
 *   Verification → D6
 */

const TABS = [
  { id: "practice", label: "Practice", owner: "D2 · D3" },
  { id: "levels", label: "Levels", owner: "D4" },
  { id: "reference", label: "Reference", owner: "D4" },
  { id: "verification", label: "Verification", owner: "D6" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function App() {
  const [active, setActive] = useState<TabId>("practice");
  const current = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
          <span className="font-semibold tracking-tight">GitScope</span>
          <nav className="flex gap-1" role="tablist" aria-label="Khu vực chính">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={tab.id === active}
                onClick={() => setActive(tab.id)}
                className={
                  "rounded px-3 py-1.5 text-sm transition-colors " +
                  (tab.id === active
                    ? "bg-neutral-800 text-neutral-50"
                    : "text-neutral-400 hover:text-neutral-100")
                }
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10" role="tabpanel">
        <h1 className="text-lg font-medium">{current.label}</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Tab trống — chờ {current.owner}.
        </p>
      </main>
    </div>
  );
}