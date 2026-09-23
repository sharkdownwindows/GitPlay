import { describe, it, expect } from "vitest";
import { commit } from "./commit";
import { branch } from "./branch";
import type { RepoState } from "../types";

// Helper khởi tạo trạng thái repo sạch sẽ
const createInitialState = (): RepoState => ({
    commits: {},
    branches: {},
    head: { detached: false, ref: "main" },
    staging: { add: [], rm: [] },
});

describe("Git Engine - Commit & Branch Unit Tests (Task D1-3)", () => {
    
    // Case 1: Commit trên repo rỗng -> tạo main, 1 commit không parent
    it("1. Commit trên repo rỗng tạo nhánh main và commit không parent", () => {
        let state = createInitialState();
        const res = commit(state, "Initial commit");
        
        expect(res.ok).toBe(true);
        if (res.ok) {
            expect(res.state.branches["main"]).toBeDefined();
            const commitId = res.state.branches["main"];
            expect(res.state.commits[commitId].parents).toEqual([]);
            expect(res.state.commits[commitId].message).toBe("Initial commit");
        }
    });

    // Case 2: Commit x3 attached -> chuỗi 3 node, main ở cuối
    it("2. Commit 3 lần liên tiếp tạo chuỗi 3 node nối nhau, main ở cuối", () => {
        let state = createInitialState();
        const res1 = commit(state, "C1");
        const res2 = commit(res1.state, "C2");
        const res3 = commit(res2.state, "C3");
        state = res3.state;

        const mainId = state.branches["main"];
        const c3 = state.commits[mainId];
        const c2 = state.commits[c3.parents[0]];
        const c1 = state.commits[c2.parents[0]];

        expect(c1.message).toBe("C1");
        expect(c2.message).toBe("C2");
        expect(c3.message).toBe("C3");
        expect(c1.parents).toEqual([]);
    });

    // Case 3: Commit khi detached -> chỉ HEAD.commitId dịch, không branch đổi
    it("3. Commit khi detached chỉ làm HEAD dịch chuyển, không đổi branch", () => {
        let state = createInitialState();
        const res1 = commit(state, "C1");
        state = res1.state;
        const c1Id = state.branches["main"];

        // Đưa về trạng thái detached HEAD
        state.head = { detached: true, commit: c1Id };
        const branchBefore = state.branches["main"];

        const res2 = commit(state, "Detached commit");
        expect(res2.ok).toBe(true);
        if (res2.ok) {
            expect(res2.state.head.detached).toBe(true);
            expect(res2.state.head.commit).not.toBe(c1Id);
            expect(res2.state.branches["main"]).toBe(branchBefore);
        }
    });

    // Case 4: Commit có message tự đặt
    it("4. Commit lưu đúng message truyền vào", () => {
        let state = createInitialState();
        const res = commit(state, "feat: add login feature");
        expect(res.ok).toBe(true);
        if (res.ok) {
            const commitId = res.state.branches["main"];
            expect(res.state.commits[commitId].message).toBe("feat: add login feature");
        }
    });

    // Case 5: Branch tạo mới -> ref xuất hiện, HEAD không đổi
    it("5. Tạo branch mới thành công, ref xuất hiện và HEAD không đổi", () => {
        let state = createInitialState();
        state = commit(state, "Base").state;
        
        const res = branch(state, { kind: "branch", name: "feature" });
        expect(res.ok).toBe(true);
        if (res.ok) {
            expect(res.state.branches["feature"]).toBe(res.state.branches["main"]);
            expect(res.state.head.ref).toBe("main");
        }
    });

    // Case 6: Branch trùng tên -> BranchAlreadyExists, state không đổi
    it("6. Tạo branch trùng tên trả về lỗi BranchAlreadyExists", () => {
        let state = createInitialState();
        state = commit(state, "Base").state;
        state = branch(state, { kind: "branch", name: "feature" }).state;

        const res = branch(state, { kind: "branch", name: "feature" });
        expect(res.ok).toBe(false);
        if (!res.ok) {
            expect(res.error).toBe("BranchAlreadyExists");
        }
    });

    // Case 7 & 8: Branch tên rỗng hoặc chứa khoảng trắng -> InvalidRefName
    it("7 & 8. Tên branch rỗng hoặc chứa khoảng trắng báo lỗi InvalidRefName", () => {
        let state = createInitialState();
        state = commit(state, "Base").state;

        const resEmpty = branch(state, { kind: "branch", name: "" });
        expect(resEmpty.ok).toBe(false);
        if (!resEmpty.ok) expect(resEmpty.error).toBe("InvalidRefName");

        const resSpace = branch(state, { kind: "branch", name: "bad name" });
        expect(resSpace.ok).toBe(false);
        if (!resSpace.ok) expect(resSpace.error).toBe("InvalidRefName");
    });

    // Case 10: Branch không tham số -> liệt kê, state không đổi (Bỏ qua case 9 theo yêu cầu)
    it("10. Gọi branch không tham số để liệt kê danh sách nhánh", () => {
        let state = createInitialState();
        state = commit(state, "Base").state;
        state = branch(state, { kind: "branch", name: "dev" }).state;

        const res = branch(state, { kind: "branch" });
        expect(res.ok).toBe(true);
        if (res.ok) {
            expect(res.logs).toContain("* main");
            expect(res.logs).toContain("dev");
        }
    });

    // Case 11: Tính tất định (Determinism)
    it("11. Chạy 2 lần cùng chuỗi lệnh cho ra RepoState deep equal", () => {
        const runFlow = () => {
            let s = createInitialState();
            s = commit(s, "One").state;
            s = branch(s, { kind: "branch", name: "feat" }).state;
            s = commit(s, "Two").state;
            return s;
        };

        expect(runFlow()).toEqual(runFlow());
    });

    // Case 12: Tính bất biến (Immutability) khi gặp lỗi
    it("12. Khi lệnh lỗi, state giữ nguyên không bị thay đổi", () => {
        let state = createInitialState();
        state = commit(state, "Base").state;
        state = branch(state, { kind: "branch", name: "feature" }).state;

        const stateBefore = JSON.parse(JSON.stringify(state));
        const res = branch(state, { kind: "branch", name: "feature" }); // Lỗi trùng tên

        expect(res.ok).toBe(false);
        expect(state).toEqual(stateBefore);
    });
});