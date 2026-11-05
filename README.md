# Hanoi Noir · Vụ Án Sài Gòn

Trò chơi điều tra chạy trên trình duyệt, hiện có hai vụ ở Sài Gòn: *Đỉnh Triều Bến Vân Đồn* (ba kẻ liên đới, một án mạng được dựng
thành tai nạn bằng đồng hồ) và *Mực Chưa Khô* (Vani Ecommerce). Các vụ ở phố cổ Hà Nội đã được gỡ bỏ. Hồ sơ và chứng cứ không biến mất theo
thời gian, và ngân sách giờ của mỗi vụ tối thiểu bằng nửa số điểm điều tra (30 điểm thì ít nhất 15 giờ). Menu có bộ chọn vùng, chỉ hiện khi có từ hai vùng trở lên.
Mỗi cảnh là một thế giới panorama phủ kín màn hình: kéo hoặc dùng mũi tên để xem hai bên,
đi qua cửa để sang địa điểm khác, nút chức năng nằm ở bốn góc.

## Chạy và build

```bash
npm install
npm run dev      # máy chủ phát triển (Vite)
npm run build    # tạo dist/index.html: một file duy nhất, mở trực tiếp được
npm test         # kiểm thử luật chơi, cửa đi, tính toàn vẹn dữ liệu và lời giải hai vụ Sài Gòn (không cần trình duyệt)
npm run lint     # ESLint: biến chưa khai báo, biến thừa...
npm run e2e      # build rồi mở dist/index.html bằng Chrome thật, chơi vài bước (cần Chrome hoặc Edge đã cài)
```

Font chữ (Be Vietnam Pro, Noto Serif Display), biểu tượng, GSAP, Phaser và CSS đều đã được đóng gói vào một file, nên mở offline vẫn đúng.
Font lấy từ gói `@fontsource` (giấy phép OFL), chỉ nạp tập ký tự latin và vietnamese ở định dạng woff2 (xem `src/styles/fonts.css`).
GitHub Actions (`.github/workflows/ci.yml`) chạy lint, test, build và kiểm thử trình duyệt mỗi lần push lên `main` và mỗi pull request.

## Cấu trúc

