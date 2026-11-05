/* Vụ mẫu chỉ dùng để kiểm thử engine luật chơi (không nằm trong trò chơi).
   Có đủ các cơ chế mà hai vụ Sài Gòn không dùng: diễn biến làm mất hồ sơ ("gone"), nghi phạm rời đi ("leave"),
   chuỗi chứng minh ba bước, kết nối giữa hồ sơ và đưa chứng cứ. */

export const FX = {
  id: "fx", no: 1, region: "sg", title: "Hộp Trầm Hương", place: "Tiệm đồ cổ Hoa Sen",
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
      look: { skin: "#f0c9a0", hair: "bun", hc: "#2b2b2b", top: "#7a3e8f", acc: "glasses", outfit: "aodai" } },
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
};
