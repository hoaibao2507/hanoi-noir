/* =====================================================================
   Cảnh vụ s3 "Búp Sen Đen" (tháp Bitexco): sân đáp tầng 52, sảnh tầng 1, sảnh tiệc tầng 50, phòng chờ VIP tầng 51, phòng vận hành.
   Phòng giám định dùng lại cảnh sg_lab của vụ s1. Dùng bộ đồ nghề trong kit.js.
   ===================================================================== */

import { lin, rect, path, circle, line, txt, blurs, glow, haze, frame } from "./kit.js";
import { figure } from "./people.js";

// Camera treo tường: thân, ống kính, đèn đỏ (ok = false: đèn tắt)
const cam = (x, y, ok = true) =>
  rect(x - 24, y - 12, 48, 26, "#262a30", 'rx="5"') + circle(x - 24, y, 8, "#0a0c10") + circle(x - 20, y, 4, "#3b6fa0", 'opacity=".8"') + circle(x + 16, y - 6, 3, ok ? "#ff4d4d" : "#3a3a3e");

// Hoa sen: các cánh xếp quanh một tâm, mỗi cánh là một giọt nước hướng lên rồi xoay quanh tâm
const lotus = (cx, cy, n, len, col, op = 0.9) => {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = (i - (n - 1) / 2) * (150 / Math.max(1, n - 1));
    s += path(`M${cx} ${cy} Q${cx - len * 0.34} ${cy - len * 0.55} ${cx} ${cy - len} Q${cx + len * 0.34} ${cy - len * 0.55} ${cx} ${cy} Z`, col, `opacity="${op}" transform="rotate(${a.toFixed(1)} ${cx} ${cy})"`);
  }
  return s;
};

// Bầu trời Sài Gòn về đêm nhìn từ trên cao: dải sông, tòa tháp mảnh, các đốm đèn thành phố (tọa độ cảnh gốc)
function skyline(k, y0, o = {}) {
  let s = path(`M0 ${y0 + 40} C300 ${y0 + 10} 700 ${y0 + 70} 1100 ${y0 + 30} S1500 ${y0 + 20} 1600 ${y0 + 40} L1600 ${y0 + 90} L0 ${y0 + 90} Z`, "#5b88b6", 'opacity=".22"');
  for (let i = 0; i < 70; i++) {
    const x = (i * 281) % 1600, y = y0 + 20 + ((i * 97) % 110);
    s += circle(x, y, 1.6 + (i % 3) * 0.6, i % 4 === 0 ? "#7be6e0" : "#ffd58a", `opacity="${(0.35 + (i % 5) * 0.1).toFixed(2)}"`);
  }
  // Tòa tháp mảnh có kim ăng-ten ở xa
  const tx = o.towerX || 640, th = o.towerH || 290;
  s += path(`M${tx - 15} ${y0 + 40} L${tx - 11} ${y0 + 40 - th} L${tx + 11} ${y0 + 40 - th} L${tx + 15} ${y0 + 40} Z`, "#0b1020") + rect(tx - 2, y0 + 40 - th - 70, 4, 70, "#0b1020");
  for (let i = 0; i < 18; i++) s += rect(tx - 7, y0 + 40 - th + 10 + i * 14, 14, 3, "#7be6e0", 'opacity=".5"');
  s += circle(tx, y0 + 40 - th - 70, 3, "#ff4d4d");
  return s + glow(k, tx, y0 - th * 0.4, 70, "#4fd6c6", 0.18);
}

