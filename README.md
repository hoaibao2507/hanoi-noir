# Hanoi Noir · Vụ Án Phố Cổ

Trò chơi điều tra 3 vụ án ở phố cổ Hà Nội, chạy trên trình duyệt.
Mỗi cảnh là một thế giới panorama phủ kín màn hình: kéo hoặc dùng mũi tên để xem hai bên,
đi qua cửa để sang địa điểm khác, nút chức năng nằm ở bốn góc.

## Chạy và build

```bash
npm install
npm run dev      # máy chủ phát triển (Vite)
npm run build    # tạo dist/index.html: một file duy nhất, mở trực tiếp được
npm test         # kiểm thử luật chơi, cửa đi và tính toàn vẹn dữ liệu
```

Font chữ tải từ Google Fonts nên cần Internet. Biểu tượng, GSAP, Phaser và CSS đã được đóng gói sẵn.

## Cấu trúc

| Đường dẫn | Vai trò |
| --- | --- |
| `index.html` | Khung trang: sân khấu, lớp giao diện, sổ tay, hộp thoại |
| `src/main.js` | Điểm vào: nạp icon và CSS, ủy quyền sự kiện `data-action` |
| `src/app.js` | Bộ điều khiển: nối store, luật chơi, sân khấu và giao diện |
| `src/state/store.js` | Kho trạng thái nhỏ (patch + subscribe) |
| `src/game/rules.js` | Luật chơi thuần: hành động, đưa chứng cứ, dòng thời gian và alibi, đồng hồ và diễn biến, buộc tội, số sao (không đụng DOM) |
| `src/game/save.js` | Lưu tiến độ trên trình duyệt |
| `src/world/layout.js` | Hằng số thế giới: khung 1600 gốc, thế giới 2400, vị trí cửa |
| `src/world/doors.js` | Tạo cửa tới các địa điểm khác |
| `src/ui/stage.js` | Camera panorama: phủ kín khung nhìn, kéo, bánh xe, phím, nút mép; đồng bộ lớp Phaser với DOM |
| `src/ui/cursor.js` | Đèn pin theo chuột hoặc ngón tay; độ nghiêng theo chuột; báo cho các lớp khác khi đèn đổi chỗ |
| `src/ui/flashlight.js` | Làm sáng hoặc hé mờ các dấu vết ẩn theo khoảng cách tới đèn pin |
| `src/render/world.js` | Lớp Phaser 4: raster hóa nền SVG, vẽ nền và hiệu ứng, khớp với DOM qua scale, x, top |
| `src/vendor/spector-stub.js` | Module rỗng thay cho Spector.js (công cụ gỡ lỗi WebGL) mà Phaser nạp dù không dùng |
| `src/ui/templates.js` | Mẫu HTML thuần cho menu, HUD, sổ tay, hộp thoại |
| `src/ui/overlays.js` | Chuyển cảnh, thông báo, hộp thoại, hoạt ảnh (gợn sáng khi bấm điểm điều tra) |
| `src/ui/ambience.js` | Hiệu ứng môi trường trong Phaser: bụi trong đèn pin, mưa, khói hương, ánh đèn lập lòe; bật theo cảnh qua `AMBIENT` |
| `src/ui/dom.js` | Tiện ích DOM; đổi `<i>` thành SVG biểu tượng |
| `src/art/art.js` | Minh họa SVG: cảnh, hai bên thế giới, chân dung, camera, tài liệu |
| `src/data/cases.js` | Dữ liệu 3 vụ: nghi phạm, địa điểm, tọa độ điểm điều tra, hồ sơ |
| `src/styles/main.css` | Token thiết kế (`@theme`) và các thành phần giao diện |
| `tests/rules.test.js` | Kiểm thử đơn vị (`npm test`) |

## Ghi chú thiết kế

- Tọa độ điểm điều tra vẫn dùng khung 1600 × 900 gốc. `art.js` đặt khung đó vào giữa thế giới
  rộng 2400 và dựng hai bên là phòng hoặc phố; `layout.js` xếp cửa vào các khe đó.
- Luật chơi là hàm thuần trả về trạng thái mới, nên có thể kiểm thử bằng Node mà không cần trình duyệt.
- Tiến độ lưu dưới khóa `hanoi-noir-save-v2`; bản cũ dùng khóa khác nên không tự chuyển sang.
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
  không tốn giờ nên không làm đồng hồ chạy. Diễn biến `gone` làm mất một hồ sơ chưa thu khi tới mốc. Diễn biến `leave` khiến
  một nghi phạm rời thành phố: lời khai chưa thu của người đó mất theo, và không còn đưa chứng cứ được cho họ. Hồ sơ đã thu
  không bị ảnh hưởng. Diễn biến được báo ngay khi đồng hồ tới mốc và ghi trong tab Thời gian. Kiểm thử tìm lời giải theo chiều
  rộng bảo đảm mỗi vụ vẫn đi được tới lời giải khi tính cả hạn.

## Thêm địa điểm hoặc điểm điều tra

1. Vẽ cảnh trong `src/art/art.js` (hàm trả về SVG, khung 1600 × 900) và đăng ký trong `SCENES`.
2. Thêm phong cách hai bên trong `FLANK` (phòng `room` hoặc phố `street`).
3. Thêm địa điểm vào `locations` của vụ trong `src/data/cases.js` với `scene` tương ứng.
4. Đặt điểm điều tra bằng `[mã hành động, x, y, nhãn]` trên khung 1600 × 900. Giữ `x` trong khoảng 300–1300
   để không sát mép, nơi có nút xem hai bên.
