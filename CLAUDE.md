# Hanoi Noir · Vụ Án Sài Gòn — tài liệu cho Claude

File này tự động được nạp vào mỗi session mới. Nó tóm tắt kiến trúc, logic và giao diện để không phải khảo sát lại
từ đầu. `README.md` là bản cho người đọc (có thêm ghi chú thiết kế chi tiết từng luật). Khi sửa code làm thay đổi
điều được mô tả ở đây, hãy cập nhật file này.

Ngôn ngữ: toàn bộ chữ trong game, comment và commit đều là **tiếng Việt**. Giữ nguyên phong cách đó.

## 0. Làm việc nhanh (đọc trước)

- **Thêm vụ án mới**: dùng skill `/new-case` hoặc đọc `docs/new-case.md` (quy trình, luật ngầm, lược đồ, cách vẽ cảnh) và `docs/cases-index.md` (tóm tắt từng vụ, cơ chế đố đã dùng, ý tưởng chưa dùng).
  **Đừng đọc nguyên `sg.js`, `sg-vani.js`, `rules.js`**: Grep theo mã hồ sơ hoặc đọc theo `offset/limit`.
- `npm run check-case -- <id> --table`: kiểm tra mọi luật dữ liệu chung của một vụ trong vài giây (lỗi, cảnh báo, lộ trình gợi ý, bảng ngoại phạm).
- `npm run scenes` → `/tools/scenes.html?case=<id>&k=<cảnh>&ev=1`: xem mọi cảnh và hình chứng cứ của vụ kèm chấm vị trí điểm điều tra.
- Chạy lệnh bằng PowerShell; thông điệp commit nhiều dòng thì ghi vào file rồi `git commit -F` (dấu ngoặc kép làm vỡ lệnh).

## 1. Tổng quan

- Game điều tra 4 vụ án ở Sài Gòn (`REGIONS` hiện chỉ có `sg`; các vụ Hà Nội đã bị gỡ, menu chỉ hiện thanh chọn vùng khi có từ hai vùng). Cơ chế riêng:
  suy luận, khóa mã, giờ máy lệch, hồ sơ về muộn, xét xử nhiều người. **Hồ sơ và chứng cứ không được mất theo thời gian** (không dùng diễn biến `gone`/`leave`)
  và **ngân sách giờ của vụ ≥ nửa số điểm điều tra** (30 điểm → ≥ 15 giờ); hai điều này có test canh trong `tests/rules.test.js`. Chạy trên trình duyệt, toàn màn hình, panorama kéo ngang.
- JavaScript thuần (ES module), không framework lớn. Giao diện chủ yếu là chuỗi HTML do `templates.js` sinh ra, gán bằng `innerHTML`; riêng **Sổ tay** là component Preact (`ui/notebook.js`, viết bằng `htm`, không cần biên dịch JSX).
- Thư viện: Vite 8, Tailwind CSS 4 (`@tailwindcss/vite`), GSAP (hoạt ảnh UI), Phaser 4.2.1 (nền cảnh + hiệu ứng),
  Font Awesome SVG core (icon), Preact 11 + htm (Sổ tay), `vite-plugin-singlefile`. Test dùng `preact-render-to-string`.
- Build ra **một file** `dist/index.html` (JS, CSS, SVG gộp hết), mở trực tiếp bằng trình duyệt được, **không cần mạng**:
  font nhúng từ `@fontsource` (`src/styles/fonts.css`, chỉ woff2, latin + vietnamese; thêm độ đậm mới = thêm khối `@font-face` ở đó).
- Lệnh: `npm run dev` · `npm run build` · `npm run preview` · `npm test` (`node --test`, 154 test, không cần trình duyệt) ·
  `npm run lint` (ESLint) · `npm run e2e` (build + mở bản build bằng Chrome thật qua `playwright-core`, `tests/e2e/smoke.mjs`).
- Không có router, không backend. Lưu tiến độ bằng `localStorage`.
- `dist/` và `node_modules/` bị gitignore.

## 2. Cấu trúc thư mục

