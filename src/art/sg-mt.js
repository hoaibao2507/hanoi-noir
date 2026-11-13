/* =====================================================================
   Cảnh vụ s5 "Hai Phút Một Ga" (tuyến metro số 1): toa 3 đoàn tàu ĐT-12, sảnh soát vé ga Bến Thành, Trung tâm điều hành OCC,
   sân ga đảo Ba Son (nhìn dọc sân ga, hai đoàn đỗ hai bên), văn phòng Ban An toàn. Phòng giám định dùng lại cảnh sg_lab của vụ s1.
   Dùng bộ đồ nghề trong kit.js. Tọa độ theo khung cảnh gốc 1600×900; sàn trong nhà từ y = 720.
   ===================================================================== */

import { lin, rect, path, circle, line, txt, blurs, glow, haze, frame } from "./kit.js";
import { figure } from "./people.js";

// Camera treo tường: thân, ống kính, đèn đỏ
const cam = (x, y, ok = true) =>
  rect(x - 24, y - 12, 48, 26, "#262a30", 'rx="5"') + circle(x - 24, y, 8, "#0a0c10") + circle(x - 20, y, 4, "#3b6fa0", 'opacity=".8"') + circle(x + 16, y - 6, 3, ok ? "#ff4d4d" : "#3a3a3e");

// Đa giác từ danh sách điểm [x, y]
const poly = (pts, fill, extra = "") => path("M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L") + " Z", fill, extra);

// Vệt nước mưa tĩnh trên kính (không bọc nhóm "rain" vì cảnh trong nhà không có lớp mưa chuyển động)
function streaks(x, y, w, h, n, col = "#8fb3d1", op = 0.3) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const sx = x + ((i * 47) % w), sy = y + ((i * 83) % (h - 40));
    s += line(sx, sy, sx - 4, sy + 26 + (i % 3) * 10, col, 1.4, `opacity="${op}"`);
  }
  return s;
}

// Ánh đèn thành phố mờ sau cửa kính: các đốm ấm và lạnh
function cityBlur(k, x, y, w, h) {
  let s = "";
  for (let i = 0; i < 26; i++) {
    const cx = x + 12 + ((i * 53) % (w - 24)), cy = y + 18 + ((i * 71) % (h - 40));
    s += circle(cx, cy, 3 + (i % 4), i % 4 === 0 ? "#7be6e0" : i % 5 === 0 ? "#ff8f6a" : "#ffd58a", `opacity="${(0.25 + (i % 5) * 0.08).toFixed(2)}"`);
  }
  return s;
}

