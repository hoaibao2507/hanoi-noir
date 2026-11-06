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
let latest = null;  // {base, sceneKey, onReady, figs, key, overlay}: nền cảnh được yêu cầu gần nhất
let token = 0;      // mã yêu cầu vẽ; yêu cầu cũ hơn bị bỏ qua
let rasterQ = 0;    // độ phân giải đang dùng cho nền
let resizeTimer = 0;

/* Bộ nhớ đệm các cảnh đã dựng: raster SVG + phân tích pháp tuyến/nguồn sáng + tải texture là phần nặng nhất của việc đổi cảnh,
   mà quay lại một địa điểm vừa đi qua thì kết quả y hệt. Giữ vài cảnh gần nhất (theo số lượng và tổng số điểm ảnh, vì mỗi cảnh
   chiếm bộ nhớ CPU lẫn GPU); cảnh bị loại thì gỡ texture. Cảnh đang hiển thị không bao giờ bị gỡ.
   Một mục chỉ dùng lại được khi cùng bề rộng thế giới và độ phân giải không lệch quá 30% (xoay màn hình, đổi cỡ cửa sổ thì dựng lại). */
const CACHE_MAX = 6;
const CACHE_PIXELS = 14e6;
const cache = new Map(); // key -> {key, texKey, canvas, normal, lamps, probe, overlay, figs, q, worldW, px, dead}
let current = null;      // mục đang hiển thị

const fits = (e, q) => !!e && !!view && e.worldW === view.worldW && Math.abs(q - e.q) / e.q <= 0.3;

function removeTexture(e) {
  if (scene && scene.textures.exists(e.texKey)) scene.textures.remove(e.texKey);
}

function discard(e) {
  e.dead = true;
  cache.delete(e.key);
  if (e !== current) removeTexture(e);
}

function remember(entry) {
  const old = cache.get(entry.key);
  if (old && old !== entry) discard(old);
  cache.delete(entry.key); // đặt lại để nằm cuối: mới dùng gần nhất
  cache.set(entry.key, entry);
  let px = 0;
  for (const e of cache.values()) px += e.px;
  for (const e of [...cache.values()]) { // từ cũ nhất tới mới nhất
    if (cache.size <= 1 || (cache.size <= CACHE_MAX && px <= CACHE_PIXELS)) break;
    if (e === entry || e === current) continue;
    px -= e.px;
    discard(e);
  }
}

// stage.js hỏi trước khi sinh SVG: cảnh này còn trong bộ nhớ đệm thì khỏi dựng lại gì cả
export function cachedArt(key) {
  if (!scene || !view || !key) return false;
  const e = cache.get(key);
  return fits(e, quality()) && scene.textures.exists(e.texKey);
}

/* Dựng sẵn các cảnh kế tiếp lúc rảnh: người chơi đứng trong một địa điểm (đọc hồ sơ, nhìn quanh) thì máy dựng ngầm từng địa điểm
   còn lại vào bộ nhớ đệm, mỗi lần một cảnh, nên lúc bấm cửa cảnh đích thường đã có sẵn (vài ms thay vì ~0,5 s dưới màn đen).
   Nhường người chơi: chỉ chạy khi cảnh hiện tại đã lên ít nhất 1,2 s (hoạt ảnh vào cảnh đã xong), màn chuyển cảnh không đang che,
   trang không bị ẩn; phân tích dùng lát ngắn (3 ms) và nghỉ giữa các lát; có cảnh thật cần dựng thì bỏ dở ngay (prefetchGen).
   Không bao giờ loại một cảnh khác khỏi đệm chỉ để dựng sẵn: hết số lượng hoặc hết ngân sách điểm ảnh thì dừng. */
let prefetchGen = 0;
let pq = [];        // hàng đợi {key, sceneKey, build}
let pqGen = 0;      // prefetchGen lúc xếp hàng; lệch nghĩa là hàng đợi đã cũ
let pfBusy = false;
let readyAt = 0;    // lúc cảnh hiện tại lên xong
let texSeq = 0;
const PREFETCH_AFTER_MS = 1200;
const QUIET_MS = 800;   // không có thao tác nào trong chừng này thì mới dựng ngầm
let lastInputAt = 0;

const whenIdle = (fn) => (typeof requestIdleCallback === "function" ? requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 250));

export function prefetchArt(items) {
  if (!scene || !view) return;
  const q = quality();
  pq = items.filter((it) => !fits(cache.get(it.key), q));
  pqGen = prefetchGen;
  pumpPrefetch(PREFETCH_AFTER_MS);
}