```
index.html            Khung trang (id cố định, xem mục 6)
vite.config.js        Alias Phaser core, vá cờ build Phaser, singlefile
public/               PWA, chép nguyên sang dist/: manifest.webmanifest (display fullscreen, orientation landscape), sw.js (network-first, chỉ đăng ký khi build chạy qua http(s)), icon PNG (sinh bằng tools/make-icons.mjs)
src/
  main.js             Điểm vào: đăng ký icon FA, chặn click sau khi kéo, ủy quyền data-action, gọi boot()
  app.js              Bộ điều khiển: store + render + luồng chơi + bảng actions
  state/store.js      createStore: get / set(patch, quiet) / subscribe (quiet = đổi mà không báo, dùng cho ghi chú đang gõ)
  game/rules.js       LUẬT CHƠI THUẦN (không DOM, không localStorage)
  game/save.js        localStorage: số sao, ván đang chơi, vùng đang xem
  data/cases.js       TYPES, REGIONS (chỉ sg); CASES = SG_CASES (phẳng: s1, s2, s3, s4) + casesOf(region)
  data/sg.js          Vùng Sài Gòn: vụ s1 "Đỉnh Triều Bến Vân Đồn" (suy luận, khóa mã, giờ máy lệch, xét xử nhiều người); gộp thêm vụ s2 từ sg-vani.js, vụ s3 từ sg-bitexco.js và vụ s4 từ sg-landmark.js
  data/sg-vani.js     Vụ s2 "Mực Chưa Khô" (Vani Ecommerce, một thủ phạm: suy luận, múi giờ Thái Bình Dương, khóa mã, hồ sơ về muộn)
  data/sg-bitexco.js  Vụ s3 "Búp Sen Đen" (tháp Bitexco, một thủ phạm: giờ chết bị dời bằng thẻ ra vào, vòng loại trừ bốn lớp, khóa mã, hồ sơ về muộn)
  data/stories.js     Cốt truyện đầy đủ của từng vụ (STORIES[id]: mảng { part } và { at, title, text }, chuỗi thuần), cases.js gắn vào `c.story`; hiện ở màn thắng/thua và nút "Đọc lại cốt truyện" ở thẻ vụ đã giải
  data/sg-landmark.js Vụ s4 "Bốn Giây" (Landmark 81, một thủ phạm: người khuyên can bị nghi nhất, cuộc gọi giọng giả hẹn giờ, vòng loại trừ ở khung giờ cài lịch, tải trọng thang máy, khóa mã, hồ sơ về muộn)
  world/layout.js     Hằng số thế giới 2400x900, vị trí cửa
  world/doors.js      doorsFor(): sinh danh sách cửa của một địa điểm
  art/people.js       figure() và portrait(): người trong cảnh và chân dung, chung một bộ vẽ (tỉ lệ 6,9 đầu)
  art/kit.js          Đồ nghề vẽ SVG dùng chung: rect/path/circle/line/txt, gradient, glow/haze, lantern, tube, vase, bowl, lotus, candle, uid
  art/sg.js           Cảnh vùng Sài Gòn (sgLobby, sgSecroom, sgGarage, sgPenthouse, sgStreet, sgLab, menuSg + sgHouse, wires, sgCar)
  art/sg-vani.js      Cảnh vụ s2 (sgVaniGate, sgVaniOffice, sgVaniCeo, sgVaniPrint, sgVaniDock); phòng giám định dùng lại sgLab
  art/sg-btx.js       Cảnh vụ s3 (sgBtxPad, sgBtxLobby, sgBtxHall, sgBtxLounge, sgBtxOps); phòng giám định dùng lại sgLab
  art/sg-lm.js        Cảnh vụ s4 (sgLmDeck, sgLmParty, sgLmOps, sgLmOffice, sgLmGround); phòng giám định dùng lại sgLab
  art/art.js          Hai bên thế giới (FLANK/widen), khung camera, tài liệu, bảng đăng ký SCENES (cảnh Hà Nội đã bị gỡ, còn ~20 KB)
  render/world.js     Lớp Phaser: raster hóa SVG nền, vẽ, đồng bộ với DOM
  render/lighting.js  Ánh sáng thật (Phaser Lights): đèn pin, nguồn sáng dò trong tranh, quầng sáng, chỉnh màu
  render/analyze.js   Từ nền đã raster: bản đồ pháp tuyến giả, vị trí nguồn sáng, probe màu (async, chia lát 6 ms để không khựng)
  render/actors.js    Nhân vật thành mảnh riêng: thở, nghiêng theo con trỏ, đổ bóng
  ui/notebook.js      Sổ tay: component Preact (Notebook, ClueList, Icon) + mountNotebook/unmountNotebook
  ui/icon-lib.js      Đăng ký biểu tượng Font Awesome (import một lần; thêm icon mới ở đây)
  ui/pinboard.js      Bảng ghim kéo thả của tab Liên kết (sợi chỉ SVG, vẽ tay; Notebook gọi syncPinboard sau mỗi lần cập nhật)
  ui/coach.js         Hướng dẫn lần đầu chơi: chuỗi thẻ làm sáng từng nút (cờ `hanoi-noir-coach-v1`)
  ui/device.js        `LITE` (chế độ nhẹ): bật khi `pointer: coarse` (điện thoại/máy bảng), hoặc `?lite=1` / `?lite=0` để ép; gắn class `lite` lên `<html>`
  ui/fullscreen.js    Nút toàn màn hình: Fullscreen API + khóa ngang (Android); `initFullscreen` gắn `html.no-fs` khi không hỗ trợ
  ui/stage.js         Camera panorama (kéo, bánh xe, phím), nối DOM với Phaser
  ui/cursor.js        Đèn pin theo con trỏ + độ nghiêng parallax
  ui/flashlight.js    Hiện/mờ "dấu vết ẩn" theo khoảng cách tới đèn pin
  ui/ambience.js      Bụi (sprite), mưa và khói, ánh đèn lập lòe
  ui/templates.js     Mẫu HTML dạng chuỗi (menu, HUD, điểm điều tra, cửa, hộp thoại). Sổ tay không còn ở đây
  ui/overlays.js      Chuyển cảnh (veil), toast, sheet (modal), hoạt ảnh GSAP
  ui/dom.js           $, esc, icons, setHTML
  styles/main.css     Token @theme + toàn bộ CSS thành phần
  styles/fonts.css    @font-face nhúng (woff2 từ @fontsource), nạp trong main.js
  vendor/spector-stub.js  Module rỗng thay Spector.js mà Phaser nạp
docs/
  new-case.md         Hướng dẫn viết vụ mới: quy trình, luật ngầm, lược đồ, vẽ cảnh, danh sách việc
  cases-index.md      Tóm tắt từng vụ, cơ chế đố đã dùng, ý tưởng chưa dùng
tools/
  case-check.mjs      `npm run check-case`: kiểm tra dữ liệu một vụ (cũng xuất checkCase cho test)
  scenes.html + .js   `npm run scenes`: trang xem cảnh của vụ (không vào bản build)
.claude/skills/new-case/SKILL.md   Skill /new-case: quy trình thêm vụ, chỉ nạp khi cần
tests/
  nbhtml.js           Vẽ component Sổ tay ra chuỗi (preact-render-to-string) để các test dùng chung
  fixture.js          Vụ mẫu (không thuộc game) để thử gone/leave, chain, confront, links, spans/alibi
  rules.test.js       Luật chơi (trên vụ mẫu), cửa (cả 5–6 cửa), tính toàn vẹn dữ liệu mọi vụ, ngân sách giờ ≥ nửa số điểm, không hồ sơ mất theo thời gian
  save.test.js        Lưu/đọc ván đang chơi (mock localStorage)
  sg.test.js          Vùng Sài Gòn: suy luận, giờ máy lệch, khóa mã, hồ sơ về muộn, lời giải, xét xử nhiều người, giao diện s1
  sg-vani.test.js     Vụ s2: múi giờ PT, khung giờ bị hại, ngoại phạm, mã điện thoại, hồ sơ về muộn, hồ sơ không mất theo thời gian, lời giải và hai lối chứng cứ mỗi bước
  case-check.test.js  Công cụ kiểm tra vụ: mọi vụ sạch lỗi, và bắt được các lỗi dữ liệu hay gặp
  sg-btx.test.js      Vụ s3: giờ chết thật, xưng hô "cậu", vòng loại trừ, ngoại phạm, mã 5249, cổng mở khóa, hồ sơ về muộn, hai lối chứng cứ mỗi bước, giấy tờ gọn trong khung
  story.test.js       Cốt truyện (stories.js): mọi vụ đủ chương và mốc, khối gập ở màn thắng/thua, hộp thoại đọc lại, nút ở menu chỉ cho vụ đã giải, esc HTML
  sg-landmark.test.js Vụ s4: bàn tay kéo chứ không đẩy, cuộc gọi giọng giả, vòng loại trừ lúc 22:47, ngoại phạm, mã 1708, cổng mở khóa, hồ sơ về muộn, hai lối chứng cứ mỗi bước, giấy tờ gọn trong khung
  render.test.js      Số đo nhân vật (data-fig) mà people.js gắn vào mọi cảnh
  hints.test.js       Gợi ý: làm theo gợi ý từng bước thì mọi vụ đủ chứng cứ trong ngân sách giờ, và buộc tội đúng thắng
  notebook.test.js    Sổ tay: tìm không dấu, lọc, sao, ghi chú, tổng quan địa điểm, escape HTML
  e2e/smoke.mjs       Kiểm thử khói bằng Chrome thật (chạy bằng `npm run e2e`, không nằm trong `npm test`)
eslint.config.js      ESLint flat config (chỉ bắt lỗi thật)
.gitattributes        LF cho mọi file văn bản
.github/workflows/ci.yml  CI: lint, test, build, e2e
```