// Sân đáp trực thăng tầng 52 trong giông: chữ H, trực thăng, cửa cầu thang CS-52, camera trên cột đèn, thi thể giữa vòng tròn
export function sgBtxPad() {
  const k = "btp";
  const defs = blurs(k) +
    lin(`${k}-sky`, [[0, "#070916"], [0.55, "#1d1838"], [1, "#312a5a"]]) +
    lin(`${k}-deck`, [[0, "#303640"], [1, "#0d1016"]]) +
    lin(`${k}-heli`, [[0, "#323d52"], [1, "#10151f"]]);
  let b = rect(0, 0, 1600, 900, `url(#${k}-sky)`);
  b += haze(k, 300, 120, 360, "#5a4a8a", 0.5) + haze(k, 900, 60, 440, "#3a3560", 0.6) + haze(k, 1400, 150, 340, "#6a5aa0", 0.4);
  // Tia sét
  b += path("M330 0 L296 120 L346 138 L270 300 L322 314 L228 480", "none", 'stroke="#fff7d0" stroke-width="5" stroke-linejoin="round"') + path("M296 120 L240 210", "none", 'stroke="#fff7d0" stroke-width="3"') + glow(k, 290, 250, 150, "#e8e0ff", 0.4);
  b += rect(0, 540, 1600, 360, "#05060d") + skyline(k, 520, { towerX: 680, towerH: 280 });

  // Sàn sân đáp, lan can, đèn viền
  b += path("M0 640 L1600 640 L1600 900 L0 900 Z", `url(#${k}-deck)`) + rect(0, 630, 1600, 12, "#3d4450");
  for (let i = 0; i <= 16; i++) b += rect(i * 100 - 3, 596, 6, 40, "#29303a");
  b += line(0, 604, 1600, 604, "#3a424e", 3) + line(0, 620, 1600, 620, "#3a424e", 2);
  for (let i = 0; i < 9; i++) b += circle(100 + i * 190, 636, 5, "#ffb347") + glow(k, 100 + i * 190, 636, 30, "#ffb347", 0.35);

  // Vòng tròn và chữ H (đã bóp theo phối cảnh)
  b += `<ellipse cx="820" cy="750" rx="330" ry="76" fill="none" stroke="#e8e0c8" stroke-width="8" opacity=".85"/>` +
    `<ellipse cx="820" cy="750" rx="298" ry="64" fill="none" stroke="#e8e0c8" stroke-width="2" stroke-dasharray="10 8" opacity=".5"/>` +
    txt(0, 0, "H", 150, "#e8e0c8", 'text-anchor="middle" transform="translate(820 800) scale(1 .52)" opacity=".92"');

  // Cầu thang và cửa CS-52 bên trái, đầu đọc thẻ, đèn
  b += rect(40, 380, 320, 320, "#1b2029") + rect(28, 366, 344, 16, "#2d343f") + rect(110, 470, 140, 230, "#10141a") + rect(118, 478, 124, 222, "#1d252e");
  b += rect(262, 540, 20, 38, "#0b0e13", 'rx="3"') + circle(272, 554, 4, "#ff4d4d") + txt(180, 456, "CS-52", 17, "#d9ecef", 'text-anchor="middle" letter-spacing="2"');
  b += rect(150, 418, 60, 10, "#ffd58a") + glow(k, 180, 424, 110, "#ffd58a", 0.35);
  b += figure(440, 440, 1, { top: "#4d5a3a", hair: "short", hc: "#2a1e16", skin: "#dfae85" });

  // Trực thăng bên phải
  b += rect(1195, 468, 12, 40, "#202733") + path("M1010 478 Q1200 440 1460 484", "none", 'stroke="#1b212c" stroke-width="7"');
  b += path("M1390 540 L1570 512 L1580 536 L1396 584 Z", `url(#${k}-heli)`) + circle(1576, 522, 24, "none", 'stroke="#1b212c" stroke-width="5"');
  b += `<ellipse cx="1260" cy="560" rx="160" ry="78" fill="url(#${k}-heli)"/>` + path("M1120 560 Q1140 510 1210 506 L1230 560 Z", "#2c4a66", 'opacity=".8"');
  b += rect(1250, 530, 70, 34, "#ffd58a", 'rx="4" opacity=".55"') + rect(1235, 590, 150, 6, "#c0392b", 'opacity=".75"') + rect(1190, 546, 22, 28, "#10151f", 'rx="3"');
  b += line(1130, 646, 1400, 646, "#1b212c", 7) + line(1170, 628, 1166, 646, "#1b212c", 5) + line(1360, 628, 1364, 646, "#1b212c", 5);
  b += cam(1000, 250) + rect(995, 262, 10, 372, "#2a2d36");

  // Thi thể bà Thục Anh trên chữ H: áo dài đỏ, khăn voan trắng, tất lụa
  b += path("M742 744 Q790 722 868 728 Q936 734 948 752 Q870 772 764 766 Q734 762 742 744 Z", "#b3202a") +
    circle(728, 748, 17, "#e8c3a0") + path("M712 742 Q726 726 746 740 Q740 758 714 754 Z", "#1f1a17") +
    path("M772 732 Q802 716 842 726 L838 748 Q802 742 772 750 Z", "#f3f1ea") + path("M934 752 L968 760 L946 768 Z", "#e8c3a0");
  b += path("M880 790 L892 770 L904 790 Z", "#f4d03a") + line(640, 700, 1010, 700, "#f4d03a", 3, 'stroke-dasharray="14 8" opacity=".75"');

  // Cột đèn, cột gió, mưa
  b += rect(1495, 330, 8, 306, "#2a2d36") + path("M1503 340 L1566 352 L1562 370 L1503 364 Z", "#e8a542") + path("M1520 344 L1526 366 M1540 348 L1546 368", "none", 'stroke="#f4efe0" stroke-width="5"');
  b += glow(k, 1500, 330, 100, "#ffd58a", 0.35);
  let rain = "";
  for (let i = 0; i < 160; i++) {
    const x = (i * 59) % 1600, y = (i * 131) % 900;
    rain += line(x, y, x - 8, y + 26, "#9fc3dd", 1.2, `opacity=".35" style="animation-delay:-${((i * 0.11) % 1).toFixed(2)}s"`);
  }
  b += `<g class="rain">${rain}</g>` + rect(0, 650, 1600, 250, "#ffd58a", 'opacity=".03"') + haze(k, 820, 700, 420, "#6fa0c0", 0.08);
  return frame("Sân đáp trực thăng tầng 52", defs, b);
}

