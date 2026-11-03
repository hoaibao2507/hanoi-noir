/* =====================================================================
   Cảnh vụ s2 "Mực Chưa Khô" (Vani Ecommerce): cổng và chốt bảo vệ, văn phòng, phòng giám đốc, xưởng in kèm kho mực, hẻm sau và cửa hậu.
   Phòng giám định dùng lại cảnh sg_lab của vụ s1. Dùng bộ đồ nghề trong kit.js và các hàm vẽ phố trong sg.js.
   ===================================================================== */

import { lin, rect, path, circle, line, txt, blurs, glow, haze, frame } from "./kit.js";
import { figure } from "./people.js";
import { sgHouse, wires } from "./sg.js";

// Camera treo tường: thân, ống kính, đèn đỏ
const cam = (x, y) =>
  rect(x - 24, y - 12, 48, 26, "#262a30", 'rx="5"') + circle(x - 24, y, 8, "#0a0c10") + circle(x - 20, y, 4, "#3b6fa0", 'opacity=".8"') + circle(x + 16, y - 6, 3, "#ff4d4d");

// Cổng chính và chốt bảo vệ ban đêm trên đường Võ Văn Hát: tường xưởng hai tầng, biển hiệu neon, thanh chắn, sơ đồ mặt bằng
export function sgVaniGate() {
  const k = "vgt";
  const defs = blurs(k) +
    lin(`${k}-sky`, [[0, "#070b18"], [1, "#2a2448"]]) +
    lin(`${k}-wall`, [[0, "#3a4452"], [1, "#1c232c"]]) +
    lin(`${k}-road`, [[0, "#2a303c"], [1, "#0b0e14"]]);
  let b = rect(0, 0, 1600, 900, `url(#${k}-sky)`);
  for (let i = 0; i < 24; i++) b += circle((i * 467) % 1600, (i * 113) % 200, 1.3, "#fff1d0", 'opacity=".5"');
  b += sgHouse(k, 20, 600, 150, 300, { wall: "#2c2a48", seed: 1 }) + sgHouse(k, 190, 600, 130, 240, { wall: "#33284a", seed: 2, neon: "#3fd6c6" });
  b += wires(110, 3);

  // Nhà xưởng Vani: tường hai tầng, hàng cửa sổ văn phòng, biển hiệu, cửa cuốn, bảng sơ đồ, cửa phụ
  b += rect(900, 190, 700, 530, `url(#${k}-wall)`) + rect(890, 176, 720, 22, "#161b22");
  for (let i = 0; i < 5; i++) b += rect(940 + i * 130, 236, 96, 70, "#ffd27a", 'opacity=".8"') + line(988 + i * 130, 236, 988 + i * 130, 306, "#1a1f27", 3);
  b += rect(1010, 330, 480, 74, "#0b1118", 'rx="8"') + txt(1250, 382, "VANI ECOMMERCE", 38, "#7be6e0", 'text-anchor="middle" letter-spacing="6"') + glow(k, 1250, 370, 240, "#3fd6c6", 0.22);
  b += rect(960, 470, 260, 250, "#262d38");
  for (let i = 0; i < 12; i++) b += line(960, 482 + i * 20, 1220, 482 + i * 20, "#151a22", 3);
  b += rect(1250, 440, 130, 150, "#e8e2d0", 'rx="3"') + rect(1250, 440, 130, 14, "#8e2232") + txt(1315, 470, "SƠ ĐỒ", 12, "#3b2a1b", 'text-anchor="middle"');
  b += rect(1268, 482, 40, 30, "#c9b98a") + rect(1318, 482, 46, 30, "#c9b98a") + rect(1268, 524, 96, 36, "#c9b98a") + line(1290, 560, 1290, 580, "#b33", 2);
  b += rect(1420, 500, 110, 220, "#10151c") + rect(1430, 510, 90, 200, "#1b222c");
  b += cam(930, 280);

  // Cổng trượt và thanh chắn
  b += rect(40, 420, 440, 300, "#0d1218", 'opacity=".7"') + rect(36, 410, 448, 12, "#59636f");
  for (let i = 0; i < 15; i++) b += line(58 + i * 28, 422, 58 + i * 28, 720, "#59636f", 4);
  b += rect(480, 560, 60, 10, "#e8e8e8") + rect(480, 560, 20, 10, "#d94a4a") + rect(500, 560, 20, 10, "#d94a4a") + rect(530, 520, 14, 200, "#2a2d36");
  b += txt(260, 400, "59 VÕ VĂN HÁT", 20, "#d9ecef", 'text-anchor="middle" letter-spacing="3"');

  // Chốt bảo vệ: cửa sổ sáng, màn hình, bác Sáu ngồi sau bàn
  b += rect(560, 320, 400, 400, "#202a35") + rect(548, 304, 424, 20, "#0e131a") + txt(760, 352, "BẢO VỆ", 22, "#ffd27a", 'text-anchor="middle" letter-spacing="4"');
  b += rect(586, 372, 348, 230, "#0d1a22") + rect(594, 380, 332, 214, "#27414c") + glow(k, 760, 400, 160, "#cfe8ff", 0.2);
  b += rect(620, 396, 80, 54, "#06090d", 'rx="3"') + rect(626, 402, 68, 40, "#12384a") + rect(800, 396, 90, 54, "#06090d", 'rx="3"') + rect(806, 402, 78, 40, "#12384a");
  b += figure(760, 410, 1, { top: "#2c5d86", hair: "hat", hc: "#2c5d86", skin: "#d2a074", seated: true, mustache: true });
  b += rect(594, 540, 332, 14, "#a67c52") + rect(600, 554, 320, 48, "#2c1d10") + rect(690, 520, 70, 22, "#10161a", 'rx="3"');

  // Đèn đường và mặt đường ẩm
  b += rect(458, 220, 12, 500, "#2a2d36") + rect(430, 214, 66, 10, "#2a2d36") + glow(k, 462, 232, 80, "#ffd58a", 0.45);
  b += rect(0, 720, 1600, 180, `url(#${k}-road)`);
  for (let i = 0; i < 14; i++) b += path(`M${(i * 211) % 1600} ${760 + ((i * 47) % 120)} q26 -6 52 0`, "none", 'stroke="#a8c8f0" stroke-width="2" opacity=".15"');
  b += rect(430, 724, 70, 170, "#ffd58a", 'opacity=".06"') + rect(1230, 724, 200, 170, "#3fd6c6", 'opacity=".05"');
  return frame("Cổng chính Vani Ecommerce", defs, b);
}

