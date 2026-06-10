# Kiến trúc và luồng hoạt động của html-video

> Cập nhật: 2026-06-10  
> Mục đích: bản đồ kỹ thuật trước khi sửa hoặc thêm chức năng.  
> Nguồn sự thật: code hiện tại trên nhánh đang checkout. Các RFC trong `research/`
> giải thích lịch sử và ý định thiết kế, nhưng một số RFC đã bị code mới thay thế.

## 1. Tóm tắt hệ thống

`html-video` là một monorepo TypeScript dùng `pnpm`. Hệ thống nhận nội dung từ
người dùng, dùng coding agent tạo một hoặc nhiều trang HTML động, cho xem trước
trong Studio, rồi render từng frame thành MP4 qua engine adapter và ghép chúng
bằng `ffmpeg`.

Luồng production hiện tại:

```text
Browser Studio (vanilla JS)
        |
        | REST + SSE
        v
CLI Studio server
        |
        +--> local coding-agent runtime
        |      (AMR / Anthropic API / Claude / Codex / ...)
        |
        +--> ProjectOrchestrator
               |
               +--> JSON/file persistence dưới .html-video/
               +--> ContentGraph + frame HTML
               +--> EngineRegistry
                       |
                       +--> Hyperframes adapter (Playwright recording)
                       +--> Remotion adapter (bridge hoặc native TSX)
               |
               +--> ffmpeg concat + audio mux
```

Kiến trúc có hai đường tạo video:

- **Single-frame fast path**: agent tạo một `preview.html`, adapter render trực tiếp.
- **Multi-frame path**: agent tạo `content-graph.json`, sau đó tạo một HTML page
  cho mỗi node. Core render từng frame rồi ghép thành video.

Remotion hiện là một **enhancement theo frame**, không phải engine tự động thay
toàn bộ project. HTML/Playwright vẫn là nền mặc định.

## 2. Môi trường phát triển

Project nhắm đến Linux. Trên máy Windows này, mọi lệnh build, test, dev, render,
Playwright, Remotion và ffmpeg phải chạy trong WSL.

```bash
wsl
cd /mnt/d/Workspace/html-video
pnpm install
pnpm -r build
pnpm -r test
pnpm --filter @html-video/cli smoke
```

Yêu cầu chính:

- Node.js `>=20`
- pnpm `>=9` (repo khai báo `pnpm@9.15.0`)
- Chromium của Playwright cho Hyperframes adapter
- `ffmpeg` trên `PATH` để ghép multi-frame và mux audio
- Remotion peer dependencies nếu muốn dùng Remotion adapter

## 3. Bản đồ package

| Package | Vai trò hiện tại |
| --- | --- |
| `packages/core` | Types, registry, persistence, asset store, project orchestration, export, MiniMax audio |
| `packages/content-graph` | Intermediate representation cho video đa frame, validation và ordering |
| `packages/adapter-hyperframes` | Render HTML bằng Playwright record-video rồi ffmpeg encode |
| `packages/adapter-remotion` | Render HTML bridge hoặc native React/TSX bằng Remotion |
| `packages/runtime` | Phát hiện và gọi coding agent qua CLI, HTTP hoặc ACP |
| `packages/cli` | Binary `html-video`, REST/SSE Studio server và conversation orchestration |
| `packages/project-studio` | Production Studio dạng static HTML/CSS/vanilla JS, cổng 3071 |
| `packages/studio-next` | Spike React/Vite thử `@hyperframes/studio`; không phải production |
| `templates/*` | Template metadata, source, preview và attribution |

CodeGraph tại thời điểm khảo sát index 88 file mã nguồn, 736 symbols và 2457
dependency edges. Repo hiện có 23 thư mục template.

## 4. Bootstrap và CLI

Entry point là `packages/cli/src/bin.ts`.

Mỗi command gọi `bootstrap()` trong `packages/cli/src/context.ts`:

1. Tìm project root qua `.html-video`, `pnpm-workspace.yaml`, hoặc
   `package.json` + `templates/`.
