import { succeed } from "../errors";
import type { RepoState, Result, Commit } from "../types";

export function commit(state: RepoState, message?: string): Result {
    const resolvedMessage = message ?? "";
    const commits = state.commits || {};
    const branches = state.branches || {};
    
    // Nếu repo hoàn toàn rỗng, tự động gán HEAD về nhánh "main"
    const currentHead = state.head || { detached: false, ref: "main" };
    let activeBranch = currentHead.ref || "main";

    let parents: string[] = [];

    if (!currentHead.detached) {
        // Nếu nhánh hiện tại đã có commit trước đó thì lấy làm parent
        if (branches[activeBranch]) {
            parents = [branches[activeBranch]];
        }
    } else if (currentHead.detached && currentHead.commit) {
        parents = [currentHead.commit];
    }

    const commitCount = Object.keys(commits).length;
    const newCommitId = `c${commitCount + 1}`;

    const newCommit: Commit = {
        id: newCommitId,
        message: resolvedMessage,
        parents: parents,
        timestamp: new Date().toISOString(), // Lưu ý: Nếu test deep equal strict với thời gian, cần lưu ý phần này
    };

    const newCommits = {
        ...commits,
        [newCommitId]: newCommit,
    };

    const newBranches = { ...branches };
    const newHead = { ...currentHead, ref: activeBranch };

    if (!currentHead.detached) {
        // Cập nhật nhánh hiện tại (hoặc tự tạo "main" nếu repo đang rỗng) trỏ tới commit mới
        newBranches[activeBranch] = newCommitId;
    } else {
        newHead.commit = newCommitId;
    }

    const updatedState: RepoState = {
        ...state,
        commits: newCommits,
        branches: newBranches,
        head: newHead,
    };

    return succeed(updatedState, [`[\({activeBranch}\){newCommitId}] ${resolvedMessage}`]);
}