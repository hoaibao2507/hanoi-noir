import { WORLD_W, COMP_W, OX } from "../world/layout.js";
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

  // Người (đứng hoặc ngồi) vẽ đơn giản: đầu, tóc, thân áo, chân quần
  function faceD(x, y, r) {
    return `M${x - r * 0.82} ${y - r * 0.15} C${x - r * 0.9} ${y - r * 1.05} ${x + r * 0.9} ${y - r * 1.05} ${x + r * 0.82} ${y - r * 0.15} C${x + r * 0.8} ${y + r * 0.8} ${x + r * 0.42} ${y + r * 1.12} ${x} ${y + r * 1.12} C${x - r * 0.42} ${y + r * 1.12} ${x - r * 0.8} ${y + r * 0.8} ${x - r * 0.82} ${y - r * 0.15} Z`;
  }
  function capD(x, y, r) {
    return `M${x - r * 0.9} ${y - r * 0.1} C${x - r * 1.0} ${y - r * 1.3} ${x + r * 1.0} ${y - r * 1.3} ${x + r * 0.9} ${y - r * 0.1} C${x + r * 0.6} ${y - r * 0.55} ${x - r * 0.5} ${y - r * 0.6} ${x - r * 0.9} ${y - r * 0.1} Z`;
  }
  function figure(x, headY, s = 1, o = {}) {
    const R = 22 * s, cy = headY + R, sy = headY + R * 2.35, hip = sy + R * 3.6, feet = headY + R * 10.4;
    const top = o.top || "#4f6b3a", skin = o.skin || "#dca57a", hc = o.hc || "#1e1712", pants = o.pants || "#2b2f3a";
    let g = "";
    if (!o.seated) {
      g += path(`M${x - 11 * s} ${hip} L${x - 15 * s} ${feet} L${x - 3 * s} ${feet} L${x} ${hip} Z M${x + 2 * s} ${hip} L${x + 6 * s} ${feet} L${x + 16 * s} ${feet} L${x + 12 * s} ${hip} Z`, pants);
    }
    g += path(`M${x - R * 1.15} ${sy} Q${x} ${sy - R * 0.4} ${x + R * 1.15} ${sy} Q${x + R * 1.5} ${sy + R * 1.6} ${x + R * 1.25} ${hip + R * 0.3} L${x - R * 1.25} ${hip + R * 0.3} Q${x - R * 1.5} ${sy + R * 1.6} ${x - R * 1.15} ${sy} Z`, top);
    g += rect(x - R * 0.3, cy + R * 0.6, R * 0.6, R * 1.1, shade(skin, -0.18));
    if (o.hair === "long") g += path(`M${x - R * 1.05} ${cy} Q${x - R * 1.25} ${cy + R * 2.2} ${x - R * 0.9} ${cy + R * 2.7} L${x + R * 0.9} ${cy + R * 2.7} Q${x + R * 1.25} ${cy + R * 2.2} ${x + R * 1.05} ${cy} Z`, hc);
    if (o.hair === "bun") g += circle(x, headY - R * 0.1, R * 0.42, hc);
    if (o.scarf) g += path(`M${x - R * 0.8} ${sy + R * 0.1} Q${x} ${sy + R * 0.9} ${x + R * 0.8} ${sy + R * 0.1} L${x + R * 0.85} ${sy + R * 0.6} Q${x} ${sy + R * 1.5} ${x - R * 0.85} ${sy + R * 0.6} Z`, o.scarf);
    g += path(faceD(x, cy, R), skin);
    if (o.hair === "hat") {
      g += path(`M${x - R * 0.95} ${cy - R * 0.2} Q${x - R * 0.9} ${cy - R * 1.25} ${x} ${cy - R * 1.25} Q${x + R * 0.9} ${cy - R * 1.25} ${x + R * 0.95} ${cy - R * 0.2} Z`, hc);
      g += path(`M${x - R * 1.35} ${cy - R * 0.25} Q${x} ${cy - R * 0.7} ${x + R * 1.35} ${cy - R * 0.25} Q${x} ${cy - R * 0.05} ${x - R * 1.35} ${cy - R * 0.25} Z`, shade(hc, 0.12));
    } else if (o.hair !== "bald") {
      g += path(capD(x, cy, R), hc);
    }
    g += circle(x - R * 0.35, cy + R * 0.05, R * 0.08, "#241a12") + circle(x + R * 0.35, cy + R * 0.05, R * 0.08, "#241a12");
    if (o.tie) g += path(`M${x - R * 0.12} ${sy + R * 0.2} L${x + R * 0.12} ${sy + R * 0.2} L${x + R * 0.2} ${sy + R * 1.6} L${x} ${sy + R * 1.9} L${x - R * 0.2} ${sy + R * 1.6} Z`, o.tie);
    return g;
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
    b += figure(330, 390, 1.05, { top: "#7a3e8f", hair: "bun", hc: "#2b2b2b", skin: "#f0c9a0", seated: true });
    b += figure(1060, 370, 1, { top: "#4f6b3a", hair: "short", hc: "#3d2c20", skin: "#d9a77c", seated: true });
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
    b += figure(300, 370, 1, { top: "#1b1b1b", hair: "long", hc: "#111", skin: "#e8bf98", pants: "#111" });

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
    b += figure(1040, 420, 1, { top: "#1b1b1b", hair: "long", hc: "#111", skin: "#e8bf98", pants: "#111" });
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
    b += figure(560, 290, 0.95, { top: "#ad1457", hair: "long", hc: "#2a1b10", skin: "#f3d1ae", seated: true });
    b += figure(800, 240, 1, { top: "#5d4037", hair: "bald", hc: "#bbb", skin: "#e2b48a", seated: true });
    b += figure(1040, 290, 0.95, { top: "#00695c", hair: "bun", hc: "#1a1a1a", skin: "#f5d2b3", seated: true });
    b += figure(520, 530, 1.25, { top: "#f9a825", hair: "short", hc: "#3b2a1b", skin: "#f0c9a0", seated: true });
    b += figure(1080, 530, 1.25, { top: "#546e7a", hair: "hat", hc: "#8d6e63", skin: "#dba77e", seated: true });

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
  const CAM_KINDS = { cam_moto: 1, cam_suv: 1, cam_corridor: 1, cam_rain: 1 };

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

  /* ---------- Chân dung nghi phạm (khung 120 × 140) ---------- */
  function portrait(look, id) {
    const { skin: sk, hair, hc, top, acc, ac } = look;
    const g = `pt${id}`;
    const skD = shade(sk, -0.16), skL = shade(sk, 0.1);
    const back = hair === "long"
      ? `<path d="M28 58 C18 16 102 16 92 58 L100 124 C80 132 40 132 20 124 Z" fill="${hc}"/>` : "";
    const hairFront = {
      short: `<path d="M32 52 C26 24 44 16 60 16 C78 16 94 24 88 52 C84 40 76 34 60 34 C46 34 38 40 32 52 Z" fill="${hc}"/>`,
      long: `<path d="M34 52 C30 26 46 20 60 20 C76 20 90 26 86 52 C78 40 70 36 60 38 C50 36 40 40 34 52 Z" fill="${hc}"/>`,
      bun: `<circle cx="60" cy="14" r="10" fill="${hc}"/><path d="M32 52 C26 26 44 22 60 22 C76 22 94 26 88 52 C82 40 74 34 60 34 C46 34 38 40 32 52 Z" fill="${hc}"/>`,
      bald: `<path d="M38 44 C44 34 76 34 82 44 C74 38 46 38 38 44 Z" fill="${hc}" opacity=".7"/>`,
      hat: `<path d="M34 42 C34 18 46 12 60 12 C74 12 86 18 86 42 Z" fill="${hc}"/><path d="M24 42 Q60 34 96 42 Q96 48 60 49 Q24 48 24 42 Z" fill="${shade(hc, 0.12)}"/>`
    }[hair] || "";
    const accessory = {
      glasses: `<rect x="42" y="54" width="17" height="12" rx="5" fill="rgba(255,255,255,.08)" stroke="#2a2a2a" stroke-width="1.6"/>` +
        `<rect x="61" y="54" width="17" height="12" rx="5" fill="rgba(255,255,255,.08)" stroke="#2a2a2a" stroke-width="1.6"/>` +
        `<path d="M59 59 Q60 57 61 59" stroke="#2a2a2a" fill="none" stroke-width="1.5"/>`,
      mustache: `<path d="M50 74 Q55 70 60 72 Q65 70 70 74 Q65 78 60 76 Q55 78 50 74 Z" fill="#3b2a1b"/>`,
      scarf: `<path d="M38 96 Q60 108 82 96 L84 106 Q60 120 36 106 Z" fill="${ac}"/>`,
      tie: `<path d="M55 97 L65 97 L67 116 L60 123 L53 116 Z" fill="${ac}"/><path d="M56 94 L64 94 L65 99 L55 99 Z" fill="${shade(ac || "#b71c1c", -0.2)}"/>`,
      none: ""
    }[acc] || "";
    return `<svg class="portrait" viewBox="0 0 120 140" role="img" aria-label="Chân dung">` +
      `<defs>` +
      `<linearGradient id="${g}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a1d"/><stop offset="1" stop-color="#15100b"/></linearGradient>` +
      `<linearGradient id="${g}-sk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${skL}"/><stop offset=".6" stop-color="${sk}"/><stop offset="1" stop-color="${skD}"/></linearGradient>` +
      `<linearGradient id="${g}-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(top, 0.14)}"/><stop offset="1" stop-color="${shade(top, -0.35)}"/></linearGradient>` +
      `</defs>` +
      `<rect width="120" height="140" fill="url(#${g}-bg)"/>` +
      `<circle cx="60" cy="48" r="60" fill="#ffd98e" opacity=".07"/>` +
      back +
      `<path d="M8 140 C8 106 34 96 60 96 C86 96 112 106 112 140 Z" fill="url(#${g}-top)"/>` +
      `<path d="M49 84 L49 102 Q60 110 71 102 L71 84 Z" fill="${skD}"/>` +
      `<path d="M36 62 Q28 60 29 70 Q30 80 38 78 Z" fill="${sk}"/>` +
      `<path d="M84 62 Q92 60 91 70 Q90 80 82 78 Z" fill="${sk}"/>` +
      `<path d="M36 52 C36 34 46 26 60 26 C74 26 84 34 84 52 C84 70 76 84 60 86 C44 84 36 70 36 52 Z" fill="url(#${g}-sk)"/>` +
      `<path d="M76 56 C82 66 80 80 64 84 C74 78 80 68 76 56 Z" fill="${skD}" opacity=".3"/>` +
      hairFront +
      `<path d="M44 60 Q51 54 58 60 Q51 64 44 60 Z" fill="#fff" opacity=".92"/>` +
      `<path d="M62 60 Q69 54 76 60 Q69 64 62 60 Z" fill="#fff" opacity=".92"/>` +
      `<circle cx="51" cy="60" r="2.8" fill="#2b1d14"/><circle cx="69" cy="60" r="2.8" fill="#2b1d14"/>` +
      `<circle cx="52" cy="59" r=".8" fill="#fff"/><circle cx="70" cy="59" r=".8" fill="#fff"/>` +
      `<path d="M43 56 Q51 49 59 56 M61 56 Q69 49 77 56" stroke="#2b1d14" stroke-width="1.4" fill="none" stroke-linecap="round"/>` +
      `<path d="M44 49 Q51 45 58 48 M62 48 Q69 45 76 49" stroke="${hc}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
      `<path d="M60 62 Q58 68 61 70 Q63 71 65 69" stroke="${skD}" stroke-width="1.5" fill="none" stroke-linecap="round"/>` +
      `<path d="M53 77 Q60 73 67 77 Q60 81 53 77 Z" fill="#a4483f"/>` +
      `<circle cx="42" cy="70" r="4.5" fill="#ff8a7a" opacity=".22"/><circle cx="78" cy="70" r="4.5" fill="#ff8a7a" opacity=".22"/>` +
      accessory +
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
    banquet:    { kind: "room", wall: "#4a2c18", floor: "#5a3a22", trim: "#2c170a", lamp: "#ffd27a" }
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

  // Đặt khung cảnh gốc (1600 đơn vị) vào giữa thế giới 2400, hai bên dựng theo phong cách của cảnh
  function widen(key, svg, doors = []) {
    const m = svg.match(/^(<svg[^>]*>)<defs>([\s\S]*?)<\/defs>([\s\S]*)<\/svg>$/);
    if (!m) return svg;
    const [, open, defs, body] = m;
    const f = FLANK[key] || FLANK.shop;
    const k = `${key}-w`;
    const left = doors.filter((d) => d.side === "left");
    const right = doors.filter((d) => d.side === "right");
    const sideL = f.kind === "street" ? streetSide(k, 0, left) : roomSide(k, f, 0, left);
    const sideR = f.kind === "street" ? streetSide(k, WORLD_W - 400, right) : roomSide(k, f, WORLD_W - 400, right);
    const seam = rect(OX, 0, 60, 900, `url(#${k}-seamL)`) + rect(OX + COMP_W - 60, 0, 60, 900, `url(#${k}-seamR)`);
    return open.replace(`viewBox="0 0 ${COMP_W} 900"`, `viewBox="0 0 ${WORLD_W} 900"`) +
      `<defs>${defs}${blurs(k)}${flankDefs(k, f)}</defs>` +
      sideL + `<g transform="translate(${OX} 0)">${body}</g>` + seam + sideR + `</svg>`;
  }

  /* ---------- Bảng đăng ký cảnh ---------- */
  const SCENES = {
    shop, altar,
    alley: () => alley(false),
    alley_rain: () => alley(true),
    archive, gallery, gate, corridor, banquet, menu
  };

  return {
    // Cảnh điều tra được mở rộng thành thế giới panorama có cửa; menu giữ khung gốc
    scene: (key, doors = []) => (key === "menu" || !SCENES[key] ? SCENES.menu() : widen(key, SCENES[key](), doors)),
    portrait,
    evidence(v) {
      if (v.k === "paper") return paper(v);
      if (v.k === "cam") return camView(v);
      if (v.k === "lock") return lockView();
      if (v.k === "box") return boxView();
      return "";
    }
  };
})();

export { ART };