| Đường dẫn | Vai trò |
| --- | --- |
| `index.html` | Khung trang: sân khấu, lớp giao diện, sổ tay, hộp thoại |
| `src/main.js` | Điểm vào: nạp icon và CSS, ủy quyền sự kiện `data-action` |
| `src/app.js` | Bộ điều khiển: nối store, luật chơi, sân khấu và giao diện |
| `src/state/store.js` | Kho trạng thái nhỏ (patch + subscribe) |
| `src/game/rules.js` | Luật chơi thuần: hành động, đưa chứng cứ, dòng thời gian và alibi (kể cả giờ máy lệch), đồng hồ và diễn biến, suy luận, khóa mã, hồ sơ về muộn, buộc tội một hoặc nhiều người, số sao (không đụng DOM) |
| `src/game/save.js` | Lưu tiến độ, ván đang chơi và vùng đang xem trên trình duyệt |
| `src/world/layout.js` | Hằng số thế giới: khung 1600 gốc, thế giới 2400, vị trí cửa |
| `src/world/doors.js` | Tạo cửa tới các địa điểm khác |
| `src/ui/stage.js` | Camera panorama: phủ kín khung nhìn, kéo, bánh xe, phím, nút mép; đồng bộ lớp Phaser với DOM |
| `src/ui/cursor.js` | Đèn pin theo chuột hoặc ngón tay; độ nghiêng theo chuột; báo cho các lớp khác khi đèn đổi chỗ |
| `src/ui/flashlight.js` | Làm sáng hoặc hé mờ các dấu vết ẩn theo khoảng cách tới đèn pin |
| `src/render/world.js` | Lớp Phaser 4: raster hóa nền SVG, vẽ nền và hiệu ứng, khớp với DOM qua scale, x, top |
| `src/render/lighting.js` | Ánh sáng thật (Phaser Lights): đèn pin, các nguồn sáng tìm thấy trong tranh, quầng sáng, chỉnh màu toàn khung |
| `src/render/analyze.js` | Phân tích nền đã raster: bản đồ pháp tuyến giả từ độ sáng, vị trí nguồn sáng, màu nền tại một điểm |
| `src/render/actors.js` | Nhân vật: cắt thành mảnh, cho thở, nghiêng theo con trỏ và đổ bóng dưới chân |
| `src/ui/pinboard.js` | Bảng ghim kéo thả của tab Liên kết: sợi chỉ SVG nối các hồ sơ đã đối chiếu |
| `src/vendor/spector-stub.js` | Module rỗng thay cho Spector.js (công cụ gỡ lỗi WebGL) mà Phaser nạp dù không dùng |
| `src/ui/templates.js` | Mẫu HTML thuần cho menu, HUD, sổ tay, hộp thoại |
| `src/ui/overlays.js` | Chuyển cảnh mống mắt, thanh đen phim, đẩy máy quay, lời khai cận cảnh, hộp thoại, hồ sơ bay vào sổ tay |
| `src/ui/ambience.js` | Hiệu ứng môi trường trong Phaser: bụi trong đèn pin, mưa, khói hương, ánh đèn lập lòe; bật theo cảnh qua `AMBIENT` |
| `src/ui/dom.js` | Tiện ích DOM; đổi `<i>` thành SVG biểu tượng |
| `src/art/art.js` | Minh họa SVG: hai bên thế giới, camera, tài liệu, bảng đăng ký cảnh |
| `src/art/kit.js` | Đồ nghề vẽ SVG dùng chung (rect, path, gradient, glow, đèn lồng, nhà ống, bình...) |
| `src/art/sg.js` | Cảnh vùng Sài Gòn |
| `src/art/sg-vani.js` | Cảnh vụ "Mực Chưa Khô" (cổng, văn phòng, phòng giám đốc, xưởng in, hẻm sau) |
| `src/ui/coach.js` | Hướng dẫn lần đầu chơi |
| `src/art/people.js` | Người trong cảnh (`figure`) và chân dung (`portrait`) dùng chung một bộ vẽ: tỉ lệ 6,9 đầu, vai, tay, bàn tay, giày, nét mặt, tóc, kính, ria |
| `src/data/cases.js` | Danh sách vùng (`REGIONS`, hiện chỉ có Sài Gòn), loại hồ sơ; gộp các vụ Sài Gòn thành danh sách phẳng `CASES` |
| `src/data/sg.js` | Vùng Sài Gòn: vụ "Đỉnh Triều Bến Vân Đồn" (nghi phạm, hồ sơ, kết luận, phiên xét xử nhiều người) |
| `src/data/sg-vani.js` | Vụ "Mực Chưa Khô" (Vani Ecommerce): một thủ phạm, báo cáo Zoom và Amazon ghi giờ Thái Bình Dương, điện thoại có mã, hồ sơ về muộn |
| `src/styles/main.css` | Token thiết kế (`@theme`) và các thành phần giao diện |
| `tests/rules.test.js` | Kiểm thử đơn vị luật chơi và dữ liệu các vụ (`npm test`), gồm ngân sách giờ ≥ nửa số điểm và không có hồ sơ mất theo thời gian |
| `tests/fixture.js` | Vụ mẫu (không nằm trong trò chơi) để thử các luật `gone`/`leave`, chuỗi chứng minh ba bước, đưa chứng cứ |
| `tests/hints.test.js` | Gợi ý: làm theo gợi ý từng bước thì mọi vụ đủ chứng cứ và thắng được |
| `tests/render.test.js` | Số đo nhân vật mà `art.js` gắn vào cảnh (lớp Phaser dùng để làm người thở và đổ bóng) |
| `tests/sg.test.js` | Kiểm thử vùng Sài Gòn: suy luận, giờ máy lệch, khóa mã, hồ sơ về muộn, lời giải và xét xử nhiều người |
| `tests/sg-vani.test.js` | Kiểm thử vụ "Mực Chưa Khô": múi giờ, khung giờ bị hại, ngoại phạm, mã điện thoại, hồ sơ về muộn, hồ sơ không mất theo thời gian và hai lối chứng cứ cho mỗi bước |
| `tests/notebook.test.js` | Sổ tay: tìm hồ sơ không dấu, lọc theo loại, đánh dấu sao, ghi chú, tổng quan địa điểm |

