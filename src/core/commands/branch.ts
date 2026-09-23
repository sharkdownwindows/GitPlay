import { succeed, fail } from "../errors";
import type { RepoState, Result } from "../types";

/**
 * Hàm kiểm tra tên branch có hợp lệ không (tập con theo yêu cầu M2).
 * Lưu ý: Đây là tập con có chủ đích, không đầy đủ hoàn toàn so với git check-ref-format thực tế.
 * Các trường hợp từ chối: chuỗi rỗng, bắt đầu bằng - hoặc ., chứa khoảng trắng hoặc ký tự cấm (~ ^ : ? * [ \), chứa .., kết thúc bằng . hoặc .lock.
 */
function isValidBranchName(name: string): boolean {
    if (!name || name.length === 0) return false;
    if (name.startsWith("-") || name.startsWith(".")) return false;
    if (name.endsWith(".") || name.endsWith(".lock")) return false;
    if (name.includes("..")) return false;
    
    // Chứa khoảng trắng hoặc các ký tự cấm: ~ ^ : ? * [ \
    const forbiddenChars = [" ", "~", "^", ":", "?", "*", "[", "\\"];
    for (const char of forbiddenChars) {
        if (name.includes(char)) return false;
    }
    
    return true;
}

export function branch(state: RepoState, cmd: { kind: "branch"; name?: string }): Result {
    const name = cmd.name;
    const commitCount = Object.keys(state.commits || {}).length;

    // 1. Trường hợp không truyền name -> Liệt kê danh sách branch
    if (!name) {
        if (commitCount === 0) {
            return succeed(state, []);
        }

        const branches = Object.keys(state.branches || {});
        const currentRef = !state.head.detached ? state.head.ref : undefined;
        
        const lines = branches.map((b) => {
            return b === currentRef ? `* \({b}` : `\){b}`;
        });
        return succeed(state, lines);
    }

    // 2. Kiểm tra nếu repo rỗng mà tạo branch mới -> Trả về lỗi NoCommitsYet
    if (commitCount === 0) {
        return fail(state, "NoCommitsYet", "fatal: No commits yet");
    }

    // 3. Kiểm tra tính hợp lệ của tên branch -> Trả về lỗi InvalidRefName
    if (!isValidBranchName(name)) {
        return fail(state, "InvalidRefName", `fatal: '${name}' is not a valid branch name`);
    }

    // 4. Kiểm tra xem tên branch đã tồn tại chưa -> Trả về lỗi BranchAlreadyExists
    if (state.branches && state.branches[name] !== undefined) {
        return fail(state, "BranchAlreadyExists", `fatal: A branch named '${name}' already exists.`);
    }

    // 5. Xác định commit hiện tại mà HEAD đang trỏ tới để làm mốc cho branch mới
    let targetCommitId = "";
    if (!state.head.detached && state.head.ref) {
        targetCommitId = state.branches[state.head.ref] || "";
    } else if (state.head.detached && state.head.commit) {
        targetCommitId = state.head.commit;
    }

    // 6. Tạo branch mới. 
    // Quan trọng: git branch KHÔNG làm HEAD di chuyển, HEAD vẫn giữ nguyên vị trí cũ.
    const newBranches = {
        ...state.branches,
        [name]: targetCommitId,
    };

    const updatedState: RepoState = {
        ...state,
        branches: newBranches,
    };

    return succeed(updatedState, []);
}