/* =====================================================================
   Người trong tranh: dáng đứng ngoài cảnh (figure) và chân dung nghi phạm (portrait) dùng chung một bộ vẽ,
   nên người trong cảnh và trong sổ tay luôn là cùng một người.
   Hệ toạ độ cục bộ: gốc ở giữa đỉnh đầu, trục y hướng xuống, cao 229 đơn vị (khoảng 6,9 đầu như người thật).
   Mốc theo chiều cao: cằm 33 · vai 41 · nách 66 · eo 90 · hông 112 · gối 165 · cổ chân 215 · gót 229.
   Chỉ có chuỗi SVG, không dùng gradient nên không cần id duy nhất.
   ===================================================================== */

export const FIG_H = 229;      // chiều cao người đứng (đơn vị cục bộ, tỉ lệ s = 1)
export const FIG_SEAT = 140;   // người ngồi chỉ vẽ tới đây (phần dưới bị bàn che)
export const SHOE = "1c1511";  // màu giày, để lớp Phaser nhận ra chân có lộ ra không (render/actors.js)
const HALF_W = 37;             // nửa bề rộng gồm cả hai cánh tay

// Làm tối (amt < 0) hoặc sáng (amt > 0) một màu hex
function shade(hex, amt) {
  const t = hex.length === 4 ? "#" + [...hex.slice(1)].map((c) => c + c).join("") : hex;
  const n = parseInt(t.slice(1), 16);
  const mix = (v) => Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt);
  return "#" + ((1 << 24) | (mix(n >> 16) << 16) | (mix((n >> 8) & 255) << 8) | mix(n & 255)).toString(16).slice(1);
}

