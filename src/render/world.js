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
import { OX, WORLD_H } from "../world/layout.js";

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
      backgroundColor: "#0c0907",
      banner: false,
      audio: { noAudio: true },
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      scale: { mode: Phaser.Scale.RESIZE },
      scene: [WorldScene]
    });
  } catch (err) {
    console.warn("Phaser không khởi động được, dùng SVG trong DOM.", err);
    game = null;
  }
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
  return { base, overlay };
}

export function setArt(base, sceneKey, onReady) {
  if (!game) return;
  latest = { base, sceneKey, onReady };
  if (scene) scene.showArt();
}

export function setView(v) {
  view = v;
  if (!scene || !latest || !rasterQ) return;
  // Đổi cỡ màn hình nhiều: vẽ lại nền ở độ phân giải mới, gộp các lần kéo liên tiếp
  if (Math.abs(quality() - rasterQ) / rasterQ > 0.3) {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => scene && scene.showArt(), 250);
  }
}

function quality() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const s = view ? view.scale : 1;
  return Math.min(1.7, Math.max(1, s * dpr));
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
    this.ambience = createAmbience(this);
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
    this.ambience.update(Math.min(delta, 50) / 1000, t, {
      cur,
      W: this.scale.width,
      H: this.scale.height,
      toScreen: (wx, wy) => [box.x + (wx * box.w) / view.worldW, box.y + (wy * box.h) / WORLD_H],
      unit: box.w / view.worldW
    });
  }

  // Vẽ nền của yêu cầu gần nhất. Raster xong mới thay ảnh cũ, nên không bao giờ hiện nền dở dang
  showArt() {
    const job = latest;
    if (!job || !view) return;
    const id = ++token;
    const q = quality();
    const W = Math.round(view.worldW * q), H = Math.round(WORLD_H * q);
    rasterize(sized(job.base, W, H), W, H)
      .then((canvas) => {
        if (id !== token) return; // đã có yêu cầu mới hơn
        const key = `art-${id}`;
        this.textures.addCanvas(key, canvas);
        if (this.art) this.art.setTexture(key);
        else this.art = this.add.image(0, 0, key).setOrigin(0, 0).setDepth(0);
        if (texKey) this.textures.remove(texKey);
        texKey = key;
        rasterQ = q;
        this.ambience.setScene(job.sceneKey);
        if (job.onReady) job.onReady();
      })
      .catch((err) => console.warn("Không vẽ được nền cảnh.", err));
  }
}
