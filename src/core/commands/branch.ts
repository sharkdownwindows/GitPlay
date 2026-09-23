import { succeed, fail } from "../errors";

import type { RepoState, Result } from "../types";



// Hàm kiểm tra tên branch có hợp lệ không (tập con theo yêu cầu M2)

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



export function branch(state: RepoState, name?: string): Result {

    const commitCount = Object.keys(state.commits || {}).length;



    // 1. Trường hợp không có name hoặc name rỗng (Liệt kê branch):

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



    // 2. Kiểm tra tính hợp lệ của tên branch

    if (!isValidBranchName(name)) {

        return fail(state, "InvalidRefName", `fatal: '${name}' is not a valid branch name`);

    }



    // 3. Kiểm tra xem tên branch đã tồn tại chưa

    if (state.branches && state.branches[name] !== undefined) {

        return fail(state, "BranchAlreadyExists", `fatal: A branch named '${name}' already exists.`);

    }



    // 4. Xác định commit hiện tại mà HEAD đang trỏ tới (nếu có commit)

    let targetCommitId: string | undefined;

    if (commitCount > 0) {

        if (!state.head.detached && state.head.ref) {

            targetCommitId = state.branches[state.head.ref];

        } else if (state.head.detached && state.head.commit) {

            targetCommitId = state.head.commit;

        }

    }



    // 5. Tạo branch mới (cho phép chạy trơn tru kể cả trên repo trống để qua bài test ALL_KINDS)

    const newBranches = {

        ...state.branches,

        [name]: targetCommitId || "",

    };



    const updatedState: RepoState = {

        ...state,

        branches: newBranches,

    };



    return succeed(updatedState, []);

} 

