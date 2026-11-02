/* =====================================================================
   Cảnh vùng Sài Gòn (vụ s1): sảnh chung cư, phòng bảo vệ, hầm xe, penthouse, phố bến Vân Đồn, phòng giám định và nền menu.
   Tách khỏi art.js cho dễ đọc; dùng chung bộ đồ nghề trong kit.js.
   ===================================================================== */

import { shade, lin, rect, path, circle, line, txt, blurs, glow, haze, frame } from "./kit.js";
import { figure } from "./people.js";

// Nhà phố Sài Gòn: mặt đứng hẹp, mái bằng có bồn nước, chuồng cọp, cửa cuốn tầng trệt và biển neon tùy chọn
export function sgHouse(k, x, base, w, h, o = {}) {
  const top = base - h, wall = o.wall || "#4a3d5c", lit = o.lit || "#ffd27a", seed = o.seed || 0;
  const floors = Math.max(2, Math.round((h - 150) / 105)), fh = (h - 150) / floors;
  const ww = w * 0.72, wx = x + w * 0.14;
  let s = rect(x, top, w, h, wall) + rect(x - 6, top - 8, w + 12, 14, shade(wall, -0.4));
  s += rect(x + w * 0.18, top - 40, 42, 32, "#2f3d4f", 'rx="8"') + rect(x + w * 0.18 + 8, top - 48, 26, 9, "#222e3c", 'rx="4"');
  for (let f = 0; f < floors; f++) {
    const wy = top + 24 + f * fh, on = (f + seed) % 3 !== 1;
    s += rect(wx, wy, ww, fh * 0.56, on ? lit : "#171020", on ? 'opacity=".85"' : "");
    for (let g = 1; g < 5; g++) s += line(wx + (ww * g) / 5, wy, wx + (ww * g) / 5, wy + fh * 0.56, "#0d0912", 2.2);
    s += line(wx, wy + fh * 0.28, wx + ww, wy + fh * 0.28, "#0d0912", 2.2) + rect(x + w * 0.08, wy + fh * 0.56, w * 0.84, 5, "#0d0912");
  }
  s += rect(x + w * 0.08, base - 130, w * 0.84, 130, "#120d19");
  for (let i = 0; i < 8; i++) s += line(x + w * 0.08, base - 122 + i * 15, x + w * 0.92, base - 122 + i * 15, "#271f33", 2);
  if (o.neon) s += rect(x + w * 0.1, base - 186, w * 0.8, 40, o.neon, 'rx="6" opacity=".9"') + glow(k, x + w / 2, base - 166, w * 0.55, o.neon, 0.45);
  return s;
}

// Dây điện chằng chịt giữa các cột: vài đường cong mảnh
export function wires(y0, n = 4) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const y = y0 + i * 22;
    s += path(`M-20 ${y} Q400 ${y + 70 + i * 6} 800 ${y + 10} T1620 ${y + 40}`, "none", `stroke="#05070c" stroke-width="${(2.2 - i * 0.3).toFixed(1)}" opacity=".9"`);
  }
  return s;
}

// Một cái ô tô nhìn ngang: thân, kính, bánh, đèn
export function sgCar(x, y, w, col, o = {}) {
  const h = w * 0.34;
  let s = path(`M${x} ${y} L${x + w * 0.06} ${y - h * 0.5} Q${x + w * 0.2} ${y - h * 0.62} ${x + w * 0.34} ${y - h * 0.9} L${x + w * 0.68} ${y - h * 0.9} Q${x + w * 0.84} ${y - h * 0.62} ${x + w * 0.94} ${y - h * 0.42} L${x + w} ${y} Z`, col);
  s += path(`M${x + w * 0.3} ${y - h * 0.5} L${x + w * 0.4} ${y - h * 0.82} L${x + w * 0.66} ${y - h * 0.82} L${x + w * 0.78} ${y - h * 0.5} Z`, o.glass || "#1a2a3c", 'opacity=".9"');
  s += circle(x + w * 0.22, y, w * 0.075, "#0a0a0d") + circle(x + w * 0.78, y, w * 0.075, "#0a0a0d");
  s += circle(x + w * 0.96, y - h * 0.3, w * 0.022, "#fff3c8");
  return s;
}

