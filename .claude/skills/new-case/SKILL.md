---
name: new-case
description: Thêm một vụ án mới (s4, s5...) vào Hanoi Noir, từ chọn ý tưởng, thiết kế câu đố, viết dữ liệu, vẽ cảnh SVG tới test và tài liệu. Dùng khi người dùng nhờ "thêm vụ", "tạo vụ án mới", "viết vụ thứ N" hoặc gợi ý một bối cảnh/địa danh để làm vụ.
---

# Thêm vụ án mới

Mục tiêu: một vụ có độ khó **không thấp hơn vụ liền trước**, đạt trong 30–50 phút vì không phải đọc lại các vụ cũ.

## Đọc đúng ba thứ, không hơn
1. `docs/new-case.md`: quy trình, luật ngầm, lược đồ dữ liệu, cách vẽ cảnh, danh sách việc. **Thay cho việc đọc nguyên `sg.js`, `sg-vani.js`, `rules.js`.**
2. `docs/cases-index.md`: tóm tắt từng vụ, cơ chế đố đã dùng, ý tưởng chưa dùng.
3. Chỉ khi cần đúng một đoạn: Grep theo mã hồ sơ trong `src/data/sg-landmark.js` (vụ gần nhất, khuôn mẫu tốt nhất; `sg-bitexco.js` cho vụ có thủ phạm tự tay ra tay) hoặc đọc theo `offset/limit`.

## Quy trình
1. **Chốt ý.** Người dùng đã nêu chủ đề thì dùng luôn. Chưa nêu mà họ giao quyền chọn thì tự chọn một ý từ "Ý tưởng chưa dùng" (đừng hỏi lại). Chưa rõ họ muốn tự chọn thì đưa ba ý, mỗi ý 3 dòng, và chờ họ chọn.
2. **Bảng sự thật** (mục 3 của `docs/new-case.md`): giờ thật, thủ phạm, "aha", từng nghi phạm nói dối gì, chuỗi 3 bước với ≥ 2 lối. Cơ chế đố phải khác các vụ trước, không chỉ đổi bối cảnh.
3. **Viết dữ liệu** `src/data/sg-<tên>.js`, nối cuối `SG_CASES` trong `sg.js`. Chạy `npm run check-case -- <id> --table` sau mỗi khối.
4. **Vẽ cảnh** `src/art/sg-<tên>.js` + đăng ký trong `art/art.js`. Xem bằng `npm run scenes` (đừng đi qua chuyển cảnh trong game để chụp ảnh). Việc này độc lập với dữ liệu: nếu đã chốt địa điểm và tọa độ `hs`, có thể giao cho một agent chạy song song.
5. **Test** `tests/sg-<tên>.test.js` theo khuôn `tests/sg-landmark.test.js` (hoặc `tests/sg-btx.test.js`); thêm vào script `test` ở `package.json`.
6. **Cốt truyện:** thêm `STORIES[<id>]` vào `src/data/stories.js` (kể chuyện đã thật sự xảy ra theo thời gian: ≥ 2 chương, ≥ 10 mốc `{ at, title, text }`, có mốc `at: "Kết cục"`); `check-case` báo lỗi nếu thiếu.
7. **Kiểm tra cuối:** `npm test`, `npm run lint`, `npm run e2e`.
8. **Tài liệu:** thêm vụ vào `docs/cases-index.md`; cập nhật bảng vụ, danh sách cảnh và số test trong `CLAUDE.md`; mô tả đầu và bảng file trong `README.md`.

## Nhắc nhanh những lỗi tốn thời gian nhất
- Hai dòng `deduce` cùng tập đầu vào; một lời thú nhận (`reveal`) được hai phản ứng mở; chuỗi `at` của alibi không trùng mốc nào (gõ hằng số dùng chung).
- Dòng đầu của mỗi `gives` là lối gợi ý đi; đặt hồ sơ không phải chờ lên trước. Lộ trình gợi ý phải ≤ ~11/15 giờ.
- Người trong cảnh phải đứng trên sàn: `headY ≈ 460–480` (chân ở `headY + 224`), sàn từ y = 720.
- Khung camera mới phải có nhánh trong `camBody` **và** khóa trong `CAM_KINDS`, nếu không sẽ rơi im lặng về cảnh sảnh của s1 (`check-case` bắt).
- Thêm vụ **vào cuối** `SG_CASES` (chỉ số vụ dùng cho bản lưu). Chạy lệnh trong PowerShell; ghi thông điệp commit vào file rồi `git commit -F` (dấu ngoặc kép làm vỡ lệnh).

## Không làm
- Không dùng diễn biến `gone`/`leave` (hồ sơ không được mất theo thời gian).
- Không để kết luận gọi tên thủ phạm; trò chơi chỉ xác nhận sự kiện.
- Không commit hay push nếu người dùng chưa bảo.