2. Tạo `EngineRegistry`.
3. Luôn đăng ký Hyperframes adapter.
4. Chỉ đăng ký Remotion adapter khi peer dependencies được phát hiện.
5. Scan `templates/*/template.html-video.yaml` vào `TemplateRegistry`.
6. Tạo `ProjectStore`, `AssetStore`, `ProjectOrchestrator` và `MediaConfigStore`.

Các nhóm lệnh chính:

- Chẩn đoán: `doctor`, `list-engines`
- Template: `search-templates`, `inspect-template`
- Project: create/list/show/delete, assets, variables, preview, render
- Studio: `html-video studio --port 3071`

CLI và Studio dùng chung `CliContext`, nên thay đổi core thường ảnh hưởng cả hai.

## 5. Persistence và dữ liệu runtime

Không có database. Mọi dữ liệu được lưu dưới `.html-video/`, thư mục này đã
được gitignore.

```text
.html-video/
|-- media-config.json
`-- projects/
    `-- <project-id>/
        |-- project.json
        |-- messages.json
        |-- last-prompt.txt
        |-- last-prompt.prev.txt
        |-- preview.html
        |-- content-graph.json
        |-- assets/
        |   `-- <content-hash>.<ext>
        |-- frames/
        |   |-- 01-intro.html
        |   |-- 01.mp4
        |   |-- native-preview-<node>.mp4
        |   `-- concat.txt
        `-- output-<timestamp>.mp4
