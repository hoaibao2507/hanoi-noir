/* =====================================================================
   HANOI NOIR · Dữ liệu vụ án
   - Mỗi vụ: nghi phạm, hành động điều tra, địa điểm và tọa độ điểm điều tra.
   - Tọa độ (x, y) của điểm điều tra tính trên khung cảnh 1600 × 900 (tỷ lệ 16:9).
   - Mỗi hành động thuộc đúng một địa điểm.
   ===================================================================== */

/* Phân loại hồ sơ: màu nhấn và biểu tượng tương ứng */
export const TYPES = {
  "Lời khai":  { cls: "loi", icon: "fa-comments" },
  "Vật chứng": { cls: "vat", icon: "fa-magnifying-glass" },
  "Camera":    { cls: "cam", icon: "fa-video" },
  "Hồ sơ":     { cls: "ho",  icon: "fa-file-lines" },
  "Biên bản":  { cls: "bb",  icon: "fa-file-circle-check" }
};

export const CASES = [
{
  id: "c1", no: 1, title: "Hộp Trầm Hương", place: "Tiệm đồ cổ Hoa Sen · phố Hàng Bạc",
  level: "★★ Dễ", budget: 12,
  // Đồng hồ bắt đầu lúc clock.start; mỗi giờ điều tra là một giờ trôi qua. Đến mốc "at" thì diễn biến xảy ra:
  // "gone" làm mất một hồ sơ chưa thu, "leave" khiến một nghi phạm rời thành phố (không hỏi được nữa).
  clock: { start: "08:00" },
  world: [
    { at: "10:00", kind: "gone", id: "camera", text: "Chủ quán bia đầu ngõ đổi máy ghi hình và xóa đoạn ghi cũ. Đoạn 20h05 không còn trích xuất được." },
    { at: "11:00", kind: "leave", id: "khai", text: "Khải bắt xe về quê ở Hưng Yên, không còn ở thành phố. Anh không thể bị hỏi thêm." }
  ],
  intro: "Tối thứ Bảy, tiệm Hoa Sen đóng cửa lúc 19h30. Theo lời nhân viên Quyên, chiếc hộp gỗ trầm hương cổ — báu vật nằm trong tủ kính — vẫn còn nguyên khi cô khóa cửa. Sáng hôm sau, khi bà Lan đến kiểm kê, tủ kính đã trống trơn. Kính, khung và ổ khóa đều không có dấu hiệu bị phá. Hãy tìm xem ai đã mở được tủ.",
  suspects: [
    { id: "lan", name: "Bà Lan", role: "Chủ tiệm · 52 tuổi", bio: "Giữ một chìa khóa chính. Tối đó bà đi đám giỗ.",
      look: { skin: "#f0c9a0", hair: "bun", hc: "#2b2b2b", top: "#7a3e8f", acc: "glasses" } },
    { id: "quyen", name: "Quyên", role: "Nhân viên bán hàng · 26 tuổi", bio: "Mở cửa tiệm mỗi sáng. Con nhỏ đang ốm.",
      look: { skin: "#f4d3b0", hair: "long", hc: "#1f1a17", top: "#c8553d", acc: "none" } },
    { id: "binh", name: "Bình", role: "Thợ chạm gỗ cũ · 40 tuổi", bio: "Nghỉ việc tháng trước sau cuộc cãi vã với bà Lan.",
      look: { skin: "#d9a77c", hair: "short", hc: "#3d2c20", top: "#4f6b3a", acc: "mustache" } },
    { id: "khai", name: "Khải", role: "Chủ nợ · 35 tuổi", bio: "Từng nợ tiệm 20 triệu đồng và hay đến đòi.",
      look: { skin: "#e3b48b", hair: "hat", hc: "#6b4a2b", top: "#2f5d8a", acc: "scarf", ac: "#f1c40f" } }
  ],
  locations: [
    { id: "shop", name: "Tiệm Hoa Sen", time: "21:00", scene: "shop", hs: [
      ["khamtu", 800, 540, "Tủ trưng bày"], ["sothu", 1230, 585, "Sổ thu chi"], ["quyen", 1360, 500, "Hỏi Quyên"],
      ["mau_giay", 1010, 640, "Ngăn kéo quầy", "soi"] ] },
    { id: "giod", name: "Đám giỗ · Hàng Đào", time: "18:30", scene: "altar", hs: [
      ["chia", 330, 520, "Hỏi bà Lan"], ["giod", 1240, 620, "Sổ ghi danh"] ] },
    { id: "alley", name: "Đầu ngõ Hàng Bạc", time: "20:05", scene: "alley", hs: [
      ["camera", 640, 290, "Camera đầu ngõ"], ["khai", 1120, 600, "Hỏi Khải"] ] },
    { id: "hub", name: "Phòng lưu trữ", time: "Bất kỳ lúc nào", scene: "archive", hs: [
      ["xe", 400, 500, "Đăng ký xe"], ["bino", 1100, 560, "Hóa đơn quán bia"] ] }
  ],
  actions: [
    { id: "chia", cost: 1, type: "Lời khai", title: "Bà Lan: ai giữ chìa tủ?",
      text: "Bà Lan khai: ổ khóa tủ trưng bày chỉ có hai chìa chính còn lưu hành. Một chìa bà luôn để trong túi xách, chìa còn lại giao cho Quyên từ khi cô được mở cửa tiệm mỗi sáng. Bình đã trả lại chìa khi nghỉ việc tháng trước. Khải chưa bao giờ được giao chìa nào. Tối đó bà ngồi ở đám giỗ ông Sáu từ 18h30, đến sau 22h mới về.",
      visual: { k: "who", id: "lan" },
      alibi: { who: "lan", from: "18:30", to: "22:00", at: "Đám giỗ · Hàng Đào" } },
    { id: "khamtu", cost: 1, type: "Vật chứng", title: "Hiện trường: tủ kính",
      text: "Kính và khung gỗ nguyên vẹn, không có dấu cạy hay vết cưa. Ổ khóa tủ chỉ mở bằng chìa chính; chìa phụ trong ngăn kéo kho chỉ mở được ngăn kéo, không mở được tủ. Kết luận sơ bộ: hộp trầm được lấy đi bằng chìa chính.",
      visual: { k: "lock" } },
    { id: "giod", cost: 1, type: "Hồ sơ", title: "Sổ ghi danh đám giỗ",
      text: "Sổ ghi danh đám giỗ ông Sáu ở Hàng Đào có chữ ký của bà Lan lúc 18h30. Người tổ chức xác nhận bà ngồi cạnh bàn thờ suốt buổi, chỉ rời đi sau 22h cùng nhóm họ hàng.",
      visual: { k: "paper", alt: "Sổ ghi danh đám giỗ", title: "SỔ GHI DANH ĐÁM GIỖ",
        rows: ["Ông Sáu · Hàng Đào", "18h30 · Bà Lan ký tên", "Ngồi cạnh bàn thờ suốt buổi", "Rời đi sau 22h, cùng họ hàng"] },
      spans: [{ who: "lan", from: "18:30", to: "22:00", at: "Đám giỗ · Hàng Đào" }] },
    { id: "bino", cost: 1, type: "Hồ sơ", title: "Hóa đơn quán bia đầu ngõ",
      text: "Hóa đơn quán bia đầu ngõ ghi Bình gọi bàn lúc 19h và thanh toán lúc 21h30. Năm người bạn nhậu đều xác nhận anh ngồi cùng bàn suốt thời gian đó.",
      visual: { k: "paper", alt: "Hóa đơn quán bia", title: "HÓA ĐƠN QUÁN BIA",
        rows: ["Đầu ngõ · bàn số 4", "19h00 · Bình gọi bàn", "21h30 · Thanh toán", "Năm bạn nhậu xác nhận"] },
      spans: [{ who: "binh", from: "19:00", to: "21:30", at: "Quán bia đầu ngõ" }] },
    { id: "khai", cost: 1, type: "Lời khai", title: "Khải: tôi chỉ đến đòi nợ",
      text: "Khải khai đến tiệm lúc 19h để đòi nợ. Bà Lan không có mặt, anh chỉ nói chuyện với Quyên vài phút rồi về ngay, khoảng 19h05. Anh khẳng định chưa bao giờ vào kho hay đụng đến tủ trưng bày. Sau đó anh về thẳng nhà.",
      visual: { k: "who", id: "khai" },
      alibi: { who: "khai", from: "19:05", to: "22:00", at: "Trên đường về nhà" } },
    { id: "quyen", cost: 1, type: "Lời khai", title: "Quyên: tôi về nhà ngay",
      text: "Quyên khai đóng cửa tiệm lúc 19h30 rồi về nhà bằng xe máy. Cả tối cô ở nhà với chồng và con nhỏ, không ra ngoài lần nào. Chìa khóa của cô, theo lời cô, vẫn nằm trong túi áo khoác ở nhà.",
      visual: { k: "who", id: "quyen" },
      alibi: { who: "quyen", from: "19:30", to: "22:00", at: "Nhà riêng" } },
    { id: "camera", cost: 2, type: "Camera", title: "Camera đầu ngõ",
      text: "20h05: một chiếc xe máy màu đỏ rẽ vào ngõ và dừng ngay trước cửa tiệm Hoa Sen. Biển số bị che một phần, chỉ nhìn rõ đuôi “58”. 20h40: chiếc xe rời ngõ. Trong khung giờ đó, không có xe máy màu đỏ nào khác đi vào ngõ.",
      visual: { k: "cam", scene: "cam_moto", time: "20:05", cam: "CAM NGÕ HÀNG BẠC",
        alt: "Xe máy đỏ đỗ trước tiệm Hoa Sen lúc 20h05" },
      spans: [{ who: "quyen", needs: ["xe"], from: "20:05", to: "20:40", at: "Tiệm Hoa Sen" }] },
    { id: "xe", cost: 1, type: "Hồ sơ", title: "Đăng ký phương tiện",
      text: "Biển số đuôi 58 đứng tên Trần Thị Quyên. Bình đi xe đạp điện, bà Lan không đi xe máy, còn Khải đi xe máy màu xanh biển.",
      visual: { k: "paper", alt: "Đăng ký phương tiện", title: "ĐĂNG KÝ PHƯƠNG TIỆN",
        rows: ["Biển số: ··58", "Loại xe: xe máy, màu đỏ", "Chủ xe: Trần Thị Quyên"] } },
    { id: "sothu", cost: 1, type: "Hồ sơ", title: "Sổ thu chi tháng này",
      text: "Sổ thu chi ghi tháng trước Quyên đã ứng 30 triệu đồng từ quỹ tiệm, ghi chú “viện phí cho con”. Khoản này chưa được hoàn trả.",
      visual: { k: "paper", alt: "Sổ thu chi", title: "SỔ THU CHI THÁNG NÀY",
        rows: ["Ứng từ quỹ tiệm: 30 triệu", "Ghi chú: viện phí cho con", "Chưa hoàn trả"], stamp: "CHƯA TRẢ" } },
    { id: "mau_giay", cost: 1, type: "Vật chứng", title: "Mẩu giấy dưới ngăn kéo",
      text: "Mẩu giấy nhắn kẹp dưới ngăn kéo quầy, nét chữ vội: “Chìa tủ — Q. giữ hộ, đừng cho bà Lan biết.” Không có chữ ký khác.",
      visual: { k: "paper", alt: "Mẩu giấy nhắn dưới ngăn kéo quầy", title: "MẨU GIẤY NHẮN",
        rows: ["Chìa tủ — Q. giữ hộ", "Đừng cho bà Lan biết", "Không có chữ ký"] } },
    // Lời khai mới: chỉ có khi đưa đúng chứng cứ cho người đã bị hỏi (xem "confront" bên dưới)
    { id: "quyen_thu", cost: 0, via: "confront", type: "Lời khai", title: "Quyên thú nhận: chìa thứ hai",
      text: "Quyên thừa nhận chiếc chìa thứ hai không để ở nhà như cô khai, mà cô mang theo suốt tối đó. Cô nói chỉ ghé tiệm lấy đồ cá nhân, và không mở tủ trưng bày.",
      visual: { k: "who", id: "quyen" },
      spans: [{ who: "quyen", from: "20:05", to: "20:40", at: "Tiệm Hoa Sen" }] },
    { id: "khai_thu", cost: 0, via: "confront", type: "Lời khai", title: "Khải đổi lời khai",
      text: "Khải thừa nhận anh không về ngay lúc 19h05 như đã khai. Anh đứng ở đầu ngõ đến khoảng 20h, thấy một xe máy đỏ đậu trước tiệm và một người phụ nữ tóc dài đứng cạnh cửa.",
      visual: { k: "who", id: "khai" },
      spans: [{ who: "khai", from: "19:05", to: "20:00", at: "Đầu ngõ Hàng Bạc" }] }
  ],
  culprit: "quyen",
  // Đưa chứng cứ cho người đã bị hỏi: "who" là người nhận, "clue" là hồ sơ đưa ra, "reveal" là lời khai mới (nếu có).
  // Cặp không có trong danh sách vẫn đưa được, và người đó chỉ giữ nguyên lời khai.
  confront: [
    { who: "khai", clue: "xe", reveal: "khai_thu",
      text: "Khải nhìn tờ đăng ký, mặt tái đi: “Xe của tôi màu xanh... nhưng tối đó tôi có đứng ở đầu ngõ.” Anh ngập ngừng rồi đổi lời khai." },
    { who: "quyen", clue: "camera", reveal: "quyen_thu",
      text: "Quyên không nhìn vào ảnh. Cô siết chặt quai túi: “Tôi chỉ ghé lấy đồ rồi về.” Cô thừa nhận đã có mặt ở tiệm, nhưng vẫn khăng khăng không mở tủ." },
    { who: "quyen", clue: "mau_giay",
      text: "Quyên đọc mẩu giấy rồi nói lảng sang chuyện con đang ốm. Cô không chịu giải thích chữ “Q.”." },
    { who: "lan", clue: "mau_giay",
      text: "Bà Lan đọc chậm từng chữ, môi mím lại: “Tôi giao chìa cho Quyên để mở cửa buổi sáng. Còn chuyện giữ kín, tôi không biết.”" },
    { who: "lan", clue: "sothu",
      text: "Bà Lan lật sổ thu chi: “Ba mươi triệu? Con bé không nói với tôi.” Bà không giận, chỉ thấy buồn." }
  ],
  // Chuỗi chứng minh khi buộc tội: mỗi bước cần một hồ sơ. "ids" là các hồ sơ được chấp nhận.
  chain: [
    { key: "motive", label: "Động cơ", ask: "Ai có lý do để lấy hộp?", ids: ["sothu"],
      hint: "Hãy tìm hồ sơ cho thấy ai đang cần tiền gấp." },
    { key: "opportunity", label: "Cơ hội", ask: "Ai có mặt ở tiệm lúc tủ bị mở?", ids: ["camera", "xe", "quyen_thu", "khai_thu"],
      hint: "Tủ không bị phá. Ai đã đến trước tiệm trong lúc tủ bị mở?" },
    { key: "means", label: "Phương tiện", ask: "Ai có chìa, hoặc cách mở tủ mà không cần phá?", ids: ["chia", "khamtu", "quyen_thu"],
      hint: "Ai có chìa tủ trong tay?" }
  ],
  // Kết nối giữa các hồ sơ. "about" là nghi phạm mà kết nối nói tới, hiện trong sổ tay.
  links: [
    { a: "xe", b: "camera", kind: "liên hệ", about: "quyen",
      text: "Biển số đuôi 58 trên camera khớp với chiếc xe đứng tên Quyên." },
    { a: "quyen", b: "camera", kind: "mâu thuẫn", about: "quyen",
      text: "Quyên khai ở nhà cả tối, nhưng camera ghi chiếc xe đỏ của cô về tiệm lúc 20h05." },
    { a: "khai", b: "xe", kind: "liên hệ", about: "khai",
      text: "Đăng ký ghi Khải đi xe máy xanh biển. Chiếc xe đỏ trước tiệm không phải xe của anh." },
    { a: "bino", b: "camera", kind: "liên hệ", about: "binh",
      text: "Camera ghi xe đỏ đậu trước tiệm lúc 20h05–20h40, trong khi Bình ngồi ở quán bia đầu ngõ từ 19h đến 21h30." },
    { a: "chia", b: "giod", kind: "liên hệ", about: "lan",
      text: "Bà Lan ngồi ở đám giỗ đến sau 22h, nên không thể có mặt ở tiệm lúc chiếc xe đỏ đậu trước cửa." },
    { a: "mau_giay", b: "chia", kind: "mâu thuẫn", about: "quyen",
      text: "Bà Lan khai đã giao chìa thứ hai cho Quyên, nhưng mẩu giấy cho thấy việc này được giữ kín. Một trong hai điều không đúng." }
  ],
  explanation: "<p><b>Cách hộp được lấy đi:</b> không có dấu cạy, và chìa phụ không mở được tủ. Hộp mở bằng chìa chính.</p><p><b>Ai có chìa chính?</b> Chỉ hai chiếc còn lưu hành: của bà Lan và của Quyên. Bình đã trả chìa khi nghỉ việc, Khải chưa bao giờ có chìa — hai người này bị loại.</p><p><b>Loại bà Lan:</b> sổ ghi danh xác nhận bà ở đám giỗ từ 18h30 đến sau 22h.</p><p><b>Còn lại Quyên.</b> Camera ghi chiếc xe máy đỏ đuôi 58 về tiệm lúc 20h05 — mâu thuẫn với lời khai “ở nhà cả tối” của cô. Sổ thu chi cho thấy cô đang cần tiền.</p>"
},
{
  id: "c2", no: 2, title: "Bức Tranh Mất Tích", place: "Phòng tranh Thanh Trúc · phố Hàng Gai",
  level: "★★★ Vừa khó", budget: 12,
  clock: { start: "21:30" },
  world: [
    { at: "22:30", kind: "leave", id: "tuan", text: "Tuấn xin về sớm vì có chuyến bay lúc 23h30. Cảnh sát cho anh ra về." },
    { at: "23:30", kind: "gone", id: "cam_kt", text: "Kỹ thuật viên khởi động lại cầu dao, đoạn ghi của camera pin dự phòng bị ghi đè." }
  ],
  intro: "Đêm khai mạc triển lãm, phòng tranh Thanh Trúc đông khách. Bức sơn dầu “Thiếu Nữ Bên Hồ” — định giá 2 tỷ đồng — vẫn còn trên tường lúc 21h15, khi nhà sưu tầm Nga đăng story khoe ảnh. Lúc 21h20, cầu dao hành lang nhân viên sập, cả sảnh tối trong vài phút. Đèn sáng lại lúc 21h25, bức tranh đã biến khỏi tường. Từ 21h, cửa hông ra hẻm sau bị chèn bằng thùng nước để bưng đồ ăn, nên không khóa được. Cảnh sát đã giữ khách lại. Bạn có 7 giờ điều tra.",
  suspects: [
    { id: "hoang", name: "Hoàng", role: "Giám đốc phòng tranh · 45 tuổi", bio: "Có chìa cửa chính. Khi có sự cố điện, anh là người xử lý cầu dao.",
      look: { skin: "#f2cfae", hair: "short", hc: "#222", top: "#1f3a5f", acc: "tie", ac: "#8e2c2c" } },
    { id: "nga", name: "Nga", role: "Nhà sưu tầm · 50 tuổi", bio: "Từng trả giá cao nhất cho bức tranh nhưng bị từ chối.",
      look: { skin: "#f5d6bc", hair: "bun", hc: "#5a3a2a", top: "#6c3483", acc: "none" } },
    { id: "phong", name: "Phong", role: "Họa sĩ trẻ · 28 tuổi", bio: "Tranh của anh bị loại khỏi triển lãm đêm nay.",
      look: { skin: "#e8bf98", hair: "long", hc: "#111", top: "#1b1b1b", acc: "none" } },
    { id: "tuan", name: "Tuấn", role: "Môi giới nghệ thuật · 38 tuổi", bio: "Được hoa hồng nếu bán được tranh đêm nay.",
      look: { skin: "#d9a77c", hair: "short", hc: "#2b1d14", top: "#6b7a2e", acc: "none" } },
    { id: "thao", name: "Thảo", role: "Bảo vệ · 30 tuổi", bio: "Đứng ở cổng, soi thẻ mời khách.",
      look: { skin: "#c98f63", hair: "hat", hc: "#2c5d86", top: "#2c5d86", acc: "none" } }
  ],
  locations: [
    { id: "gallery", name: "Phòng tranh Thanh Trúc", time: "21:15", scene: "gallery", hs: [
      ["hoi_nga", 560, 560, "Hỏi Nga"], ["hoi_tuan", 1110, 470, "Hỏi Tuấn"], ["hoi_phong", 300, 500, "Hỏi Phong"], ["quay_do", 1300, 560, "Quầy giữ đồ"] ] },
    { id: "gate", name: "Cổng và hẻm sau", time: "21:20", scene: "gate", hs: [
      ["hoi_thao", 430, 520, "Hỏi Thảo"], ["so_cong", 700, 540, "Sổ khách"], ["cam_hem", 1240, 300, "Camera hẻm sau"] ] },
    { id: "corridor", name: "Hành lang kỹ thuật", time: "21:22", scene: "corridor", hs: [
      ["cam_kt", 800, 190, "Camera hành lang"] ] },
    { id: "hub", name: "Phòng lưu trữ", time: "Bất kỳ lúc nào", scene: "archive", hs: [
      ["suv", 400, 500, "Sổ bãi xe"], ["so_gia", 1100, 560, "Hồ sơ nội bộ"] ] }
  ],
  actions: [
    { id: "hoi_nga", cost: 1, type: "Lời khai", title: "Nga: story 21h15 và chiếc áo",
      text: "Nga khai cô đăng story lúc 21h15, khi bức tranh còn trên tường. Sau đó cô vào nhà vệ sinh gần sảnh đến khoảng 21h30 vì chóng mặt. Cả buổi tối, cô khẳng định chỉ có anh Tuấn mặc áo khoác mù tạt; anh gửi áo ở quầy giữ đồ từ lúc mới đến. Phong mặc áo đen suốt buổi và ngồi gần bàn buffet.",
      visual: { k: "who", id: "nga" },
      alibi: { who: "nga", from: "21:15", to: "21:30", at: "Nhà vệ sinh gần sảnh" } },
    { id: "hoi_thao", cost: 1, type: "Lời khai", title: "Thảo: cổng và thẻ từ",
      text: "Thảo đứng ở cổng chính soi thẻ mời từ 21h. Anh nói chỉ có anh và anh Hoàng được cấp thẻ mở cửa hông. Từ 21h, nhân viên đặt thùng nước chèn cửa hông để bưng đồ ăn vào, nên cửa hông không đóng được trong buổi tối.",
      visual: { k: "who", id: "thao" },
      alibi: { who: "thao", from: "21:00", to: "21:30", at: "Cổng chính" } },
    { id: "so_cong", cost: 1, type: "Hồ sơ", title: "Sổ khách ở cổng",
      text: "Sổ khách ở cổng ghi ông Lâm — khách đến trễ — được soi thẻ lúc 21h18, Thảo ký xác nhận. Lễ tân ghi thêm: Thảo đứng ở cổng cho đến 21h30.",
      visual: { k: "paper", alt: "Sổ khách ở cổng", title: "SỔ KHÁCH Ở CỔNG",
        rows: ["21h18 · Ông Lâm (đến trễ)", "Soi thẻ · Thảo ký xác nhận", "Thảo đứng cổng đến 21h30"] },
      spans: [{ who: "thao", from: "21:00", to: "21:30", at: "Cổng chính" }] },
    { id: "quay_do", cost: 1, type: "Hồ sơ", title: "Phiếu gửi áo số 7",
      text: "Phiếu gửi số 7 là một áo khoác màu mù tạt, gửi từ đầu buổi. Phiếu được trả lại lúc 21h12, người nhận ký đúng tên người giữ phiếu: Đặng Minh Tuấn.",
      visual: { k: "paper", alt: "Phiếu gửi áo số 7", title: "PHIẾU GỬI ĐỒ · SỐ 7",
        rows: ["Đồ: áo khoác màu mù tạt", "Gửi: đầu buổi tối", "Trả lại: 21h12", "Người nhận ký: Đặng Minh Tuấn"], stamp: "ĐÃ TRẢ" } },
    { id: "hoi_tuan", cost: 1, type: "Lời khai", title: "Tuấn: đứng cạnh buffet",
      text: "Tuấn khai anh đứng cạnh bàn buffet, gần khu tranh, từ 21h đến khoảng 21h40. Anh không rời phòng, không đụng đến áo khoác và vẫn để nó ở quầy giữ đồ.",
      visual: { k: "who", id: "tuan" },
      alibi: { who: "tuan", from: "21:00", to: "21:40", at: "Phòng tranh Thanh Trúc" } },
    { id: "cam_hem", cost: 2, type: "Camera", title: "Camera hẻm sau (nguồn điện riêng)",
      text: "21h17: một người áo đen đứng hút thuốc ở góc hẻm, cửa hông đang chèn thùng. 21h20: người này đi vào lại qua cửa hông. 21h21: một chiếc SUV trắng đỗ sát lề hẻm. 21h23: một người đàn ông mặc áo khoác mù tạt, ôm bọc vải dài, từ cửa hông đi ra và chuyển bọc lên xe. 21h24: SUV rời hẻm.",
      visual: { k: "cam", scene: "cam_suv", time: "21:23", cam: "CAM HẺM SAU",
        alt: "Người áo mù tạt chuyển bọc dài lên SUV trắng lúc 21h23" },
      spans: [
        { who: "phong", needs: ["cam_kt"], from: "21:17", to: "21:20", at: "Hẻm sau" },
        { who: "tuan", needs: ["hoi_nga", "quay_do"], from: "21:22", to: "21:24", at: "Cửa hông" }
      ] },
    { id: "suv", cost: 1, type: "Hồ sơ", title: "Sổ bãi xe đầu hẻm",
      text: "Sổ bãi xe đầu hẻm ghi chiếc SUV trắng thường đỗ ở đó đăng ký dưới tên Đặng Minh Tuấn. Sổ ghi xe được lái ra khỏi bãi lúc 21h19.",
      visual: { k: "paper", alt: "Sổ bãi xe đầu hẻm", title: "SỔ BÃI XE ĐẦU HẺM",
        rows: ["Xe SUV trắng · chủ: Đặng Minh Tuấn", "Ra khỏi bãi: 21h19"] } },
    { id: "cam_kt", cost: 1, type: "Camera", title: "Camera hành lang kỹ thuật",
      text: "Camera pin dự phòng ở hành lang kỹ thuật chạy suốt khi mất điện. Hình ghi: Hoàng đứng cạnh tủ điện từ 21h20 đến 21h26, không rời khung hình. Lúc 21h20, Phong đi từ cửa hông vào sảnh qua hành lang.",
      visual: { k: "cam", scene: "cam_corridor", time: "21:20", cam: "CAM HL KỸ THUẬT",
        alt: "Hoàng đứng cạnh tủ điện trong hành lang kỹ thuật" },
      spans: [
        { who: "hoang", from: "21:20", to: "21:26", at: "Hành lang kỹ thuật" },
        { who: "phong", from: "21:20", to: "21:21", at: "Hành lang kỹ thuật" }
      ] },
    { id: "hoi_phong", cost: 1, type: "Lời khai", title: "Phong: ra ban công",
      text: "Phong khai anh ra ban công hút thuốc từ 21h15 đến 21h30, không xuống hẻm và không thấy ai ở cửa hông.",
      visual: { k: "who", id: "phong" },
      alibi: { who: "phong", from: "21:15", to: "21:30", at: "Ban công" } },
    { id: "so_gia", cost: 1, type: "Hồ sơ", title: "Hồ sơ đấu giá nội bộ",
      text: "Nga từng trả giá cao nhất cho bức tranh nhưng phòng tranh từ chối bán. Tuấn đang nợ môi giới 1,2 tỷ đồng, hạn trả là cuối tuần này, và đêm nay anh được hứa hoa hồng nếu bán được tranh.",
      visual: { k: "paper", alt: "Hồ sơ nội bộ", title: "HỒ SƠ NỘI BỘ",
        rows: ["Nga từng trả giá cao nhất", "Tuấn nợ môi giới 1,2 tỷ", "Hạn trả: cuối tuần này"], stamp: "MẬT" } },
    { id: "tuan_thu", cost: 0, via: "confront", type: "Lời khai", title: "Tuấn thừa nhận: bọc vải",
      text: "Tuấn thừa nhận có mặt ở cửa hông lúc 21h23 để chuyển một bọc vải dài lên xe. Anh nói đó là “đồ mượn của một người bạn”, và không chịu nói tên người bạn đó.",
      visual: { k: "who", id: "tuan" },
      spans: [{ who: "tuan", from: "21:22", to: "21:24", at: "Cửa hông" }] },
    { id: "phong_thu", cost: 0, via: "confront", type: "Lời khai", title: "Phong thừa nhận: xuống hẻm",
      text: "Phong thừa nhận anh xuống hẻm hút thuốc lúc 21h17 và quay lại qua cửa hông lúc 21h20. Anh nói dối về ban công vì sợ bị nghi, và không thấy ai mang bọc đi.",
      visual: { k: "who", id: "phong" },
      spans: [{ who: "phong", from: "21:17", to: "21:20", at: "Hẻm sau" }] }
  ],
  culprit: "tuan",
  confront: [
    { who: "tuan", clue: "cam_hem", reveal: "tuan_thu",
      text: "Tuấn nhìn màn hình, nụ cười tắt hẳn. “Đó không phải chuyện tôi làm...” Anh im lặng một lúc lâu, rồi thừa nhận mình có mặt ở cửa hông." },
    { who: "phong", clue: "cam_kt", reveal: "phong_thu",
      text: "Phong cười gượng: “Anh biết tôi có ra hẻm, nhưng tôi không thấy gì.” Khi nghe đoạn camera hành lang, anh thú nhận đã nói dối về ban công." },
    { who: "tuan", clue: "quay_do",
      text: "Tuấn nhìn phiếu gửi áo: “Tôi lấy áo lúc 21h12 rồi để lại quầy. Vậy thôi.” Anh không giải thích vì sao áo lại ở hẻm." },
    { who: "nga", clue: "so_gia",
      text: "Nga nói về bức tranh với vẻ tiếc nuối: “Tôi đã trả giá cao nhất. Nhưng tôi không lấy nó, tôi đang ở nhà vệ sinh lúc 21h30.”" }
  ],
  chain: [
    { key: "motive", label: "Động cơ", ask: "Ai đang cần tiền hoặc bán được tranh?", ids: ["so_gia"],
      hint: "Tìm hồ sơ nói về khoản nợ hoặc hoa hồng đêm nay." },
    { key: "opportunity", label: "Cơ hội", ask: "Ai có mặt ở hẻm sau lúc cầu dao sập?", ids: ["cam_hem", "tuan_thu"],
      hint: "Camera hẻm sau ghi ai đi qua cửa hông trong lúc mất điện?" },
    { key: "means", label: "Phương tiện", ask: "Ai có thể chuyển bức tranh đi?", ids: ["suv", "quay_do"],
      hint: "Một chiếc xe đủ lớn, hoặc một chiếc áo để che bọc tranh, có thể là manh mối." }
  ],
  explanation: "<p><b>Chuỗi thời gian:</b> 21h12 Tuấn nhận lại áo khoác mù tạt. 21h20 sảnh tối. 21h23 camera hẻm ghi một người đàn ông mặc áo mù tạt chuyển bọc dài lên chiếc SUV trắng; 21h24 xe rời đi.</p><p><b>Vì sao là Tuấn:</b> chiếc SUV đăng ký dưới tên anh, và Nga xác nhận chỉ anh có áo khoác đó. Lời khai “đứng cạnh buffet suốt” của anh bị bác bởi chính phiếu gửi áo và đoạn camera.</p><p><b>Các nghi phạm khác:</b> Thảo có mặt ở cổng theo sổ khách. Hoàng đứng cạnh tủ điện suốt từ 21h20 đến 21h26. Phong mặc áo đen và ra vào hẻm lúc 21h17–21h20 — lời khai “ban công” của anh là giả, nhưng anh không phải người mang bọc. Nga có động cơ mua tranh, nhưng người đàn ông trong camera không phải cô.</p>"
},
{
  id: "c3", no: 3, title: "Chiếc Trâm Ngọc", place: "Nhà cổ ông Tư · phố Hàng Ngang",
  level: "★★★★★ Khó nhất", budget: 16,
  clock: { start: "22:00" },
  world: [
    { at: "23:00", kind: "leave", id: "tung", text: "Tùng bắt chuyến xe đêm về Sài Gòn vì công việc, không còn ở nhà ông Tư." },
    { at: "00:00", kind: "gone", id: "camera_ngo", text: "Mưa lớn làm chập mạch đèn cổng ngõ. Nhân viên lau khô máy và xóa đoạn ghi bị nhiễu." }
  ],
  intro: "Đêm giỗ cuối năm, trời mưa lớn. Sáu người trong nhà ông Tư ngồi quanh bàn tiệc từ 20h. Chiếc trâm ngọc “Hoa Mai” — di vật ba đời — được cất trong hộp gỗ ở tủ thờ, và vẫn còn nguyên khi bà Hoa thắp hương lúc 20h30. Lúc 22h, hộp được mở ra và trâm đã biến mất. Cảnh sát lấy lời khai từng người. Mỗi người đưa ra một nhận định về thủ phạm — việc của bạn là kiểm chứng.",
  suspects: [
    { id: "tung", name: "Tùng", role: "Con trai cả · 36 tuổi", bio: "Doanh nhân vừa về từ Sài Gòn tối nay.",
      look: { skin: "#f0c9a0", hair: "short", hc: "#222", top: "#37474f", acc: "tie", ac: "#b71c1c" } },
    { id: "thu", name: "Thu", role: "Con gái · 31 tuổi", bio: "Giáo viên, hay lau dọn phòng thờ.",
      look: { skin: "#f3d1ae", hair: "long", hc: "#2a1b10", top: "#ad1457", acc: "glasses" } },
    { id: "phuc", name: "Phúc", role: "Chú họ · 58 tuổi", bio: "Người thân thiết nhất với ông Tư, hay ngồi uống trà.",
      look: { skin: "#e2b48a", hair: "bald", hc: "#bbb", top: "#5d4037", acc: "mustache" } },
    { id: "hoa", name: "Hoa", role: "Con dâu · 33 tuổi", bio: "Thắp hương mỗi tối, đi lại trong phòng thờ.",
      look: { skin: "#f5d2b3", hair: "bun", hc: "#1a1a1a", top: "#00695c", acc: "none" } },
    { id: "minh", name: "Minh", role: "Cháu nội · 20 tuổi", bio: "Sinh viên ở Hà Nội, mới về quê hai hôm trước.",
      look: { skin: "#f0c9a0", hair: "short", hc: "#3b2a1b", top: "#f9a825", acc: "none" } },
    { id: "ngoc", name: "Ngọc", role: "Người giúp việc · 45 tuổi", bio: "Làm trong nhà ông Tư gần 15 năm.",
      look: { skin: "#dba77e", hair: "hat", hc: "#8d6e63", top: "#546e7a", acc: "none" } }
  ],
  locations: [
    { id: "banquet", name: "Nhà ông Tư · phòng khách", time: "22:00", scene: "banquet", hs: [
      ["loi_tung", 330, 470, "Hỏi Tùng"], ["loi_thu", 560, 420, "Hỏi Thu"], ["loi_phuc", 800, 370, "Hỏi Phúc"],
      ["loi_hoa", 1040, 420, "Hỏi Hoa"], ["loi_minh", 520, 700, "Hỏi Minh"], ["loi_ngoc", 1080, 700, "Hỏi Ngọc"],
      ["ngan_bimat", 1320, 300, "Hộp trâm"] ] },
    { id: "alley", name: "Ngõ đối diện", time: "21:40", scene: "alley_rain", hs: [
      ["camera_ngo", 640, 290, "Camera ngõ"], ["quan_cafe", 1320, 540, "Quán cà phê"] ] },
    { id: "hub", name: "Phòng lưu trữ", time: "Bất kỳ lúc nào", scene: "archive", hs: [
      ["di_chuc", 420, 500, "Di chúc ông Tư"], ["bien_ban", 1100, 560, "Biên bản"] ] }
  ],
  actions: [
    { id: "loi_tung", cost: 1, type: "Lời khai", title: "Tùng: một lời khẳng định",
      text: "Tùng nói anh không muốn nghi ngờ người trong nhà. Nhưng anh có thể khẳng định: thủ phạm không phải là Minh, cũng không phải là Ngọc.",
      visual: { k: "who", id: "tung" } },
    { id: "loi_thu", cost: 1, type: "Lời khai", title: "Thu: loại trừ chị Hoa",
      text: "Thu nói chị không tin chị dâu Hoa đã làm chuyện này. Chị khẳng định: chị Hoa không phải là người lấy trâm.",
      visual: { k: "who", id: "thu" } },
    { id: "loi_phuc", cost: 1, type: "Lời khai", title: "Phúc: chỉ về hai người",
      text: "Chú Phúc uống trà và nói chậm rãi. Suốt buổi tối chú ngồi ở phòng khách, không đi đâu. Theo chú, thủ phạm là anh Tùng hoặc chị Thu.",
      visual: { k: "who", id: "phuc" },
      alibi: { who: "phuc", from: "21:00", to: "21:45", at: "Phòng khách" } },
    { id: "loi_hoa", cost: 1, type: "Lời khai", title: "Hoa: nghi chú Phúc",
      text: "Bà Hoa nói bà chỉ nghĩ vậy, không có chứng cứ. Theo bà, người hiểu rõ phòng thờ nhất là chú Phúc, nên thủ phạm chính là chú Phúc. Lúc 20h30 bà thắp hương ở phòng thờ, khi ấy hộp trâm vẫn còn nguyên.",
      visual: { k: "who", id: "hoa" },
      spans: [{ who: "hoa", from: "20:30", to: "20:35", at: "Phòng thờ" }] },
    { id: "loi_minh", cost: 1, type: "Lời khai", title: "Minh: loại trừ chú Phúc",
      text: "Minh nói cậu vừa về quê và không muốn lên tiếng. Cậu khẳng định: chú Phúc không phải là người lấy trâm.",
      visual: { k: "who", id: "minh" } },
    { id: "loi_ngoc", cost: 1, type: "Lời khai", title: "Ngọc: chỉ cậu Minh",
      text: "Chị Ngọc run tay, chỉ nói ngắn gọn: thủ phạm là cậu Minh.",
      visual: { k: "who", id: "ngoc" } },
    { id: "ngan_bimat", cost: 2, type: "Vật chứng", title: "Hộp gỗ có ngăn bí mật",
      text: "Trâm ngọc nằm trong một ngăn bí mật dưới đáy hộp, chỉ mở được khi bấm đồng thời hai núm sen. Ông Tư chỉ cách làm này cho các con ruột và chú Phúc. Cậu Minh đi học xa từ nhỏ; chị Ngọc chỉ quét dọn trong nhà. Hai người này chưa từng được chỉ cách mở, và trên núm sen không có dấu tay của họ.",
      visual: { k: "box" } },
    { id: "bien_ban", cost: 2, type: "Biên bản", title: "Kết luận kiểm chứng",
      text: "Đội điều tra đã đối chiếu từng lời khai với sổ khách, camera và các nhân chứng. Kết luận: đúng ba trong sáu lời khai khớp với sự thật. Ba lời còn lại là sai.",
      visual: { k: "paper", alt: "Biên bản kiểm chứng", title: "BIÊN BẢN KIỂM CHỨNG",
        rows: ["Đối chiếu 6 lời khai với sổ,", "camera và nhân chứng", "Kết quả: đúng 3 trên 6 lời", "Đội điều tra ký xác nhận"], stamp: "ĐÃ KIỂM" } },
    { id: "di_chuc", cost: 1, type: "Hồ sơ", title: "Di chúc ông Tư",
      text: "Di chúc ông Tư để chiếc trâm “Hoa Mai” cho con cháu trong nhà, không nêu tên người giữ. Ghi chú của luật sư: chú Phúc hai lần xin được giữ trâm “để thờ cho đúng”, và cả hai lần ông Tư từ chối.",
      visual: { k: "paper", alt: "Di chúc ông Tư", title: "DI CHÚC",
        rows: ["Trâm “Hoa Mai”: con cháu trong nhà", "Chú Phúc xin giữ trâm: 2 lần", "Ông Tư từ chối cả hai lần"], stamp: "MẬT" } },
    { id: "quan_cafe", cost: 1, type: "Hồ sơ", title: "Chủ quán: đèn phòng thờ",
      text: "Mưa to từ 20h. Quán tôi thấy đèn phòng thờ tắt lúc 21h, nhưng không chắc ai đã vào.",
      visual: { k: "paper", alt: "Ghi chú quán cà phê", title: "GHI CHÚ QUÁN CÀ PHÊ",
        rows: ["Mưa to từ 20h", "Đèn phòng thờ tắt lúc 21h", "Không chắc ai đã vào"] },
      spans: [{ from: "21:00", to: "21:10", at: "Phòng thờ" }] },
    { id: "camera_ngo", cost: 2, type: "Camera", title: "Camera cổng ngõ (bị mưa)",
      text: "Hình ảnh mờ vì mưa. Lúc 21h40 có một ánh đèn pin lóe lên ở cửa phòng thờ, nhưng không nhận diện được người cầm đèn.",
      visual: { k: "cam", scene: "cam_rain", time: "21:40", cam: "CAM CỔNG NGÕ",
        alt: "Hình mờ vì mưa, ánh đèn pin ở cửa phòng thờ" },
      spans: [{ from: "21:40", to: "21:41", at: "Cửa phòng thờ" }] },
    { id: "phuc_thu", cost: 0, via: "confront", type: "Lời khai", title: "Phúc thừa nhận: về phòng thờ",
      text: "Chú Phúc thừa nhận ông Tư từng chỉ cho chú cách mở ngăn bí mật, và sau 21h chú có quay lại phòng thờ để thắp hương. Chú nói đèn tắt vì mưa, và khẳng định không mở hộp.",
      visual: { k: "who", id: "phuc" },
      spans: [{ who: "phuc", from: "21:10", to: "21:40", at: "Phòng thờ" }] },
    { id: "hoa_thu", cost: 0, via: "confront", type: "Lời khai", title: "Hoa nhớ lại lời chú Phúc",
      text: "Bà Hoa nhớ lại tuần trước chú Phúc nói: “Trâm đó phải về đúng chỗ.” Bà không dám nói sớm, vì đó là chú ruột của chồng.",
      visual: { k: "who", id: "hoa" } }
  ],
  culprit: "phuc",
  matrix: {
    rows: ["tung", "thu", "phuc", "hoa", "minh", "ngoc"],
    cols: [
      { act: "loi_tung", label: "Tùng" }, { act: "loi_thu", label: "Thu" }, { act: "loi_phuc", label: "Phúc" },
      { act: "loi_hoa", label: "Hoa" }, { act: "loi_minh", label: "Minh" }, { act: "loi_ngoc", label: "Ngọc" }
    ]
  },
  confront: [
    { who: "phuc", clue: "ngan_bimat", reveal: "phuc_thu",
      text: "Chú Phúc nhìn hộp gỗ rất lâu, tay không chạm vào. “Ông Tư từng chỉ cho tôi, tôi không quên.” Rồi chú thừa nhận đã quay lại phòng thờ, nhưng khẳng định không mở hộp." },
    { who: "hoa", clue: "di_chuc", reveal: "hoa_thu",
      text: "Bà Hoa đọc di chúc, mắt đỏ lên: “Chú ấy không xin một lần. Chú xin hai lần.” Bà nhớ lại điều chú từng nói." },
    { who: "ngoc", clue: "ngan_bimat",
      text: "Chị Ngọc tránh nhìn hộp: “Tôi chỉ quét dọn trong nhà. Ông Tư chưa bao giờ chỉ cho tôi.”" },
    { who: "tung", clue: "di_chuc",
      text: "Tùng đọc lướt rồi đặt tờ giấy xuống: “Trâm là của cả nhà. Tôi không quan tâm chú Phúc muốn gì.”" }
  ],
  chain: [
    { key: "means", label: "Phương tiện", ask: "Ai biết cách mở ngăn bí mật?", ids: ["ngan_bimat", "phuc_thu"],
      hint: "Chiếc trâm nằm trong ngăn chỉ mở được bằng cách bấm hai núm sen. Ai được chỉ cách làm này?" },
    { key: "motive", label: "Động cơ", ask: "Ai muốn có chiếc trâm?", ids: ["di_chuc", "hoa_thu"],
      hint: "Hãy xem di chúc và ghi chú của luật sư." },
    { key: "opportunity", label: "Cơ hội", ask: "Ai có thể ở trong phòng thờ lúc đèn tắt?", ids: ["quan_cafe", "camera_ngo", "phuc_thu"],
      hint: "Đèn phòng thờ tắt lúc 21h, và có một ánh đèn pin ở cửa lúc 21h40." }
  ],
  explanation: "<p><b>Bước 1 — Biên bản:</b> đúng 3 trong 6 lời khai là thật.</p><p><b>Bước 2 — Thử từng người làm thủ phạm rồi đếm số lời đúng:</b> Tùng hoặc Thu → 4 lời đúng; Hoa hoặc Ngọc → 2 lời đúng; Minh hoặc Phúc → 3 lời đúng.</p><p><b>Bước 3 — Ngăn bí mật:</b> chỉ các con ruột và chú Phúc biết cách mở. Loại Minh (cháu, sống xa, chưa từng được chỉ), loại Ngọc, loại Hoa (con dâu, không nằm trong nhóm được chỉ cách). Tùng và Thu bị loại vì đếm được 4 lời đúng, không khớp biên bản. Chỉ còn chú Phúc.</p><p><b>Kiểm lại:</b> nếu là chú Phúc thì lời của Tùng đúng (“không phải Minh, không phải Ngọc”), lời của Thu đúng (“không phải Hoa”), lời của Hoa đúng (“thủ phạm là Phúc”). Lời của Phúc sai, lời của Minh sai, lời của Ngọc sai. Đúng ba lời thật — khớp biên bản.</p>"
}
];
