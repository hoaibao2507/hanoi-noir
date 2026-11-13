/* =====================================================================
   HANOI NOIR · Vùng Sài Gòn · Vụ 5 "Hai Phút Một Ga"
   Tuyến metro số 1 (Bến Thành – Suối Tiên). Chuyến tàu cuối đêm thứ Sáu, mưa lớn: một người ngồi gục ở ghế cuối toa 3, tới ga cuối mới thấy đã chết.
   Mọi thời gian chạy giữa hai ga liền kề đều cố định hai phút, nên đoàn tàu là một cái đồng hồ: ai ở đâu lúc nào tính được tới từng giây.
   Kẻ ra tay xuống ở ga Ba Son, nơi hai đoàn cuối (lên và xuống) cùng đỗ hai bên một sân ga đảo, bước ngang sân ga sang đoàn ngược chiều rồi về lại Bến Thành:
   sổ vé chỉ thấy một người "vào ga rồi ra ga" sau mười bốn phút, không thấy đi đâu.
   - deduce: 20 kết luận, mỗi lần ghép đúng 2 hồ sơ; số học của bảng giờ + nhật ký thẻ, vòng loại trừ ở khung giờ 22:03
   - lock: điện thoại nạn nhân có mã bốn số = số hiệu đoàn tàu rồi số hiệu chuyến (nhãn ghế, bảng giờ, lời trợ lý)
   - gate: sao kê tài khoản công ty chỉ xin được khi biết biên bản nghiệm thu phanh là khống
   - world "arrive": bốn hồ sơ về muộn (ổ ghi hình trên tàu, sao kê thẻ toàn tuyến, nhật ký sửa biểu đồ, kết quả độc chất)
   - confront: năm người nói dối chuyện riêng (Ngân, Vũ, Thắm, Kiên, Trang), chỉ có một người giấu chuyện đi vòng
   - mới: bảng giờ chạy tàu cố định làm chứng; thủ phạm biến khỏi tuyến bằng cách đổi đoàn tàu trên sân ga đảo, không để lại lượt quẹt nào
   Người chơi lại gặp Vũ, Ngân, Thắm, Trang của các vụ trước, ở những vai khác.
   ===================================================================== */

// Tên nơi dùng chung cho lời khai (alibi) và mốc camera/nhật ký (spans): phải trùng khớp từng chữ thì ngoại phạm mới đối chiếu được
const CAB = "Cabin lái đoàn tàu U-07";
const PLATBS = "Sân ga Ba Son (trong khu soát vé)";
const REST = "Khu vực trực của nhân viên ga Bến Thành";
const OUTBS = "Ngoài ga Ba Son (đã ra khỏi cổng soát vé)";
const PAID = "Trong khu soát vé ga Bến Thành (sân ga, đoàn tàu)";
const OCCR = "Phòng điều hành OCC (tầng 5)";
const CORR = "Hành lang ngoài phòng điều hành (tầng 5)";
const RESTO = "Nhà hàng ven sông ở Bình Thạnh";
const HOME = "Nhà riêng của Trang";
const OFFAT = "Văn phòng Ban An toàn (tầng 3 nhà điều hành)";
const OFFKH = "Phòng Kế hoạch (tầng 3 nhà điều hành)";
const OUTF3 = "Ngoài tầng 3 nhà điều hành";
const T5 = "Toa 5 đoàn tàu U-07";

