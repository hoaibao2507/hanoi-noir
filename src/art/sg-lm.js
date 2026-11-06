/* =====================================================================
   Cảnh vụ s4 "Bốn Giây" (tòa tháp Landmark 81): đài quan sát tầng 81, sảnh tiệc tầng 79, phòng kiểm soát tầng B1,
   văn phòng giám đốc tài chính tầng 66, sân bục tầng 3 (nơi rơi). Phòng giám định dùng lại cảnh sg_lab của vụ s1.
   Dùng bộ đồ nghề trong kit.js. Tọa độ theo khung cảnh gốc 1600×900; sàn trong nhà từ y = 720.
   ===================================================================== */

import { lin, rect, path, circle, line, txt, blurs, glow, haze, frame } from "./kit.js";
import { figure } from "./people.js";

// Camera treo tường: thân, ống kính, đèn đỏ
const cam = (x, y, ok = true) =>
  rect(x - 24, y - 12, 48, 26, "#262a30", 'rx="5"') + circle(x - 24, y, 8, "#0a0c10") + circle(x - 20, y, 4, "#3b6fa0", 'opacity=".8"') + circle(x + 16, y - 6, 3, ok ? "#ff4d4d" : "#3a3a3e");

// Chùm pháo hoa: các tia tỏa ra từ tâm, đầu tia có chấm sáng
function burst(k, x, y, r, col, n = 18) {
  let s = glow(k, x, y, r * 0.9, col, 0.26);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, c = Math.cos(a), d = Math.sin(a);
    s += line((x + c * r * 0.22).toFixed(1), (y + d * r * 0.22).toFixed(1), (x + c * r).toFixed(1), (y + d * r).toFixed(1), col, 3, 'stroke-linecap="round" opacity=".8"') +
      circle((x + c * r).toFixed(1), (y + d * r).toFixed(1), 4, col, 'opacity=".9"');
  }
  return s + circle(x, y, 6, "#fff7e0");
}

// Thành phố nhìn từ trên cao xuống: dải sông tối, các đốm đèn nhà và đường (tọa độ cảnh gốc)
function cityBelow(k, y0, h) {
  let s = rect(0, y0, 1600, h, "#05070f") + path(`M0 ${y0 + 60} C300 ${y0 + 20} 640 ${y0 + 90} 1000 ${y0 + 40} S1500 ${y0 + 30} 1600 ${y0 + 60} L1600 ${y0 + 130} L0 ${y0 + 130} Z`, "#2c5a86", 'opacity=".25"');
  for (let i = 0; i < 130; i++) {
    const x = (i * 197) % 1600, y = y0 + 8 + ((i * 89) % (h - 12));
    s += circle(x, y, 1.4 + (i % 3) * 0.6, i % 5 === 0 ? "#7be6e0" : i % 7 === 0 ? "#ff8f6a" : "#ffd58a", `opacity="${(0.32 + (i % 5) * 0.12).toFixed(2)}"`);
  }
  return s;
}

// Dải mưa phùn (các vạch nghiêng) bọc trong nhóm "rain" để lớp hiệu ứng làm chuyển động
function drizzle(n, op = 0.3) {
  let rain = "";
  for (let i = 0; i < n; i++) {
    const x = (i * 59) % 1600, y = (i * 131) % 900;
    rain += line(x, y, x - 6, y + 22, "#9fc3dd", 1.1, `opacity="${op}" style="animation-delay:-${((i * 0.11) % 1).toFixed(2)}s"`);
  }
  return `<g class="rain">${rain}</g>`;
}

