# Viết một vụ án mới (hướng dẫn cho tác giả và cho Claude)

Đọc file này **thay cho** việc đọc nguyên `src/data/sg.js`, `sg-vani.js` hay `rules.js`. Mọi luật ngầm đã gom ở mục 4. Muốn xem một vụ làm mẫu
thì đọc `docs/cases-index.md` (tóm tắt từng vụ, cơ chế đố đã dùng, ý tưởng chưa dùng), chỉ mở dữ liệu thật khi cần đúng một đoạn (Grep theo mã hồ sơ).

## 1. Ba lệnh dùng cả buổi

```bash
npm run check-case -- s4 --table   # mọi luật dữ liệu chung + lộ trình gợi ý + bảng ngoại phạm (vài giây)
npm run scenes                     # mở trang xem cảnh: ?case=s4  &k=<cảnh>  &ev=1 (khung camera, giấy tờ)
npm test                           # sau cùng: toàn bộ test, lint (npm run lint), e2e (npm run e2e) trước khi commit
```

`check-case` bắt hầu hết lỗi bạn sẽ gặp (trùng tập đầu vào suy luận, một lời thú nhận mở bởi hai phản ứng, thiếu cảnh/camera trong `art.js`, ngân sách giờ
quá thấp, gợi ý bị kẹt, dòng giấy tờ quá dài...). Chạy nó sau mỗi khối việc, đừng đợi viết xong.

## 2. Thứ tự làm (30–50 phút nếu không phải nghĩ lại từ đầu)

1. **Chốt ý (5 phút).** Nếu người dùng chưa nêu chủ đề: đưa ba ý ngắn (3 dòng mỗi ý: bối cảnh, cái "aha", thủ phạm) từ mục "Ý tưởng chưa dùng" trong `cases-index.md`, để họ chọn. Nếu họ giao quyền chọn thì tự chọn, đừng hỏi lại.
2. **Bảng sự thật (10 phút, viết ra trước khi viết dữ liệu).** Giờ giấc thật từng phút; ai ở đâu; thủ phạm làm gì để che; mỗi nghi phạm giấu gì. Mẫu ở mục 3.
3. **Chuỗi chứng minh.** 3 bước (chain), mỗi bước ≥ 2 lối độc lập; liệt kê các kết luận và hồ sơ gốc đầu vào. Ước lượng giờ: lối rẻ nhất 7–8 giờ, lối kỹ nhất 10–11 giờ, ngân sách 15.
4. **Viết `src/data/sg-<tên>.js`** (export một object vụ), nối vào `SG_CASES` trong `sg.js` (import + thêm cuối mảng, **không chèn giữa**: chỉ số vụ dùng cho bản lưu). Chạy `check-case`.
5. **Vẽ cảnh** `src/art/sg-<tên>.js` + đăng ký (mục 6). Kiểm tra bằng `npm run scenes`. Có thể giao cho một agent/session riêng chạy song song miễn là đã chốt địa điểm và tọa độ `hs`.
6. **Test riêng của vụ** `tests/sg-<tên>.test.js` (mục 7), thêm vào script `test` trong `package.json`.
7. **Cốt truyện** (`src/data/stories.js`, khóa theo id vụ): kể lại chuyện đã thật sự xảy ra theo thời gian, khác với `explanation` (lập luận). Mảng `{ part }` (chương) và `{ at, title, text }` (mốc, chuỗi thuần không HTML); ≥ 2 chương, ≥ 10 mốc, bắt đầu bằng một chương, có mốc `at: "Kết cục"`. Chương gợi ý: gốc rễ / trước đêm xảy ra án, đêm xảy ra án, điều tra. Hiện ở màn thắng/thua và nút "Đọc lại cốt truyện" ở menu.
8. **Tài liệu:** `docs/cases-index.md` (thêm vụ + cơ chế đã dùng), bảng vụ và số test trong `CLAUDE.md`, mục đầu `README.md` và bảng file.

