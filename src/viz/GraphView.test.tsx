import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { GraphView } from "./GraphView";
import type { RepoState } from "../core/types";

describe("viz/GraphView.tsx (Issue #7 · D2-2)", () => {
  // RepoState mẫu 4 commit + 2 branch theo yêu cầu
  const sampleState: RepoState = {
    commits: {
      c1: { id: "c1", message: "init", parents: [], timestamp: "2026-01-01" },
      c2: {
        id: "c2",
        message: "feat A",
        parents: ["c1"],
        timestamp: "2026-01-02",
      },
      c3: {
        id: "c3",
        message: "feat B",
        parents: ["c1"],
        timestamp: "2026-01-03",
      },
      c4: {
        id: "c4",
        message: "merge",
        parents: ["c2", "c3"],
        timestamp: "2026-01-04",
      },
    },
    branches: {
      main: "c4",
      feature: "c3",
    },
    head: {
      detached: false,
      ref: "main",
      commit: null,
    },
    snapshot: null,
    workingTree: null,
    index: null,
    conflicts: null,
  };

  // 1. Acceptance Criterion: Cho RepoState mẫu 4 commit + 2 branch -> vẽ đúng
  it("vẽ đúng với RepoState mẫu 4 commit + 2 branch", () => {
    const html = renderToStaticMarkup(<GraphView state={sampleState} />);

    // Kiểm tra có đủ 4 commit node
    expect(html).toContain("c1");
    expect(html).toContain("feat A");
    expect(html).toContain("feat B");
    expect(html).toContain("merge");

    // Kiểm tra có nhãn branch
    expect(html).toContain("main");
    expect(html).toContain("feature");

    // Kiểm tra có nhãn HEAD
    expect(html).toContain("HEAD");

    // Kiểm tra có thẻ SVG và viewBox hợp lệ
    expect(html).toContain("<svg");
    expect(html).toContain("viewBox=");
  });

  // 2. Acceptance Criterion: HEAD attached và HEAD detached nhìn khác nhau rõ rệt
  it("HEAD attached và HEAD detached có hình thức và class khác biệt rõ rệt", () => {
    // 2a. Attached state: HEAD trỏ tới branch 'main'
    const attachedHtml = renderToStaticMarkup(
      <GraphView state={sampleState} />,
    );
    expect(attachedHtml).toContain("ref-attached-head");
    expect(attachedHtml).not.toContain("ref-detached-head");
    expect(attachedHtml).not.toContain("HEAD (detached)");

    // 2b. Detached state: HEAD trỏ trực tiếp tới commit 'c2'
    const detachedState: RepoState = {
      ...sampleState,
      head: {
        detached: true,
        ref: null,
        commit: "c2",
      },
    };

    const detachedHtml = renderToStaticMarkup(
      <GraphView state={detachedState} />,
    );
    expect(detachedHtml).toContain("ref-detached-head");
    expect(detachedHtml).toContain("HEAD");
    expect(detachedHtml).toContain("(detached)");
    expect(detachedHtml).toContain("detached-head-node");
  });

  // 3. Đảm bảo nhãn HEAD (detached) nằm bên trái commit node để không bị đè lên nhánh bên phải
  it("nhãn HEAD (detached) được đặt ở bên trái commit node tránh trùng lặp", () => {
    const detachedState: RepoState = {
      ...sampleState,
      head: {
        detached: true,
        ref: null,
        commit: "c2",
      },
    };

    const html = renderToStaticMarkup(<GraphView state={detachedState} />);
    // c2 ở lane 0 có x = 40. Vị trí bên trái: leftStartX = 40 - 40 - 96 = -96
    expect(html).toContain('transform="translate(-96');
  });

  // 4. Acceptance Criterion: Không lỗi console và render được repo rỗng
  it("xử lý mượt mà khi RepoState rỗng (0 commit)", () => {
    const emptyRepo: RepoState = {
      commits: {},
      branches: {},
      head: { detached: false, ref: "main", commit: null },
      snapshot: null,
      workingTree: null,
      index: null,
      conflicts: null,
    };

    const html = renderToStaticMarkup(<GraphView state={emptyRepo} />);
    expect(html).toContain("Chưa có commit nào");
  });

  // 5. Acceptance Criterion: Đồ thị tự vừa khung, không tràn
  it("tính toán viewBox tự động bao trọn toàn bộ toạ độ node và nhãn", () => {
    const html = renderToStaticMarkup(<GraphView state={sampleState} />);
    const match = html.match(/viewBox="(-?\d+)\s+(-?\d+)\s+(\d+)\s+(\d+)"/);
    expect(match).not.toBeNull();

    if (match && match[3] && match[4]) {
      const width = parseInt(match[3], 10);
      const height = parseInt(match[4], 10);

      // Width và Height phải đủ lớn để chứa cả node và nhãn
      expect(width).toBeGreaterThanOrEqual(360);
      expect(height).toBeGreaterThanOrEqual(200);
    }
  });

  // 6. Kiểm tra cạnh (Edges) trỏ từ child về parent
  it("vẽ đúng số lượng cạnh kết nối giữa các commit", () => {
    const html = renderToStaticMarkup(<GraphView state={sampleState} />);
    // Đồ thị có các cạnh: c2->c1, c3->c1, c4->c2, c4->c3 (4 cạnh)
    const lineMatches = html.match(/<line /g);
    expect(lineMatches).not.toBeNull();
    // Gồm các line cho edges + line cho ref labels
    expect(lineMatches!.length).toBeGreaterThanOrEqual(4);
  });
});