## 3. Luồng dữ liệu

```
click [data-action]  ->  main.js (ủy quyền)  ->  app.js actions[name](dataset)
   -> gọi hàm thuần trong game/rules.js  ->  store.set({game: next})
   -> subscribe: persistRun (lưu ván)  +  render()
   -> render(): templates.js sinh HTML  ->  setHTML()/stage.* cập nhật từng vùng DOM
```

- **Tất cả tương tác dùng `data-action="..."` + `data-*`**, không dùng `onclick`. Thêm hành động mới = thêm khóa vào
  `export const actions` trong `app.js` + gắn `data-action` trong template.
- State của store: `{ screen: "menu" | "case", save, game, nb, region }`
  - `save` = `{ unlocked, stars: {caseId: 1..3} }` (tiến độ vĩnh viễn)
  - `game` = ván đang chơi (xem 4.1), `nb` = sổ tay đang mở, `region` = vùng đang xem ở menu (`"sg"`, lưu riêng)
- Biến cục bộ trong `app.js` (không nằm trong store): `nbEpoch` (tăng mỗi lần vào vụ, về menu, khôi phục ván: đổi `key` để component Sổ tay dựng lại, xóa bộ lọc và ô ghi chú đang mở), `accuse` (`{culprit, steps, who, evid, facts}`: lựa chọn ở phiên xét xử, giữ giữa
  các lần thử), `lockEntry` (bàn phím số đang mở), `worldKey` (nhận biết đổi thế giới để reset camera), `announced` (phút đã báo diễn biến).
- Hành động ngoài các hành động cốt lõi: `region`; suy luận `dd-pick|dd-clear|dd-try`; khóa mã `lock-key|lock-del|lock-go`; `wait-do`;
  xét xử nhiều người `vd-who|vd-ev|vd-fact`; bảng ghim `lk-pair`; Sổ tay `fav|nb-tab` (tìm, lọc loại, mở ô ghi chú là state cục bộ của component, không có action); tổng quan địa điểm `overview|ov-go`; lời khai cận cảnh `tm-close`; gợi ý `hint|hint-more`; xem lại hướng dẫn `coach-reset`.
- `setHTML(el, html)` chỉ gán `innerHTML` khi chuỗi đổi (cache ở `el.__html`) rồi chạy `icons()` để đổi `<i class="fa-...">`
  thành SVG. Gán `innerHTML` trực tiếp phải tự gọi `icons(node)` (xem `showSheet`).
- Phím: `Esc` đóng sheet rồi đóng sổ tay; `← → Home End` pan camera và `M` mở tổng quan địa điểm khi không có sheet và không đang gõ trong `input/textarea`; bàn phím số của khóa mã nhận 0–9, Backspace, Enter.

## 4. Luật chơi (`game/rules.js`)

Mọi hàm nhận state, trả state mới (bất biến). Hàm không đổi gì thì trả **đúng object cũ** (`next === g` là cách
`app.js` biết hành động bị từ chối).

### 4.1 Trạng thái `game` (từ `newGame`)
`idx, loc, hours (còn lại), lives (=3), done{id:true}, found[id theo thứ tự thu], marks{suspectId:0|1|2}, mx{"rid|act":0|1|2},
pick[], links[pairKey], lkResult, dpick[], ddResult, ddTries, ddFrom{}, lockTries{id:n}, confronted{"who|clue":true}, hints, hintId, fav{id:true}, notes{"a:id"|"s:id":text}, wrong, over, busy,
tab ("sus"|"ho"|"mx"|"lk"|"dd"|"tl")` — trường mới phải chịu được `undefined` vì `resumeRun` đọc ván lưu cũ (`fav`/`notes` được ép về object trơn ở đó).

