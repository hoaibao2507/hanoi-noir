/* =====================================================================
   Bộ đồ nghề vẽ SVG dùng chung cho mọi cảnh: tạo hình cơ bản (rect, path, circle, line, txt), gradient, quầng sáng,
   và các vật thể lặp lại giữa nhiều cảnh (đèn lồng, nhà ống, bình, bát, sen, nến). Chỉ trả chuỗi SVG, không đụng DOM.
   ===================================================================== */
let seq = 0;
export const uid = (p) => `${p}${++seq}`;
/* ---------- Tiện ích chung ---------- */
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Làm tối (amt < 0) hoặc làm sáng (amt > 0) một màu hex
export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (v) => Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt);
  const r = mix(n >> 16), g = mix((n >> 8) & 255), b = mix(n & 255);
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

export const stops = (list) =>
  list.map(([o, col, a = 1]) => `<stop offset="${o}" stop-color="${col}" stop-opacity="${a}"/>`).join("");
export const lin = (id, list, x1 = 0, y1 = 0, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(list)}</linearGradient>`;
export const rect = (x, y, w, h, fill, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
export const path = (d, fill, extra = "") => `<path d="${d}" fill="${fill}" ${extra}/>`;
export const circle = (x, y, r, fill, extra = "") => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
export const line = (x1, y1, x2, y2, stroke, w = 2, extra = "") =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}" ${extra}/>`;
export const txt = (x, y, s, size, fill, extra = "") =>
  `<text x="${x}" y="${y}" font-family="'Noto Serif Display',Georgia,serif" font-size="${size}" fill="${fill}" ${extra}>${s}</text>`;

// Bộ lọc làm mờ dùng chung cho đèn và sương (đặt id theo tiền tố cảnh)
export const blurs = (k) =>
  `<filter id="${k}-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="18"/></filter>` +
  `<filter id="${k}-haze" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="46"/></filter>`;
export const glow = (k, x, y, r, col, op = 0.55) => circle(x, y, r, col, `opacity="${op}" filter="url(#${k}-glow)"`);
export const haze = (k, x, y, r, col, op = 0.3) => circle(x, y, r, col, `opacity="${op}" filter="url(#${k}-haze)"`);
export const frame = (label, defs, body) =>
  `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(label)}"><defs>${defs}</defs>${body}</svg>`;

/* ---------- Vật thể kiến trúc & đồ vật ---------- */

// Đèn lồng: quả cầu thuôn, có nắp, dây treo và tua đỏ; quầng sáng nằm ngoài nhóm để không lắc theo
export function lantern(k, x, top, s = 1, col = "#c8242b") {
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
export function tube(x, base, w, h, o = {}) {
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
export function vase(x, by, w, h, col) {
  return path(`M${x - w * 0.2} ${by} C${x - w * 0.62} ${by - h * 0.25} ${x - w * 0.5} ${by - h * 0.6} ${x - w * 0.3} ${by - h * 0.78} L${x - w * 0.22} ${by - h} L${x + w * 0.22} ${by - h} L${x + w * 0.3} ${by - h * 0.78} C${x + w * 0.5} ${by - h * 0.6} ${x + w * 0.62} ${by - h * 0.25} ${x + w * 0.2} ${by} Z`, col) +
    path(`M${x - w * 0.45} ${by - h * 0.42} Q${x} ${by - h * 0.36} ${x + w * 0.45} ${by - h * 0.42}`, "none", `stroke="${shade(col, 0.5)}" stroke-width="4"`) +
    path(`M${x - w * 0.3} ${by - h * 0.2} Q${x - w * 0.42} ${by - h * 0.55} ${x - w * 0.26} ${by - h * 0.8}`, "none", 'stroke="#fff" stroke-opacity=".28" stroke-width="4" stroke-linecap="round"') +
    rect(x - w * 0.22, by - h - 4, w * 0.44, 7, shade(col, -0.25), 'rx="3"');
}

// Bát sứ: thân bán cầu và miệng bát sáng
export function bowl(x, y, col, w = 60) {
  return path(`M${x - w / 2} ${y} Q${x} ${y + w * 0.5} ${x + w / 2} ${y} Z`, col) +
    path(`M${x - w / 2} ${y} Q${x} ${y - w * 0.18} ${x + w / 2} ${y} Q${x} ${y + 4} ${x - w / 2} ${y} Z`, shade(col, 0.35));
}

// Lotus (núm sen): nhiều cánh xếp quanh một tâm
export function lotus(x, y, s, col) {
  let d = "";
  [-64, -32, 0, 32, 64].forEach((a) => {
    d += path(`M${x} ${y} C${x - 9 * s} ${y - 6 * s} ${x - 8 * s} ${y - 26 * s} ${x} ${y - 30 * s} C${x + 8 * s} ${y - 26 * s} ${x + 9 * s} ${y - 6 * s} ${x} ${y} Z`,
      col, `transform="rotate(${a} ${x} ${y})"`);
  });
  return d + circle(x, y, 4 * s, shade(col, -0.3));
}

// Đèn nến: thân nến và ngọn lửa có quầng sáng
export function candle(k, x, y) {
  return rect(x - 7, y, 14, 50, "#f5efe0", 'rx="2"') +
    path(`M${x} ${y - 20} Q${x - 9} ${y - 2} ${x} ${y + 8} Q${x + 9} ${y - 2} ${x} ${y - 20} Z`, "#ffcf6b") +
    glow(k, x, y - 6, 42, "#ffd27a", 0.85);
}

