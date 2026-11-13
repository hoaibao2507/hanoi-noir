/* =====================================================================
   Cảnh vụ s6 "Âm Mười Tám Độ" (kho lạnh Hợp tác xã Chợ Bến Thành): Buồng 2 trữ đông −18°C (nơi thấy thi thể), phòng máy với tủ cấp đông Buồng 3 −40°C,
   bãi dỡ hàng và bàn đóng gói ở hầm B1, văn phòng Hợp tác xã tầng 2, phòng bảo vệ cổng Nam. Phòng giám định dùng lại cảnh sg_lab của vụ s1.
   Dùng bộ đồ nghề trong kit.js. Tọa độ theo khung cảnh gốc 1600×900; sàn trong nhà từ y = 720.
   ===================================================================== */

import { lin, rect, path, circle, line, txt, blurs, glow, haze, frame } from "./kit.js";
import { figure } from "./people.js";

// Camera treo tường: thân, ống kính, đèn đỏ
const cam = (x, y, ok = true) =>
  rect(x - 24, y - 12, 48, 26, "#262a30", 'rx="5"') + circle(x - 24, y, 8, "#0a0c10") + circle(x - 20, y, 4, "#3b6fa0", 'opacity=".8"') + circle(x + 16, y - 6, 3, ok ? "#ff4d4d" : "#3a3a3e");

// Đốm sương giá rải trên một vùng
function frost(x, y, w, h, n, col = "#eaf6ff", op = 0.5) {
  let s = "";
  for (let i = 0; i < n; i++) s += circle(x + ((i * 97) % w), y + ((i * 61) % h), 1 + (i % 3), col, `opacity="${(op * (0.5 + (i % 4) * 0.18)).toFixed(2)}"`);
  return s;
}

// Một chồng thùng carton xếp từ đáy (x, base): cols × rows thùng rộng w, cao h, nhãn trắng nhỏ ở mỗi thùng
function cartons(x, base, cols, rows, w, h, tag = "") {
  let s = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const bx = x + c * w, by = base - (r + 1) * h;
      s += rect(bx, by, w - 4, h - 4, (r + c) % 2 ? "#b79b70" : "#c4a877", 'rx="2"') + rect(bx + 6, by + 6, w * 0.45, h * 0.3, "#f3efe4", 'rx="1" opacity=".9"') + line(bx + 4, by + h * 0.62, bx + w - 8, by + h * 0.62, "#8b7248", 2, 'opacity=".5"');
      if (tag) s += txt(bx + 9, by + 6 + 0.24 * h, tag, 11, "#3b2a1b");
    }
  }
  return s;
}

