import { succeed } from "../errors";
import type { RepoState, Result, Commit } from "../types";

export function commit(state: RepoState, message?: string): Result {
    const resolvedMessage = message ?? "";

    // 1. Xác định commit cha (parents) và nhánh/vị trí hiện tại dựa theo cấu trúc Head chuẩn
    let parents: string[] = [];
    const currentHead = state.head;

    if (!currentHead.detached && currentHead.ref) {
        // Trường hợp đang đứng trên branch (ví dụ: "main")
        const branchName = currentHead.ref;
        if (state.branches[branchName]) {
            parents = [state.branches[branchName]];
        }
    } else if (currentHead.detached && currentHead.commit) {
        // Trường hợp đang ở trạng thái Detached HEAD
        parents = [currentHead.commit];
    }

    // 2. Tạo ID mới cho commit (ví dụ: c1, c2, c3...)
    const commitCount = Object.keys(state.commits).length;
    const newCommitId = `c${commitCount + 1}`;

    // 3. Tạo object commit mới (lấy thêm thời gian giả định hoặc ISO string để khớp type)
    const newCommit: Commit = {
        id: newCommitId,
        message: resolvedMessage,
        parents: parents,
        timestamp: new Date().toISOString(),
    };

    // 4. Sao chép và cập nhật lại state (đảm bảo tính bất biến)
    const newCommits = {
        ...state.commits,
        [newCommitId]: newCommit,
    };

    const newBranches = { ...state.branches };
    const newHead = { ...state.head };

    if (!currentHead.detached && currentHead.ref) {
        // Nếu đang ở branch, cập nhật lại branch đó trỏ đến commit mới
        newBranches[currentHead.ref] = newCommitId;
    } else {
        // Nếu đang detached HEAD, di chuyển thẳng commit của head tới commit mới
        newHead.commit = newCommitId;
    }

    const updatedState: RepoState = {
        ...state,
        commits: newCommits,
        branches: newBranches,
        head: newHead,
    };

    return succeed(updatedState, [`[master \({newCommitId}]\){resolvedMessage}`]);
}