export const METRO = {
  id: "s5", no: 5, region: "sg", title: "Hai Phút Một Ga", place: "Tuyến metro số 1 · ga Bến Thành – ga Suối Tiên, TP. Hồ Chí Minh",
  level: "★★★★★★★ Hai phút", budget: 15,
  clock: { start: "23:40" },
  world: [
    { at: "01:30", kind: "arrive", id: "cam_toa3", text: "Phòng kỹ thuật tháo xong ổ ghi hình trên đoàn tàu ĐT-12 và chép được hình các camera trong toa 3 và toa 5." },
    { at: "02:30", kind: "arrive", id: "nk_the_bt", text: "Trung tâm kiểm soát ra vào gửi sao kê thẻ toàn tuyến (thẻ nhân viên, thẻ đối tác) theo yêu cầu khẩn của cơ quan điều tra." },
    { at: "03:30", kind: "arrive", id: "nk_bieu_do", text: "Phòng công nghệ thông tin gửi nhật ký chỉnh sửa biểu đồ chạy tàu của ba tháng gần nhất." },
    { at: "05:00", kind: "arrive", id: "doc_chat", text: "Phòng giám định hoàn thành kết quả độc chất từ mẫu máu của nạn nhân." }
  ],
  intro: "Đêm thứ Sáu, mưa như trút, metro số 1 chạy chuyến cuối. Đoàn tàu U-07 rời ga Bến Thành đúng 22h00, mỗi ga dừng đúng hai phút, tới ga cuối Suối Tiên đúng 22h26, không trễ một giây. Người dọn vệ sinh bước vào toa 3 và thấy một người đàn ông ngồi gục ở ghế cuối, quyển sách còn mở trên đùi: ông Lương Quốc Thịnh, 53 tuổi, Trưởng ban An toàn – Chất lượng của đơn vị vận hành. Ông đã chết. Không máu, không vết giằng co, không ai khai đã thấy gì. Sáng mai, bảy giờ, ông định nộp lên Ban Quản lý một bản báo cáo về phanh của mười bốn đoàn tàu. Bạn đến lúc 23h40, khi đoàn tàu còn đỗ nguyên ở ga cuối. Bảng giờ chạy tàu không có chỗ cho một vụ giết người: từ Bến Thành tới Suối Tiên không ga nào mở cửa quá bốn mươi giây, không ai lên hay xuống toa 3 mà camera không thấy. Và nếu mỗi ga cách nhau đúng hai phút, thì một người muốn biến khỏi con tàu này phải biết rõ hơn ai hết đồng hồ của nó.",
  suspects: [
    { id: "ngan", name: "Ngân", role: "Trưởng ca soát vé ga Bến Thành · 41 tuổi", bio: "Mười lăm năm làm ở ga, nắm cổng soát vé và phòng nghỉ nhân viên như lòng bàn tay. Ca tối nay chị trực từ 14h tới 23h, nói là chưa rời ga nửa bước.",
      look: { skin: "#efc9a7", hair: "long", hc: "#2a1a14", top: "#2e4a6b", acc: "none" } },
    { id: "vu", name: "Vũ", role: "Lái tàu chuyến cuối U-07 · 34 tuổi", bio: "Lái metro từ ngày khai trương, tự hào rằng chưa lần nào trễ quá năm giây. Chuyến cuối tối nay anh lái đoàn tàu ĐT-12 từ Bến Thành tới Suối Tiên.",
      look: { skin: "#dfae85", hair: "short", hc: "#2a1e16", top: "#1d3b5a", acc: "none" } },
    { id: "tham", name: "Thắm", role: "Điều độ viên Trung tâm điều hành (OCC) · 29 tuổi", bio: "Ca đêm ở phòng điều hành, theo dõi từng đoàn tàu trên bảng sơ đồ tuyến. Người nhập mọi thay đổi giờ chạy vào hệ thống.",
      look: { skin: "#e9c09b", hair: "long", hc: "#2b1b14", top: "#355a7a", acc: "none" } },
    { id: "trang", name: "Trang", role: "Trợ lý Trưởng ban An toàn · 31 tuổi", bio: "Bảy năm làm việc bên ông Thịnh, biết rõ thói quen đi lại và cách đặt mật khẩu của ông. Tối nay cô nói mình ốm ở nhà.",
      look: { skin: "#f4d6bd", hair: "short", hc: "#2a1a14", top: "#8a7a5a", acc: "glasses", sex: "f" } },
    { id: "kien", name: "Kiên", role: "Giám đốc dự án nhà thầu bảo trì Thái Bình Rail · 47 tuổi", bio: "Công ty anh bảo trì phanh và cửa của mười bốn đoàn tàu theo hợp đồng 412 tỷ đồng. Mấy tuần nay ông Thịnh liên tục đòi xem lại hồ sơ kiểm tra phanh của anh.",
      look: { skin: "#d9ae88", hair: "short", hc: "#3a3a3a", top: "#5a5e68", acc: "tie", ac: "#2a3a5a", sex: "m" } },
    { id: "phuong", name: "Phương", role: "Trưởng phòng Kế hoạch & Biểu đồ chạy tàu · 44 tuổi", bio: "Người lập và giữ biểu đồ chạy tàu của cả tuyến, thuộc lòng từng giây của từng đoàn. Làm cùng ông Thịnh từ ngày khai trương, được ông gọi là “người nói chuyện bằng con số”.",
      look: { skin: "#f1d0b4", hair: "bun", hc: "#15110f", top: "#2a2f3a", acc: "glasses" } }
  ],
  locations: [
    { id: "car", name: "Toa 3 đoàn tàu ĐT-12 · ga Suối Tiên", time: "22:30", scene: "sg_mt_car", hs: [
      ["loi_vu", 400, 560, "Hỏi anh Vũ"], ["cam_cab", 560, 250, "Camera cabin lái"], ["hien_truong_toa", 1160, 560, "Ghế cuối toa 3"],
      ["dt_thinh", 800, 630, "Điện thoại trong túi xách"], ["ban_ghe", 1285, 676, "Dưới tay vịn ghế cuối", "soi"] ] },
    { id: "gate", name: "Sảnh soát vé ga Bến Thành", time: "21:55", scene: "sg_mt_gate", hs: [
      ["loi_ngan", 430, 580, "Hỏi chị Ngân"], ["cam_cong_bt", 880, 230, "Camera cổng soát vé"], ["nk_cong_bt", 760, 560, "Bộ điều khiển cổng soát vé"],
      ["ao_mua", 1230, 650, "Thùng rác nhà vệ sinh"], ["bang_gio", 1060, 360, "Bảng giờ tàu đêm"] ] },
    { id: "occ", name: "Trung tâm điều hành OCC · tầng 5", time: "22:04", scene: "sg_mt_occ", hs: [
      ["loi_tham", 420, 590, "Hỏi chị Thắm"], ["cam_occ", 1180, 230, "Camera phòng điều hành"], ["bieu_do", 800, 300, "Biểu đồ chạy tàu trên tường"],
      ["nk_vi_tri", 700, 580, "Nhật ký vị trí đoàn tàu"], ["nk_bieu_do", 1100, 560, "Máy trạm sửa biểu đồ"] ] },
    { id: "plat", name: "Sân ga đảo Ba Son · nơi hai đoàn gặp nhau", time: "22:04", scene: "sg_mt_plat", hs: [
      ["loi_kien", 700, 610, "Hỏi anh Kiên"], ["cam_bs", 1000, 250, "Camera sân ga"], ["nk_cong_bs", 800, 440, "Cổng ra ở cuối sân ga"],
      ["so_do_ba_son", 800, 316, "Sơ đồ ga Ba Son"], ["nk_cua_chan", 1110, 650, "Bảng điều khiển cửa chắn sân ga"] ] },
    { id: "office", name: "Văn phòng Ban An toàn · tầng 3 nhà điều hành", time: "22:20", scene: "sg_mt_office", hs: [
      ["loi_trang", 400, 570, "Hỏi chị Trang"], ["loi_phuong", 580, 570, "Hỏi chị Phương"], ["nk_cua_vp", 1250, 490, "Đầu đọc thẻ ở cửa hành lang"],
      ["ho_so_phanh", 825, 580, "Xấp hồ sơ trên bàn Thịnh"], ["hd_thau", 1040, 440, "Hợp đồng bảo trì trên giá"] ] },
    { id: "lab", name: "Phòng giám định & dữ liệu", time: "Bất kỳ lúc nào", scene: "sg_lab", hs: [
      ["phap_y", 320, 470, "Biên bản pháp y"], ["cam_toa3", 520, 590, "Ổ ghi hình trên tàu"], ["doc_chat", 700, 290, "Kết quả độc chất"],
      ["sao_ke_nh", 1010, 600, "Sao kê tài khoản công ty"], ["nk_the_bt", 1180, 320, "Sao kê thẻ toàn tuyến"] ] }
  ],
  actions: [
    /* ---------- Lời khai ---------- */
    { id: "loi_vu", cost: 1, type: "Lời khai", title: "Vũ: ngồi cabin suốt chuyến, không rời nửa bước",
      text: "Vũ khai: anh lái chuyến U-07 (đoàn tàu ĐT-12) rời Bến Thành 22h00, tới Suối Tiên 22h26, “đúng giờ tới từng giây, bảng giờ là kinh thánh”. Cabin có camera; anh ngồi cabin suốt chuyến, “không rời ghế nửa bước”, ở ga Ba Son chỉ mở cửa, đóng cửa rồi cho tàu chạy. Đêm mưa tàu cuối vắng, anh không để ý hành khách. Ông Thịnh anh biết mặt: tối thứ Sáu nào ông cũng lên chuyến cuối, ngồi ghế cuối toa 3, “ngồi như tượng, đọc sách”. Anh không thấy ai lạ.",
      visual: { k: "who", id: "vu" },
      alibi: { who: "vu", from: "22:02", to: "22:08", at: CAB } },
    { id: "loi_ngan", cost: 1, type: "Lời khai", title: "Ngân: trực ca ở ga Bến Thành, chưa rời ga nửa bước",
      text: "Ngân khai: chị trực ca từ 14h tới 23h, tối nay ở quầy hoặc khu vực trực của nhân viên, “không rời ga nửa bước”. 21h55 chị còn đứng ở cổng số 4 nhìn dòng khách cuối cùng vào; mưa to nên ai cũng áo mưa trùm đầu, “không nhìn nổi mặt ai”. Chị biết ông Thịnh vì ông hay đi chuyến cuối, “lúc nào cũng cười gật đầu”. Nếu có chuyện gì ở ga, chị đã báo OCC. Chị không biết gì về cái chết của ông.",
      visual: { k: "who", id: "ngan" },
      alibi: { who: "ngan", from: "22:00", to: "22:20", at: REST } },
    { id: "loi_tham", cost: 1, type: "Lời khai", title: "Thắm: ngồi trước bảng điều khiển cả ca, hai đoàn cuối chạy đúng biểu đồ",
      text: "Thắm khai: cô là điều độ viên ca đêm, “ngồi trước bảng điều khiển cả ca, không rời ghế”. Chuyến cuối U-07 và chuyến cuối ngược chiều D-05 chạy đúng biểu đồ, hệ thống không cảnh báo gì. Hai đoàn gặp nhau ở ga Ba Son lúc 22h04, “bình thường, ba tuần nay vẫn vậy”. Cô giải thích: trước đó D-05 vào Ba Son sớm hơn U-07 hai phút, từ ba tuần trước Kế hoạch dời giờ D-05 nên hai đoàn đứng cạnh nhau. Cô chỉ nhập số liệu, không biết vì sao phải dời.",
      visual: { k: "who", id: "tham" },
      alibi: { who: "tham", from: "22:10", to: "22:20", at: OCCR } },
    { id: "loi_kien", cost: 1, type: "Lời khai", title: "Kiên: ăn tối với khách ở Bình Thạnh, không đi metro",
      text: "Kiên khai: anh là giám đốc dự án của Thái Bình Rail, bảo trì phanh và cửa cho mười bốn đoàn tàu. Tối nay anh ăn tối với khách ở một nhà hàng ven sông Bình Thạnh từ 21h tới 23h, “có hóa đơn”, và không đi metro. Ông Thịnh “khó tính nhưng công bằng”; mấy tuần nay ông đòi xem lại hồ sơ kiểm tra phanh, “chuyện kỹ thuật thôi”. Tối nay anh không nói chuyện với ông. Nghe tin ông mất anh “sốc thật sự”.",
      visual: { k: "who", id: "kien" },
      alibi: { who: "kien", from: "21:40", to: "22:30", at: RESTO } },
    { id: "loi_trang", cost: 1, type: "Lời khai", title: "Trang: ốm ở nhà, nói về thói quen và mật khẩu của Thịnh",
      text: "Trang khai: cô là trợ lý của ông Thịnh bảy năm. Tối nay cô ốm nên ở nhà, ngủ sớm. Ông có thói quen cố định: tối thứ Sáu đi chuyến cuối 22h00 từ Bến Thành, ngồi toa 3 ghế cuối, “ông bảo ghế đó yên tĩnh để đọc”. Ông đặt mật khẩu mọi thứ bằng “chuyến tàu ông tin nhất”: số hiệu đoàn tàu rồi số hiệu chuyến, bốn số. Cô không biết đó là đoàn nào, chuyến nào. Mấy tuần nay ông căng thẳng, nói sẽ “nộp xong thì mới ngủ được”.",
      visual: { k: "who", id: "trang" },
      alibi: { who: "trang", from: "21:50", to: "22:15", at: HOME } },
    { id: "loi_phuong", cost: 1, type: "Lời khai", title: "Phương: ở phòng Kế hoạch làm biểu đồ mùa Tết tới 22h30, một mình",
      text: "Phương khai: cô là Trưởng phòng Kế hoạch và Biểu đồ chạy tàu, “cả đời sống trong những con số”. Tối nay cô ở phòng Kế hoạch tầng 3 làm biểu đồ mùa Tết tới 22h30 mới tắt đèn về, một mình. Ông Thịnh là đồng nghiệp từ ngày khai trương, “người hiếm hoi nói thẳng”. Hỏi về biểu đồ, cô đáp chắc nịch: “Mỗi chặng hai phút, từ ngày khai trương tới giờ không đổi, đoàn nào cũng thế.” Cô đã khóc khi nghe tin ông mất.",
      visual: { k: "who", id: "phuong" },
      alibi: { who: "phuong", from: "21:55", to: "22:15", at: OFFKH } },

    /* ---------- Camera ---------- */
    { id: "cam_cab", cost: 1, type: "Camera", title: "Camera cabin U-07: Vũ ngồi cabin, trừ nửa phút ở ga Ba Son",
      text: "Camera cabin đoàn tàu U-07 (ĐT-12), giờ mạng chính xác, nhìn từ trần xuống ghế lái và cửa cabin. 22:00:02 Vũ cho tàu rời Bến Thành, hai tay trên cần điều khiển. 22:04:00 tàu vào ga Ba Son, đèn báo “khe hở cửa toa 3” nháy vàng. 22:04:05 Vũ mở cửa cabin, bước ra sân ga; 22:04:38 anh quay vào, đóng cửa, cho tàu chạy lúc 22:04:48. Từ đó tới 22:26 anh không rời ghế. Bốn phút đầu của chuyến (22:00–22:04) anh ngồi nguyên chỗ.",
      visual: { k: "cam", scene: "cam_mt_cab", time: "22:04:05", cam: "CAB-U07 CABIN LÁI · giờ mạng", alt: "Vũ mở cửa cabin bước ra sân ga lúc 22:04:05" },
      spans: [
        { who: "vu", from: "22:00", to: "22:04", at: CAB },
        { who: "vu", from: "22:04", to: "22:05", at: PLATBS },
        { who: "vu", from: "22:05", to: "22:26", at: CAB }
      ] },
    { id: "cam_cong_bt", cost: 1, type: "Camera", title: "Camera sảnh soát vé Bến Thành: một người áo mưa xanh vào 21:56, ra 22:11",
      text: "Camera sảnh soát vé Bến Thành, giờ mạng chính xác, phủ bốn cổng khách và cổng nhân viên; không phủ sân ga, thang cuốn và nhà vệ sinh. 21:55:20 Thịnh vào cổng nhân viên, áo gió xám, túi xách. 21:56:58 một người mặc áo mưa dùng một lần màu xanh nhạt, trùm mũ, khẩu trang, ô gập, quẹt thẻ vào cùng cổng. 21:58:20 Ngân (đồng phục) vào cổng nhân viên. 22:10:05 một người đàn ông vest xám, không áo mưa, quẹt thẻ ra. 22:11:40 người áo mưa xanh nhạt quẹt thẻ ra rồi đi vào nhà vệ sinh; 22:13:10 một phụ nữ đồ tối, khẩu trang, rẽ lên thang bộ dẫn tới nhà điều hành.",
      visual: { k: "cam", scene: "cam_mt_gate", time: "21:56:58", cam: "CAM-BT SẢNH SOÁT VÉ · giờ mạng", alt: "Người áo mưa xanh nhạt trùm mũ quẹt thẻ vào cổng nhân viên lúc 21:56:58" },
      spans: [
        { who: "ngan", from: "21:45", to: "21:58", at: REST }
      ] },
    { id: "cam_occ", cost: 1, type: "Camera", title: "Camera phòng điều hành: Thắm ngồi trực tới 22:10, rồi ra hành lang 12 phút",
      text: "Camera phòng điều hành OCC, giờ mạng chính xác. Thắm ngồi trước bảng điều khiển từ 21:50, tai nghe một bên, tay nhập lệnh liên tục. 22:04 trên bảng sơ đồ tuyến hai chấm tàu U-07 và D-05 cùng nằm ở Ba Son, cô nhìn lên rồi cúi xuống bàn phím. 22:10 điện thoại cô rung, cô cầm máy, rời ghế, ra hành lang; 22:22 cô quay vào, mắt đỏ. Trong khoảng ấy một đồng nghiệp cùng ca đỡ bàn, màn hình hệ thống vẫn chạy.",
      visual: { k: "cam", scene: "cam_mt_occ", time: "22:04", cam: "CAM-OCC PHÒNG ĐIỀU HÀNH · giờ mạng", alt: "Thắm ngồi trước bảng điều khiển lúc 22:04, hai chấm tàu cùng ở Ba Son" },
      spans: [
        { who: "tham", from: "21:50", to: "22:10", at: OCCR },
        { who: "tham", from: "22:10", to: "22:22", at: CORR },
        { who: "tham", from: "22:22", to: "23:30", at: OCCR }
      ] },
    { id: "cam_bs", cost: 1, type: "Camera", title: "Camera sân ga Ba Son: người áo mưa bước ngang sân ga sang đoàn ngược chiều",
      text: "Camera sân ga đảo Ba Son, giờ mạng chính xác, nhìn dọc sân ga với hai đường ray hai bên. 21:58 một người đàn ông vest xám, không áo mưa, đứng chờ ở đầu sân ga phía Bến Thành, nhìn đồng hồ. 22:04:01 U-07 vào đường 2 và D-05 vào đường 1 cùng một lúc. 22:04:10 từ cửa toa 3 của U-07 một người áo mưa xanh nhạt trùm mũ, khẩu trang, bước xuống; 22:04:25 người ấy bước ngang sân ga, lên toa 4 của D-05, không đi về phía lối ra. 22:04:20 người đàn ông vest xám lên D-05 ở cửa đầu tàu. 22:04:45 D-05 đóng cửa; 22:04:48 U-07 chạy. Một người đàn ông cầm mũ lái tàu bước ra từ cabin U-07 lúc 22:04:05 rồi quay vào.",
      visual: { k: "cam", scene: "cam_mt_plat", time: "22:04:25", cam: "CAM-BS SÂN GA ĐẢO · giờ mạng", alt: "Người áo mưa xanh nhạt bước ngang sân ga sang D-05 lúc 22:04:25" },
      spans: [
        { who: "kien", from: "21:58", to: "22:04", at: PLATBS }
      ] },
    { id: "cam_toa3", cost: 1, type: "Camera", title: "Ổ ghi hình trên tàu: người áo mưa ngồi sát Thịnh, ông gục lúc 22:03:48",
      text: "Ổ ghi hình trên đoàn tàu ĐT-12 (camera toa 3 và toa 5), giờ mạng chính xác. Toa 3: 22:00:05 Thịnh ngồi ghế cuối, đọc sách; hai hành khách ngủ gà ở đầu toa. 22:00:20 một người áo mưa xanh nhạt trùm mũ, khẩu trang, ô gập, lên ở cửa cuối, ngồi cách ông ba ghế. 22:02:10 (sau khi rời Nhà hát) người ấy dời sang ngồi sát bên ông, quay lưng ra camera. 22:03:20 hai người cúi sát nhau như đỡ ông, ống tay áo trái của ông bị kéo lên. 22:03:48 đầu Thịnh gục xuống, bất động; người áo mưa lấy quyển sách đặt lên đùi ông cho ngay ngắn. 22:04:10 người áo mưa đứng dậy, xuống ở Ba Son. Toa 5: Ngân mặc đồng phục ngồi từ 22:00:30, xuống ở Ba Son 22:04:10, không áo mưa.",
      visual: { k: "cam", scene: "cam_mt_car", time: "22:03:48", cam: "CAM-ĐT12 TOA 3 · giờ mạng", alt: "Người áo mưa xanh nhạt ngồi sát Thịnh lúc 22:03:48, ông gục đầu" },
      spans: [
        { who: "ngan", from: "22:00", to: "22:04", at: T5 }
      ] },

    /* ---------- Hồ sơ, nhật ký, vật chứng ---------- */
    { id: "hien_truong_toa", cost: 1, type: "Vật chứng", title: "Toa 3: Thịnh ngồi như đang ngủ, tay áo trái bị kéo lên ba phân",
      text: "Toa 3 đoàn tàu ĐT-12 đang đỗ ở ga Suối Tiên, cảnh sát đã giăng dây. Ông Thịnh ngồi ở ghế cuối toa, đầu gục sang trái, quyển sách mở trang 118 đặt ngay ngắn trên đùi. Không máu, không vết giằng co, không đồ bị lấy; túi xách còn nguyên bên cạnh. Ống tay áo trái bị kéo lên khỏi cổ tay ba phân. Ghế bên phải có một vũng nước mưa nhỏ và hai dấu đế dép ướt. Nhân viên vệ sinh gọi 115 lúc 22:33, khi tàu đã vào ga cuối bảy phút.",
      visual: { k: "paper", alt: "Hiện trường toa 3", title: "HIỆN TRƯỜNG · TOA 3 ĐT-12",
        rows: ["Ghế cuối toa 3 · ngồi như đang ngủ", "Sách mở trang 118, đặt ngay ngắn", "Tay áo trái bị kéo lên khỏi cổ tay", "Ghế bên phải: nước mưa, dấu dép ướt", "Không máu, không giằng co, không mất đồ"] } },
    { id: "ban_ghe", cost: 1, type: "Vật chứng", title: "Dưới tay vịn ghế cuối toa 3: nhãn thép “ĐT-12”",
      text: "Dưới tay vịn của ghế cuối toa 3 là một nhãn thép dập nổi: “ĐT-12 · TOA 3 · GHẾ 3-17”, kiểu nhãn nhà sản xuất gắn lúc lắp đoàn tàu. Bên cạnh, bằng đầu chìa khóa, có ai khắc thêm hai chữ nhỏ: “chuyến cuối”. Nhãn này in số hiệu của cả đoàn tàu: đoàn tàu số 12.",
      visual: { k: "paper", alt: "Nhãn thép dưới tay vịn", title: "NHÃN DƯỚI TAY VỊN · GHẾ 3-17",
        rows: ["Nhãn thép dập nổi của nhà sản xuất", "ĐT-12 · TOA 3 · GHẾ 3-17", "Khắc thêm bằng đầu chìa khóa:", "“chuyến cuối”", "Số hiệu đoàn tàu: 12"] } },
    { id: "dt_thinh", cost: 1, type: "Vật chứng", title: "Điện thoại của Thịnh: tin nhắn cuối 22:02:41, cuộc gọi nhỡ 22:05:20",
      text: "Điện thoại trong túi xách của Thịnh, màn hình sáng nguyên vẹn. Cuộc gọi: 21:35 gọi đi Kiên, 2 phút 10 giây; 22:05:20 Trang gọi đến 28 giây không ai bắt máy; 22:27 Kiên gọi đến, nhỡ. Tin nhắn: 22:02:41 gửi Trang “Mai 7h tôi nộp. Em giữ kín.”, đây là thao tác cuối cùng trên máy. Lịch: 07:00 thứ Sáu “Nộp báo cáo phanh bogie 14 đoàn tàu cho Ban Quản lý”. Ghi chú: “Gặp người ký trước khi nộp. Cho một cơ hội.”",
      visual: { k: "paper", alt: "Điện thoại của Thịnh", title: "ĐIỆN THOẠI LƯƠNG QUỐC THỊNH",
        rows: ["21:35 · gọi đi Kiên · 2 phút 10 giây", "22:02:41 · nhắn Trang: “Mai 7h tôi nộp”", "22:05:20 · Trang gọi · nhỡ · 28 giây", "22:27 · Kiên gọi · nhỡ", "Lịch 07:00: nộp báo cáo phanh 14 đoàn"] },
      lock: { code: "1207", digits: 4, prompt: "Điện thoại của Thịnh cần mã bốn số." } },
    { id: "nk_cong_bt", cost: 1, type: "Hồ sơ", title: "Bộ điều khiển cổng Bến Thành: ba lượt ra trong 21:50–22:20, số thẻ không ghi tên",
      text: "Nhật ký bộ điều khiển cổng soát vé ga Bến Thành, giờ mạng chính xác, chỉ ghi số thẻ (không ghi tên chủ thẻ). Cổng nhân viên, lượt vào: 21:55:20 NV-0192; 21:56:58 NV-0417; 21:58:20 NV-0233. Lượt ra: 22:10:05 thẻ đối tác P-2209; 22:11:40 NV-0417; 22:19:12 một vé QR. Từ 21:50 tới 22:20 có 38 lượt vào và 3 lượt ra. Không thẻ nào ra rồi vào lại.",
      visual: { k: "paper", alt: "Nhật ký cổng Bến Thành", title: "CỔNG BẾN THÀNH · 21:50–22:20",
        rows: ["Vào 21:55:20 NV-0192 · 21:56:58 NV-0417", "Vào 21:58:20 NV-0233 · +35 vé QR", "Ra 22:10:05 · thẻ đối tác P-2209", "Ra 22:11:40 · NV-0417", "Ra 22:19:12 · vé QR"] } },
    { id: "ao_mua", cost: 1, type: "Vật chứng", title: "Thùng rác nhà vệ sinh sảnh Bến Thành: áo mưa xanh nhạt còn ướt",
      text: "Thùng rác trong nhà vệ sinh ở sảnh Bến Thành, ngoài cổng soát vé: một áo mưa dùng một lần màu xanh nhạt vo tròn, còn ướt, cùng khẩu trang vải và ô gập nhỏ. Nhân viên vệ sinh nhặt lúc 22:48. Mẫu áo trùng loại bán ở máy tự động ngay sảnh (nhãn “Rainy-Go”, 15.000 đồng); máy ghi 21:54:30 bán một chiếc, trả bằng tiền xu. Ống tay trái áo ố nhạt, có mùi cồn y tế. Không có dấu vân tay nguyên vẹn (người mặc đeo găng cao su).",
      visual: { k: "paper", alt: "Áo mưa trong thùng rác", title: "THÙNG RÁC · NHÀ VỆ SINH SẢNH",
        rows: ["Áo mưa dùng một lần xanh nhạt, còn ướt", "Khẩu trang vải, ô gập nhỏ", "Máy bán áo: 21:54:30 một chiếc, tiền xu", "Tay trái ố nhạt, mùi cồn y tế", "Nhặt lúc 22:48 · không vân tay"] } },
    { id: "bang_gio", cost: 1, type: "Hồ sơ", title: "Bảng giờ tàu đêm dán ở sảnh: chuyến cuối lên 22:00, chuyến cuối xuống 21:42",
      text: "Bảng giờ dán ở sảnh Bến Thành cho khách: chuyến cuối đi Suối Tiên là chuyến số 07 (U-07), Bến Thành 22:00, Suối Tiên 22:26; chuyến cuối đi Bến Thành là chuyến số 05 (D-05), Suối Tiên 21:42, Bến Thành 22:08. Dòng chú thích: “Thời gian chạy giữa hai ga liền kề cố định 2 phút (kể cả dừng đỗ). Sau chuyến cuối, ga đóng cửa.”",
      visual: { k: "paper", alt: "Bảng giờ tàu đêm", title: "BẢNG GIỜ TÀU ĐÊM · TUYẾN 1",
        rows: ["Chuyến cuối lên: U-07 · 22:00 → 22:26", "Chuyến cuối xuống: D-05 · 21:42 → 22:08", "Giữa hai ga liền kề: 2 phút cố định", "Đã tính cả dừng đỗ", "Sau chuyến cuối: ga đóng cửa"] } },
    { id: "bieu_do", cost: 1, type: "Hồ sơ", title: "Biểu đồ chạy tàu trên tường OCC: U-07 và D-05 cùng đứng ở Ba Son lúc 22:04",
      text: "Biểu đồ chạy tàu đêm thứ Sáu, bản hiện hành, in khổ lớn trên tường OCC. U-07 (ĐT-12): Bến Thành 22:00, Nhà hát 22:02, Ba Son 22:04, Văn Thánh 22:06 … Suối Tiên 22:26. D-05: Suối Tiên 21:42 … Ba Son 22:04, Nhà hát 22:06, Bến Thành 22:08. Ghi chú ở ga Ba Son: “Đồng bộ chuyển tải: hai đoàn đứng cùng lúc 22:04:01–22:04:47.” Mọi chặng đều 2 phút.",
      visual: { k: "paper", alt: "Biểu đồ chạy tàu đêm", title: "BIỂU ĐỒ CHẠY TÀU · BẢN HIỆN HÀNH",
        rows: ["U-07 (ĐT-12): BT 22:00 NH 22:02 BS 22:04", "…  VT 22:06 · …  ST 22:26", "D-05: ST 21:42 · … · BS 22:04", "NH 22:06 · BT 22:08", "Ba Son: hai đoàn đứng cùng lúc 22:04"] } },
    { id: "nk_vi_tri", cost: 1, type: "Hồ sơ", title: "Nhật ký vị trí đoàn tàu (ATS): U-07 và D-05 cùng ở Ba Son 22:04:01–22:04:47",
      text: "Nhật ký hệ thống giám sát đoàn tàu (ATS), giờ mạng chính xác, sai số ±1 giây. U-07: Bến Thành rời 22:00:02; Nhà hát tới 22:02:01; Ba Son tới 22:04:00, rời 22:04:48; Văn Thánh tới 22:06:01. D-05: Nhà hát rời 22:06:03; Ba Son tới 22:04:01, rời 22:04:47; Bến Thành tới 22:08:00. Cửa toa của cả hai đoàn mở 22:04:10, đóng 22:04:45 (D-05) và 22:04:40 (U-07).",
      visual: { k: "paper", alt: "Nhật ký vị trí đoàn tàu", title: "ATS · VỊ TRÍ ĐOÀN TÀU",
        rows: ["U-07 · Ba Son tới 22:04:00 · rời 22:04:48", "D-05 · Ba Son tới 22:04:01 · rời 22:04:47", "D-05 · Bến Thành tới 22:08:00", "Cửa mở 22:04:10 · đóng 22:04:40 / :45", "Sai số ±1 giây"] } },
    { id: "nk_bieu_do", cost: 1, type: "Hồ sơ", title: "Nhật ký sửa biểu đồ: 21 ngày trước, tài khoản phuong.kh dời giờ D-05 hai phút",
      text: "Nhật ký chỉnh sửa biểu đồ chạy tàu của phòng công nghệ thông tin, ba tháng gần nhất. 21 ngày trước, 16:42: tài khoản phuong.kh (Trưởng phòng Kế hoạch & Biểu đồ) sửa chuyến D-05, giờ rời Suối Tiên từ 21:40 thành 21:42; lý do: “đồng bộ chuyển tải ga Ba Son”; không cần cấp trên duyệt (quyền của phòng Kế hoạch); phòng điều hành nhập ca đêm cùng ngày. Trước lần sửa, D-05 tới Ba Son lúc 22:02, sớm hơn U-07 hai phút. Không còn lần sửa nào khác của chuyến cuối.",
      visual: { k: "paper", alt: "Nhật ký sửa biểu đồ", title: "NHẬT KÝ SỬA BIỂU ĐỒ · D-05",
        rows: ["21 ngày trước · 16:42 · phuong.kh", "D-05 rời Suối Tiên: 21:40 → 21:42", "Lý do: “đồng bộ chuyển tải ga Ba Son”", "Cấp trên duyệt: không cần", "Trước đó D-05 tới Ba Son lúc 22:02"] } },
    { id: "so_do_ba_son", cost: 1, type: "Hồ sơ", title: "Sơ đồ ga Ba Son: sân ga đảo, hai đường ray hai bên, cách nhau sáu mét",
      text: "Sơ đồ ga Ba Son (ga ngầm): một sân ga đảo ở giữa, đường 1 (đoàn xuống, về Bến Thành) bên trái, đường 2 (đoàn lên, về Suối Tiên) bên phải; bề ngang sân ga sáu mét, cửa chắn sân ga hai phía mở cùng lúc nên hành khách đổi chiều chỉ cần bước ngang sân ga. Lối ra duy nhất ở đầu sân ga phía Suối Tiên, qua cổng soát vé lên mặt đất. Không có camera ở khoảng giữa hai toa nối.",
      visual: { k: "paper", alt: "Sơ đồ ga Ba Son", title: "SƠ ĐỒ GA BA SON · SÂN GA ĐẢO",
        rows: ["Một sân ga ở giữa, ngang 6 mét", "Đường 1: xuống (về Bến Thành) · bên trái", "Đường 2: lên (về Suối Tiên) · bên phải", "Cửa chắn hai phía mở cùng lúc", "Lối ra duy nhất ở đầu phía Suối Tiên"] } },
    { id: "nk_cua_chan", cost: 1, type: "Hồ sơ", title: "Nhật ký cửa chắn sân ga Ba Son: cửa toa 3 U-07 mở 22:04:10, một lượt ra, không lượt vào",
      text: "Nhật ký bảng điều khiển cửa chắn sân ga Ba Son, giờ mạng chính xác. 22:04:10 cửa chắn đường 1 (D-05) và đường 2 (U-07) cùng mở. Cảm biến cửa toa 3 của U-07: một lượt ra, không lượt vào, từ 22:04:10 tới 22:04:40. Cửa toa 1 của U-07: hai lượt ra. Cửa toa 5: một lượt ra. 22:04:40 cửa đường 2 đóng; 22:04:45 cửa đường 1 đóng. Không có sự cố cửa nào.",
      visual: { k: "paper", alt: "Nhật ký cửa chắn sân ga Ba Son", title: "CỬA CHẮN · BA SON · 22:04",
        rows: ["22:04:10 · đường 1 và đường 2 cùng mở", "U-07 toa 1: 2 ra · toa 3: 1 ra, 0 vào", "U-07 toa 5: 1 ra", "22:04:40 · đóng đường 2", "22:04:45 · đóng đường 1"] } },
    { id: "nk_cong_bs", cost: 1, type: "Hồ sơ", title: "Cổng soát vé Ba Son: chỉ ba lượt ra, không ai từ toa 3",
      text: "Nhật ký bộ điều khiển cổng soát vé ga Ba Son, giờ mạng chính xác. Lượt vào: 21:57:10 thẻ đối tác P-2209; vé QR 22:38 (hai lượt). Lượt ra: 22:05:10 thẻ nhân viên NV-0233; 22:05:22 một vé QR; 22:05:31 một vé QR. Từ 22:05:31 tới 22:40 không còn lượt ra nào. Hai vé QR là hai hành khách đi toa 1 (đã xác định bằng cửa toa); thẻ NV-0233 là của người đi toa 5. Không ai trong ba lượt ra đi từ toa 3.",
      visual: { k: "paper", alt: "Nhật ký cổng Ba Son", title: "CỔNG BA SON · 21:50–22:40",
        rows: ["Vào 21:57:10 · thẻ đối tác P-2209", "Ra 22:05:10 · thẻ nhân viên NV-0233", "Ra 22:05:22 · vé QR · toa 1", "Ra 22:05:31 · vé QR · toa 1", "Không ai từ toa 3 · hết lượt ra tới 22:40"] },
      spans: [
        { who: "ngan", from: "22:05", to: "22:30", at: OUTBS }
      ] },
    { id: "nk_cua_vp", cost: 1, type: "Hồ sơ", title: "Cửa hành lang tầng 3: Phương ra 21:53:40 và vào lại 22:14:50",
      text: "Nhật ký đầu đọc thẻ ở cửa hành lang tầng 3 nhà điều hành (lối duy nhất vào phòng Kế hoạch và Ban An toàn), giờ mạng chính xác. 18:10 Phương vào. 19:40 Trang vào. 21:49:05 Thịnh ra. 21:53:40 Phương ra. 22:14:50 Phương vào lại. 22:20:30 Trang ra. 22:21:30 thẻ khách Kiên vào, 22:44:50 ra. Không lượt nào khác sau 21:00 ngoài những lượt trên. Trang từ 19:40 tới 22:20 ở trong văn phòng, không ra ngoài.",
      visual: { k: "paper", alt: "Nhật ký cửa hành lang tầng 3", title: "HÀNH LANG TẦNG 3 · 19:40–22:45",
        rows: ["19:40 Trang vào · 22:20:30 Trang ra", "21:49:05 Thịnh ra", "21:53:40 Phương ra · 22:14:50 vào lại", "22:21:30 thẻ khách Kiên vào · 22:44:50 ra", "18:10 Phương vào · sau 21:00 hết lượt"] },
      spans: [
        { who: "phuong", from: "18:10", to: "21:53", at: OFFKH },
        { who: "trang", from: "19:40", to: "22:20", at: OFFAT },
        { who: "phuong", from: "21:54", to: "22:14", at: OUTF3 }
      ] },
    { id: "ho_so_phanh", cost: 1, type: "Hồ sơ", title: "Xấp hồ sơ phanh bogie trên bàn Thịnh: mười bốn biên bản, chỉ ba đoàn có dữ liệu thật",
      text: "Xấp hồ sơ nằm trên bàn Thịnh, kẹp giấy ghi tay “7h”. Mười bốn biên bản kiểm tra phanh bogie của mười bốn đoàn tàu, mỗi biên bản ghi “đã thử 120 lần phanh khẩn”, ký bên nhà thầu Thái Bình Rail (Kiên) và ký nghiệm thu của Phòng Kế hoạch & Biểu đồ (Phương). Dưới cùng là bản sao nhật ký cảm biến phanh: trong năm chỉ ba đoàn có đủ lần thử; mười một đoàn không có dữ liệu nào. Thịnh ghi bên lề: “Khống. 11/14. 7h nộp.”",
      visual: { k: "paper", alt: "Hồ sơ phanh bogie", title: "HỒ SƠ PHANH BOGIE · 14 ĐOÀN TÀU",
        rows: ["14 biên bản: “đã thử 120 lần phanh”", "Nhà thầu ký · Phòng Kế hoạch nghiệm thu", "Nhật ký cảm biến: 3 đoàn đủ dữ liệu", "11 đoàn không có dữ liệu thử nào", "Thịnh ghi tay: “Khống. 11/14. 7h nộp.”"] } },
    { id: "hd_thau", cost: 1, type: "Hồ sơ", title: "Hợp đồng bảo trì 412 tỷ: điều 9.3 buộc thử phanh 120 lần, Phòng Kế hoạch nghiệm thu",
      text: "Hợp đồng bảo trì thiết bị chạy tàu giữa đơn vị vận hành và Thái Bình Rail, giá trị 412 tỷ đồng trong năm năm. Điều 9.3: mỗi đoàn tàu phải thử phanh khẩn 120 lần mỗi năm, nghiệm thu bằng biên bản có chữ ký Trưởng phòng Kế hoạch & Biểu đồ; nếu sai phạm, nhà thầu bị phạt 30% giá trị và chấm dứt hợp đồng. Trang ký: đầu mối nghiệm thu của đơn vị vận hành, “Phương, ĐT 0907 441 028”.",
      visual: { k: "paper", alt: "Hợp đồng bảo trì", title: "HỢP ĐỒNG BẢO TRÌ · 412 TỶ",
        rows: ["Đơn vị vận hành – Thái Bình Rail · 5 năm", "Điều 9.3: thử phanh khẩn 120 lần/đoàn/năm", "Nghiệm thu: Trưởng phòng Kế hoạch ký", "Sai phạm: phạt 30%, chấm dứt hợp đồng", "Đầu mối nghiệm thu: Phương 0907 441 028"] } },
    { id: "phap_y", cost: 1, type: "Biên bản", title: "Biên bản pháp y: dấu kim ở cổ tay trái, kali máu cao gấp ba, tim ngừng trong một đến hai phút",
      text: "Biên bản pháp y sơ bộ: Lương Quốc Thịnh, 53 tuổi, tử vong do ngừng tim cấp. Dấu kim tiêm mới ở mặt trong cổ tay trái, dưới ống tay áo; xét nghiệm nhanh kali máu 14 mmol/L, gấp gần ba mức bình thường, kiểu ngộ độc do tiêm kali đậm đặc, tác dụng làm tim ngừng trong khoảng một đến hai phút. Không vết giằng co, không vết siết. Thân nhiệt vô giá trị vì toa chạy điều hòa 18°C suốt chuyến. Giờ chết suy từ các nguồn khác.",
      visual: { k: "paper", alt: "Biên bản pháp y", title: "PHÁP Y SƠ BỘ · LƯƠNG QUỐC THỊNH",
        rows: ["Tử vong do ngừng tim cấp", "Dấu kim mới · cổ tay trái · dưới tay áo", "Kali máu 14 mmol/L · tiêm kali đậm đặc", "Tim ngừng trong 1–2 phút sau tiêm", "Thân nhiệt vô giá trị (điều hòa 18°C)"] } },
    { id: "doc_chat", cost: 1, type: "Biên bản", title: "Kết quả độc chất: kali clorua kèm thuốc an thần, liều làm tim ngừng trong 90 giây",
      text: "Phòng giám định hoàn thành kết quả độc chất từ mẫu máu: kali clorua nồng độ rất cao và midazolam, một thuốc an thần tác dụng nhanh. Thuốc an thần làm ông lơ mơ, không kêu, không vùng vẫy; kali làm tim ngừng trong khoảng 90 giây sau tiêm. Kim tiêm cỡ nhỏ, loại thú y hay dùng. Người tiêm cần biết tiêm tĩnh mạch.",
      visual: { k: "paper", alt: "Kết quả độc chất", title: "ĐỘC CHẤT · MẪU MÁU",
        rows: ["Kali clorua nồng độ rất cao", "Midazolam (thuốc an thần tác dụng nhanh)", "Không kêu, không vùng vẫy", "Tim ngừng trong chừng 90 giây", "Kim nhỏ · người tiêm biết tiêm tĩnh mạch"] } },
    { id: "sao_ke_nh", cost: 1, type: "Hồ sơ", title: "Sao kê Công ty Thiện Nhân: Thái Bình Rail chuyển 2,4 tỷ trong chín tháng",
      gate: "k_nghiem_thu_khong",
      text: "Ngân hàng phản hồi theo yêu cầu: Công ty TNHH Thiện Nhân, mở 13 tháng trước, người đại diện Từ Văn Tài; ngành nghề “tư vấn kỹ thuật”. Chín tháng liền nhận 267 triệu đồng mỗi tháng từ Thái Bình Rail, tổng 2,4 tỷ, nội dung “phí tư vấn”. Số điện thoại đăng ký giao dịch của công ty: 0907 441 028. Hồ sơ nhân sự đơn vị vận hành khai Từ Văn Tài là anh rể của Trưởng phòng Kế hoạch & Biểu đồ.",
      visual: { k: "paper", alt: "Sao kê công ty Thiện Nhân", title: "SAO KÊ · CÔNG TY THIỆN NHÂN",
        rows: ["Mở 13 tháng trước · đại diện Từ Văn Tài", "Nhận từ Thái Bình Rail: 267 triệu/tháng", "9 tháng liền · tổng 2,4 tỷ đồng", "ĐT đăng ký giao dịch: 0907 441 028", "Từ Văn Tài: anh rể Trưởng phòng Kế hoạch"] } },
    { id: "nk_the_bt", cost: 1, type: "Hồ sơ", title: "Sao kê thẻ toàn tuyến: ai vào, ai ra, ở ga nào",
      text: "Sao kê thẻ ra vào từ máy chủ kiểm soát trung tâm, giờ mạng chính xác. Danh bạ thẻ: NV-0192 Lương Quốc Thịnh; NV-0233 Ngân; NV-0417 Phan Thị Phương (Trưởng phòng Kế hoạch & Biểu đồ); P-2209 Kiên (thẻ đối tác, Thái Bình Rail). Hành trình: Thịnh vào Bến Thành 21:55:20, chưa ra. Ngân vào Bến Thành 21:58:20, ra Ba Son 22:05:10. Kiên vào Ba Son 21:57:10, ra Bến Thành 22:10:05. Phương vào Bến Thành 21:56:58, ra Bến Thành 22:11:40, không lượt nào ở ga khác.",
      visual: { k: "paper", alt: "Sao kê thẻ toàn tuyến", title: "SAO KÊ THẺ · 21:50–22:20",
        rows: ["Thịnh: vào Bến Thành 21:55:20", "Ngân: vào BT 21:58:20, ra BS 22:05:10", "Kiên: vào BS 21:57:10, ra BT 22:10:05", "Phương: vào BT 21:56:58, ra BT 22:11:40", "Phương: không lượt nào ở ga khác"] },
      spans: [
        { who: "phuong", from: "21:57", to: "22:11", at: PAID },
        { who: "ngan", from: "22:05", to: "22:30", at: OUTBS }
      ] },

    /* ---------- Lời khai mở bằng cách đưa chứng cứ ---------- */
    { id: "ngan_thu", cost: 0, via: "confront", type: "Lời khai", title: "Ngân thừa nhận: bỏ ca đi Ba Son đưa tiền cho em trai, thấy một người áo mưa chạy",
      text: "Ngân thừa nhận: 21:58 chị lên U-07 toa 5, xuống Ba Son 22:05 để đưa ba triệu cho em trai đang nợ cờ bạc, nhờ phó ca đứng thay bốn mươi phút rồi về bằng xe ôm. Chị khai dối vì quy định trực ca nghiêm cấm bỏ vị trí. Chị nói thêm: lúc bước ra khỏi cửa toa 5 chị thoáng thấy một người áo mưa xanh trùm mũ chạy ngang sân ga sang đoàn bên kia, “tôi tưởng khách vội đổi tàu”.",
      visual: { k: "who", id: "ngan" } },
    { id: "vu_thu", cost: 0, via: "confront", type: "Lời khai", title: "Vũ thừa nhận: bước ra sân ga Ba Son nửa phút, thấy người áo mưa sang tàu bên kia",
      text: "Vũ thừa nhận: 22:04 đèn khe hở cửa toa 3 nháy vàng nên anh bước ra sân ga xem cảm biến, nửa phút. Ngay lúc đó anh thấy một người áo mưa xanh trùm mũ bước ra từ cửa toa 3 rồi đi ngang sân ga lên đoàn đối diện. Anh không báo vì rời cabin khi chưa được phép là vi phạm, và vì “khách đổi tàu ở Ba Son thì có gì lạ”. Anh khai dối vì sợ bị kỷ luật.",
      visual: { k: "who", id: "vu" } },
    { id: "tham_thu", cost: 0, via: "confront", type: "Lời khai", title: "Thắm thừa nhận: ra hành lang nghe điện thoại phỏng vấn việc, người đưa biểu đồ mới là Phương",
      text: "Thắm thừa nhận: 22:10 cô ra hành lang nghe điện thoại phỏng vấn của một công ty khác, mười hai phút, nhờ đồng nghiệp đỡ bàn. Cô khai dối vì sợ mất việc. Cô nói thêm về biểu đồ: “Ba tuần trước chị Phương đưa bản mới, bảo dời D-05 hai phút để khách đổi chiều ở Ba Son tiện. Tôi chỉ nhập vào hệ thống. Lạ là chuyến cuối ít khách đến mức chẳng ai cần chuyển tải.”",
      visual: { k: "who", id: "tham" } },
    { id: "kien_thu", cost: 0, via: "confront", type: "Lời khai", title: "Kiên thừa nhận: đi D-05 từ Ba Son về Bến Thành để gặp Thịnh, thấy người đổi tàu",
      text: "Kiên thừa nhận: 21:35 ông Thịnh gọi, hẹn gặp 22h20 tại văn phòng “nói chuyện phanh bogie”. Anh rời nhà hàng bằng taxi, vào ga Ba Son 21:57 để về Bến Thành bằng chuyến cuối cho nhanh, đứng chờ đầu sân ga, lên D-05 22:04, ra Bến Thành 22:10, lên văn phòng 22:21 thì không gặp ai, gọi nhỡ lúc 22:27, bỏ về 22:44. Anh khai dối vì sợ bị nghi. Anh thoáng thấy một người áo mưa chạy từ tàu bên cạnh sang D-05 ở cửa giữa.",
      visual: { k: "who", id: "kien" } },
    { id: "trang_thu", cost: 0, via: "confront", type: "Lời khai", title: "Trang thừa nhận: ở văn phòng từ 19:40, đã đưa Thịnh nhật ký cảm biến phanh",
      text: "Trang thừa nhận: cô ở văn phòng Ban An toàn từ 19:40 tới 22:20, in hồ sơ giúp ông Thịnh. Tuần trước cô lén sao nhật ký cảm biến phanh từ máy chủ nhà thầu đưa ông: chính nhờ đó ông phát hiện mười một đoàn tàu không được thử phanh. Ông dặn giữ kín, nói “gặp người ký trước khi nộp, cho một cơ hội”. Cô khai ở nhà vì sợ bị trả thù. Cô không biết ông định gặp ai.",
      visual: { k: "who", id: "trang" } },

    /* ---------- Kết luận (suy luận từ các hồ sơ ở trên; xem "deduce") ---------- */
    { id: "k_chet_giua_chang", cost: 0, via: "deduce", type: "Kết luận", title: "Thịnh bị hại giữa ga Nhà hát và ga Ba Son, khoảng 22:03:20–22:03:48",
      text: "Thuốc tiêm làm tim ngừng trong một đến hai phút. Tin nhắn cuối của Thịnh gửi 22:02:41, cuộc gọi 22:05:20 không ai bắt máy, và camera trong toa ghi ông gục đầu, bất động từ 22:03:48; mũi tiêm vào khoảng 22:03:20, khi đoàn tàu còn chạy giữa Nhà hát (22:02) và Ba Son (22:04). Ông chết trên tàu, không phải ở ga cuối như người ta tưởng.",
      visual: { k: "paper", alt: "Kết luận: giờ và chặng xảy ra án", title: "KẾT LUẬN",
        rows: ["22:02:41 · tin nhắn cuối của Thịnh", "22:03:20 · mũi tiêm ở cổ tay trái", "22:03:48 · gục đầu, bất động", "Chặng Nhà hát – Ba Son"], stamp: "ĐÃ XÁC LẬP" } },
    { id: "k_xuong_ba_son", cost: 0, via: "deduce", type: "Kết luận", title: "Người ngồi cạnh Thịnh xuống đoàn tàu ở ga Ba Son lúc 22:04:10",
      text: "Cửa toa 3 của U-07 mở ở Ba Son 22:04:10–22:04:40 với một lượt ra và không lượt vào; camera ghi một người áo mưa xanh nhạt trùm mũ, khẩu trang bước ra đúng giây đó. Người cuối cùng ở cạnh Thịnh không chờ tới ga cuối: đoàn tàu chỉ mang theo thi thể.",
      visual: { k: "paper", alt: "Kết luận: người xuống ở Ba Son", title: "KẾT LUẬN",
        rows: ["Cửa toa 3 mở ở Ba Son 22:04:10", "Một lượt ra, không lượt vào", "Người áo mưa xanh nhạt xuống tàu", "Thịnh ở lại, đã chết"], stamp: "ĐÃ XÁC LẬP" } },
    { id: "k_hai_tau_gap_nhau", cost: 0, via: "deduce", type: "Kết luận", title: "U-07 và D-05 cùng đứng ở ga Ba Son 22:04:01–22:04:47, hai bên một sân ga",
      text: "Ba Son là ga có sân ga đảo: hai đường ray hai bên một sân ga rộng sáu mét, cửa chắn hai phía mở cùng lúc. Biểu đồ đặt U-07 và D-05 ở Ba Son cùng 22:04; hệ thống giám sát ghi hai đoàn đứng 22:04:01–22:04:47. Trong gần 46 giây đó, từ cửa toa này bước ngang sang cửa toa kia chỉ mất vài giây.",
      visual: { k: "paper", alt: "Kết luận: hai đoàn gặp nhau ở Ba Son", title: "KẾT LUẬN",
        rows: ["Ba Son: sân ga đảo, hai đường ray", "U-07 vào đường 2 · D-05 vào đường 1", "Cùng đứng 22:04:01–22:04:47", "Sân ga ngang 6 mét, cửa mở cùng lúc"], stamp: "ĐÃ XÁC LẬP" } },
    { id: "k_doi_tau", cost: 0, via: "deduce", type: "Kết luận", title: "Người áo mưa xuống U-07 rồi sang đoàn D-05 ngược chiều và quay về Bến Thành",
      text: "Người áo mưa không đi về phía lối ra duy nhất của Ba Son. Camera sân ga ghi họ bước ngang sân ga, lên toa 4 của D-05 lúc 22:04:25; D-05 đóng cửa 22:04:45 và chạy về Bến Thành. Chiếc áo mưa xanh nhạt ấy sau đó nằm trong thùng rác ở sảnh Bến Thành, không phải ở Ba Son hay Suối Tiên. Kẻ ra tay đã rời hiện trường mà không qua cổng soát vé nào: sổ vé không ghi gì.",
      visual: { k: "paper", alt: "Kết luận: đổi đoàn tàu ở Ba Son", title: "KẾT LUẬN",
        rows: ["22:04:10 · xuống U-07 ở cửa toa 3", "22:04:25 · bước ngang sân ga lên D-05", "22:04:45 · D-05 đóng cửa, về Bến Thành", "Áo mưa nằm ở sảnh Bến Thành"], stamp: "ĐÃ XÁC LẬP" } },
    { id: "k_hai_phut", cost: 0, via: "deduce", type: "Kết luận", title: "Hai phút một ga: Bến Thành – Ba Son – Bến Thành bằng hai đoàn tàu hết đúng 8 phút trên tàu",
      text: "Mọi chặng đều 2 phút cố định, đã tính cả dừng đỗ. Từ Bến Thành tới Ba Son là hai chặng, bốn phút; từ Ba Son về Bến Thành cũng bốn phút. Một người lên U-07 lúc 22:00, xuống Ba Son 22:04, đổi sang D-05 đang đỗ cạnh sẽ về Bến Thành đúng 22:08:00. Không có chuyến nào khác sau đó để so: đây là chuyến đi vòng duy nhất còn khả thi trong đêm.",
      visual: { k: "paper", alt: "Kết luận: tám phút trên tàu", title: "KẾT LUẬN",
        rows: ["Mỗi chặng 2 phút, đã tính dừng đỗ", "Bến Thành → Ba Son: 22:00 → 22:04", "Ba Son → Bến Thành: 22:04 → 22:08", "Vòng đi về: đúng 8 phút trên tàu"], stamp: "ĐÃ XÁC LẬP" } },
    { id: "k_the_ra_bt", cost: 0, via: "deduce", type: "Kết luận", title: "Sau 22:08 chỉ hai thẻ ra cổng Bến Thành: một người vào từ Ba Son, một người vào từ chính Bến Thành",
      text: "Cổng Bến Thành ghi hai lượt ra sau khi D-05 về: thẻ đối tác P-2209 của Kiên lúc 22:10:05, người đã vào ở Ba Son 21:57:10; và thẻ NV-0417 của Phương lúc 22:11:40, người vào chính ở Bến Thành 21:56:58 và không quẹt thẻ ở ga nào khác. Một người vào Bến Thành lúc 21:56 rồi ra Bến Thành lúc 22:11 đã đi một vòng mà sổ vé không thấy đi đâu.",
      visual: { k: "paper", alt: "Kết luận: hai thẻ ra cổng Bến Thành", title: "KẾT LUẬN",
        rows: ["22:10:05 · P-2209 Kiên · vào Ba Son 21:57", "22:11:40 · NV-0417 Phương", "NV-0417 vào Bến Thành 21:56:58", "NV-0417: không lượt nào ở ga khác"], stamp: "ĐÃ XÁC LẬP" } },
    { id: "k_vong_ga", cost: 0, via: "deduce", type: "Kết luận", title: "Vòng 14 phút 42 giây của thẻ NV-0417 khớp từng giây với chuyến đi Ba Son rồi đổi đoàn tàu",
      text: "21:56:58 vào ga, 22:00 lên U-07, 22:04 xuống Ba Son, bước ngang sân ga sang D-05, 22:08 về Bến Thành, 22:11:40 quẹt thẻ ra: hai chặng bốn phút, vài phút đi bộ hai đầu, không một giây thừa. Người ngoài đọc sổ vé chỉ thấy một người vào ga rồi ra ga, chưa đi đâu. Chỉ một thẻ có vòng ấy: thẻ của Phương.",
      visual: { k: "paper", alt: "Kết luận: vòng 14 phút 42 giây", title: "KẾT LUẬN",
        rows: ["21:56:58 · NV-0417 vào Bến Thành", "22:00 U-07 · 22:04 Ba Son · đổi sang D-05", "22:08 · về Bến Thành", "22:11:40 ra cổng · tổng 14 phút 42 giây"], stamp: "ĐÃ XÁC LẬP" } },
    { id: "k_chinh_bieu_do", cost: 0, via: "deduce", type: "Kết luận", title: "Giờ hai đoàn gặp nhau ở Ba Son bị sửa 21 ngày trước bằng tài khoản của Trưởng phòng Kế hoạch",
      text: "Trước đó D-05 vào Ba Son lúc 22:02, sớm hơn U-07 hai phút. 21 ngày trước, tài khoản phuong.kh dời giờ D-05 rời Suối Tiên từ 21:40 thành 21:42 với lý do “đồng bộ chuyển tải”, rồi từ đó hai đoàn cuối đứng cạnh nhau đúng 46 giây. Chuyến cuối vắng khách tới mức không ai cần chuyển tải: lần sửa ấy chỉ có tác dụng với ai muốn đổi tàu mà không bị thấy.",
      visual: { k: "paper", alt: "Kết luận: người sửa giờ chuyến D-05", title: "KẾT LUẬN",
        rows: ["21 ngày trước · phuong.kh sửa D-05", "Rời Suối Tiên: 21:40 → 21:42", "Từ đó hai đoàn gặp nhau ở Ba Son 22:04", "Trưởng phòng Kế hoạch & Biểu đồ"], stamp: "ĐÃ XÁC LẬP" } },
    { id: "k_loai_vu_tham", cost: 0, via: "deduce", type: "Kết luận", title: "Lúc 22:03 Vũ ngồi ở cabin U-07, Thắm ngồi trước bảng điều khiển OCC",
      text: "Cabin ghi Vũ cầm cần điều khiển liên tục từ 22:00 tới 22:04:05, nên không thể ngồi ở toa 3 lúc 22:03:20; OCC ghi Thắm ngồi nhập lệnh đến 22:10. Cả hai nói dối chuyện riêng, nhưng không ai trong hai người ngồi cạnh Thịnh.",
      visual: { k: "paper", alt: "Kết luận: Vũ và Thắm ngoài toa 3", title: "KẾT LUẬN",
        rows: ["22:00–22:04 · Vũ ở cabin U-07", "21:50–22:10 · Thắm ở bảng điều khiển OCC", "Cả hai ngoài toa 3 lúc 22:03:20"], stamp: "ĐÃ XÁC LẬP" } },
    { id: "k_loai_kien", cost: 0, via: "deduce", type: "Kết luận", title: "Lúc 22:03 Kiên đứng ở đầu sân ga Ba Son, chưa lên đoàn tàu nào",
      text: "Camera sân ga Ba Son ghi Kiên đứng chờ ở đầu sân ga từ 21:58 tới 22:04, chưa lên tàu; thẻ P-2209 chỉ vào ga lúc 21:57:10. Anh không thể đang ngồi cạnh Thịnh ở toa 3 lúc 22:03:20 khi U-07 còn chạy giữa Nhà hát và Ba Son.",
      visual: { k: "paper", alt: "Kết luận: Kiên chờ ở sân ga Ba Son", title: "KẾT LUẬN",
        rows: ["21:57:10 · thẻ P-2209 vào Ba Son", "21:58–22:04 · đứng chờ ở đầu sân ga", "22:03:20 · U-07 chưa tới Ba Son"], stamp: "ĐÃ XÁC LẬP" } },
    { id: "k_loai_trang", cost: 0, via: "deduce", type: "Kết luận", title: "Lúc 22:03 Trang ở trong văn phòng Ban An toàn, cách ga một tầng thang bộ",
      text: "Nhật ký cửa hành lang tầng 3 ghi Trang vào 19:40 và ra 22:20:30, không lượt nào ở giữa: cô ở văn phòng suốt, không thể có mặt trên U-07. Cô nói dối rằng mình ở nhà, nhưng đang ở cạnh ga.",
      visual: { k: "paper", alt: "Kết luận: Trang ở văn phòng", title: "KẾT LUẬN",
        rows: ["19:40 · Trang vào văn phòng", "22:20:30 · Trang ra", "Không lượt nào ở giữa"], stamp: "ĐÃ XÁC LẬP" } },
    { id: "k_loai_ngan", cost: 0, via: "deduce", type: "Kết luận", title: "Lúc 22:03 Ngân ngồi ở toa 5, đồng phục, không áo mưa; xuống Ba Son rồi ra cổng",
      text: "Camera trên tàu ghi Ngân ngồi toa 5 mặc đồng phục từ 22:00:30, xuống Ba Son 22:04:10; cổng Ba Son ghi thẻ NV-0233 ra 22:05:10. Chị không áo mưa, không ngồi gần Thịnh, và đi qua cổng soát vé như người có thật điểm đến.",
      visual: { k: "paper", alt: "Kết luận: Ngân ở toa 5", title: "KẾT LUẬN",
        rows: ["22:00:30 · Ngân ngồi toa 5, đồng phục", "22:04:10 · xuống Ba Son", "22:05:10 · NV-0233 ra cổng Ba Son"], stamp: "ĐÃ XÁC LẬP" } },
    { id: "k_loai_ba_nguoi", cost: 0, via: "deduce", type: "Kết luận", title: "Lúc 22:03 Vũ, Thắm và Kiên đều ngoài toa 3",
      text: "Vũ ở cabin, Thắm ở bảng điều khiển OCC, Kiên chờ ở sân ga Ba Son: cả ba có camera đặt họ ngoài toa 3 đúng lúc mũi tiêm. Không ai trong ba người ngồi cạnh Thịnh.",
      visual: { k: "paper", alt: "Kết luận: Vũ, Thắm, Kiên ngoài toa 3", title: "KẾT LUẬN",
        rows: ["Vũ: cabin U-07", "Thắm: bảng điều khiển OCC", "Kiên: sân ga Ba Son", "Cả ba ngoài toa 3 lúc 22:03:20"], stamp: "ĐÃ XÁC LẬP" } },
    { id: "k_loai_hai", cost: 0, via: "deduce", type: "Kết luận", title: "Lúc 22:03 Trang ở văn phòng, Ngân ở toa 5",
      text: "Trang ở văn phòng Ban An toàn, Ngân ngồi toa 5 mặc đồng phục: cả hai bị nhật ký cửa, camera trên tàu và cổng Ba Son đặt vào chỗ khác. Không ai trong hai người là người áo mưa ngồi cạnh Thịnh.",
      visual: { k: "paper", alt: "Kết luận: Trang và Ngân ngoài chỗ ngồi cạnh Thịnh", title: "KẾT LUẬN",
        rows: ["Trang: văn phòng tầng 3, 19:40–22:20", "Ngân: toa 5, đồng phục, xuống Ba Son", "Cả hai không ngồi cạnh Thịnh"], stamp: "ĐÃ XÁC LẬP" } },
    { id: "k_con_lai_phuong", cost: 0, via: "deduce", type: "Kết luận", title: "Lúc 22:03 chỉ còn Phương vắng khỏi chỗ làm mà không nơi nào chứng minh",
      text: "Vũ, Thắm, Kiên, Trang và Ngân đều bị camera, nhật ký cửa hoặc cổng soát vé đặt vào chỗ khác. Chỉ còn Phương, người rời phòng Kế hoạch lúc 21:53:40 và quay lại lúc 22:14:50, hai mươi mốt phút không hồ sơ nào nói chị ở đâu, đúng khoảng người áo mưa đi vòng quanh Ba Son.",
      visual: { k: "paper", alt: "Kết luận: chỉ còn Phương", title: "KẾT LUẬN",
        rows: ["Vũ, Thắm, Kiên: ngoài toa 3", "Trang: văn phòng · Ngân: toa 5", "Phương ra 21:53:40 · vào lại 22:14:50", "21 phút không nơi nào chứng minh"], stamp: "ĐÃ XÁC LẬP" } },
    { id: "k_nghiem_thu_khong", cost: 0, via: "deduce", type: "Kết luận", title: "Biên bản nghiệm thu phanh của mười một đoàn tàu là khống",
      text: "Hợp đồng buộc thử phanh khẩn 120 lần mỗi đoàn mỗi năm và nghiệm thu bằng chữ ký Trưởng phòng Kế hoạch; hồ sơ trên bàn Thịnh có đủ mười bốn biên bản ký, nhưng nhật ký cảm biến chỉ có ba đoàn có dữ liệu thử thật. Mười một biên bản được ký nghiệm thu cho những lần thử chưa từng xảy ra.",
      visual: { k: "paper", alt: "Kết luận: nghiệm thu phanh khống", title: "KẾT LUẬN",
        rows: ["14 biên bản ký nghiệm thu đủ", "Chỉ 3 đoàn có dữ liệu cảm biến", "11 đoàn: thử phanh chưa từng xảy ra"], stamp: "ĐÃ XÁC LẬP" } },
    { id: "k_hoi_lo", cost: 0, via: "deduce", type: "Kết luận", title: "Thái Bình Rail chuyển 2,4 tỷ cho công ty của anh rể người ký nghiệm thu",
      text: "Công ty Thiện Nhân do Từ Văn Tài đại diện, mở 13 tháng trước, nhận 267 triệu mỗi tháng trong chín tháng từ Thái Bình Rail. Số điện thoại đăng ký trùng số đầu mối nghiệm thu trên hợp đồng, 0907 441 028; Tài là anh rể của Trưởng phòng Kế hoạch. Chín tháng phí tư vấn cho một công ty không tư vấn gì, đúng khoảng thời gian ký khống.",
      visual: { k: "paper", alt: "Kết luận: tiền chạy về anh rể người ký nghiệm thu", title: "KẾT LUẬN",
        rows: ["Thái Bình Rail → Thiện Nhân · 2,4 tỷ", "9 tháng liền · “phí tư vấn”", "ĐT Thiện Nhân = ĐT đầu mối nghiệm thu", "Chủ công ty: anh rể người ký nghiệm thu"], stamp: "ĐÃ XÁC LẬP" } },
    { id: "k_han_7h", cost: 0, via: "deduce", type: "Kết luận", title: "Thịnh định nộp báo cáo sáng thứ Sáu lúc 07:00 và gặp người ký trước khi nộp",
      text: "Lịch trong điện thoại ghi 07:00 thứ Sáu nộp báo cáo phanh bogie, ghi chú “gặp người ký trước khi nộp, cho một cơ hội”; Trang xác nhận ông nói “nộp xong thì mới ngủ được”. Ông đã chọn thời điểm: nếu ông sống tới sáng, báo cáo sẽ lên Ban Quản lý.",
      visual: { k: "paper", alt: "Kết luận: hạn nộp báo cáo 07:00", title: "KẾT LUẬN",
        rows: ["07:00 thứ Sáu · nộp báo cáo phanh", "Ghi chú: “gặp người ký trước khi nộp”", "Nhắn Trang 22:02:41: “Mai 7h tôi nộp”"], stamp: "ĐÃ XÁC LẬP" } },
    { id: "k_dong_co", cost: 0, via: "deduce", type: "Kết luận", title: "Báo cáo lên là mất hợp đồng 412 tỷ và người ký khống bị đưa ra trước pháp luật",
      text: "Báo cáo của Thịnh nộp lúc 07:00 sẽ chấm dứt hợp đồng với Thái Bình Rail theo điều 9.3 và phơi ra mười một chữ ký nghiệm thu cho những lần thử chưa từng có, cùng 2,4 tỷ chảy về công ty của anh rể người ký. Người ký có chín tiếng để ngăn nó lại, và biết chính xác ông sẽ ngồi ở đâu, lúc nào.",
      visual: { k: "paper", alt: "Kết luận: động cơ giết Thịnh", title: "KẾT LUẬN",
        rows: ["Báo cáo 07:00 → mất hợp đồng 412 tỷ", "11 chữ ký nghiệm thu khống lộ ra", "2,4 tỷ về công ty anh rể người ký"], stamp: "ĐÃ XÁC LẬP" } },
    { id: "k_thoi_quen", cost: 0, via: "deduce", type: "Kết luận", title: "Tối thứ Sáu nào Thịnh cũng đi chuyến cuối U-07 và ngồi ghế cuối toa 3",
      text: "Trang nói ông đi chuyến cuối 22:00 từ Bến Thành, ngồi toa 3 ghế cuối; bảng giờ đặt chuyến ấy là U-07, đoàn tàu ĐT-12. Ai hay đi chung tuyến, hay xem biểu đồ, đều biết trước ông sẽ ở đâu lúc 22:03.",
      visual: { k: "paper", alt: "Kết luận: thói quen của Thịnh", title: "KẾT LUẬN",
        rows: ["Tối thứ Sáu: chuyến cuối U-07 · 22:00", "Toa 3, ghế cuối (ghế 3-17)", "Biết trước được ông ở đâu lúc 22:03"], stamp: "ĐÃ XÁC LẬP" } }
  ],

  // Ghép hồ sơ thành kết luận. Dòng đầu của mỗi kết luận là lối ngắn nhất (gợi ý đi theo lối này); thứ tự "needs" là thứ tự gợi ý đi.
  deduce: [
    { needs: ["cam_bs", "nk_cua_chan"], gives: "k_xuong_ba_son" },
    { needs: ["cam_toa3", "nk_vi_tri"], gives: "k_xuong_ba_son" },
    { needs: ["phap_y", "dt_thinh"], gives: "k_chet_giua_chang" },
    { needs: ["cam_toa3", "doc_chat"], gives: "k_chet_giua_chang" },
    { needs: ["so_do_ba_son", "bieu_do"], gives: "k_hai_tau_gap_nhau" },
    { needs: ["nk_vi_tri", "so_do_ba_son"], gives: "k_hai_tau_gap_nhau" },
    { needs: ["cam_bs", "k_hai_tau_gap_nhau"], gives: "k_doi_tau" },
    { needs: ["cam_toa3", "ao_mua"], gives: "k_doi_tau" },
    { needs: ["bang_gio", "bieu_do"], gives: "k_hai_phut" },
    { needs: ["nk_bieu_do", "bieu_do"], gives: "k_chinh_bieu_do" },
    { needs: ["nk_bieu_do", "k_hai_tau_gap_nhau"], gives: "k_chinh_bieu_do" },
    { needs: ["nk_cong_bt", "nk_the_bt"], gives: "k_the_ra_bt" },
    { needs: ["k_the_ra_bt", "k_doi_tau"], gives: "k_vong_ga" },
    { needs: ["cam_cab", "cam_occ"], gives: "k_loai_vu_tham" },
    { needs: ["cam_bs", "nk_the_bt"], gives: "k_loai_kien" },
    { needs: ["nk_cua_vp", "k_xuong_ba_son"], gives: "k_loai_trang" },
    { needs: ["cam_toa3", "nk_cong_bs"], gives: "k_loai_ngan" },
    { needs: ["k_loai_vu_tham", "k_loai_kien"], gives: "k_loai_ba_nguoi" },
    { needs: ["k_loai_trang", "k_loai_ngan"], gives: "k_loai_hai" },
    { needs: ["k_loai_ba_nguoi", "k_loai_hai"], gives: "k_con_lai_phuong" },
    { needs: ["ho_so_phanh", "hd_thau"], gives: "k_nghiem_thu_khong" },
    { needs: ["ho_so_phanh", "trang_thu"], gives: "k_nghiem_thu_khong" },
    { needs: ["sao_ke_nh", "k_nghiem_thu_khong"], gives: "k_hoi_lo" },
    { needs: ["sao_ke_nh", "hd_thau"], gives: "k_hoi_lo" },
    { needs: ["dt_thinh", "loi_trang"], gives: "k_han_7h" },
    { needs: ["k_hoi_lo", "k_han_7h"], gives: "k_dong_co" },
    { needs: ["k_nghiem_thu_khong", "k_han_7h"], gives: "k_dong_co" },
    { needs: ["loi_trang", "bang_gio"], gives: "k_thoi_quen" },
    { needs: ["loi_trang", "hien_truong_toa"], gives: "k_thoi_quen" },
    { needs: ["loi_tham", "so_do_ba_son"], gives: "k_hai_tau_gap_nhau" },
    { needs: ["cam_toa3", "k_hai_tau_gap_nhau"], gives: "k_doi_tau" },
    { needs: ["k_the_ra_bt", "k_hai_phut"], gives: "k_vong_ga" },
    { needs: ["hd_thau", "trang_thu"], gives: "k_nghiem_thu_khong" },
    { needs: ["dt_thinh", "trang_thu"], gives: "k_han_7h" },
    { needs: ["phap_y", "cam_toa3"], gives: "k_chet_giua_chang" }
  ],

  culprit: "phuong",

  confront: [
    { who: "ngan", clue: "nk_cong_bs", reveal: "ngan_thu",
      text: "Ngân nhìn dòng “22:05:10 NV-0233 ra” và ngồi xuống. “Phải… tôi ra ở Ba Son. Đừng báo quản lý.” Chị kể hết, giọng nhỏ dần." },
    { who: "ngan", clue: "cam_toa3",
      text: "Ngân nhìn mình ngồi toa 5 trên màn hình: “Tôi chẳng nhìn thấy gì ở toa 3. Toa 5 thì chỉ có hai bà cụ và tôi.”" },
    { who: "ngan", clue: "nk_the_bt",
      text: "Ngân gật: “Thẻ tôi vào Bến Thành 21:58, ra Ba Son 22:05. Tôi đâu có che giấu chuyện ấy, chỉ không muốn nói thôi.”" },
    { who: "ngan", clue: "cam_cong_bt",
      text: "Ngân nhìn người áo mưa xanh quẹt thẻ: “Ai cũng áo mưa đêm nay. Tôi đứng ở cổng mà không nhìn ra mặt ai.”" },
    { who: "vu", clue: "cam_cab", reveal: "vu_thu",
      text: "Vũ nhìn mình mở cửa cabin lúc 22:04:05 và thở dài. “Tôi chỉ ra nửa phút… Thôi, tôi kể hết.” Anh kể, tay xoắn mũ lái tàu." },
    { who: "vu", clue: "cam_bs",
      text: "Vũ chỉ vào bóng người đi ngang sân ga: “Đấy, tôi thấy người đó. Tôi tưởng khách đổi tàu. Chuyến cuối ai cũng vội.”" },
    { who: "vu", clue: "nk_vi_tri",
      text: "Vũ gõ ngón tay xuống bàn: “Hai đoàn đứng cạnh nhau đúng 46 giây. Tôi lái bốn năm chưa thấy chuyến nào bố trí kiểu đó.”" },
    { who: "tham", clue: "cam_occ", reveal: "tham_thu",
      text: "Thắm nhìn mình rời ghế lúc 22:10 và đỏ mặt. “Em… đi nghe điện thoại phỏng vấn.” Cô kể hết, nói rất nhanh." },
    { who: "tham", clue: "nk_bieu_do",
      text: "Thắm đọc dòng “phuong.kh” rất lâu. “Chị ấy bảo để khách đổi chiều tiện. Em chỉ nhập. Em không nghĩ…”" },
    { who: "tham", clue: "bieu_do",
      text: "Thắm nhìn ghi chú “đồng bộ chuyển tải”: “Chuyến cuối vắng quá, chẳng ai cần chuyển tải. Em có thắc mắc, nhưng chị ấy là trưởng phòng.”" },
    { who: "kien", clue: "cam_bs", reveal: "kien_thu",
      text: "Kiên nhìn mình đứng chờ ở đầu sân ga và nhắm mắt. “Được. Tôi ở Ba Son. Ông Thịnh hẹn tôi.” Anh kể hết, mồ hôi rịn ở thái dương." },
    { who: "kien", clue: "dt_thinh",
      text: "Kiên nhìn cuộc gọi 21:35: “Ông ấy gọi tôi hai phút mười giây. Bảo tôi lên gặp. Tôi biết ông ấy định nói gì.”" },
    { who: "kien", clue: "ho_so_phanh",
      text: "Kiên liếc xấp biên bản: “Mười một đoàn chưa thử đủ. Tôi biết. Nhưng tôi ký vì người nghiệm thu đã ký trước.”" },
    { who: "trang", clue: "nk_cua_vp", reveal: "trang_thu",
      text: "Trang nhìn dòng “19:40 Trang vào” và cúi đầu. “Tôi ở đó cả tối… Tôi nói dối vì sợ.” Cô kể hết." },
    { who: "trang", clue: "dt_thinh",
      text: "Trang đọc tin nhắn cuối của ông: “Ông ấy bảo tôi giữ kín. Tôi gọi lại mà ông không nghe máy.” Mắt cô đỏ hoe." },
    { who: "trang", clue: "ho_so_phanh",
      text: "Trang lật xấp hồ sơ: “Đây là bản tôi sao lén. Tôi biết tôi làm sai. Nhưng ông ấy cần nó.”" },
    { who: "phuong", clue: "nk_cua_vp",
      text: "Phương nhìn dòng “21:53:40 ra, 22:14:50 vào lại” và mím môi. “Tôi xuống sảnh ga hút thuốc. Hai mươi phút. Ở đó có camera không?” Giọng cô đều." },
    { who: "phuong", clue: "cam_cong_bt",
      text: "Phương nhìn người áo mưa quẹt thẻ: “Đêm mưa ai chẳng thế. Cô định bảo tôi đi mua áo mưa à?” Ngón tay cô gõ hai nhịp lên mặt bàn." },
    { who: "phuong", clue: "ao_mua",
      text: "Phương liếc chiếc áo mưa trong ảnh: “Một chiếc áo mưa ba mươi nghìn. Cả ngàn người đã mặc loại đó.” Cô cười nhạt." },
    { who: "phuong", clue: "nk_the_bt",
      text: "Phương đọc dòng thẻ của mình rất lâu: “Vào Bến Thành, ra Bến Thành. Vậy là tôi chưa đi đâu cả. Anh đọc sổ vé không biết đọc sao?”" },
    { who: "phuong", clue: "nk_bieu_do",
      text: "Phương hơi khựng. “Biểu đồ nào cũng phải chỉnh. Tôi chỉnh vì đồng bộ chuyển tải, trước mặt cả phòng điều hành. Có gì sai?”" },
    { who: "phuong", clue: "k_doi_tau",
      text: "Phương nhìn dòng “bước ngang sân ga lên D-05” và không nói gì. Cô lấy kính ra, lau, đeo lại. “Một người đổi tàu ở Ba Son. Rồi sao?”" },
    { who: "phuong", clue: "k_vong_ga",
      text: "Phương cười rất khẽ. “Mười bốn phút bốn mươi hai giây. Anh đếm giỏi đấy. Nhưng tôi vào ga rồi ra ga, đó là điều hợp lệ. Cả sổ vé nói thế.”" },
    { who: "phuong", clue: "k_chinh_bieu_do",
      text: "Phương im lặng khá lâu. “Hai phút, từ ngày khai trương không đổi.” Cô nói câu ấy như thể nhắc lại chính mình." },
    { who: "phuong", clue: "k_hoi_lo",
      text: "Phương nhìn tên anh rể mình và hít một hơi. “Đó là chuyện làm ăn của nhà tôi. Tôi cần luật sư.”" },
    { who: "phuong", clue: "k_dong_co",
      text: "Phương ngồi thẳng lưng. “Ông ấy cho tôi một cơ hội. Tôi biết cơ hội ấy là gì.” Giọng cô thật nhẹ, rồi cô quay sang bạn: “Hai phút một ga. Tôi đã tính từng giây.”" },
    { who: "phuong", clue: "k_con_lai_phuong",
      text: "Phương liếc sang chỗ khác. “Anh loại trừ hết mọi người rồi bảo là còn lại tôi? Tôi vẫn ở đây. Tôi đâu bỏ chạy.”" }
  ],

  // Chuỗi chứng minh: mỗi bước chọn một hồ sơ nằm trong "ids". Chứng cứ rẻ nhất đứng đầu mỗi danh sách (gợi ý đi theo đó).
  chain: [
    { key: "when", label: "Giờ và nơi ra tay", ask: "Thịnh bị hại lúc nào, ở chặng nào, và kẻ ra tay rời đoàn tàu ở đâu?", ids: ["k_xuong_ba_son", "k_chet_giua_chang"],
      hint: "Thi thể chỉ được thấy ở ga cuối, nhưng ông chết sớm hơn nhiều. Hỏi camera trong toa và camera sân ga: ai ngồi cạnh ông, ai xuống tàu, ở ga nào, lúc mấy giờ." },
    { key: "escape", label: "Đường biến mất", ask: "Kẻ ra tay đã biến khỏi tuyến mà không để lại lượt quẹt nào ở cổng soát vé Ba Son bằng cách nào, và đó là ai?", ids: ["k_chinh_bieu_do", "k_vong_ga", "k_con_lai_phuong"],
      hint: "Hai đoàn cuối đứng cạnh nhau ở Ba Son. Xem biểu đồ có từng khác thế không và ai sửa; hoặc xem sổ thẻ: ai vào ga rồi ra chính ga ấy sau chừng ấy phút." },
    { key: "motive", label: "Động cơ", ask: "Vì sao có người cần Thịnh chết trước bảy giờ sáng?", ids: ["k_hoi_lo", "k_dong_co"],
      hint: "Bản báo cáo ông định nộp là về phanh. Tìm xem hồ sơ phanh thật ra thế nào, và tiền của nhà thầu chảy về đâu." }
  ],

  explanation: "<p><b>Ông chết trên tàu, giữa hai ga.</b> Thịnh ngồi ghế cuối toa 3 của U-07 như mọi tối thứ Sáu. Tin nhắn cuối của ông gửi 22:02:41, camera trong toa ghi ông gục đầu lúc 22:03:48, và pháp y tìm thấy dấu kim ở cổ tay trái: kali đậm đặc kèm thuốc an thần, tim ngừng trong chừng một đến hai phút. Người ngồi sát bên ông, trong áo mưa xanh nhạt, trùm mũ, khẩu trang, đeo găng, tiêm ông lúc 22:03:20 rồi đặt quyển sách ngay ngắn lên đùi ông cho giống một người đang ngủ. Người ấy xuống ở Ba Son lúc 22:04:10 và để lại thi thể đi tiếp tới ga cuối, hai mươi hai phút nữa.</p>" +
    "<p><b>Hai phút một ga.</b> Mọi chặng đều cố định hai phút, nên con tàu là một cái đồng hồ. Ba Son là ga có sân ga đảo: lúc 22:04 U-07 vào đường 2 và D-05, chuyến cuối đi ngược lại, vào đường 1; hai đoàn cùng đứng 46 giây, cửa chắn mở cùng lúc. Người áo mưa không đi về lối ra: camera ghi họ bước ngang sân ga lên D-05, đoàn tàu chạy về Bến Thành, tới 22:08:00. Cổng Ba Son không ghi gì, vì không ai đi qua. Chiếc áo mưa nằm trong thùng rác ở sảnh Bến Thành.</p>" +
    "<p><b>Một người vào ga rồi ra chính ga ấy.</b> Sổ thẻ chỉ thấy thẻ NV-0417 của Phương vào Bến Thành lúc 21:56:58 và ra Bến Thành lúc 22:11:40, không lượt nào ở ga khác: mười bốn phút bốn mươi hai giây, đúng bằng hai chặng bốn phút, bước ngang sân ga và vài phút đi bộ hai đầu. Cửa tầng 3 ghi chị ra 21:53:40 và vào lại 22:14:50, trái lời khai “ở phòng Kế hoạch tới 22h30”. Còn Vũ ở cabin, Thắm ở bảng điều khiển OCC, Kiên chờ ở sân ga Ba Son, Trang trong văn phòng Ban An toàn, Ngân ngồi toa 5 trong đồng phục.</p>" +
    "<p><b>Chị đã sửa đồng hồ ba tuần trước.</b> Trước đó D-05 vào Ba Son lúc 22:02, hai phút sớm hơn U-07. Hai mươi mốt ngày trước tài khoản phuong.kh dời giờ D-05 hai phút “để đồng bộ chuyển tải”, trong khi chuyến cuối vắng đến mức không ai cần chuyển tải. Thắm chỉ nhập số liệu; chị Phương đưa bản mới. Hai mươi mốt ngày chờ để có đúng một đêm thứ Sáu hai đoàn đứng cạnh nhau.</p>" +
    "<p><b>Vì sao.</b> Ông Thịnh nhận được nhật ký cảm biến phanh từ Trang: mười một trên mười bốn đoàn tàu chưa từng thử đủ 120 lần phanh khẩn, dù biên bản nghiệm thu ký đủ. Hợp đồng 412 tỷ buộc nghiệm thu bằng chữ ký của Trưởng phòng Kế hoạch; Thái Bình Rail đã chuyển 2,4 tỷ qua Công ty Thiện Nhân của anh rể Phương, đại diện bằng chính số điện thoại đầu mối nghiệm thu của chị. Ông định nộp báo cáo lúc bảy giờ sáng và, như ông ghi trong điện thoại, “gặp người ký trước khi nộp, cho một cơ hội”. Kiên bị ông gọi lúc 21:35 và đúng là người ông cần gặp, nhưng người mà ông cho cơ hội là một người ông tin: người đã nói chuyện với ông bằng những con số suốt chín năm.</p>"
};