## 3. Mẫu bảng sự thật (viết vào đầu file dữ liệu dưới dạng comment hoặc nháp, không cần commit)

```
Nạn nhân / bối cảnh / giờ bắt đầu điều tra:
Giờ thật: 21:43 A rời sảnh | 21:51 án mạng | 22:30 thẻ bị quẹt ...
Thủ phạm: làm gì, vì sao chưa lộ, sơ hở duy nhất là gì (= cái "aha")
Mỗi nghi phạm: khai gì (dối ở đâu) | thật ra làm gì | bị lộ bằng hồ sơ nào | loại trừ bằng hồ sơ nào
Chuỗi: bước 1 (…): lối A [..] / lối B [..]  | bước 2 … | bước 3 …
Mã khóa: đáp án, hai hồ sơ ghép ra nó, một hồ sơ là "dấu vết ẩn"
Hồ sơ về muộn: id + giờ đến; điểm bị gate: id + kết luận mở
```

Nguyên tắc câu đố đã chạy tốt ở bốn vụ:
- Người chơi bị dẫn tới **giờ sai** hoặc **người sai** trước (thẻ quẹt 22:34, camera chậm 17 phút, giờ Thái Bình Dương), rồi một hồ sơ đến muộn hoặc khóa mã lật lại.
- Thủ phạm có **ngoại phạm đẹp ở khung giờ người ta tưởng** là giờ án mạng; sơ hở nằm ở khung giờ thật.
- Mỗi người ngoài cuộc **nói dối một chuyện riêng** (biển thủ, đi làm cho đối thủ, chở hàng lậu...) và lộ ra bằng "đưa chứng cứ"; chỉ thủ phạm là không bao giờ thú nhận.
- Mỗi người ngoài cuộc phải bị loại bằng **hồ sơ độc lập** (camera, nhật ký giờ mạng, đường dây cố định), không bằng lời khai của chính họ.
- Kết luận không bao giờ gọi tên thủ phạm; trò chơi chỉ xác nhận sự kiện. Tiêu đề kết luận không chứa "thủ phạm/hung thủ/kẻ giết" (test bắt).
- Bốn tên **Vũ, Ngân, Thắm, Trang** xuất hiện ở mọi vụ Sài Gòn, mỗi lần một vai khác; thêm hai nhân vật mới (một nam, một nữ hoặc theo cốt truyện). Tổng cộng 6 nghi phạm.

## 4. Luật ngầm và bẫy (đã làm mất thời gian ở các vụ trước)

**Suy luận (`deduce`)**
- 2–4 đầu vào, đầu vào có thể là hồ sơ gốc hoặc kết luận khác. Hai dòng không được có cùng **tập** đầu vào (kể cả đảo thứ tự): chỉ dòng đầu có tác dụng, `check-case` báo lỗi.
- Nhiều dòng cùng `gives` = nhiều lối. **Dòng đầu tiên của mỗi `gives` là lối mà gợi ý dẫn người chơi đi**, và thứ tự trong `needs` là thứ tự gợi ý làm. Đặt hồ sơ không phải chờ lên trước hồ sơ về muộn để khỏi mất giờ chờ.
- Gợi ý (`nextStep`) duyệt các bước `chain` theo thứ tự; mỗi bước chỉ cần **một** `ids` đã có là coi như xong và đi tiếp. Vì thế lộ trình gợi ý có thể dừng sớm hơn lối "kỹ nhất". Đặt kết luận mạnh nhất lên đầu `ids`.
- Kết luận không đặt trên bản đồ (`via:"deduce"`, `cost:0`, `type:"Kết luận"`). Văn bản kết luận không nên nhắc hồ sơ mà một lối khác không cần; được phép gom ý nếu nhiều lối.

