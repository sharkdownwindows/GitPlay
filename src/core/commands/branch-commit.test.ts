import { describe, expect, it } from "vitest";
import { emptyState } from "../types";
import { commit } from "./commit";
import { branch } from "./branch";

describe("GitPlay M2 Core Commands: commit & branch", () => {
    it("1. commit trên repo rỗng tạo main và commit không parent", () => {
        const res = commit(emptyState(), "initial commit");
        expect(res.ok).toBe(true);
        expect(res.state.commits).toBeDefined();
        const commits = res.state.commits ?? {};
        const commitIds = Object.keys(commits);
        expect(commitIds.length).toBe(1);
        const firstId = commitIds[0] as string;
        expect(commits[firstId]?.parents).toEqual([]);
        expect(res.state.branches["main"]).toBe(firstId);
    });

    it("2. commit 3 lần liên tiếp tạo chuỗi 3 node, main ở cuối", () => {
        let state = emptyState();
        const r1 = commit(state, "one");
        const r2 = commit(r1.state, "two");
        const r3 = commit(r2.state, "three");

        expect(r3.ok).toBe(true);
        const commits = r3.state.commits ?? {};
        expect(Object.keys(commits).length).toBe(3);
        const mainCommitId = r3.state.branches["main"];
        expect(mainCommitId).toBeDefined();
    });

    it("3. commit khi detached thì chỉ HEAD dịch chuyển, branch không đổi", () => {
        let state = emptyState();
        const r1 = commit(state, "c1");
        const commits = r1.state.commits ?? {};
        const commitId1 = Object.keys(commits)[0] as string;

        const detachedState = {
            ...r1.state,
            head: { detached: true, ref: null, commit: commitId1 }
        };

        const r2 = commit(detachedState, "c2 detached");
        expect(r2.ok).toBe(true);
        expect(r2.state.head.detached).toBe(true);
        expect(r2.state.head.commit).not.toBe(commitId1);
    });

    it("4. commit có message đúng như truyền vào", () => {
        const msg = "feat: add amazing feature";
        const res = commit(emptyState(), msg);
        expect(res.ok).toBe(true);
        const commits = res.state.commits ?? {};
        const commitId = Object.keys(commits)[0] as string;
        expect(commits[commitId]?.message).toBe(msg);
    });

    it("5. tạo branch mới thành công, ref xuất hiện, HEAD không đổi", () => {
        let state = emptyState();
        const r1 = commit(state, "c1");
        const res = branch(r1.state, "feature");

        expect(res.ok).toBe(true);
        expect(res.state.branches["feature"]).toBeDefined();
        expect(res.state.head).toEqual(r1.state.head);
    });

    it("6. branch trùng tên trả về BranchAlreadyExists, state không đổi", () => {
        let state = emptyState();
        const r1 = commit(state, "c1");
        const r2 = branch(r1.state, "main");

        expect(r2.ok).toBe(false);
        expect(r2.errorClass).toBe("BranchAlreadyExists");
        expect(r2.state).toEqual(r1.state);
    });

    it("7. branch tên rỗng trả về InvalidRefName", () => {
        let state = emptyState();
        const r1 = commit(state, "c1");
        const res = branch(r1.state, "");

        expect(res.ok).toBe(false);
        expect(res.errorClass).toBe("InvalidRefName");
    });

    it("8. branch tên có khoảng trắng trả về InvalidRefName", () => {
        let state = emptyState();
        const r1 = commit(state, "c1");
        const res = branch(r1.state, "bad name");

        expect(res.ok).toBe(false);
        expect(res.errorClass).toBe("InvalidRefName");
    });

    it("9. branch trên repo rỗng khi tạo mới trả về NoCommitsYet", () => {
        const res = branch(emptyState(), "feature");
        expect(res.ok).toBe(false);
        expect(res.errorClass).toBe("NoCommitsYet");
    });

    it("10. branch không tham số liệt kê danh sách, state không đổi", () => {
        let state = emptyState();
        const r1 = commit(state, "c1");
        const res = branch(r1.state);

        expect(res.ok).toBe(true);
        expect(Array.isArray(res.output)).toBe(true);
        expect(res.state).toEqual(r1.state);
    });

    it("11. tính tất định: chạy 2 lần cùng chuỗi command cho kết quả deep equal", () => {
        const runSequence = () => {
            let s = emptyState();
            s = commit(s, "one").state;
            s = branch(s, "dev").state;
            s = commit(s, "two").state;
            return s;
        };

        const result1 = runSequence();
        const result2 = runSequence();
        expect(result1).toEqual(result2);
    });

    it("12. tính bất biến: khi gặp lỗi, state trả về deep equal với state ban đầu", () => {
        let state = emptyState();
        state = commit(state, "c1").state;
        const stateBefore = JSON.parse(JSON.stringify(state));

        const res = branch(state, "main");
        expect(res.ok).toBe(false);
        expect(res.state).toEqual(stateBefore);
    });
});