// Đài quan sát ngoài trời tầng 81: lan can phía Đông có mảnh vải trắng, ghế đá có áo vest, cửa D-81, camera trên cột, dải băng của cảnh sát, pháo hoa còn sót
export function sgLmDeck() {
  const k = "lmd";
  const defs = blurs(k) +
    lin(`${k}-sky`, [[0, "#05060f"], [0.6, "#14173a"], [1, "#2a2350"]]) +
    lin(`${k}-deck`, [[0, "#3a4350"], [1, "#0d1118"]]) +
    lin(`${k}-glass`, [[0, "#6fa8c8", 0.12], [1, "#cfe8ff", 0.04]]);
  let b = rect(0, 0, 1600, 900, `url(#${k}-sky)`);
  b += haze(k, 300, 90, 340, "#4a3a8a", 0.45) + haze(k, 1250, 140, 380, "#6a3a7a", 0.35);
  b += burst(k, 420, 190, 120, "#ff6a8a", 20) + burst(k, 1060, 130, 96, "#5fd6ff", 16) + burst(k, 1400, 300, 70, "#ffd45a", 14) + burst(k, 760, 270, 56, "#9aff9a", 12);
  b += cityBelow(k, 470, 190);

  // Sàn đài ướt mưa, ánh đèn viền
  b += path("M0 690 L1600 690 L1600 900 L0 900 Z", `url(#${k}-deck)`) + rect(0, 676, 1600, 14, "#2c333d");
  for (let i = 0; i < 12; i++) b += line(i * 150, 700, i * 150 - 40 + (i % 2) * 20, 900, "#10151c", 2, 'opacity=".5"');
  for (let i = 0; i < 9; i++) b += rect(80 + i * 190, 690, 36, 6, "#ffb347", 'opacity=".8"') + glow(k, 98 + i * 190, 692, 40, "#ffb347", 0.25);

  // Lan can: kính, thanh ray inox, bậu đá; đoạn phía Đông giữa khung có mảnh vải trắng kẹt ở chốt
  b += rect(0, 540, 1600, 130, `url(#${k}-glass)`);
  for (let i = 0; i <= 16; i++) b += rect(i * 100 - 4, 540, 8, 136, "#6c7684") + rect(i * 100 - 6, 534, 12, 8, "#9aa5b3");
  b += rect(0, 530, 1600, 10, "#aeb8c4") + rect(0, 666, 1600, 14, "#68707a");
  b += rect(760, 520, 8, 26, "#aeb8c4") + path("M762 526 l16 8 l-10 14 l-8 -4 z", "#f3f1ea", 'opacity=".95"');
  b += rect(790, 650, 30, 16, "#050608", 'opacity=".4"') + rect(870, 650, 30, 16, "#050608", 'opacity=".4"');
  b += line(640, 560, 1000, 560, "#f4d03a", 4, 'stroke-dasharray="16 10" opacity=".85"') + line(640, 590, 1000, 590, "#f4d03a", 4, 'stroke-dasharray="16 10" opacity=".85"');

  // Cửa cầu thang D-81 bên trái, bảng cấp quyền
  b += rect(50, 360, 280, 330, "#1a1f27") + rect(40, 346, 300, 16, "#2d343f") + rect(100, 430, 170, 260, "#0d1118") + rect(108, 438, 154, 252, "#1d252e");
  b += rect(282, 530, 20, 36, "#0b0e13", 'rx="3"') + circle(292, 544, 4, "#4fe08a") + txt(185, 412, "D-81", 20, "#d9ecef", 'text-anchor="middle" letter-spacing="3"');
  b += rect(340, 450, 120, 100, "#f3ead2", 'rx="3" transform="rotate(-2 400 500)"') + rect(352, 464, 96, 6, "#3b2a1b", 'opacity=".7"') + rect(352, 482, 80, 6, "#3b2a1b", 'opacity=".5"') + rect(352, 500, 90, 6, "#3b2a1b", 'opacity=".5"') + rect(352, 518, 60, 6, "#a93226", 'opacity=".7"');
  b += glow(k, 185, 420, 90, "#ffd58a", 0.3);

  // Ghế đá với áo vest xám gấp gọn và bao thuốc
  b += rect(420, 668, 240, 18, "#5a5f68", 'rx="3"') + rect(430, 686, 16, 24, "#3a3f47") + rect(634, 686, 16, 24, "#3a3f47");
  b += rect(450, 636, 110, 34, "#6c7280", 'rx="5"') + rect(450, 636, 110, 8, "#868c9a", 'rx="4"') + rect(570, 648, 34, 20, "#1b1f26", 'rx="2"') + rect(574, 652, 12, 6, "#c0392b");
  b += rect(460, 626, 30, 12, "#c9a227", 'rx="2"');

  // Cột camera CAM-81 bên phải, đèn cột
  b += rect(1185, 276, 10, 400, "#2a2d36") + cam(1190, 262) + glow(k, 1190, 262, 80, "#ffd58a", 0.2);

  // Cảnh sát đứng canh trên đài, áo mưa xanh
  b += figure(1000, 440, 1, { top: "#2f4a36", hair: "hat", hc: "#2f4a36", skin: "#dfae85" });
  b += drizzle(150, 0.3) + haze(k, 800, 760, 460, "#6fa0c0", 0.06);
  return frame("Đài quan sát ngoài trời tầng 81 tòa Landmark 81", defs, b);
}