// Văn phòng tầng 1: bàn thiết kế của Trang, góc kế toán của Ngân, bàn Vũ, tủ nhân sự, màn hình doanh số, camera trần
export function sgVaniOffice() {
  const k = "vof";
  const defs = blurs(k) +
    lin(`${k}-wall`, [[0, "#2b3340"], [1, "#151a22"]]) +
    lin(`${k}-floor`, [[0, "#3a3f48"], [1, "#12151a"]]) +
    lin(`${k}-desk`, [[0, "#b99a72"], [1, "#4a3622"]]) +
    lin(`${k}-glass`, [[0, "#13203a"], [1, "#2b3b63"]]);
  let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`) + rect(0, 0, 1600, 38, "#0a0d12");
  for (let x = 160; x < 1600; x += 300) b += rect(x - 70, 40, 140, 10, "#e8f2ff", 'rx="4" opacity=".9"') + glow(k, x, 54, 110, "#e8f2ff", 0.22);

  // Cửa kính nhìn xuống xưởng bên trái, màn hình doanh số trên tường
  b += rect(60, 110, 230, 410, "#05070f") + rect(70, 120, 210, 390, `url(#${k}-glass)`) + line(175, 120, 175, 510, "#0a0d14", 6) + glow(k, 175, 400, 80, "#3fd6c6", 0.2);
  b += rect(380, 84, 400, 150, "#05080e", 'rx="8"') + rect(390, 94, 380, 130, "#0a1a2c");
  b += path("M404 210 L460 170 L520 188 L590 140 L650 150 L750 110", "none", 'stroke="#4fd6c6" stroke-width="4"') + txt(580, 122, "BLACK FRIDAY · 14.000 ĐƠN", 15, "#ffd27a", 'text-anchor="middle" letter-spacing="1"');
  b += cam(850, 200);

  // Trang ở bàn thiết kế: màn hình lớn hiện bản vẽ mưa, bảng vẽ
  b += figure(330, 400, 1, { top: "#e0a31f", hair: "bun", hc: "#7a3b2e", skin: "#f4d6bd", seated: true, scarf: "#d94a6a" });
  b += rect(220, 586, 270, 20, "#b99a72", 'rx="3"') + rect(236, 606, 238, 114, `url(#${k}-desk)`) + rect(236, 606, 238, 6, "#000", 'opacity=".25"');
  b += rect(270, 490, 170, 96, "#05080e", 'rx="4"') + rect(278, 498, 154, 80, "#12284a");
  for (let i = 0; i < 9; i++) b += line(290 + i * 16, 504, 282 + i * 16, 570, "#7fc8ff", 2, 'opacity=".55"');
  b += glow(k, 355, 540, 90, "#7fc8ff", 0.25) + rect(446, 570, 36, 14, "#222a33", 'rx="3"');

  // Ngân ở góc tài chính, hóa đơn chất đống trên bàn
  b += figure(560, 410, 1, { top: "#7a4a8a", hair: "long", hc: "#16110e", skin: "#f2d2b6", seated: true });
  b += rect(470, 590, 290, 20, "#b99a72", 'rx="3"') + rect(486, 610, 260, 110, `url(#${k}-desk)`) + rect(486, 610, 260, 6, "#000", 'opacity=".25"');
  b += rect(600, 540, 80, 50, "#05080e", 'rx="3"') + rect(606, 546, 68, 36, "#1c4a3a");
  [[660, 568], [690, 572], [712, 566]].forEach(([x, y], i) => { b += rect(x, y, 56, 22, i % 2 ? "#f3ead2" : "#e8dcc0", `transform="rotate(${i * 4 - 4} ${x} ${y})"`); });
  b += rect(512, 566, 40, 22, "#d9d9e0", 'rx="3"');

  // Bàn của Vũ: hai màn hình, Vũ đứng cạnh
  b += figure(1030, 380, 1, { top: "#4a4f66", hair: "short", hc: "#1f1a17", skin: "#e8bf98", glasses: true });
  b += rect(900, 600, 270, 20, "#b99a72", 'rx="3"') + rect(916, 620, 238, 100, `url(#${k}-desk)`) + rect(916, 620, 238, 6, "#000", 'opacity=".25"');
  b += rect(930, 520, 100, 76, "#05080e", 'rx="3"') + rect(936, 526, 88, 62, "#14304a") + rect(1046, 520, 100, 76, "#05080e", 'rx="3"') + rect(1052, 526, 88, 62, "#1a3a2a");

  // Tủ hồ sơ nhân sự
  b += rect(1230, 320, 140, 400, "#3a4452", 'rx="4"') + rect(1240, 300, 120, 22, "#1b222c") + txt(1300, 318, "NHÂN SỰ", 13, "#ffd27a", 'text-anchor="middle" letter-spacing="2"');
  for (let i = 0; i < 4; i++) b += rect(1244, 336 + i * 90, 112, 78, "#4a5666", 'rx="3"') + rect(1284, 366 + i * 90, 32, 8, "#c9a227", 'rx="2"');
  b += rect(1440, 560, 40, 160, "#2d2a28", 'rx="6"') + path("M1460 560 Q1424 480 1444 440 Q1464 490 1480 460 Q1494 520 1460 560 Z", "#2f7d4f");

  b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
  for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#0b0d10", 2, 'opacity=".5"');
  b += haze(k, 800, 460, 420, "#e8f2ff", 0.07);
  return frame("Văn phòng tầng 1", defs, b);
}

// Phòng giám đốc: cửa sổ nhìn ra sân xưởng, bàn lớn có khung ảnh hai bé gái và đèn bàn, tủ pháp lý, kệ cúp bán hàng
export function sgVaniCeo() {
  const k = "vce";
  const defs = blurs(k) +
    lin(`${k}-wall`, [[0, "#2e2824"], [1, "#16110e"]]) +
    lin(`${k}-floor`, [[0, "#4a3426"], [1, "#150e09"]]) +
    lin(`${k}-desk`, [[0, "#8a5e3a"], [1, "#2e1c0e"]]) +
    lin(`${k}-night`, [[0, "#070b18"], [1, "#26304f"]]);
  let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`) + rect(0, 0, 1600, 36, "#0c0a08");

  // Cửa sổ nhìn xuống sân xưởng, vài chấm đèn
  b += rect(80, 100, 440, 400, "#05070f") + rect(90, 110, 420, 380, `url(#${k}-night)`) + line(300, 110, 300, 490, "#0a0d14", 8) + line(90, 300, 510, 300, "#0a0d14", 8);
  for (let i = 0; i < 7; i++) b += circle(120 + i * 60, 440 + (i % 2) * 14, 3, "#ffd27a", 'opacity=".6"');
  b += rect(90, 450, 420, 40, "#0d1a30", 'opacity=".8"');

  // Hình dán và bảng vinh danh trên tường
  b += rect(600, 120, 320, 170, "#1b1410", 'rx="4"') + rect(610, 130, 300, 150, "#2a2018") + txt(760, 180, "AMAZON TOP SELLER", 22, "#f1c453", 'text-anchor="middle" letter-spacing="3"') + txt(760, 224, "VANI · 3 NĂM LIÊN TIẾP", 15, "#d9c37a", 'text-anchor="middle" letter-spacing="2"');
  b += rect(1000, 160, 120, 150, "#f3ead2", 'rx="3"') + circle(1040, 210, 16, "#f2c94c") + circle(1084, 210, 16, "#ff8fab") + path("M1020 270 Q1060 240 1100 270", "none", 'stroke="#c0392b" stroke-width="4"') + txt(1060, 296, "VÂN · NI", 13, "#7a4a1a", 'text-anchor="middle"');

  // Kệ cúp và tủ hồ sơ pháp lý bên phải
  b += rect(1180, 240, 260, 12, "#5a432c") + rect(1210, 200, 20, 40, "#c9a227", 'rx="3"') + rect(1260, 190, 24, 50, "#d8b84a", 'rx="3"') + rect(1320, 205, 20, 35, "#c9a227", 'rx="3"');
  b += rect(1230, 330, 150, 390, "#4a3a2a", 'rx="4"') + txt(1305, 356, "PHÁP LÝ", 13, "#ffd27a", 'text-anchor="middle" letter-spacing="2"');
  for (let i = 0; i < 3; i++) b += rect(1244, 372 + i * 106, 122, 92, "#5a4632", 'rx="3"') + rect(1290, 412 + i * 106, 30, 8, "#c9a227", 'rx="2"');

  // Bàn lớn: khung ảnh, sổ tay mở, đèn bàn có mẩu giấy dưới chân
  b += rect(640, 580, 560, 20, "#b88a5a", 'rx="4"') + rect(660, 600, 520, 120, `url(#${k}-desk)`) + rect(660, 600, 520, 6, "#000", 'opacity=".25"');
  b += rect(740, 530, 60, 50, "#1b1410", 'rx="3"') + rect(746, 536, 48, 38, "#d9c3a0") + circle(762, 552, 8, "#f2c94c") + circle(780, 552, 8, "#ff8fab") + rect(760, 566, 24, 8, "#8e2232");
  b += rect(850, 560, 110, 20, "#f3ead2", 'rx="2"') + line(860, 568, 940, 568, "#9a8a60", 2) + rect(965, 566, 40, 12, "#2a2e36", 'rx="2"');
  b += rect(1040, 570, 46, 10, "#2a2e36", 'rx="3"') + rect(1060, 486, 6, 86, "#2a2e36") + path("M1026 488 Q1063 450 1100 488 Z", "#d9c37a") + glow(k, 1063, 500, 90, "#ffd27a", 0.45);
  b += rect(1030, 574, 30, 8, "#e9d73a", 'opacity=".9"');
  b += rect(800, 640, 70, 80, "#1c1a22", 'rx="10"') + rect(340, 700, 560, 120, "#3a1e2c", 'opacity=".5"');

  b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
  for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#0b0705", 2, 'opacity=".5"');
  b += glow(k, 1063, 500, 180, "#ffd27a", 0.14) + haze(k, 700, 420, 420, "#4a3a90", 0.08);
  return frame("Phòng giám đốc", defs, b);
}

// Xưởng in: máy in DTG và DTF, lò sấy hầm, giá áo, cửa sổ nhà ăn có camera, kho mực ở cuối xưởng được khoanh băng vàng
export function sgVaniPrint() {
  const k = "vpr";
  const defs = blurs(k) +
    lin(`${k}-wall`, [[0, "#2c3640"], [1, "#12171d"]]) +
    lin(`${k}-floor`, [[0, "#3a4048"], [1, "#101317"]]) +
    lin(`${k}-mach`, [[0, "#d7dde2"], [1, "#7e8a94"]]);
  let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`) + rect(0, 0, 1600, 150, "#0c1015");
  for (let x = 160; x < 1600; x += 260) b += rect(x - 80, 120, 160, 10, "#e8f2ff", 'rx="4" opacity=".9"') + glow(k, x, 126, 110, "#e8f2ff", 0.24);
  for (let i = 0; i < 3; i++) b += rect(0, 40 + i * 24, 1600, 8, "#2b343c");

  // Giá áo treo bên trái, biển nhà ăn
  b += rect(90, 270, 220, 8, "#59636f");
  [["#e8e2d0", 106], ["#c24a4a", 150], ["#3a5a8a", 194], ["#e8e2d0", 238]].forEach(([c, x]) => { b += path(`M${x} 278 l-10 18 l14 8 l0 56 l36 0 l0 -56 l14 -8 l-10 -18 q-12 10 -24 0 Z`, c, 'opacity=".9"'); });
  b += rect(560, 160, 220, 40, "#0b0f14", 'rx="5"') + txt(670, 188, "NHÀ ĂN CÔNG NHÂN", 15, "#d9ecef", 'text-anchor="middle" letter-spacing="2"');
  // Cửa sổ nhận cơm nhìn sang nhà ăn, camera phía trên
  b += rect(600, 250, 140, 150, "#05080e") + rect(608, 258, 124, 134, "#3a2c20") + circle(640, 340, 14, "#d9a77c") + rect(626, 352, 28, 38, "#a85a2a", 'rx="4"') + circle(690, 330, 12, "#e0b98e") + rect(678, 342, 24, 40, "#2f6f62", 'rx="4"');
  b += glow(k, 670, 320, 80, "#ffd27a", 0.2) + cam(700, 215);

  // Hai người trong xưởng
  b += figure(330, 380, 1, { top: "#2f6f62", hair: "bun", hc: "#2b1b14", skin: "#e9c09b" });
  b += figure(520, 410, 1, { top: "#a85a2a", hair: "short", hc: "#2a1e16", skin: "#d9a77c" });

  // Dãy máy in: DTG số 1 và DTF số 2 (đặt sát cửa kho mực)
  b += rect(740, 440, 160, 190, `url(#${k}-mach)`, 'rx="6"') + rect(756, 456, 128, 54, "#10212c", 'rx="4"') + rect(756, 520, 128, 80, "#9aa5ad") + rect(780, 590, 80, 40, "#59636f");
  b += rect(930, 420, 190, 210, `url(#${k}-mach)`, 'rx="6"') + rect(946, 436, 158, 46, "#10212c", 'rx="4"') + circle(1010, 540, 38, "#cfd6db", 'stroke="#59636f" stroke-width="6"') + circle(1010, 540, 8, "#59636f");
  b += rect(1076, 524, 40, 8, "none", 'stroke="#f4d03a" stroke-dasharray="4 3" stroke-width="2"') + txt(1025, 412, "DTF 02", 15, "#d9ecef", 'text-anchor="middle" letter-spacing="3"');
  b += rect(930, 630, 190, 14, "#0b0f14");

  // Lò sấy hầm và ống xả chạy vào tường kho mực
  b += rect(1130, 480, 140, 110, "#6a7580", 'rx="6"') + rect(1140, 490, 120, 50, "#10181e") + path("M1270 520 L1360 520 L1360 300 L1430 300", "none", 'stroke="#8a949c" stroke-width="22"') + glow(k, 1200, 520, 90, "#ff7a3a", 0.18);
  // Kho mực: cửa mở, kệ thùng mực, vũng mực trắng và hình khoanh thi thể
  b += rect(1260, 220, 330, 500, "#171d24") + rect(1260, 210, 330, 16, "#0b0f14") + rect(1290, 236, 130, 28, "#0b0f14", 'rx="4"') + txt(1355, 257, "KHO MỰC", 15, "#ffd27a", 'text-anchor="middle" letter-spacing="3"');
  [0, 1].forEach((r) => { b += rect(1470, 290 + r * 140, 110, 10, "#59636f"); for (let c = 0; c < 3; c++) b += rect(1478 + c * 34, 250 + r * 140, 28, 40, c % 2 ? "#e8e2d0" : "#1f2b3a", 'rx="3"'); });
  b += path("M1310 676 Q1360 646 1440 662 Q1500 680 1470 712 Q1400 730 1320 712 Z", "#f3efe4", 'opacity=".85"');
  b += path("M1300 690 Q1340 660 1410 672 Q1470 684 1460 706 Q1390 724 1320 708 Z", "none", 'stroke="#f4d03a" stroke-width="3" stroke-dasharray="12 7"');
  b += line(1240, 700, 1600, 650, "#f4d03a", 4, 'opacity=".9"') + line(1240, 720, 1600, 668, "#222", 2, 'opacity=".5"');

  b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
  for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#06080a", 2, 'opacity=".5"');
  b += rect(0, 726, 1600, 10, "#f4d03a", 'opacity=".15"') + haze(k, 800, 500, 420, "#dff3ff", 0.07);
  return frame("Xưởng in và kho mực", defs, b);
}

// Hẻm sau trong mưa: kho hàng mở cửa cuốn có kệ áo mẫu, cửa hậu kho mực có đầu đọc thẻ, camera trên hiên, thùng rác ở cuối hẻm
export function sgVaniDock() {
  const k = "vdk";
  const defs = blurs(k) +
    lin(`${k}-wall`, [[0, "#2b323c"], [1, "#12161c"]]) +
    lin(`${k}-ground`, [[0, "#222a34"], [1, "#07090d"]]);
  let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`) + rect(0, 0, 1600, 70, "#07090d");
  for (let r = 0; r < 14; r++) for (let c = 0; c < 20; c++) if ((r + c) % 3) b += rect(c * 82 + (r % 2) * 40, 90 + r * 42, 74, 3, "#10141a", 'opacity=".5"');

  // Kho hàng bên trái: cửa cuốn mở, kệ áo mẫu, bàn ghi sổ
  b += rect(200, 280, 380, 440, "#06080b") + rect(190, 262, 400, 22, "#59636f");
  for (let i = 0; i < 3; i++) b += rect(214, 330 + i * 110, 350, 8, "#59636f");
  for (let i = 0; i < 3; i++) for (let j = 0; j < 5; j++) b += rect(224 + j * 66, 290 + i * 110, 52, 40, j % 2 ? "#e8e2d0" : "#c24a4a", 'rx="3" opacity=".85"');
  b += rect(300, 600, 220, 14, "#a67c52") + rect(316, 614, 188, 106, "#2c1d10") + rect(330, 576, 60, 24, "#f3ead2", 'rx="2"') + glow(k, 380, 560, 120, "#ffd27a", 0.2);
  b += rect(190, 720, 400, 24, "#3a4048") + rect(560, 230, 200, 12, "#59636f");
  b += cam(760, 230) + path("M760 242 L790 300 L720 300 Z", "#dff3ff", 'opacity=".06"');

  // Cửa hậu kho mực với đầu đọc thẻ và biển báo
  b += rect(930, 300, 200, 420, "#0e1318") + rect(942, 312, 176, 408, "#5a6672") + rect(944, 314, 172, 404, "#7e8a96") + line(1030, 314, 1030, 716, "#4b5964", 3);
  b += rect(1140, 450, 26, 52, "#10161c", 'rx="3"') + circle(1153, 466, 5, "#ff4d4d") + rect(1146, 482, 14, 10, "#394650");
  b += rect(950, 250, 160, 36, "#0b0f14", 'rx="4"') + txt(1030, 274, "CỬA HẬU · KHO MỰC", 13, "#d9ecef", 'text-anchor="middle" letter-spacing="1"') + rect(990, 600, 80, 10, "#d9d9d9", 'rx="3"');
  b += glow(k, 1030, 240, 120, "#ffd58a", 0.25) + rect(1010, 232, 40, 8, "#ffd58a");

  // Thùng rác tôn nằm trong bóng tối ở cuối hẻm
  b += rect(1180, 540, 220, 6, "#0a0d12") + rect(1220, 560, 140, 160, "#1c242c", 'rx="6"') + rect(1210, 546, 160, 18, "#2b333c", 'rx="4"') + path("M1240 560 Q1290 520 1340 560 Z", "#0d1217");
  b += rect(1400, 380, 12, 340, "#2a2d36") + glow(k, 1406, 380, 60, "#ffd58a", 0.15);

  b += rect(0, 720, 1600, 180, `url(#${k}-ground)`);
  for (let i = 0; i < 18; i++) b += path(`M${(i * 173) % 1600} ${750 + ((i * 59) % 130)} q28 -7 56 0`, "none", 'stroke="#a8c8f0" stroke-width="2" opacity=".18"');
  b += rect(930, 724, 220, 170, "#ffd58a", 'opacity=".05"') + rect(200, 724, 380, 170, "#ffd27a", 'opacity=".06"');
  let rain_ = "";
  for (let i = 0; i < 80; i++) {
    const x = (i * 71) % 1600, y = (i * 127) % 900;
    rain_ += line(x, y, x - 6, y + 20, "#9fc3dd", 1.2, `opacity=".35" style="animation-delay:-${((i * 0.13) % 1).toFixed(2)}s"`);
  }
  b += `<g class="rain">${rain_}</g>` + haze(k, 800, 540, 420, "#6fa0c0", 0.06);
  return frame("Hẻm sau và cửa hậu", defs, b);
}
