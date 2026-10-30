/* =====================================================================
   Sân khấu panorama: thế giới phủ kín màn hình (cover), camera kéo ngang
   bằng chuột, chạm, bánh xe, phím mũi tên hoặc nút ở mép màn hình.
   Nền cảnh do Phaser vẽ khi có (SVG trong DOM khi không); chữ, cửa và điểm
   điều tra nằm trong DOM của cùng một thế giới nên luôn khớp nhau.
   ===================================================================== */
import { WORLD_H, WORLD_W, OX, COMP_W } from "../world/layout.js";
import { $, setHTML } from "./dom.js";
import { mountCursor, notifyLamp } from "./cursor.js";
import * as gl from "../render/world.js";

const DEFAULT_CENTER = OX + COMP_W / 2; // tâm khung cảnh gốc, đơn vị thế giới
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const view = { x: 0, scale: 1, worldW: WORLD_W, center: DEFAULT_CENTER, maxX: 0, top: 0 };
let scene, world, artEl, doorsEl, hsEl;
let drag = null;
let dragged = false;
let artKey = null;

export function mountStage() {
  scene = $("scene");
  world = $("world");
  artEl = $("world-art");
  doorsEl = $("world-doors");
  hsEl = $("world-hs");

  gl.mount();
  mountCursor(scene);
  scene.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
  scene.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("resize", () => layout());
  layout();
}

// Đặt thế giới mới (rộng worldW đơn vị), canh camera vào điểm center
export function setWorld(worldW, center = DEFAULT_CENTER, reset = true) {
  view.worldW = worldW;
  view.center = center;
  layout();
  if (reset) resetCam(false);
}

// Nền cảnh: DOM giữ SVG đầy đủ cho đến khi Phaser vẽ xong nền, sau đó DOM chỉ còn lớp chữ
export function setArt(key, build, sceneKey) {
  if (artKey === key) return;
  artKey = key;
  const svg = build();
  if (!gl.active()) {
    artEl.innerHTML = svg;
    return;
  }
  const { base, overlay } = gl.splitArt(svg);
  artEl.innerHTML = svg;
  gl.setArt(base, sceneKey, () => {
    if (artKey === key) artEl.innerHTML = overlay;
  });
}

export function setDoors(html) {
  setHTML(doorsEl, html);
}

export function setHotspots(html) {
  setHTML(hsEl, html);
  notifyLamp(); // điểm mới vẽ có thể nằm trong vùng đèn pin
}

export function markScene(screen) {
  document.body.dataset.screen = screen;
}

// Phủ kín khung nhìn theo cả hai chiều; phần thừa bị cắt đều hai phía
function layout() {
  const vw = window.innerWidth, vh = window.innerHeight;
  view.scale = Math.max(vh / WORLD_H, vw / view.worldW);
  const pxW = view.worldW * view.scale, pxH = WORLD_H * view.scale;
  view.maxX = Math.max(0, pxW - vw);
  view.top = -(pxH - vh) / 2;
  world.style.width = `${pxW}px`;
  world.style.height = `${pxH}px`;
  world.style.top = `${view.top}px`;
  apply(false);
}

function resetCam(glide) {
  setX(view.center * view.scale - window.innerWidth / 2, glide);
}

function setX(x, glide) {
  view.x = clamp(x, 0, view.maxX);
  apply(glide);
}

function apply(glide) {
  world.style.transition = glide ? "transform .45s cubic-bezier(.2,.8,.2,1)" : "none";
  world.style.transform = `translate3d(${-view.x}px,0,0)`;
  // Nút mép màn hình chỉ hiện khi còn chỗ để cuộn theo hướng đó
  scene.dataset.canLeft = view.x > 1 ? "1" : "0";
  scene.dataset.canRight = view.x < view.maxX - 1 ? "1" : "0";
  gl.setView(view);
  notifyLamp(); // cảnh dịch chuyển thì vị trí các điểm so với đèn pin cũng đổi
}

export function pan(dir) {
  setX(view.x + dir * window.innerWidth * 0.6, true);
}

// Cho bộ điều khiển biết lần nhấn vừa rồi là kéo chứ không phải bấm
export function consumeDrag() {
  const was = dragged;
  dragged = false;
  return was;
}

function onDown(e) {
  dragged = false; // reset trước khi kiểm tra nút, để cú nhấn vào nút không bị coi là kéo
  if (e.button !== 0 || e.target.closest("button, a, input, label")) return;
  drag = { x: e.clientX, cam: view.x };
  scene.classList.add("dragging");
}

function onMove(e) {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  if (Math.abs(dx) > 6) dragged = true;
  if (dragged) setX(drag.cam - dx, false);
}

function onUp() {
  if (!drag) return;
  drag = null;
  scene.classList.remove("dragging");
}

function onWheel(e) {
  if (view.maxX <= 0) return;
  const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  e.preventDefault();
  setX(view.x + d, false);
}

// Phím mũi tên và Home/End: gọi từ bộ điều khiển chính khi không có hộp thoại
export function panKey(key) {
  if (key === "ArrowLeft") return pan(-1), true;
  if (key === "ArrowRight") return pan(1), true;
  if (key === "Home") return setX(0, true), true;
  if (key === "End") return setX(view.maxX, true), true;
  return false;
}
