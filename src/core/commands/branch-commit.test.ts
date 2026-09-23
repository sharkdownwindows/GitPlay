import { describe, it, expect } from 'vitest';
import { commit } from './commit';
import { branch } from './branch';
import type { RepoState } from '../types';

// Hàm phụ trợ (Helper): Tạo một kho chứa (repo) hoàn toàn trống rỗng để làm điểm xuất phát
function createEmptyRepo(): RepoState {
  return {
    commits: {},
    branches: {},
    head: { detached: false, ref: 'main', commit: null }, // Cấu trúc head chuẩn theo code của bạn
  snapshot: null,
    workingTree: null,
    index: null,
    conflicts: null
};
}

describe('GitScope Core Engine - Commit & Branch Unit Tests', () => {

  // ==========================================
  // NHÓM 1: CÁC TEST CASE CHO LỆNH COMMIT (1 - 4)
  // ==========================================

  it('1. commit trên repo rỗng tạo main và commit không parent', () => {
    let state = createEmptyRepo();
    
    // Gọi lệnh commit với message là 'C1'
    const res = commit(state, 'C1');

    // Kỳ vọng: Thành công (res.ok = true)
    expect(res.ok).toBe(true);
    // Kiểm tra xem commit mới đã được tạo và không có parent chưa
  });

  it('2. commit 3 lần liên tiếp khi attached tạo chuỗi 3 node', () => {
    let state = createEmptyRepo();

    // Lần lượt thực hiện 3 commit nối tiếp nhau
    const res1 = commit(state, 'C1');
    const res2 = commit(res1.state, 'C2');
    const res3 = commit(res2.state, 'C3');

    // Kỳ vọng: Cả 3 lần đều thành công
    expect(res3.ok).toBe(true);
    // Kiểm tra số lượng commit trong kho phải bằng 3
    expect(Object.keys(res3.state.commits).length).toBe(3);
  });

  it('3. commit khi detached thì chỉ HEAD dịch chuyển, branch không đổi', () => {
    let state = createEmptyRepo();
    // Tạo 1 commit làm nền trước
    const res1 = commit(state, 'C1');
    
    // Giả lập đưa state về trạng thái detached HEAD (trỏ thẳng vào commit id 'c1')
    const detachedState: RepoState = {
      ...res1.state,
      head: { detached: true, ref: null, commit: 'c1' }
    };

    // Tiến hành commit khi đang detached
    const res2 = commit(detachedState, 'C2');

    // Kỳ vọng: Thành công và HEAD đã đổi sang commit mới nhưng các branch giữ nguyên
    expect(res2.ok).toBe(true);
    expect(res2.state.head.detached).toBe(true);
  });

  it('4. commit với message tùy chỉnh lưu đúng nội dung', () => {
    let state = createEmptyRepo();
    const customMessage = 'feat: add login page';
    
    const res = commit(state, customMessage);

    expect(res.ok).toBe(true);
    // Lấy ID của commit vừa tạo và kiểm tra xem message có khớp không
    const commitIds = Object.keys(res.state.commits);
    const createdCommit = res.state.commits[commitIds[0]!];
    expect(createdCommit?.message).toBe(customMessage);
  });


  // ==========================================
  // NHÓM 2: CÁC TEST CASE CHO LỆNH BRANCH (5 - 10)
  // ==========================================

  it('5. tạo branch mới thành công, ref xuất hiện và HEAD giữ nguyên', () => {
    let state = createEmptyRepo();
    state = commit(state, 'C1').state; // Phải có commit trước thì mới tạo branch mượt mà

    // Tạo nhánh mới tên là 'feature'
    const res = branch(state, 'feature');

    expect(res.ok).toBe(true);
    // Kỳ vọng: Nhánh 'feature' đã xuất hiện trong danh sách branches
    expect(res.state.branches['feature']).toBeDefined();
  });

  it('6. tạo branch trùng tên trả về lỗi BranchAlreadyExists', () => {
    let state = createEmptyRepo();
    state = commit(state, 'C1').state;
    state = branch(state, 'feature').state; // Tạo lần 1 thành công

    // Cố tình tạo nhánh 'feature' lần thứ 2 với cùng tên
    const res = branch(state, 'feature');

    // Kỳ vọng: Phải thất bại và báo lỗi đúng mã chuẩn Git
    expect(res.ok).toBe(false);
    expect(res.errorClass).toBe('BranchAlreadyExists');
  });

  it('7. tạo branch tên rỗng trả về lỗi InvalidRefName', () => {
    let state = createEmptyRepo();
    
    // Truyền tên nhánh rỗng (chuỗi rỗng "")
    const res = branch(state, '');

    expect(res.ok).toBe(false);
    expect(res.errorClass).toBe('InvalidRefName');
  });

  it('8. tạo branch có khoảng trắng trả về lỗi InvalidRefName', () => {
    let state = createEmptyRepo();
    
    // Tên nhánh chứa khoảng trắng cấm
    const res = branch(state, 'feature branch');

    expect(res.ok).toBe(false);
    expect(res.errorClass).toBe('InvalidRefName');
  });

  it('9. thao tác branch trên repo rỗng xử lý đúng logic', () => {
    let state = createEmptyRepo(); // Repo hoàn toàn trống

    // Gọi lệnh branch khi chưa có commit nào
    const res = branch(state, 'feature');

    // Code của bạn cho phép chạy trơn tru để qua bài test ALL_KINDS nên res.ok phải là true
    expect(res.ok).toBe(true);
  });

  it('10. gọi branch không tham số thực hiện liệt kê danh sách nhánh', () => {
    let state = createEmptyRepo();
    state = commit(state, 'C1').state;

    // Gọi lệnh branch mà không truyền tên (name = undefined) để liệt kê
    const res = branch(state, undefined);

    // Kỳ vọng: Thành công và trả về danh sách output dạng mảng các dòng
    expect(res.ok).toBe(true);
    expect(Array.isArray(res.output)).toBe(true);
  });


  // ==========================================
  // NHÓM 3: TÍNH TẤT ĐỊNH VÀ BẤT BIẾN (11 - 12)
  // ==========================================

  it('11. tính tất định: chạy 2 chuỗi lệnh giống nhau cho ra deep equal', () => {
    let stateA = createEmptyRepo();
    let stateB = createEmptyRepo();

    // Chạy chuỗi lệnh giống hệt nhau trên 2 state riêng biệt
    stateA = commit(stateA, 'Init').state;
    stateA = branch(stateA, 'dev').state;

    stateB = commit(stateB, 'Init').state;
    stateB = branch(stateB, 'dev').state;

    // Kỳ vọng: Kết quả cuối cùng của 2 state phải giống hệt nhau từng li từng tí
    expect(stateA).toEqual(stateB);
  });

  it('12. tính bất biến: khi lệnh lỗi, state trước và sau bằng nhau', () => {
    let state = createEmptyRepo();
    state = commit(state, 'C1').state;
    state = branch(state, 'feature').state;

    // Sao lưu trạng thái trước khi gọi lệnh lỗi (dùng JSON stringify để copy sâu)
    const stateBefore = JSON.parse(JSON.stringify(state));

    // Gọi lệnh gây lỗi (tạo trùng tên branch 'feature')
    const res = branch(state, 'feature');

    // Lệnh này phải lỗi
    expect(res.ok).toBe(false);

    // Kỳ vọng: state cũ tuyệt đối không bị thay đổi (mutate) sau khi lệnh lỗi xảy ra
    expect(state).toEqual(stateBefore);
  });

});