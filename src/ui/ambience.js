/* =====================================================================
   Hiệu ứng môi trường vẽ bằng Phaser: bụi trong ánh đèn pin, mưa, khói hương
   và ánh đèn lập lòe. Mỗi cảnh bật hiệu ứng riêng qua AMBIENT. Toạ độ khói theo khung
   1600 × 900 gốc như trong cases.js; được đổi sang thế giới 2400 khi vẽ.
   Tắt hết khi người dùng bật giảm chuyển động.
   ===================================================================== */
import { OX } from "../world/layout.js";

export const AMBIENT = {
  alley_rain: { rain: true },
  altar: { smoke: [[800, 400]] }
};

const REDUCED = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const BEAM = 320; // bán kính vùng đèn pin, đơn vị px
const DUST = 0xffe2a8;
const RAIN = 0x9fc3dd;
const SMOKE = 0xe6d9bd;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Chấm sáng mờ dần ra ngoài, dùng làm khói
function softDot(size) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  const r = size / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.45, "rgba(255,255,255,0.45)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

// Tạo các hiệu ứng trên một Phaser Scene. update() gọi mỗi khung hình với env gồm:
// cur (con trỏ), W, H (kích thước khung nhìn), toScreen(wx, wy) và unit (px màn hình trên một đơn vị thế giới)
export function createAmbience(scene) {
  if (REDUCED) return { setScene() {}, update() {} };
  if (!scene.textures.exists("puff")) scene.textures.addCanvas("puff", softDot(128));

  const warm = scene.add.graphics().setBlendMode("ADD").setDepth(4);
  const dust = scene.add.graphics().setBlendMode("ADD").setDepth(3);
  const drops = scene.add.graphics().setDepth(2);
  const freeImages = []; // hình khói đã dùng xong, tái sử dụng để khỏi tạo đối tượng mới
  let puffs = [];
  let sources = [];      // nguồn khói, toạ độ thế giới
  let rainOn = false;
  let rain = [];
  let motes = [];
  let moteKey = "";
  let sceneKey = null;

  function newPuff(x, y) {
    const img = freeImages.pop() || scene.add.image(0, 0, "puff").setTint(SMOKE).setDepth(1);
    return {
      img, x, y, age: 0,
      life: 4.5 + Math.random() * 2.5,
      vx: (Math.random() - 0.5) * 6,
      vy: -(10 + Math.random() * 6),
      size: 70 + Math.random() * 40,
      a: 0.3 + Math.random() * 0.18,
      ph: Math.random() * 6
    };
  }

  function smoke(dt, env) {
    for (const s of sources) {
      s.acc += dt * 2.2;
      while (s.acc >= 1) {
        s.acc -= 1;
        puffs.push(newPuff(s.x, s.y));
      }
    }
    puffs = puffs.filter((p) => {
      p.age += dt;
      if (p.age >= p.life) {
        p.img.setVisible(false);
        freeImages.push(p.img);
        return false;
      }
      p.x += (p.vx + Math.sin(p.age * 1.7 + p.ph) * 6) * dt;
      p.y += p.vy * dt;
      const f = p.age / p.life;
      const [sx, sy] = env.toScreen(p.x, p.y);
      p.img
        .setPosition(sx, sy)
        .setScale((p.size * (0.5 + 0.9 * f) * env.unit) / 128)
        .setAlpha(p.a * Math.sin(Math.PI * f))
        .setVisible(true);
      return true;
    });
  }

  function newDrop(W, H, anywhere) {
    return {
      x: Math.random() * (W + 100) - 50,
      y: anywhere ? Math.random() * H : -20 - Math.random() * 60,
      v: 520 + Math.random() * 380,
      len: 10 + Math.random() * 14
    };
  }

  function rainDrops(dt, W, H) {
    drops.clear();
    if (!rainOn) return;
    if (!rain.length) rain = Array.from({ length: Math.round(clamp((W * H) / 9000, 40, 150)) }, () => newDrop(W, H, true));
    drops.lineStyle(1.2, RAIN, 0.32);
    for (const d of rain) {
      d.y += d.v * dt;
      d.x -= d.v * 0.18 * dt; // gió thổi sang trái
      if (d.y > H + 20 || d.x < -50) Object.assign(d, newDrop(W, H, false));
      drops.lineBetween(d.x + d.len * 0.3, d.y - d.len, d.x, d.y);
    }
  }

  function dustMotes(dt, cur, W, H) {
    const key = `${W}x${H}`;
    if (key !== moteKey) {
      moteKey = key;
      const n = Math.round(clamp((W * H) / 26000, 18, 70));
      motes = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.6 + Math.random() * 1.5,
        depth: 0.4 + Math.random() * 0.6,
        vx: (Math.random() - 0.5) * 5,
        vy: -(2.5 + Math.random() * 7),
        ph: Math.random() * Math.PI * 2
      }));
    }
    dust.clear();
    for (const m of motes) {
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      if (m.y < -10) {
        m.y = H + 10;
        m.x = Math.random() * W;
      }
      if (m.x < -10) m.x = W + 10;
      else if (m.x > W + 10) m.x = -10;
      m.ph += dt * 1.6;
      // Bụi gần hơn lệch nhiều hơn khi chuột di chuyển, tạo cảm giác chiều sâu
      const sx = m.x - cur.px * 14 * m.depth;
      const sy = m.y - cur.py * 8 * m.depth;
      const beam = Math.max(0, 1 - Math.hypot(sx - cur.x, sy - cur.y) / BEAM);
      dust.fillStyle(DUST, (0.1 + 0.55 * beam) * (0.75 + 0.25 * Math.sin(m.ph)));
      dust.fillCircle(sx, sy, m.r * (0.8 + 0.6 * beam));
    }
  }

  function warmLight(t, W, H) {
    const a = 0.016 + 0.01 * (0.5 + 0.5 * Math.sin(t * 0.0024) * Math.sin(t * 0.0071));
    warm.clear();
    warm.fillStyle(0xffb35c, a);
    warm.fillRect(0, 0, W, H);
  }

  return {
    setScene(key) {
      if (key === sceneKey) return;
      sceneKey = key;
      const cfg = AMBIENT[key] || {};
      rainOn = !!cfg.rain;
      rain = [];
      sources = (cfg.smoke || []).map(([x, y]) => ({ x: OX + x, y, acc: 0 }));
      for (const p of puffs) {
        p.img.setVisible(false);
        freeImages.push(p.img);
      }
      puffs = [];
    },
    update(dt, t, env) {
      warmLight(t, env.W, env.H);
      dustMotes(dt, env.cur, env.W, env.H);
      rainDrops(dt, env.W, env.H);
      smoke(dt, env);
    }
  };
}