### 4.2 Các cơ chế
| Cơ chế | Hàm chính | Ghi chú |
| --- | --- | --- |
| Điểm điều tra | `isOpen`, `performAct` | Trừ `cost` giờ, thêm vào `done`/`found`. Từ chối nếu `busy`, đã làm, hết giờ, đã `isGone`. Tự chuyển tab sổ tay sang "ho" |
| Đồng hồ | `nowMinutes`, `clockAt` | `clock.start` + (budget − hours) giờ. **Di chuyển giữa địa điểm không tốn giờ**. Qua nửa đêm xử lý bằng `absMinutes` |
| Diễn biến `world[]` | `eventsBetween`, `eventsDone`, `isGone`, `departed` | (engine hỗ trợ, nhưng vụ trong game KHÔNG dùng) `gone`: mất một hồ sơ chưa thu; `leave`: nghi phạm rời thành phố (lời khai chưa thu của họ mất, không đưa chứng cứ được). Hồ sơ đã thu không mất |
| Đưa chứng cứ | `questioned`, `confrontOptions`, `performConfront`, `reactionFor` | Tốn `CONFRONT_COST`=1 giờ. Chỉ người đã bị hỏi (có hồ sơ `visual.k==="who"` của họ). Mỗi cặp (who,clue) một lần. `confront[].reveal` mở lời khai mới (`via:"confront"`, `cost:0`, không đặt trên bản đồ) |
| Liên kết hồ sơ | `pickClue`, `checkPair`, `linkFor`, `linksOf` | Chọn tối đa 2 hồ sơ đã thu, đối chiếu **không tốn giờ**. Cặp đúng ghi vào `game.links` (khóa `pairKey` đã sort) |
| Dòng thời gian | `timelineEvents`, `alibisOf`, `hasTimeline` | `spans[]` của hồ sơ → mốc; `needs[]` phải thu đủ mới gắn `who`. `alibi` của lời khai được đối chiếu: `clash` (bị bác), `proof` (xác nhận), `open` |
| Ma trận đối chiếu | `cycleMatrix` | Chỉ vụ có `matrix` (hiện chỉ vụ 3). Ô quay vòng 0→1(✓)→2(✗) |
| Nhãn nghi phạm | `cycleMark` | Chỉ là ghi chú người chơi (chưa rõ / nghi ngờ / loại trừ) |
| Buộc tội (một thủ phạm) | `judge`, `loseLife` | `judge(c, culprit, picks)`: đúng người **và** cả 3 bước `chain` (mỗi bước chọn 1 hồ sơ nằm trong `ids`). Sai = mất 1 mạng, hết 3 mạng → `over` |
| Sao | `starsFor(wrong)`, `recordWin` | 0 sai = 3★, 1 sai = 2★, còn lại 1★; lưu bản tốt nhất |
| Suy luận | `pickDeduce`, `tryDeduce`, `deductionFor`, `closeDeductions` | Vụ có `deduce[{needs,gives}]`: ghép 2–`MAX_DEDUCE` hồ sơ, đúng cả tập thì nhận kết luận `gives` (hành động `via:"deduce"`, loại "Kết luận"), không tốn giờ |
| Mở khóa | `gated`, `unlocksOf` | Hành động có `gate: id` ẩn tới khi hồ sơ `id` (thường là kết luận) đã có |
| Khóa mã | `attemptLock` | `lock:{code,digits,prompt}`: sai `LOCK_TRIES` lần thì thiết bị tự khóa, mất `LOCK_PENALTY` giờ. Trạng thái: `open`/`wrong`/`locked`/`closed` |
| Hồ sơ về muộn | `pendingMinutes`, `isPending`, `arrivalOf`, `waitHours`, `waitFor` | Diễn biến `kind:"arrive"`: hồ sơ chỉ đọc được từ mốc `at`; chờ tốn số giờ nguyên tới mốc |
| Giờ máy lệch | `devices`, `closeDeductions` | Mốc `dev` lệch `off` phút tới khi kết luận `by` được rút ra, rồi alibi được đối chiếu lại |
| Ghi chú và tìm | `setNote`, `toggleFav`, `filterClues`, `fold`, `noteKey` | Chỉ là nháp của người chơi, không ảnh hưởng luật. `filterClues` tìm không dấu, mọi từ phải khớp (tiêu đề, nội dung, loại, tên người khai, ghi chú), trả mới nhất trước. `setNote` rỗng thì xóa, cắt ở `MAX_NOTE` |
| Tổng quan địa điểm | `overviewOf` | Mỗi địa điểm: `done/left/waiting/wakeAt/current`. Dùng `remainingAt` nên không đếm điểm còn bị `gate` hay đã `gone` |
| Gợi ý | `nextStep`, `spotOf` | Không tốn giờ, không ảnh hưởng sao. `nextStep` tìm hồ sơ then chốt (`chain`/`verdict.roles`) đầu tiên còn thiếu rồi đi ngược qua `gate`/`deduce`/`confront`/`arrive` ra việc cần làm (`go`/`wait`/`deduce`/`confront`/`accuse`). `game.hints` đếm số lần mở, `game.hintId` là điểm đang nhấp nháy |
| Xét xử nhiều người | `hasVerdict`, `judgeVerdict`, `culpritIds` | Vụ có `verdict:{roles,facts}` thay cho `chain`: mỗi vai đúng người và chứng cứ, mỗi câu dựng lại đúng. Phản hồi sai chỉ nói "vững/chưa vững" |

Tất cả vụ **mở từ đầu** (menu không khóa vụ nào); `save.unlocked` chỉ còn để tương thích bản lưu cũ.

### 4.3 Lưu trữ (`game/save.js`)
- `hanoi-noir-save-v2`: `{unlocked, stars}`. `hanoi-noir-run-v2`: `{idx, game}` ván đang chơi. `hanoi-noir-region-v1`: vùng đang xem (`loadRegion`/`storeRegion`).
- `persistRun` (subscribe) lưu sau **mỗi** thay đổi state ở màn điều tra; ván `over` thì xóa. Mở lại trang → `restoreRun`;
  chọn lại đúng vụ đang dở → tiếp tục (`resumeRun`), không bắt đầu lại.
- `resumeRun` từ chối khôi phục nếu dữ liệu vụ đã đổi (hồ sơ `found` không còn tồn tại, địa điểm không còn).
- Mọi truy cập `localStorage` bọc try/catch (chế độ riêng tư không làm hỏng game).

## 5. Dữ liệu vụ án (`data/cases.js`)

Xuất `TYPES` (loại hồ sơ → `cls`+icon FA: Lời khai, Vật chứng, Camera, Hồ sơ, Biên bản, Kết luận), `REGIONS` (tên, biểu tượng, cảnh nền menu, giới thiệu),
`CASES` (phẳng: `SG_CASES` từ `data/sg.js`, gồm s2 từ `data/sg-vani.js`, s3 từ `data/sg-bitexco.js` và s4 từ `data/sg-landmark.js`; chỉ số trong `CASES` là chỉ số vụ dùng cho bản lưu) và `casesOf(region)`.

