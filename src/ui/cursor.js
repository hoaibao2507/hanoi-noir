/* =====================================================================
   Đèn pin theo con trỏ và độ nghiêng nhẹ của cảnh.
   Chuột: đèn đi theo chuột, cảnh nghiêng theo hướng chuột. Chạm: đèn đi theo ngón tay,
   không làm cảnh nghiêng. Giá trị được làm mượt ở mỗi khung hình.
   Các lớp khác đọc trực tiếp qua cursorState(), hoặc đăng ký onLampMove() để được báo khi đèn đổi chỗ.
   ===================================================================== */
const REDUCED_MOTION = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const state = { x: 0, y: 0, gx: 0, gy: 0, px: 0, py: 0, nx: 0, ny: 0, raf: 0 };
let lastT = 0;
const listeners = [];
let host = null;

// x, y: vị trí đèn pin (px màn hình). px, py: độ nghiêng trong khoảng -1..1
export function cursorState() {
  return state;
}

// Gọi fn(state) mỗi khi đèn đổi chỗ, hoặc khi cảnh được báo là đã dịch chuyển
export function onLampMove(fn) {
  listeners.push(fn);
}

export function notifyLamp() {
  for (const fn of listeners) fn(state);
}

export function mountCursor(scene) {
  host = scene;
  state.x = state.gx = window.innerWidth / 2;
  state.y = state.gy = window.innerHeight * 0.45;
  window.addEventListener("pointermove", onHover, { passive: true });
  window.addEventListener("pointerdown", onHover, { passive: true });
}

function onHover(e) {
  state.gx = e.clientX;
  state.gy = e.clientY;
  if (e.pointerType === "mouse") {
    state.nx = (e.clientX / window.innerWidth) * 2 - 1;
    state.ny = (e.clientY / window.innerHeight) * 2 - 1;
  }
  if (!state.raf) {
    lastT = performance.now();
    state.raf = requestAnimationFrame(ease);
  }
}

const written = {};
function setVar(name, value) {
  if (written[name] === value) return;
  written[name] = value;
  host.style.setProperty(name, value);
}

function ease() {
  // Làm mượt theo THỜI GIAN thực chứ không theo số khung hình: hệ số dưới đây là của một khung 60 fps, đổi theo khoảng cách thời gian
  // thật giữa hai khung. Máy chậm (điện thoại yếu, runner CI vẽ bằng CPU chỉ vài fps) vẫn dừng đúng lúc, không kéo dài hàng chục giây
  const now = performance.now();
  const frames = Math.min(Math.max((now - lastT) / 16.667, 0), 60); // số khung 60 fps đã trôi qua (chặn trên để khỏi tràn)
  lastT = now;
  const k = REDUCED_MOTION ? 1 : 1 - Math.pow(1 - 0.14, frames); // đèn bám theo con trỏ
  const p = REDUCED_MOTION ? 1 : 1 - Math.pow(1 - 0.08, frames); // độ nghiêng chậm hơn để có cảm giác nặng
  const tx = REDUCED_MOTION ? 0 : state.nx;
  const ty = REDUCED_MOTION ? 0 : state.ny;
  state.x += (state.gx - state.x) * k;
  state.y += (state.gy - state.y) * k;
  state.px += (tx - state.px) * p;
  state.py += (ty - state.py) * p;
  // Biến CSS được kế thừa: mỗi lần ghi, trình duyệt tính lại style của cả cây (mọi điểm điều tra, cửa). Chỉ ghi khi giá trị đổi,
  // và bỏ --lx/--ly khi đã có đèn thật của Phaser (lớp CSS đó không còn dùng chúng)
  if (!host.classList.contains("gl-lit")) {
    setVar("--lx", `${state.x.toFixed(1)}px`);
    setVar("--ly", `${state.y.toFixed(1)}px`);
  }
  setVar("--px", state.px.toFixed(4));
  setVar("--py", state.py.toFixed(4));
  notifyLamp();
  const settled =
    Math.abs(state.gx - state.x) < 0.3 && Math.abs(state.gy - state.y) < 0.3 &&
    Math.abs(tx - state.px) < 0.002 && Math.abs(ty - state.py) < 0.002;
  state.raf = settled ? 0 : requestAnimationFrame(ease);
}