```

### Project

`Project` là aggregate chính, gồm:

- metadata: `id`, `name`, `intent`, timestamps
- `assets[]`
- template, agent và model đang chọn
- preferences: resolution, fps, aspect, language, commercial...
- single-frame preview/output paths
- `contentGraphPath` và `frames[]`
- export history, tối đa 20 bản
- soundtrack: music, narration và mix settings

`ProjectStore` ghi trực tiếp `project.json`. Hiện không có schema version,
migration, lock hoặc atomic temp-file rename cho metadata.

### Asset

`AssetStore` lưu file theo content hash trong project. Text/data inline cũng được
ghi thành `.txt` hoặc `.json`. Project chỉ giữ metadata và đường dẫn asset.

### ContentGraph

Content graph có ba node kind:

- `entity`
- `data`
- `text`

Và ba edge kind:

- `dependency`: hard ordering constraint
- `sequence`: soft ordering preference
- `contrast`: semantic only, không ảnh hưởng thứ tự

`validate()` kiểm tra node/edge/cycle. `topoSort()` dùng dependency trước,
sequence làm tie-breaker, rồi giữ original order để deterministic.

### FrameRecord

Mỗi frame ánh xạ 1:1 với graph node:

- `graphNodeId`
- absolute `htmlPath`
- `durationSec`
- `order`
- optional engine override
- optional native Remotion template/data/preview MP4

HTML gốc luôn được giữ khi frame được enhance bằng Remotion, nên unenhance không
phá nội dung nền.

## 6. Studio production

Production UI nằm ở `packages/project-studio/public/`, không có bundler.
`app.js` giữ toàn bộ client state và gọi REST/SSE trực tiếp.

Server nằm ở `packages/cli/src/studio-server.ts` và đồng thời:

- phục vụ static UI
- quản lý project/assets/templates
- quản lý agent/model
- chạy conversation state machine
- build prompt và parse agent output
- fetch URL/GitHub source
- render preview
- export video
- generate audio/narration

Các API quan trọng:

```text
GET/POST   /api/projects
GET/PATCH/DELETE /api/projects/:id
POST       /api/projects/:id/assets
PUT        /api/projects/:id/template
PUT        /api/projects/:id/agent
GET/POST   /api/projects/:id/messages
GET/PUT    /api/projects/:id/raw-html
GET/PUT    /api/projects/:id/frames/:node/raw-html
POST       /api/projects/:id/frames/:node/enhance
POST       /api/projects/:id/frames/:node/unenhance
GET        /api/projects/:id/content-graph
POST       /api/projects/:id/export
POST       /api/projects/:id/generate-audio
POST       /api/projects/:id/draft-narration
GET        /api/agents
GET        /api/agents/:id/models
POST       /api/agents/:id/login
POST       /api/agents/:id/test
GET/POST/DELETE /api/config/minimax
```

### Conversation state machine

`detectPhase()` điều khiển flow card/chat:

```text
opener -> type -> content -> style -> format -> confirm -> generate
```

Sau khi đã generate:

- pin một frame: iterate riêng frame đó
- đổi style: restyle toàn bộ frame nhưng giữ graph text
- đổi content: plan lại graph và render lại
- đổi duration: giữ content, cập nhật timing và render lại
- yêu cầu mơ hồ: mở edit menu thay vì tự đoán

State machine phụ thuộc vào:

- lịch sử `messages.json`
- hidden card metadata trong assistant message
- marker như `[hv-form:submit]` và `[hv-confirm:generate]`
- regex tiếng Trung/Anh để phân loại intent

Đây là khu vực có rủi ro regression cao khi thêm loại card hoặc thay đổi wording.

### Agent output protocol

Single-frame:

````text
```html
<!doctype html>...
```
````

Multi-frame:

````text
```json#content-graph
{ ... }
```

```html#intro
<!doctype html>...
```
````

Đường multi-frame production thường chạy split generation:

1. Một agent call chỉ để plan content graph.
2. Validate và persist graph.
3. Một agent call cho mỗi node để tạo đúng một HTML page.
4. Ghi frame theo topo order.

Cách này tránh output quá dài và empty reply khi yêu cầu graph + nhiều HTML page
trong một agent call.

### Source ingestion

Khi message chứa URL:

- GitHub URL: gọi GitHub API, lấy metadata, README và top-level tree.
- URL khác: tải HTML, lấy main content và chuyển sang Markdown.
- Nội dung được lưu thành text asset rồi gắn vào prompt ở các turn sau.

URL fetch có public-URL validation để hạn chế SSRF. Fetch lỗi là non-fatal.

## 7. Agent runtime

`packages/runtime` cung cấp một abstraction thống nhất cho:

- HTTP agent: Anthropic API
- ACP JSON-RPC: AMR/Vela
- CLI agents: Claude, Codex, Cursor Agent, Gemini, Grok, Qwen, OpenCode,
  Copilot, Aider, Trae CLI, Hermes

`detectAll()`:

- chạy detection song song
- cache kết quả 5 phút
- kiểm tra binary/version hoặc HTTP credentials
- hỗ trợ binary fallback và bundled resolver

`spawnAgent()` có ba nhánh:

1. HTTP handler dùng `fetch`
2. ACP handshake qua stdio JSON-RPC
3. CLI child process

CLI output dùng `StringDecoder` để tránh hỏng UTF-8 khi CJK character bị chia
qua nhiều stdout chunk.

Lưu ý: `packages/cli/src/task-registry.ts` đã có abstraction cho detached task
và event replay, nhưng hiện chưa được import/tích hợp vào Studio server. Studio
vẫn dùng SSE trực tiếp và `GENERATING` in-memory set.

## 8. Template và registry

Mỗi thư mục template có `template.html-video.yaml`. Registry scan đúng một cấp
dưới `templates/` và gắn `__dir` runtime.

Metadata quan trọng:

- engine và source entry
- category/tags/best_for
- output/aspect/fps/duration
- input schema/examples
- license/provenance/author
- preview assets
- native Remotion composition id nếu có

Template search hiện là heuristic:

- token match vào tags, best_for, name, description và category
- cộng điểm aspect
- filter license
- filter engine availability

Registry hiện parse YAML bằng type cast, chưa validate metadata bằng AJV dù core
đã có dependency AJV. Template sai shape có thể chỉ lỗi muộn ở UI/render.

## 9. Render pipeline

### Single-frame export

1. Project phải có `templateId`.
2. Resolve template metadata thành `TemplateRef`.
3. Lấy adapter theo `template.engine`.
4. Render với duration `auto`.
5. Mux soundtrack nếu có.
6. Ghi export history và status `rendered`.

### Multi-frame export

1. Sort `frames[]` theo `order`.
2. Resolve engine/template cho từng frame.
3. Render từng frame thành `frames/NN.mp4`.
4. Nếu tất cả cùng engine: ffmpeg concat demuxer + stream copy.
5. Nếu mixed engines: ffmpeg concat filter + re-encode H.264 để rebuild PTS.
6. Mux music/narration.
7. Persist output path và export history.

Per-frame duration dùng `durationMode: explicit`, nên adapter không được tự kéo
dài frame vượt thời lượng người dùng chọn.

### Hyperframes adapter

Tên package là Hyperframes, nhưng render path hiện tại không gọi Hyperframes
upstream runtime. Nó dùng:

- Playwright Chromium
- `recordVideo` thành WebM
- ffmpeg encode/crop/pad thành output

Các xử lý quan trọng:

- freeze CSS animation trước page load
- chờ stylesheet/font rồi mới unfreeze
- probe finite CSS/GSAP animation duration khi duration là `auto`
- inline multi-composition HTML để tránh giới hạn `file://`
- trim thời gian page/font load khỏi video

