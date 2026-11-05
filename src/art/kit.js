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