// Toa 3 đoàn tàu ĐT-12 đỗ ở ga cuối: dải đèn trần, bản đồ tuyến, cửa cabin, hàng ghế dọc tường, Thịnh ngồi như đang ngủ ở ghế cuối, túi xách, vũng nước, dây băng
export function sgMtCar() {
  const k = "mtc";
  const defs = blurs(k) +
    lin(`${k}-wall`, [[0, "#2b3441"], [1, "#161b24"]]) +
    lin(`${k}-floor`, [[0, "#39424c"], [1, "#10141a"]]) +
    lin(`${k}-win`, [[0, "#0a1224"], [1, "#1d2c4a"]]) +
    lin(`${k}-seat`, [[0, "#3a7a9a"], [1, "#1b4058"]]);
  let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`) + rect(0, 0, 1600, 70, "#0e1219");
  for (let x = 120; x < 1600; x += 240) b += rect(x - 90, 34, 180, 10, "#eaf4ff", 'rx="5" opacity=".95"') + glow(k, x, 40, 110, "#eaf4ff", 0.22);

  // Dải bản đồ tuyến phía trên cửa sổ: ga Ba Son sáng vàng
  b += rect(300, 84, 1000, 44, "#0d1118", 'rx="6"') + line(340, 106, 1260, 106, "#2f9a74", 5);
  for (let i = 0; i < 14; i++) b += circle(340 + i * (920 / 13), 106, i === 2 ? 9 : 6, i === 2 ? "#ffd27a" : "#eaf4ff");
  b += txt(340, 146, "BẾN THÀNH", 13, "#cfe8ff") + txt(1260, 146, "SUỐI TIÊN", 13, "#cfe8ff", 'text-anchor="end"');

  // Sáu ô cửa sổ tối, ánh đèn thành phố nhòe, vệt mưa
  for (let i = 0; i < 6; i++) {
    const x = 320 + i * 170;
    b += rect(x, 180, 150, 240, `url(#${k}-win)`, 'rx="10"') + cityBlur(k, x, 180, 150, 240) + streaks(x + 6, 188, 140, 230, 7) + rect(x, 180, 150, 240, "none", 'rx="10" stroke="#0a0d12" stroke-width="6"');
  }

  // Cửa cabin bên trái: số hiệu đoàn tàu
  b += rect(40, 170, 240, 550, "#1a1f27") + rect(52, 182, 216, 538, "#232a34") + rect(100, 226, 120, 100, "#0b1220") + rect(108, 234, 104, 84, "#17243c");
  b += rect(96, 360, 128, 54, "#10151b", 'rx="4"') + txt(160, 396, "ĐT-12", 28, "#e9d9a8", 'text-anchor="middle" letter-spacing="2"');
  b += rect(92, 432, 136, 26, "#0b0e13", 'rx="3"') + txt(160, 450, "CABIN · NHÂN VIÊN", 11, "#cfe8ff", 'text-anchor="middle"');
  b += rect(236, 520, 18, 34, "#0b0e13", 'rx="3"') + circle(245, 534, 4, "#4fe08a") + cam(520, 250) + glow(k, 520, 250, 80, "#ffd58a", 0.15);

  // Tay vịn ngang, hai cột đứng
  b += line(300, 470, 1420, 470, "#cfd8e0", 7) + rect(636, 70, 9, 650, "#cfd8e0") + rect(996, 70, 9, 650, "#cfd8e0");
  for (let i = 0; i < 9; i++) b += line(340 + i * 120, 470, 340 + i * 120, 500, "#5a6672", 3) + circle(340 + i * 120, 508, 9, "none", 'stroke="#5a6672" stroke-width="3"');

  // Hàng ghế dọc tường: ba chỗ ngồi, ghế cuối bên phải
  b += rect(700, 480, 600, 126, `url(#${k}-seat)`, 'rx="12"') + rect(700, 604, 600, 44, "#2f6a8a", 'rx="8"') + rect(700, 646, 600, 62, "#0f141b");
  for (const x of [700, 900, 1100, 1300]) b += rect(x - 6, 560, 12, 112, "#cfd8e0", 'rx="4"');
  // Vũng nước và dấu dép ướt trên ghế/ sàn cạnh Thịnh
  b += `<ellipse cx="1004" cy="624" rx="52" ry="9" fill="#9fc3dd" opacity=".35"/>` + `<ellipse cx="990" cy="738" rx="40" ry="8" fill="#9fc3dd" opacity=".3"/>` + `<ellipse cx="1040" cy="752" rx="30" ry="6" fill="#9fc3dd" opacity=".3"/>`;
  // Túi xách trên ghế đầu
  b += rect(760, 590, 90, 34, "#2a2320", 'rx="6"') + rect(790, 582, 30, 10, "#4a3a30", 'rx="3"') + rect(770, 600, 70, 4, "#6a5646");

  // Thịnh ngồi ở ghế cuối, quyển sách mở trên đùi
  b += figure(1160, 460, 1, { top: "#8a8f98", hair: "short", hc: "#3a3a3a", skin: "#d9ae88", glasses: true, seated: true });
  b += rect(1120, 584, 80, 14, "#f3ead2", 'rx="2" transform="rotate(-4 1160 590)"') + line(1160, 584, 1160, 596, "#9b8a68", 2);
  b += rect(1100, 604, 120, 44, "#2f6a8a", 'rx="8"');
  // Dải băng phong tỏa của cảnh sát
  b += line(1040, 452, 1460, 520, "#f4d03a", 7, 'stroke-dasharray="16 12"') + line(1040, 462, 1460, 530, "#14161b", 3, 'stroke-dasharray="16 12" stroke-dashoffset="14"');
  // Nhãn thép dưới tay vịn (dấu vết ẩn): chấm sáng nhỏ ở đầu ghế
  b += rect(1274, 672, 22, 9, "#8a949e", 'rx="2"') + rect(1278, 675, 14, 3, "#2a313a");

  // Vũ đứng trước cửa cabin
  b += figure(400, 470, 1, { top: "#1d3b5a", hair: "short", hc: "#2a1e16", skin: "#dfae85" });

  b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
  for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#0a0d12", 2, 'opacity=".5"');
  b += rect(0, 728, 1600, 10, "#f4d03a", 'opacity=".25"') + haze(k, 800, 540, 520, "#cfe8ff", 0.07);
  return frame("Toa 3 đoàn tàu ĐT-12 đỗ ở ga Suối Tiên", defs, b);
}