| # | id | Tên | Địa điểm chính | Độ khó | Giờ | Bắt đầu | Thủ phạm | Tính năng thêm |
| - | -- | --- | --- | --- | --- | --- | --- | --- |
| 1 | s1 | Đỉnh Triều Bến Vân Đồn | Chung cư Sao Mai Riverside, Quận 4 (6 địa điểm, 30 điểm điều tra) | ★★★★★★★ | 15 | 21:00 | nhiều người (`verdict`) | deduce, lock, devices, arrive |
| 2 | s2 | Mực Chưa Khô | Vani Ecommerce, 59 Võ Văn Hát, Long Trường (6 địa điểm, 29 điểm điều tra, có án mạng) | ★★★★★★ | 15 | 23:10 | vu | deduce, lock, devices (giờ Thái Bình Dương, +15 giờ), arrive, gate, `chain` ba bước toàn bằng kết luận |
| 3 | s3 | Búp Sen Đen | Tháp tài chính Bitexco, 2 Hải Triều, Quận 1 (6 địa điểm, 30 điểm điều tra, có án mạng) | ★★★★★★★ | 15 | 23:20 | quan | deduce (17 kết luận), lock (5249), arrive (4 hồ sơ), gate (2), confront (5 người thú nhận chuyện riêng), `chain` ba bước khóa `time`/`access`/`motive`; không dùng devices |
| 4 | s4 | Bốn Giây | Tòa tháp Landmark 81, 208 Nguyễn Hữu Cảnh, Bình Thạnh (6 địa điểm, 30 điểm điều tra, có người rơi từ tầng 81) | ★★★★★★★ | 15 | 00:30 | diep | deduce (18 kết luận, 28 dòng), lock (1708), arrive (4 hồ sơ), gate (1), confront (5 người thú nhận chuyện riêng), `chain` ba bước khóa `cause`/`author`/`motive`; không dùng devices |

(Mỗi vụ có `clock`, `world` (chỉ `arrive`), `confront`; s1 dùng `verdict`, s2, s3 và s4 dùng `chain`. Khóa của các bước `chain` là tự do, chỉ cần đủ ba bước và khác nhau.)

### Lược đồ một vụ
Xem `docs/new-case.md` mục 5 (lược đồ đầy đủ) và mục 4 (luật ngầm: alibi/spans, suy luận, gợi ý, đưa chứng cứ, ngân sách).
Tóm tắt: `{ id, no, region, title, place, level, budget, clock, world(chỉ arrive), devices?, intro, suspects[6], locations[{id,name,time,scene,hs}], actions[], culprit + chain[3] | verdict, confront[], deduce[], explanation }`.

- Mỗi action thuộc **đúng một** vị trí `hs` (trừ `via:"confront"`, không có vị trí). Test kiểm tra điều này.
- Cảnh Sài Gòn: `sg_lobby`, `sg_secroom`, `sg_garage`, `sg_penthouse`, `sg_street`, `sg_lab` (+ nền menu `menu_sg`); vụ s2: `sg_vani_gate`, `sg_vani_office`, `sg_vani_ceo`, `sg_vani_print`, `sg_vani_dock` (và dùng lại `sg_lab`); vụ s3: `sg_btx_pad` (cảnh đầu tiên, cũng là hình thẻ vụ ở menu), `sg_btx_lobby`, `sg_btx_hall`, `sg_btx_lounge`, `sg_btx_ops` (và dùng lại `sg_lab`); vụ s4: `sg_lm_deck` (cảnh đầu tiên, cũng là hình thẻ vụ ở menu), `sg_lm_party`, `sg_lm_ops`, `sg_lm_office`, `sg_lm_ground` (và dùng lại `sg_lab`).
- **Thêm/sửa vụ phải giữ cho test xanh**: `npm test` có kiểm tra toàn vẹn dữ liệu, tính nhất quán dòng thời gian/đồng hồ, và
  tìm lời giải theo chiều rộng (mọi vụ vẫn thắng được kể cả khi tính hạn mất hồ sơ/nghi phạm rời đi).

## 6. Giao diện & thế giới panorama

### 6.1 Khung `index.html` (id cố định, code tham chiếu)
`#scene` (cuộn ngang) chứa `#gl` (canvas Phaser) và `#world` (DOM cùng kích thước thế giới) gồm `#world-art` (SVG/chữ),
`#world-doors`, `#world-hs`. Ngoài ra: `#pan-l`/`#pan-r` (nút xem hai bên), `#ui` (HUD bốn góc, `pointer-events-none`),
`#notebook` (+ `#nb-body`), `#curtain`/`#card` (chuyển cảnh), `#bars` (hai thanh đen phim), `#testimony` (lời khai cận cảnh), `#modal` (sheet),
`#toast`. `body[data-screen]` = `menu`|`case`.

### 6.2 Hệ tọa độ
- Cảnh gốc 1600×900 (tọa độ `hs` trong cases.js). Thế giới 2400×900 (`WORLD_W`, `WORLD_H`): cảnh gốc đặt lệch `OX=400`.
  Menu dùng thế giới 1600.
- `toWorldX(x) = x + OX`. Template đổi sang `%` của thế giới (`pctX`, `pctY`).
- Cửa: `DOOR_SLOTS = {left:[40,230], right:[2040,2220]}`, `DOOR_W=130`; `doorPlan` xếp xen kẽ trái/phải → 4 cửa
  (5 địa điểm). Địa điểm có 5–6 cửa (vụ 6–7 địa điểm, như vụ Sài Gòn) dùng `DOOR_COMPACT`: cửa hẹp 100, ba khe mỗi bên; `doorPlan` ném lỗi khi quá 6 cửa. Biển tên của khe lẻ nâng lên một hàng (`door-s1`) để không đè nhau. `doorsFor(locations, current)` tạo cửa tới các địa điểm khác.
- Hai bên thế giới do `widen()` trong art.js dựng: `FLANK[sceneKey]` chọn `room`, `sgstreet` (phố Sài Gòn) hoặc `roof` (sân thượng có mưa, dùng cho sân đáp tầng 52) (+ màu). Cảnh mới **phải có mục trong `FLANK`**.

