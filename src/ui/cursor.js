/* =====================================================================
   Đèn pin theo con trỏ và độ nghiêng nhẹ của cảnh.
   Chuột: đèn đi theo chuột, cảnh nghiêng theo hướng chuột. Chạm: đèn đi theo ngón tay,
   không làm cảnh nghiêng. Giá trị được làm mượt ở mỗi khung hình.
   Các lớp khác đọc trực tiếp qua cursorState(), hoặc đăng ký onLampMove() để được báo khi đèn đổi chỗ.
   ===================================================================== */
const REDUCED_MOTION = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const state = { x: 0, y: 0, gx: 0, gy: 0, px: 0, py: 0, nx: 0, ny: 0, raf: 0 };
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
  if (!state.raf) state.raf = requestAnimationFrame(ease);
}

function ease() {
  const k = REDUCED_MOTION ? 1 : 0.14; // đèn bám theo con trỏ
  const p = REDUCED_MOTION ? 1 : 0.08; // độ nghiêng chậm hơn để có cảm giác nặng
  const tx = REDUCED_MOTION ? 0 : state.nx;
  const ty = REDUCED_MOTION ? 0 : state.ny;
  state.x += (state.gx - state.x) * k;
  state.y += (state.gy - state.y) * k;
  state.px += (tx - state.px) * p;
  state.py += (ty - state.py) * p;
  host.style.setProperty("--lx", `${state.x.toFixed(1)}px`);
  host.style.setProperty("--ly", `${state.y.toFixed(1)}px`);
  host.style.setProperty("--px", state.px.toFixed(4));
  host.style.setProperty("--py", state.py.toFixed(4));
  notifyLamp();
  const settled =
    Math.abs(state.gx - state.x) < 0.3 && Math.abs(state.gy - state.y) < 0.3 &&
    Math.abs(tx - state.px) < 0.002 && Math.abs(ty - state.py) < 0.002;
  state.raf = settled ? 0 : requestAnimationFrame(ease);
}