## Ghi chú thiết kế

- Tọa độ điểm điều tra vẫn dùng khung 1600 × 900 gốc. `art.js` đặt khung đó vào giữa thế giới
  rộng 2400 và dựng hai bên là phòng hoặc phố; `layout.js` xếp cửa vào các khe đó.
- Luật chơi là hàm thuần trả về trạng thái mới, nên có thể kiểm thử bằng Node mà không cần trình duyệt.
- Tiến độ lưu dưới khóa `hanoi-noir-save-v2` (số sao theo mã vụ); ván đang chơi dưới `hanoi-noir-run-v2` (bản v1 bị bỏ vì chỉ số vụ đã đổi sau khi gỡ các vụ Hà Nội).
- Nền cảnh được Phaser 4 vẽ từ ảnh raster của SVG. Chữ, cửa và điểm điều tra vẫn là DOM để dùng đúng phông chữ và nhận chuột.
  Camera không dùng của Phaser: `stage.js` đưa scale, x và top sang `render/world.js`, nên hai lớp luôn khớp.
  Nếu Phaser không chạy, DOM tự giữ SVG đầy đủ.
- Phaser dùng bản "core" của chính nhà phát triển (không có vật lý và tilemap), qua alias trong `vite.config.js`.
  Các cờ build được đặt như cấu hình webpack chính thức của Phaser. Nhờ vậy bản build còn khoảng 300 KB gzip thay vì 450 KB.
- Dấu vết ẩn: điểm điều tra có cờ `"soi"` (phần tử thứ năm trong `hs`) chỉ hiện khi đèn pin quét tới. Đã làm thì luôn hiện.
- Liên kết hồ sơ: vụ có mảng `links` thì sổ tay có tab Liên kết. Chọn hai hồ sơ rồi đối chiếu; cặp đúng ghi một kết nối
  (`mâu thuẫn` hoặc `liên hệ`). Trường `about` gắn kết nối với một nghi phạm, và nhãn hiện trên thẻ nghi phạm.
- Buộc tội theo ba bước: mỗi vụ có `chain` gồm ba bước (động cơ, cơ hội, phương tiện hoặc nhãn khác của vụ). Mỗi bước
  nhận một hồ sơ đã thu, và `ids` liệt kê các hồ sơ được chấp nhận. `judge` chấm từng bước để phản hồi cụ thể, và các lựa
  chọn đúng được giữ lại khi người chơi thử lại.
- Đưa chứng cứ: người đã bị hỏi (có lời khai trong hồ sơ) được đưa một hồ sơ khác để xem, tốn một giờ. Mảng `confront` của vụ
  ghi phản ứng cho từng cặp (`who`, `clue`), và có thể mở một lời khai mới (`reveal`). Lời khai mới là một hành động có
  `via: "confront"`, không đặt trên bản đồ và chỉ xuất hiện khi có phản ứng. Cặp không có trong danh sách vẫn đưa được, và
  người đó chỉ giữ nguyên lời khai.
- Dòng thời gian: hồ sơ có mảng `spans` ghi khoảng giờ, địa điểm và người (`who`) mà hồ sơ đó cho biết. `needs` liệt kê các
  hồ sơ phải thu trước thì mốc mới gắn được người; trước đó mốc hiện là "chưa rõ là ai". Lời khai về nơi ở có trường `alibi`
  (người, khoảng giờ, nơi khai). Tab Thời gian trong Sổ tay đối chiếu từng alibi với mốc của đúng người đó: "Bị bác" nếu có
  mốc chồng giờ ở nơi khác, "Được xác nhận" nếu có mốc bao trọn khoảng khai ở đúng nơi đó. Việc này không tốn giờ.
