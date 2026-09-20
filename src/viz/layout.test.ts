import { describe, expect, it } from "vitest";
import { layout, type RepoState } from "./layout";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("viz/layout.ts (Issue #6)", () => {
  // 1. Ràng buộc: Không được import React
  it("không import React hay bất kỳ thư viện UI nào", () => {
    const filePath = join(__dirname, "layout.ts");
    const content = readFileSync(filePath, "utf8");
    expect(content).not.toMatch(/from\s+["']react["']/);
    expect(content).not.toMatch(/from\s+["']react-dom["']/);
    expect(content).not.toMatch(/import\s+["']react["']/);
  });

  // 2. Acceptance Criterion: Hàm thuần - cùng input cho output deep equal khi chạy 100 lần
  it("là hàm thuần: cùng input cho ra output deep equal qua 100 lần chạy", () => {
    const state: RepoState = {
      commits: {
        c1: { id: "c1", parents: [] },
        c2: { id: "c2", parents: ["c1"] },
        c3: { id: "c3", parents: ["c1"] },
        c4: { id: "c4", parents: ["c2", "c3"] },
      },
    };

    const firstResult = layout(state);
    for (let i = 0; i < 100; i++) {
      const result = layout(state);
      expect(result).toEqual(firstResult);
    }
  });

  // 3. Acceptance Criterion: Với mọi cạnh (child -> parent), y(parent) > y(child)
  it("với mọi cạnh (child -> parent), y(parent) > y(child) (parent ở trên / depth nhỏ hơn)", () => {
    const state: RepoState = {
      commits: {
        c1: { id: "c1", parents: [] },
        c2: { id: "c2", parents: ["c1"] },
        c3: { id: "c3", parents: ["c1"] },
        c4: { id: "c4", parents: ["c2", "c3"] },
        c5: { id: "c5", parents: ["c4"] },
      },
    };

    const result = layout(state);
    const nodeMap = new Map(result.nodes.map((n) => [n.id, n]));

    for (const edge of result.edges) {
      const child = nodeMap.get(edge.from)!;
      const parent = nodeMap.get(edge.to)!;
      expect(child).toBeDefined();
      expect(parent).toBeDefined();
      expect(parent.y).toBeGreaterThan(child.y);
    }
  });

  // 4. Acceptance Criterion: Không hai node nào trùng toạ độ
  it("không có hai node nào trùng toạ độ (x, y)", () => {
    const state: RepoState = {
      commits: {
        c1: { id: "c1", parents: [] },
        c2: { id: "c2", parents: ["c1"] },
        c3: { id: "c3", parents: ["c1"] },
        c4: { id: "c4", parents: ["c2"] },
        c5: { id: "c5", parents: ["c3"] },
        c6: { id: "c6", parents: ["c4", "c5"] },
      },
    };

    const result = layout(state);
    const posSet = new Set<string>();

    for (const node of result.nodes) {
      const key = `${node.x},${node.y}`;
      expect(posSet.has(key)).toBe(false);
      posSet.add(key);
    }
  });

  // 5. Xử lý RepoState rỗng
  it("trả về layout rỗng nếu repo không có commit", () => {
    const result = layout({ commits: {} });
    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
    expect(result.width).toBe(0);
    expect(result.height).toBe(0);
  });

  // 6. Xử lý state.commits dưới dạng Map
  it("hỗ trợ state.commits dưới dạng Map", () => {
    const commitsMap = new Map();
    commitsMap.set("c1", { id: "c1", parents: [] });
    commitsMap.set("c2", { id: "c2", parents: ["c1"] });

    const result = layout({ commits: commitsMap });
    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toEqual([{ from: "c2", to: "c1" }]);
  });

  // 7. Nhánh chính giữ nguyên cột (lane 0), nhánh rẽ lấy cột bên cạnh (lane 1)
  it("kế thừa làn của parent đầu tiên và rẽ làn cho nhánh thứ hai", () => {
    // c1 -> c2 -> c4 (main branch)
    // c1 -> c3 (feature branch)
    const state: RepoState = {
      commits: {
        c1: { id: "c1", parents: [] },
        c2: { id: "c2", parents: ["c1"] },
        c3: { id: "c3", parents: ["c1"] },
        c4: { id: "c4", parents: ["c2"] },
      },
    };

    const result = layout(state);
    const nodeMap = new Map(result.nodes.map((n) => [n.id, n]));

    // c1 và c2 cùng cột (x giống nhau)
    expect(nodeMap.get("c1")!.x).toBe(nodeMap.get("c2")!.x);
    // c3 rẽ sang cột khác
    expect(nodeMap.get("c3")!.x).not.toBe(nodeMap.get("c1")!.x);
  });

  // 8. Đồ thị Merge (Diamond DAG) tính depth theo longest path (max)
  it("dùng max parent depth cho commit merge để parent luôn nằm trên child", () => {
    // c1 (depth 0)
    // c2 (depth 1, parent c1) -> c3 (depth 2, parent c2)
    // c4 (depth 1, parent c1)
    // c5 (merge: parents [c3, c4]) -> depth phải là 1 + max(2, 1) = 3
    const state: RepoState = {
      commits: {
        c1: { id: "c1", parents: [] },
        c2: { id: "c2", parents: ["c1"] },
        c3: { id: "c3", parents: ["c2"] },
        c4: { id: "c4", parents: ["c1"] },
        c5: { id: "c5", parents: ["c3", "c4"] },
      },
    };

    const result = layout(state);
    const nodeMap = new Map(result.nodes.map((n) => [n.id, n]));

    const c1 = nodeMap.get("c1")!;
    const c2 = nodeMap.get("c2")!;
    const c3 = nodeMap.get("c3")!;
    const c4 = nodeMap.get("c4")!;
    const c5 = nodeMap.get("c5")!;

    expect(c1.y).toBeGreaterThan(c2.y);
    expect(c2.y).toBeGreaterThan(c3.y);
    expect(c3.y).toBeGreaterThan(c5.y);
    expect(c4.y).toBeGreaterThan(c5.y);
  });

  // 9. Tính đúng toạ độ x, y theo công thức định dạng GRID_SPACING = 80, PADDING = 40
  it("tính toạ độ chuẩn x = lane * 80 + 40, y = (maxDepth - depth) * 80 + 40", () => {
    const state: RepoState = {
      commits: {
        c1: { id: "c1", parents: [] },
        c2: { id: "c2", parents: ["c1"] },
        c3: { id: "c3", parents: ["c2"] },
      },
    };

    const result = layout(state);
    const nodeMap = new Map(result.nodes.map((n) => [n.id, n]));

    // 3 commit thẳng hàng, maxDepth = 2
    // c1: depth 0 -> y = (2 - 0)*80 + 40 = 200, x = 0*80 + 40 = 40
    // c2: depth 1 -> y = (2 - 1)*80 + 40 = 120, x = 40
    // c3: depth 2 -> y = (2 - 2)*80 + 40 = 40,  x = 40
    expect(nodeMap.get("c1")).toEqual({ id: "c1", x: 40, y: 200 });
    expect(nodeMap.get("c2")).toEqual({ id: "c2", x: 40, y: 120 });
    expect(nodeMap.get("c3")).toEqual({ id: "c3", x: 40, y: 40 });
  });

  // 10. Bỏ qua parents không tồn tại trong commitMap mà không crash
  it("xử lý an toàn khi commit trỏ tới parent không có trong state", () => {
    const state: RepoState = {
      commits: {
        c2: { id: "c2", parents: ["unknown_parent"] },
      },
    };

    const result = layout(state);
    expect(result.nodes).toHaveLength(1);
    expect(result.edges).toEqual([]);
    expect(result.nodes[0]).toEqual({ id: "c2", x: 40, y: 40 });
  });
});
