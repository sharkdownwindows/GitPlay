# GitScope — trạng thái mốc

Cập nhật: 2026-09-28, branch `m2-stabilize`. Trạng thái này dựa trên source và validation local; chưa thay cho xác nhận CI hoặc demo của nhóm.

| Mốc | Trạng thái | Bằng chứng / điều kiện còn thiếu |
|---|---|---|
| M1 — scaffold và ba contract | **Complete** | `src/core/types.ts`, `src/verification/report.ts`, `src/progress/types.ts`; app shell, engine stub, `MiniGraph` stub, report mẫu, CI workflow và script kiểm tra import đã có. |
| M2 — vertical slice | **In progress** | Parser, layout và level checker đã có trên branch; chưa chứng minh luồng nhập `git commit` → engine thật → graph → output như điều kiện thoát trong `ISSUES.md`. |

## Bằng chứng M1

- Ba contract trong source là nguồn chuẩn; `TECHNICAL_OVERVIEW.md` và `STRUCTURE.md` đã được đồng bộ theo đó.
- `package.json` và lockfile pin `better-sqlite3@12.11.1`; clean install Windows đã thành công ở lần validation này.
- `.github/workflows/ci.yml` có các bước typecheck, unit test, import lint và job Tier 1; trạng thái chạy CI từ xa chưa được xác minh trong lần cập nhật này.
- `public/verification.json` hiện là report mẫu, chưa phải kết quả differential test thật.

## Validation local hiện tại

| Lệnh | Exit code | Kết quả |
|---|---:|---|
| `npm ci` | 0 | Cài 192 packages, audit 0 vulnerabilities. |
| `npm run typecheck` | 0 | TypeScript pass. |
| `npm test` | 0 | 4 test files, 36/36 tests pass. |
| `npm run build` | 0 | Vite production build pass. |
| `npm run lint:imports` | 0 | Luật import cho `src/core` và `src/progress` pass với `node scripts/check-imports.ts`. |
| `git diff --check` | 0 | Không có lỗi whitespace trong unstaged diff. |

Không chạy `npm run check:tier1` trong working repository vì script xóa thư mục Tier 2.

## Blocker và việc tiếp theo

- M2 còn thiếu engine thật, terminal/graph view nối hoàn chỉnh và kiểm chứng vertical slice theo `ISSUES.md` §M2.
- Harness diff-test, benchmark/report thật, nội dung level đầy đủ và Tier 2 chưa hoàn thành; Tier 2 chỉ được xét sau cổng M4.
- `BRIEF.md` vẫn là placeholder; PRD hiện dựa trên issue list, technical overview và contract đã chấp nhận. Nhóm cần điền brief gốc nếu muốn dùng nó làm nguồn yêu cầu độc lập.
- Xác nhận CI và demo M1 trên môi trường của nhóm; tiếp tục các issue M2 theo thứ tự phụ thuộc rồi kiểm tra điều kiện thoát bằng thao tác thực tế.