// Buồng 2 trữ đông −18°C: tường panel cách nhiệt phủ sương, dàn lạnh trên trần, kệ C với pallet gà đông, ông Đông ngồi tựa chân kệ, cửa buồng nặng bên phải với nhãn đồng, bộ ghi cửa trên tường, Hưng
export function sgCsCold() {
  const k = "csc";
  const defs = blurs(k) +
    lin(`${k}-wall`, [[0, "#a9bccb"], [1, "#556b7e"]]) +
    lin(`${k}-floor`, [[0, "#7d8fa0"], [1, "#222d38"]]) +
    lin(`${k}-door`, [[0, "#d3dce4"], [1, "#8896a4"]]);
  let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`) + rect(0, 0, 1600, 70, "#3d4f60");
  for (let x = 0; x < 1600; x += 160) b += line(x, 70, x, 720, "#3d4f60", 2, 'opacity=".4"');
  for (let x = 200; x < 1600; x += 300) b += rect(x - 90, 40, 180, 14, "#f4fbff", 'rx="6"') + glow(k, x, 52, 120, "#dff3ff", 0.28);
  // Dàn lạnh trên trần: ba quạt, sương rủ xuống
  b += rect(60, 70, 330, 76, "#6c7f90", 'rx="8"') + rect(60, 138, 330, 8, "#cfe0ec", 'opacity=".7"');
  for (let i = 0; i < 3; i++) b += circle(120 + i * 100, 106, 32, "#27323d") + circle(120 + i * 100, 106, 20, "#90a3b3") + line(100 + i * 100, 106, 140 + i * 100, 106, "#27323d", 4) + line(120 + i * 100, 86, 120 + i * 100, 126, "#27323d", 4);
  b += haze(k, 220, 190, 140, "#eaf6ff", 0.2);
  // Màn hình nhiệt độ trên tường
  b += rect(540, 150, 170, 62, "#0b1218", 'rx="6"') + txt(625, 196, "−18°C", 34, "#ff6a5a", 'text-anchor="middle"') + glow(k, 625, 180, 70, "#ff6a5a", 0.14);
  // Bộ ghi cửa trên tường (dấu vết nhật ký cửa)
  b += rect(650, 468, 100, 112, "#2a343e", 'rx="6"') + rect(660, 480, 80, 44, "#05080e", 'rx="3"') + rect(668, 490, 60, 4, "#4fe0a0") + rect(668, 500, 44, 4, "#4fe0a0", 'opacity=".6"') + rect(668, 510, 52, 4, "#ffd27a", 'opacity=".7"') + circle(690, 548, 5, "#4fe08a") + circle(712, 548, 5, "#3b6fa0");
  b += path("M750 524 Q820 520 840 470", "none", 'stroke="#10151b" stroke-width="4"');

  // Kệ C: hai cột, ba tầng, pallet gà đông ở tầng giữa
  b += rect(786, 190, 10, 530, "#5a6a79") + rect(1060, 190, 10, 530, "#5a6a79");
  for (const y of [300, 440, 580]) b += rect(786, y, 284, 10, "#7c8c9a");
  b += cartons(800, 300, 3, 1, 88, 96, "") + cartons(800, 440, 3, 1, 88, 96, "4C") + cartons(800, 580, 3, 1, 88, 96, "");
  b += frost(790, 200, 280, 380, 70, "#ffffff", 0.55);

  // Ông Đông ngồi tựa chân kệ, hai chân duỗi trên sàn, sương phủ người; hộp nhựa đỡ phía sau
  b += rect(1090, 606, 130, 114, "#3c4e5e", 'rx="6"') + rect(1100, 614, 110, 14, "#52667a");
  b += figure(1130, 470, 1, { top: "#4a4036", hair: "short", hc: "#cfd6dc", skin: "#b9ccd9", glasses: false, seated: true });
  b += rect(1104, 606, 64, 70, "#2b2f3a", 'rx="10"') + rect(1120, 668, 168, 38, "#2b2f3a", 'rx="16"') + rect(1272, 672, 36, 30, "#14161c", 'rx="8"');
  b += `<rect x="1090" y="440" width="150" height="270" rx="30" fill="#eaf6ff" opacity=".28"/>` + frost(1096, 446, 140, 250, 50, "#ffffff", 0.7) + glow(k, 1160, 560, 90, "#dff3ff", 0.18);

  // Cửa buồng nặng bên phải: gioăng, kính nhỏ, tay nắm, nhãn đồng dưới tay nắm (dấu vết ẩn)
  b += rect(1240, 180, 290, 540, `url(#${k}-door)`, 'rx="8"') + rect(1240, 180, 290, 540, "none", 'rx="8" stroke="#2a343e" stroke-width="8"') + rect(1290, 230, 70, 90, "#05080e", 'rx="8"') + rect(1296, 236, 58, 78, "#18242f", 'rx="6"');
  b += rect(1262, 440, 12, 70, "#e9eef2", 'rx="5"') + rect(1258, 436, 24, 12, "#aab6c0", 'rx="4"') + rect(1266, 494, 46, 14, "#b87333", 'rx="2"') + frost(1244, 190, 280, 500, 60, "#ffffff", 0.4);
  b += rect(1240, 150, 290, 28, "#3d4f60") + txt(1385, 172, "BUỒNG 2 · −18°C", 16, "#eaf6ff", 'text-anchor="middle"');

  // Hưng đứng bên trái trong áo thợ
  b += figure(420, 470, 1, { top: "#3a4a58", hair: "short", hc: "#555555", skin: "#d9ae88", mustache: true, sex: "m" });
  b += rect(540, 640, 90, 80, "#6c7f90", 'rx="4"');

  b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
  for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#1c2630", 2, 'opacity=".5"');
  b += rect(0, 724, 1600, 8, "#eaf6ff", 'opacity=".18"') + frost(0, 730, 1600, 160, 100, "#ffffff", 0.4) + haze(k, 800, 500, 460, "#cfe8ff", 0.1);
  return frame("Buồng 2 trữ đông −18°C của kho lạnh Hợp tác xã", defs, b);
}

// Phòng máy sau Buồng 3: tủ cấp đông −40°C (cửa thép, bảng thông số), bộ điều khiển, cửa chuyển hàng thấp sang Buồng 2, dàn máy nén, áo thợ của Hưng treo trên móc, Thắm
export function sgCsBlast() {
  const k = "csb";
  const defs = blurs(k) +
    lin(`${k}-wall`, [[0, "#6c7a86"], [1, "#2a333c"]]) +
    lin(`${k}-floor`, [[0, "#4a545e"], [1, "#12171c"]]) +
    lin(`${k}-steel`, [[0, "#d3dce4"], [1, "#7e8c99"]]);
  let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`) + rect(0, 0, 1600, 60, "#171d24");
  for (let x = 140; x < 1600; x += 280) b += rect(x - 70, 32, 140, 10, "#e8f4ff", 'rx="4" opacity=".9"') + glow(k, x, 40, 100, "#e8f4ff", 0.22);
  for (let r = 0; r < 5; r++) b += line(0, 120 + r * 120, 1600, 120 + r * 120, "#1c242c", 2, 'opacity=".5"');

  // Dàn máy nén bên trái: hai thân máy, ống đồng phủ sương
  b += rect(60, 250, 260, 470, "#3a4651", 'rx="8"') + rect(76, 270, 228, 130, "#10161c", 'rx="6"') + circle(190, 335, 46, "#26303a") + circle(190, 335, 30, "#8294a3") + line(160, 335, 220, 335, "#26303a", 5) + line(190, 305, 190, 365, "#26303a", 5);
  b += rect(76, 430, 228, 40, "#26303a", 'rx="4"') + rect(90, 440, 70, 20, "#4fe0a0", 'opacity=".6"') + rect(76, 490, 228, 30, "#26303a", 'rx="4"');
  b += path("M320 340 Q420 340 420 430 L420 720", "none", 'stroke="#b87333" stroke-width="12"') + path("M320 340 Q420 340 420 430 L420 720", "none", 'stroke="#eaf6ff" stroke-width="5" opacity=".6"');
  b += frost(70, 255, 260, 260, 40, "#ffffff", 0.5);

  // Cửa tủ cấp đông −40°C: thép, tay nắm, bảng thông số, đèn báo
  b += rect(730, 190, 280, 530, `url(#${k}-steel)`, 'rx="8"') + rect(730, 190, 280, 530, "none", 'rx="8" stroke="#1c242c" stroke-width="8"') + rect(720, 170, 300, 22, "#10161c");
  b += rect(752, 270, 138, 108, "#f1ead4", 'rx="3"') + rect(760, 278, 122, 92, "#fbf6e6") + txt(821, 302, "−40°C · P-180", 15, "#3b2a1b", 'text-anchor="middle"') + txt(821, 326, "180 PHÚT · ≤100 KG", 12, "#3b2a1b", 'text-anchor="middle"') + txt(821, 350, "LÕI −18°C", 12, "#a93226", 'text-anchor="middle"');
  b += rect(975, 380, 14, 160, "#10161c", 'rx="6"') + rect(790, 600, 150, 80, "#10161c", 'rx="4"') + circle(960, 235, 8, "#4fe08a") + txt(870, 224, "CẤP ĐÔNG NHANH", 14, "#10161c", 'text-anchor="middle"');
  b += frost(734, 200, 270, 500, 50, "#ffffff", 0.35);

  // Bộ điều khiển tủ ở bên trái cửa
  b += rect(580, 480, 120, 160, "#222c35", 'rx="6"') + rect(590, 492, 100, 64, "#05080e", 'rx="3"') + txt(640, 518, "P-180", 18, "#4fe0a0", 'text-anchor="middle"') + txt(640, 544, "23:53:41", 14, "#ffd27a", 'text-anchor="middle"');
  for (let i = 0; i < 6; i++) b += circle(604 + (i % 3) * 30, 584 + Math.floor(i / 3) * 24, 8, i === 0 ? "#4fe08a" : "#3a4a5a");
  b += glow(k, 640, 520, 70, "#4fe0a0", 0.16);

  // Cửa chuyển hàng thấp (cao 1,2 m) sang Buồng 2: khung, chốt thép, mép dưới bị gạt sương
  b += rect(1050, 548, 180, 172, "#8d9aa6", 'rx="6"') + rect(1062, 560, 156, 152, "#5a6a79", 'rx="4"') + rect(1056, 626, 26, 12, "#10161c", 'rx="3"') + line(1070, 596, 1210, 596, "#3b4a58", 3);
  b += rect(1076, 704, 128, 12, "#10161c", 'opacity=".5"') + `<rect x="1090" y="690" width="110" height="22" rx="8" fill="#10161c" opacity=".4"/>` + frost(1052, 552, 176, 160, 30, "#ffffff", 0.4);
  b += txt(1140, 540, "→ BUỒNG 2", 13, "#cfe8ff", 'text-anchor="middle"');

  // Áo thợ của Hưng treo trên móc ở tường phải (dấu vết: phiếu công lệnh trong túi)
  b += rect(1250, 360, 120, 12, "#1a1f26") + circle(1310, 372, 7, "#10151b") + path("M1262 380 Q1310 370 1358 380 L1370 560 L1252 560 Z", "#3a4a58") + rect(1288, 380, 44, 14, "#2c3946") + rect(1276, 470, 66, 52, "#33414e", 'rx="3"') + rect(1292, 480, 34, 24, "#f3efe4", 'rx="2"');
  b += rect(1220, 640, 220, 80, "#3a4651", 'rx="4"');

  // Thắm đứng bên trái, tay giữ chùm chìa
  b += figure(430, 470, 1, { top: "#4a6a8a", hair: "long", hc: "#2b1b14", skin: "#e9c09b" });
  b += circle(470, 580, 7, "#d9c27a") + circle(484, 590, 6, "#d9c27a") + line(470, 580, 484, 590, "#8a7a3a", 2);

  b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
  for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#0a0e12", 2, 'opacity=".5"');
  b += `<ellipse cx="900" cy="800" rx="240" ry="16" fill="#cfe8ff" opacity=".08"/>` + rect(0, 726, 1600, 8, "#e8f4ff", 'opacity=".1"') + haze(k, 860, 500, 420, "#9fd0ee", 0.07);
  return frame("Phòng máy và tủ cấp đông −40°C của Buồng 3", defs, b);
}

// Bãi dỡ hàng hầm B1: thùng xe tải lạnh phía sau, cửa cuốn nhập hàng mở ra đêm mưa, cân điện tử, xe nâng điện số 2, bàn đóng gói với máy in tem, cột bê tông che camera, Vũ
export function sgCsDock() {
  const k = "csd";
  const defs = blurs(k) +
    lin(`${k}-wall`, [[0, "#3a4350"], [1, "#171d25"]]) +
    lin(`${k}-floor`, [[0, "#4a4f55"], [1, "#101317"]]) +
    lin(`${k}-night`, [[0, "#070a1a"], [1, "#222a52"]]);
  let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`) + rect(0, 0, 1600, 70, "#0c0f14");
  for (let x = 160; x < 1600; x += 340) b += rect(x - 80, 38, 160, 12, "#ffe8b0", 'rx="4" opacity=".9"') + glow(k, x, 46, 110, "#ffd58a", 0.2);

  // Cửa cuốn nhập hàng mở ở giữa nhìn ra đêm, vài đốm đèn phố
  b += rect(640, 140, 380, 420, `url(#${k}-night)`) + rect(630, 120, 400, 26, "#262d35") + rect(640, 146, 380, 36, "#3a434d");
  for (let i = 0; i < 14; i++) b += circle(660 + ((i * 53) % 340), 220 + ((i * 71) % 300), 3 + (i % 3), i % 3 ? "#ffd58a" : "#ff8f6a", 'opacity=".5"');
  b += rect(630, 146, 10, 414, "#10151b") + rect(1020, 146, 10, 414, "#10151b");

  // Thùng xe tải lạnh nhìn từ phía sau, bên trái
  b += rect(70, 200, 470, 520, "#d4dadf", 'rx="10"') + rect(70, 200, 470, 520, "none", 'rx="10" stroke="#8a949e" stroke-width="6"') + rect(110, 250, 180, 440, "#0f1318") + rect(320, 250, 180, 440, "#0f1318");
  b += line(300, 250, 300, 690, "#6a747e", 6) + circle(184, 610, 7, "#ff4d4d") + circle(446, 610, 7, "#ff4d4d") + txt(305, 232, "ĐÔNG LẠNH · −18°C", 15, "#3a444e", 'text-anchor="middle"');
  b += frost(112, 252, 380, 430, 40, "#ffffff", 0.2);

  // Cân điện tử: bệ cân trên sàn và cột màn hình (đặt trước cửa cuốn)
  b += rect(580, 650, 250, 56, "#59636f", 'rx="4"') + rect(600, 640, 210, 14, "#8d98a4", 'rx="3"') + rect(692, 446, 22, 200, "#2a323a") + rect(650, 468, 106, 74, "#05080e", 'rx="4"') + txt(703, 504, "4.340", 24, "#4fe0a0", 'text-anchor="middle"') + txt(703, 530, "kg · T-0033", 12, "#ffd27a", 'text-anchor="middle"') + glow(k, 703, 500, 70, "#4fe0a0", 0.15);

  // Camera trên cao
  b += cam(960, 230) + glow(k, 960, 230, 80, "#ffd58a", 0.14);

  // Xe nâng điện số 2: thân vàng, cột nâng, đèn quay, càng
  b += rect(1060, 520, 190, 150, "#e0a92f", 'rx="10"') + rect(1068, 528, 170, 40, "#f2c75a", 'rx="8"') + rect(1190, 330, 22, 340, "#3a424a") + rect(1180, 330, 42, 14, "#10151b") + rect(1190, 460, 130, 16, "#8d98a4") + rect(1190, 650, 130, 14, "#8d98a4");
  b += circle(1096, 690, 20, "#10151b") + circle(1220, 690, 20, "#10151b") + circle(1112, 510, 10, "#ffb347") + glow(k, 1112, 510, 40, "#ffb347", 0.4) + rect(1090, 560, 100, 32, "#10151b", 'rx="4"') + txt(1140, 584, "2", 22, "#ffd27a", 'text-anchor="middle"');
  b += rect(1100, 706, 230, 12, "#10151b", 'opacity=".4"');

  // Bàn đóng gói với máy in tem
  b += rect(1250, 548, 290, 14, "#6b5a46", 'rx="3"') + rect(1262, 562, 10, 158, "#4a3d30") + rect(1520, 562, 10, 158, "#4a3d30") + rect(1262, 640, 268, 8, "#4a3d30");
  b += rect(1260, 452, 120, 96, "#2a323a", 'rx="6"') + rect(1272, 464, 80, 24, "#05080e", 'rx="3"') + txt(1312, 482, "NSX 12/2025", 12, "#4fe0a0", 'text-anchor="middle"') + rect(1290, 498, 70, 40, "#f3efe4", 'rx="2"') + line(1296, 508, 1352, 508, "#3b2a1b", 2) + line(1296, 518, 1340, 518, "#3b2a1b", 2);
  b += rect(1410, 496, 80, 52, "#c4a877", 'rx="2"') + rect(1418, 504, 36, 14, "#f3efe4");
  b += cartons(1420, 548, 1, 1, 80, 52, "");

  // Cột bê tông ở giữa (che tầm nhìn camera tới lối vào Buồng 3)
  b += rect(1010, 70, 40, 650, "#4a4d52") + rect(1006, 70, 48, 18, "#303338") + frost(1012, 80, 36, 600, 8, "#ffffff", 0.1);

  // Vũ đứng phía trước thùng xe
  b += figure(400, 470, 1, { top: "#3f5a3a", hair: "short", hc: "#2a1e16", skin: "#dfae85", mustache: true });

  b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
  for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#08090c", 2, 'opacity=".5"');
  b += `<ellipse cx="600" cy="800" rx="180" ry="14" fill="#9fc3dd" opacity=".1"/>` + rect(0, 726, 1600, 8, "#ffd58a", 'opacity=".12"') + haze(k, 800, 520, 420, "#ffd98e", 0.06);
  return frame("Bãi dỡ hàng và bàn đóng gói ở hầm B1", defs, b);
}

// Văn phòng Hợp tác xã tầng 2: cửa sổ nhìn ra chợ đêm, bàn kế toán với bản kiểm kê, giá hồ sơ hợp đồng, cửa hành lang có camera, Ngân và Hạnh
export function sgCsOffice() {
  const k = "cso";
  const defs = blurs(k) +
    lin(`${k}-wall`, [[0, "#3a3430"], [1, "#1a1613"]]) +
    lin(`${k}-floor`, [[0, "#4a3a2c"], [1, "#120e0b"]]) +
    lin(`${k}-wood`, [[0, "#7a5230"], [1, "#2a1a0e"]]) +
    lin(`${k}-sky`, [[0, "#070a1a"], [1, "#2a2a52"]]);
  let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`) + rect(0, 0, 1600, 50, "#0e0b09") + glow(k, 800, 60, 160, "#ffd27a", 0.22);
  // Cửa sổ nhìn ra chợ đêm: mái chợ, đèn lồng đỏ
  b += rect(150, 90, 560, 420, `url(#${k}-sky)`) + rect(150, 380, 560, 130, "#12141c", 'opacity=".8"');
  for (let i = 0; i < 12; i++) b += circle(170 + ((i * 47) % 520), 400 + ((i * 29) % 90), 4, i % 2 ? "#ff6a5a" : "#ffd58a", 'opacity=".7"');
  b += path("M150 390 L430 300 L710 390 Z", "#1a1d28") + rect(140, 84, 580, 10, "#07060c") + rect(140, 506, 580, 12, "#07060c") + rect(426, 90, 8, 420, "#07060c");
  // Băng rôn tất niên và lịch tường
  b += rect(760, 90, 340, 52, "#a93226", 'rx="4"') + txt(930, 126, "TẤT NIÊN · HỢP TÁC XÃ CHỢ BẾN THÀNH", 13, "#f3e7c9", 'text-anchor="middle"');
  b += rect(1130, 96, 90, 120, "#f3ead2", 'rx="3"') + rect(1130, 96, 90, 26, "#a93226") + txt(1175, 116, "THÁNG 1", 13, "#f3e7c9", 'text-anchor="middle"') + line(1140, 150, 1210, 150, "#8a7a5a", 2) + line(1140, 170, 1210, 170, "#8a7a5a", 2) + line(1140, 190, 1200, 190, "#8a7a5a", 2);

  // Bàn kế toán: bàn phím máy tính, bản kiểm kê gạch đỏ và xanh, bàn tính
  b += rect(700, 612, 340, 16, `url(#${k}-wood)`, 'rx="3"') + rect(712, 628, 316, 92, "#1d1209") + rect(752, 550, 130, 60, "#05080e", 'rx="3"') + rect(758, 556, 118, 46, "#0b1c2c");
  b += rect(780, 585, 130, 34, "#f3ead2", 'rx="2"') + line(790, 596, 890, 596, "#a93226", 3) + line(790, 606, 870, 606, "#3a6ea8", 2) + rect(928, 596, 80, 18, "#6a4a30", 'rx="2"');
  for (let i = 0; i < 5; i++) b += circle(940 + i * 14, 605, 4, "#e8d9a8");

  // Giá hồ sơ bên phải: hợp đồng bếp ăn Bình An nằm ở ngăn giữa
  b += rect(960, 330, 240, 240, "#3a3430", 'rx="4"') + rect(968, 338, 224, 224, "#12100e");
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) b += rect(976 + c * 36, 348 + r * 70, 28, 62, ["#3a4a5c", "#5a3a3a", "#2f5a50", "#4a3a2a"][(r + c) % 4], 'rx="2"');
  b += rect(1034, 418, 56, 62, "#f3ead2", 'rx="2"') + rect(1040, 428, 44, 4, "#a93226", 'opacity=".7"') + rect(1040, 440, 34, 4, "#3b2a1b", 'opacity=".6"');

  // Cửa hành lang bên phải với camera phía trên
  b += rect(1290, 360, 190, 360, "#1d1a16") + rect(1302, 372, 166, 348, "#2a241e") + rect(1328, 400, 114, 160, "#0b1220", 'opacity=".7"') + txt(1385, 336, "HÀNH LANG TẦNG 2", 12, "#f3e7c9", 'text-anchor="middle"');
  b += cam(1250, 240) + glow(k, 1250, 240, 80, "#ffd58a", 0.15);

  // Ngân và Hạnh đứng ở giữa
  b += figure(400, 470, 1, { top: "#7a3b4a", hair: "bun", hc: "#2a1a14", skin: "#efc9a7", glasses: true });
  b += figure(580, 470, 1, { top: "#5a2a3a", hair: "bun", hc: "#1a1414", skin: "#f1d0b4", scarf: "#8a2a3a" });
  b += rect(260, 640, 330, 80, "#2a1f17", 'rx="4"');

  b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
  for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#08060a", 2, 'opacity=".5"');
  b += haze(k, 700, 500, 420, "#ffd98e", 0.07);
  return frame("Văn phòng Hợp tác xã Chợ Bến Thành, tầng 2", defs, b);
}

// Phòng bảo vệ cổng Nam: cửa sổ nhìn ra cổng chợ và lối xuống hầm B1, màn hình bảo vệ, sơ đồ kho lạnh, bàn có điện thoại và tô hủ tiếu, camera cổng, Trang
export function sgCsHall() {
  const k = "csh";
  const defs = blurs(k) +
    lin(`${k}-wall`, [[0, "#2f3a36"], [1, "#161c19"]]) +
    lin(`${k}-floor`, [[0, "#3a3a34"], [1, "#0f100e"]]) +
    lin(`${k}-wood`, [[0, "#6a4a2c"], [1, "#2a1a0e"]]) +
    lin(`${k}-sky`, [[0, "#070a1a"], [1, "#252c4a"]]);
  let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`) + rect(0, 0, 1600, 50, "#0a0e0c") + glow(k, 800, 60, 150, "#e8f2ff", 0.18);
  // Cửa sổ nhìn ra cổng Nam: vòm cổng chợ và lối xuống hầm B1
  b += rect(80, 100, 360, 360, `url(#${k}-sky)`) + path("M110 450 L110 250 Q260 150 410 250 L410 450 Z", "#161c28") + path("M170 450 L170 290 Q260 220 350 290 L350 450 Z", "#05080e");
  for (let i = 0; i < 5; i++) b += rect(190 + i * 6, 360 + i * 18, 140 - i * 12, 12, i % 2 ? "#2a333d" : "#222a33");
  b += rect(210, 240, 100, 18, "#0b4d3a") + txt(260, 254, "XUỐNG HẦM B1", 11, "#f3f1ea", 'text-anchor="middle"') + rect(70, 94, 380, 10, "#07090b") + rect(70, 456, 380, 12, "#07090b") + rect(252, 100, 8, 360, "#07090b");

  // Màn hình bảo vệ trên tường (chiếu lại tiệc tất niên)
  b += rect(500, 270, 200, 130, "#0a0f14", 'rx="6"') + rect(508, 278, 184, 114, "#10203a") + rect(520, 300, 160, 60, "#2a1a38") + circle(600, 316, 8, "#e0b98e") + rect(590, 324, 20, 30, "#a93226", 'rx="4"') + rect(520, 360, 160, 24, "#5a3a2a");
  b += rect(508, 278, 54, 14, "#000", 'opacity=".6"') + circle(516, 285, 3, "#ff4d4d") + glow(k, 600, 335, 90, "#7fa8ff", 0.16);

  // Sơ đồ kho lạnh trên tường: ba buồng, cửa chuyển hàng
  b += rect(940, 300, 220, 200, "#f1ead4", 'rx="3"') + txt(1050, 326, "SƠ ĐỒ KHO LẠNH", 13, "#3b2a1b", 'text-anchor="middle"');
  b += rect(956, 340, 56, 70, "none", 'stroke="#3a5a8a" stroke-width="3"') + rect(1020, 340, 56, 70, "none", 'stroke="#3a5a8a" stroke-width="3"') + rect(1084, 340, 56, 70, "none", 'stroke="#a93226" stroke-width="3"');
  b += txt(984, 380, "B1", 12, "#3b2a1b", 'text-anchor="middle"') + txt(1048, 380, "B2", 12, "#3b2a1b", 'text-anchor="middle"') + txt(1112, 380, "B3", 12, "#a93226", 'text-anchor="middle"');
  b += line(1076, 410, 1084, 410, "#a93226", 4) + rect(956, 436, 184, 12, "#c9b790", 'opacity=".7"') + txt(1050, 470, "Hành lang lạnh +5°C", 11, "#6b5a46", 'text-anchor="middle"');
  b += cam(1210, 230) + glow(k, 1210, 230, 80, "#ffd58a", 0.15);

  // Bàn bảo vệ: điện thoại, tô hủ tiếu, giá treo chìa
  b += rect(650, 616, 360, 16, `url(#${k}-wood)`, 'rx="3"') + rect(662, 632, 336, 88, "#1d1209") + rect(790, 590, 24, 28, "#10151b", 'rx="4"') + rect(793, 594, 18, 18, "#4a80c0", 'rx="2"') + glow(k, 802, 602, 40, "#7fc8ff", 0.4);
  b += path("M870 616 Q930 590 960 616 Z", "#f3efe4") + line(880, 604, 940, 590, "#8a6a3a", 3) + rect(1200, 380, 100, 110, "#3a3428", 'rx="4"');
  for (let i = 0; i < 5; i++) b += circle(1216 + i * 18, 416, 5, "#d9c27a") + line(1216 + i * 18, 416, 1216 + i * 18, 446, "#8a7a3a", 2);

  // Trang đứng bên trái
  b += figure(410, 470, 1, { top: "#c9d6e8", hair: "long", hc: "#2a1a14", skin: "#f4d6bd", sex: "f" });
  b += rect(260, 640, 300, 80, "#2a2018", 'rx="4"');

  b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
  for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#070807", 2, 'opacity=".5"');
  b += haze(k, 700, 500, 420, "#cfe8ff", 0.06);
  return frame("Phòng bảo vệ cổng Nam chợ Bến Thành", defs, b);
}
