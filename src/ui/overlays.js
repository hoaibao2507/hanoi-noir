/* Lớp phủ: chuyển cảnh, thông báo và hộp thoại kiểu hồ sơ giấy. */
import gsap from "gsap";
import { $, icons } from "./dom.js";

const REDUCED = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const HAS_GSAP = typeof gsap !== "undefined";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const dur = (s) => (REDUCED ? 0 : s);

// Hoạt ảnh một phần tử: GSAP nếu có, nếu không thì dùng CSS transition
function anim(el, to, seconds) {
  return new Promise((res) => {
    if (!HAS_GSAP || seconds <= 0) {
      el.style.transition = seconds > 0 ? `opacity ${seconds}s ease, transform ${seconds}s ease` : "none";
      if (to.opacity !== undefined) el.style.opacity = to.opacity;
      if (to.y !== undefined) el.style.transform = `translateY(${to.y}px)`;
      setTimeout(res, seconds * 1000);
      return;
    }
    gsap.to(el, { ...to, duration: seconds, ease: "power2.out", onComplete: res });
  });
}

// Màn đen hiện tên địa điểm, đổi cảnh ở giữa, rồi mở lại
export async function veil(kicker, title, sub, swap) {
  const cur = $("curtain"), card = $("card");
  card.querySelector(".k").textContent = kicker;
  card.querySelector(".t").textContent = title;
  card.querySelector(".s").textContent = sub;
  cur.classList.add("on");
  await anim(cur, { opacity: 1 }, dur(0.35));
  await anim(card, { opacity: 1, y: 0 }, dur(0.4));
  await wait(REDUCED ? 120 : 650);
  if (swap) swap();
  await anim(card, { opacity: 0, y: -6 }, dur(0.25));
  await anim(cur, { opacity: 0 }, dur(0.4));
  cur.classList.remove("on");
}

let toastTimer = null;
export function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

export function sheetOpen() {
  return !$("modal").classList.contains("hidden");
}

export function showSheet(html) {
  $("toast").classList.remove("show");
  const m = $("modal");
  m.innerHTML = `<div class="sheet">${html}</div>`;
  icons(m);
  m.classList.remove("hidden");
  const b = m.querySelector("button");
  if (b) b.focus();
}

export function closeSheet() {
  const m = $("modal");
  m.classList.add("hidden");
  m.innerHTML = "";
}

// Hiệu ứng xuất hiện của điểm điều tra và cửa khi vào cảnh hoặc đổi địa điểm
export function animateEntrance() {
  if (!HAS_GSAP || REDUCED) return;
  // Dấu vết ẩn không tham gia hiệu ứng này: độ mờ của nó do đèn pin điều khiển
  gsap.from("#world-hs .hs:not(.is-secret)", { scale: 0, opacity: 0, stagger: 0.07, duration: 0.4, ease: "back.out(2)" });
  gsap.from("#world-doors .door", { opacity: 0, y: 14, stagger: 0.08, duration: 0.5, ease: "power2.out" });
}

// Nháy sáng một điểm điều tra vừa làm xong
export function flashHotspot(id) {
  const el = document.querySelector(`[data-id="${id}"].hs`);
  if (el && HAS_GSAP && !REDUCED) {
    gsap.fromTo(el, { scale: 0.5, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(3)" });
  }
}

// Gợn sáng khi bấm một điểm điều tra. Gắn vào thân trang để vẫn thấy dù cảnh được vẽ lại ngay sau đó
export function ripple(el) {
  if (!HAS_GSAP || REDUCED) return;
  const b = el.getBoundingClientRect(); // điểm neo nằm giữa thẻ điều tra
  const r = document.createElement("span");
  r.className = "ripple";
  r.style.left = `${b.left}px`;
  r.style.top = `${b.top}px`;
  document.body.appendChild(r);
  gsap.fromTo(
    r,
    { scale: 0.5, opacity: 0.9 },
    { scale: 2.6, opacity: 0, duration: 0.7, ease: "power2.out", onComplete: () => r.remove() }
  );
}

// Hiệu ứng xuất hiện của menu
export function animateMenu() {
  if (HAS_GSAP && !REDUCED) gsap.from("#menu-cards", { opacity: 0, y: 24, duration: 0.6, ease: "power2.out" });
}