Đây là wall-clock recording, không phải deterministic frame rendering.

### Remotion adapter

Adapter chỉ được register khi Remotion dependencies có sẵn.

Hai mode:

- **bridge**: đọc HTML, neutralize blocking external stylesheets, truyền vào
  `HtmlFrameDriver` qua iframe `srcdoc`, seek CSS/GSAP theo Remotion frame clock.
- **native**: bundle template `entry.ts`, chọn composition id, truyền structured
  data qua `inputProps`.

Bundle được cache theo entry path trong process.

Native flow hiện có template `frame-data-rollup`, dành cho data node. Enhance:

1. kiểm tra graph node là `data`
2. normalize `{items:[{label,value}]}`
3. set frame engine = `remotion`
4. lưu native template id và snapshot data
5. render một preview MP4 riêng

### Audio

MiniMax có thể tạo:

- background music
- narration/TTS

Credentials nằm trong `.html-video/media-config.json`, ưu tiên hơn environment
variables. Export dùng ffmpeg:

- video stream copy
- audio encode AAC
- music volume/fade
- narration volume
- `amix` khi có cả music và narration
- `-shortest` để giữ độ dài theo video

## 10. Frontend hiện tại và spike

`packages/project-studio` là production Studio. Nó là vanilla JS, khoảng 3.2K
dòng trong `app.js`.

`packages/studio-next` chỉ là research spike:

- React 19 + Vite
- `SourceEditor` từ `@hyperframes/studio` dùng được
- Player/Timeline/NLE không dùng được nếu không xây backend/runtime contract của
  Hyperframes
- không được thêm dependency production vào package này

Nếu thêm UI feature production, mặc định sửa `project-studio` và
`studio-server.ts`, không sửa `studio-next`.

## 11. Điểm mở rộng

### Thêm project feature

Thứ tự khuyến nghị:

1. Thêm type optional trong `packages/core/src/types/index.ts`.
2. Thêm invariant/method trong `ProjectOrchestrator`.
3. Thêm REST API mỏng trong Studio server.
4. Thêm client API/state/UI trong `project-studio/public/app.js`.
5. Thêm CLI command nếu feature cần dùng ngoài Studio.
6. Test persistence cũ không có field mới.

Không ghi business rule trực tiếp trong UI nếu rule có thể tái sử dụng bởi CLI.

### Thêm engine adapter

1. Tạo `@html-video/adapter-<id>`.
2. Implement `EngineAdapter`.
3. Khai báo capabilities và validation trung thực.
4. Register có điều kiện trong `bootstrap()`.
5. Thêm template thuộc engine đó.
6. Test single-frame, multi-frame cùng engine và mixed-engine concat.

Core không có auto fallback giữa engines. Render fail phải fail rõ ràng.

### Thêm template

1. Tạo folder trực tiếp dưới `templates/`.
2. Thêm metadata, source, preview, license và provenance.
3. Với native Remotion, thêm `native.compositionId`.
4. Kiểm tra registry scan và render thật.

Template thuộc đúng một engine. Không dùng cùng id cho nhiều implementation.

### Thêm conversation phase/card

Phải cập nhật đồng bộ:

- `ConvPhase` và `detectPhase()`
- prompt/card generation
- hidden metadata/markers
- frontend card renderer và click payload
- post-generation routing
- tests cho typed reply, click reply và reload từ `messages.json`

Tránh regex whitelist quá hẹp. Flow hiện cố ý dùng default edit-menu sau generate.

## 12. Điểm nóng và rủi ro kỹ thuật

