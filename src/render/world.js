/* =====================================================================
   Lớp thế giới bằng Phaser 4. Phaser vẽ nền cảnh (SVG đã raster hóa thành ảnh)
   và hiệu ứng môi trường. Chữ và cửa vẫn do DOM vẽ để dùng đúng phông webfont.
   Không dùng camera của Phaser: vị trí các lớp được tính từ cùng số liệu với DOM
   (scale, x, top), nên khớp với cửa và điểm điều tra.
   Nếu Phaser không chạy hoặc chưa vẽ xong nền, stage.js giữ SVG đầy đủ trong DOM.
   ===================================================================== */
import Phaser from "phaser";
import { cursorState } from "../ui/cursor.js";
import { createAmbience } from "../ui/ambience.js";
import { createLighting, lightsPluginEntry } from "./lighting.js";
import { createActors, parseFigures } from "./actors.js";
import { analyze } from "./analyze.js";
import { OX, WORLD_H } from "../world/layout.js";
import { LITE } from "../ui/device.js";

// Phóng nhẹ lớp nền để parallax không lộ mép. Khớp với #world-art trong main.css
const ART_ZOOM = 1.03;
const ART_PARALLAX = { x: -9, y: -5 }; // px ứng với độ nghiêng tối đa

let game = null;
let scene = null;   // WorldScene, có sau khi create() chạy xong
let view = null;    // {scale, x, top, worldW}, do stage.js cập nhật
let latest = null;  // {base, sceneKey, onReady}: nền cảnh được yêu cầu gần nhất
let token = 0;      // mã yêu cầu vẽ; yêu cầu cũ hơn bị bỏ qua
let texKey = null;
let rasterQ = 0;    // độ phân giải đang dùng cho nền
let resizeTimer = 0;

export function active() {
  return game !== null;
}

export function mount() {
  try {
    game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: "gl",
      backgroundColor: "#070a12",
      banner: false,
      audio: { noAudio: true },
      // Phaser 4 không có tùy chọn resolution: canvas luôn bằng kích thước CSS. Điện thoại thì bỏ MSAA của canvas cho đỡ băng thông
      render: { antialiasGL: !LITE },
      scale: { mode: Phaser.Scale.RESIZE },
      input: { keyboard: false, mouse: false, touch: false, gamepad: false }, // chuột, chạm, phím do DOM lo; Phaser không cần nghe
      plugins: { scene: [lightsPluginEntry] },
      scene: [WorldScene]
    });
  } catch (err) {
    console.warn("Phaser không khởi động được, dùng SVG trong DOM.", err);
    game = null;
  }
  if (import.meta.env && import.meta.env.DEV) window.__phaser = game; // chỉ khi chạy dev, để gỡ lỗi trong console
}

// Tách chữ khỏi nền. Chữ giữ lại cho DOM vẽ; mưa và khói được vẽ lại bằng Phaser
export function splitArt(svg) {
  const texts = [];
  const base = svg
    .replace(/<text\b[^>]*>[^<]*<\/text>/g, (t) => {
      texts.push(t);
      return "";
    })
    .replace(/<g class="rain">[\s\S]*?<\/g>/g, "")
    .replace(/<path[^>]*class="smoke"[^>]*\/>/g, "");
  const open = svg.match(/<svg\b[^>]*>/)[0];
  const shift = svg.includes(`translate(${OX} 0)`) ? OX : 0; // cảnh mở rộng đặt chữ trong nhóm dịch OX
  const overlay = `${open}<g transform="translate(${shift} 0)">${texts.join("")}</g></svg>`;
  return { base, overlay, figs: parseFigures(svg, shift) };
}

export function setArt(base, sceneKey, onReady, figs = []) {
  if (!game) return;
  latest = { base, sceneKey, onReady, figs };
  pending = true;
  if (scene) scene.showArt();
}

/* Chuyển cảnh chờ nền mới vẽ xong (raster + phân tích pháp tuyến + tải texture) rồi mới mở màn đen,
   để phần việc nặng chạy lúc màn còn đen chứ không đè lên hoạt ảnh mở ra. Có hạn chót để không treo. */
let pending = false;
let waiters = [];

function settle() {
  pending = false;
  waiters.splice(0).forEach((f) => f());
}

export function whenArtReady(maxMs = 2500) {
  if (!pending || !game) return Promise.resolve();
  return new Promise((res) => {
    const t = setTimeout(res, maxMs);
    waiters.push(() => {
      clearTimeout(t);
      res();
    });
  });
}

// Đèn chập chờn một lúc: dùng cho diễn biến và chuyển cảnh
export function flicker(strength) {
  if (scene && scene.lighting) scene.lighting.flicker(strength);
}

/* Tạm dừng vòng lặp vẽ khi một hộp thoại hay sổ tay che gần hết màn hình (chỉ chế độ nhẹ): đèn thật, bụi và mưa phía sau
   không ai thấy mà vẫn ngốn GPU, làm hộp thoại cuộn giật. Ngủ chậm một nhịp để canvas kịp có hình trước khi dừng. */
let paused = false;
let sleepTimer = 0;

function wakeLoop() {
  clearTimeout(sleepTimer);
  if (game && !game.loop.running) game.loop.wake(true);
}

function sleepSoon(ms) {
  clearTimeout(sleepTimer);
  sleepTimer = setTimeout(() => {
    if (paused && game) game.loop.sleep();
  }, ms);
}