- Đồng hồ và diễn biến: mỗi vụ có `clock.start` (giờ bắt đầu) và mảng `world`. Mỗi giờ điều tra là một giờ trôi qua; di chuyển
  không tốn giờ nên không làm đồng hồ chạy. Engine vẫn hỗ trợ diễn biến `gone` (mất một hồ sơ chưa thu) và `leave` (nghi phạm rời thành phố), nhưng
  **hai vụ Sài Gòn không dùng chúng**: `tests/rules.test.js` bắt buộc mọi vụ trong trò chơi chỉ có diễn biến `arrive` (hồ sơ về muộn). Các luật `gone`/`leave`
  được kiểm thử bằng vụ mẫu `tests/fixture.js`. Diễn biến được báo ngay khi đồng hồ tới mốc và ghi trong tab Thời gian.
- Ngân sách giờ: `budget` của mỗi vụ phải tối thiểu bằng nửa số điểm điều tra trên bản đồ (`test` kiểm tra `budget * 2 >= tổng số hs`).
  Hiện s1 có 30 điểm, 15 giờ; s2 có 29 điểm, 15 giờ.

## Hình ảnh: ánh sáng, nhân vật và chuyển cảnh

- Ánh sáng thật: nền cảnh được đưa lên GPU cùng một bản đồ pháp tuyến giả sinh từ độ sáng của chính bức tranh (`analyze.js`),
  nên đèn pin làm nổi vân gỗ và nếp tường. Các nguồn sáng (đèn lồng, nến, cửa sổ) được dò ngay trong tranh: điểm sáng và ấm hơn hẳn
  xung quanh, loại trừ mặt người. Cảnh mới không cần khai báo gì. Bản `phaser-core` không kèm `LightsPlugin`, nên `vite.config.js`
  có alias `phaser-lights` và `world.js` đăng ký plugin vào cấu hình game. Nếu renderer không phải WebGL thì mọi thứ tự tắt,
  CSS vẫn vẽ đèn pin như cũ (lớp `gl-lit` trên `#scene` chỉ bật khi đèn thật chạy).
- Nhân vật: `people.js` vẽ mỗi người trong hệ toạ độ cục bộ cao 229 đơn vị (cằm 33, vai 41, eo 90, hông 112, gối 165, gót 229; đầu phóng 10% cho dễ đọc).
  Dáng nữ được suy ra từ tóc dài hoặc búi; `look.sex` (`"m"` hoặc `"f"`) ghi đè, và đang dùng cho Phong (tóc dài, nam) và Ngọc (đội mũ, nữ).
  Người trong cảnh lấy phụ kiện (kính, ria, cà vạt, khăn) từ cùng `look` của nghi phạm. `people.js` bọc mỗi người trong `<g class="fig" data-fig="x,đỉnh,chân,nửa rộng,ngồi,tỉ lệ,màu giày">`. `actors.js` cắt mỗi
  người (cả phần đồ vật che trước mặt họ, nên thứ tự trước sau vẫn đúng) thành một mảnh có viền mờ, rồi cho thở, nghiêng theo con
  trỏ và đổ bóng dưới chân. Bóng chỉ vẽ khi chân lộ ra (lấy mẫu màu giày), người ngồi không có bóng.
- Chuyển cảnh: `veil()` khép mống mắt vào đúng cánh cửa vừa bấm, đẩy máy quay lại gần, hiện tên nơi đến rồi mở ra ở giữa. Diễn biến,
  phản ứng khi đưa chứng cứ và kết quả buộc tội dùng `showSheet(html, { cinema: true })`: hai thanh đen, rung nhẹ, đèn chập chờn.
- Hỏi cung: lời khai hiện ở thẻ dưới màn hình (`#testimony`), chữ ra từng từ, cảnh đẩy lại gần người đang nói; thẻ không chặn thao tác.
  Hồ sơ vừa thu bay vào nút Sổ tay.
- Bảng ghim: tab Liên kết là bảng bần với các tấm hồ sơ ghim đinh. Kéo một tấm thả lên tấm khác để đối chiếu (không tốn giờ);
  cặp đúng được nối bằng sợi chỉ SVG. Bấm chọn hai tấm rồi bấm Đối chiếu vẫn dùng được cho bàn phím và màn cảm ứng.