1. **Studio server monolith**  
   `studio-server.ts` khoảng 3.4K dòng, trộn transport, state machine, prompt,
   agent invocation, parsing, persistence và media APIs.

2. **Frontend monolith**  
   `app.js` khoảng 3.2K dòng, global mutable state và render thủ công.

3. **Persistence không versioned**  
   Project JSON không có migration. Field mới nên optional và có default khi đọc.

4. **Absolute paths trong project JSON**  
   Di chuyển repo hoặc copy `.html-video` sang máy khác có thể làm hỏng asset,
   frame và output paths.

5. **Template metadata chưa validate sớm**  
   YAML malformed shape có thể gây lỗi muộn.

6. **Task durability chưa hoàn chỉnh**  
   Generation state chỉ sống trong Studio process. Restart làm mất in-flight run.
   `TaskRegistry` tồn tại nhưng chưa nối vào route/UI.

7. **Cancellation không đồng đều**  
   Hyperframes có AbortSignal checks; Remotion chỉ check trước/sau nhưng
   `renderMedia()` không bị cancel thực sự.

8. **Network-dependent fonts/assets**  
   Hai adapter xử lý khác nhau. Render regression phải kiểm tra MP4 thật, không
   chỉ iframe preview.

9. **Mixed-engine timestamp sensitivity**  
   Không thay concat filter bằng concat demuxer cho mixed engines.

10. **Test coverage thấp**  
    Hiện có 5 test file, tập trung vào resource neutralization, upload filename,
    format parsing và runtime UTF-8/Trae. Chưa có regression test mạnh cho:
    - project persistence
    - content graph ordering
    - conversation state machine
    - multi-frame export
    - mixed-engine concat
    - audio mux
    - Studio API

## 13. Quy tắc khi sửa

- Chạy mọi command qua WSL.
- Đọc `CLAUDE.md`, file này, rồi ADR/CONTEXT nếu chúng xuất hiện sau này.
- Với ngôn ngữ nội dung video, đọc
  `docs/design/video-content-language.md` và ADR-0001.
- Coi code là nguồn sự thật; kiểm tra RFC nào đã bị supersede.
- Không sửa `README.md` hoặc publish/push nếu chưa review theo quy tắc repo.
- Không làm mất HTML base khi thêm native enhancement.
- Với render change, kiểm tra output MP4 thật bằng `ffprobe` và full decode.
- Với Studio intent/state change, chạy end-to-end qua UI/agent; typecheck không đủ.
- Giữ backward compatibility với `project.json` cũ.

## 14. File nên đọc theo loại thay đổi

| Muốn sửa | Đọc trước |
| --- | --- |
| Project model/persistence | `core/src/types/index.ts`, `core/src/registry.ts`, `core/src/project.ts` |
| Content graph/order | `content-graph/src/index.ts`, `core/src/project.ts` |
| CLI command | `cli/src/bin.ts`, `cli/src/context.ts`, `cli/src/commands/*` |
| Studio API/chat | `cli/src/studio-server.ts`, `project-studio/public/app.js` |
| Agent integration | `runtime/src/types.ts`, `registry.ts`, `detect.ts`, `spawn.ts` |
| Hyperframes render | `adapter-hyperframes/src/render.ts` |
| Remotion render | `adapter-remotion/src/render.ts`, `src/bridge/*` |
| Template | target `templates/<id>/`, RFC-02 và RFC-07 |
| Audio | `core/src/minimax.ts`, `cli/src/media-config.ts`, soundtrack routes |

## 15. CodeGraph queries hữu ích

Repo đã có `.codegraph/`. Khi điều tra, ưu tiên:

```text
codegraph_context("<feature/bug cần hiểu>")
codegraph_trace("<entry symbol>", "<destination symbol>")
codegraph_callers("<symbol sẽ sửa>")
codegraph_impact("<type hoặc method sẽ đổi>")
```

Các symbol trung tâm:

- `bootstrap`
- `startStudioServer`
- `detectPhase`
- `runSplitMultiFrameGenerate`
- `ProjectOrchestrator`
- `writeContentGraph`
- `writeFrameHtml`
- `exportMp4`
- `resolveFrameTemplateRef`
- `concatFramesWithFfmpeg`
- `spawnAgent`