function pumpPrefetch(delay) {
  if (pfBusy || !pq.length) return;
  pfBusy = true;
  setTimeout(() => whenIdle(async () => {
    let next = 300;
    try {
      if ((await prefetchOne()) === "wait") next = 1000;
    } catch (err) {
      if (!err.stale) console.warn("Không dựng sẵn được cảnh.", err);
    } finally {
      pfBusy = false;
      pumpPrefetch(next);
    }
  }), delay);
}

async function prefetchOne() {
  if (pqGen !== prefetchGen) { // đã có cảnh thật được yêu cầu sau lần xếp hàng này
    pq = [];
    return;
  }
  const veilOn = document.getElementById("curtain")?.classList.contains("on");
  const now = performance.now();
  // Một vài bước (giải mã SVG, đọc ngược pixel từ GPU) không chia lát được: chỉ làm khi tay người chơi không đang trên màn hình
  if (!scene || !view || pending || veilOn || document.hidden || now - readyAt < PREFETCH_AFTER_MS || now - lastInputAt < QUIET_MS) return "wait";
  const item = pq.shift();
  const q = quality();
  if (fits(cache.get(item.key), q)) return;
  const px = Math.round(view.worldW * q) * Math.round(WORLD_H * q);
  let used = 0;
  for (const e of cache.values()) used += e.px;
  if (cache.size >= CACHE_MAX || used + px > CACHE_PIXELS) { // đệm đầy: dựng thêm chỉ làm cảnh khác bị loại
    pq = [];
    return;
  }
  const gen = prefetchGen, stale = () => gen !== prefetchGen;
  const { base, overlay, figs } = splitArt(item.build());
  const entry = await scene.buildEntry({ base, overlay, figs, key: item.key, sceneKey: item.sceneKey }, q, stale, { slice: 3, rest: 8 });
  if (!entry) return;
  if (stale()) { // trong lúc đó có cảnh thật được yêu cầu: bỏ kết quả, gỡ texture vừa đăng ký
    if (scene.textures.exists(entry.texKey)) scene.textures.remove(entry.texKey);
    return;
  }
  remember(entry);
}

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
  for (const type of ["pointerdown", "pointermove", "wheel", "keydown", "touchmove"]) {
    window.addEventListener(type, () => { lastInputAt = performance.now(); }, { passive: true, capture: true });
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

// base: SVG nền (null nếu cảnh nằm trong bộ nhớ đệm, xem cachedArt); key: khóa bộ nhớ đệm; overlay: lớp chữ để DOM giữ lại
// onReady(overlay) chạy khi nền đã hiện trên Phaser
export function setArt(base, sceneKey, onReady, figs = [], key = null, overlay = "") {
  if (!game) return;
  latest = { base, sceneKey, onReady, figs, key, overlay };
  pending = true;
  if (scene) scene.showArt();
}

/* Chuyển cảnh chờ nền mới vẽ xong (raster + phân tích pháp tuyến + tải texture) rồi mới mở màn đen,
   để phần việc nặng chạy lúc màn còn đen chứ không đè lên hoạt ảnh mở ra. Có hạn chót để không treo. */
let pending = false;
let waiters = [];

function settle() {
  pending = false;
  readyAt = performance.now();
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
let paused = false; // hộp thoại hoặc sổ tay đang che màn hình
let held = false;   // màn chuyển cảnh đang đen kín: đừng vẽ gì phía sau, nhường luồng chính cho việc dựng nền mới
let sleepTimer = 0;
const idle = () => paused || held;

function wakeLoop() {
  clearTimeout(sleepTimer);
  if (game && !game.loop.running) game.loop.wake(true);
}

function sleepSoon(ms) {
  clearTimeout(sleepTimer);
  sleepTimer = setTimeout(() => {
    if (idle() && game) game.loop.sleep();
  }, ms);
}

function syncLoop(ms) {
  if (idle()) sleepSoon(ms);
  else wakeLoop();
}

export function setPaused(p) {
  if (!LITE || !game || p === paused) return;
  paused = p;
  syncLoop(450);
}

// Lúc màn chuyển cảnh đã đen kín, vòng lặp Phaser vẫn vẽ ánh sáng từng khung hình dù không ai thấy, giành luồng chính với việc dựng nền mới.
// veil() ngủ nó trong lúc đổi cảnh và đánh thức ngay khi nền mới sẵn sàng, trước khi màn mở ra
export function holdLoop(h) {
  if (!LITE || !game || h === held) return;
  held = h;
  syncLoop(60);
}

// Đang ngủ mà nền mới vẽ xong hoặc khung đổi cỡ (canvas bị xóa): cho chạy ngắn để canvas có hình rồi ngủ lại
function refreshWhilePaused() {
  if (!idle() || !game) return;
  wakeLoop();
  sleepSoon(450);
}

export function setView(v) {
  view = v;
  if (idle()) refreshWhilePaused();
  if (!scene || !latest || !rasterQ) return;
  // Đổi cỡ màn hình nhiều: vẽ lại nền ở độ phân giải mới, gộp các lần kéo liên tiếp
  if (Math.abs(quality() - rasterQ) / rasterQ > 0.3) {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => scene && scene.showArt(true), 250);
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
  // force: đổi cỡ màn hình nhiều nên dựng lại dù cảnh đang nằm trong bộ nhớ đệm
  showArt(force = false) {
    const job = latest;
    if (!job || !view) return;
    const id = ++token;
    prefetchGen++; // yêu cầu thật được ưu tiên: bỏ dở việc dựng sẵn đang chạy (stage/app sẽ xếp lại sau khi cảnh này lên)
    const t0 = performance.now();
    const q = quality();
    for (const e of [...cache.values()]) if (!fits(e, q)) discard(e); // lệch độ phân giải: không dùng lại được nữa

    const hit = !force && job.key && cache.get(job.key);
    if (hit && this.textures.exists(hit.texKey)) {
      cache.delete(hit.key); // mới dùng gần nhất
      cache.set(hit.key, hit);
      this.present(hit, job);
      if (import.meta.env && import.meta.env.DEV) console.debug(`[nền] ${job.sceneKey}: lấy từ bộ nhớ đệm, ${Math.round(performance.now() - t0)} ms`);
      return;
    }
    if (!job.base) { // không còn bản đệm mà cũng không có SVG để dựng (không xảy ra nếu stage.js hỏi cachedArt ngay trước đó)
      settle();
      return;
    }

    this.buildEntry(job, q, () => id !== token)
      .then((entry) => {
        if (!entry) return; // đã có yêu cầu mới hơn
        remember(entry);
        this.present(entry, job);
      })
      .catch((err) => {
        if (!err.stale) console.warn("Không vẽ được nền cảnh.", err);
        if (id === token) settle();
      });
  }

  // Dựng một cảnh thành mục đệm: raster SVG, phân tích pháp tuyến + nguồn sáng, đăng ký texture.
  // Trả null nếu stale() báo đã có yêu cầu mới hơn; analyze ném lỗi có cờ `stale` nếu bị hủy giữa chừng.
  // opts.slice/rest: nhịp nhường luồng của phân tích (dựng ngầm dùng lát ngắn, nghỉ dài)
  async buildEntry(job, q, stale, opts = {}) {
    const worldW = view.worldW;
    const W = Math.round(worldW * q), H = Math.round(WORLD_H * q);
    const t0 = performance.now();
    const canvas = await rasterize(sized(job.base, W, H), W, H);
    if (stale()) return null;
    const t1 = performance.now();
    // Chế độ nhẹ: màn hình nhỏ nên bản đồ pháp tuyến hẹp hơn (640 thay vì 960 điểm ngang) vẫn đủ nét, mà ít hơn ~2,2 lần điểm ảnh phải tính
    const { normal, lamps, probe } = await analyze(canvas, worldW, WORLD_H, job.figs, stale, { normalW: LITE ? 640 : 960, ...opts });
    if (stale()) return null;
    const t2 = performance.now();
    const texKey = `art-${++texSeq}`;
    this.textures.addImage(texKey, canvas, normal);
    if (import.meta.env && import.meta.env.DEV) {
      console.debug(`[nền] ${job.sceneKey}${opts.rest ? " (dựng sẵn)" : ""}: raster ${Math.round(t1 - t0)} ms, phân tích ${Math.round(t2 - t1)} ms, dựng ${Math.round(performance.now() - t2)} ms, ${W}×${H}`);
    }
    return { key: job.key || texKey, texKey, canvas, normal, lamps, probe, overlay: job.overlay, figs: job.figs, q, worldW, px: W * H, dead: false };
  }

  // Đưa một cảnh đã dựng (mới dựng hoặc lấy từ bộ nhớ đệm) lên màn hình
  present(entry, job) {
    if (this.art) this.art.setTexture(entry.texKey);
    else this.art = this.add.image(0, 0, entry.texKey).setOrigin(0, 0).setDepth(0);
    if (this.lighting.lit) this.art.setLighting(true);
    const prev = current;
    current = entry;
    if (prev && prev !== entry && prev.dead) removeTexture(prev); // mục cũ đã bị loại khỏi đệm nhưng đang hiển thị tới giờ
    rasterQ = entry.q;
    this.lamps = entry.lamps;
    this.lighting.setScene(entry.lamps);
    this.actors.setScene(entry.figs, entry.canvas, entry.normal, entry.worldW, entry.probe);
    this.ambience.setScene(job.sceneKey);
    refreshWhilePaused();
    if (job.onReady) job.onReady(entry.overlay);
    settle();
  }
}
