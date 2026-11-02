import { WORLD_W, COMP_W, OX } from "../world/layout.js";
import { figure, portrait } from "./people.js";
/* =====================================================================
   HANOI NOIR · Minh họa SVG
   Toàn bộ hình ảnh vẽ bằng SVG (không dùng ảnh bitmap).
   Cảnh vẽ trên hệ tọa độ 1600 × 900 (16:9) để khớp với sân khấu toàn màn hình.
   Mỗi cảnh có tiền tố id riêng, nên nhiều cảnh có thể nằm chung trên một trang.
   ===================================================================== */
const ART = (() => {
  let seq = 0;
  const uid = (p) => `${p}${++seq}`;

  /* ---------- Tiện ích chung ---------- */
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Làm tối (amt < 0) hoặc làm sáng (amt > 0) một màu hex
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const mix = (v) => Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt);
    const r = mix(n >> 16), g = mix((n >> 8) & 255), b = mix(n & 255);
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  const stops = (list) =>
    list.map(([o, col, a = 1]) => `<stop offset="${o}" stop-color="${col}" stop-opacity="${a}"/>`).join("");
  const lin = (id, list, x1 = 0, y1 = 0, x2 = 0, y2 = 1) =>
    `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(list)}</linearGradient>`;
  const rect = (x, y, w, h, fill, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
  const path = (d, fill, extra = "") => `<path d="${d}" fill="${fill}" ${extra}/>`;
  const circle = (x, y, r, fill, extra = "") => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
  const line = (x1, y1, x2, y2, stroke, w = 2, extra = "") =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}" ${extra}/>`;
  const txt = (x, y, s, size, fill, extra = "") =>
    `<text x="${x}" y="${y}" font-family="'Noto Serif Display',Georgia,serif" font-size="${size}" fill="${fill}" ${extra}>${s}</text>`;

  // Bộ lọc làm mờ dùng chung cho đèn và sương (đặt id theo tiền tố cảnh)
  const blurs = (k) =>
    `<filter id="${k}-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="18"/></filter>` +
    `<filter id="${k}-haze" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="46"/></filter>`;
  const glow = (k, x, y, r, col, op = 0.55) => circle(x, y, r, col, `opacity="${op}" filter="url(#${k}-glow)"`);
  const haze = (k, x, y, r, col, op = 0.3) => circle(x, y, r, col, `opacity="${op}" filter="url(#${k}-haze)"`);
  const frame = (label, defs, body) =>
    `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(label)}"><defs>${defs}</defs>${body}</svg>`;

  /* ---------- Vật thể kiến trúc & đồ vật ---------- */

  // Đèn lồng: quả cầu thuôn, có nắp, dây treo và tua đỏ; quầng sáng nằm ngoài nhóm để không lắc theo
  function lantern(k, x, top, s = 1, col = "#c8242b") {
    const bw = 44 * s, bh = 58 * s, cy = top + 26 * s + bh / 2;
    const yT = cy - bh / 2, yB = cy + bh / 2, L = x - bw / 2, R = x + bw / 2;
    return glow(k, x, cy, 70 * s, "#ffb35c", 0.45) +
      `<g class="sway">` +
      line(x, top, x, top + 26 * s, "#140c07", 2 * s) +
      path(`M${L} ${yT} Q${x - bw * 0.72} ${cy} ${L} ${yB} L${R} ${yB} Q${x + bw * 0.72} ${cy} ${R} ${yT} Z`, col) +
      path(`M${x - bw * 0.18} ${yT + 6 * s} Q${x - bw * 0.3} ${cy} ${x - bw * 0.18} ${yB - 6 * s}`, "none",
        `stroke="#ffe0a0" stroke-opacity=".35" stroke-width="${3 * s}" stroke-linecap="round"`) +
      path(`M${L - 3 * s} ${yT} Q${x} ${yT - 10 * s} ${R + 3 * s} ${yT} Z`, "#2b1a0e") +
      path(`M${L - 3 * s} ${yB} Q${x} ${yB + 10 * s} ${R + 3 * s} ${yB} Z`, "#2b1a0e") +
      line(x, yB + 8 * s, x, yB + 22 * s, "#f2c94c", 2 * s) +
      `</g>`;
  }

  // Nhà ống Hà Nội: mặt đứng hẹp, mái ngói, cửa sổ có song sắt và ban công
  function tube(x, base, w, h, o = {}) {
    const top = base - h, wall = o.wall || "#6d4a31", roof = o.roof || "#2c1f18";
    const lit = o.lit || "#ffc66e", seed = o.seed || 0;
    const floors = o.floors || Math.max(2, Math.min(5, Math.round((h - 60) / 120)));
    const fh = (h - 60) / floors;
    let s = rect(x, top, w, h, wall);
    s += path(`M${x - 10} ${top + 14} L${x + w / 2} ${top - 28} L${x + w + 10} ${top + 14} Z`, roof);
    s += path(`M${x - 4} ${top + 8} L${x + w / 2} ${top - 18} L${x + w + 4} ${top + 8}`, "none",
      `stroke="${shade(roof, 0.25)}" stroke-width="3" stroke-dasharray="7 6"`);
    for (let f = 0; f < floors - 1; f++) {
      const wy = top + 60 + f * fh, wh = fh * 0.56;
      const on = (f + seed) % 3 !== 1;
      s += rect(x + w * 0.2, wy, w * 0.6, wh, on ? lit : "#171009", on ? 'opacity=".9"' : "");
      for (let g = 1; g < 4; g++) {
        const gx = x + w * 0.2 + (w * 0.6 * g) / 4;
        s += line(gx, wy, gx, wy + wh, "#1a120c", 2);
      }
      s += rect(x + w * 0.1, wy + wh, w * 0.8, 5, "#1a120c");
    }
    const dh = fh * 0.95;
    s += rect(x + w * 0.3, base - dh, w * 0.4, dh, "#120c08");
    s += rect(x + w * 0.44, base - dh + 8, w * 0.12, dh - 8, lit, 'opacity=".55"');
    return s;
  }

  // Bình gốm có thân, cổ và vài đường men sáng
  function vase(x, by, w, h, col) {
    return path(`M${x - w * 0.2} ${by} C${x - w * 0.62} ${by - h * 0.25} ${x - w * 0.5} ${by - h * 0.6} ${x - w * 0.3} ${by - h * 0.78} L${x - w * 0.22} ${by - h} L${x + w * 0.22} ${by - h} L${x + w * 0.3} ${by - h * 0.78} C${x + w * 0.5} ${by - h * 0.6} ${x + w * 0.62} ${by - h * 0.25} ${x + w * 0.2} ${by} Z`, col) +
      path(`M${x - w * 0.45} ${by - h * 0.42} Q${x} ${by - h * 0.36} ${x + w * 0.45} ${by - h * 0.42}`, "none", `stroke="${shade(col, 0.5)}" stroke-width="4"`) +
      path(`M${x - w * 0.3} ${by - h * 0.2} Q${x - w * 0.42} ${by - h * 0.55} ${x - w * 0.26} ${by - h * 0.8}`, "none", 'stroke="#fff" stroke-opacity=".28" stroke-width="4" stroke-linecap="round"') +
      rect(x - w * 0.22, by - h - 4, w * 0.44, 7, shade(col, -0.25), 'rx="3"');
  }

  // Bát sứ: thân bán cầu và miệng bát sáng
  function bowl(x, y, col, w = 60) {
    return path(`M${x - w / 2} ${y} Q${x} ${y + w * 0.5} ${x + w / 2} ${y} Z`, col) +
      path(`M${x - w / 2} ${y} Q${x} ${y - w * 0.18} ${x + w / 2} ${y} Q${x} ${y + 4} ${x - w / 2} ${y} Z`, shade(col, 0.35));
  }

  // Lotus (núm sen): nhiều cánh xếp quanh một tâm
  function lotus(x, y, s, col) {
    let d = "";
    [-64, -32, 0, 32, 64].forEach((a) => {
      d += path(`M${x} ${y} C${x - 9 * s} ${y - 6 * s} ${x - 8 * s} ${y - 26 * s} ${x} ${y - 30 * s} C${x + 8 * s} ${y - 26 * s} ${x + 9 * s} ${y - 6 * s} ${x} ${y} Z`,
        col, `transform="rotate(${a} ${x} ${y})"`);
    });
    return d + circle(x, y, 4 * s, shade(col, -0.3));
  }

  // Đèn nến: thân nến và ngọn lửa có quầng sáng
  function candle(k, x, y) {
    return rect(x - 7, y, 14, 50, "#f5efe0", 'rx="2"') +
      path(`M${x} ${y - 20} Q${x - 9} ${y - 2} ${x} ${y + 8} Q${x + 9} ${y - 2} ${x} ${y - 20} Z`, "#ffcf6b") +
      glow(k, x, y - 6, 42, "#ffd27a", 0.85);
  }

  /* ---------- Các cảnh ---------- */

  // Tiệm đồ cổ Hoa Sen: kệ bình gốm, tủ trưng bày có ô trống, quầy thu ngân
  function shop() {
    const k = "shop";
    const defs = blurs(k) +
      lin(`${k}-wall`, [[0, "#64412a"], [1, "#2b190c"]]) +
      lin(`${k}-floor`, [[0, "#7d4f2b"], [1, "#2a180b"]]) +
      lin(`${k}-win`, [[0, "#152845"], [1, "#2c3f63"]]) +
      lin(`${k}-glass`, [[0, "#d7f1f1", 0.45], [0.5, "#7fb7c4", 0.12], [1, "#dff5f5", 0.3]], 0, 0, 1, 1) +
      lin(`${k}-counter`, [[0, "#9a6a3c"], [1, "#3b2312"]]) +
      lin(`${k}-velvet`, [[0, "#9b2535"], [1, "#4a0f19"]]);
    let b = rect(0, 0, 1600, 900, `url(#${k}-wall)`);
    b += rect(0, 0, 1600, 70, "#1a100a");
    b += rect(560, 92, 480, 62, "#8b1e1e", 'rx="10"');
    b += rect(574, 104, 452, 38, "none", 'rx="6" stroke="#e9b949" stroke-width="2" opacity=".75"');
    b += txt(800, 134, "HOA SEN · CỔ VẬT", 30, "#f7d68a", 'text-anchor="middle" letter-spacing="4"');
    b += lantern(k, 330, 70, 1.05) + lantern(k, 1270, 70, 1.05);

    // Kệ gỗ bên trái với bình, bát và lọ
    [330, 470, 610].forEach((y) => {
      b += rect(60, y, 420, 14, "#7b4f2b") + rect(60, y + 14, 420, 6, "#3d2510");
    });
    b += vase(130, 330, 56, 118, "#2c5d86") + vase(240, 330, 46, 90, "#e8d9b5") + vase(360, 330, 60, 130, "#a8322a");
    b += bowl(150, 470, "#b7842e", 70) + bowl(290, 470, "#2f7d6d", 80);
    b += vase(200, 610, 80, 100, "#6b4423") + vase(390, 610, 44, 70, "#c9a227");

    // Cửa sổ nhìn ra phố đêm
    b += rect(1240, 210, 290, 330, "#4a2f1c");
    b += rect(1256, 226, 258, 298, `url(#${k}-win)`);
    b += glow(k, 1420, 300, 52, "#ffe2a0", 0.55) + circle(1420, 300, 14, "#fff3c4", 'opacity=".85"');
    b += path("M1256 470 Q1300 420 1340 460 Q1380 400 1420 450 Q1460 420 1514 470 L1514 524 L1256 524 Z", "#0d1a2c");
    b += line(1385, 226, 1385, 524, "#4a2f1c", 10) + line(1256, 375, 1514, 375, "#4a2f1c", 10);

    // Quyên đứng sau quầy (vẽ trước quầy để quầy che phần thân)
    b += figure(1300, 350, 1, { top: "#c8553d", hair: "long", hc: "#1f1a17", skin: "#f4d3b0" });

    // Tủ trưng bày: đế gỗ, mặt kính, ô trống (hộp trầm đã mất)
    b += rect(580, 600, 440, 130, "#4a2c17");
    for (let x = 620; x < 1000; x += 90) b += line(x, 618, x, 716, "#2e1a0c", 3);
    b += rect(556, 420, 488, 190, `url(#${k}-glass)`, 'stroke="#d8b77a" stroke-width="5"');
    b += rect(610, 548, 380, 40, `url(#${k}-velvet)`, 'rx="4"');
    b += rect(730, 486, 140, 66, "none", 'rx="6" stroke="#f7d68a" stroke-width="2.5" stroke-dasharray="7 6"');
    b += txt(800, 524, "ô trống", 18, "#f7d68a", 'text-anchor="middle" font-style="italic"');
    b += path("M640 548 Q650 520 668 524 Q676 540 672 548 Z", "#67b89e");
    b += circle(960, 530, 18, "#e8dcc0") + rect(950, 508, 20, 8, "#e8dcc0", 'rx="3"');
    b += path("M580 430 L640 430 L560 600 L556 600 Z", "#fff", 'opacity=".12"');

    // Quầy thu ngân: sổ thu chi, máy tính tiền
    b += rect(1120, 620, 400, 110, `url(#${k}-counter)`);
    b += rect(1108, 606, 424, 18, "#b07a44", 'rx="3"');
    b += rect(1190, 560, 100, 46, "#7b1e1e", 'rx="3"') + rect(1190, 560, 8, 46, "#4a0f0f");
    b += rect(1238, 566, 3, 36, "#e9b949") + line(1200, 572, 1270, 572, "#e9b949", 2, 'opacity=".6"');
    b += rect(1340, 544, 92, 62, "#3c4650", 'rx="6"') + rect(1344, 548, 84, 14, "#e9b949", 'rx="3"');
    b += rect(1356, 568, 30, 12, "#9fe0c8", 'rx="2"');

    // Sàn gỗ theo phối cảnh
    b += rect(0, 730, 1600, 170, `url(#${k}-floor)`);
    for (let i = -6; i <= 6; i++) b += line(800 + i * 60, 730, 800 + i * 220, 900, "#2a180b", 2, 'opacity=".5"');
    b += glow(k, 800, 40, 240, "#ffb35c", 0.3) + haze(k, 800, 480, 260, "#ffd58a", 0.12);
    return frame("Tiệm đồ cổ Hoa Sen", defs, b);
  }

  // Đám giỗ ở Hàng Đào: bàn thờ ba tầng, khung ảnh, bàn ăn và sổ ghi danh
  function altar() {
    const k = "altar";
    const defs = blurs(k) +
      lin(`${k}-wall`, [[0, "#43241a"], [1, "#160b06"]]) +
      lin(`${k}-floor`, [[0, "#4b2a18"], [1, "#1a0d06"]]) +
      lin(`${k}-ban`, [[0, "#c3262c"], [1, "#6d1215"]]) +
      lin(`${k}-alt`, [[0, "#7a4421"], [1, "#2b150a"]]) +
      lin(`${k}-cloth`, [[0, "#b02a31"], [1, "#55101a"]]) +
      lin(`${k}-frame`, [[0, "#f0d07a"], [1, "#7a5418"]]) +
      lin(`${k}-table`, [[0, "#8a5a33"], [1, "#3a2212"]]);
    let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`);
    for (let x = 80; x < 1600; x += 200) b += rect(x, 0, 4, 720, "#2c160b", 'opacity=".7"');
    b += rect(0, 150, 1600, 6, "#2c160b") + rect(0, 560, 1600, 6, "#2c160b");
    b += rect(0, 0, 1600, 40, "#0e0704");
    // Hai bức trướng đỏ thêu chữ vàng
    [[300], [1190]].forEach(([x]) => {
      b += path(`M${x} 40 H${x + 110} V${40 + 380} Q${x + 55} ${40 + 406} ${x} ${40 + 380} Z`, `url(#${k}-ban)`);
      b += rect(x + 12, 56, 6, 340, "#e9b949", 'opacity=".8"') + rect(x + 92, 56, 6, 340, "#e9b949", 'opacity=".8"');
      for (let i = 0; i < 4; i++) b += rect(x + 42, 92 + i * 72, 26, 44, "#f0c96a", 'rx="4" opacity=".85"');
    });
    b += lantern(k, 560, 90, 1.1) + lantern(k, 1040, 90, 1.1);

    // Bàn thờ ba tầng
    b += rect(440, 492, 720, 40, "#2b1509", 'rx="4"');
    b += rect(500, 440, 600, 52, `url(#${k}-alt)`);
    b += rect(520, 440, 560, 50, `url(#${k}-cloth)`);
    for (let i = 0; i < 25; i++) b += rect(506 + i * 24, 490, 8, 14, "#f0c96a", 'opacity=".8"');
    b += rect(560, 380, 480, 60, `url(#${k}-alt)`);
    b += rect(560, 380, 480, 6, "#f0d07a", 'opacity=".5"');
    // Khung ảnh tổ tiên
    b += rect(738, 208, 124, 12, "#8b1e1e", 'rx="3"');
    b += rect(736, 220, 128, 160, `url(#${k}-frame)`, 'rx="4"');
    b += rect(752, 236, 96, 134, "#1b120b");
    b += circle(800, 280, 26, "#6c6158") + path("M762 370 C762 326 780 316 800 316 C820 316 838 326 838 370 Z", "#6c6158");
    // Đèn nến, lư hương và khói
    b += candle(k, 686, 330) + candle(k, 914, 330);
    b += path("M776 440 Q776 410 800 406 Q824 410 824 440 Z", "#b8862e") + rect(768, 436, 64, 9, "#d9a54a", 'rx="3"');
    b += path("M800 400 q-12 -24 0 -46 q12 -22 0 -44", "none", 'stroke="#e6d9bd" stroke-width="3" stroke-linecap="round" class="smoke"');
    b += path("M806 398 q10 -20 -2 -40 q-10 -18 2 -34", "none", 'stroke="#e6d9bd" stroke-width="2" stroke-linecap="round" class="smoke" style="animation-delay:-2s"');
    // Mâm trái cây hai bên
    [600, 1000].forEach((x) => {
      b += path(`M${x - 34} 440 Q${x} 428 ${x + 34} 440 Q${x} 448 ${x - 34} 440 Z`, "#d9c9a0");
      b += circle(x - 10, 436, 8, "#f39c12") + circle(x + 10, 434, 8, "#f5b041");
    });

    // Khách ngồi sau bàn ăn (vẽ trước bàn)
    b += glow(k, 800, 300, 360, "#ffb05a", 0.18);
    b += figure(330, 390, 1.05, { top: "#7a3e8f", hair: "bun", hc: "#2b2b2b", skin: "#f0c9a0", seated: true, glasses: true });
    b += figure(1060, 370, 1, { top: "#4f6b3a", hair: "short", hc: "#3d2c20", skin: "#d9a77c", seated: true, mustache: true });
    b += figure(1210, 380, 0.95, { top: "#2f5d8a", hair: "long", hc: "#2a1b10", skin: "#e3b48b", seated: true });

    // Bàn ăn gia đình với bát đĩa
    b += rect(250, 556, 1100, 26, `url(#${k}-table)`, 'rx="4"');
    b += rect(276, 582, 18, 140, "#3a2212") + rect(1306, 582, 18, 140, "#3a2212") + rect(790, 582, 18, 140, "#3a2212");
    [380, 600, 820, 1040, 1240].forEach((x) => { b += bowl(x, 556, "#efe7d2", 64); });
    b += line(560, 546, 590, 530, "#d9c9a0", 3) + line(568, 546, 598, 530, "#d9c9a0", 3);

    // Sổ ghi danh trên bục gỗ
    b += rect(1234, 650, 20, 110, "#5a3620");
    b += path("M1190 640 L1300 620 L1300 650 L1190 668 Z", "#6b4423");
    b += path("M1196 606 L1296 588 L1296 614 L1196 630 Z", "#f3ead2");
    b += line(1246, 596, 1246, 622, "#c9b28a", 2);

    // Sàn gỗ tối và ánh đèn
    b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
    for (let i = -5; i <= 5; i++) b += line(800 + i * 70, 720, 800 + i * 260, 900, "#2b170b", 2, 'opacity=".5"');
    b += glow(k, 690, 300, 46, "#ffd27a", 0.7) + glow(k, 910, 300, 46, "#ffd27a", 0.7);
    return frame("Đám giỗ · Hàng Đào", defs, b);
  }

  // Đầu ngõ Hàng Bạc (đêm) và ngõ mưa đối diện nhà ông Tư
  function alley(rain) {
    const k = rain ? "alrain" : "alley";
    const defs = blurs(k) +
      lin(`${k}-sky`, [[0, "#0b1120"], [1, "#22304f"]]) +
      lin(`${k}-road`, [[0, "#232833"], [1, "#0d1016"]]) +
      lin(`${k}-ground`, [[0, "#2a2f3a"], [1, "#101218"]]) +
      lin(`${k}-cafe`, [[0, "#ffd58a"], [1, "#a8602a"]]) +
      lin(`${k}-fade`, [[0, "#06080d", 0], [1, "#06080d", 0.85]]);
    let b = rect(0, 0, 1600, 900, `url(#${k}-sky)`);
    for (let i = 0; i < 26; i++) b += circle((i * 463) % 1600, (i * 137) % 260, 1.4, "#fff3d6", 'opacity=".55"');
    b += path("M0 120 Q400 180 800 96 T1600 150", "none", 'stroke="#070a10" stroke-width="3"');
    b += path("M0 170 Q500 230 1000 150 T1600 200", "none", 'stroke="#070a10" stroke-width="2"');

    // Nhà ở cuối ngõ và hai dãy nhà hai bên (gần nhỏ dần về phía xa)
    b += tube(600, 540, 130, 270, { wall: "#1e2636", roof: "#121826", lit: "#ffbf66", seed: 1 });
    b += tube(760, 520, 110, 230, { wall: "#1b2333", roof: "#101623", lit: "#ffd27a", seed: 2 });
    b += tube(900, 540, 130, 300, { wall: "#202a3b", roof: "#131a28", lit: "#ffbf66", seed: 0 });
    b += tube(-30, 720, 230, 640, { wall: "#3a2d3f", roof: "#1d1620", lit: "#ffc66e", seed: 0 });
    b += tube(200, 640, 190, 470, { wall: "#4b3a2c", roof: "#23190f", lit: "#ffd27a", seed: 1 });
    b += tube(390, 560, 160, 360, { wall: "#2f4a4a", roof: "#172626", lit: "#ffb35c", seed: 2 });
    b += tube(1400, 720, 230, 640, { wall: "#3a3a45", roof: "#1c1c26", lit: "#ffc66e", seed: 1 });
    b += tube(1210, 640, 190, 470, { wall: "#5a3b2b", roof: "#24160e", lit: "#ffd27a", seed: 0 });
    b += tube(1050, 560, 160, 360, { wall: "#2c3f5a", roof: "#162030", lit: "#ffb35c", seed: 2 });

    // Mặt đường ướt phản chiếu đèn
    b += rect(0, 560, 1600, 340, `url(#${k}-ground)`);
    b += path("M0 900 L1600 900 L1080 560 L520 560 Z", `url(#${k}-road)`);
    b += path("M700 580 L780 900 L690 900 Z", "#ffd58a", 'opacity=".07"');
    b += path("M860 600 L900 900 L840 900 Z", "#ffb35c", 'opacity=".05"');

    // Cột đèn đường có camera an ninh (điểm điều tra)
    b += rect(634, 250, 12, 310, "#2a2d36");
    b += path("M640 250 L700 236", "none", 'stroke="#2a2d36" stroke-width="8" stroke-linecap="round"');
    b += rect(690, 226, 34, 12, "#2a2d36", 'rx="4"');
    b += glow(k, 706, 250, 90, "#ffd58a", 0.5);
    b += rect(622, 278, 46, 26, "#2a2a2e", 'rx="5"') + circle(622, 291, 8, "#15151a");
    b += circle(626, 291, 4, "#3b6fa0", 'opacity=".7"') + circle(660, 284, 3, "#ff4d4d");

    if (rain) {
      // Quán cà phê có cửa kính sáng và hai khách ngồi bên trong
      b += rect(1240, 380, 240, 260, `url(#${k}-cafe)`, 'rx="8"');
      b += rect(1236, 376, 248, 268, "none", 'rx="10" stroke="#3a2412" stroke-width="6"');
      b += line(1360, 380, 1360, 640, "#3a2412", 6) + line(1240, 500, 1480, 500, "#3a2412", 5);
      b += figure(1300, 480, 0.7, { top: "#3b2a1b", hair: "short", hc: "#222", skin: "#e0b48a", seated: true });
      b += figure(1420, 480, 0.7, { top: "#7a3e8f", hair: "long", hc: "#1f1a17", skin: "#f0c9a0", seated: true });
      b += glow(k, 1360, 520, 150, "#ffcf8a", 0.3);
      // Mưa rơi
      let rain_ = "";
      for (let i = 0; i < 70; i++) {
        const x = (i * 73) % 1600, y = (i * 131) % 900;
        rain_ += line(x, y, x - 6, y + 20, "#9fc3dd", 1.2, `opacity=".35" style="animation-delay:-${((i * 0.13) % 1).toFixed(2)}s"`);
      }
      b += `<g class="rain">${rain_}</g>`;
    } else {
      // Xe máy đỏ đậu ở lề đường
      b += circle(350, 826, 40, "#0d0d10") + circle(440, 826, 40, "#0d0d10");
      b += circle(350, 826, 22, "none", 'stroke="#55606b" stroke-width="4"') + circle(440, 826, 22, "none", 'stroke="#55606b" stroke-width="4"');
      b += path("M330 800 Q360 740 420 750 L470 730 Q485 760 462 790 L440 800 Q410 808 380 800 Z", "#c0392b");
      b += path("M380 748 L420 742 L424 756 L380 762 Z", "#7a1f17");
      b += rect(395, 790, 26, 10, "#eee", 'rx="2"');
      b += glow(k, 488, 746, 40, "#fff0b8", 0.8) + circle(488, 746, 8, "#fff0b8");
      // Khải tựa vào tường
      b += figure(1120, 470, 1.05, { top: "#2f5d8a", hair: "hat", hc: "#6b4a2b", skin: "#e3b48b", pants: "#23262d", scarf: "#f1c40f" });
      // Biển hiệu quán cà phê
      b += rect(1300, 300, 170, 48, "#8b1e1e", 'rx="6"');
      b += txt(1385, 333, "CÀ PHÊ", 22, "#f7d68a", 'text-anchor="middle" letter-spacing="3"');
      b += glow(k, 1385, 326, 110, "#ffb35c", 0.35);
    }
    b += rect(0, 640, 1600, 260, `url(#${k}-fade)`);
    return frame(rain ? "Ngõ đối diện, trời mưa" : "Đầu ngõ Hàng Bạc về đêm", defs, b);
  }

  // Phòng lưu trữ hồ sơ: tủ hồ sơ, bảng ghim và bàn làm việc có đèn
  function archive() {
    const k = "archive";
    const defs = blurs(k) +
      lin(`${k}-wall`, [[0, "#332e25"], [1, "#16130e"]]) +
      lin(`${k}-floor`, [[0, "#3a342b"], [1, "#1a1713"]]) +
      lin(`${k}-cab`, [[0, "#66717b"], [1, "#363e46"]]) +
      lin(`${k}-cork`, [[0, "#b08a5c"], [1, "#6c4f2e"]]) +
      lin(`${k}-desk`, [[0, "#7a5e3e"], [1, "#3a2b19"]]) +
      lin(`${k}-win`, [[0, "#22395a"], [1, "#0e1828"]]);
    let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`);
    b += rect(0, 716, 1600, 8, "#1a1712") + rect(0, 720, 1600, 180, `url(#${k}-floor)`);
    b += rect(560, 26, 480, 18, "#e6eef2", 'rx="4"') + haze(k, 800, 40, 360, "#dfeef5", 0.28);

    // Cửa sổ có rèm lá sách
    b += rect(110, 120, 360, 210, "#5a4a35");
    b += rect(122, 132, 336, 186, `url(#${k}-win)`);
    for (let i = 0; i < 9; i++) b += rect(122, 132 + i * 21, 336, 9, "#0b1320", 'opacity=".5"');

    // Bảng ghim giấy ghi chú
    b += rect(1160, 120, 330, 230, `url(#${k}-cork)`, 'rx="6"');
    b += rect(1160, 120, 330, 230, "none", 'rx="6" stroke="#4a3520" stroke-width="8"');
    b += rect(1196, 156, 110, 80, "#f6efd9", 'transform="rotate(-4 1251 196)"');
    b += rect(1330, 190, 116, 90, "#e8f0d0", 'transform="rotate(3 1388 235)"');
    b += rect(1206, 268, 150, 60, "#f7e2a0", 'transform="rotate(-2 1281 298)"');
    [[1214, 176], [1214, 192], [1214, 208]].forEach(([x, y]) => { b += rect(x, y, 80, 3, "#8a7a62"); });
    [[1346, 210], [1346, 226], [1346, 242]].forEach(([x, y]) => { b += rect(x, y, 84, 3, "#8a7a62"); });
    [[1222, 288], [1222, 304]].forEach(([x, y]) => { b += rect(x, y, 120, 3, "#8a6a2a"); });
    [[1251, 158], [1388, 192], [1281, 270]].forEach(([x, y]) => { b += circle(x, y, 4, "#c0392b"); });

    // Ba tủ hồ sơ kim loại
    [120, 320, 520].forEach((x) => {
      b += rect(x, 300, 180, 420, `url(#${k}-cab)`, 'rx="6"');
      for (let d = 0; d < 4; d++) {
        const dy = 318 + d * 100;
        b += rect(x + 12, dy, 156, 90, "#2b333b", 'rx="4"');
        b += rect(x + 66, dy + 36, 48, 8, "#c9a227", 'rx="3"');
        b += rect(x + 58, dy + 10, 64, 18, "#f4f0e4", 'rx="2"');
        b += txt(x + 90, dy + 24, ["HS 2019", "VỤ CŨ", "TÀI SẢN", "LƯU"][d], 11, "#2a2a2a", 'text-anchor="middle"');
      }
    });

    // Thùng carton ở góc phải
    b += rect(1392, 470, 120, 110, "#7a5c36", 'rx="4"');
    b += rect(1370, 580, 150, 130, "#8c6a3f", 'rx="4"') + rect(1370, 610, 150, 14, "#c9a46a", 'opacity=".7"');

    // Bàn làm việc và đèn bàn
    b += rect(880, 560, 520, 40, `url(#${k}-desk)`, 'rx="4"');
    b += rect(900, 600, 22, 120, "#2b1d10") + rect(1360, 600, 22, 120, "#2b1d10");
    b += path("M1100 468 L1030 556 L1190 556 Z", "#ffd27a", 'opacity=".22"');
    b += haze(k, 1080, 540, 130, "#ffd27a", 0.3);
    b += line(1000, 556, 1046, 420, "#2b2b2b", 8) + line(1046, 420, 1100, 438, "#2b2b2b", 8);
    b += path("M1090 426 L1130 440 L1100 468 Z", "#2b2b2b");
    b += rect(980, 550, 40, 10, "#2b2b2b", 'rx="3"');
    // Giấy tờ: biên lai quán bia (điểm điều tra)
    b += rect(1070, 550, 120, 46, "#f3ead2", 'transform="rotate(-3 1130 573)"');
    [[1084, 562], [1084, 574], [1084, 586]].forEach(([x, y]) => { b += rect(x, y, 90, 3, "#8a7a62"); });
    b += rect(930, 548, 120, 14, "#f3ead2", 'transform="rotate(2 990 555)"');
    b += circle(1290, 548, 16, "#efe6d0") + rect(1276, 546, 26, 4, "#efe6d0");
    b += rect(0, 716, 1600, 8, "#1a1712", 'opacity=".4"');
    return frame("Phòng lưu trữ hồ sơ", defs, b);
  }

  // Phòng tranh Thanh Trúc: tranh treo, bức tranh đã mất, quầy buffet và quầy giữ đồ
  function gallery() {
    const k = "gallery";
    const defs = blurs(k) +
      lin(`${k}-wall`, [[0, "#f0e3c6"], [1, "#cdb383"]]) +
      lin(`${k}-floor`, [[0, "#8c5a33"], [1, "#4a2b16"]]) +
      lin(`${k}-beam`, [[0, "#fff4cf", 0.65], [1, "#fff4cf", 0]]) +
      lin(`${k}-frame`, [[0, "#b68a3e"], [1, "#5c4016"]]) +
      lin(`${k}-sky`, [[0, "#8fb3c9"], [1, "#f0d9a6"]]) +
      lin(`${k}-lake`, [[0, "#2f5e8a"], [1, "#8fb3c9"]]) +
      lin(`${k}-door`, [[0, "#1a2a44"], [1, "#0c1422"]]) +
      lin(`${k}-buffet`, [[0, "#fffaf0"], [1, "#e8e0cc"]]) +
      lin(`${k}-rack`, [[0, "#6a4a2a"], [1, "#3f2a16"]]);
    let b = rect(0, 0, 1600, 660, `url(#${k}-wall)`);
    b += rect(0, 0, 1600, 60, "#2b2118");
    [260, 560, 800, 1040, 1340].forEach((x) => {
      b += rect(x - 16, 60, 32, 14, "#1a140e");
      b += path(`M${x - 14} 74 L${x + 14} 74 L${x + 170} 660 L${x - 170} 660 Z`, `url(#${k}-beam)`, 'opacity=".6"');
    });

    // Tranh 1: phong cảnh hồ núi
    b += rect(200, 170, 230, 200, `url(#${k}-frame)`, 'rx="3"');
    b += rect(216, 186, 198, 168, `url(#${k}-sky)`);
    b += path("M216 300 L290 230 L340 270 L380 220 L414 290 L414 354 L216 354 Z", "#4f6b5a");
    b += path("M216 318 Q300 300 414 326 L414 354 L216 354 Z", `url(#${k}-lake)`);
    // Tranh 2: khung đã mất, đèn rọi dịu trên bức tường trống
    b += glow(k, 800, 300, 240, "#fff1c8", 0.14);
    b += rect(620, 170, 360, 270, "none", 'stroke="#6b4e1c" stroke-width="6" stroke-dasharray="14 10" rx="2"');
    b += rect(760, 455, 80, 30, "#d8c490", 'rx="2"');
    b += txt(800, 475, "Thiếu Nữ Bên Hồ", 13, "#6b4e1c", 'text-anchor="middle" font-style="italic"');
    b += txt(800, 500, "ĐÃ MẤT", 11, "#a0301f", 'text-anchor="middle" letter-spacing="2"');
    // Tranh 3: trừu tượng cam và xanh
    b += rect(1080, 190, 220, 160, `url(#${k}-frame)`, 'rx="3"');
    b += rect(1096, 206, 188, 128, "#e8924a");
    b += circle(1200, 268, 46, "#f7c35a") + path("M1096 334 Q1150 280 1210 318 Q1250 300 1284 330 L1284 334 Z", "#1f6f74");
    b += rect(1380, 230, 100, 90, `url(#${k}-frame)`, 'rx="3"') + rect(1392, 242, 76, 66, "#2a6b6b");

    // Cửa kính ban công (điểm hỏi Phong)
    b += rect(120, 260, 150, 400, "#4a2e16", 'rx="4"');
    b += rect(134, 274, 122, 376, `url(#${k}-door)`);
    b += path("M134 274 Q170 330 140 650 L134 650 Z", "#f1e6cc", 'opacity=".85"');
    b += line(195, 274, 195, 650, "#4a2e16", 6);

    // Quầy buffet và khăn trải bàn
    b += rect(1000, 560, 500, 20, `url(#${k}-buffet)`, 'rx="3"');
    b += rect(1010, 580, 480, 70, "#f7f1e3");
    for (let x = 1030; x < 1490; x += 36) b += line(x, 582, x, 648, "#d8ccb0", 2);
    b += rect(1040, 520, 16, 40, "#2c4a2a", 'rx="4"') + rect(1080, 524, 14, 36, "#5a2a2a", 'rx="4"');
    b += circle(1200, 548, 14, "#efe6d0") + circle(1260, 548, 14, "#efe6d0") + circle(1320, 548, 14, "#efe6d0");

    // Quầy giữ đồ với giá treo áo, áo mù tạt ở số 7
    b += rect(1280, 380, 220, 96, `url(#${k}-rack)`, 'rx="4"');
    for (let i = 0; i < 6; i++) b += rect(1296 + i * 34, 396, 22, 18, "#f3ead2", 'rx="2"');
    b += path("M1464 430 L1490 420 L1496 540 L1462 552 Z", "#c8a02e");
    b += path("M1296 430 L1324 420 L1330 500 L1292 512 Z", "#3a3a40") + path("M1340 430 L1368 420 L1372 500 L1338 512 Z", "#2b2b30");
    b += rect(1290, 560, 210, 60, `url(#${k}-rack)`, 'rx="4"');

    // Khách: Nga bên tranh, Tuấn sau buffet, Phong cạnh cửa
    b += figure(560, 430, 1.05, { top: "#6c3483", hair: "bun", hc: "#5a3a2a", skin: "#f5d6bc", pants: "#3a2440" });
    b += figure(1110, 340, 1, { top: "#6b7a2e", hair: "short", hc: "#2b1d14", skin: "#d9a77c" });
    b += figure(300, 370, 1, { top: "#1b1b1b", hair: "long", hc: "#111", skin: "#e8bf98", pants: "#111", sex: "m" });

    // Sàn gỗ parquet và phản chiếu đèn
    b += rect(0, 660, 1600, 240, `url(#${k}-floor)`);
    [700, 740, 790, 850].forEach((y) => { b += line(0, y, 1600, y, "#2a170b", 2, 'opacity=".5"'); });
    b += path("M620 668 L980 668 L1200 900 L400 900 Z", "#ffe9b0", 'opacity=".05"');
    return frame("Phòng tranh Thanh Trúc", defs, b);
  }

  // Cổng phòng tranh và hẻm sau: cửa kính, bàn lễ tân, cửa hông và chiếc SUV trắng
  function gate() {
    const k = "gate";
    const defs = blurs(k) +
      lin(`${k}-lobby`, [[0, "#27303b"], [1, "#161b22"]]) +
      lin(`${k}-floor`, [[0, "#363f4a"], [1, "#1a1f27"]]) +
      lin(`${k}-glass`, [[0, "#1d2d46"], [1, "#0a1220"]]) +
      lin(`${k}-alley`, [[0, "#2a2d35"], [1, "#15171d"]]) +
      lin(`${k}-suv`, [[0, "#f3f6f8"], [1, "#b9c2ca"]]);
    let b = rect(0, 0, 800, 900, `url(#${k}-lobby)`);
    b += rect(0, 700, 800, 200, `url(#${k}-floor)`);
    b += rect(150, 40, 110, 12, "#e6eef2", 'rx="3"') + rect(500, 40, 110, 12, "#e6eef2", 'rx="3"');
    b += glow(k, 205, 60, 120, "#dfeef5", 0.25) + glow(k, 555, 60, 120, "#dfeef5", 0.25);

    // Cửa kính lối vào, nhìn ra phố có đèn đường
    b += rect(150, 180, 210, 530, "#3b4450", 'rx="6"');
    b += rect(166, 196, 178, 510, `url(#${k}-glass)`);
    b += glow(k, 255, 240, 70, "#ffd58a", 0.5);
    b += path("M166 500 L190 460 L220 470 L250 430 L290 450 L344 410 L344 706 L166 706 Z", "#0d1828");
    b += line(200, 196, 300, 706, "#ffffff", 3, 'opacity=".12"') + line(260, 196, 340, 500, "#ffffff", 2, 'opacity=".1"');
    b += rect(330, 420, 8, 60, "#c9a227", 'rx="3"');

    // Máy quét thẻ mời
    b += rect(392, 380, 44, 58, "#1e2a36", 'rx="6"') + rect(398, 388, 32, 22, "#7fd1b9", 'rx="3" opacity=".85"');
    b += glow(k, 414, 399, 36, "#7fd1b9", 0.5);

    // Bảo vệ Thảo đứng cạnh máy quét
    b += figure(430, 390, 1, { top: "#2c5d86", hair: "hat", hc: "#2c5d86", skin: "#c98f63", pants: "#1f2a38" });

    // Bàn lễ tân và sổ khách
    b += rect(600, 566, 200, 136, "#3a2f24");
    b += rect(590, 552, 220, 16, "#6b5438", 'rx="3"');
    b += path("M664 528 L736 528 L736 550 L664 550 Z", "#f3ead2") + line(700, 528, 700, 550, "#b9a078", 2);

    // Vách ngăn giữa sảnh và hẻm
    b += rect(800, 0, 26, 900, "#1a1f28");

    // Hẻm sau: tường, máy điều hòa, cửa hông và thùng nước
    b += rect(826, 0, 774, 640, `url(#${k}-alley)`);
    b += rect(900, 260, 80, 50, "#9aa3ab", 'rx="4"') + rect(1400, 220, 70, 44, "#9aa3ab", 'rx="4"');
    for (let i = 0; i < 4; i++) b += line(912 + i * 18, 270, 912 + i * 18, 300, "#5a646c", 2);
    b += rect(980, 330, 200, 370, "#3a444f", 'rx="4"') + rect(996, 346, 168, 340, "#2d363f");
    b += line(1080, 346, 1080, 686, "#222a31", 3);
    b += rect(1158, 500, 10, 40, "#c9a227", 'rx="3"');
    b += glow(k, 1080, 690, 80, "#ffd58a", 0.25);
    b += path("M1190 650 L1250 650 L1244 718 L1196 718 Z", "#2f6fa0") + path("M1192 652 L1248 652 L1248 662 L1192 662 Z", "#5aa6d6");
    b += rect(1180, 648, 80, 8, "#5aa6d6", 'rx="3"');

    // Người hút thuốc trước cửa hông (lưng quay ra)
    b += figure(1040, 420, 1, { top: "#1b1b1b", hair: "long", hc: "#111", skin: "#e8bf98", pants: "#111", sex: "m" });
    b += glow(k, 1090, 470, 14, "#ff9a3c", 0.9) + circle(1090, 470, 3, "#ff9a3c");

    // Camera an ninh trên tường hẻm (điểm điều tra)
    b += rect(1224, 290, 36, 10, "#444", 'rx="2"') + path("M1236 280 L1290 280 L1290 312 L1236 312 Z", "#2a2a2e", 'rx="4"');
    b += circle(1288, 296, 9, "#101014") + circle(1288, 296, 4, "#3b6fa0", 'opacity=".7"');

    // Chiếc SUV trắng đỗ sát lề
    b += circle(1310, 700, 26, "#111") + circle(1480, 700, 26, "#111");
    b += circle(1310, 700, 12, "#777") + circle(1480, 700, 12, "#777");
    b += path("M1262 676 L1266 628 Q1276 604 1326 602 L1436 600 Q1496 604 1522 640 L1530 676 Z", `url(#${k}-suv)`);
    b += path("M1292 630 L1338 626 L1338 660 L1288 660 Z", "#2b3a48") + path("M1352 626 L1426 624 L1452 660 L1352 660 Z", "#2b3a48");

    // Đèn đường và dây điện
    b += rect(1472, 120, 8, 440, "#2a2d36");
    b += glow(k, 1476, 110, 90, "#ffd58a", 0.45) + circle(1476, 116, 12, "#ffe6a8", 'opacity=".9"');
    b += path("M826 120 Q1100 200 1600 130", "none", 'stroke="#0a0c10" stroke-width="3"');
    b += rect(826, 700, 774, 200, "#262b33");
    b += path("M1020 740 L1180 740 L1120 820 L990 820 Z", "#ffe9b0", 'opacity=".05"');
    return frame("Cổng phòng tranh và hẻm sau", defs, b);
  }

  // Hành lang kỹ thuật: tủ điện, camera trần, đèn sự cố và lối thoát
  function corridor() {
    const k = "corridor";
    const defs = blurs(k) +
      lin(`${k}-ceil`, [[0, "#1d2530"], [1, "#0e131a"]]) +
      lin(`${k}-wall`, [[0, "#2a333e"], [1, "#171d25"]]) +
      lin(`${k}-floor`, [[0, "#2f3742"], [1, "#171c24"]]) +
      lin(`${k}-strip`, [[0, "#e8f6ff"], [1, "#e8f6ff", 0.2]]);
    let b = rect(0, 0, 1600, 900, "#131a22");
    b += path("M0 0 H1600 L1040 380 H560 Z", `url(#${k}-ceil)`);
    b += path("M0 0 L560 380 L560 640 L0 900 Z", `url(#${k}-wall)`);
    b += path("M1600 0 L1040 380 L1040 640 L1600 900 Z", `url(#${k}-wall)`);
    b += path("M0 900 L560 640 L1040 640 L1600 900 Z", `url(#${k}-floor)`);
    b += rect(560, 380, 480, 260, "#1f2832");

    // Đèn trần dài dẫn về phía cuối hành lang
    b += path("M780 0 H820 L842 370 H758 Z", `url(#${k}-strip)`, 'opacity=".55"');
    b += glow(k, 800, 60, 170, "#dff3ff", 0.3);

    // Ống dẫn trên tường hai bên
    b += line(0, 120, 560, 420, "#3b4650", 10) + line(1600, 120, 1040, 420, "#3b4650", 10);
    b += circle(260, 260, 16, "none", 'stroke="#c9a227" stroke-width="5"') + circle(1340, 260, 16, "none", 'stroke="#c9a227" stroke-width="5"');

    // Cửa thoát hiểm cuối hành lang với biển xanh
    b += rect(770, 430, 60, 210, "#0a0e13");
    b += rect(758, 300, 84, 30, "#1d6b4f", 'rx="4"');
    b += txt(800, 321, "LỐI THOÁT", 14, "#d6ffe9", 'text-anchor="middle" letter-spacing="2"');

    // Tủ điện bên trái và người đứng cạnh (Hoàng)
    b += rect(330, 420, 130, 220, "#3c4650", 'rx="6"');
    b += rect(346, 438, 98, 80, "#23292f", 'rx="4"');
    b += circle(380, 478, 18, "#111") + line(380, 478, 392, 466, "#e9b949", 2);
    b += circle(430, 478, 18, "#111") + line(430, 478, 424, 490, "#e9b949", 2);
    b += circle(390, 530, 5, "#ff4d4d") + circle(410, 530, 5, "#7fd1b9") + circle(430, 530, 5, "#f2c94c");
    b += rect(346, 560, 98, 60, "#2b3339", 'rx="4"');
    b += figure(520, 400, 1, { top: "#1f3a5f", hair: "short", hc: "#222", skin: "#f2cfae", tie: "#8e2c2c" });

    // Đèn sự cố pin dự phòng trên tường phải
    b += rect(1200, 240, 60, 26, "#e9f0f5", 'rx="4"');
    b += glow(k, 1230, 252, 70, "#ffffff", 0.5);

    // Camera trần (điểm điều tra)
    b += rect(790, 170, 20, 12, "#444");
    b += rect(770, 180, 60, 26, "#2b2b30", 'rx="5"');
    b += circle(770, 193, 6, "#0d1116") + circle(818, 186, 3, "#ff4d4d");

    // Sàn lưới kim loại
    for (let i = -6; i <= 6; i++) b += line(800 + i * 70, 900, 800 + i * 20, 640, "#4b5763", 2, 'opacity=".4"');
    return frame("Hành lang kỹ thuật", defs, b);
  }

  // Nhà ông Tư: phòng khách có cửa sổ mưa, tủ thờ với hộp trâm và bàn tiệc sáu người
  function banquet() {
    const k = "banquet";
    const defs = blurs(k) +
      lin(`${k}-wall`, [[0, "#4a2c18"], [1, "#241408"]]) +
      lin(`${k}-floor`, [[0, "#5a3a22"], [1, "#2b1a0e"]]) +
      lin(`${k}-win`, [[0, "#1a2740"], [1, "#0b1220"]]) +
      lin(`${k}-scroll`, [[0, "#f1e6c7"], [1, "#d9c8a0"]]) +
      lin(`${k}-table`, [[0, "#7d5130"], [1, "#3d2312"]]) +
      lin(`${k}-cab`, [[0, "#5e3a1c"], [1, "#2e1a0c"]]);
    let b = rect(0, 0, 1600, 760, `url(#${k}-wall)`);
    for (let x = 80; x < 1600; x += 160) b += rect(x, 40, 4, 720, "#2c170a", 'opacity=".5"');
    b += rect(0, 0, 1600, 40, "#140a05");

    // Đèn chùm ở giữa trần
    b += line(800, 0, 800, 70, "#2b1d12", 3);
    b += glow(k, 800, 110, 240, "#ffd27a", 0.4);
    b += path("M770 100 Q800 70 830 100 Q800 130 770 100 Z", "#c9a227") + circle(800, 110, 14, "#ffe7b0");

    // Cửa sổ có mưa rơi và đèn đường ngoài trời
    b += rect(60, 90, 380, 350, "#4a2c18", 'rx="4"');
    b += rect(74, 104, 352, 322, `url(#${k}-win)`);
    b += glow(k, 250, 380, 110, "#ffb35c", 0.22);
    let rain_ = "";
    for (let i = 0; i < 60; i++) {
      const x = 80 + ((i * 59) % 340), y = 110 + ((i * 89) % 300);
      rain_ += line(x, y, x - 5, y + 18, "#9fc3dd", 1.2, `opacity=".35" style="animation-delay:-${((i * 0.11) % 1).toFixed(2)}s"`);
    }
    b += `<g class="rain">${rain_}</g>`;

    // Bức hoành treo (cuốn thư)
    b += rect(748, 110, 104, 250, `url(#${k}-scroll)`, 'stroke="#6b4423" stroke-width="4"');
    [[780, 150, 120], [800, 140, 150], [820, 160, 110]].forEach(([x, y, h]) => { b += line(x, y, x, y + h, "#3b2a1b", 4, 'stroke-linecap="round"'); });
    b += rect(800, 300, 16, 18, "#b3261e", 'rx="2"');

    // Tủ thờ và hộp trâm (điểm điều tra)
    b += rect(1230, 330, 300, 410, `url(#${k}-cab)`, 'rx="6"');
    b += rect(1248, 350, 264, 370, "none", 'rx="4" stroke="#7a4e2a" stroke-width="3"');
    b += line(1380, 350, 1380, 720, "#7a4e2a", 3);
    b += circle(1360, 520, 9, "#c9a227") + circle(1400, 520, 9, "#c9a227");
    b += rect(1276, 266, 130, 70, "#6b4423", 'rx="8"') + rect(1284, 274, 114, 54, "#8a5a2b", 'rx="6"');
    b += lotus(1300, 320, 0.7, "#f2c94c") + lotus(1382, 320, 0.7, "#f2c94c");

    // Phòng khách: bàn tiệc và bát đĩa
    b += rect(360, 540, 800, 26, `url(#${k}-table)`, 'rx="4"');
    b += rect(380, 566, 16, 170, "#3d2312") + rect(1144, 566, 16, 170, "#3d2312");
    b += rect(640, 566, 16, 170, "#3d2312") + rect(880, 566, 16, 170, "#3d2312");
    b += path("M742 540 Q760 508 778 540 Z", "#f2e8d4") + path("M742 540 Q760 508 778 540", "none", 'stroke="#c9b28a" stroke-width="2"');
    b += path("M700 530 Q718 520 736 530 Q718 540 700 530 Z", "#efe6d0");
    b += circle(640, 528, 7, "#f39c12") + circle(656, 526, 7, "#f5b041") + circle(932, 528, 8, "#f39c12");
    b += path("M1020 528 Q1040 516 1060 528 Q1040 538 1020 528 Z", "#efe6d0");
    [470, 1010].forEach((x) => { b += path(`M${x - 12} 540 L${x + 12} 540 L${x + 10} 526 L${x - 10} 526 Z`, "#f2e8d4"); });

    // Sáu người trong nhà: hàng sau và hàng trước
    b += figure(330, 340, 1, { top: "#37474f", hair: "short", hc: "#222", skin: "#f0c9a0", seated: true, tie: "#b71c1c" });
    b += figure(560, 290, 0.95, { top: "#ad1457", hair: "long", hc: "#2a1b10", skin: "#f3d1ae", seated: true, glasses: true });
    b += figure(800, 240, 1, { top: "#5d4037", hair: "bald", hc: "#bbb", skin: "#e2b48a", seated: true, mustache: true });
    b += figure(1040, 290, 0.95, { top: "#00695c", hair: "bun", hc: "#1a1a1a", skin: "#f5d2b3", seated: true });
    b += figure(520, 530, 1.25, { top: "#f9a825", hair: "short", hc: "#3b2a1b", skin: "#f0c9a0", seated: true });
    b += figure(1080, 530, 1.25, { top: "#546e7a", hair: "hat", hc: "#8d6e63", skin: "#dba77e", seated: true, sex: "f" });

    // Sàn gỗ
    b += rect(0, 760, 1600, 140, `url(#${k}-floor)`);
    for (let i = -6; i <= 6; i++) b += line(800 + i * 70, 760, 800 + i * 260, 900, "#2b1a0e", 2, 'opacity=".5"');
    b += haze(k, 800, 520, 380, "#ffb05a", 0.16);
    return frame("Nhà ông Tư · phòng khách", defs, b);
  }

  // Phố cổ Hà Nội về đêm: nền cho màn hình chọn vụ án
  function menu() {
    const k = "menu";
    const defs = blurs(k) +
      lin(`${k}-sky`, [[0, "#111a30"], [0.55, "#3b2b4c"], [1, "#9a4a3a"]]) +
      lin(`${k}-fade`, [[0, "#0a0604", 0], [0.5, "#0a0604", 0.5], [1, "#0a0604", 0.92]]);
    let b = rect(0, 0, 1600, 900, `url(#${k}-sky)`);
    for (let i = 0; i < 40; i++) b += circle((i * 571) % 1600, (i * 97) % 380, i % 3 ? 1.2 : 1.9, "#fff1d0", 'opacity=".6"');
    b += haze(k, 1240, 180, 170, "#ffe6a6", 0.35) + circle(1240, 180, 78, "#fbeecb");

    // Các lớp nhà phố xếp chồng, xa mờ dần đến gần
    const layer = (base, hMin, hStep, wall, roof, seedBase) => {
      const widths = [120, 140, 110, 150, 130, 115, 140, 125, 135, 118, 145, 122, 138];
      let x = -30, i = 0, out = "";
      while (x < 1600) {
        const w = widths[i % widths.length];
        out += tube(x, base, w, hMin + ((i * hStep) % 120), { wall, roof, lit: "#ffc977", seed: seedBase + i });
        x += w + 6;
        i++;
      }
      return out;
    };
    b += layer(700, 220, 53, "#43304f", "#2a1d33", 0);
    // Dây đèn lồng đỏ căng ngang bầu trời
    b += path("M0 70 Q800 230 1600 70", "none", 'stroke="#140c07" stroke-width="2"');
    const yAt = (x) => { const t = x / 1600; return (1 - t) * (1 - t) * 70 + 2 * t * (1 - t) * 230 + t * t * 70; };
    for (let x = 90; x < 1600; x += 190) b += lantern(k, x, yAt(x), 0.7, x % 380 ? "#c8242b" : "#e0a030");
    b += layer(790, 260, 61, "#2e2038", "#1b1224", 5);
    b += layer(900, 300, 47, "#1d1420", "#0e0a12", 9);
    b += rect(0, 0, 1600, 900, `url(#${k}-fade)`);
    return frame("Phố cổ Hà Nội về đêm", defs, b);
  }

  /* ---------- Cảnh camera an ninh (khung nhỏ 320 × 190) ---------- */
  function camBody(k, kind) {
    if (kind === "cam_moto") {
      return rect(0, 0, 320, 190, "#101722") +
        rect(0, 0, 70, 120, "#2a2f3a") + rect(14, 40, 40, 30, "#ffd27a", 'opacity=".3"') +
        rect(250, 0, 70, 120, "#262b36") + rect(262, 40, 50, 20, "#8b1e1e", 'rx="3"') +
        txt(287, 55, "HOA SEN", 8, "#f7d68a", 'text-anchor="middle"') +
        rect(0, 120, 320, 70, "#1b2430") + line(0, 150, 320, 150, "#2a3644", 2, 'opacity=".5"') +
        glow(k, 160, 110, 60, "#ffd27a", 0.35) +
        rect(156, 30, 6, 90, "#2a2d36") +
        circle(124, 150, 12, "#111") + circle(196, 150, 12, "#111") +
        circle(124, 150, 5, "#666") + circle(196, 150, 5, "#666") +
        path("M118 130 L150 118 L178 124 L200 126 L196 136 L140 140 Z", "#c0392b") +
        circle(204, 128, 6, "#fff0b8") + rect(150, 134, 16, 7, "#eee", 'rx="1"');
    }
    if (kind === "cam_suv") {
      return rect(0, 0, 320, 190, "#151b24") +
        rect(0, 0, 90, 110, "#2d3440") + rect(30, 40, 40, 70, "#3a2a1a") + rect(36, 46, 28, 60, "#ffd27a", 'opacity=".3"') +
        rect(0, 110, 320, 80, "#1d2630") +
        glow(k, 240, 60, 60, "#ffd27a", 0.3) +
        path("M170 150 L172 118 Q180 104 210 104 L260 102 Q282 104 300 124 L302 150 Z", "#e8ecef") +
        path("M190 110 L214 108 L214 124 L186 124 Z", "#2b3a48") + path("M220 108 L256 108 L274 124 L220 124 Z", "#2b3a48") +
        circle(195, 152, 12, "#111") + circle(290, 152, 12, "#111") +
        circle(195, 152, 5, "#777") + circle(290, 152, 5, "#777") +
        circle(130, 92, 9, "#d9a77c") +
        rect(120, 102, 24, 34, "#c8b03a", 'rx="5"') +
        rect(122, 134, 8, 30, "#222") + rect(134, 134, 8, 30, "#222") +
        line(112, 118, 152, 132, "#7b5b3a", 9, 'stroke-linecap="round"');
    }
    if (kind === "cam_corridor") {
      return rect(0, 0, 320, 190, "#1c2430") +
        path("M0 190 L320 190 L230 132 L90 132 Z", "#2a323d") +
        rect(212, 46, 72, 84, "#3c4650") +
        rect(224, 62, 48, 7, "#c9a227") + rect(224, 78, 48, 7, "#c9a227", 'opacity=".4"') + rect(224, 94, 48, 7, "#c9a227") +
        glow(k, 160, 40, 70, "#dff3ff", 0.35) +
        circle(150, 96, 9, "#e0b98e") + rect(139, 106, 22, 40, "#1f3a5f", 'rx="4"') +
        rect(139, 146, 8, 26, "#222") + rect(153, 146, 8, 26, "#222");
    }
    if (kind === "cam_sg_lobby") {
      return rect(0, 0, 320, 190, "#10181c") +
        rect(0, 120, 320, 70, "#2a3236") + line(0, 150, 320, 150, "#3a4448", 2, 'opacity=".5"') +
        rect(20, 30, 90, 90, "#c3ccd0") + line(65, 30, 65, 120, "#5a666a", 2) + rect(44, 18, 42, 10, "#04080a") + rect(52, 20, 14, 6, "#ff7a45") +
        rect(120, 30, 90, 90, "#b4bec2") + line(165, 30, 165, 120, "#5a666a", 2) +
        rect(250, 30, 70, 100, "#06080a") + rect(256, 38, 58, 8, "#14b860", 'opacity=".8"') +
        circle(70, 96, 9, "#f3d1ae") + rect(60, 106, 20, 38, "#b5446e", 'rx="4"') + rect(61, 142, 7, 20, "#222") + rect(72, 142, 7, 20, "#222") +
        glow(k, 160, 20, 70, "#dff3ff", 0.28);
    }
    if (kind === "cam_sg_garage") {
      return rect(0, 0, 320, 190, "#0a1014") + rect(0, 0, 320, 40, "#12181e") +
        rect(30, 40, 26, 100, "#2d363d") + rect(250, 40, 30, 100, "#2d363d") +
        rect(0, 110, 320, 80, "#0f2a34") + line(0, 130, 320, 130, "#a8e0f0", 1, 'opacity=".2"') +
        rect(110, 44, 70, 76, "#1a222a") + rect(116, 50, 28, 70, "#8d9aa3") + rect(146, 50, 28, 70, "#6c7a84") +
        circle(150, 96, 8, "#e0b98e") + rect(139, 104, 22, 40, "#6b7a2e", 'rx="4"') + rect(140, 142, 8, 22, "#222") + rect(152, 142, 8, 22, "#222") +
        glow(k, 160, 18, 80, "#dff3ff", 0.28);
    }
    if (kind === "cam_sg_sec") {
      return rect(0, 0, 320, 190, "#0e1614") +
        rect(20, 16, 280, 60, "#06090b") + [0, 1, 2, 3].map((i) => rect(28 + i * 68, 22, 60, 48, "#16313a")).join("") +
        rect(40, 118, 240, 18, "#6a4a30") + rect(60, 136, 200, 54, "#2b1d10") +
        circle(120, 96, 9, "#d9a77c") + rect(108, 106, 24, 34, "#2c5d86", 'rx="4"') + rect(104, 98, 32, 8, "#2c5d86", 'rx="3"') +
        rect(176, 96, 70, 22, "#04080a", 'rx="2"') + rect(182, 100, 40, 3, "#4fe0a0") + rect(182, 108, 54, 3, "#4fe0a0", 'opacity=".6"') +
        glow(k, 160, 14, 90, "#dff3ff", 0.25);
    }
    if (kind === "cam_sg_cafe") {
      let c = rect(0, 0, 320, 190, "#0b1020") + rect(0, 110, 320, 80, "#17213a") + rect(180, 20, 8, 110, "#2a2d36") +
        glow(k, 184, 30, 40, "#ffd58a", 0.6) + rect(20, 40, 110, 70, "#1c1630") + rect(30, 50, 90, 14, "#e9b949", 'opacity=".5"') +
        circle(236, 76, 8, "#e0b98e") + path("M222 84 Q236 80 252 86 L258 130 L218 130 Z", "#e9d73a") + rect(224, 128, 7, 22, "#222") + rect(240, 128, 7, 22, "#222") +
        rect(190, 138, 90, 30, "#17213a", 'opacity=".7"') + `<g class="rain">`;
      for (let i = 0; i < 30; i++) c += line((i * 41) % 320, (i * 57) % 170, ((i * 41) % 320) - 5, ((i * 57) % 170) + 14, "#8fb3d1", 1.2, 'opacity=".35"');
      return c + `</g>`;
    }
    if (kind === "cam_sg_gala") {
      return rect(0, 0, 320, 190, "#1a1020") + rect(70, 20, 180, 56, "#2a1a38") + rect(80, 28, 160, 40, "#3a2250") +
        rect(150, 36, 20, 30, "#c8a24a") + circle(160, 32, 6, "#e0b98e") +
        rect(0, 120, 320, 70, "#2a1e22") +
        [[50, 120], [160, 130], [270, 120]].map(([x, y], i) => circle(x, y, 28, i === 1 ? "#4a2e3e" : "#3a2430") + circle(x - 16, y - 18, 6, i === 1 ? "#f0e0c8" : "#6a4a5a") + circle(x + 18, y - 14, 6, "#6a4a5a")).join("") +
        circle(160, 130, 20, "#4a2e3e") + rect(150, 100, 20, 8, "none", 'stroke="#ffd27a" stroke-dasharray="3 3"') +
        glow(k, 160, 40, 80, "#ffd27a", 0.3);
    }
    // cam_rain
    let s = rect(0, 0, 320, 190, "#0b1118") + rect(0, 118, 320, 72, "#1a2028") + rect(40, 40, 70, 78, "#3d2c1a", 'opacity=".8"');
    s += glow(k, 200, 96, 34, "#ffe2a0", 0.6) + circle(200, 96, 10, "#ffe2a0", 'opacity=".5"');
    s += `<g class="rain">`;
    for (let i = 0; i < 34; i++) {
      const x = (i * 37) % 320, y = (i * 53) % 170;
      s += line(x, y, x - 5, y + 14, "#8fb3d1", 1.2, 'opacity=".35"');
    }
    s += `</g>` + rect(0, 0, 320, 190, "#0b1118", 'opacity=".3"');
    return s;
  }
  const CAM_DEFS = (k) => blurs(k);

  /* ---------- Hình minh họa chứng cứ ---------- */

  // Hồ sơ giấy: trang giấy cũ có tiêu đề, dòng chữ và dấu mộc
  function paper(o) {
    const k = uid("pap");
    const rows = o.rows.map((row, i) =>
      `<text x="34" y="${76 + i * 22}" font-family="'Be Vietnam Pro',Arial,sans-serif" font-size="13" fill="#3b2a1b">${esc(row)}</text>`).join("");
    const stamp = o.stamp
      ? `<g transform="rotate(-9 252 140)"><rect x="196" y="122" width="112" height="36" rx="5" fill="none" stroke="#a93226" stroke-width="3"/>` +
        `<text x="252" y="146" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="15" fill="#a93226" letter-spacing="1">${esc(o.stamp)}</text></g>`
      : "";
    return `<svg viewBox="0 0 320 190" role="img" aria-label="${esc(o.alt)}">` +
      `<defs>${lin(`${k}-p`, [[0, "#fbf3dc"], [1, "#ecdcb3"]])}${lin(`${k}-w`, [[0, "#7a5530"], [1, "#4a2e18"]], 0, 0, 1, 1)}</defs>` +
      `<rect width="320" height="190" fill="url(#${k}-w)"/>` +
      `<path d="M22 14 L300 10 L304 180 L18 184 Z" fill="url(#${k}-p)"/>` +
      `<circle cx="268" cy="150" r="22" fill="none" stroke="#7a4a1a" stroke-width="3" opacity=".2"/>` +
      `<text x="160" y="40" text-anchor="middle" font-family="Georgia,serif" font-size="15" font-weight="700" fill="#2b1d12" letter-spacing="1">${esc(o.title)}</text>` +
      `<line x1="30" y1="52" x2="290" y2="50" stroke="#b9a078" stroke-width="1.5"/>` +
      rows + stamp + `</svg>`;
  }

  // Khung camera: nền ảnh đen trắng, dấu REC, mã camera và thanh quét
  function camView(o) {
    const k = uid("cam");
    const scene = CAM_KINDS[o.scene] ? camBody(k, o.scene) : camBody(k, "cam_rain");
    return `<div class="cam-view"><svg viewBox="0 0 320 190" role="img" aria-label="${esc(o.alt)}">` +
      `<defs>${CAM_DEFS(k)}</defs>${scene}` +
      `<rect x="2" y="2" width="316" height="186" fill="none" stroke="#3a4a58" stroke-width="3"/>` +
      `<rect x="8" y="8" width="132" height="20" fill="#000" fill-opacity=".55" rx="3"/>` +
      `<circle cx="18" cy="18" r="4" fill="#ff4d4d"/>` +
      `<text x="28" y="22" font-family="monospace" font-size="11" fill="#e8eef4">REC ${esc(o.time)}</text>` +
      `<text x="310" y="182" text-anchor="end" font-family="monospace" font-size="10" fill="#9fb3c8">${esc(o.cam)}</text>` +
      `</svg></div>`;
  }
  const CAM_KINDS = {
    cam_moto: 1, cam_suv: 1, cam_corridor: 1, cam_rain: 1,
    cam_sg_lobby: 1, cam_sg_garage: 1, cam_sg_sec: 1, cam_sg_cafe: 1, cam_sg_gala: 1
  };

  // Biểu đồ thủy triều trong ngày: hai đỉnh, mức báo động và khoảng đường ngập
  function tideView() {
    const X = (h) => 28 + (h / 24) * 270, Y = (m) => 150 - ((m - 0.2) / 1.6) * 110;
    const pts = [[1.17, 0.3], [7.58, 1.35], [13.33, 0.45], [19.33, 1.72], [24, 0.9]];
    let d = `M${X(0)} ${Y(0.8)}`;
    pts.forEach(([h, m], i) => {
      const [ph, pm] = i ? pts[i - 1] : [0, 0.8];
      const mid = (ph + h) / 2;
      d += ` C${X(mid)} ${Y(pm)} ${X(mid)} ${Y(m)} ${X(h)} ${Y(m)}`;
    });
    return `<svg viewBox="0 0 320 190" role="img" aria-label="Biểu đồ thủy triều hôm nay: đỉnh 1,72 m lúc 19 giờ 20">` +
      `<rect width="320" height="190" fill="#0e1a2c"/>` +
      `<rect x="${X(18.67)}" y="30" width="${X(21.5) - X(18.67)}" height="122" fill="#ff4fa3" opacity=".12"/>` +
      `<line x1="28" y1="${Y(1.6)}" x2="298" y2="${Y(1.6)}" stroke="#ff4fa3" stroke-width="1.4" stroke-dasharray="5 4"/>` +
      `<text x="30" y="${Y(1.6) - 4}" font-family="monospace" font-size="9" fill="#ff8ac0">báo động 3 · 1,60 m</text>` +
      `<line x1="28" y1="150" x2="298" y2="150" stroke="#4a6a8a" stroke-width="1.5"/>` +
      [0, 6, 12, 18, 24].map((h) => `<text x="${X(h)}" y="164" text-anchor="middle" font-family="monospace" font-size="9" fill="#9fb3c8">${String(h).padStart(2, "0")}h</text>`).join("") +
      `<path d="${d}" fill="none" stroke="#4fd6c6" stroke-width="3"/>` +
      `<circle cx="${X(7.58)}" cy="${Y(1.35)}" r="4" fill="#ffd27a"/><text x="${X(7.58)}" y="${Y(1.35) - 8}" text-anchor="middle" font-family="monospace" font-size="9" fill="#ffd27a">07:35 · 1,35 m</text>` +
      `<circle cx="${X(19.33)}" cy="${Y(1.72)}" r="4" fill="#ffd27a"/><text x="${X(19.33) - 4}" y="${Y(1.72) - 8}" text-anchor="middle" font-family="monospace" font-size="9" fill="#ffd27a">19:20 · 1,72 m</text>` +
      `<text x="160" y="182" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#cfe8ff">Thủy triều hôm nay · đường ngập 18:40–21:30</text>` +
      `</svg>`;
  }

  // Hai đồng hồ: cùng một sự kiện, camera chậm 17 phút so với giờ thật
  function skewView() {
    const clock = (cx, cy, label, hh, mm, col) => {
      const ah = ((hh % 12) + mm / 60) * 30, am = mm * 6;
      const pt = (deg, r) => `${cx + r * Math.sin((deg * Math.PI) / 180)} ${cy - r * Math.cos((deg * Math.PI) / 180)}`;
      let s = `<circle cx="${cx}" cy="${cy}" r="46" fill="#f5efe0" stroke="${col}" stroke-width="5"/>`;
      for (let i = 0; i < 12; i++) s += `<line x1="${pt(i * 30, 38).split(" ")[0]}" y1="${pt(i * 30, 38).split(" ")[1]}" x2="${pt(i * 30, 43).split(" ")[0]}" y2="${pt(i * 30, 43).split(" ")[1]}" stroke="#2b2b2b" stroke-width="2"/>`;
      s += `<line x1="${cx}" y1="${cy}" x2="${pt(ah, 24).split(" ")[0]}" y2="${pt(ah, 24).split(" ")[1]}" stroke="#2b2b2b" stroke-width="4" stroke-linecap="round"/>`;
      s += `<line x1="${cx}" y1="${cy}" x2="${pt(am, 36).split(" ")[0]}" y2="${pt(am, 36).split(" ")[1]}" stroke="#2b2b2b" stroke-width="2.6" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="3.5" fill="#2b2b2b"/>`;
      return s + `<text x="${cx}" y="${cy + 66}" text-anchor="middle" font-family="monospace" font-size="11" fill="#e8eef4">${label}</text>`;
    };
    return `<svg viewBox="0 0 320 190" role="img" aria-label="Hai đồng hồ lệch nhau 17 phút: camera 18 giờ 03, giờ thật 18 giờ 20">` +
      `<rect width="320" height="190" fill="#14202e"/>` + clock(70, 78, "CAMERA 18:03", 6, 3, "#3b6fa0") + clock(250, 78, "GIỜ THẬT 18:20", 6, 20, "#c9a227") +
      `<path d="M126 78 L194 78" stroke="#ff4fa3" stroke-width="3" stroke-dasharray="6 4"/><path d="M188 70 L198 78 L188 86" fill="none" stroke="#ff4fa3" stroke-width="3"/>` +
      `<text x="160" y="68" text-anchor="middle" font-family="Georgia,serif" font-size="15" font-weight="700" fill="#ff8ac0">+17 phút</text>` +
      `<text x="160" y="182" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#cfe8ff">giờ thật = giờ máy + 17 phút</text>` +
      `</svg>`;
  }

  // Tủ kính có ổ khóa: chứng minh tủ không bị phá
  function lockView() {
    return `<svg viewBox="0 0 320 190" role="img" aria-label="Tủ kính và ổ khóa">` +
      `<defs>${lin("lk-bg", [[0, "#34291e"], [1, "#1c150e"]])}${lin("lk-g", [[0, "#dff3f8", 0.45], [1, "#8fb7c4", 0.12]], 0, 0, 1, 1)}</defs>` +
      `<rect width="320" height="190" fill="url(#lk-bg)"/>` +
      `<rect x="50" y="26" width="220" height="146" rx="10" fill="#6b4a2b"/>` +
      `<rect x="62" y="38" width="196" height="122" rx="4" fill="url(#lk-g)" stroke="#e9f6fa" stroke-width="2"/>` +
      `<rect x="92" y="112" width="136" height="40" rx="4" fill="#8e2232" opacity=".8"/>` +
      `<rect x="108" y="90" width="104" height="30" rx="4" fill="none" stroke="#f7d68a" stroke-width="2" stroke-dasharray="6 5"/>` +
      `<line x1="78" y1="54" x2="170" y2="140" stroke="#fff" stroke-opacity=".25" stroke-width="3"/>` +
      `<path d="M240 90 Q240 66 254 66 Q268 66 268 90" fill="none" stroke="#c9a227" stroke-width="5"/>` +
      `<rect x="236" y="88" width="34" height="30" rx="4" fill="#b8891a"/>` +
      `<circle cx="253" cy="100" r="4" fill="#2b1d12"/><rect x="251" y="102" width="4" height="10" fill="#2b1d12"/>` +
      `<text x="160" y="182" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#f7d68a">Kính nguyên · không dấu cạy · khóa chính</text>` +
      `</svg>`;
  }

  // Hộp gỗ có ngăn bí mật và hai núm sen
  function boxView() {
    return `<svg viewBox="0 0 320 190" role="img" aria-label="Hộp gỗ có ngăn bí mật">` +
      `<defs>${lin("bx-w", [[0, "#8a5a2b"], [1, "#4a2b14"]])}</defs>` +
      `<rect width="320" height="190" fill="#2b2118"/>` +
      `<rect x="66" y="56" width="188" height="118" rx="12" fill="url(#bx-w)"/>` +
      `<rect x="82" y="70" width="156" height="46" rx="4" fill="#3a2716"/>` +
      `<line x1="82" y1="92" x2="238" y2="92" stroke="#6b4423" stroke-width="2"/>` +
      `<rect x="100" y="126" width="120" height="28" rx="4" fill="#8b5a2b" stroke="#f2c94c" stroke-width="2" stroke-dasharray="5 4"/>` +
      lotus(122, 118, 0.9, "#f2c94c") + lotus(198, 118, 0.9, "#f2c94c") +
      `<text x="160" y="46" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#f7d68a">bấm đồng thời hai núm sen</text>` +
      `<text x="160" y="170" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#f2c94c">ngăn bí mật · trâm ngọc</text>` +
      `</svg>`;
  }

  /* ---------- Thế giới panorama: khung cảnh gốc ở giữa, hai bên là phòng hoặc phố nối tiếp ---------- */
  // Phong cách hai bên theo từng cảnh: "room" là căn phòng, "street" là dãy nhà phố
  const FLANK = {
    shop:       { kind: "room", wall: "#5a3a22", floor: "#7d4f2b", trim: "#3d2510", lamp: "#ffb35c" },
    altar:      { kind: "room", wall: "#43241a", floor: "#4b2a18", trim: "#2c160b", lamp: "#ffb05a" },
    alley:      { kind: "street" },
    alley_rain: { kind: "street" },
    archive:    { kind: "room", wall: "#2f2b24", floor: "#3a342b", trim: "#1a1713", lamp: "#dfeef5" },
    gallery:    { kind: "room", wall: "#e9dab9", floor: "#8c5a33", trim: "#b08a3e", lamp: "#fff1c8" },
    gate:       { kind: "room", wall: "#27303b", floor: "#363f4a", trim: "#161b22", lamp: "#ffd58a" },
    corridor:   { kind: "room", wall: "#2a333e", floor: "#2f3742", trim: "#171d25", lamp: "#dff3ff" },
    banquet:    { kind: "room", wall: "#4a2c18", floor: "#5a3a22", trim: "#2c170a", lamp: "#ffd27a" },
    notary:     { kind: "room", wall: "#e6dcc4", floor: "#6e4a2c", trim: "#5a3d22", lamp: "#fff1d0" },
    stair:      { kind: "room", wall: "#243039", floor: "#2a3038", trim: "#141a22", lamp: "#ffe2a0" },
    pharmacy:   { kind: "room", wall: "#4a2c18", floor: "#6b4a2b", trim: "#2a160a", lamp: "#ffcf7a" },
    lab:        { kind: "room", wall: "#2c3d35", floor: "#3a4a42", trim: "#121c17", lamp: "#dff3ff" },
    sg_lobby:     { kind: "room", wall: "#26343a", floor: "#59656a", trim: "#0e1518", lamp: "#fff1d0" },
    sg_secroom:   { kind: "room", wall: "#26352f", floor: "#2b3733", trim: "#0c1210", lamp: "#dff3ff" },
    sg_garage:    { kind: "room", wall: "#222b32", floor: "#10242c", trim: "#0c1014", lamp: "#dff3ff" },
    sg_penthouse: { kind: "room", wall: "#2a2530", floor: "#3a281c", trim: "#14111a", lamp: "#ffd27a" },
    sg_street:    { kind: "sgstreet" },
    sg_lab:       { kind: "room", wall: "#1c2a40", floor: "#1d2736", trim: "#070b12", lamp: "#cfe8ff" }
  };

  // Gradient dùng chung cho hai bên của một cảnh (tiền tố k là tiền tố cảnh + "-w")
  function flankDefs(k, f) {
    const wall = f.wall || "#3a2d3f", floor = f.floor || "#2b2233";
    return lin(`${k}-seamL`, [[0, "#000", 0.42], [1, "#000", 0]], 0, 0, 1, 0) +
      lin(`${k}-seamR`, [[0, "#000", 0], [1, "#000", 0.42]], 0, 0, 1, 0) +
      lin(`${k}-fwall`, [[0, shade(wall, 0.1)], [1, shade(wall, -0.25)]]) +
      lin(`${k}-ffloor`, [[0, floor], [1, shade(floor, -0.5)]]) +
      lin(`${k}-fsky`, [[0, "#0b1120"], [1, "#22304f"]]) +
      lin(`${k}-fstreet`, [[0, "#232833"], [1, "#0d1016"]]);
  }

  // Cửa phòng: khung gỗ, khoảng tối và vệt sáng dưới cửa
  function roomDoor(x, f) {
    return rect(x - 8, 340, 146, 380, f.trim) +
      rect(x, 352, 130, 368, "#120c08") +
      rect(x + 12, 364, 106, 344, "#22170e") +
      rect(x + 12, 712, 106, 6, "#e9b949", 'opacity=".5"');
  }

  // Cửa cửa hàng ngoài phố: mái che đỏ và khoảng tối bên dưới
  function streetDoor(x) {
    return rect(x - 6, 528, 142, 12, "#8b1e1e", 'rx="3"') +
      rect(x, 540, 130, 180, "#120c08") +
      rect(x + 12, 552, 106, 6, "#f0c15a", 'opacity=".6"');
  }

  // Một bên là căn phòng: tường, trần, sàn và các cửa đi (tọa độ thế giới)
  function roomSide(k, f, x0, doors) {
    let s = rect(x0, 0, 400, 720, `url(#${k}-fwall)`) +
      rect(x0, 0, 400, 56, shade(f.wall, -0.35)) +
      rect(x0, 712, 400, 10, f.trim) +
      rect(x0, 720, 400, 180, `url(#${k}-ffloor)`);
    for (let i = 0; i < 5; i++) s += line(x0, 740 + i * 36, x0 + 400, 740 + i * 36, "#2a170b", 2, 'opacity=".45"');
    s += glow(k, x0 + 200, 150, 90, f.lamp, 0.35) + circle(x0 + 200, 150, 10, f.lamp);
    s += rect(x0 + 186, 120, 28, 10, shade(f.trim, 0.2), 'rx="3"');
    doors.forEach((d) => { s += roomDoor(d.x, f); });
    return s;
  }

  // Một bên là phố: nền trời, dãy nhà ống và mặt đường (tọa độ thế giới)
  function streetSide(k, x0, doors) {
    const houses = x0 === 0
      ? [[-20, 720, 210, 620, 0], [190, 640, 200, 470, 1]]
      : [[2000, 720, 200, 600, 2], [2200, 640, 200, 460, 0]];
    let s = rect(x0, 0, 400, 900, `url(#${k}-fsky)`);
    houses.forEach(([x, base, w, h, seed]) => {
      s += tube(x, base, w, h, { wall: seed % 2 ? "#4b3a2c" : "#3a2d3f", roof: "#1d1620", lit: "#ffc66e", seed });
    });
    s += rect(x0, 720, 400, 180, `url(#${k}-fstreet)`);
    doors.forEach((d) => { s += streetDoor(d.x); });
    return s;
  }

  // Một bên là phố Sài Gòn ngập nước: nhà phố có neon, dây điện và mặt đường phản chiếu (tọa độ thế giới)
  function sgStreetSide(k, x0, doors) {
    const left = x0 === 0;
    let s = rect(x0, 0, 400, 900, `url(#${k}-fsky)`);
    const houses = left
      ? [[-20, 740, 210, 600, 0, "#ff4fa3"], [190, 680, 200, 450, 1, "#ffb347"]]
      : [[2000, 740, 200, 590, 2, "#3fd6c6"], [2200, 680, 200, 450, 0, "#ff4fa3"]];
    houses.forEach(([x, base, w, h, seed, neon]) => {
      s += sgHouse(k, x, base, w, h, { wall: seed % 2 ? "#3a3a58" : "#4a3346", seed, neon });
    });
    s += wires(130, 3) + rect(x0, 720, 400, 180, `url(#${k}-fstreet)`);
    doors.forEach((d) => { s += streetDoor(d.x); });
    return s;
  }

  // Đặt khung cảnh gốc (1600 đơn vị) vào giữa thế giới 2400, hai bên dựng theo phong cách của cảnh
  function widen(key, svg, doors = []) {
    const m = svg.match(/^(<svg[^>]*>)<defs>([\s\S]*?)<\/defs>([\s\S]*)<\/svg>$/);
    if (!m) return svg;
    const [, open, defs, body] = m;
    const f = FLANK[key] || FLANK.shop;
    const k = `${key}-w`;
    const left = doors.filter((d) => d.side === "left");
    const right = doors.filter((d) => d.side === "right");
    const side = f.kind === "sgstreet" ? sgStreetSide : f.kind === "street" ? streetSide : null;
    const sideL = side ? side(k, 0, left) : roomSide(k, f, 0, left);
    const sideR = side ? side(k, WORLD_W - 400, right) : roomSide(k, f, WORLD_W - 400, right);
    const seam = rect(OX, 0, 60, 900, `url(#${k}-seamL)`) + rect(OX + COMP_W - 60, 0, 60, 900, `url(#${k}-seamR)`);
    return open.replace(`viewBox="0 0 ${COMP_W} 900"`, `viewBox="0 0 ${WORLD_W} 900"`) +
      `<defs>${defs}${blurs(k)}${flankDefs(k, f)}</defs>` +
      sideL + `<g transform="translate(${OX} 0)">${body}</g>` + seam + sideR + `</svg>`;
  }

  // Văn phòng công chứng: quầy lễ tân, kệ hồ sơ, đồng hồ treo tường và cửa chính kính
  function notary() {
    const k = "notary";
    const defs = blurs(k) +
      lin(`${k}-wall`, [[0, "#ece2c9"], [1, "#b9a27a"]]) +
      lin(`${k}-floor`, [[0, "#6e4a2c"], [1, "#2b1a0e"]]) +
      lin(`${k}-desk`, [[0, "#8a5a33"], [1, "#3a2212"]]) +
      lin(`${k}-glass`, [[0, "#1d2d46", 0.9], [1, "#0a1220", 0.95]]);
    let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`) + rect(0, 0, 1600, 36, "#3a2c1e");
    b += rect(540, 64, 520, 70, "#1f3a5f", 'rx="8"');
    b += rect(556, 76, 488, 46, "none", 'rx="5" stroke="#c9a227" stroke-width="2"');
    b += txt(800, 108, "VĂN PHÒNG CÔNG CHỨNG", 26, "#f7d68a", 'text-anchor="middle" letter-spacing="3"');
    [420, 800, 1180].forEach((x) => { b += rect(x - 30, 36, 60, 10, "#2a2119", 'rx="3"') + glow(k, x, 50, 110, "#fff1d0", 0.35); });

    // Đồng hồ treo tường chỉ 21h, kệ hồ sơ bên trái
    b += circle(1330, 230, 58, "#f5efe0", 'stroke="#5a3d22" stroke-width="8"');
    b += line(1330, 230, 1330, 186, "#2b2b2b", 4) + line(1330, 230, 1300, 230, "#2b2b2b", 4) + circle(1330, 230, 5, "#2b2b2b");
    [300, 430].forEach((y) => { b += rect(60, y, 320, 12, "#5a3d22"); });
    const spines = ["#7a1f17", "#1f4e6b", "#c9a227", "#3b5b2a", "#6b3a6b", "#8a5a33", "#2b3a48"];
    [300, 430].forEach((y) => spines.forEach((col, i) => { b += rect(74 + i * 42, y - 74, 30, 74, col, 'rx="2"'); }));

    // Thịnh đứng bên kệ, Vân sau quầy (vẽ trước quầy để quầy che phần thân)
    b += figure(330, 400, 1, { top: "#37474f", hair: "short", hc: "#2b2b2b", skin: "#e8bf98", tie: "#b71c1c" });
    b += figure(740, 380, 1, { top: "#ad1457", hair: "long", hc: "#1f1a17", skin: "#f5d6bc" });

    // Quầy lễ tân, giấy tờ và chuông
    b += rect(500, 520, 520, 120, `url(#${k}-desk)`, 'rx="4"');
    b += rect(480, 500, 560, 22, "#b07a44", 'rx="4"');
    b += rect(700, 470, 60, 30, "#f3ead2", 'rx="2"');
    b += circle(900, 486, 9, "#c9a227") + rect(892, 492, 16, 6, "#c9a227", 'rx="2"');

    // Tủ hồ sơ sau quầy
    b += rect(1040, 320, 230, 260, "#5e4329", 'rx="4"');
    [0, 1, 2, 3].forEach((r) => {
      b += line(1050, 352 + r * 62, 1260, 352 + r * 62, "#3a2814", 3);
      b += rect(1130, 336 + r * 62, 30, 8, "#c9a227", 'rx="2"');
    });

    // Cửa chính kính, và Kiên đứng cạnh cửa với vali đồ nghề
    b += rect(1370, 360, 170, 360, "#4a2c16", 'rx="4"');
    b += rect(1386, 376, 138, 330, `url(#${k}-glass)`);
    b += path("M1400 380 L1450 380 L1400 520 Z", "#ffffff", 'opacity=".08"');
    b += txt(1455, 352, "CỬA CHÍNH", 13, "#f7d68a", 'text-anchor="middle" letter-spacing="2"');
    b += figure(1240, 430, 1, { top: "#4f6b3a", hair: "hat", hc: "#6b4a2b", skin: "#c98f63", pants: "#23262d", mustache: true });
    b += rect(1200, 580, 60, 46, "#5a3a22", 'rx="5"') + rect(1218, 570, 24, 12, "none", 'rx="4" stroke="#2b1d12" stroke-width="3"');

    // Sàn gỗ và ánh đèn
    b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
    for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#2b1a0e", 2, 'opacity=".5"');
    b += haze(k, 800, 520, 360, "#fff1d0", 0.1);
    return frame("Văn phòng công chứng", defs, b);
  }

  // Cầu thang xuống tầng hầm: cửa hông có đầu đọc thẻ từ, camera trần và bậc đi xuống
  function stair() {
    const k = "stair";
    const defs = blurs(k) +
      lin(`${k}-ceil`, [[0, "#1d2530"], [1, "#0e131a"]]) +
      lin(`${k}-wall`, [[0, "#2c3440"], [1, "#141a22"]]) +
      lin(`${k}-step`, [[0, "#525d68"], [1, "#2a3139"]]) +
      lin(`${k}-door`, [[0, "#3d2d1e"], [1, "#22180f"]]);
    let b = rect(0, 0, 1600, 900, "#121820");
    b += path("M0 0 H1600 L1200 260 H400 Z", `url(#${k}-ceil)`);
    b += path("M0 0 L400 260 L400 900 L0 900 Z", "#243039") + path("M1600 0 L1200 260 L1200 900 L1600 900 Z", "#243039");
    b += rect(400, 260, 800, 640, `url(#${k}-wall)`);
    b += line(0, 140, 400, 262, "#3b4650", 8) + line(1600, 140, 1200, 262, "#3b4650", 8);
    b += glow(k, 800, 90, 200, "#ffe2a0", 0.25) + circle(800, 40, 8, "#ffe2a0");

    // Cửa hông và đầu đọc thẻ từ bên cạnh
    b += rect(680, 300, 200, 260, "#2b1f14", 'rx="4"');
    b += rect(696, 316, 168, 244, `url(#${k}-door)`);
    b += txt(780, 292, "CỬA HÔNG", 14, "#f7d68a", 'text-anchor="middle" letter-spacing="2"');
    b += rect(918, 420, 40, 60, "#1e2a36", 'rx="6"') + rect(924, 428, 28, 20, "#7fd1b9", 'rx="3" opacity=".85"');
    b += glow(k, 938, 438, 36, "#7fd1b9", 0.5);

    // Camera trần (điểm điều tra)
    b += rect(790, 170, 20, 12, "#444");
    b += rect(770, 180, 60, 26, "#2b2b30", 'rx="5"');
    b += circle(770, 193, 6, "#0d1116") + circle(818, 186, 3, "#ff4d4d");

    // Lan can và các bậc đi xuống tầng hầm, bậc gần thì rộng hơn
    b += line(400, 420, 480, 600, "#8a8f96", 5) + line(1200, 420, 1120, 600, "#8a8f96", 5);
    for (let i = 0; i < 6; i++) {
      const y = 610 + i * 45;
      b += rect(480 - i * 20, y, 640 + i * 40, 26, `url(#${k}-step)`);
      b += rect(480 - i * 20, y + 26, 640 + i * 40, 10, "#15191f");
    }
    b += haze(k, 800, 640, 320, "#9fc3dd", 0.1);
    return frame("Cầu thang xuống tầng hầm", defs, b);
  }

  // Hiệu thuốc bắc Bảo An Đường: tủ ô thuốc kín tường, bảng hiệu đỏ vàng, quầy gỗ có cân tiểu ly
  function pharmacy() {
    const k = "pharmacy";
    const defs = blurs(k) +
      lin(`${k}-wall`, [[0, "#5a3a22"], [1, "#22130a"]]) +
      lin(`${k}-floor`, [[0, "#6b4a2b"], [1, "#2a180b"]]) +
      lin(`${k}-cab`, [[0, "#6e4426"], [1, "#3a2210"]]) +
      lin(`${k}-drawer`, [[0, "#7d4f2b"], [1, "#4a2a12"]]) +
      lin(`${k}-counter`, [[0, "#a06a3a"], [1, "#4a2a12"]]);
    let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`) + rect(0, 0, 1600, 34, "#1a0e06");

    // Tủ ô thuốc kín tường: bốn hàng ngăn kéo, mỗi ngăn có nhãn giấy và núm đồng
    b += rect(60, 150, 1480, 360, `url(#${k}-cab)`, 'rx="6"');
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 10; c++) {
        const x = 80 + c * 146, y = 170 + r * 88;
        b += rect(x, y, 130, 76, `url(#${k}-drawer)`, 'rx="3"');
        b += rect(x + 18, y + 8, 94, 14, "#f3ead2", 'rx="2"');
        b += rect(x + 55, y + 42, 20, 6, "#c9a227", 'rx="2"');
      }
    }

    // Bảng hiệu đỏ viền vàng, và ánh đèn vàng ấm
    b += rect(520, 56, 560, 70, "#8b1e1e", 'rx="8"');
    b += rect(536, 68, 528, 46, "none", 'rx="5" stroke="#f0c15a" stroke-width="2"');
    b += txt(800, 100, "BẢO AN ĐƯỜNG", 26, "#f7d68a", 'text-anchor="middle" letter-spacing="3"');
    b += glow(k, 800, 90, 150, "#ffcf7a", 0.25);
    b += haze(k, 800, 420, 420, "#ffcf7a", 0.12);

    // Chủ hiệu đứng sau quầy (vẽ trước quầy để quầy che phần thân)
    b += figure(560, 330, 1, { top: "#e8f0ec", hair: "bun", hc: "#1f1a17", skin: "#e8c4a0", pants: "#2b2f3a", glasses: true });

    // Quầy gỗ có cân tiểu ly và hai bình sứ
    b += rect(280, 540, 1040, 26, "#c08a50", 'rx="4"');
    b += rect(300, 566, 1000, 154, `url(#${k}-counter)`, 'rx="4"');
    b += vase(430, 540, 50, 90, "#7a3e2a") + vase(1400, 540, 60, 110, "#2f6b4f");
    b += line(1180, 470, 1180, 500, "#2b1d12", 4) + line(1120, 500, 1240, 500, "#2b1d12", 4);
    b += line(1120, 500, 1104, 530, "#8a6b3a", 2) + line(1120, 500, 1136, 530, "#8a6b3a", 2);
    b += line(1240, 500, 1224, 530, "#8a6b3a", 2) + line(1240, 500, 1256, 530, "#8a6b3a", 2);
    b += path("M1090 530 Q1120 556 1150 530 Z", "#c9a227") + path("M1210 530 Q1240 556 1270 530 Z", "#c9a227");

    // Sàn gỗ và vệt sáng dài trên sàn
    b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
    for (let i = -6; i <= 6; i++) b += line(800 + i * 90, 720, 800 + i * 260, 900, "#2b1a0e", 2, 'opacity=".5"');
    return frame("Hiệu thuốc Bảo An Đường", defs, b);
  }

  // Phòng bào chế sau nhà: bàn gỗ dài, tủ dụng cụ có ổ khóa với ngăn trống, và tấm vải phủ thi thể trên sàn
  function lab() {
    const k = "lab";
    const defs = blurs(k) +
      lin(`${k}-wall`, [[0, "#2c3d35"], [1, "#121c17"]]) +
      lin(`${k}-floor`, [[0, "#3a4a42"], [1, "#161f1a"]]) +
      lin(`${k}-table`, [[0, "#8a5a33"], [1, "#3d2412"]]) +
      lin(`${k}-cab`, [[0, "#5c4a36"], [1, "#2a2118"]]) +
      lin(`${k}-cloth`, [[0, "#f1ede0"], [1, "#cfc8b4"]]);
    let b = rect(0, 0, 1600, 720, `url(#${k}-wall)`) + rect(0, 0, 1600, 30, "#0b120e");

    // Đèn huỳnh quang trần, và cửa sổ nhỏ nhìn ra đêm mưa
    b += rect(560, 40, 480, 14, "#dff3ff", 'rx="6"') + glow(k, 800, 60, 260, "#dff3ff", 0.3);
    b += rect(60, 110, 200, 150, "#1b2a24", 'rx="4"') + rect(72, 122, 176, 126, "#0a1512");
    for (let i = 0; i < 6; i++) b += line(90 + i * 28, 130 + (i % 3) * 20, 80 + i * 28, 160 + (i % 3) * 20, "#9fc3dd", 1.2, 'opacity=".35"');

    // Kệ bình thuốc và bó thảo dược khô bên trái
    [300, 420].forEach((y) => { b += rect(60, y, 360, 12, "#5a3d22"); });
    b += vase(120, 300, 50, 70, "#2f6b4f") + vase(200, 300, 46, 60, "#7a3e2a") + vase(280, 300, 50, 66, "#8a6b3a") + vase(350, 300, 40, 54, "#3d4f6b");
    for (let i = 0; i < 7; i++) b += line(90 + i * 48, 420, 90 + i * 48, 470 + (i % 3) * 14, i % 2 ? "#6b8e4e" : "#8a6b3a", 6, 'stroke-linecap="round"');

    // Tủ dụng cụ có ổ khóa; ngăn trên trống, nơi lẽ ra có chày đồng
    b += rect(1100, 260, 320, 330, `url(#${k}-cab)`, 'rx="6"');
    b += rect(1116, 276, 288, 130, "none", 'rx="4" stroke="#6b5a40" stroke-width="2"');
    b += rect(1156, 306, 208, 70, "none", 'rx="6" stroke="#f2c94c" stroke-width="2" stroke-dasharray="6 5"');
    b += txt(1260, 350, "trống", 14, "#f2c94c", 'text-anchor="middle" font-style="italic"');
    b += rect(1116, 420, 288, 156, "none", 'rx="4" stroke="#6b5a40" stroke-width="2"');
    b += rect(1230, 462, 40, 50, "#b8891a", 'rx="4"') + circle(1250, 478, 6, "#2b1d12") + rect(1247, 482, 6, 16, "#2b1d12");

    // Bàn bào chế dài: cối đồng, bát thuốc và một vệt sạch trên mặt bàn
    b += rect(260, 560, 760, 26, `url(#${k}-table)`, 'rx="4"');
    b += rect(280, 586, 16, 134, "#3d2412") + rect(1000, 586, 16, 134, "#3d2412");
    b += path("M400 556 Q452 606 504 556 Z", "#6e655a") + rect(396, 548, 112, 10, "#8a8072", 'rx="4"');
    b += path("M660 556 Q690 530 720 556 Z", "#efe6d0") + rect(640, 548, 100, 8, "#d8cbb0", 'rx="3"');
    b += rect(840, 548, 130, 8, "#a7bca8", 'opacity=".25"');

    // Ghế đổ và tấm vải phủ thi thể trên sàn
    b += rect(620, 712, 64, 14, "#5a3d22", 'rx="4" transform="rotate(-18 652 719)"');
    b += path("M800 738 Q860 716 930 740 Q900 764 800 738 Z", "#5a0f0f", 'opacity=".75"');
    b += path("M770 724 Q880 690 1010 716 L1046 752 Q900 774 770 748 Z", `url(#${k}-cloth)`);
    b += path("M1010 716 L1046 752 Q1040 752 1030 748", "none", 'stroke="#9d9584" stroke-width="2"');

    // Sàn gạch sẫm và ánh sáng hắt từ đèn trần
    b += rect(0, 720, 1600, 180, `url(#${k}-floor)`);
    for (let i = -6; i <= 6; i++) b += line(800 + i * 70, 720, 800 + i * 240, 900, "#0b120e", 2, 'opacity=".5"');
    b += haze(k, 800, 420, 420, "#dff3ff", 0.1);
    return frame("Phòng bào chế sau nhà", defs, b);
  }

  /* =====================================================================
     Vùng Sài Gòn: nhà phố nhiều dây điện, neon, nước triều, hầm xe ngập
     ===================================================================== */

  // Nhà phố Sài Gòn: mặt đứng hẹp, mái bằng có bồn nước, chuồng cọp, cửa cuốn tầng trệt và biển neon tùy chọn
  function sgHouse(k, x, base, w, h, o = {}) {
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
  function wires(y0, n = 4) {
    let s = "";
    for (let i = 0; i < n; i++) {
      const y = y0 + i * 22;
      s += path(`M-20 ${y} Q400 ${y + 70 + i * 6} 800 ${y + 10} T1620 ${y + 40}`, "none", `stroke="#05070c" stroke-width="${(2.2 - i * 0.3).toFixed(1)}" opacity=".9"`);
    }
    return s;
  }

  // Một cái ô tô nhìn ngang: thân, kính, bánh, đèn
  function sgCar(x, y, w, col, o = {}) {
    const h = w * 0.34;
    let s = path(`M${x} ${y} L${x + w * 0.06} ${y - h * 0.5} Q${x + w * 0.2} ${y - h * 0.62} ${x + w * 0.34} ${y - h * 0.9} L${x + w * 0.68} ${y - h * 0.9} Q${x + w * 0.84} ${y - h * 0.62} ${x + w * 0.94} ${y - h * 0.42} L${x + w} ${y} Z`, col);
    s += path(`M${x + w * 0.3} ${y - h * 0.5} L${x + w * 0.4} ${y - h * 0.82} L${x + w * 0.66} ${y - h * 0.82} L${x + w * 0.78} ${y - h * 0.5} Z`, o.glass || "#1a2a3c", 'opacity=".9"');
    s += circle(x + w * 0.22, y, w * 0.075, "#0a0a0d") + circle(x + w * 0.78, y, w * 0.075, "#0a0a0d");
    s += circle(x + w * 0.96, y - h * 0.3, w * 0.022, "#fff3c8");
    return s;
  }

  // Sảnh chung cư Sao Mai: thang máy inox, quầy lễ tân, hành lang thang bộ tối ở bên phải, cửa kính nhìn ra phố ngập
  function sgLobby() {
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
  function sgSecroom() {
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
  function sgGarage() {
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
  function sgPenthouse() {
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
  function sgStreet() {
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
    b += figure(560, 400, 1, { top: "#00838f", hair: "bun", hc: "#2a1b10", skin: "#dba77e" });
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
  function tubeSkyline() {
    let s = "";
    [[40, 90, 160], [150, 70, 220], [260, 100, 140], [1180, 90, 200], [1290, 80, 250], [1390, 110, 170], [1500, 70, 210]].forEach(([x, w, h], i) => {
      s += rect(x, 560 - h, w, h, "#15142c");
      for (let r = 0; r < 6; r++) s += rect(x + 8, 560 - h + 14 + r * 22, w - 16, 4, "#ffd27a", `opacity="${(0.1 + ((r * 31 + i * 7) % 5) * 0.06).toFixed(2)}"`);
    });
    return s;
  }

  // Phòng giám định và dữ liệu: màn hình lớn, bảng bằng chứng, giá hồ sơ và bàn dài đặt các giấy tờ
  function sgLab() {
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
  function menuSg() {
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

  /* ---------- Bảng đăng ký cảnh ---------- */
  const SCENES = {
    shop, altar,
    alley: () => alley(false),
    alley_rain: () => alley(true),
    archive, gallery, gate, corridor, banquet, notary, stair, pharmacy, lab, menu,
    sg_lobby: sgLobby, sg_secroom: sgSecroom, sg_garage: sgGarage, sg_penthouse: sgPenthouse, sg_street: sgStreet, sg_lab: sgLab, menu_sg: menuSg
  };

  return {
    // Cảnh điều tra được mở rộng thành thế giới panorama có cửa; menu (của mỗi vùng) giữ khung gốc
    scene: (key, doors = []) => {
      if (key === "menu_sg") return SCENES.menu_sg();
      return key === "menu" || !SCENES[key] ? SCENES.menu() : widen(key, SCENES[key](), doors);
    },
    portrait,
    evidence(v) {
      if (v.k === "paper") return paper(v);
      if (v.k === "cam") return camView(v);
      if (v.k === "lock") return lockView();
      if (v.k === "box") return boxView();
      if (v.k === "tide") return tideView();
      if (v.k === "skew") return skewView();
      return "";
    }
  };
})();

export { ART };