**Đưa chứng cứ (`confront`)**
- Chỉ người đã có lời khai (`visual:{k:"who"}`) mới bị đưa chứng cứ. Mỗi `reveal` chỉ được **một** phản ứng mở; phản ứng thứ hai về cùng chuyện thì không đặt `reveal`. Mỗi hành động `via:"confront"` phải có phản ứng mở nó.
- Thủ phạm: nhiều phản ứng (≥ 6) nhưng không `reveal`.

**Alibi và mốc giờ (`alibi`, `spans`)**
- `alibi: {who, from, to, at}` trên lời khai. `spans: [{who?, needs?, from, to, at}]` trên camera, nhật ký, kết luận.
- Bị bác (`clash`): có mốc **cùng người, khác `at`, chồng giờ**. Được xác nhận (`proof`): có mốc **cùng `at` bao trọn** khoảng khai. Mốc cuối là điểm dừng (21:49–22:30 và 21:44–21:49 không chồng nhau).
- Chuỗi `at` phải trùng **từng chữ**: khai báo hằng số (`const HALL = "..."`) ở đầu file. `check-case` cảnh báo `alibi.at` không trùng mốc nào.
- Mốc có `needs: [id...]` chỉ gắn vào `who` khi đã có các hồ sơ đó (dùng cho camera ghi người lạ mặt; danh tính hiện sau khi suy luận).
- Chỉ cần khoảng khai **trùng khung giờ cần chứng minh** cho các người ngoài cuộc; khoảng khai dài hơn thì thành "bị bác" vì chuyện riêng, mà đó là cách để họ lộ ra nói dối.
- Mốc không hỗ trợ qua nửa đêm (from < to trong cùng ngày).

**Hồ sơ về muộn (`world`)**
- Chỉ dùng `kind:"arrive"`. Không dùng `gone`/`leave` (hồ sơ/nghi phạm không được mất theo thời gian; test canh).
- `at` trước `clock.start` nghĩa là sang ngày hôm sau (bắt đầu 23:20, `at:"00:20"` = một giờ sau). Chờ tốn số giờ nguyên (làm tròn lên).
- `gate: id` ẩn điểm tới khi có hồ sơ/kết luận `id`; `id` có thể là lời khai mở bằng đưa chứng cứ.

**Khóa mã (`lock`)**
- Mã phải suy ra được từ hồ sơ khác, không đoán: thường một hồ sơ nói quy tắc (đặt ở điểm `"soi"`, dấu vết ẩn cần đèn pin) + một hồ sơ cho số. Sai 3 lần mất 1 giờ.

**Ngân sách và điểm**
- `budget * 2 >= số điểm điều tra` (30 điểm → ≥ 15 giờ). Mục tiêu: lối rẻ nhất ≈ 7–8 giờ, lộ trình gợi ý ≤ 11 giờ.
- Mỗi hồ sơ gốc đặt đúng một chỗ trên bản đồ; kết luận và lời khai `via` không đặt.

**Buộc tội**
- `chain`: đúng 3 bước, khóa tự do nhưng khác nhau (`opportunity/means/motive` ở s2, `time/access/motive` ở s3, `cause/author/motive` ở s4), mỗi bước có `label`, `ask`, `hint`, `ids` (các **kết luận** được chấp nhận làm chứng cứ).
- `verdict` (nhiều người) thay cho `chain`: xem s1.
- `culprit` bắt buộc với `chain`.

**Hiển thị**
- Hình giấy tờ (`visual.k:"paper"`): ≤ 5 dòng, mỗi dòng ≤ 41 ký tự, tiêu đề ≤ 33 ký tự (viết hoa rộng hơn nên ngắn hơn nữa). Dấu mộc (`stamp`) che vùng x ≥ 196, y 122–158 ≈ dòng 2–3: giữ hai dòng đó ngắn.
- Khung camera (`k:"cam"`): `scene` phải là loại đã vẽ trong `camBody` và đăng ký trong `CAM_KINDS` (art.js); nếu không sẽ rơi im lặng về cảnh sảnh của s1 (`check-case` bắt).
- Thông điệp mở đầu (`intro`) là HTML tin cậy; mọi chuỗi khác được `esc()`.
- Hộp thoại mở đầu tự nhắc cơ chế vụ có (giờ máy lệch chỉ khi có `devices`, hồ sơ về muộn, mã số).

