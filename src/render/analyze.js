/* =====================================================================
   Phân tích nền cảnh đã raster để dựng ánh sáng thật: bản đồ pháp tuyến giả (lấy từ độ sáng,
   để đèn pin làm nổi vân gỗ, nếp tường, gờ đồ vật) và vị trí các nguồn sáng (đèn lồng, nến, cửa sổ).
   Không có DOM ngoài canvas, nên tính một lần khi nền được vẽ.
   Việc tính được chia thành các lát ngắn (SLICE_MS) và nhường luồng chính giữa các lát, nên đổi cảnh không làm
   khung hình khựng: trước đây một lần phân tích chiếm khoảng 150 ms liền.
   ===================================================================== */

const NORMAL_W = 960;  // bề rộng bản đồ pháp tuyến; Phaser nội suy khi vẽ, nên không cần bằng ảnh gốc
const GRID_W = 120;    // lưới dò nguồn sáng
const BUMP = 1.1;      // độ gồ ghề của bản đồ pháp tuyến: vừa đủ để vân gỗ nổi lên, không viền nổi quanh mọi vật
const MAX_LAMPS = 6;
const SLICE_MS = 6;    // mỗi lát tính tối đa bấy nhiêu ms rồi nhường luồng chính

// Nhường luồng chính: scheduler.yield nếu có, không thì MessageChannel (không bị trễ tối thiểu 4 ms như setTimeout)
const yieldToMain = () =>
  globalThis.scheduler && globalThis.scheduler.yield
    ? globalThis.scheduler.yield()
    : new Promise((resolve) => {
        const c = new MessageChannel();
        c.port1.onmessage = () => resolve();
        c.port2.postMessage(0);
      });

// Người điều độ: gọi `await tick()` ở cuối mỗi hàng điểm ảnh; hết lát thì nhường luồng. Nền bị thay giữa chừng (stale()) thì bỏ dở
function pacer(stale) {
  let t = performance.now();
  return async () => {
    if (performance.now() - t < SLICE_MS) return;
    await yieldToMain();
    if (stale()) throw Object.assign(new Error("Nền đã bị thay"), { stale: true });
    t = performance.now();
  };
}

const make = (w, h) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};

// Thu nhỏ canvas về bề rộng w, giữ tỉ lệ
function shrink(src, w) {
  const h = Math.max(1, Math.round((src.height * w) / src.width));
  const c = make(w, h);
  const g = c.getContext("2d", { willReadFrequently: true });
  g.imageSmoothingQuality = "high";
  g.drawImage(src, 0, 0, w, h);
  return { canvas: c, ctx: g, w, h };
}

// Độ sáng 0..1 của từng điểm ảnh
function luminance(data, n) {
  const L = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    L[i] = (0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2]) / 255;
  }
  return L;
}

// Làm mờ nhẹ (hộp 3 × 3, hai lượt) để mép cứng của hình vẽ không thành viền nổi gắt
async function soften(L, w, h, tick) {
  let src = L;
  for (let pass = 0; pass < 2; pass++) {
    const out = new Float32Array(src.length);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sum = 0;
        for (let j = -1; j <= 1; j++) {
          for (let i = -1; i <= 1; i++) sum += src[Math.min(h - 1, Math.max(0, y + j)) * w + Math.min(w - 1, Math.max(0, x + i))];
        }
        out[y * w + x] = sum / 9;
      }
      await tick();
    }
    src = out;
  }
  return src;
}

// Bản đồ pháp tuyến từ độ sáng (Sobel). Vùng phẳng cho (128,128,255): ánh sáng chiếu thẳng
async function normalMap(L, w, h, tick) {
  const out = make(w, h);
  const g = out.getContext("2d");
  const img = g.createImageData(w, h);
  const at = (x, y) => L[Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const gx = at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1);
      const gy = at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1);
      const nx = -gx * BUMP, ny = gy * BUMP, nz = 1;
      const len = Math.hypot(nx, ny, nz);
      const o = (y * w + x) * 4;
      img.data[o] = (nx / len * 0.5 + 0.5) * 255;
      img.data[o + 1] = (ny / len * 0.5 + 0.5) * 255;
      img.data[o + 2] = (nz / len * 0.5 + 0.5) * 255;
      img.data[o + 3] = 255;
    }
    await tick();
  }
  g.putImageData(img, 0, 0);
  return out;
}