### 6.3 Camera (`ui/stage.js`)
`scale = max(vh/900, vw/worldW)` (cover). Kéo chuột/chạm, bánh xe, phím, nút mép. Camera = `translate3d` của `#world`;
`gl.setView(view)` truyền `scale/x/top/worldW` sang Phaser nên hai lớp luôn khớp. Kéo > 6px đặt cờ `dragged`;
`main.js` chặn click ngay sau khi kéo (`consumeDrag`). `setArt(key, build, sceneKey)` bỏ qua nếu `key` không đổi.

### 6.4 Phaser (`render/world.js`, `ui/ambience.js`)
- `splitArt(svg)` tách `<text>`, mưa (`<g class="rain">`), khói (`path.smoke`) ra khỏi nền. Nền được raster hóa
  (SVG → Blob → Image → canvas → texture), **chữ ở lại DOM** (`overlay`) để dùng webfont. Raster xong mới thay ảnh cũ (token chống race).
- Không dùng camera Phaser; `WorldScene.update` tự đặt vị trí ảnh theo `artBox()` (có parallax `ART_PARALLAX` và zoom 1.03,
  phải khớp CSS `#world-art`).
- Nếu Phaser lỗi → `gl.active()` false → DOM giữ nguyên SVG đầy đủ (fallback).
- `AMBIENT` trong ambience.js bật hiệu ứng theo cảnh: `sg_street: {rain}`, `sg_btx_pad: {rain}`, `sg_lm_deck: {rain}`, `sg_lm_ground: {rain}` (khói `smoke` còn được hỗ trợ nhưng chưa cảnh nào dùng); bụi + ánh đèn lập lòe luôn có.
  Tắt hết khi `prefers-reduced-motion`.
- `vite.config.js`: import `phaser` được alias về `phaser-core.js` (bỏ vật lý/tilemap, nhỏ hơn ~140 KB gzip), thay các cờ
  `typeof CANVAS_RENDERER`… bằng hằng, `global → globalThis`, stub `phaser3spectorjs`. Cờ phải vá cả ở `optimizeDeps` (dev).

### 6.4b Hiệu năng điện thoại (chế độ nhẹ, `ui/device.js`)
- Phaser 4.2.1 **không có** tùy chọn `resolution` (canvas luôn bằng kích thước CSS); đừng thêm lại. CSS build chỉ giữ `-webkit-backdrop-filter` nên Chrome gần như không thấy blur (trừ `.hs-tag`); đừng kỳ vọng blur chạy trên Chrome.
- `LITE` làm: `html.lite` tắt mọi `backdrop-filter` và hạt phim `#scene::before` (CSS cuối main.css); `lighting.js` chỉ 3 đèn trong tranh và bỏ chỉnh màu camera; `ambience.js` bớt bụi (26) và mưa (70); `world.js` bỏ MSAA, raster nền mỏng hơn (`quality()` 0.6–1.2) và **ngủ vòng lặp** (`setPaused`, gọi từ `syncInert` trong overlays.js) khi hộp thoại mở hoặc sổ tay che màn hình <768px; nền mới vẽ xong hay đổi cỡ khi đang ngủ thì `refreshWhilePaused` cho chạy ngắn để canvas có hình.
- PC không đổi. Đo A/B (Chrome headless, tương đối): vòng lặp Phaser 27 → 47 fps lúc đứng yên khi bật chế độ nhẹ.
- `cursor.js` chỉ ghi biến CSS khi giá trị đổi và bỏ `--lx/--ly` khi đã `gl-lit` (biến CSS kế thừa: mỗi lần ghi tính lại style cả cây điểm điều tra); `flashlight.js` đọc hết vị trí rồi mới ghi class.
- `stage.js`: cờ `dragged` xóa ở mọi `pointerdown` (capture). Cảm ứng không bắn click sau khi kéo, cờ từng treo và nuốt cú chạm kế tiếp vào nút ngoài cảnh.

### 6.5 Đèn pin & dấu vết ẩn
`cursor.js` làm mượt vị trí con trỏ → CSS var `--lx --ly` (đèn) và `--px --py` (nghiêng parallax, chỉ với chuột),
rồi gọi `notifyLamp()`. `flashlight.js` đăng ký qua `onLampMove`: `.hs.is-secret` (chưa làm) có `is-lit` khi cách đèn <140px,
`is-near` khi <260px; đã làm thì template gắn sẵn `is-lit`. Cảnh dịch chuyển/điểm mới vẽ cũng gọi `notifyLamp()`.

### 6.6 Bố cục màn hình
- **Menu**: tiêu đề + nút Cách chơi / Xóa tiến độ (trên); dưới là thanh chọn vùng `.region-bar` (chỉ hiện khi có từ hai vùng; hiện chỉ có Sài Gòn nên ẩn) rồi dải thẻ vụ án `.case-card`
  của vùng đó, cuộn ngang. Nền menu đổi theo vùng (`menu` / `menu_sg`).
- **Toàn màn hình** (`.fs-btn`, action `fullscreen`): nút ở menu (cạnh Cách chơi) và HUD (cạnh số mạng). Hai biểu tượng `fs-in`/`fs-out` đổi bằng CSS `:root:fullscreen`; ẩn bằng `html.no-fs` hoặc `@media (display-mode: fullscreen|standalone)`. `#ui` lùi theo `env(safe-area-inset-*)` cho máy có tai thỏ. Menu có luật riêng cho màn hình ngang thấp (`max-height: 500px`): thẻ vụ án thu gọn, ẩn `.menu-note`/`.case-place`, nếu không thẻ che mất tiêu đề và nút phía trên.
- **Màn điều tra** (4 góc): trên trái = nút về menu + tên vụ; giữa = địa điểm; trên phải = đồng hồ, giờ còn lại, 3 mạng (tim);
  dưới trái = Sổ tay (kèm số hồ sơ), Gợi ý, Địa điểm (tổng quan, phím M); dưới giữa = gợi ý còn bao nhiêu điểm; dưới phải = Buộc tội.