// Sảnh soát vé ga Bến Thành (ga ngầm): trần đèn tấm, biển tên ga, hàng cổng soát vé và cổng nhân viên, bảng giờ tàu đêm, quầy của Ngân, nhà vệ sinh và máy bán áo mưa
export function sgMtGate() {
  const k = "mtg";
  const defs = blurs(k) +
    lin(`${k}-wall`, [[0, "#2f3a46"], [1, "#171d26"]]) +
    lin(`${k}-floor`, [[0, "#4a545e"], [1, "#12161c"]]) +
    lin(`${k}-gate`, [[0, "#59636f"], [1, "#2a313a"]]);
  let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`) + rect(0, 0, 1600, 80, "#0e1219");
  for (let x = 150; x < 1600; x += 250) b += rect(x - 80, 34, 160, 16, "#eaf4ff", 'rx="3" opacity=".95"') + glow(k, x, 42, 120, "#eaf4ff", 0.22);
  // Tường ốp gạch và biển tên ga
  for (let r = 0; r < 6; r++) b += line(0, 140 + r * 90, 1600, 140 + r * 90, "#0c1016", 2, 'opacity=".6"');
  for (let c = 0; c < 18; c++) b += line(c * 90, 80, c * 90, 720, "#0c1016", 2, 'opacity=".35"');
  b += rect(560, 100, 480, 70, "#0b4d3a", 'rx="6"') + txt(800, 150, "BẾN THÀNH", 44, "#f3f1ea", 'text-anchor="middle" letter-spacing="6"');
  b += cam(880, 230) + glow(k, 880, 230, 70, "#ffd58a", 0.15);

  // Bảng giờ tàu đêm bên phải
  b += rect(920, 270, 300, 190, "#0a0f16", 'rx="6"') + rect(928, 278, 284, 174, "#10243a") + txt(1070, 308, "GIỜ TÀU ĐÊM · TUYẾN 1", 16, "#ffd27a", 'text-anchor="middle"');
  b += txt(940, 346, "U-07  Bến Thành 22:00 → Suối Tiên 22:26", 13, "#cfe8ff") + txt(940, 378, "D-05  Suối Tiên 21:42 → Bến Thành 22:08", 13, "#cfe8ff");
  b += txt(940, 414, "Giữa hai ga liền kề: 2 phút", 13, "#9fd6c0") + txt(940, 438, "Sau chuyến cuối ga đóng cửa", 13, "#9aa5b3");
  b += glow(k, 1070, 360, 130, "#4fa0d6", 0.18);

  // Hàng cổng soát vé: bốn cổng khách và một cổng nhân viên rộng
  b += rect(540, 560, 600, 12, "#0d1015");
  for (let i = 0; i < 4; i++) {
    const x = 590 + i * 130;
    b += rect(x, 440, 74, 280, `url(#${k}-gate)`, 'rx="8"') + rect(x + 8, 456, 58, 24, "#05080e", 'rx="3"') + rect(x + 14, 462, 46, 6, "#4fe0a0") + rect(x + 22, 500, 30, 30, "#10151b", 'rx="4"') + circle(x + 37, 515, 6, "#3b6fa0");
    b += rect(x + 74, 520, 56, 6, "#4fe08a", 'opacity=".7"');
  }
  b += rect(1110, 440, 80, 280, `url(#${k}-gate)`, 'rx="8"') + rect(1118, 456, 64, 24, "#05080e", 'rx="3"') + rect(1124, 462, 52, 6, "#ffd27a") + txt(1150, 540, "NV", 18, "#f3f1ea", 'text-anchor="middle"');
  b += rect(1200, 520, 90, 6, "#4fe08a", 'opacity=".7"');
  // Bộ điều khiển cổng (hộp xám có màn hình nhỏ)
  b += rect(700, 560, 120, 84, "#1b232c", 'rx="6"') + rect(710, 570, 100, 40, "#0b1c2c") + rect(716, 578, 70, 4, "#4fe0a0") + rect(716, 588, 54, 4, "#4fe0a0", 'opacity=".6"') + rect(716, 598, 62, 4, "#4fe0a0", 'opacity=".5"');

  // Quầy trực của Ngân bên trái
  b += rect(260, 600, 330, 18, "#9fa9b2", 'rx="3"') + rect(272, 618, 306, 100, "#1b232c") + rect(300, 530, 120, 70, "#05080e", 'rx="3"') + rect(306, 536, 108, 58, "#0b1c2c");
  b += figure(430, 470, 1, { top: "#2e4a6b", hair: "long", hc: "#2a1a14", skin: "#efc9a7" });

  // Nhà vệ sinh bên phải xa, thùng rác, máy bán áo mưa tự động
  b += rect(1290, 360, 150, 360, "#1a2028") + rect(1304, 380, 122, 340, "#10151b") + txt(1365, 420, "WC", 30, "#cfe8ff", 'text-anchor="middle"');
  b += rect(1206, 610, 64, 110, "#2a313a", 'rx="6"') + rect(1202, 604, 72, 12, "#3a424c", 'rx="3"') + path("M1214 604 Q1230 580 1248 604 Z", "#9fd6c0", 'opacity=".9"') + path("M1236 606 Q1248 590 1262 606 Z", "#8fc4b0", 'opacity=".9"');
  b += rect(1440, 400, 110, 320, "#2a4a5a", 'rx="8"') + rect(1452, 416, 86, 90, "#05080e", 'rx="4"') + txt(1495, 470, "RAINY-GO", 14, "#9fd6c0", 'text-anchor="middle"');
  for (let i = 0; i < 4; i++) b += rect(1456 + i * 20, 520, 14, 60, "#9fd6c0", 'rx="3" opacity=".8"');
  b += glow(k, 1495, 460, 80, "#9fd6c0", 0.18);

  b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
  for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#0b0e12", 2, 'opacity=".5"');
  b += `<ellipse cx="620" cy="800" rx="130" ry="14" fill="#9fc3dd" opacity=".12"/>` + `<ellipse cx="1000" cy="780" rx="150" ry="14" fill="#9fc3dd" opacity=".1"/>`;
  b += rect(0, 726, 1600, 8, "#f4d03a", 'opacity=".14"') + haze(k, 800, 500, 520, "#cfe8ff", 0.06);
  return frame("Sảnh soát vé ga Bến Thành", defs, b);
}