// Nguồn sáng: điểm sáng và ấm hơn hẳn vùng xung quanh (đèn, nến, ô cửa), không phải mảng tường sáng rộng
async function findLamps(src, worldW, worldH, figs, tick) {
  const s = shrink(src, GRID_W); // src đã là bản thu nhỏ, nên bước này rất rẻ
  const { data } = s.ctx.getImageData(0, 0, s.w, s.h);
  const n = s.w * s.h;
  const L = luminance(data, n);
  // Trung bình cục bộ 11 × 11 để tách điểm sáng khỏi nền
  const R = 5, local = new Float32Array(n);
  for (let y = 0; y < s.h; y++) {
    for (let x = 0; x < s.w; x++) {
      let sum = 0, cnt = 0;
      for (let j = Math.max(0, y - R); j <= Math.min(s.h - 1, y + R); j++) {
        for (let i = Math.max(0, x - R); i <= Math.min(s.w - 1, x + R); i++) { sum += L[j * s.w + i]; cnt++; }
      }
      local[y * s.w + x] = sum / cnt;
    }
    await tick();
  }
  const cells = [];
  for (let i = 0; i < n; i++) {
    const blob = L[i] - local[i];
    const warm = (data[i * 4] - data[i * 4 + 2]) / 255;
    if (blob < 0.16 || L[i] < 0.6) continue;
    // Mặt người cũng sáng và ấm: loại các ô nằm trong khung nhân vật
    const wx = (((i % s.w) + 0.5) / s.w) * worldW, wy = ((((i / s.w) | 0) + 0.5) / s.h) * worldH;
    if (figs.some((f) => Math.abs(wx - f.x) < f.hw * 1.8 && wy > f.top - 30 && wy < f.bot + 10)) continue;
    cells.push({ i, score: blob * (0.6 + Math.max(0, warm)) });
  }
  cells.sort((a, b) => b.score - a.score);
  const lamps = [];
  const sep = s.w * 0.07; // hai nguồn không gần nhau hơn 7% bề rộng thế giới
  for (const c of cells) {
    const x = c.i % s.w, y = (c.i / s.w) | 0;
    if (lamps.some((l) => Math.hypot(l.cx - x, l.cy - y) < sep)) continue;
    lamps.push({ cx: x, cy: y, score: c.score, warm: (data[c.i * 4] - data[c.i * 4 + 2]) / 255 });
    if (lamps.length >= MAX_LAMPS) break;
  }
  const top = lamps.length ? lamps[0].score : 1;
  return lamps.map((l) => ({
    x: ((l.cx + 0.5) / s.w) * worldW,
    y: ((l.cy + 0.5) / s.h) * worldH,
    k: Math.min(1, l.score / top),
    warm: Math.max(0, Math.min(1, l.warm * 2.5)) // 0: sáng trắng lạnh, 1: ánh lửa
  }));
}

// Trả về { normal: canvas pháp tuyến, lamps: [{x, y, k, warm}] theo đơn vị thế giới,
// probe(wx, wy): màu [r, g, b] của nền tại một điểm thế giới }. Mọi thứ đọc từ bản thu nhỏ, không đọc ngược cả ảnh gốc từ GPU.
// stale() báo nền này đã bị thay bằng nền khác: phân tích bỏ dở và ném lỗi có cờ `stale`
export async function analyze(art, worldW, worldH, figs = [], stale = () => false) {
  const tick = pacer(stale);
  const s = shrink(art, Math.min(NORMAL_W, art.width));
  const { data } = s.ctx.getImageData(0, 0, s.w, s.h);
  const normal = await normalMap(await soften(luminance(data, s.w * s.h), s.w, s.h, tick), s.w, s.h, tick);
  const probe = (wx, wy) => {
    const x = Math.min(s.w - 1, Math.max(0, Math.round((wx / worldW) * s.w)));
    const y = Math.min(s.h - 1, Math.max(0, Math.round((wy / worldH) * s.h)));
    const o = (y * s.w + x) * 4;
    return [data[o], data[o + 1], data[o + 2]];
  };
  return { normal, lamps: await findLamps(s.canvas, worldW, worldH, figs, tick), probe };
}

// Cắt một mảnh của nền và của bản đồ pháp tuyến (toạ độ 0..1 của cả khung). Viền rộng mx, my (tỉ lệ của mảnh)
// mờ dần về trong suốt, nên khi mảnh dịch vài điểm ảnh vẫn không lộ đường nối với nền bên dưới
export function cropPatch(art, normal, fx, fy, fw, fh, mx, my) {
  const sx = Math.round(fx * art.width), sy = Math.round(fy * art.height);
  const sw = Math.max(8, Math.round(fw * art.width)), sh = Math.max(8, Math.round(fh * art.height));
  const tex = make(sw, sh), nor = make(sw, sh);
  tex.getContext("2d").drawImage(art, sx, sy, sw, sh, 0, 0, sw, sh);
  nor.getContext("2d").drawImage(normal, fx * normal.width, fy * normal.height, fw * normal.width, fh * normal.height, 0, 0, sw, sh);
  const g = tex.getContext("2d");
  g.globalCompositeOperation = "destination-in";
  for (const [vertical, m] of [[false, mx], [true, my]]) {
    const grad = vertical ? g.createLinearGradient(0, 0, 0, sh) : g.createLinearGradient(0, 0, sw, 0);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(m, "rgba(0,0,0,1)");
    grad.addColorStop(1 - m, "rgba(0,0,0,1)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, sw, sh);
  }
  return { tex, nor, sx, sy, sw, sh };
}