- Dáng và nét mặt: mỗi người có dáng đứng cố định (tay buông, đút túi, chống hông, khoanh tay) suy ra từ trang phục, nên ở cảnh nào cũng giống nhau;
  một số nữ lớn tuổi mặc áo dài (`look.outfit: "aodai"`). Chân dung khi bị đưa chứng cứ đổi nét mặt: căng thẳng khi bị chạm vào điểm yếu, lo lắng khi sắp khai thêm.
- Hiệu năng: `analyze()` chạy theo lát 6 ms và nhường luồng chính nên đổi cảnh không còn khựng (đo bằng PerformanceObserver: không có tác vụ dài).
  Bụi là sprite thay vì vẽ lại Graphics mỗi khung. Phaser tắt input vì chuột, chạm, phím do DOM lo.
- Gợi ý và hướng dẫn: nút bóng đèn mở gợi ý hai mức (không tốn giờ, không ảnh hưởng sao; số lần dùng hiện ở màn thắng). Hướng dẫn lần đầu
  chạy một lần sau phần mở đầu của vụ đầu tiên; xem lại bằng nút trong Cách chơi.
- Ghi chú, đánh dấu và tìm hồ sơ: tab Hồ sơ có ô tìm (bỏ dấu, mọi từ đều phải khớp, tìm cả trong ghi chú của người chơi), chip lọc theo
  loại và chip "Đã đánh dấu". Mỗi hồ sơ có ★ và ô ghi chú; mỗi nghi phạm cũng có ô ghi chú. Dữ liệu nằm trong ván (`game.fav`, `game.notes`,
  khóa ghi chú `a:<mã hồ sơ>` hoặc `s:<mã nghi phạm>`), tối đa `MAX_NOTE` ký tự, lưu cùng ván và không ảnh hưởng luật chơi hay số sao.
  Ô nhập không được vẽ lại khi đang gõ (mất focus, hỏng bộ gõ Telex): ghi chú dùng `store.set(patch, true)` (cập nhật im lặng) rồi lưu ván
  trực tiếp, còn ô tìm chỉ vẽ lại riêng vùng `[data-clues]`. Bộ lọc là trạng thái giao diện (`nbUi` trong `app.js`), không lưu.
  Phím tắt và phím mũi tên camera bị bỏ qua khi đang gõ trong ô nhập.
- Tổng quan địa điểm: nút bản đồ cạnh Gợi ý (hoặc phím M) mở bảng liệt kê mọi địa điểm, mỗi nơi còn bao nhiêu điểm điều tra, đã làm bao nhiêu
  và điểm nào đang chờ hồ sơ về muộn (kèm mốc giờ). Chỉ đếm điểm đã lộ ra, nên điểm còn bị khóa bởi một kết luận không bị tiết lộ.
  Bấm một nơi để đi tới (không tốn giờ).
- Mọi hiệu ứng chuyển động tắt khi người dùng bật giảm chuyển động. Khi chạy `npm run dev`, `window.__phaser` trỏ tới game Phaser
  và console in thời gian dựng nền của từng cảnh, để gỡ lỗi.

## Vùng Sài Gòn: các cơ chế mới

Các cơ chế này đều theo dữ liệu: vụ nào khai báo thì mới dùng.

- **Vùng.** Mỗi vụ có `region` (hiện chỉ còn `"sg"`); `REGIONS` đặt tên, biểu tượng, cảnh nền menu và câu giới thiệu. Chỉ số trong `CASES`
  vẫn là chỉ số vụ dùng cho bản lưu; nút "Vụ tiếp theo" chỉ đi trong cùng vùng.
- **Suy luận.** `deduce: [{ needs: [id, ...], gives: id }]`. Người chơi chọn 2 đến 4 hồ sơ trong tab Suy luận; đúng tập hồ sơ (không phân
  biệt thứ tự, thừa hoặc thiếu đều không được) thì nhận kết luận `gives`, không tốn giờ. Kết luận là một hành động `via: "deduce"`, loại
  "Kết luận": nằm trong hồ sơ như mọi hồ sơ khác nên làm được đầu vào cho suy luận sau, được đưa cho nghi phạm xem, và được viện dẫn khi
  xét xử. Một kết luận có thể có nhiều lối (nhiều dòng cùng `gives`). Trò chơi chỉ xác nhận sự kiện, không bao giờ nói ai là thủ phạm.