// Sảnh tầng 1 của tháp: vòm thép hình cánh sen, bảng chỉ dẫn các tầng, quầy an ninh, cụm thang máy
export function sgBtxLobby() {
  const k = "btl";
  const defs = blurs(k) +
    lin(`${k}-wall`, [[0, "#0b1424"], [1, "#1c2a40"]]) +
    lin(`${k}-floor`, [[0, "#4a5560"], [1, "#12161c"]]) +
    lin(`${k}-desk`, [[0, "#b99a72"], [1, "#4a3622"]]);
  let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`);
  // Kính mặt tiền nhìn ra phố mưa, vòm thép
  b += haze(k, 800, 300, 520, "#3a5a8a", 0.25);
  for (let i = 0; i < 6; i++) b += `<ellipse cx="${60 + i * 300}" cy="700" rx="150" ry="650" fill="none" stroke="#7a8a9a" stroke-width="7" opacity=".55"/>`;
  for (let i = 0; i < 40; i++) {
    const x = (i * 83) % 1600, y = (i * 61) % 600;
    b += line(x, y, x - 4, y + 18, "#9fc3dd", 1.1, 'opacity=".25"');
  }
  b += rect(0, 0, 1600, 40, "#070b12");
  // Đèn chùm hình sen
  b += glow(k, 800, 130, 180, "#ffd98e", 0.4) + lotus(800, 150, 9, 90, "#f6e7b8", 0.9) + line(800, 40, 800, 150, "#59636f", 3);

  // Cụm thang máy bên trái
  b += rect(20, 330, 270, 390, "#10151d") + rect(28, 340, 254, 380, "#2a313c");
  for (let i = 0; i < 3; i++) b += rect(40 + i * 82, 362, 74, 358, "#8d99a5") + line(77 + i * 82, 362, 77 + i * 82, 720, "#5a6672", 3) + rect(50 + i * 82, 334, 54, 20, "#05080e") + txt(77 + i * 82, 350, ["49", "50", "50"][i], 13, "#ffd27a", 'text-anchor="middle"');

  // Bảng chỉ dẫn các tầng (điểm điều tra)
  b += rect(690, 330, 220, 190, "#05080e", 'rx="6"') + rect(698, 338, 204, 174, "#0c1c2e") + glow(k, 800, 420, 140, "#7fc8ff", 0.22);
  b += txt(800, 364, "TẦNG CAO", 13, "#ffd27a", 'text-anchor="middle" letter-spacing="3"');
  [["52", "Sân đáp trực thăng"], ["51", "Phòng chờ VIP"], ["50", "Sảnh tiệc Búp Sen"], ["49", "Đài quan sát"]].forEach(([n, t], i) => {
    b += txt(716, 394 + i * 28, n, 17, "#7be6e0", "") + txt(752, 394 + i * 28, t, 14, "#cfe8ff", "");
  });

  // Trang đứng chờ bị giữ lại, máy ảnh đeo cổ
  b += figure(360, 470, 1, { top: "#3b6a6a", hair: "long", hc: "#2a1a14", skin: "#f4d6bd" });
  b += rect(342, 588, 36, 24, "#1b1f26", 'rx="4"') + circle(360, 600, 7, "#3b6fa0");

  // Quầy an ninh bên phải: màn hình, bìa hồ sơ, đèn bàn
  b += rect(990, 570, 320, 20, "#b99a72", 'rx="3"') + rect(1000, 590, 300, 130, `url(#${k}-desk)`) + rect(1000, 590, 300, 6, "#000", 'opacity=".25"');
  b += rect(1020, 470, 110, 80, "#05080e", 'rx="3"') + rect(1026, 476, 98, 64, "#14304a") + rect(1140, 480, 100, 70, "#05080e", 'rx="3"') + rect(1146, 486, 88, 54, "#1c4a3a");
  b += rect(1180, 556, 80, 14, "#f3ead2") + rect(1186, 548, 10, 10, "#c0392b") + rect(1204, 548, 10, 10, "#2f7d4f") + rect(1222, 548, 10, 10, "#2c5d86");
  b += rect(1100, 440, 60, 30, "#e8e2d0", 'rx="2"') + txt(1130, 460, "SƠ ĐỒ", 12, "#3b2a1b", 'text-anchor="middle"');

  b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
  for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#0b0d10", 2, 'opacity=".4"');
  b += rect(690, 722, 220, 160, "#7fc8ff", 'opacity=".05"') + haze(k, 800, 560, 460, "#cfe8ff", 0.06);
  return frame("Sảnh tầng 1 tháp Bitexco", defs, b);
}

// Sảnh tiệc Búp Sen tầng 50: cửa kính nhìn thành phố trong giông, đèn chùm sen, bàn giải thưởng, bục kịch bản, cửa phụ ra cầu thang
export function sgBtxHall() {
  const k = "bth";
  const defs = blurs(k) +
    lin(`${k}-sky`, [[0, "#070a1a"], [1, "#2a2450"]]) +
    lin(`${k}-floor`, [[0, "#3a2a22"], [1, "#0f0a08"]]) +
    lin(`${k}-cloth`, [[0, "#f6f1e4"], [1, "#b9b09a"]]);
  let b = rect(0, 0, 1600, 720, "#0e0c16");
  // Cửa kính lớn: bầu trời giông, thành phố phía dưới, tia sét
  b += rect(60, 100, 1480, 560, `url(#${k}-sky)`) + haze(k, 1150, 160, 300, "#6a5aa0", 0.45) + skyline(k, 470, { towerX: 330, towerH: 250 });
  b += path("M1180 100 L1150 210 L1196 224 L1130 360", "none", 'stroke="#fff7d0" stroke-width="4"') + glow(k, 1150, 250, 120, "#e8e0ff", 0.35);
  for (let i = 0; i <= 8; i++) b += rect(60 + i * 185 - 4, 100, 8, 560, "#07060c");
  b += rect(60, 96, 1480, 10, "#07060c") + rect(60, 656, 1480, 12, "#07060c");
  for (let i = 0; i < 70; i++) {
    const x = 70 + ((i * 97) % 1440), y = 110 + ((i * 53) % 540);
    b += line(x, y, x - 4, y + 16, "#9fc3dd", 1, 'opacity=".28"');
  }
  // Trần, đèn chùm hình sen, biển đêm tiệc
  b += rect(0, 0, 1600, 90, "#0a0912") + glow(k, 800, 130, 220, "#ffd98e", 0.35) + lotus(800, 160, 11, 110, "#f6e7b8", 0.88) + line(800, 60, 800, 160, "#59636f", 3);
  b += rect(300, 190, 600, 54, "#150f22", 'rx="5"') + txt(600, 224, "ĐÊM BÚP SEN · HẢI ĐĂNG CAPITAL 20 NĂM", 20, "#e9c46a", 'text-anchor="middle" letter-spacing="3"');
  b += cam(1010, 195);

  // Dàn nhạc dây ở xa bên trái, vài bàn tròn
  b += rect(80, 650, 340, 12, "#2a1a30");
  [[130], [200], [270], [340]].forEach(([x], i) => {
    b += figure(x, 560, 0.55, { top: "#202028", hair: i % 2 ? "bun" : "short", hc: "#1a1410", skin: "#e9c09b", seated: true }) + line(x - 16, 628, x + 20, 664, "#8a5a2a", 3);
  });
  [[560, 662], [960, 668]].forEach(([x, y]) => { b += `<ellipse cx="${x}" cy="${y}" rx="80" ry="14" fill="#efe9d8"/>` + rect(x - 4, y, 8, 40, "#b9b09a") + circle(x, y - 10, 5, "#ffd27a") + glow(k, x, y - 10, 28, "#ffd27a", 0.4); });

  // Ba người ở giữa
  b += figure(400, 470, 1, { top: "#1c2742", hair: "short", hc: "#1b1714", skin: "#e6bd96", tie: "#d4a82a" });
  b += figure(620, 490, 1, { top: "#7a2f3a", hair: "bun", hc: "#9d9d9d", skin: "#f2d2b6", glasses: true });
  b += figure(840, 470, 1, { top: "#202028", hair: "bun", hc: "#2b1b14", skin: "#e9c09b", scarf: "#c9a227" });

  // Bàn giải thưởng với sáu cúp sen pha lê (cúp số 3 đặt lệch), bục kịch bản, cửa phụ có đèn thoát hiểm
  b += rect(1050, 620, 240, 12, "#f4f0e6", 'rx="2"') + rect(1056, 632, 228, 92, `url(#${k}-cloth)`) + rect(1056, 632, 228, 6, "#000", 'opacity=".18"');
  for (let i = 0; i < 6; i++) {
    const x = 1086 + i * 38, off = i === 2 ? 16 : 0;
    b += lotus(x, 616 + off * 0.2, 5, 44, "#cfe8ff", 0.85) + rect(x - 11, 616, 22, 6, "#8aa0b4", 'rx="2"');
  }
  b += glow(k, 1170, 590, 120, "#cfe8ff", 0.18) + path("M1136 604 l8 -10 l8 10 z", "#f4d03a");
  b += rect(1260, 470, 70, 150, "#4a2f1c", 'rx="3"') + rect(1250, 458, 90, 14, "#6a4326") + rect(1266, 446, 56, 12, "#f3ead2") + rect(1292, 420, 4, 28, "#2a2e36") + circle(1294, 418, 5, "#2a2e36");
  b += rect(1430, 330, 140, 330, "#0d1118") + rect(1438, 340, 124, 320, "#1d252e") + rect(1470, 300, 60, 24, "#0a3a22", 'rx="3"') + txt(1500, 318, "THOÁT HIỂM", 11, "#7dffb0", 'text-anchor="middle"') + glow(k, 1500, 312, 60, "#4fe08a", 0.35);

  b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
  for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#0b0705", 2, 'opacity=".5"');
  b += glow(k, 800, 780, 260, "#ffd98e", 0.1) + haze(k, 800, 460, 460, "#6a5aa0", 0.07);
  return frame("Sảnh tiệc Búp Sen tầng 50", defs, b);
}

// Phòng chờ VIP tầng 51: ghế sofa nhìn từ phía sau với vũng máu, khay trà, điện thoại, gương trang điểm, cửa hành lang với camera hỏng
export function sgBtxLounge() {
  const k = "btg";
  const defs = blurs(k) +
    lin(`${k}-wall`, [[0, "#3a2420"], [1, "#170f0d"]]) +
    lin(`${k}-floor`, [[0, "#4a1e24"], [1, "#16090c"]]) +
    lin(`${k}-sofa`, [[0, "#9a2a34"], [1, "#4a1018"]]) +
    lin(`${k}-night`, [[0, "#070a1a"], [1, "#2c2650"]]);
  let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`) + rect(0, 0, 1600, 36, "#0c0807");
  for (let x = 40; x < 1600; x += 140) b += rect(x, 60, 100, 640, "#2c1a16", 'opacity=".5"') + rect(x + 10, 70, 80, 620, "none", 'stroke="#c9a227" stroke-width="2" opacity=".35"');

  // Cửa sổ lớn nhìn ra giông
  b += rect(660, 90, 320, 380, "#05070f") + rect(670, 100, 300, 360, `url(#${k}-night)`) + line(820, 100, 820, 460, "#0a0d14", 8) + line(670, 280, 970, 280, "#0a0d14", 8);
  b += path("M880 100 L862 190 L896 204 L850 300", "none", 'stroke="#fff7d0" stroke-width="3"') + glow(k, 870, 200, 80, "#e8e0ff", 0.35);

  // Bàn trang điểm và gương bên trái (có mẩu giấy giắt sau khung)
  b += rect(320, 280, 200, 290, "#c9a227", 'rx="10"') + rect(334, 294, 172, 262, "#8fa6b8", 'rx="8"') + rect(334, 294, 172, 262, "#dfe8ee", 'rx="8" opacity=".25"');
  b += rect(506, 520, 10, 18, "#f3ead2", 'transform="rotate(14 506 520)" opacity=".9"') + rect(300, 584, 240, 16, "#6a4326") + rect(316, 600, 208, 120, "#2c1a16");
  b += rect(340, 560, 14, 24, "#d98aa8", 'rx="4"') + rect(366, 556, 12, 28, "#8fc3d9", 'rx="4"') + rect(392, 566, 26, 18, "#ffd98e", 'rx="3"');
  b += glow(k, 420, 440, 120, "#ffd98e", 0.18);

  // Bàn phụ có điện thoại sáng màn hình
  b += rect(500, 576, 100, 12, "#6a4326") + rect(516, 588, 8, 130, "#2c1a16") + rect(576, 588, 8, 130, "#2c1a16");
  b += rect(540, 548, 28, 30, "#0b1220", 'rx="4"') + rect(544, 552, 20, 22, "#4fd6c6", 'opacity=".75"') + glow(k, 554, 562, 40, "#4fd6c6", 0.4);

  // Ghế sofa nhìn từ phía sau; vũng máu và vệt kéo trên thảm phía trước; đôi giày đỏ dưới ghế
  b += rect(620, 520, 330, 20, "#6a1018", 'rx="8"') + rect(610, 540, 350, 150, `url(#${k}-sofa)`, 'rx="14"') + rect(590, 560, 36, 130, "#7a1a22", 'rx="12"') + rect(944, 560, 36, 130, "#7a1a22", 'rx="12"');
  b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
  for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#0b0306", 2, 'opacity=".4"');
  b += `<ellipse cx="760" cy="760" rx="86" ry="22" fill="#4a0a10" opacity=".95"/>` + path("M690 750 Q630 770 560 764", "none", 'stroke="#4a0a10" stroke-width="12" stroke-linecap="round" opacity=".7"');
  b += path("M846 696 l30 -8 l8 14 l-30 10 z", "#c0182b") + path("M888 706 l30 -6 l6 14 l-30 8 z", "#c0182b");
  b += rect(760, 620, 90, 6, "#f3efe4", 'transform="rotate(-8 760 620)" opacity=".5"');

  // Bàn trà thấp với khay bạc, ấm và chén
  b += rect(900, 570, 160, 12, "#c9a227") + rect(910, 582, 8, 70, "#6a4326") + rect(1040, 582, 8, 70, "#6a4326");
  b += `<ellipse cx="980" cy="560" rx="62" ry="10" fill="#cfd6db"/>` + rect(964, 530, 34, 26, "#cfd6db", 'rx="6"') + rect(996, 540, 14, 10, "#cfd6db") + circle(1022, 552, 8, "#f6f1e4") + circle(944, 554, 8, "#f6f1e4");
  b += glow(k, 980, 540, 60, "#ffd98e", 0.18);

  // Ghế bành bên phải với túi xách, cửa hành lang và camera hỏng
  b += rect(1090, 580, 140, 110, "#6a1018", 'rx="14"') + rect(1090, 540, 140, 50, "#7a1a22", 'rx="12"') + rect(1130, 566, 54, 36, "#2a1a10", 'rx="6"') + path("M1142 566 q16 -22 32 0", "none", 'stroke="#2a1a10" stroke-width="4"');
  b += rect(1370, 250, 170, 470, "#10080a") + rect(1380, 262, 150, 458, "#2c1a16") + circle(1404, 500, 6, "#c9a227");
  b += cam(1230, 260, false) + rect(1222, 276, 16, 30, "#262a30");

  b += glow(k, 820, 460, 300, "#ffd98e", 0.12) + haze(k, 700, 440, 460, "#7a3a60", 0.08);
  return frame("Phòng chờ VIP tầng 51", defs, b);
}

// Phòng vận hành: tường màn hình camera, bảng báo động cửa, tổng đài, tủ chìa khóa, bảng thông báo và buồng máy thang nhìn qua kính
export function sgBtxOps() {
  const k = "bto";
  const defs = blurs(k) +
    lin(`${k}-wall`, [[0, "#222c36"], [1, "#10151b"]]) +
    lin(`${k}-floor`, [[0, "#323a44"], [1, "#0e1217"]]) +
    lin(`${k}-desk`, [[0, "#9fa9b2"], [1, "#4a5560"]]);
  let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`) + rect(0, 0, 1600, 36, "#080b0f");
  for (let x = 160; x < 1300; x += 260) b += rect(x - 70, 40, 140, 10, "#e8f2ff", 'rx="4" opacity=".9"') + glow(k, x, 54, 100, "#e8f2ff", 0.2);

  // Tường màn hình camera 4x3, một ô mất tín hiệu
  b += rect(110, 96, 590, 300, "#05080e", 'rx="6"');
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const x = 120 + c * 144, y = 106 + r * 96, none = r === 1 && c === 2;
    b += rect(x, y, 138, 90, none ? "#2a2c32" : ["#12304a", "#1c3a2c", "#2a2a40", "#33281c"][(r + c) % 4]);
    if (none) b += txt(x + 69, y + 54, "NO SIGNAL", 12, "#cfd6db", 'text-anchor="middle"');
    else b += rect(x + 20 + (c * 7) % 40, y + 40, 24, 36, "#6a7a8a", 'opacity=".5"');
  }
  b += glow(k, 400, 250, 280, "#4fd6c6", 0.1) + cam(760, 220);

  // Tổng đài nội bộ gắn tường (đường dây 2 có ống nghe)
  b += rect(540, 430, 190, 150, "#2a313a", 'rx="6"');
  for (let i = 0; i < 8; i++) b += rect(552 + (i % 4) * 42, 442 + Math.floor(i / 4) * 34, 34, 26, "#10151b", 'rx="3"') + circle(569 + (i % 4) * 42, 455 + Math.floor(i / 4) * 34, 4, i === 1 ? "#4fe08a" : "#3a424c");
  b += rect(562, 520, 150, 40, "#10151b", 'rx="6"') + rect(572, 530, 130, 8, "#f4d03a", 'opacity=".6"') + path("M570 550 Q630 580 700 546", "none", 'stroke="#05080e" stroke-width="7"');

  // Bàn điều khiển với màn hình nhật ký cửa (dòng báo động đỏ)
  b += rect(780, 590, 320, 20, `url(#${k}-desk)`, 'rx="3"') + rect(790, 610, 300, 110, "#1b232c") + rect(790, 610, 300, 6, "#000", 'opacity=".3"');
  b += rect(850, 410, 160, 124, "#05080e", 'rx="4"') + rect(858, 418, 144, 108, "#0b1c2c");
  [["D-51S", "HELD OPEN", "#ff6b5a"], ["CS-52", "OK", "#4fe08a"], ["D-50", "OK", "#4fe08a"], ["T3", "RESET", "#ffd27a"]].forEach(([a, st, col], i) => {
    b += txt(866, 442 + i * 24, a, 12, "#cfe8ff", "") + txt(996, 442 + i * 24, st, 11, col, 'text-anchor="end"');
  });
  b += glow(k, 930, 470, 110, "#7fc8ff", 0.2) + rect(870, 548, 120, 14, "#10151b", 'rx="3"');

  // Tủ chìa khóa cơ
  b += rect(220, 280, 120, 300, "#2f3a46", 'rx="4"') + rect(228, 288, 104, 284, "#10151b");
  for (let i = 0; i < 12; i++) b += rect(240 + (i % 3) * 32, 306 + Math.floor(i / 3) * 62, 18, 40, i === 4 ? "none" : "#c9a227", 'rx="3"');
  b += txt(280, 298, "SON-K1", 10, "#ffd27a", 'text-anchor="middle"');

  // Sơn đứng cạnh tủ chìa khóa, mũ bảo hộ vàng
  b += figure(400, 460, 1, { top: "#d97a1f", hair: "hat", hc: "#e0b21f", skin: "#c98f63", mustache: true });

  // Bảng thông báo bảo trì
  b += rect(1090, 400, 170, 220, "#6a4326", 'rx="4"') + rect(1100, 410, 150, 200, "#b88a58");
  [[1112, 424, -4], [1170, 430, 5], [1120, 500, 3], [1180, 520, -6]].forEach(([x, y, r]) => { b += rect(x, y, 58, 70, "#f3ead2", `transform="rotate(${r} ${x} ${y})"`) + circle(x + 29, y + 6, 4, "#c0392b"); });
  b += txt(1175, 392, "BẢO TRÌ", 13, "#ffd27a", 'text-anchor="middle" letter-spacing="2"');

  // Buồng máy thang sau kính bên phải: bánh quấn cáp và cáp thép
  b += rect(1320, 140, 270, 520, "#05080e") + rect(1330, 150, 250, 500, "#2a1a10") + rect(1330, 150, 250, 500, "#ff7a3a", 'opacity=".07"');
  [[1405, 270, 66], [1510, 330, 50]].forEach(([x, y, r]) => { b += circle(x, y, r, "#6a7580", 'stroke="#2a313a" stroke-width="10"') + circle(x, y, 10, "#2a313a"); for (let i = 0; i < 6; i++) b += line(x, y, x + r * Math.cos(i), y + r * Math.sin(i), "#2a313a", 4); });
  for (let i = 0; i < 6; i++) b += line(1360 + i * 42, 336, 1360 + i * 42, 640, "#cfd6db", 2, 'opacity=".6"');
  b += rect(1330, 620, 250, 20, "#f4d03a") + rect(1330, 620, 250, 20, "#05080e", 'opacity=".5" stroke="none"') + glow(k, 1450, 400, 160, "#ff7a3a", 0.18);
  b += rect(1310, 130, 12, 540, "#59636f") + rect(1580, 130, 12, 540, "#59636f");

  b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
  for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#06080a", 2, 'opacity=".5"');
  b += rect(0, 726, 1600, 8, "#f4d03a", 'opacity=".12"') + haze(k, 700, 500, 420, "#cfe8ff", 0.06);
  return frame("Phòng vận hành tháp", defs, b);
}
