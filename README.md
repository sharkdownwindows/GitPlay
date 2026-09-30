# GitScope

GitScope là công cụ học Git bằng trực quan hóa: người học nhập lệnh, theo dõi commit DAG thay đổi, và giải level có kiểm tra mục tiêu tự động. Engine được đối chiếu với `git` thật bằng differential testing; report kiểm chứng và benchmark xuất hiện trong tab Verification.

**Phạm vi sản phẩm:** Tier 1-only. Ứng dụng gồm engine năm lệnh (`commit`, `branch`, `switch`, `checkout`, `merge`), terminal, graph, 8 level, Command Reference, undo/redo, Verification và tiến độ localStorage. Không triển khai `add`, authentication, server hoặc sync. Trọng tâm hiện tại là UI polish, user evaluation, stability và demo. Xem [trạng thái mốc](docs/STATUS.md).

## Chạy local

Yêu cầu Node 20+ (CI chạy Node 24).

```bash
npm ci
npm run dev
```

Mở địa chỉ local Vite được in trong terminal. Ứng dụng không cần backend; tiến độ level được lưu trong localStorage của trình duyệt.

## Kiểm tra và benchmark

```bash
npm test
npm run typecheck
npm run build
npm run lint:imports
```

| Lệnh | Mục đích |
|---|---|
| `npm run dev` | Chạy ứng dụng bằng Vite dev server |
| `npm run build` | Typecheck và tạo production build tĩnh |
| `npm run typecheck` | Chỉ chạy TypeScript typecheck |
| `npm test` | Chạy unit test bằng Vitest |
| `npm run lint:imports` | Kiểm tra luật phụ thuộc của core và progress |
| `npm run diff:quick` | Differential test: vét cạn depth 3 và 5.000 case random |
| `npm run diff:deep` | Differential test vét cạn depth 4, chạy nightly |
| `npm run bench` | Benchmark `src/viz/layout.ts` trên DAG n = 10²…10⁵ |
| `npm run report` | Gộp kết quả diff và benchmark vào `public/verification.json` |

Unit test đặt cạnh source tương ứng, ví dụ `commit.ts` và `commit.test.ts`.

## Kiến trúc

```mermaid
flowchart TB
    subgraph Browser["Ứng dụng tĩnh trong browser"]
        shell["app/store · bootstrap"]
        core["core · Git engine"]
        terminal["terminal · parser + UI"]
        graph["viz · deterministic layout + SVG"]
        levels["levels · 8 level + goal checker"]
        reference["commands-ref"]
        verify["verification tab"]
        progress["progress · localStorage"]
        shell --> core
        shell --> terminal
        shell --> graph
        shell --> levels
        shell --> reference
        shell --> verify
        shell --> progress
        terminal --> core
        graph --> core
        levels --> core
        reference --> core
    end

    harness["Node harness · diff-test + benchmark"]
    git[("git thật trong tmpdir")]
    report["public/verification.json"]
    harness --> core
    harness --> graph
    harness <--> git
    harness --> report
    report --> verify
```

- `core/` không phụ thuộc React, DOM, browser API hoặc UI; harness Node import trực tiếp engine.
- Parser kiểm cú pháp; engine kiểm trạng thái repository. UI state thay đổi qua application store.
- Layout tất định và không sửa `RepoState`.
- Tiến độ chỉ nằm trong localStorage. Static build không cần backend.
- Các tab gặp nhau qua `app/store.ts`; Command Reference dùng lại layout và engine cho sơ đồ mini.

## Cấu trúc chính

```
src/core/          Git engine thuần
src/viz/           visualizer và layout thuần
src/terminal/      parser, formatter và terminal UI
src/levels/        schema, goal checker và 8 level
src/progress/      localStorage progress store
src/verification/  tab đọc public/verification.json
src/commands-ref/  tham chiếu 5 lệnh và sơ đồ mini
src/app/           app shell và store
harness/           differential test và benchmark chạy bằng Node
```

## Trạng thái hiện tại

M4 hoàn tất; bằng chứng differential test, invalid gate, benchmark và report CI được ghi trong [docs/STATUS.md](docs/STATUS.md). M5 chính thức chốt sản phẩm Tier 1-only. Còn lại là issues #61–#64, sau đó UI polish, stability và demo M6. Kế hoạch chi tiết ở [docs/ISSUES.md](docs/ISSUES.md).