- **Mở khóa bằng kết luận.** Hành động có `gate: id` ẩn khỏi cảnh cho tới khi hồ sơ `id` (thường là một kết luận) đã có.
- **Giờ máy lệch.** `devices: { dev: { name, off, by } }` khai báo thiết bị chạy lệch `off` phút cho tới khi kết luận `by` được rút ra.
  Mốc (`spans`) có `dev: "dev"` hiện giờ máy kèm nhãn cảnh báo trong tab Thời gian; sau khi có kết luận, mọi mốc của thiết bị được cộng `off` và
  ngoại phạm của mọi người được đối chiếu lại, nên có người hết bị bác oan còn người khác bị bác. `off` cũng dùng được cho múi giờ:
  vụ s2 khai báo báo cáo Zoom và thư Amazon ghi giờ Thái Bình Dương với `off: 900` (giờ Việt Nam = giờ máy + 15 giờ).
- **Khóa mã.** `lock: { code, digits, prompt }` trên một hành động mở bàn phím số. Sai `LOCK_TRIES` lần thì thiết bị tự khóa và mất
  `LOCK_PENALTY` giờ. Mã luôn suy ra được từ hồ sơ khác (vụ s1: giờ đỉnh triều cao nhất hôm đó), không phải đoán.
- **Hồ sơ về muộn.** Diễn biến `{ kind: "arrive", at, id }`: hồ sơ `id` chỉ đọc được từ mốc `at`. Bấm vào thì hỏi có chờ không; chờ tốn số giờ
  nguyên tới mốc, nên diễn biến khác (hồ sơ bị xóa, nghi phạm rời đi) vẫn xảy ra trong lúc chờ.
- **Xét xử nhiều người.** `verdict: { roles, facts }` thay cho `chain`. Mỗi vai (`roles[i]`) có người đúng `who` và các hồ sơ chứng cứ `ids`;
  `facts` là các câu dựng lại sự việc một đáp án đúng. Thắng khi mọi vai đúng cả người lẫn chứng cứ và mọi câu đúng. Phản hồi sau lần sai
  cố ý chỉ báo mỗi vai "vững" hay "chưa vững" và số câu dựng lại đúng, để không dò từng phần bằng cách thử lại.

Vụ s1 được kiểm thử như một câu đố: `tests/sg.test.js` chơi lại lời giải ngắn nhất (còn dư giờ), kiểm tra mỗi vai có ít nhất hai lối chứng cứ độc lập,
không có hồ sơ nào hết hạn, và mọi lựa chọn sai (đảo vai, chứng cứ sai vai, đáp án sai) đều thua.

Vụ s2 "Mực Chưa Khô" (`src/data/sg-vani.js`) dùng lại các cơ chế trên nhưng chỉ có một thủ phạm (`chain` ba bước, mỗi bước chọn một kết luận).
`tests/sg-vani.test.js` kiểm tra đổi múi giờ, khung giờ bị hại, trạng thái ngoại phạm của từng người, mã điện thoại, hồ sơ về muộn và hai lối chứng cứ mỗi bước.
Tìm lời giải theo chiều rộng của `tests/rules.test.js` chạy trên vụ mẫu, vì kết luận của hai vụ Sài Gòn không đặt trên bản đồ (đã có kiểm thử lời giải riêng).

## Thêm địa điểm hoặc điểm điều tra

1. Vẽ cảnh trong `src/art/art.js` (hàm trả về SVG, khung 1600 × 900) và đăng ký trong `SCENES`.
2. Thêm phong cách hai bên trong `FLANK` (phòng `room` hoặc phố Sài Gòn `sgstreet`).
3. Thêm địa điểm vào `locations` của vụ trong `src/data/sg.js` hoặc `src/data/sg-vani.js` với `scene` tương ứng.
4. Đặt điểm điều tra bằng `[mã hành động, x, y, nhãn]` trên khung 1600 × 900. Giữ `x` trong khoảng 300–1300
   để không sát mép, nơi có nút xem hai bên.