const P = (d, fill, extra = "") => `<path d="${d}" fill="${fill}" ${extra}/>`;
const C = (x, y, r, fill, extra = "") => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const R = (x, y, w, h, fill, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const L = (x1, y1, x2, y2, stroke, w, extra = "") =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
const STROKE = (d, stroke, w, extra = "") => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;

// Chi thể thon dần từ (x1, y1) đến (x2, y2), hai đầu tròn để khớp nối liền mạch
function limb(x1, y1, x2, y2, w1, w2, fill, extra = "") {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const f = (v) => +v.toFixed(2);
  const d = `M${f(x1 + (nx * w1) / 2)} ${f(y1 + (ny * w1) / 2)} L${f(x2 + (nx * w2) / 2)} ${f(y2 + (ny * w2) / 2)} ` +
    `L${f(x2 - (nx * w2) / 2)} ${f(y2 - (ny * w2) / 2)} L${f(x1 - (nx * w1) / 2)} ${f(y1 - (ny * w1) / 2)} Z`;
  return P(d, fill, extra) + C(f(x1), f(y1), f(w1 / 2), fill, extra) + C(f(x2), f(y2), f(w2 / 2), fill, extra);
}

// Dáng người nữ: tóc dài hoặc búi mặc định là nữ; look.sex ("m" hoặc "f") ghi đè
export const isFemale = (o) => (o.sex ? o.sex === "f" : o.hair === "long" || o.hair === "bun");

/* ---------- Đầu: mặt, tai, tóc, nét mặt, kính ria ---------- */
function head(o, f) {
  const skin = o.skin || "#dca57a", hc = o.hc || "#1e1712";
  const skD = shade(skin, -0.16), skDD = shade(skin, -0.32);
  const dark = shade(hc, -0.45), hi = shade(hc, 0.3);
  const w = f ? 11.6 : 12.4;
  const face = f
    ? "M0 1 C7.6 1 11.6 6 11.6 15 C11.6 21 10 25.8 7 29.4 C5.2 31.8 2.8 33.2 0 33.2 C-2.8 33.2 -5.2 31.8 -7 29.4 C-10 25.8 -11.6 21 -11.6 15 C-11.6 6 -7.6 1 0 1 Z"
    : "M0 1 C8 1 12.4 6 12.4 15 C12.4 21.5 11 26 8 29.6 C6 32 3.4 33.3 0 33.3 C-3.4 33.3 -6 32 -8 29.6 C-11 26 -12.4 21.5 -12.4 15 C-12.4 6 -8 1 0 1 Z";
  let s = "";
  // Tai
  s += `<ellipse cx="${-w - 0.3}" cy="17.5" rx="1.9" ry="3.3" fill="${skD}"/><ellipse cx="${w + 0.3}" cy="17.5" rx="1.9" ry="3.3" fill="${skD}"/>`;
  s += P(face, skin);
  // Bóng bên phải mặt, dưới trán và dưới cằm cho có khối
  s += P("M5 1.4 C9.5 3 12.4 8 12.4 15 C12.4 21.5 11 26 8 29.6 C6 32 3.4 33.3 1.5 33.3 C5 30 6.5 24 6 17 C5.8 11 5.6 6 5 1.4 Z", skD, 'opacity=".38"');
  s += P(`M${-w + 2.5} 30.5 Q0 35.5 ${w - 2.5} 30.5 Q0 33.6 ${-w + 2.5} 30.5 Z`, skDD, 'opacity=".35"');

  // Nét mặt
  const ey = 16.6, ex = 5.2;
  const expr = o.expr || "calm"; // calm | tense (căng thẳng, bị chạm vào điểm yếu) | worried (lo lắng, sắp khai thêm) | smile
  const ry = expr === "tense" ? 1.05 : expr === "worried" ? 1.6 : 1.5;
  const brow = (sg) => {
    if (expr === "tense") return f ? `M${sg * 2.4} 13.2 Q${sg * 5.6} 11.2 ${sg * 9} 12` : `M${sg * 2.2} 13.7 Q${sg * 5.8} 11.6 ${sg * 9.2} 12`;
    if (expr === "worried") return `M${sg * 2.4} 11 Q${sg * 5.8} 11 ${sg * 9.2} 13`;
    return f ? `M${sg * 2.6} 12.9 Q${sg * 5.6} 10.4 ${sg * 9} 12.3` : `M${sg * 2.4} 12.6 Q${sg * 5.8} 11 ${sg * 9.2} 12.4`;
  };
  for (const sg of [-1, 1]) {
    s += `<ellipse cx="${sg * ex}" cy="${ey}" rx="2.7" ry="${ry}" fill="#f4efe6"/>`;
    s += C(sg * (ex - 0.1), ey, 1.35, "#2a1b12") + C(sg * (ex - 0.1) - 0.45, ey - 0.5, 0.4, "#fff", 'opacity=".9"');
    s += STROKE(`M${sg * ex - 2.9} ${ey - 0.2} Q${sg * ex} ${ey - 2.4} ${sg * ex + 2.9} ${ey - 0.2}`, "#2a1b12", 0.75);
    // Lông mày: nữ mảnh và cong, nam đậm và thẳng hơn; căng thẳng thì cau xuống, lo lắng thì nhướn đầu mày lên
    s += STROKE(brow(sg), dark, f ? 0.95 : 1.5);
  }
  if (expr === "worried") s += P("M10.6 5.6 Q12.4 9.2 10.6 10.8 Q8.8 9.2 10.6 5.6 Z", "#bfe3f5", 'opacity=".85"');
  s += STROKE("M0.2 17.6 C0 20.6 -1.3 22.3 -2.1 22.9 Q0 24.1 2.1 22.9", skDD, 0.85, 'opacity=".85"');
  s += C(-1.1, 23.1, 0.35, skDD, 'opacity=".7"') + C(1.1, 23.1, 0.35, skDD, 'opacity=".7"');
  if (f) {
    const lips = {
      calm: "M-3.5 28 Q-1.7 26.6 0 27.2 Q1.7 26.6 3.5 28 Q0 31.2 -3.5 28 Z",
      tense: "M-3.3 28.3 Q0 27.8 3.3 28.3 Q0 29.6 -3.3 28.3 Z",
      worried: "M-3.3 29.2 Q0 27.1 3.3 29.2 Q0 28.4 -3.3 29.2 Z",
      smile: "M-3.9 27.3 Q0 27.9 3.9 27.3 Q0 31.8 -3.9 27.3 Z"
    };
    s += P(lips[expr] || lips.calm, "#b85a4e");
    s += C(-7.6, 22.4, 2.7, "#ff8a7a", `opacity="${expr === "tense" ? 0.08 : 0.16}"`) + C(7.6, 22.4, 2.7, "#ff8a7a", `opacity="${expr === "tense" ? 0.08 : 0.16}"`);
  } else {
    const mouth = { calm: "M-3.6 28.1 Q0 29.9 3.6 28.1", tense: "M-3.4 28.7 L3.4 28.7", worried: "M-3.4 29.5 Q0 27.6 3.4 29.5", smile: "M-4 27.5 Q0 31 4 27.5" };
    s += STROKE(mouth[expr] || mouth.calm, "#7e362c", 1);
    if (expr === "calm") s += STROKE("M-1.8 30.2 Q0 31 1.8 30.2", skDD, 0.7, 'opacity=".6"');
  }

  // Tóc
  const cap = (top, part) => P(
    `M-12.9 ${f ? 16 : 14} C-13.6 3 -7 ${top} 0 ${top} C7 ${top} 13.6 3 12.9 ${f ? 16 : 14} ` +
    (part
      ? "C11 9 6 5 0 4.2 C-6 5 -11 9 -12.9 16 Z"
      : "C12 9 10 6.6 6 5.4 C2.5 6.8 -2.2 6.8 -6 5.2 C-10 6.6 -12 9 -12.9 14 Z"), hc);
  const shine = (y) => STROKE(`M-6.4 ${y + 1.2} Q0 ${y - 1.6} 6.4 ${y + 1.4}`, hi, 0.9, 'opacity=".5"');
  let front = "", back = "", sides = "";
  if (o.hair === "short") {
    front = cap(-1.6, false) + shine(-0.2) +
      P("M-12.9 13.5 L-11.6 21 L-10.4 14.2 Z", hc) + P("M12.9 13.5 L11.6 21 L10.4 14.2 Z", hc);
  } else if (o.hair === "long") {
    front = cap(-1.6, true) + shine(-0.2);
    const reach = f ? 60 : 44;
    back = P(`M-13 12 C-17 30 -18 ${reach + 22} -15 ${reach + 28} L15 ${reach + 28} C18 ${reach + 22} 17 30 13 12 Z`, shade(hc, -0.12));
    sides =
      P(`M-12.6 14 C-15.5 24 -17 ${reach - 16} -14.6 ${reach} C-10.6 ${reach + 2} -7.6 ${reach - 4} -8 ${reach - 16} C-8.4 28 -10.6 24 -11.2 15 Z`, hc) +
      P(`M12.6 14 C15.5 24 17 ${reach - 16} 14.6 ${reach} C10.6 ${reach + 2} 7.6 ${reach - 4} 8 ${reach - 16} C8.4 28 10.6 24 11.2 15 Z`, shade(hc, -0.1));
  } else if (o.hair === "bun") {
    front = cap(-1.4, true) + shine(-0.2) + C(0, -6.2, 7.2, hc) + STROKE("M-3.6 -9.4 Q0 -11.6 3.6 -9.4", hi, 0.9, 'opacity=".5"');
  } else if (o.hair === "bald") {
    front = P("M-12.3 12 C-13.3 17 -12.9 22 -11.5 24.4 L-10.5 18 C-10.9 15 -11 13 -12.3 12 Z", hc) +
      P("M12.3 12 C13.3 17 12.9 22 11.5 24.4 L10.5 18 C10.9 15 11 13 12.3 12 Z", hc) +
      `<ellipse cx="-3.2" cy="3.4" rx="4.4" ry="1.5" fill="#fff" opacity=".22"/>`;
  } else if (o.hair === "hat") {
    front =
      P("M-11.6 9 C-12 -3 -7 -8.2 0 -8.2 C7 -8.2 12 -3 11.6 9 Z", hc) +
      R(-11.7, 3.4, 23.4, 3.2, shade(hc, -0.42)) +
      STROKE("M-7 -7.4 Q0 -4.6 7 -7.4", shade(hc, -0.25), 0.9) +
      P("M-17.8 9.4 Q0 4.6 17.8 9.4 Q15 13 0 13.3 Q-15 13 -17.8 9.4 Z", shade(hc, 0.1)) +
      P("M-11.5 13.3 Q0 15.6 11.5 13.3 Q0 18.5 -11.5 13.3 Z", "#000", 'opacity=".22"');
  }

  // Kính, ria
  let acc = "";
  if (o.glasses) {
    for (const sg of [-1, 1]) acc += `<rect x="${sg * ex - 4.3}" y="${ey - 3.4}" width="8.6" height="6.6" rx="2.4" fill="#cfe6f0" fill-opacity=".14" stroke="#262626" stroke-width=".95"/>`;
    acc += STROKE(`M${-ex + 4.3} ${ey - 1.2} Q0 ${ey - 2.6} ${ex - 4.3} ${ey - 1.2}`, "#262626", 0.9);
    acc += L(-ex - 4.3, ey - 1.4, -w - 0.4, ey - 1.8, "#262626", 0.8) + L(ex + 4.3, ey - 1.4, w + 0.4, ey - 1.8, "#262626", 0.8);
  }
  if (o.mustache) acc += P("M-5.4 26.6 Q-3 23.6 0 25 Q3 23.6 5.4 26.6 Q2.6 27.2 0 26 Q-2.6 27.2 -5.4 26.6 Z", shade(hc === "#bbb" ? "#999999" : hc, -0.35));

  return { back, hairFront: front + sides, face: s, acc, w };
}

/* ---------- Thân: cổ, áo, tay, quần, giày ---------- */
// opts: seated (chỉ tới FIG_SEAT), legs (vẽ chân), bottom (độ dài thân áo)
function body(o, f, opts) {
  const aodai = f && o.outfit === "aodai"; // áo dài: cổ đứng, cài chéo, tà dài tới gần cổ chân, quần lụa sáng màu bên trong
  const skin = o.skin || "#dca57a", top = o.top || "#4f6b3a", pants = o.pants || (aodai ? "#efe8d6" : "#2b2f3a");
  const skD = shade(skin, -0.16), skDD = shade(skin, -0.32);
  const topD = shade(top, -0.2), topL = shade(top, 0.16), pantsD = shade(pants, -0.16), pantsL = shade(pants, 0.18);
  const long = aodai && opts.legs && !opts.seated; // tà áo dài che gần hết chân
  const yb = opts.seated ? FIG_SEAT : long ? 204 : f ? 110 : 106;
  let s = "";

  // Chân và giày
  if (opts.legs && !opts.seated) {
    s += P(`M${f ? -17 : -21.5} 96 L${f ? 17 : 21.5} 96 L${f ? 21.5 : 23} 120 Q0 127 ${f ? -21.5 : -23} 120 Z`, pants);
    for (const sg of [-1, 1]) {
      const c = sg < 0 ? pants : pantsD;
      s += limb(sg * 10, 114, sg * 9.8, 166, 19.5, 14, c) + limb(sg * 9.8, 166, sg * 8.8, 215, 14, 8.8, c);
      s += L(sg * 10, 130, sg * 9.6, 205, pantsL, 0.9, 'opacity=".35"');
      const cx = sg * 8.8;
      s += P(`M${cx - 4.6} 211 L${cx + 4.6} 211 L${cx + 7.2} 222 Q${cx + 8} 228.6 ${cx + 3} 229 L${cx - 3} 229 Q${cx - 8} 228.6 ${cx - 7.2} 222 Z`, `#${SHOE}`);
      s += R(cx - 7.6, 227, 15.2, 2, "#080605", 'rx="1"');
      s += STROKE(`M${cx - 3} 216 Q${cx} 218 ${cx + 3} 216`, "#4a3a30", 0.7, 'opacity=".7"');
    }
  }

  // Thân áo
  const torso = long
    ? `M-5 40 C-12 41 -20 41.5 -24 48 L-23 66 C-21 76 -17 84 -16.5 90 C-16.5 112 -19 156 -22 ${yb} L22 ${yb} C19 156 16.5 112 16.5 90 C17 84 21 76 23 66 L24 48 C20 41.5 12 41 5 40 Z`
    : f
    ? `M-5 40 C-12 41 -20 41.5 -24 48 L-23 66 C-21 76 -17 84 -16.5 90 C-16.5 100 -20 106 -21 ${yb} L21 ${yb} C20 106 16.5 100 16.5 90 C17 84 21 76 23 66 L24 48 C20 41.5 12 41 5 40 Z`
    : `M-6 40 C-14 41 -24 41.5 -28 48 L-27 66 C-25 80 -23 92 -22 ${yb} L22 ${yb} C23 92 25 80 27 66 L28 48 C24 41.5 14 41 6 40 Z`;
  s += P(torso, top);
  s += P(f
    ? `M5 40 C12 41 20 41.5 24 48 L23 66 C21 76 17 84 16.5 90 C16.5 100 20 106 21 ${yb} L9 ${yb} C10 90 10 60 5 40 Z`
    : `M6 40 C14 41 24 41.5 28 48 L27 66 C25 80 23 92 22 ${yb} L10 ${yb} C12 90 12 62 6 40 Z`, topD, 'opacity=".5"');
  if (f) s += STROKE("M-14 62 Q-8 70 -2 64", topD, 0.9, 'opacity=".55"') + STROKE("M14 62 Q8 70 2 64", topD, 0.9, 'opacity=".55"');

  // Cổ áo: sơ mi trắng khi có cà vạt, còn lại là cổ chữ V lộ da. Áo dài thì cổ đứng và đường cài chéo qua vai phải
  const tie = o.tie, white = "#eee8da";
  if (aodai) {
    s += P("M-5.8 37.6 L-5.6 45.2 Q0 49 5.6 45.2 L5.8 37.6 Q0 41.6 -5.8 37.6 Z", topL);
    s += STROKE("M2.4 46.6 C10 49.6 16.6 55.6 20 66 L20.4 100", topD, 0.9, 'opacity=".8"');
    for (const [bx, by] of [[5, 47.8], [13, 52.4], [18.6, 60]]) s += C(bx, by, 0.9, topD);
    if (long) {
      s += STROKE(`M-17.4 120 L-22 ${yb - 1}`, topD, 0.8, 'opacity=".6"') + STROKE(`M17.4 120 L22 ${yb - 1}`, topD, 0.8, 'opacity=".6"');
      s += L(-22, yb - 1.4, 22, yb - 1.4, topL, 1.4, 'opacity=".75"');
    }
  } else {
  const neckV = tie ? white : skin;
  s += P("M-7.2 39.6 L0 53.5 L7.2 39.6 Z", neckV);
  if (!tie) s += P("M-7.2 39.6 L0 53.5 L7.2 39.6 Q0 44 -7.2 39.6 Z", skD, 'opacity=".5"');
  s += P("M-8.6 39 L-1.4 52.6 L-10.8 48.4 Z", tie ? white : topL) + P("M8.6 39 L1.4 52.6 L10.8 48.4 Z", tie ? "#d9d2c1" : shade(topL, -0.12));
  s += L(0, tie ? 53 : 54, 0, yb, topD, 0.8, 'opacity=".7"');
  for (const y of [66, 80, 94]) if (y < yb - 6) s += C(f ? 1.4 : 1.5, y, 1.05, topD);
  }
  if (tie) {
    s += P("M-2.7 43.6 L2.7 43.6 L2.1 49.6 L-2.1 49.6 Z", shade(tie, -0.15));
    s += P("M-2.3 49.6 L2.3 49.6 L3.8 86 L0 92 L-3.8 86 Z", tie);
    s += L(-0.9, 52, -1.4, 84, "#fff", 0.7, 'opacity=".22"');
  }
  if (!opts.seated && !f && opts.legs) {
    s += R(-22.6, 103, 45.2, 5.6, "#1d1612", 'rx="1"') + R(-3, 103.8, 6, 4, "none", 'stroke="#c9a227" stroke-width="0.9" rx="0.8"');
  }

  // Tay: ống tay áo thon, cổ tay áo, bàn tay. Dáng đứng: tay buông; đút túi, chống hông, khoanh tay (không áp dụng cho người ngồi)
  const arm = f
    ? { sx: 21.5, ex: 25, wx: 23.5, w1: 11.5, w2: 9.6, w3: 8 }
    : { sx: 25, ex: 29.5, wx: 28, w1: 14, w2: 11.6, w3: 9.4 };
  const pose = opts.seated ? "stand" : opts.pose || "stand";
  const sleeve = (sg) => (sg < 0 ? shade(top, -0.04) : shade(top, -0.16));
  const blob = (x, y, rx, ry, sg, rot = 0) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${sg < 0 ? skin : skD}" transform="rotate(${rot} ${x} ${y})"/>`;
  const hanging = (sg) => {
    const c = sleeve(sg);
    let a = limb(sg * arm.sx, 51, sg * arm.ex, 88, arm.w1, arm.w2, c) + limb(sg * arm.ex, 88, sg * arm.wx, 112, arm.w2, arm.w3, c);
    a += STROKE(`M${sg * (arm.sx - arm.w1 * 0.42)} 56 L${sg * (arm.ex - arm.w2 * 0.42)} 86`, shade(top, 0.14), 0.8, 'opacity=".35"');
    a += L(sg * arm.wx - 4.4, 111, sg * arm.wx + 4.4, 111, topL, 1.2, 'opacity=".7"');
    const hx = sg * (arm.wx + 0.4);
    const hand = sg < 0 ? skin : skD;
    // Bàn tay: cổ tay thon, mu bàn tay rộng nhất ở khớp ngón, các ngón khép lại thon dần; ngón cái ở phía trong
    a += P(`M${hx - 3.1} 112 C${hx - 3.7} 116 ${hx - 4} 119 ${hx - 3.7} 122.5 C${hx - 3.6} 126 ${hx - 3.1} 129.5 ${hx - 1.8} 131.4 Q${hx} 132.6 ${hx + 1.8} 131.4 C${hx + 3.1} 129.5 ${hx + 3.6} 126 ${hx + 3.7} 122.5 C${hx + 4} 119 ${hx + 3.7} 116 ${hx + 3.1} 112 Z`, hand);
    a += P(`M${hx - sg * 3} 114 C${hx - sg * 5.4} 117 ${hx - sg * 5.8} 121.5 ${hx - sg * 4.6} 124.6 L${hx - sg * 3} 121.5 Z`, hand);
    a += STROKE(`M${hx - 1.3} 126 L${hx - 1.2} 131 M${hx + 0.1} 126 L${hx + 0.1} 131.4 M${hx + 1.5} 126 L${hx + 1.4} 131`, skDD, 0.45, 'opacity=".5"');
    return a;
  };
  // Cánh tay gập: vai → khuỷu → điểm cuối (tay nằm ở đó)
  const bent = (sg, ex, ey, tx, ty) => {
    const c = sleeve(sg);
    return limb(sg * arm.sx, 51, ex, ey, arm.w1, arm.w2, c) + limb(ex, ey, tx, ty, arm.w2, arm.w3, c);
  };
  if (pose === "cross") {
    for (const sg of [-1, 1]) {
      // Hai cẳng tay vắt chéo trước ngực; tay phải (bên phải ảnh) đè lên trên
      const ex = sg * (arm.ex - 3), tx = -sg * 13, ty = sg < 0 ? 77 : 71;
      s += bent(sg, ex, 84, tx, ty) + blob(tx - (-sg) * 2.5, ty + 0.5, 3.6, 4.4, sg, sg * 35);
    }
  } else if (pose === "pocket" || pose === "hip") {
    const ps = f ? -1 : 1; // bên có tay đút túi hoặc chống hông
    s += hanging(-ps);
    if (pose === "pocket") {
      s += bent(ps, ps * (arm.ex - 1), 87, ps * 15.5, 106) + blob(ps * 18.2, 103.6, 2.4, 1.8, ps, ps * 30);
      s += STROKE(`M${ps * 11.5} 103 L${ps * 19.5} 109.5`, pantsD, 0.8, 'opacity=".8"');
    } else {
      s += bent(ps, ps * (arm.ex + 8), 84, ps * 19, 104) + blob(ps * 19.6, 106, 3.4, 3.1, ps, ps * 40);
    }
  } else {
    s += hanging(-1) + hanging(1);
  }
  return { under: s, yb };
}

// Khăn quàng cổ có đuôi buông trước ngực
function scarf(col) {
  return P("M-9 37 Q0 44 9 37 L10.4 44.6 Q0 53 -10.4 44.6 Z", col) +
    P("M-7 47 L-1 48 L0.4 74 L-7.4 70 Z", shade(col, -0.18)) +
    STROKE("M-9 40 Q0 47 9 40", shade(col, 0.25), 0.9, 'opacity=".6"');
}

// Phần cổ (vẽ sau thân, trước đầu)
function neck(o, f) {
  const skin = o.skin || "#dca57a";
  const w = f ? 4.4 : 5.4;
  return P(`M${-w} 28 L${-w - 0.5} 43 L${w + 0.5} 43 L${w} 28 Z`, shade(skin, -0.12)) +
    P(`M${-w} 29 Q0 38 ${w} 29 Z`, shade(skin, -0.34), 'opacity=".45"');
}

// Toàn thân (hoặc nửa thân khi bust): trả chuỗi SVG trong hệ toạ độ cục bộ
function person(o, opts = {}) {
  const f = isFemale(o);
  const h = head(o, f);
  const b = body(o, f, { seated: !!o.seated, legs: !opts.bust, pose: opts.pose });
  // Đầu phóng 10% quanh cằm: đọc rõ hơn khi nhân vật nhỏ trên màn hình, vẫn cỡ 6 đầu rưỡi
  const big = (g) => `<g transform="translate(0 33) scale(1.1) translate(0 -33)">${g}</g>`;
  return big(h.back) + neck(o, f) + b.under + (o.scarf ? scarf(o.scarf) : "") + big(h.face + h.hairFront + h.acc);
}

// Dáng đứng cố định cho từng người (suy ra từ trang phục nên ở cảnh nào họ cũng đứng một kiểu): nam đút túi hoặc khoanh tay, nữ chống hông hoặc khoanh tay
function poseFor(o) {
  if (o.pose) return o.pose;
  if (o.seated) return "stand";
  const key = `${o.top}${o.hair}${o.skin}`;
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (isFemale(o) ? ["stand", "hip", "cross", "stand"] : ["stand", "pocket", "cross", "stand"])[h % 4];
}

/* ---------- Người trong cảnh ---------- */
// (x, headY): giữa đỉnh đầu; s: tỉ lệ. Cao 229 × s. Nhóm "fig" mang số đo cho lớp Phaser (render/actors.js)
export function figure(x, headY, s = 1, o = {}) {
  const topLocal = o.hair === "bun" ? -18 : o.hair === "hat" ? -12.6 : -5.4;
  const bot = o.seated ? FIG_SEAT : FIG_H;
  const m = [x, headY + topLocal * s, headY + bot * s, HALF_W * s, o.seated ? 1 : 0, s].map((v) => +v.toFixed(1)).join(",");
  return `<g class="fig" data-fig="${m},${SHOE}"><g transform="translate(${x} ${headY}) scale(${s})">${person(o, { pose: poseFor(o) })}</g></g>`;
}

/* ---------- Chân dung nghi phạm (khung 120 × 140) ---------- */
// expr: calm (mặc định) | tense | worried | smile
export function portrait(look, id, expr = "calm") {
  const { top, hair } = look;
  const o = { ...look, expr, glasses: look.acc === "glasses", mustache: look.acc === "mustache", tie: look.acc === "tie" ? look.ac || "#b71c1c" : null, scarf: look.acc === "scarf" ? look.ac : null };
  const g = `pt${id}`;
  const ty = hair === "bun" ? 32 : hair === "hat" ? 27 : 17;
  return `<svg class="portrait" viewBox="0 0 120 140" role="img" aria-label="Chân dung">` +
    `<defs><linearGradient id="${g}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a1d"/><stop offset="1" stop-color="#15100b"/></linearGradient></defs>` +
    `<rect width="120" height="140" fill="url(#${g}-bg)"/>` +
    `<circle cx="60" cy="52" r="62" fill="#ffd98e" opacity=".08"/>` +
    `<g transform="translate(60 ${ty}) scale(1.9)">${person({ ...o, top }, { bust: true })}</g>` +
    `</svg>`;
}
