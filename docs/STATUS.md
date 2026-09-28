# GitScope — trạng thái mốc

Cập nhật: 2026-09-28, branch `m2-complete`. Trạng thái này dựa trên source và validation local; chưa thay cho xác nhận CI hoặc demo của nhóm.

| Mốc | Trạng thái | Bằng chứng / điều kiện còn thiếu |
|---|---|---|
| M1 — scaffold và ba contract | **Complete** | `src/core/types.ts`, `src/verification/report.ts`, `src/progress/types.ts`; app shell, engine entry point, `MiniGraph` stub, report mẫu, CI workflow và script kiểm tra import đã có. |
| M2 — vertical slice | **Complete** | Terminal → parser → engine thật → `RepoState` → `GraphView` → output đã nối hoàn chỉnh; issues #13–#26 đã triển khai. Validation local xanh; CI từ xa chưa được xác minh. |

## Bằng chứng M1

- Ba contract trong source là nguồn chuẩn; `TECHNICAL_OVERVIEW.md` và `STRUCTURE.md` đã được đồng bộ theo đó.
- `package.json` và lockfile pin `better-sqlite3@12.11.1`; clean install Windows đã thành công ở lần validation này.
- `.github/workflows/ci.yml` có các bước typecheck, unit test, import lint và job Tier 1; trạng thái chạy CI từ xa chưa được xác minh trong lần cập nhật này.
- `public/verification.json` hiện là report mẫu, chưa phải kết quả differential test thật.

## Bằng chứng M2

- Vertical slice chạy từ lệnh nhập ở Terminal qua parser và engine thật tới graph và output; commit, branch, layout, GraphView, app store, level checker và progress logic đã có.
- Issues #13–#26 đã triển khai. `VerificationTab` đọc `public/verification.json`; dữ liệu Command Reference có đủ năm lệnh Tier 1.
- Bộ sinh DAG có seed hỗ trợ 100, 1.000, 10.000 và 100.000 commit. Spike #23 đã đo 100 lần gọi Git; số liệu và môi trường đo ở dưới.
- `public/verification.json` vẫn là dữ liệu mẫu cho M2; report differential thật dự kiến sinh ở M4.

## Validation local hiện tại

| Lệnh | Exit code | Kết quả |
|---|---:|---|
| `npm run typecheck` | 0 | TypeScript pass. |
| `npm test` | 0 | 16 test files, 125/125 tests pass. |
| `npm run build` | 0 | Vite production build pass. |
| `npm run lint:imports` | 0 | Luật import cho `src/core` và `src/progress` pass với `node scripts/check-imports.ts`. |
| `git diff --check` | 0 | Không có lỗi whitespace trong unstaged diff. |

Không chạy `npm run check:tier1` trong working repository vì script xóa thư mục Tier 2.

## Spike #23 — thời gian gọi Git (2026-09-28)

Chạy `node scripts/bench-git-spawn.mjs`: tạo một repo Git trong thư mục tạm, đo 100 lần `spawnSync("git", ["status", "--porcelain"])` bằng đồng hồ monotonic, rồi xóa thư mục tạm trong `finally`. Đã xác nhận thư mục không còn sau benchmark. Không warm-up; số đo gồm chi phí spawn **và** thực thi `git status`, không phải chi phí spawn thuần.

| Số lần | Mean | Median | p95 |
|---:|---:|---:|---:|
| 100 | 29.21 ms | 29.22 ms | 31.60 ms |

Môi trường: Node `v24.16.0`; Git `2.31.1.windows.1`; Windows `win32 10.0.26200 x64`. Đây là một lần đo local; ngân sách CI và số process Git cho mỗi test case cần được đo trên CI trước khi quyết định chạy vét cạn độ sâu 3 trên mọi PR.

## Việc tiếp theo

- M3 tiếp tục các lệnh `switch`, `checkout`, `merge` và harness differential; benchmark layout và report thật vẫn chưa hoàn thành. Tier 2 chỉ được xét sau cổng M4.
- `BRIEF.md` vẫn là placeholder; PRD hiện dựa trên issue list, technical overview và contract đã chấp nhận. Nhóm cần điền brief gốc nếu muốn dùng nó làm nguồn yêu cầu độc lập.
- Xác nhận kết quả GitHub CI từ xa khi run hoàn tất; trạng thái local ở trên không chứng minh CI xanh.
