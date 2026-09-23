import { succeed } from "../errors";
import type { RepoState, Result, Commit } from "../types";

export function commit(state: RepoState, message?: string): Result {
    // 1. Dùng fallback an toàn từ đoạn 1 để tránh lỗi nếu state thiếu thuộc tính
    const commits = state.commits || {};
    const branches = state.branches || {};
    const currentHead = state.head || { detached: false, ref: "main", commit: null };

    let parents: string[] = [];

    // 2. Xử lý parent commit chuẩn xác theo trạng thái HEAD
    if (!currentHead.detached) {
        const activeBranch = currentHead.ref || "main";
        if (branches[activeBranch]) {
            parents = [branches[activeBranch]];
        }
    } else if (currentHead.commit) {
        parents = [currentHead.commit];
    }

    const commitCount = Object.keys(commits).length;
    const newCommitId = `c${commitCount + 1}`;

    // 3. Tự động sinh message dạng C1, C2... nếu người dùng không truyền vào
    const trimmed = message?.trim();
    const resolvedMessage = trimmed && trimmed.length > 0 ? trimmed : `C${commitCount + 1}`;

    const newCommit: Commit = {
        id: newCommitId,
        message: resolvedMessage,
        parents: parents,
        timestamp: new Date().toISOString(),
    };

    const newCommits = {
        ...commits,
        [newCommitId]: newCommit,
    };

    const newBranches = { ...branches };
    let newHead = { ...currentHead };
    let label: string = "";

    // 4. Cập nhật nhánh hoặc detached head đúng chuẩn
    if (!currentHead.detached) {
        const activeBranch = currentHead.ref || "main";
        newBranches[activeBranch] = newCommitId;
        newHead = { ...currentHead, ref: activeBranch };
        label = activeBranch;
    } else {
        newHead = { ...currentHead, commit: newCommitId };
        label = "detached HEAD";
    }

    const updatedState: RepoState = {
        ...state,
        commits: newCommits,
        branches: newBranches,
        head: newHead,
    };

    // 5. Dùng đúng template string để hiển thị kết quả
    return succeed(updatedState, [`[\({label}\){newCommitId}] ${resolvedMessage}`]);
}