## 5. Lược đồ một vụ

```js
export const TEN_VU = {
  id: "s4", no: 4, region: "sg", title: "…", place: "…", level: "★★★★★★★ …", budget: 15,
  clock: { start: "HH:MM" },
  world: [{ at: "HH:MM", kind: "arrive", id: "ho_so_id", text: "…" }],
  devices?: { dev: { name, off /* phút */, by: "k_id" } },      // thiết bị lệch giờ tới khi kết luận by có; span có dev: "dev"
  intro: "HTML mở đầu",
  suspects: [{ id, name, role, bio, look: { skin, hair, hc, top, acc, ac? } }],
  //   hair: short|long|bun|bald|hat   acc: glasses|mustache|scarf|tie|none   (ac = màu cà vạt/khăn)  sex?: "m"|"f"
  locations: [{ id, name, time, scene, hs: [[actionId, x, y, "nhãn", "soi"?], …] }],   // x 300–1300, y 150–760 (khung 1600×900)
  actions: [{ id, cost, type, title, text,
              visual: { k: "who", id } | { k: "paper", alt, title, rows: [≤5], stamp? } | { k: "cam", scene, time, cam, alt },
              via?: "confront" | "deduce", gate?: id, lock?: { code, digits, prompt },
              spans?: [{ who?, needs?: [id], from, to, at }], alibi?: { who, from, to, at } }],
  culprit: "id",                                    // chain
  confront: [{ who, clue, reveal?, text }],
  chain: [{ key, label, ask, ids: ["k_…"], hint }], // 3 bước
  deduce: [{ needs: [id, …], gives: "k_…" }],
  explanation: "HTML lời giải, 4–6 đoạn <p><b>tiêu đề.</b> nội dung</p>" };
```

`type` ∈ Lời khai · Vật chứng · Camera · Hồ sơ · Biên bản · Kết luận. Cảnh đầu tiên (`locations[0].scene`) cũng là hình thẻ vụ ở menu: chọn cảnh đẹp nhất.
Mỗi vụ có 6 địa điểm: 5 cảnh vẽ riêng + `sg_lab` (phòng giám định, dùng lại). Cảnh `sg_lab` có sẵn 7 chỗ đặt điểm: (320,470) (520,590) (700,290) (900,330) (1010,600) (1180,320) (1240,500).

Văn phong: tiếng Việt có dấu, giọng noir ngắn gọn; lời khai có trích dẫn trực tiếp bằng “…”; giờ viết 21h46 trong lời khai và 21:46 trong nhật ký/camera; số tiền kiểu “183 tỷ đồng”.

## 6. Vẽ cảnh (`src/art/`)