// Sảnh tiệc Thiên Hà tầng 79: cửa kính nhìn pháo hoa, sân khấu và bàn MC, bàn kỹ thuật, tháp sâm panh, ba người ở giữa
export function sgLmParty() {
  const k = "lmp";
  const defs = blurs(k) +
    lin(`${k}-sky`, [[0, "#070a1a"], [1, "#2a2450"]]) +
    lin(`${k}-floor`, [[0, "#3a2a22"], [1, "#0f0a08"]]) +
    lin(`${k}-cloth`, [[0, "#f6f1e4"], [1, "#b9b09a"]]);
  let b = rect(0, 0, 1600, 720, "#0e0c16");
  // Cửa kính: trời đêm, pháo hoa, thành phố bên dưới
  b += rect(60, 100, 1480, 560, `url(#${k}-sky)`) + burst(k, 360, 250, 100, "#ff6a8a", 16) + burst(k, 880, 200, 80, "#5fd6ff", 14) + burst(k, 1240, 300, 110, "#ffd45a", 18);
  b += cityBelow(k, 520, 140);
  for (let i = 0; i <= 8; i++) b += rect(60 + i * 185 - 4, 100, 8, 560, "#07060c");
  b += rect(60, 96, 1480, 10, "#07060c") + rect(60, 656, 1480, 12, "#07060c");
  b += drizzle(60, 0.22);
  // Trần, đèn chùm, biển đêm tiệc
  b += rect(0, 0, 1600, 90, "#0a0912") + glow(k, 800, 130, 220, "#ffd98e", 0.3);
  for (let i = 0; i < 9; i++) b += line(800, 60, 800 + (i - 4) * 56, 150 + Math.abs(i - 4) * 6, "#f6e7b8", 2, 'opacity=".7"') + circle(800 + (i - 4) * 56, 152 + Math.abs(i - 4) * 6, 5, "#ffd98e");
  b += rect(300, 190, 560, 54, "#150f22", 'rx="5"') + txt(580, 224, "ĐẾM NGƯỢC · CHÀO NĂM MỚI · THIÊN PHÚ", 19, "#e9c46a", 'text-anchor="middle" letter-spacing="2"');
  b += cam(1010, 195);

  // Tháp sâm panh bên trái và vài bàn tròn
  b += rect(120, 640, 120, 12, "#f4f0e6") + rect(128, 652, 104, 72, `url(#${k}-cloth)`);
  for (let r = 0; r < 4; r++) for (let c = 0; c <= 3 - r; c++) b += rect(150 + r * 14 + c * 28, 626 - r * 14, 14, 14, "#cfe8ff", 'rx="3" opacity=".85"');
  [[560, 662], [1020, 668]].forEach(([x, y]) => { b += `<ellipse cx="${x}" cy="${y}" rx="80" ry="14" fill="#efe9d8"/>` + rect(x - 4, y, 8, 40, "#b9b09a") + circle(x, y - 10, 5, "#ffd27a") + glow(k, x, y - 10, 28, "#ffd27a", 0.4); });

  // Sân khấu bên phải: phông nền, bục MC, bàn máy trạm MC-CONSOLE
  b += rect(1060, 440, 480, 220, "#1a1230") + rect(1060, 440, 480, 8, "#e9c46a", 'opacity=".5"') + rect(1040, 660, 520, 60, "#2a1a30");
  b += rect(1080, 480, 70, 150, "#4a2f1c", 'rx="3"') + rect(1070, 470, 90, 12, "#6a4326") + rect(1110, 440, 4, 32, "#2a2e36") + circle(1112, 438, 5, "#2a2e36");
  b += rect(1190, 560, 210, 14, "#9fa9b2", 'rx="3"') + rect(1200, 574, 190, 86, "#1b232c") + rect(1230, 490, 110, 70, "#05080e", 'rx="3"') + rect(1236, 496, 98, 58, "#0b1c2c") + glow(k, 1285, 520, 70, "#7fc8ff", 0.25);
  b += rect(1244, 504, 40, 5, "#4fe0a0") + rect(1244, 516, 60, 4, "#4fe0a0", 'opacity=".6"') + rect(1244, 528, 50, 4, "#4fe0a0", 'opacity=".6"') + path("M1190 600 Q1160 640 1130 680", "none", 'stroke="#05080e" stroke-width="5"');

  // Bàn kỹ thuật âm thanh ở giữa phải
  b += rect(810, 596, 220, 14, "#9fa9b2", 'rx="3"') + rect(820, 610, 200, 70, "#1b232c");
  for (let i = 0; i < 8; i++) b += rect(830 + i * 22, 600, 8, 10, "#10151b") + rect(832 + i * 22, 596 - (i * 5) % 14, 4, 10, i % 3 ? "#ffd27a" : "#4fe0a0");

  // Ba người ở giữa: Hào, Diệp, Vũ
  b += figure(410, 470, 1, { top: "#2a2230", hair: "bald", hc: "#bbb", skin: "#d9ae88", tie: "#b3202a", sex: "m" });
  b += figure(650, 470, 1, { top: "#1d3a40", hair: "bun", hc: "#15110f", skin: "#f1d0b4", glasses: true });
  b += figure(900, 470, 1, { top: "#1b1f2b", hair: "short", hc: "#2a1e16", skin: "#dfae85" });

  b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
  for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#0b0705", 2, 'opacity=".5"');
  b += glow(k, 800, 780, 260, "#ffd98e", 0.1) + haze(k, 800, 460, 460, "#6a5aa0", 0.07);
  return frame("Sảnh tiệc Thiên Hà tầng 79", defs, b);
}