// Trung tâm điều hành OCC: tường sơ đồ tuyến với hai chấm tàu U-07 và D-05 cùng ở Ba Son, bàn trực của Thắm, bảng nhật ký vị trí, máy trạm sửa biểu đồ
export function sgMtOcc() {
  const k = "mto";
  const defs = blurs(k) +
    lin(`${k}-wall`, [[0, "#1f2a36"], [1, "#0e1319"]]) +
    lin(`${k}-floor`, [[0, "#2c343e"], [1, "#0c1015"]]) +
    lin(`${k}-desk`, [[0, "#9fa9b2"], [1, "#4a5560"]]);
  let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`) + rect(0, 0, 1600, 36, "#080b0f");
  for (let x = 160; x < 1500; x += 260) b += rect(x - 70, 40, 140, 10, "#e8f2ff", 'rx="4" opacity=".7"') + glow(k, x, 54, 100, "#e8f2ff", 0.14);

  // Tường sơ đồ tuyến: đường 14 ga, tàu U-07 (xanh) và D-05 (cam) cùng ở Ba Son
  b += rect(300, 80, 1000, 340, "#05080e", 'rx="8"') + rect(308, 88, 984, 324, "#0a1a2a");
  const X = (i) => 360 + i * (880 / 13);
  b += line(X(0), 250, X(13), 250, "#2f9a74", 8) + line(X(0), 266, X(13), 266, "#c79a3a", 6, 'opacity=".7"');
  const names = ["BẾN THÀNH", "NHÀ HÁT", "BA SON", "VĂN THÁNH", "TÂN CẢNG", "THẢO ĐIỀN", "AN PHÚ", "RẠCH CHIẾC", "PHƯỚC LONG", "BÌNH THÁI", "THỦ ĐỨC", "CÔNG NGHỆ CAO", "ĐH QUỐC GIA", "SUỐI TIÊN"];
  for (let i = 0; i < 14; i++) b += circle(X(i), 250, i === 2 ? 12 : 7, i === 2 ? "#ffd27a" : "#eaf4ff");
  b += txt(X(0), 306, names[0], 12, "#cfe8ff", 'text-anchor="start"') + txt(X(2), 306, names[2], 12, "#ffd27a", 'text-anchor="middle"') + txt(X(13), 306, names[13], 12, "#cfe8ff", 'text-anchor="end"');
  // Hai chấm tàu đè lên nhau ở Ba Son
  b += rect(X(2) - 40, 198, 80, 22, "#2fc990", 'rx="6"') + txt(X(2), 214, "U-07", 14, "#05110c", 'text-anchor="middle"') + glow(k, X(2), 209, 70, "#2fc990", 0.35);
  b += rect(X(2) - 40, 276, 80, 22, "#f0a050", 'rx="6"') + txt(X(2), 292, "D-05", 14, "#1a0e05", 'text-anchor="middle"') + glow(k, X(2), 287, 70, "#f0a050", 0.35);
  b += txt(800, 130, "SƠ ĐỒ TUYẾN 1 · CHUYẾN CUỐI ĐÊM", 20, "#cfe8ff", 'text-anchor="middle" letter-spacing="3"');
  b += txt(800, 380, "BA SON · U-07 22:04:00 · D-05 22:04:01", 16, "#ffd27a", 'text-anchor="middle"');
  b += glow(k, 800, 250, 380, "#4fa0d6", 0.12) + cam(1180, 230);

  // Bàn trực bên trái, Thắm ngồi trước màn hình, tai nghe
  b += rect(250, 610, 300, 18, `url(#${k}-desk)`, 'rx="3"') + rect(262, 628, 276, 92, "#1b232c") + rect(250, 560, 150, 52, "#05080e", 'rx="3"') + rect(256, 566, 138, 40, "#0b1c2c");
  b += figure(420, 520, 1, { top: "#355a7a", hair: "long", hc: "#2b1b14", skin: "#e9c09b", seated: true });
  b += rect(478, 598, 40, 12, "#10151b", 'rx="3"') + circle(498, 592, 4, "#ffd27a");

  // Bảng nhật ký vị trí đoàn tàu ở giữa
  b += rect(620, 590, 240, 20, `url(#${k}-desk)`, 'rx="3"') + rect(630, 610, 220, 110, "#1b232c") + rect(640, 470, 200, 120, "#05080e", 'rx="4"') + rect(648, 478, 184, 104, "#0b1c2c");
  [["U-07", "BS 22:04:00", "#4fe08a"], ["D-05", "BS 22:04:01", "#ffd27a"], ["ATS", "OK ±1s", "#4fe08a"]].forEach(([a, c, col], i) => {
    b += txt(660, 506 + i * 28, a, 13, "#cfe8ff") + txt(822, 506 + i * 28, c, 12, col, 'text-anchor="end"');
  });
  b += glow(k, 740, 520, 110, "#7fc8ff", 0.2);

  // Máy trạm sửa biểu đồ bên phải
  b += rect(980, 590, 300, 20, `url(#${k}-desk)`, 'rx="3"') + rect(990, 610, 280, 110, "#1b232c") + rect(1030, 440, 190, 130, "#05080e", 'rx="4"') + rect(1038, 448, 174, 114, "#0b1c2c");
  b += txt(1050, 478, "BIỂU ĐỒ · CHỈNH SỬA", 12, "#cfe8ff") + rect(1050, 492, 130, 5, "#4fe0a0") + rect(1050, 508, 100, 5, "#4fe0a0", 'opacity=".6"') + rect(1050, 524, 120, 5, "#ffd27a", 'opacity=".7"') + rect(1050, 540, 90, 5, "#4fe0a0", 'opacity=".5"');
  b += glow(k, 1120, 500, 110, "#7fc8ff", 0.18);

  // Giá hồ sơ xa
  b += rect(60, 300, 150, 300, "#2f3a46", 'rx="4"') + rect(68, 308, 134, 284, "#10151b");
  for (let i = 0; i < 6; i++) b += rect(80, 322 + i * 44, 110, 34, i % 2 ? "#3a4a5c" : "#4a3a2a", 'rx="2"');

  b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
  for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#06080a", 2, 'opacity=".5"');
  b += rect(0, 726, 1600, 8, "#cfe8ff", 'opacity=".08"') + haze(k, 800, 500, 420, "#4fa0d6", 0.07);
  return frame("Trung tâm điều hành OCC", defs, b);
}

// Một bức tường toa tàu nhìn xiên tới điểm tụ (800, 400): side = -1 bên trái, +1 bên phải; z là độ sâu (1 gần, 18 xa), v là độ cao 0..1
const wx = (side, z) => 800 + side * 800 / z;
const wy = (z, v) => (400 + 909 / z) + ((400 - 218 / z) - (400 + 909 / z)) * v;
const wallQuad = (side, z1, z2, v1, v2) => [[wx(side, z1), wy(z1, v1)], [wx(side, z2), wy(z2, v1)], [wx(side, z2), wy(z2, v2)], [wx(side, z1), wy(z1, v2)]];

// Hai đoàn tàu đỗ hai bên một sân ga đảo (nhìn dọc sân ga): cửa mở, cửa chắn, biển đường 1 / đường 2, camera, cổng ra ở cuối sân ga, Kiên đứng chờ
export function sgMtPlat() {
  const k = "mtp";
  const defs = blurs(k) +
    lin(`${k}-ceil`, [[0, "#0a0e14"], [1, "#222c38"]]) +
    lin(`${k}-floor`, [[0, "#6a727c"], [1, "#2a3038"]]) +
    lin(`${k}-win`, [[0, "#1a2c4a"], [1, "#2a4a6a"]]);
  let b = rect(0, 0, 1600, 900, "#0c1118");
  // Trần hầm và vòm cuối sân ga
  b += poly([[0, 0], [1600, 0], [844, 388], [756, 388]], `url(#${k}-ceil)`);
  b += rect(756, 380, 88, 74, "#05070b") + rect(776, 392, 48, 62, "#1b232c") + glow(k, 800, 420, 60, "#ffd58a", 0.25);
  // Sàn sân ga
  b += poly([[360, 900], [756, 450], [844, 450], [1240, 900]], `url(#${k}-floor)`);
  // Dải vạch vàng dọc hai mép sân ga
  b += poly([[wx(-1, 1.76) + 0, 400 + 909 / 1.76], [wx(-1, 18), 450], [wx(-1, 18) + 3, 450], [wx(-1, 1.76) + 34, 400 + 909 / 1.76]], "#f0c53a", 'opacity=".9"');
  b += poly([[wx(1, 1.76), 400 + 909 / 1.76], [wx(1, 18), 450], [wx(1, 18) - 3, 450], [wx(1, 1.76) - 34, 400 + 909 / 1.76]], "#f0c53a", 'opacity=".9"');
  // Vạch nối tâm sân ga
  for (let z = 2; z < 16; z += 1.6) b += poly([[800 - 40 / z, 400 + 909 / z], [800 + 40 / z, 400 + 909 / z], [800 + 40 / (z + 0.5), 400 + 909 / (z + 0.5)], [800 - 40 / (z + 0.5), 400 + 909 / (z + 0.5)]], "#f0c53a", 'opacity=".3"');
  // Hai bức tường toa tàu: trái là D-05 (đường 1), phải là U-07 (đường 2)
  [[-1, "#33566e", "#d9c27a"], [1, "#2f5a50", "#bfe6d2"]].forEach(([s, body, lite]) => {
    b += poly(wallQuad(s, 1, 18, 0, 1), body);
    b += poly(wallQuad(s, 1, 18, 0.92, 1), "#0e131a");
    // Cửa mở xen cửa sổ
    const doors = [[1.12, 1.6], [2.2, 2.75], [3.7, 4.4], [6.0, 7.0], [9.6, 11.2], [14.5, 17]];
    let prev = 1;
    doors.forEach(([z1, z2]) => {
      if (z1 > prev) b += poly(wallQuad(s, prev + 0.03, z1 - 0.03, 0.42, 0.82), `url(#${k}-win)`);
      b += poly(wallQuad(s, z1, z2, 0.04, 0.9), "#10161e") + poly(wallQuad(s, z1 + 0.04, z2 - 0.04, 0.1, 0.86), lite, 'opacity=".75"');
      prev = z2;
    });
    // Cửa chắn sân ga: khung kính mỏng
    b += poly(wallQuad(s, 1, 18, 0.0, 0.02), "#cfd8e0", 'opacity=".5"');
  });
  // Hai tia sáng hắt từ cửa toa xuống sân ga
  b += glow(k, 460, 800, 160, "#d9c27a", 0.12) + glow(k, 1140, 800, 160, "#bfe6d2", 0.12);

  // Biển treo: đường 1 bên trái, đường 2 bên phải; hộp sơ đồ ga giữa trần
  b += rect(330, 292, 300, 42, "#0b4d3a", 'rx="6"') + txt(480, 322, "← ĐƯỜNG 1 · VỀ BẾN THÀNH", 15, "#f3f1ea", 'text-anchor="middle"');
  b += rect(970, 292, 300, 42, "#0b4d3a", 'rx="6"') + txt(1120, 322, "ĐƯỜNG 2 · VỀ SUỐI TIÊN →", 15, "#f3f1ea", 'text-anchor="middle"');
  b += rect(650, 252, 300, 126, "#0a0f16", 'rx="6"') + rect(658, 260, 284, 110, "#10243a") + txt(800, 286, "GA BA SON · SÂN GA ĐẢO", 14, "#ffd27a", 'text-anchor="middle"');
  b += rect(690, 306, 220, 6, "#c79a3a") + rect(690, 326, 220, 6, "#2f9a74") + rect(690, 346, 220, 14, "#4a5a6c", 'rx="3"');
  b += glow(k, 800, 316, 150, "#4fa0d6", 0.18) + cam(1000, 250);

  // Cổng ra ở cuối sân ga: hai cổng soát vé nhỏ và cầu thang lên
  b += rect(776, 424, 48, 30, "#1b232c") + rect(782, 430, 16, 20, "#3a4a5a") + rect(802, 430, 16, 20, "#3a4a5a") + circle(790, 427, 2.5, "#4fe0a0") + circle(810, 427, 2.5, "#4fe0a0");

  // Cabinet bảng điều khiển cửa chắn sân ga ở mép phải
  b += rect(1060, 560, 100, 240, "#1b232c", 'rx="6"') + rect(1070, 574, 80, 70, "#05080e", 'rx="3"') + rect(1076, 582, 68, 8, "#4fe0a0") + rect(1076, 598, 50, 6, "#ffd27a") + rect(1076, 612, 60, 6, "#4fe0a0", 'opacity=".6"') + circle(1100, 664, 6, "#ff6b5a") + circle(1124, 664, 6, "#4fe08a");

  // Kiên đứng chờ ở giữa sân ga
  b += figure(700, 522, 0.75, { top: "#5a5e68", hair: "short", hc: "#3a3a3a", skin: "#d9ae88", tie: "#2a3a5a", sex: "m" });
  b += glow(k, 800, 780, 300, "#cfe8ff", 0.08) + haze(k, 800, 520, 420, "#4fa0d6", 0.06);
  return frame("Sân ga đảo ga Ba Son, hai đoàn tàu đỗ hai bên", defs, b);
}

// Văn phòng Ban An toàn tầng 3: cửa kính có mưa, bàn Thịnh với xấp hồ sơ, giá hợp đồng, bảng biểu đồ, đầu đọc thẻ ở cửa hành lang, Trang và Phương
export function sgMtOffice() {
  const k = "mtf";
  const defs = blurs(k) +
    lin(`${k}-wall`, [[0, "#2a2f3a"], [1, "#14171e"]]) +
    lin(`${k}-floor`, [[0, "#3a3430"], [1, "#0f0d0b"]]) +
    lin(`${k}-wood`, [[0, "#6a4a2c"], [1, "#2a1a0e"]]) +
    lin(`${k}-sky`, [[0, "#070a1a"], [1, "#222a52"]]);
  let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`) + rect(0, 0, 1600, 50, "#0a0c12") + glow(k, 800, 60, 140, "#ffd27a", 0.2);
  // Cửa sổ lớn nhìn ra sân ga trên cao và đêm mưa
  b += rect(150, 90, 700, 480, `url(#${k}-sky)`) + cityBlur(k, 150, 90, 700, 480);
  b += rect(150, 440, 700, 130, "#10141c", 'opacity=".7"') + line(150, 480, 850, 480, "#2a313a", 4) + line(150, 520, 850, 520, "#2a313a", 4);
  for (let i = 0; i <= 4; i++) b += rect(150 + i * 175 - 4, 90, 8, 480, "#07060c");
  b += rect(150, 86, 700, 10, "#07060c") + rect(150, 566, 700, 12, "#07060c") + streaks(160, 100, 680, 460, 40);

  // Bảng trắng có sơ đồ chặng 2 phút
  b += rect(890, 100, 330, 200, "#e8e2d0", 'rx="4"') + rect(900, 110, 310, 180, "#f6f2e4");
  b += line(920, 190, 1190, 190, "#3a5a4a", 4) + [0, 1, 2, 3, 4].map((i) => circle(920 + i * 67, 190, 7, i === 2 ? "#c0392b" : "#3a5a4a")).join("");
  b += txt(1055, 140, "MỖI CHẶNG 2 PHÚT", 15, "#3b2a1b", 'text-anchor="middle"') + txt(1055, 238, "BT  NH  BS  VT  TC", 13, "#6b5a46", 'text-anchor="middle"') + txt(1055, 268, "Ba Son: hai đoàn gặp nhau 22:04", 12, "#a93226", 'text-anchor="middle"');

  // Bàn Thịnh với xấp hồ sơ và đèn bàn
  b += rect(700, 600, 340, 16, `url(#${k}-wood)`, 'rx="3"') + rect(712, 616, 316, 104, "#1d1209") + rect(740, 606, 240, 8, "#cfe8ff", 'opacity=".25"');
  b += rect(780, 570, 90, 32, "#f3ead2", 'rx="2"') + rect(790, 560, 80, 12, "#e2d6b4", 'rx="2"') + rect(800, 552, 70, 10, "#c9a98a", 'rx="2"') + rect(784, 580, 14, 12, "#a93226", 'opacity=".85"');
  b += rect(930, 592, 28, 10, "#c9a227") + rect(942, 560, 4, 34, "#c9a227") + path("M926 560 Q944 524 970 560 Z", "#f5d27a") + glow(k, 944, 556, 80, "#ffd27a", 0.35);

  // Giá hợp đồng và hồ sơ bên phải
  b += rect(930, 340, 240, 230, "#2f3a46", 'rx="4"') + rect(938, 348, 224, 214, "#10151b");
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) b += rect(946 + c * 36, 358 + r * 68, 28, 60, ["#3a4a5c", "#4a3a2a", "#2f5a50", "#5a3a3a"][(r + c) % 4], 'rx="2"');
  b += rect(1010, 414, 60, 56, "#f3ead2", 'rx="2"') + rect(1016, 422, 48, 4, "#3b2a1b", 'opacity=".6"') + rect(1016, 434, 36, 4, "#3b2a1b", 'opacity=".5"');

  // Cửa hành lang bên phải: đầu đọc thẻ nhấp nháy
  b += rect(1290, 350, 190, 370, "#1a1f27") + rect(1302, 362, 166, 358, "#232a34") + rect(1236, 470, 28, 70, "#0b0e13", 'rx="4"') + circle(1250, 488, 5, "#ffb347") + rect(1243, 504, 14, 20, "#10151b", 'rx="2"');
  b += txt(1385, 410, "HÀNH LANG TẦNG 3", 12, "#cfe8ff", 'text-anchor="middle"') + glow(k, 1250, 488, 50, "#ffb347", 0.25);

  // Trang và Phương đứng ở giữa
  b += figure(400, 470, 1, { top: "#8a7a5a", hair: "short", hc: "#2a1a14", skin: "#f4d6bd", glasses: true, sex: "f" });
  b += figure(580, 470, 1, { top: "#2a2f3a", hair: "bun", hc: "#15110f", skin: "#f1d0b4", glasses: true });
  b += rect(300, 640, 180, 80, "#2a1f17", 'rx="4"') + rect(312, 650, 156, 8, "#9b7a50");

  b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
  for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#06080a", 2, 'opacity=".5"');
  b += haze(k, 700, 500, 420, "#ffd98e", 0.06);
  return frame("Văn phòng Ban An toàn tầng 3 nhà điều hành", defs, b);
}