- File cảnh mới `sg-<tên>.js`, mỗi cảnh một hàm trả `frame(label, defs, body)` (khung 1600×900) bằng helper trong `kit.js`: `rect path circle line txt lin glow haze blurs`. Mỗi cảnh một tiền tố id riêng (`const k = "btp"`; `blurs(k)` trong `defs`).
- Sàn của cảnh trong nhà bắt đầu ở **y = 720** (`rect(0,720,1600,180,…)`); trần ~ y 40–90. Người đứng (`figure(x, headY, s, opts)`): chân ở khoảng **headY + 224·s**, nên `headY ≈ 460–480` thì chân chạm sàn (đứng ở y 340–400 là lơ lửng giữa không trung); người ngồi (`seated:true`) chỉ vẽ tới headY + 140·s. Chấm điểm điều tra đặt ở ngực: y ≈ headY + 110. Tùy chọn `opts`: `top hair hc skin glasses mustache tie scarf seated` (màu cà vạt/khăn là chuỗi màu).
- Đừng bỏ nhóm `<g class="fig">` mà `figure()` sinh ra (lớp Phaser và `render.test.js` dựa vào nó). Mưa: bọc các vạch trong `<g class="rain">` (xem `sgBtxPad`) và thêm cảnh vào `AMBIENT` ở `ui/ambience.js`.
- Đăng ký trong `art/art.js`: (1) import; (2) `SCENES`; (3) `FLANK[sceneKey]` với `kind: "room"` (phòng, cần wall/floor/trim/lamp), `"sgstreet"` (phố) hoặc `"roof"` (sân thượng); (4) nếu có khung camera mới: một nhánh trong `camBody` (khung 320×190) và khóa trong `CAM_KINDS`.
- Chữ trong `<text>` ở lại DOM (webfont), nền được raster hóa; tránh chữ quá nhỏ (<11px) và nội dung quan trọng chỉ nằm trong ảnh.
- `npm run scenes` hiện từng cảnh ở khung thế giới 2400 kèm chấm vị trí điểm điều tra (vàng thường, xanh nét đứt cho "soi"), đường hồng là mép khung 1600. Kiểm tra: người đứng trên sàn, chấm không che chữ quan trọng, camera và đồ vật không nằm sát mép.

## 7. Test riêng của vụ (`tests/sg-<tên>.test.js`)

`check-case` đã lo dữ liệu chung, nên test riêng chỉ cần phần **logic của câu đố**. Khuôn ở `tests/sg-btx.test.js`:
1. Nhân vật, vùng, chỉ số vụ, cảnh đầu tiên.
2. Độ khó không thấp hơn vụ trước (sao, điểm, số kết luận).
3. Các kết luận then chốt ra được bằng từng lối; thiếu một mắt xích thì không ra.
4. Ngoại phạm: ai `clash`, ai `proof` khi có đủ hồ sơ; trước camera thì `open`.
5. Mã khóa đúng/sai, sai 3 lần bị khóa; hồ sơ về muộn và gate.
6. Lời giải ngắn nhất (còn dư ≥ 4 giờ) thắng; mỗi bước ≥ 2 lối độc lập; mọi cách buộc tội sai đều thua.
7. Đưa chứng cứ: mỗi người thú nhận đúng chuyện; thủ phạm không thú nhận.
8. Giao diện: HUD, sổ tay mọi tab, hộp chuỗi chứng minh, mọi cảnh và hình chứng cứ vẽ được.
Hàm `play(ids)` (làm lần lượt, tự chờ hồ sơ về muộn, tự nhập mã, rút mọi kết luận) có ở đầu file mẫu; sao chép nguyên.

Khi thêm vụ, các test chung **không** còn pin số vụ (đã gỡ), nhưng nên rà: `package.json` (thêm file test vào script `test`), và `CLAUDE.md` (số test).

## 8. Danh sách việc khi thêm vụ (tick từng ô)

- [ ] `src/data/sg-<tên>.js` + nối cuối `SG_CASES` trong `sg.js`
- [ ] `STORIES[id]` trong `src/data/stories.js` (cốt truyện kể theo thời gian)
- [ ] `src/art/sg-<tên>.js` + `art.js`: import, `SCENES`, `FLANK`, `camBody`/`CAM_KINDS` (nếu cần); `ambience.js` nếu có mưa
- [ ] `npm run check-case -- <id> --table` sạch lỗi; đọc bảng ngoại phạm xem có đúng ý đồ
- [ ] `tests/sg-<tên>.test.js` + thêm vào script `test`
- [ ] `npm test`, `npm run lint`, `npm run e2e` đều xanh
- [ ] `npm run scenes` xem đủ mọi cảnh
- [ ] Tài liệu: `docs/cases-index.md`, `CLAUDE.md` (bảng vụ, cảnh, số test), `README.md` (mô tả đầu, bảng file, ngân sách)
