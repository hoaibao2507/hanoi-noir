/* =====================================================================
   Nhân vật có hơi thở. Mỗi người trong cảnh được cắt ra thành một "mảnh" của chính bức nền (cả phần đồ vật
   che trước mặt họ nên thứ tự trước sau vẫn đúng), dán lại đúng chỗ rồi:
   - thở: thân phình xẹp nhẹ quanh bàn chân;
   - nghiêng đầu về phía con trỏ, như đang để ý đến người điều tra;
   - đổ bóng dưới chân, dài ra và mờ dần ngược hướng đèn pin.
   Mảnh có viền mờ dần nên dịch vài điểm ảnh cũng không lộ đường nối.
   ===================================================================== */
import { cropPatch } from "./analyze.js";
import { WORLD_H } from "../world/layout.js";

const REDUCED = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Đọc các nhóm <g class="fig" data-fig="x,đỉnh,chân,nửa rộng,ngồi,tỉ lệ,màu giày"> trong SVG; shift là độ dịch của khung cảnh gốc
export function parseFigures(svg, shift) {
  const out = [];
  for (const m of svg.matchAll(/<g class="fig" data-fig="([^"]+)"/g)) {
    const [x, top, bot, hw, seat, s, shoe] = m[1].split(",");
    out.push({ x: +x + shift, top: +top, bot: +bot, hw: +hw, seated: seat === "1", s: +s, shoe });
  }
  return out;
}

function hexRGB(h) {
  const t = h.length === 3 ? h.replace(/./g, "$&$&") : h;
  const n = parseInt(t, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Chân người có lộ ra không? Lấy mẫu một điểm ở mũi giày trái; bị quầy hay bàn che thì màu sẽ khác màu giày
function feetVisible(probe, f) {
  const d = probe(f.x - 8.8 * f.s, f.bot - 8 * f.s);
  const [r, g, b] = hexRGB(f.shoe);
  return Math.hypot(d[0] - r, d[1] - g, d[2] - b) < 48;
}

export function createActors(scene, lit) {
  const shadow = scene.add.graphics().setBlendMode("MULTIPLY").setDepth(2);
  let list = [];
  let keys = [];
  let n = 0;

  function clear() {
    for (const a of list) a.img.destroy();
    for (const k of keys) scene.textures.remove(k);
    list = [];
    keys = [];
  }

  return {
    // figs: danh sách người (toạ độ thế giới); art, normal: canvas nền và bản đồ pháp tuyến của cảnh; probe: lấy màu nền tại một điểm
    setScene(figs, art, normal, worldW, probe) {
      clear();
      if (!figs.length) return;
      for (const f of figs) {
        const mxw = f.hw * 0.9, mtop = 16, mbot = 10;
        const left = f.x - f.hw - mxw, w = (f.hw + mxw) * 2;
        const top = f.top - mtop, h = f.bot + mbot - top;
        const p = cropPatch(art, normal, left / worldW, top / WORLD_H, w / worldW, h / WORLD_H, mxw / w, Math.max(mtop, mbot) / h);
        const key = `fig-${++n}`;
        scene.textures.addImage(key, p.tex, p.nor);
        keys.push(key);
        const img = scene.add.image(0, 0, key).setOrigin(0.5, (f.bot - top) / h).setDepth(1);
        if (lit) img.setLighting(true);
        list.push({
          img, f, w, h, sw: p.sw, sh: p.sh,
          ph: Math.random() * 6.28,
          rate: 1.25 + Math.random() * 0.4, // nhịp thở mỗi người một khác
          lean: 0,
          shade: !f.seated && feetVisible(probe, f)
        });
      }
    },

    update(dt, t, env) {
      shadow.clear();
      for (const a of list) {
        const { f, img } = a;
        const [sx, sy] = env.toScreen(f.x, f.bot);
        const u = env.unit;
        const breath = REDUCED ? 0 : Math.sin((t / 1000) * a.rate + a.ph);
        // Nghiêng về phía con trỏ, làm mượt để không giật
        const want = REDUCED ? 0 : clamp((env.cur.x - sx) / (env.W * 0.5), -1, 1) * 0.02;
        a.lean += (want - a.lean) * Math.min(1, dt * 3);
        img
          .setPosition(sx, sy)
          .setScale((a.w * u) / a.sw * (1 - 0.0035 * breath), (a.h * u) / a.sh * (1 + 0.008 * breath))
          .setRotation(a.lean);

        if (!a.shade) continue;
        // Bóng: ellipse mềm (nhiều lớp chồng) ở chân; đèn pin càng gần thì bóng càng đậm và càng ngả xa đèn
        const dx = sx - env.cur.x, dy = sy - env.cur.y;
        const dist = Math.hypot(dx, dy) || 1;
        const near = lit ? clamp(1 - dist / 760, 0, 1) : 0;
        const len = (f.hw * 0.9 + near * 150 + 20) * u;
        const cx = sx + (dx / dist) * len * 0.5 * near;
        const cy = sy + 3 * u + (dy / dist) * len * 0.1 * near;
        const base = 0.1 + 0.3 * near;
        for (let k = 0; k < 4; k++) {
          const s = 1 - k * 0.2;
          shadow.fillStyle(0x000000, base * 0.3);
          shadow.fillEllipse(cx, cy, len * 2 * s, (9 + 5 * near) * 2 * u * s);
        }
      }
    },

    clear
  };
}