// Sảnh chung cư Sao Mai: thang máy inox, quầy lễ tân, hành lang thang bộ tối ở bên phải, cửa kính nhìn ra phố ngập
export function sgLobby() {
  const k = "sglb";
  const defs = blurs(k) +
    lin(`${k}-wall`, [[0, "#26343a"], [1, "#101a1f"]]) +
    lin(`${k}-floor`, [[0, "#8f9ba0"], [1, "#222a2e"]]) +
    lin(`${k}-lift`, [[0, "#cfd8db"], [0.5, "#8a969a"], [1, "#bcc7ca"]], 0, 0, 1, 0) +
    lin(`${k}-glass`, [[0, "#13203a"], [1, "#2b3b63"]]) +
    lin(`${k}-desk`, [[0, "#6a4a30"], [1, "#2a1a0e"]]);
  let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`) + rect(0, 0, 1600, 40, "#0a1114");
  for (let x = 120; x < 1600; x += 260) b += glow(k, x, 70, 90, "#fff1d0", 0.32) + circle(x, 64, 7, "#fff6dc");

  // Cửa kính lớn nhìn ra phố ngập, neon hắt vào
  b += rect(60, 220, 230, 500, "#0b1020") + rect(70, 230, 210, 480, `url(#${k}-glass)`);
  b += path("M70 640 Q175 620 280 640 L280 710 L70 710 Z", "#1c2a4a");
  for (let i = 0; i < 12; i++) b += line(90 + i * 16, 250 + (i % 4) * 30, 84 + i * 16, 280 + (i % 4) * 30, "#9fc3dd", 1.2, 'opacity=".4"');
  b += glow(k, 190, 420, 80, "#ff4fa3", 0.35) + line(175, 230, 175, 710, "#0a0d14", 6);

  // Khối thang máy: hai cửa inox, bảng chỉ tầng
  b += rect(620, 250, 380, 470, "#0e1518") + rect(612, 236, 396, 22, "#1b272c");
  [[640, "G"], [830, "27"]].forEach(([x, t]) => {
    b += rect(x, 290, 160, 430, `url(#${k}-lift)`) + line(x + 80, 290, x + 80, 720, "#4a565a", 3);
    b += rect(x + 50, 258, 60, 24, "#04080a", 'rx="3"') + txt(x + 80, 277, t, 17, "#ff7a45", 'text-anchor="middle"');
  });
  b += txt(810, 232, "THANG MÁY", 16, "#cfe3e8", 'text-anchor="middle" letter-spacing="3"');

  // Quầy lễ tân và sổ khách
  b += rect(1030, 600, 470, 130, `url(#${k}-desk)`) + rect(1020, 586, 490, 18, "#8a6a48", 'rx="3"');
  b += rect(1086, 548, 90, 40, "#7b1e1e", 'rx="3"') + rect(1086, 548, 8, 40, "#4a0f0f") + line(1100, 560, 1170, 560, "#e9b949", 2, 'opacity=".6"');
  b += rect(1290, 550, 70, 38, "#2e3a42", 'rx="4"') + rect(1296, 556, 58, 22, "#9fe0c8", 'rx="2" opacity=".7"');
  b += rect(1050, 330, 330, 54, "#0b1417", 'rx="6"') + txt(1215, 366, "LỄ TÂN · SAO MAI RIVERSIDE", 20, "#d9ecef", 'text-anchor="middle" letter-spacing="2"');
  b += circle(1240, 250, 40, "#f5efe0", 'stroke="#2e3a42" stroke-width="6"') + line(1240, 250, 1240, 222, "#222", 3) + line(1240, 250, 1262, 250, "#222", 3);

  // Hành lang thang bộ tối bên phải
  b += rect(1400, 300, 150, 420, "#07090c") + rect(1412, 312, 126, 26, "#14b860", 'rx="4"') + glow(k, 1475, 326, 60, "#32f08c", 0.4);
  b += txt(1475, 331, "THANG BỘ", 15, "#04140a", 'text-anchor="middle" letter-spacing="2"');

  // Camera mái vòm trên trần: điểm điều tra
  b += circle(800, 196, 24, "#1b1f26") + circle(800, 196, 11, "#0b0e14") + circle(814, 186, 3, "#ff4d4d") + glow(k, 800, 196, 60, "#cfe3e8", 0.25);

  // Thắm đứng bên áo mưa vàng chanh vắt trên bàn thấp; Trang ngồi trên sofa
  b += rect(410, 590, 70, 60, "#3a2a20", 'rx="4"') + path("M404 590 Q440 560 486 588 L478 640 Q440 650 414 636 Z", "#e9d73a") + path("M430 580 Q452 560 470 586", "none", 'stroke="#fff6a0" stroke-width="3" opacity=".6"');
  b += figure(330, 380, 1, { top: "#b5446e", hair: "long", hc: "#1f1a17", skin: "#f3d1ae" });
  b += rect(470, 640, 230, 84, "#2b3441", 'rx="12"') + rect(470, 600, 230, 50, "#35404f", 'rx="12"');
  b += figure(570, 450, 1, { top: "#d98c1f", hair: "bun", hc: "#3b2a1b", skin: "#f0c9a0", seated: true });
  b += rect(470, 640, 230, 70, "#2b3441", 'rx="12"');

  // Chậu cây
  b += rect(1536, 640, 40, 80, "#2d2a28", 'rx="6"') + path("M1556 640 Q1520 560 1540 520 Q1560 570 1576 540 Q1590 600 1556 640 Z", "#2f7d4f");

  // Sàn đá hoa, phản chiếu ánh đèn
  b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
  for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#1a2024", 2, 'opacity=".5"');
  b += rect(620, 724, 380, 8, "#fff", 'opacity=".05"') + haze(k, 800, 600, 380, "#cfe3e8", 0.1);
  return frame("Sảnh chung cư Sao Mai", defs, b);
}

// Phòng bảo vệ: tường màn hình camera, bàn điều khiển, giá đầu ghi hình
export function sgSecroom() {
  const k = "sgsr";
  const defs = blurs(k) +
    lin(`${k}-wall`, [[0, "#26352f"], [1, "#0e1613"]]) +
    lin(`${k}-floor`, [[0, "#3a4642"], [1, "#151c19"]]) +
    lin(`${k}-desk`, [[0, "#7a5a3a"], [1, "#2c1d10"]]);
  let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`) + rect(0, 0, 1600, 36, "#080d0b");
  b += rect(560, 38, 480, 12, "#dff3ff", 'rx="5"') + glow(k, 800, 50, 280, "#dff3ff", 0.25);

  // Tường 6 màn hình camera
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      const x = 470 + c * 212, y = 110 + r * 134, n = r * 3 + c;
      b += rect(x, y, 200, 122, "#04090c", 'rx="4"') + rect(x + 6, y + 6, 188, 110, n === 4 ? "#18323a" : "#0e1d24");
      b += rect(x + 6, y + 80, 188, 36, "#142a33") + circle(x + 50 + n * 12, y + 56, 8, "#2d4d57") + rect(x + 40 + n * 12, y + 62, 20, 34, "#2d4d57");
      b += rect(x + 10, y + 10, 52, 12, "#000", 'opacity=".5"') + circle(x + 16, y + 16, 3, "#ff4d4d");
    }
  }
  b += glow(k, 780, 240, 320, "#6fe0c8", 0.14);

  // Màn hình điều khiển trên bàn: nhật ký ra vào
  b += rect(760, 432, 220, 130, "#05090b", 'rx="6"') + rect(768, 440, 204, 112, "#0b2018");
  for (let i = 0; i < 6; i++) b += rect(778, 450 + i * 16, 120 + (i * 37) % 70, 6, "#4fe0a0", 'opacity=".75"');
  b += rect(850, 562, 24, 14, "#1a2420");

  // Giá đầu ghi hình bên phải
  b += rect(1060, 380, 240, 330, "#10181b", 'rx="6"') + rect(1070, 392, 220, 300, "#1b272b");
  for (let i = 0; i < 4; i++) {
    b += rect(1078, 400 + i * 72, 204, 60, "#0b1215", 'rx="4"');
    for (let j = 0; j < 6; j++) b += circle(1094 + j * 16, 420 + i * 72, 3, j % 3 === 0 ? "#ff4d4d" : "#4fe08a");
    b += rect(1190, 412 + i * 72, 80, 6, "#243138") + rect(1190, 426 + i * 72, 60, 6, "#243138");
  }

  // Camera treo tường: điểm điều tra
  b += rect(1150, 232, 52, 28, "#262a30", 'rx="5"') + circle(1150, 246, 9, "#0a0c10") + circle(1154, 246, 4, "#3b6fa0", 'opacity=".8"') + circle(1190, 238, 3, "#ff4d4d");
  b += path("M1202 246 L1240 232", "none", 'stroke="#262a30" stroke-width="8" stroke-linecap="round"');

  // Hải ngồi sau bàn, bác Lành đứng cạnh, áo mưa xanh lá treo trên móc
  b += figure(350, 380, 1, { top: "#2c5d86", hair: "hat", hc: "#2c5d86", skin: "#d9a77c", seated: true, mustache: true });
  b += rect(220, 580, 760, 24, "#a67c52", 'rx="4"') + rect(236, 604, 730, 118, `url(#${k}-desk)`) + rect(236, 604, 730, 6, "#000", 'opacity=".25"');
  b += rect(520, 556, 190, 22, "#10161a", 'rx="3"') + rect(280, 556, 70, 24, "#cfd8dc", 'rx="3"') + rect(1110, 560, 26, 20, "#e8e2d0", 'rx="3"');
  b += path("M696 290 L760 280 L774 410 Q730 440 690 410 Z", "#3da05a") + circle(726, 286, 5, "#22262c");
  b += path("M712 420 Q740 460 764 420", "none", 'stroke="#8fc3ff" stroke-width="3" opacity=".4"');
  b += figure(600, 450, 1, { top: "#4f6b3a", hair: "bald", hc: "#bbb", skin: "#c98f63" });

  b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
  for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#0b100e", 2, 'opacity=".5"');
  b += path("M700 780 Q740 770 780 786 Q750 806 700 800 Z", "#7fb6e0", 'opacity=".25"');
  return frame("Phòng bảo vệ", defs, b);
}

// Hầm B1 đang ngập: cột bê tông, nước phản chiếu, xe Mercedes, cửa thang bộ, vị trí thi thể được khoanh
export function sgGarage() {
  const k = "sggr";
  const defs = blurs(k) +
    lin(`${k}-ceil`, [[0, "#0a0d11"], [1, "#1c232b"]]) +
    lin(`${k}-wall`, [[0, "#222b32"], [1, "#12181d"]]) +
    lin(`${k}-water`, [[0, "#26414c"], [1, "#07161c"]]);
  let b = rect(0, 0, 1600, 900, `url(#${k}-wall)`) + rect(0, 0, 1600, 190, `url(#${k}-ceil)`);
  [160, 440, 760, 1080, 1360].forEach((x, i) => {
    b += rect(x, 40, 250, 16, "#0c1014") + (i % 2 ? rect(x + 10, 44, 230, 8, "#dff3ff", 'rx="4" opacity=".9"') + glow(k, x + 125, 50, 140, "#dff3ff", 0.28) : rect(x + 10, 44, 230, 8, "#394650", 'rx="4"'));
  });
  for (let i = 0; i < 3; i++) b += rect(0, 100 + i * 22, 1600, 8, "#2b343c") + line(0, 104 + i * 22, 1600, 104 + i * 22, "#0b0f13", 2);

  // Cột bê tông có đánh số ô và vạch đo nước
  [[560, 190], [1210, 160]].forEach(([x, w], i) => {
    b += rect(x, 190, w, 520, "#2d363d") + rect(x, 190, 10, 520, "#3c4750") + rect(x + w - 10, 190, 10, 520, "#1a2025");
    b += rect(x + 12, 340, w - 24, 34, "#d8c43a", 'rx="2" opacity=".85"') + txt(x + w / 2, 366, i ? "B1-08" : "B1-07", 22, "#1c1a08", 'text-anchor="middle"');
    for (let j = 0; j < 8; j++) b += line(x + w - 40, 520 + j * 24, x + w - 14, 520 + j * 24, "#e8e8e8", 2, 'opacity=".5"');
  });

  // Cửa thang bộ B1: cánh thép, biển EXIT, đầu đọc thẻ
  b += rect(250, 330, 190, 340, "#111820") + rect(260, 340, 170, 330, "#6c7a84") + rect(262, 342, 166, 326, "#8794a0") + line(345, 342, 345, 668, "#4b5964", 3);
  b += rect(268, 300, 154, 28, "#14b860", 'rx="4"') + glow(k, 345, 314, 80, "#32f08c", 0.35) + txt(345, 321, "THANG BỘ", 15, "#04140a", 'text-anchor="middle" letter-spacing="2"');
  b += rect(446, 480, 22, 44, "#1c232b", 'rx="3"') + circle(457, 494, 4, "#ffb000") + rect(450, 504, 14, 10, "#394650");
  b += rect(402, 500, 8, 40, "#d9d9d9", 'rx="3"');

  // Camera trần: điểm điều tra
  b += rect(990, 190, 40, 30, "#262a30", 'rx="5"') + circle(1000, 206, 8, "#0a0c10") + circle(1004, 206, 3, "#3b6fa0", 'opacity=".8"') + circle(1024, 196, 3, "#ff4d4d");

  // Nước ngập sàn hầm, ánh đèn phản chiếu, gợn sóng
  b += rect(0, 520, 1600, 380, `url(#${k}-water)`);
  for (let i = 0; i < 22; i++) b += path(`M${(i * 211) % 1600} ${560 + ((i * 53) % 300)} q30 -8 60 0`, "none", 'stroke="#a8e0f0" stroke-width="2" opacity=".18"');
  b += rect(180, 540, 180, 360, "#dff3ff", 'opacity=".05"') + rect(820, 540, 180, 360, "#dff3ff", 'opacity=".06"');
  for (let x = 90; x < 1600; x += 260) b += line(x, 600, x - 70, 900, "#d8c43a", 3, 'opacity=".25"');

  // Mercedes đen ở ô 07: thân ngập một phần
  b += sgCar(880, 640, 440, "#14181d", { glass: "#27384a" }) + rect(880, 640, 440, 90, `url(#${k}-water)`, 'opacity=".78"');
  b += glow(k, 1316, 614, 50, "#fff3c8", 0.5) + rect(1180, 566, 20, 8, "#2d3a44");

  // Chắn bánh xe bê tông và vị trí thi thể được khoanh bằng băng vàng
  b += rect(720, 668, 130, 24, "#6c7276", 'rx="2"') + rect(720, 668, 130, 6, "#9aa1a6");
  b += path("M640 700 Q700 660 790 676 Q880 690 920 720 Q860 760 760 756 Q670 752 640 700 Z", "none", 'stroke="#f4d03a" stroke-width="4" stroke-dasharray="14 8"');
  b += rect(760, 700, 18, 22, "#f4d03a", 'rx="2"') + txt(769, 717, "1", 14, "#222", 'text-anchor="middle"') + rect(860, 716, 18, 22, "#f4d03a", 'rx="2"') + txt(869, 733, "2", 14, "#222", 'text-anchor="middle"');
  b += path("M560 770 Q580 756 604 768 Q586 780 560 770 Z", "#c4a24a");
  b += glow(k, 770, 700, 120, "#f4d03a", 0.12) + haze(k, 800, 560, 420, "#dff3ff", 0.07);
  return frame("Hầm B1 đang ngập", defs, b);
}

// Penthouse tầng 27: cửa kính toàn cảnh nhìn ra thành phố, sofa, bàn làm việc lớn và két sắt âm tường
export function sgPenthouse() {
  const k = "sgph";
  const defs = blurs(k) +
    lin(`${k}-sky`, [[0, "#0a0f24"], [1, "#3a2a56"]]) +
    lin(`${k}-wall`, [[0, "#2a2530"], [1, "#14111a"]]) +
    lin(`${k}-floor`, [[0, "#4a3426"], [1, "#150e09"]]) +
    lin(`${k}-desk`, [[0, "#8a5e3a"], [1, "#2e1c0e"]]);
  let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`);

  // Cửa kính toàn cảnh: thành phố về đêm và dòng sông
  b += rect(60, 70, 1060, 560, "#05070f") + rect(70, 80, 1040, 540, `url(#${k}-sky)`);
  for (let i = 0; i < 40; i++) b += circle(80 + ((i * 479) % 1020), 90 + ((i * 53) % 200), 1.3, "#fff1d0", 'opacity=".55"');
  const tower = (x, w, h, col) => rect(x, 620 - h, w, h, col) + [0, 1, 2, 3, 4, 5, 6, 7].map((r) => rect(x + 6, 620 - h + 14 + r * 26, w - 12, 5, "#ffd27a", `opacity="${(0.15 + ((r * 37 + x) % 5) * 0.08).toFixed(2)}"`)).join("");
  b += tower(120, 90, 190, "#16152a") + tower(230, 70, 260, "#1c1a36") + tower(320, 110, 170, "#14132a") + tower(780, 80, 220, "#1a1833") + tower(880, 100, 160, "#15142a");
  b += path("M590 620 L610 190 L620 120 L630 190 L650 620 Z", "#221f40") + rect(612, 160, 16, 460, "#2d2a52", 'opacity=".6"');
  b += glow(k, 620, 130, 50, "#ff4fa3", 0.5) + circle(620, 118, 4, "#ff7ab8");
  b += path("M70 560 Q400 540 700 566 T1110 556 L1110 620 L70 620 Z", "#0d1a30") + line(70, 600, 1110, 596, "#4fd6c6", 2, 'opacity=".25"');
  [350, 570, 800].forEach((x) => { b += rect(x, 90, 10, 530, "#0b0d16"); });
  b += rect(70, 330, 1040, 10, "#0b0d16");
  for (let i = 0; i < 14; i++) b += line(110 + i * 70, 100 + (i % 3) * 40, 100 + i * 70, 140 + (i % 3) * 40, "#9fc3dd", 1.2, 'opacity=".28"');

  // Két sắt âm tường bên phải, bàn phím số: điểm điều tra
  b += rect(1190, 260, 170, 200, "#1b1f27", 'rx="6"') + rect(1202, 272, 146, 176, "#3a4350", 'rx="4"') + rect(1210, 280, 130, 160, "#4b5666", 'rx="3"');
  b += rect(1258, 320, 54, 70, "#10151b", 'rx="4"');
  for (let i = 0; i < 9; i++) b += rect(1264 + (i % 3) * 16, 326 + Math.floor(i / 3) * 16, 11, 11, "#9fb3c8", 'rx="2"');
  b += circle(1226, 360, 12, "#9aa3ad") + line(1226, 360, 1238, 350, "#2a3038", 3);
  b += rect(1240, 238, 70, 16, "#1b1f27", 'rx="3"') + glow(k, 1275, 300, 70, "#ffd27a", 0.14);

  // Sofa bên trái; Ngân đứng bên cửa kính, Vũ đứng cạnh sofa
  b += rect(250, 640, 460, 82, "#33333f", 'rx="14"') + rect(250, 596, 460, 56, "#3d3d4b", 'rx="14"');
  b += figure(330, 380, 1, { top: "#34495e", hair: "bun", hc: "#1a1410", skin: "#f5d6bc", glasses: true });
  b += rect(318, 408, 26, 20, "none", 'rx="4"');
  b += figure(600, 410, 1, { top: "#1f3a5f", hair: "short", hc: "#222", skin: "#e8bf98", tie: "#8e2c2c" });

  // Bàn làm việc lớn: điện thoại, lịch để bàn, đèn bàn có mẩu giấy dưới chân
  b += rect(780, 580, 500, 18, "#b88a5a", 'rx="4"') + rect(796, 598, 470, 130, `url(#${k}-desk)`) + rect(796, 598, 470, 6, "#000", 'opacity=".25"');
  b += rect(812, 548, 56, 32, "#e9e9ee", 'rx="6"') + rect(818, 554, 44, 20, "#142a40", 'rx="3"') + line(840, 548, 840, 520, "#555", 2);
  b += rect(940, 536, 96, 44, "#f3ead2", 'rx="3"') + rect(940, 536, 96, 10, "#a93226") + line(948, 556, 1028, 556, "#9a8a60", 2) + line(948, 566, 1010, 566, "#9a8a60", 2);
  b += rect(1110, 568, 40, 12, "#2a2e36", 'rx="3"') + rect(1127, 490, 6, 80, "#2a2e36") + path("M1096 492 Q1130 456 1164 492 Z", "#d9c37a") + glow(k, 1130, 500, 80, "#ffd27a", 0.45);
  b += rect(1114, 572, 32, 8, "#e9d73a", 'opacity=".9"');
  b += rect(1200, 560, 70, 20, "#151a20", 'rx="3"');

  // Ghế làm việc và thảm
  b += rect(930, 640, 70, 80, "#1c1a22", 'rx="10"');
  b += rect(280, 760, 520, 100, "#3a1e2c", 'opacity=".55"');

  b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
  for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#0b0705", 2, 'opacity=".5"');
  b += glow(k, 1130, 500, 160, "#ffd27a", 0.14) + haze(k, 640, 400, 460, "#4a3a90", 0.1);
  return frame("Penthouse tầng 27", defs, b);
}

// Ngã tư Hoàng Diệu về đêm trong mưa: nhà phố, dây điện, quán cà phê vỉa hè ngập nước, cột điện có vạch đo
export function sgStreet() {
  const k = "sgst";
  const defs = blurs(k) +
    lin(`${k}-sky`, [[0, "#090d20"], [1, "#2d2552"]]) +
    lin(`${k}-water`, [[0, "#26304f"], [1, "#0a0e1c"]]) +
    lin(`${k}-fade`, [[0, "#05070d", 0], [1, "#05070d", 0.8]]);
  let b = rect(0, 0, 1600, 900, `url(#${k}-sky)`);
  for (let i = 0; i < 26; i++) b += circle((i * 463) % 1600, (i * 137) % 220, 1.4, "#fff3d6", 'opacity=".5"');
  b += tubeSkyline();

  // Hai dãy nhà phố hai bên, xa nhỏ gần lớn
  b += sgHouse(k, 600, 560, 130, 250, { wall: "#2c2a48", seed: 1, neon: "#3fd6c6" }) + sgHouse(k, 740, 560, 120, 220, { wall: "#33284a", seed: 2 }) + sgHouse(k, 870, 560, 140, 270, { wall: "#2a3050", seed: 0, neon: "#ff4fa3" });
  b += sgHouse(k, -30, 740, 240, 600, { wall: "#4a3346", seed: 0, neon: "#ff4fa3" }) + sgHouse(k, 220, 680, 190, 450, { wall: "#3a3a58", seed: 1, neon: "#ffb347" });
  b += sgHouse(k, 1390, 740, 240, 600, { wall: "#3c3a4c", seed: 1, neon: "#3fd6c6" }) + sgHouse(k, 1180, 680, 200, 460, { wall: "#4a3a58", seed: 2 });
  b += wires(120, 4) + wires(190, 3);

  // Quán cà phê vỉa hè bên trái-giữa: mái hiên, quầy, ghế nhựa chìm nước
  b += rect(380, 400, 480, 300, "#161022") + rect(380, 380, 480, 26, "#8b2330") + rect(396, 406, 448, 8, "#e9b949", 'opacity=".5"');
  b += rect(430, 340, 380, 40, "#14101e", 'rx="6"') + txt(620, 370, "CÀ PHÊ VỢT · GÓC NGÃ TƯ", 20, "#ffd9a0", 'text-anchor="middle" letter-spacing="2"') + glow(k, 620, 360, 180, "#ffb347", 0.3);
  b += rect(400, 560, 440, 22, "#6a4a30") + rect(410, 582, 420, 120, "#2a1c12");
  b += figure(560, 400, 1, { top: "#00838f", hair: "bun", hc: "#2a1b10", skin: "#dba77e", outfit: "aodai" });
  b += rect(400, 560, 440, 22, "#6a4a30") + rect(410, 582, 420, 120, "#2a1c12");
  [[450, 1], [700, 2]].forEach(([x]) => { b += rect(x, 640, 40, 8, "#d94a4a") + rect(x + 6, 648, 28, 50, "#d94a4a"); });

  // Camera quán gắn dưới mái hiên: điểm điều tra
  b += rect(780, 290, 46, 26, "#262a30", 'rx="5"') + circle(780, 303, 8, "#0a0c10") + circle(784, 303, 4, "#3b6fa0", 'opacity=".8"') + circle(818, 296, 3, "#ff4d4d");
  b += path("M826 303 L850 292", "none", 'stroke="#262a30" stroke-width="7" stroke-linecap="round"');

  // Cột điện có vạch đo nước 35 cm, biển đường
  b += rect(1086, 250, 14, 500, "#2a2d36") + rect(1070, 270, 46, 8, "#2a2d36") + rect(1030, 430, 130, 34, "#0f6b4f", 'rx="4"') + txt(1095, 453, "HOÀNG DIỆU", 14, "#e9f6ee", 'text-anchor="middle" letter-spacing="1"');
  for (let i = 0; i < 6; i++) b += line(1100, 700 - i * 22, 1120, 700 - i * 22, "#ffd23a", 3, 'opacity=".9"');
  b += glow(k, 1093, 270, 70, "#ffd58a", 0.35);

  // Mặt đường ngập: nước phản chiếu neon, xe máy chìm nửa bánh
  b += rect(0, 560, 1600, 340, `url(#${k}-water)`);
  for (let i = 0; i < 18; i++) b += path(`M${(i * 173) % 1600} ${600 + ((i * 61) % 260)} q26 -7 52 0`, "none", 'stroke="#a8c8f0" stroke-width="2" opacity=".2"');
  b += rect(560, 580, 60, 320, "#ff4fa3", 'opacity=".06"') + rect(1000, 580, 80, 320, "#3fd6c6", 'opacity=".06"');
  [[300, 820], [980, 836]].forEach(([x, y]) => {
    b += circle(x, y, 34, "#0b0b10") + circle(x + 90, y, 34, "#0b0b10") + path(`M${x - 10} ${y - 22} Q${x + 30} ${y - 70} ${x + 80} ${y - 40} L${x + 110} ${y - 46} L${x + 100} ${y - 12} Z`, "#3b4a63");
    b += rect(x - 40, y + 4, 200, 60, `url(#${k}-water)`, 'opacity=".8"');
  });

  // Mưa
  let rain_ = "";
  for (let i = 0; i < 70; i++) {
    const x = (i * 73) % 1600, y = (i * 131) % 900;
    rain_ += line(x, y, x - 6, y + 20, "#9fc3dd", 1.2, `opacity=".35" style="animation-delay:-${((i * 0.13) % 1).toFixed(2)}s"`);
  }
  b += `<g class="rain">${rain_}</g>` + rect(0, 0, 1600, 900, `url(#${k}-fade)`, 'opacity=".5"');
  return frame("Ngã tư Hoàng Diệu", defs, b);
}

// Dải nhà cao tầng xa mờ ở chân trời của các cảnh phố Sài Gòn
export function tubeSkyline() {
  let s = "";
  [[40, 90, 160], [150, 70, 220], [260, 100, 140], [1180, 90, 200], [1290, 80, 250], [1390, 110, 170], [1500, 70, 210]].forEach(([x, w, h], i) => {
    s += rect(x, 560 - h, w, h, "#15142c");
    for (let r = 0; r < 6; r++) s += rect(x + 8, 560 - h + 14 + r * 22, w - 16, 4, "#ffd27a", `opacity="${(0.1 + ((r * 31 + i * 7) % 5) * 0.06).toFixed(2)}"`);
  });
  return s;
}

// Phòng giám định và dữ liệu: màn hình lớn, bảng bằng chứng, giá hồ sơ và bàn dài đặt các giấy tờ
export function sgLab() {
  const k = "sglab";
  const defs = blurs(k) +
    lin(`${k}-wall`, [[0, "#1c2a40"], [1, "#0b121e"]]) +
    lin(`${k}-floor`, [[0, "#2a3648"], [1, "#0c121b"]]) +
    lin(`${k}-table`, [[0, "#cfd8dc"], [1, "#6e7c86"]]);
  let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`) + rect(0, 0, 1600, 34, "#070b12");
  b += rect(520, 40, 560, 12, "#cfe8ff", 'rx="5"') + glow(k, 800, 52, 300, "#cfe8ff", 0.2);

  // Màn hình lớn trên tường: đường cong thủy triều
  b += rect(470, 90, 660, 330, "#05080e", 'rx="8"') + rect(482, 102, 636, 306, "#0a1a2c");
  for (let i = 0; i < 6; i++) b += line(500, 140 + i * 48, 1100, 140 + i * 48, "#1a3a5a", 1.5);
  b += path("M500 360 C580 360 620 170 700 170 C780 170 820 340 880 340 C940 340 980 140 1040 140 C1070 140 1090 220 1100 260", "none", 'stroke="#4fd6c6" stroke-width="4"');
  b += line(500, 196, 1100, 196, "#ff4fa3", 2, 'stroke-dasharray="8 6" opacity=".8"');
  b += glow(k, 800, 250, 280, "#4fd6c6", 0.12);

  // Bảng bằng chứng bên trái: ảnh ghim và dây đỏ
  b += rect(70, 120, 340, 380, "#5a432c", 'rx="6"') + rect(82, 132, 316, 356, "#8a6a44");
  [[110, 160], [230, 150], [320, 200], [130, 300], [260, 320]].forEach(([x, y], i) => {
    b += rect(x, y, 70, 56, "#f3ead2", 'transform="rotate(' + (i * 7 - 12) + " " + x + " " + y + ')"') + circle(x + 35, y + 4, 4, "#c0392b");
  });
  b += path("M145 164 L265 154 L355 204 L165 304 L295 324", "none", 'stroke="#c0392b" stroke-width="2.2"');

  // Giá hồ sơ và máy chủ bên phải
  b += rect(1250, 110, 280, 370, "#10161f", 'rx="6"');
  for (let i = 0; i < 5; i++) {
    b += rect(1262, 122 + i * 70, 256, 58, "#1b2432", 'rx="4"');
    for (let j = 0; j < 8; j++) b += circle(1280 + j * 14, 142 + i * 70, 3, j % 3 === 0 ? "#ff4d4d" : "#4fe08a");
  }

  // Bàn dài đặt giấy tờ, túi bằng chứng, laptop
  b += rect(220, 600, 1180, 20, `url(#${k}-table)`, 'rx="4"') + rect(240, 620, 1140, 110, "#1a2432") + rect(240, 620, 1140, 6, "#000", 'opacity=".3"');
  [[320, 580, -6], [520, 574, 4], [720, 580, -3], [900, 576, 5], [1090, 582, -5]].forEach(([x, y, r]) => {
    b += rect(x, y, 120, 26, "#f3ead2", `transform="rotate(${r} ${x} ${y})"`) + line(x + 10, y + 8, x + 100, y + 8, "#9a8a60", 2, `transform="rotate(${r} ${x} ${y})"`);
  });
  b += rect(1180, 540, 120, 60, "#2e3a46", 'rx="6"') + rect(1190, 548, 100, 42, "#0e2a3a") + glow(k, 1240, 570, 70, "#4fd6c6", 0.2);
  b += rect(280, 560, 44, 40, "#d9d9e0", 'rx="5" opacity=".75"') + rect(288, 540, 28, 24, "#fff", 'rx="3" opacity=".6"');

  b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
  for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#06090e", 2, 'opacity=".5"');
  b += haze(k, 800, 480, 420, "#cfe8ff", 0.08);
  return frame("Phòng giám định và dữ liệu", defs, b);
}

// Sài Gòn về đêm: nền cho màn hình chọn vụ án của vùng này
export function menuSg() {
  const k = "menusg";
  const defs = blurs(k) +
    lin(`${k}-sky`, [[0, "#0a0d24"], [0.55, "#3a2255"], [1, "#c24a7a"]]) +
    lin(`${k}-river`, [[0, "#3a2d5c"], [1, "#0a0c1c"]]) +
    lin(`${k}-fade`, [[0, "#06050c", 0], [0.5, "#06050c", 0.3], [1, "#06050c", 0.86]]);
  let b = rect(0, 0, 1600, 900, `url(#${k}-sky)`);
  for (let i = 0; i < 46; i++) b += circle((i * 571) % 1600, (i * 97) % 300, i % 3 ? 1.1 : 1.8, "#fff1d0", 'opacity=".55"');
  b += haze(k, 420, 200, 170, "#ffd0e6", 0.3) + circle(420, 200, 70, "#fbe4ef", 'opacity=".95"');

  // Dải nhà cao tầng thấp phía xa
  for (let i = 0; i < 26; i++) {
    const x = i * 66 - 20, h = 90 + ((i * 53) % 150);
    b += rect(x, 600 - h, 58, h, i % 2 ? "#26205a" : "#2e2670") + rect(x + 8, 600 - h + 12, 42, 4, "#ffd27a", 'opacity=".4"');
  }
  // Landmark 81: tháp thon cao ở bên phải
  b += path("M1130 620 L1160 180 L1176 90 L1188 60 L1200 90 L1216 180 L1246 620 Z", "#352e7c") + path("M1188 60 L1188 20", "none", 'stroke="#241f52" stroke-width="5"');
  for (let r = 0; r < 18; r++) b += rect(1166 + r * 0.6, 150 + r * 26, 44 - r * 1.2, 5, "#7be6ff", `opacity="${(0.25 + (r % 4) * 0.12).toFixed(2)}"`);
  b += glow(k, 1188, 60, 60, "#ff4fa3", 0.6) + circle(1188, 22, 5, "#ff7ab8");
  // Bitexco: tháp cánh buồm với sân bay trực thăng
  b += path("M880 620 L892 330 Q925 250 962 300 L978 620 Z", "#3a3290") + path("M962 300 Q1000 310 1008 360 L1006 392 Q990 344 962 332 Z", "#4a42a8") + circle(1006, 346, 9, "#4fd6c6", 'opacity=".75"');
  for (let r = 0; r < 10; r++) b += rect(902, 340 + r * 27, 56, 4, "#ffd27a", 'opacity=".45"');
  b += glow(k, 1006, 346, 40, "#4fd6c6", 0.4);
  // Cầu dây văng bắc qua sông
  b += path("M0 640 Q300 600 800 612 T1600 600", "none", 'stroke="#0a0a18" stroke-width="10"');
  [300, 560, 820].forEach((x) => { b += line(x, 612, x - 16, 470, "#0a0a18", 6) + path(`M${x - 140} 612 L${x - 16} 470 L${x + 140} 612`, "none", 'stroke="#0a0a18" stroke-width="2"'); });

  // Dòng sông phản chiếu neon, thuyền nhỏ
  b += rect(0, 560, 1600, 80, "#ff4fa3", 'opacity=".08"') + rect(0, 640, 1600, 260, `url(#${k}-river)`);
  for (let i = 0; i < 46; i++) b += rect((i * 97) % 1600, 650 + ((i * 41) % 230), 40 + (i % 5) * 16, 3, i % 2 ? "#ff4fa3" : "#4fd6c6", 'opacity=".28"');
  b += rect(1160, 650, 56, 250, "#7be6ff", 'opacity=".06"') + rect(900, 650, 70, 250, "#4fd6c6", 'opacity=".06"');
  b += path("M600 760 Q640 740 700 760 L690 776 Q640 782 610 776 Z", "#13112a") + circle(670, 750, 4, "#ffb347");
  b += rect(0, 0, 1600, 900, `url(#${k}-fade)`);
  return frame("Sài Gòn về đêm", defs, b);
}