- **Điểm điều tra** `.hs`: chip vàng 54px (xanh khi `is-done`, xám khi `is-off`) + nhãn; tốn >1 giờ thì nhãn ghi giờ.
- **Cửa** `.door` có biển tên `.door-sign` hiện tên + giờ địa điểm đích. Điểm điều tra đang chờ hồ sơ về muộn có `.is-wait` (xanh lạnh, đồng hồ cát).
- **Sổ tay** `#notebook`: ngăn kéo trái (desktop), tấm trượt từ dưới 82dvh (<768px). Là component Preact (`ui/notebook.js`), gắn bằng `mountNotebook($("nb-body"), {key: nbEpoch, game, c, onNote})` mỗi lần `renderCase`, gỡ bằng `unmountNotebook` ở menu. Tab Hồ sơ có ô tìm `[data-find]`, chip lọc loại, ★ `.fav` và ghi chú `textarea[data-note]` ở mỗi thẻ; tab Nghi phạm có ghi chú ở mỗi người. Bộ lọc và ô ghi chú mở là `useState`; bản nháp ghi chú nằm trong chính ô nhập nên gõ chữ (kể cả bộ gõ tiếng Việt) và focus không bị gián đoạn, `saveNote` lưu bằng `store.set` thường. Nút ảnh hưởng ván vẫn dùng `data-action` (ủy quyền ở `main.js`), nên `selectorOf` trả focus và e2e không đổi. Chân dung/hình chứng cứ là chuỗi SVG nhúng bằng `dangerouslySetInnerHTML` (`Raw`); icon dùng `<Icon n="star" r />` (r = bộ regular), **không** dùng thẻ `<i class="fa-…">` trong component vì `dom.i2svg` sẽ thay node ngoài tầm Preact. `keydown` toàn cục vẫn bỏ qua khi đang ở trong `input/textarea`. Tab: Nghi phạm · Hồ sơ · Đối chiếu (nếu `matrix`)
  · Liên kết (nếu `links`, là bảng ghim kéo thả) · Suy luận (nếu `deduce`) · Thời gian (nếu `hasTimeline`).
- **Sheet** `#modal > .sheet`: hộp thoại giấy (nền sáng, chữ tối): briefing, diễn biến, đưa chứng cứ, phản ứng, phiên xét xử (một hoặc nhiều người),
  kết quả (thắng có ảnh polaroid; thắng và thua đều có khối gập "Đọc lại toàn bộ cốt truyện" dựng từ `c.story`; vụ đã giải có nút `story` dưới thẻ ở menu, bọc trong `.case-wrap`, mở `storySheetHTML`), tổng quan địa điểm (`.ov-row`), bàn phím số, chờ hồ sơ về muộn, kết luận mới, cách chơi, xóa tiến độ.
- **Gợi ý**: nút bóng đèn cạnh Sổ tay (`data-action="hint"`). Mức 1 chỉ hướng, mức 2 (`hint-more`) nói rõ điểm hoặc hồ sơ và làm điểm nhấp nháy (`.is-hint`). Mỗi lần mở tăng `hints`, hiện ở màn thắng.
- **Hướng dẫn lần đầu** (`ui/coach.js`): chạy một lần sau phần mở đầu của vụ đầu tiên (`coachPending` trong app.js). Các thành phần được làm sáng lấy theo `data-coach` (clock, lives, notebook, hint, accuse) hoặc `.hs.is-open`, `.door`; bước nào không có hoặc nằm ngoài khung nhìn thì bỏ. Khóa phía sau bằng `O.setCoachActive` (inert). Nút "Xem lại hướng dẫn" ở Cách chơi xóa cờ.
- **Lời khai cận cảnh** `#testimony`: thẻ kính dưới màn hình khi hỏi cung (không chặn thao tác), tự ẩn sau 14 giây hoặc khi mở sheet/sổ tay/đi chỗ khác.

### 6.7 Phong cách (`styles/main.css`)
- Tailwind 4: token trong `@theme`: `night #0c0907`, `ink #f1e6cf`, `ink-2 #bba98b`, `lamp #f0b35a`, `lamp-2 #ffd98e`,
  `blood #d65a45`, `jade #6fc2a4`, `paper #f3e7c9`, `paper-2 #e2cfa3`; font `display` = Noto Serif Display, `ui` = Be Vietnam Pro.
- Lớp tiện ích tự định nghĩa: `.glass`, `.btn` / `.btn-ghost` / `.btn-blood` / `.btn-round`, `.kicker`, `.tabnum`, `.pan`, `.tab`, `.clue`,
  `.sus`, `.linkc`, `.ltag`, `.lkc`/`.lkgrid` (nút chọn hồ sơ), `.banner`, `.expl`, `.tl-row`.
- Trong `.sheet` nền sáng nên nút `.lkc`, `.btn-ghost`… có luật ghi đè màu tối: nhớ kiểm tra tương phản khi thêm thành phần mới vào sheet.
- Tôn trọng `prefers-reduced-motion` (CSS, `overlays.js`, `cursor.js`, `ambience.js` đều xử lý).
- Responsive: điểm ngắt 767px (sổ tay) và 480px (chip/nhãn nhỏ lại).

### 6.8 Minh họa (`art/art.js`, `kit.js`, `sg.js`, `people.js`)
Một IIFE trả `ART = { scene(key, doors), portrait(look, id), evidence(visual) }`, toàn bộ là **chuỗi SVG sinh bằng code**
(helper `rect/path/circle/line/txt/glow/haze/lin/frame`, `figure()` vẽ người, `tube()` nhà ống, `lantern`, `vase`…).
- Cảnh đã đăng ký trong `SCENES`: các cảnh `sg_*`, `sg_vani_*`, `sg_btx_*`, `sg_lm_*` và `menu_sg` (cảnh Hà Nội đã gỡ; khóa lạ rơi về `menu_sg`).
- `scene()` bọc cảnh bằng `widen()` (thế giới 2400, hai bên + cửa) trừ `menu_sg`.
- `evidence(v)`: `paper` (giấy tờ), `cam` (khung camera, các loại `cam_sg_*`, `cam_vani_*`, `cam_btx_*`, `cam_lm_*`), `tide`, `skew` (camera chậm 17 phút), `tz` (Thái Bình Dương +15 giờ); `who` dùng `portrait`.
- ID gradient/filter phải duy nhất toàn trang (dùng tiền tố cảnh `k` hoặc `uid()`).