// Phòng kiểm soát tầng B1: tường màn hình camera (có màn hình hành lang tầng 78), camera phòng, tổng đài nhật ký cửa, bảng điều khiển thang T9, Thắm ngồi trực
export function sgLmOps() {
  const k = "lmo";
  const defs = blurs(k) +
    lin(`${k}-wall`, [[0, "#222c36"], [1, "#10151b"]]) +
    lin(`${k}-floor`, [[0, "#323a44"], [1, "#0e1217"]]) +
    lin(`${k}-desk`, [[0, "#9fa9b2"], [1, "#4a5560"]]);
  let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`) + rect(0, 0, 1600, 36, "#080b0f");
  for (let x = 160; x < 1500; x += 260) b += rect(x - 70, 40, 140, 10, "#e8f2ff", 'rx="4" opacity=".9"') + glow(k, x, 54, 100, "#e8f2ff", 0.2);

  // Tường màn hình camera 4x3, ô giữa là hành lang tầng 78 có hai người
  b += rect(640, 96, 600, 300, "#05080e", 'rx="6"');
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const x = 650 + c * 146, y = 106 + r * 96;
    b += rect(x, y, 140, 90, ["#12304a", "#1c3a2c", "#2a2a40", "#33281c"][(r + c) % 4]) + rect(x + 20 + (c * 9) % 40, y + 40, 22, 36, "#6a7a8a", 'opacity=".5"');
  }
  b += rect(796, 202, 140, 90, "#10202c") + rect(800, 246, 132, 36, "#2a3a48") + circle(836, 236, 7, "#d9a77c") + rect(828, 244, 16, 30, "#3a3f55") + circle(890, 238, 7, "#cfc3a8") + rect(882, 246, 16, 30, "#2a2a30");
  b += glow(k, 940, 250, 300, "#4fd6c6", 0.1) + cam(560, 210);

  // Bàn trực bên trái, Thắm ngồi trước màn hình, hộp cơm
  b += rect(250, 610, 300, 18, `url(#${k}-desk)`, 'rx="3"') + rect(262, 628, 276, 92, "#1b232c") + rect(250, 560, 150, 52, "#05080e", 'rx="3"') + rect(256, 566, 138, 40, "#0b1c2c");
  b += figure(420, 520, 1, { top: "#2e4b78", hair: "long", hc: "#2b1b14", skin: "#e9c09b", seated: true });
  b += rect(480, 596, 56, 14, "#e8e2d0", 'rx="2"') + circle(500, 602, 4, "#c0392b");

  // Bảng điều khiển với nhật ký cửa (dòng D-81 bị mở từ xa)
  b += rect(900, 590, 320, 20, `url(#${k}-desk)`, 'rx="3"') + rect(910, 610, 300, 110, "#1b232c") + rect(910, 610, 300, 6, "#000", 'opacity=".3"');
  b += rect(960, 430, 170, 130, "#05080e", 'rx="4"') + rect(968, 438, 154, 114, "#0b1c2c");
  [["D-81", "REMOTE OPEN", "#ffd27a"], ["D-80S", "LOCKED", "#4fe08a"], ["T9", "80F", "#4fe08a"], ["QR-G-0417", "OK", "#4fe08a"]].forEach(([a, st, col], i) => {
    b += txt(976, 462 + i * 24, a, 12, "#cfe8ff", "") + txt(1112, 462 + i * 24, st, 11, col, 'text-anchor="end"');
  });
  b += glow(k, 1045, 490, 110, "#7fc8ff", 0.2);

  // Bảng điều khiển thang T9: dải đèn tải trọng và đồng hồ kg
  b += rect(1170, 340, 200, 290, "#2a313a", 'rx="6"') + rect(1182, 352, 176, 90, "#05080e", 'rx="4"') + txt(1270, 412, "84 KG", 40, "#ffd27a", 'text-anchor="middle"');
  for (let i = 0; i < 10; i++) b += rect(1190 + i * 17, 460, 12, 40, i < 6 ? "#4fe08a" : "#3a424c", 'rx="2"');
  b += rect(1190, 520, 160, 30, "#10151b", 'rx="4"') + txt(1270, 542, "T9 · TẢI TRỌNG", 14, "#cfe8ff", 'text-anchor="middle"');
  b += rect(1190, 570, 74, 40, "#10151b", 'rx="4"') + circle(1227, 590, 8, "#ff6b5a") + rect(1276, 570, 74, 40, "#10151b", 'rx="4"') + circle(1313, 590, 8, "#4fe08a");

  // Giá hồ sơ bên trái xa
  b += rect(60, 300, 150, 300, "#2f3a46", 'rx="4"') + rect(68, 308, 134, 284, "#10151b");
  for (let i = 0; i < 6; i++) b += rect(80, 322 + i * 44, 110, 34, i % 2 ? "#3a4a5c" : "#4a3a2a", 'rx="2"');

  b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
  for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#06080a", 2, 'opacity=".5"');
  b += rect(0, 726, 1600, 8, "#f4d03a", 'opacity=".12"') + haze(k, 700, 500, 420, "#cfe8ff", 0.06);
  return frame("Phòng kiểm soát tầng hầm B1", defs, b);
}

// Văn phòng giám đốc tài chính tầng 66: cửa kính nhìn thành phố, bàn có tấm kính và đèn, bàn máy tính của phòng Nhân sự, máy in, tủ hồ sơ, Trang đứng chờ
export function sgLmOffice() {
  const k = "lmf";
  const defs = blurs(k) +
    lin(`${k}-wall`, [[0, "#2a2f3a"], [1, "#14171e"]]) +
    lin(`${k}-floor`, [[0, "#3a2c22"], [1, "#0f0b08"]]) +
    lin(`${k}-wood`, [[0, "#6a4a2c"], [1, "#2a1a0e"]]) +
    lin(`${k}-sky`, [[0, "#070a1a"], [1, "#222a52"]]);
  let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`);
  // Cửa kính nhìn xuống thành phố, một chùm pháo hoa xa
  b += rect(150, 90, 900, 500, `url(#${k}-sky)`) + burst(k, 520, 210, 70, "#ffd45a", 14) + cityBelow(k, 440, 150);
  for (let i = 0; i <= 5; i++) b += rect(150 + i * 180 - 4, 90, 8, 500, "#07060c");
  b += rect(150, 86, 900, 10, "#07060c") + rect(150, 586, 900, 12, "#07060c");
  b += drizzle(40, 0.2);
  b += rect(0, 0, 1600, 50, "#0a0c12") + glow(k, 820, 60, 120, "#ffd27a", 0.2);

  // Bàn Khang ở giữa: mặt bàn gỗ, tấm kính, đèn bàn, ảnh nhỏ
  b += rect(700, 610, 280, 16, `url(#${k}-wood)`, 'rx="3"') + rect(712, 626, 256, 94, "#1d1209") + rect(740, 616, 200, 8, "#cfe8ff", 'opacity=".35"');
  b += rect(720, 600, 60, 8, "#c9a227") + rect(748, 560, 4, 40, "#c9a227") + path("M730 560 Q750 520 780 560 Z", "#f5d27a") + glow(k, 750, 560, 80, "#ffd27a", 0.35);
  b += rect(920, 592, 26, 22, "#e8e2d0", 'rx="2"') + rect(924, 596, 18, 14, "#c9a98a");

  // Bàn nhỏ và máy tính xách tay của phòng Nhân sự, hộp lưu trữ nhấp nháy đèn
  b += rect(540, 600, 200, 14, `url(#${k}-wood)`, 'rx="3"') + rect(556, 614, 12, 106, "#2a1a0e") + rect(710, 614, 12, 106, "#2a1a0e");
  b += rect(580, 450, 110, 84, "#05080e", 'rx="3"') + rect(586, 456, 98, 72, "#0b1c2c") + rect(600, 470, 40, 32, "#f4c78a") + circle(620, 482, 7, "#e9c09b") + rect(650, 470, 26, 5, "#cfe8ff", 'opacity=".6"') + rect(650, 482, 20, 5, "#cfe8ff", 'opacity=".4"');
  b += path("M570 534 L700 534 L716 600 L554 600 Z", "#1d2129") + rect(620, 570, 60, 14, "#10151b", 'rx="2"') + circle(632, 577, 3, "#4fe08a") + circle(644, 577, 3, "#ffb347");
  b += glow(k, 640, 490, 70, "#7fc8ff", 0.25);

  // Máy in có xấp giấy và bàn đỡ bên phải
  b += rect(1040, 610, 220, 12, `url(#${k}-wood)`, 'rx="3"') + rect(1054, 622, 12, 98, "#2a1a0e") + rect(1234, 622, 12, 98, "#2a1a0e");
  b += rect(1060, 520, 150, 90, "#3a424c", 'rx="6"') + rect(1070, 530, 130, 14, "#10151b", 'rx="2"') + circle(1190, 570, 4, "#4fe08a") + rect(1078, 548, 90, 5, "#1b232c");
  b += rect(1090, 584, 100, 26, "#f3ead2", 'rx="2"') + rect(1100, 580, 80, 4, "#b9b09a") + rect(1086, 596, 18, 12, "#c0392b", 'opacity=".8"');

  // Tủ hồ sơ bên phải: ngăn dưới cùng hé mở
  b += rect(1250, 460, 130, 260, "#2f3a46", 'rx="4"') + rect(1258, 468, 114, 244, "#10151b");
  for (let i = 0; i < 4; i++) b += rect(1264, 476 + i * 58, 102, 52, "#3a4a5c", 'rx="3"') + rect(1304, 500 + i * 58, 22, 6, "#c9a227");
  b += rect(1264, 650, 102, 52, "#3a4a5c", 'rx="3"') + rect(1270, 648, 90, 10, "#f3ead2") + rect(1276, 644, 78, 8, "#c9a98a");

  // Trang đứng chờ ở bên trái
  b += figure(400, 470, 1, { top: "#8a7a5a", hair: "short", hc: "#2a1a14", skin: "#f4d6bd", glasses: true, sex: "f" });
  b += rect(310, 600, 150, 120, "#2a1f17", 'rx="4"') + rect(320, 610, 130, 8, "#9b7a50");

  b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
  for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#0a0705", 2, 'opacity=".5"');
  b += glow(k, 800, 790, 260, "#ffd27a", 0.08) + haze(k, 700, 460, 460, "#4a5aa0", 0.07);
  return frame("Văn phòng giám đốc tài chính tầng 66", defs, b);
}

// Sân bục tầng 3 dưới chân tháp: tường kính cao vút, tấm bạt xanh trên nền đá, băng cảnh sát, xe cứu thương, Ngân ngồi trên ghế quấn chăn, camera trên cột
export function sgLmGround() {
  const k = "lmg";
  const defs = blurs(k) +
    lin(`${k}-sky`, [[0, "#05060f"], [1, "#1c1f44"]]) +
    lin(`${k}-stone`, [[0, "#3a4250"], [1, "#0d1118"]]) +
    lin(`${k}-tower`, [[0, "#1a2a44"], [1, "#0b1424"]]);
  let b = rect(0, 0, 1600, 900, `url(#${k}-sky)`);
  b += burst(k, 1020, 180, 120, "#ff6a8a", 20) + burst(k, 1360, 120, 86, "#5fd6ff", 16) + burst(k, 720, 100, 60, "#ffd45a", 12);

  // Thân tháp ở bên trái: tường kính cao vút, các tầng đèn, mũi nhọn lên trời
  b += path("M0 0 L480 0 L520 640 L0 640 Z", `url(#${k}-tower)`);
  for (let i = 0; i < 26; i++) b += line(i * 20, 0, i * 20 + (i * 20) * 0.08, 640, "#6a86a8", 1, 'opacity=".25"');
  for (let r = 0; r < 18; r++) for (let c = 0; c < 9; c++) if ((r * 7 + c * 3) % 5 < 3) b += rect(14 + c * 52 + r * 1.8, 20 + r * 34, 34, 14, (r + c) % 4 ? "#ffd58a" : "#7be6e0", 'opacity=".25"');
  b += glow(k, 200, 300, 260, "#4fd6c6", 0.12);

  // Sân bục lát đá ướt, vạch cảnh sát
  b += path("M0 630 L1600 630 L1600 900 L0 900 Z", `url(#${k}-stone)`) + rect(0, 620, 1600, 12, "#2c333d");
  for (let i = -6; i <= 14; i++) b += line(800 + i * 90, 640, 800 + i * 260, 900, "#10151c", 2, 'opacity=".5"');
  b += line(300, 700, 1100, 700, "#f4d03a", 3, 'stroke-dasharray="14 8" opacity=".8"') + line(300, 770, 1100, 770, "#f4d03a", 3, 'stroke-dasharray="14 8" opacity=".8"');

  // Tấm bạt xanh trùm lên thi thể
  b += path("M780 700 Q820 622 900 624 Q980 628 1010 700 Q980 724 900 724 Q820 724 780 700 Z", "#2c5d86") + path("M800 696 Q840 650 900 650", "none", 'stroke="#5a8fb8" stroke-width="3" opacity=".6"');
  b += rect(1020, 686, 22, 26, "#f4d03a", 'rx="2"') + txt(1031, 705, "1", 15, "#1b1f26", 'text-anchor="middle"');

  // Điện thoại vỡ trên nền đá với biển số vật chứng
  b += rect(1010, 726, 24, 36, "#1b1f26", 'rx="3" transform="rotate(14 1022 744)"') + path("M1014 732 L1030 748 M1030 732 L1014 752", "none", 'stroke="#7fc8ff" stroke-width="1.5" opacity=".8"');
  b += rect(1050, 748, 20, 26, "#f4d03a", 'rx="2"') + txt(1060, 766, "2", 14, "#1b1f26", 'text-anchor="middle"');

  // Ngân ngồi trên ghế, quấn chăn cảnh sát, túi vật chứng trên bàn nhỏ
  b += rect(310, 666, 240, 14, "#5a5f68", 'rx="3"') + rect(322, 680, 14, 36, "#3a3f47") + rect(524, 680, 14, 36, "#3a3f47");
  b += figure(430, 520, 1, { top: "#6b6f7a", hair: "long", hc: "#2a1a14", skin: "#efc9a7", seated: true });
  b += path("M380 600 Q430 580 480 604 L488 664 L372 664 Z", "#c8b99a", 'opacity=".95"') + path("M392 616 L470 624", "none", 'stroke="#a39275" stroke-width="3"');
  b += rect(600, 650, 90, 12, "#9fa9b2", 'rx="2"') + rect(612, 662, 10, 56, "#59636f") + rect(668, 662, 10, 56, "#59636f");
  b += rect(620, 626, 50, 26, "#cfe8ff", 'opacity=".45" rx="3"') + rect(628, 634, 16, 24, "#1b1f26", 'rx="3"') + rect(676, 636, 8, 12, "#c0392b");

  // Xe cứu thương và đèn quay ở xa bên phải, cột camera
  b += rect(1290, 560, 280, 130, "#e8e2d0", 'rx="12"') + rect(1500, 580, 70, 66, "#cfe8ff", 'opacity=".6"') + rect(1290, 626, 280, 18, "#c0392b") + circle(1350, 700, 30, "#1b1f26") + circle(1520, 700, 30, "#1b1f26");
  b += rect(1380, 548, 60, 12, "#c0392b") + rect(1450, 548, 40, 12, "#2c5d86") + glow(k, 1410, 550, 60, "#ff5a5a", 0.4) + glow(k, 1470, 550, 50, "#5a9aff", 0.4);
  b += rect(1165, 276, 10, 350, "#2a2d36") + cam(1170, 262) + glow(k, 1170, 262, 80, "#ffd58a", 0.2);

  // Cảnh sát đứng canh
  b += figure(1130, 450, 1, { top: "#2f4a36", hair: "hat", hc: "#2f4a36", skin: "#dfae85" });
  b += drizzle(120, 0.3) + haze(k, 850, 720, 480, "#6fa0c0", 0.08);
  return frame("Sân bục tầng 3 dưới chân tòa Landmark 81", defs, b);
}