export function setPaused(p) {
  if (!LITE || !game || p === paused) return;
  paused = p;
  if (p) sleepSoon(450);
  else wakeLoop();
}

// Đang ngủ mà nền mới vẽ xong hoặc khung đổi cỡ (canvas bị xóa): cho chạy ngắn để canvas có hình rồi ngủ lại
function refreshWhilePaused() {
  if (!paused || !game) return;
  wakeLoop();
  sleepSoon(450);
}

export function setView(v) {
  view = v;
  if (paused) refreshWhilePaused();
  if (!scene || !latest || !rasterQ) return;
  // Đổi cỡ màn hình nhiều: vẽ lại nền ở độ phân giải mới, gộp các lần kéo liên tiếp
  if (Math.abs(quality() - rasterQ) / rasterQ > 0.3) {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => scene && scene.showArt(), 250);
  }
}

function quality() {
  // Canvas của Phaser vốn 1×, nên điện thoại không cần raster dày hơn một texel mỗi điểm màn hình (đỡ bộ nhớ GPU, phân tích pháp tuyến nhanh hơn)
  const dpr = LITE ? 1 : Math.min(window.devicePixelRatio || 1, 2);
  const s = view ? view.scale : 1;
  return Math.min(LITE ? 1.2 : 1.7, Math.max(LITE ? 0.6 : 1, s * dpr));
}

// Hình chữ nhật nơi nền được vẽ trên màn hình, đã tính parallax và phóng nhẹ
function artBox(cur) {
  const pw = view.worldW * view.scale, ph = WORLD_H * view.scale;
  return {
    x: -view.x - ((ART_ZOOM - 1) * pw) / 2 + ART_PARALLAX.x * cur.px,
    y: view.top - ((ART_ZOOM - 1) * ph) / 2 + ART_PARALLAX.y * cur.py,
    w: pw * ART_ZOOM,
    h: ph * ART_ZOOM
  };
}

// Đặt kích thước để SVG raster đúng tỉ lệ khung thế giới
function sized(svg, W, H) {
  return svg.replace(/<svg\b/, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"`);
}

function rasterize(svg, W, H) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      c.getContext("2d").drawImage(img, 0, 0, W, H);
      URL.revokeObjectURL(url);
      resolve(c);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("SVG không tải được thành ảnh"));
    };
    img.src = url;
  });
}

class WorldScene extends Phaser.Scene {
  constructor() {
    super("world");
  }

  create() {
    scene = this;
    this.art = null;
    const glOn = this.sys.game.renderer.type === Phaser.WEBGL;
    this.lighting = createLighting(this, glOn);
    document.getElementById("scene").classList.toggle("gl-lit", this.lighting.lit); // CSS bớt lớp đèn pin giả khi đã có đèn thật
    this.actors = createActors(this, this.lighting.lit);
    this.ambience = createAmbience(this, this.lighting.lit);
    if (latest) this.showArt();
  }

  update(t, delta) {
    if (!view || !this.ambience) return;
    const cur = cursorState();
    const box = artBox(cur);
    if (this.art) {
      this.art.setPosition(box.x, box.y);
      this.art.setDisplaySize(box.w, box.h);
    }
    const env = {
      cur,
      W: this.scale.width,
      H: this.scale.height,
      toScreen: (wx, wy) => [box.x + (wx * box.w) / view.worldW, box.y + (wy * box.h) / WORLD_H],
      unit: box.w / view.worldW
    };
    const dt = Math.min(delta, 50) / 1000;
    this.lighting.update(dt, t, env);
    this.actors.update(dt, t, env);
    this.ambience.update(dt, t, env);
  }

  // Vẽ nền của yêu cầu gần nhất. Raster xong mới thay ảnh cũ, nên không bao giờ hiện nền dở dang
  showArt() {
    const job = latest;
    if (!job || !view) return;
    const id = ++token;
    const t0 = performance.now();
    const q = quality();
    const W = Math.round(view.worldW * q), H = Math.round(WORLD_H * q);
    rasterize(sized(job.base, W, H), W, H)
      .then(async (canvas) => {
        if (id !== token) return; // đã có yêu cầu mới hơn
        const key = `art-${id}`;
        const t1 = performance.now();
        const { normal, lamps, probe } = await analyze(canvas, view.worldW, WORLD_H, job.figs, () => id !== token);
        if (id !== token) return; // trong lúc phân tích đã có nền mới hơn
        this.textures.addImage(key, canvas, normal);
        if (this.art) this.art.setTexture(key);
        else this.art = this.add.image(0, 0, key).setOrigin(0, 0).setDepth(0);
        if (this.lighting.lit) this.art.setLighting(true);
        if (texKey) this.textures.remove(texKey);
        texKey = key;
        rasterQ = q;
        this.lamps = lamps;
        this.lighting.setScene(lamps);
        this.actors.setScene(job.figs, canvas, normal, view.worldW, probe);
        this.ambience.setScene(job.sceneKey);
        if (import.meta.env && import.meta.env.DEV) {
          console.debug(`[nền] ${job.sceneKey}: raster ${Math.round(t1 - t0)} ms, phân tích + dựng ${Math.round(performance.now() - t1)} ms, ${W}×${H}`);
        }
        refreshWhilePaused();
        if (job.onReady) job.onReady();
        settle();
      })
      .catch((err) => {
        if (!err.stale) console.warn("Không vẽ được nền cảnh.", err);
        if (id === token) settle();
      });
  }
}