### 6.9 Lớp hình ảnh nâng cao (xem thêm README, mục "Hình ảnh")
- `people.js` bọc mỗi `figure()` trong `<g class="fig" data-fig="x,đỉnh,chân,nửa rộng,ngồi,tỉ lệ,màu giày">`; **đừng bỏ nhóm này**, `actors.js`/`parseFigures` và test `render.test.js` dựa vào nó.
- Người: cao 229 đơn vị cục bộ × `s`; `o.sex`/`look.sex` ghi đè giới tính suy từ tóc; phụ kiện của `figure()` là `glasses`, `mustache`, `tie`, `scarf` (màu). Người ngồi chỉ vẽ tới y=140.
- `render/world.js` dựng theo thứ tự: raster → `analyze()` (pháp tuyến + nguồn sáng + probe) → `addImage(key, canvas, normal)` + `setLighting(true)`
  → `lighting.setScene` → `actors.setScene` → `ambience.setScene`. Độ sâu: nền 0, mảnh nhân vật 1, bóng 2, bụi/khói/mưa 2–3, quầng sáng 6.
- `phaser-core` không có `LightsPlugin`: alias `phaser-lights` trong `vite.config.js` + `plugins.scene` trong cấu hình game. Mất một trong hai là `scene.lights` undefined và đèn thật tắt (CSS vẫn chạy).
- `#scene` là vùng `overflow:hidden`: focus bàn phím vào nút ngoài khung nhìn từng làm nó cuộn lệch, nên `stage.js` luôn trả `scrollLeft/Top` về 0.
- `overlays.js`: `veil(kicker, title, sub, swap, origin)` (mống mắt qua biến CSS `--r`, `--cx`, `--cy`; `--r` âm nghĩa là đen kín), `pushIn/pushOut`, `shake`, `bars`,
  `showSheet(html, {cinema})`, **`updateSheet(html)`** (vẽ lại hộp thoại đang mở sau một lựa chọn: giữ vị trí cuộn và focus theo thứ tự nút, không phát lại hoạt ảnh; dùng cho chọn nghi phạm/hồ sơ ở phiên xét xử và bàn phím khóa mã; mở lần đầu vẫn dùng `showSheet`), `showTestimony/hideTestimony`, `flyToNotebook`. Tất cả bỏ qua khi giảm chuyển động.

## 7. Việc thường làm

**Thêm địa điểm/điểm điều tra**: vẽ cảnh trong `art.js` + đăng ký `SCENES` + thêm `FLANK` → thêm `locations[]` trong `sg.js`/`sg-vani.js`/`sg-bitexco.js`/`sg-landmark.js`
→ thêm `actions[]` tương ứng và tọa độ `hs` (x trong khoảng 300–1300 để khỏi sát nút xem hai bên) → `npm test`.

**Thêm vụ án mới**: làm theo `docs/new-case.md` (hoặc skill `/new-case`). Nối vụ **vào cuối** `SG_CASES`, thêm cốt truyện kể theo thời gian của vụ vào `STORIES` trong `src/data/stories.js` (`check-case` báo lỗi nếu thiếu), chạy `npm run check-case`, viết `tests/sg-<tên>.test.js`, rồi cập nhật tài liệu. Các test chung không còn pin số vụ.

**Thêm hành động UI**: khóa mới trong `actions` (app.js) + `data-action` ở template. Nếu cần state mới, thêm vào `newGame` (rules.js)
— nhớ `resumeRun`/`loadRun` đọc ván cũ nên trường mới phải chịu được `undefined`.

**Thêm luật mới**: viết thành hàm thuần trong `rules.js` + test trong `rules.test.js`; `templates.js` chỉ đọc kết quả, không tự tính luật.

## 8. Quy ước & lưu ý

- Comment và chuỗi UI tiếng Việt có dấu; tên biến/hàm tiếng Anh ngắn gọn.
- Luôn `esc()` mọi chuỗi dữ liệu đưa vào template (trừ `intro`/`explanation`/`text` của news vốn là HTML tin cậy từ `cases.js`).
- Template chuỗi **không** chạm DOM và không giữ state; DOM chỉ được cập nhật qua `setHTML`/`stage.*`/`overlays.*`, riêng `#nb-body` do Preact quản lý (đừng `setHTML` vào đó).
- `busy` là khóa trong lúc chuyển cảnh (`veil`); các hành động trong rules từ chối khi `busy`.
- Hoạt ảnh vào cảnh dùng `animateEntrance` (GSAP) và bỏ qua `.is-secret` vì độ mờ của chúng do đèn pin điều khiển.
- Commit dùng thông điệp tiếng Việt, ngắn, mô tả thay đổi (xem `git log`).
- Kiểm tra: `npm run lint` (không còn cảnh báo), `npm test` (154 test xanh), `npm run e2e` (kiểm thử khói bằng trình duyệt thật: không lỗi console,
  không yêu cầu mạng, WebGL/đèn thật chạy, focus hộp thoại và sổ tay, khôi phục ván). CI (`.github/workflows/ci.yml`) chạy cả bốn bước. Chưa có formatter.
  `.gitattributes` ép LF cho mọi file văn bản.
- Trợ năng bàn phím (`ui/overlays.js`): khi hộp thoại mở, `#scene`, `#ui`, `#testimony`, nút xem hai bên **và** sổ tay đều `inert`; đóng thì trả focus về nút đã mở
  (`selectorOf`/`returnTo`). Sổ tay đóng cũng `inert` (`setNotebook`). Hộp thoại lấy tên từ `h2` đầu tiên (`aria-labelledby`). Điểm điều tra và cửa được sắp theo x để
  Tab đi từ trái sang phải; focus vào một nút ngoài khung nhìn thì camera tự trượt tới (`stage.js`, sự kiện `focusin`). Thêm sheet/hộp mới: cứ dùng `showSheet`.
