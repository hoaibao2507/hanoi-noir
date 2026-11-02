/* =====================================================================
   Ánh sáng thật cho nền cảnh (Phaser 4 Lights): đèn pin theo con trỏ, các nguồn sáng tìm thấy trong
   chính bức tranh (đèn lồng, nến, cửa sổ) lập lòe theo nhịp thở, quầng sáng cộng màu quanh nguồn,
   và bước chỉnh màu toàn khung hình. Chỉ chạy khi renderer là WebGL; ngược lại mọi thứ im lặng bỏ qua
   và CSS vẫn đảm nhiệm đèn pin.
   ===================================================================== */
import LightsPlugin from "phaser-lights";
import { ensurePuff } from "../ui/ambience.js";

// Bản phaser-core không kèm plugin ánh sáng; world.js đăng ký nó vào cấu hình game
export const lightsPluginEntry = { key: "LightsPlugin", plugin: LightsPlugin, mapping: "lights" };

const REDUCED = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const AMBIENT = 0x7a7066;   // ánh sáng nền: vùng đèn không với tới vẫn đủ thấy hình
const BEAM_COLOR = 0xffdcae;
const COLD = [0xcb, 0xdc, 0xff];
const FIRE = [0xff, 0xb0, 0x5a];
const POOL = 6;

const lerp = (a, b, k) => a + (b - a) * k;
const mix = (k) => (Math.round(lerp(COLD[0], FIRE[0], k)) << 16) | (Math.round(lerp(COLD[1], FIRE[1], k)) << 8) | Math.round(lerp(COLD[2], FIRE[2], k));

export function createLighting(scene, glOn) {
  if (!glOn || !scene.lights) return { lit: false, setScene() {}, update() {}, flicker() {} };
  ensurePuff(scene);

  scene.lights.enable().setAmbientColor(AMBIENT);
  const beam = scene.lights.addLight(0, 0, 360, BEAM_COLOR, 0.95, 90);
  const pool = Array.from({ length: POOL }, () => scene.lights.addLight(-999, -999, 200, 0xffb05a, 0, 24));
  const halos = Array.from({ length: POOL }, () => scene.add.image(0, 0, "puff").setBlendMode("ADD").setDepth(6).setVisible(false));
  const beamHalo = scene.add.image(0, 0, "puff").setBlendMode("ADD").setDepth(6).setTint(BEAM_COLOR).setAlpha(0.1);

  // Chỉnh màu cả khung hình: bớt rực, thêm tương phản cho đúng chất phim đen
  try {
    const grade = scene.cameras.main.filters.external.addColorMatrix();
    grade.colorMatrix.saturate(-0.1).contrast(0.1, true);
  } catch (err) {
    console.warn("Không bật được chỉnh màu toàn khung.", err);
  }

  let lamps = [];
  let surge = 0; // 0..1: đèn chập chờn khi có diễn biến, tắt dần
  // Chập chờn êm: mỗi ~1/3 giây chọn lại mức mờ cho từng đèn rồi trượt dần tới đó (không chớp từng khung hình, tránh gây khó chịu)
  const dip = new Float32Array(POOL + 1).fill(1), want = new Float32Array(POOL + 1).fill(1);
  let tick = 0;

  return {
    lit: true,
    // Nguồn sáng của cảnh mới, toạ độ thế giới
    setScene(found) {
      lamps = found || [];
    },
    // Đèn chập chờn một lúc (diễn biến quan trọng)
    flicker(strength = 1) {
      if (REDUCED) return;
      surge = Math.min(1, surge + strength);
    },
    update(dt, t, env) {
      surge = Math.max(0, surge - dt * 0.9);
      const calm = REDUCED ? 0 : 1;
      tick -= dt;
      if (tick <= 0) {
        tick = 0.33;
        for (let i = 0; i <= POOL; i++) want[i] = surge > 0.05 && Math.random() < surge * 0.6 ? 0.5 : 1;
      }
      for (let i = 0; i <= POOL; i++) dip[i] += (want[i] - dip[i]) * Math.min(1, dt * 9);
      // Đèn pin: bám theo con trỏ
      const buzz = dip[POOL];
      beam.x = env.cur.x;
      beam.y = env.cur.y;
      beam.radius = Math.max(280, Math.min(400, Math.min(env.W, env.H) * 0.5));
      beam.intensity = 0.95 * buzz * (1 + calm * 0.025 * Math.sin(t * 0.011));
      beamHalo.setPosition(env.cur.x, env.cur.y).setScale((beam.radius * 1.3) / 128).setAlpha(0.1 * buzz);

      for (let i = 0; i < POOL; i++) {
        const lamp = lamps[i], light = pool[i], halo = halos[i];
        if (!lamp) {
          light.intensity = 0;
          halo.setVisible(false);
          continue;
        }
        const [sx, sy] = env.toScreen(lamp.x, lamp.y);
        // Mỗi nguồn có nhịp riêng; chập chờn thì ngẫu nhiên sáng tối
        const ph = i * 1.7;
        const wob = calm * (0.06 * Math.sin(t * 0.0031 + ph) + 0.04 * Math.sin(t * 0.0089 + ph * 2.3));
        const f = (1 + wob) * dip[i];
        const r = (230 + 150 * lamp.k) * env.unit;
        light.x = sx;
        light.y = sy;
        light.radius = r;
        light.z = r * 0.14;
        light.setColor(mix(lamp.warm));
        light.intensity = (0.6 + 0.8 * lamp.k) * f;
        halo
          .setVisible(true)
          .setPosition(sx, sy)
          .setTint(mix(lamp.warm))
          .setScale((210 + 150 * lamp.k) * env.unit / 128)
          .setAlpha((0.1 + 0.2 * lamp.k) * f);
      }
    }
  };
}
