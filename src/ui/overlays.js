/* Lớp phủ: chuyển cảnh điện ảnh, thông báo, lời khai cận cảnh và hộp thoại kiểu hồ sơ giấy. */
import gsap from "gsap";
import { $, icons } from "./dom.js";
import { flicker, setPaused } from "../render/world.js";

const REDUCED = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const HAS_GSAP = typeof gsap !== "undefined";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const dur = (s) => (REDUCED ? 0 : s);
const fancy = () => HAS_GSAP && !REDUCED;
const tween = (target, vars) => new Promise((res) => gsap.to(target, { ...vars, onComplete: res }));

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

/* ---------- Máy quay: đẩy vào, rung, hai thanh đen ---------- */

// Đẩy cảnh lại gần một điểm trên màn hình (người đang nói, cánh cửa sắp bước qua)
export function pushIn(x, y, scale = 1.06, seconds = 0.9) {
  if (!fancy()) return;
  gsap.to($("scene"), { scale, transformOrigin: `${x}px ${y}px`, duration: seconds, ease: "power2.out", overwrite: "auto" });
}

export function pushOut(seconds = 0.6) {
  if (!HAS_GSAP) return;
  gsap.to($("scene"), { scale: 1, duration: dur(seconds), ease: "power2.inOut", overwrite: "auto", clearProps: "transform,transformOrigin" });
}

// Rung nhẹ như có tiếng động mạnh
export function shake(power = 1) {
  if (!fancy()) return;
  const k = 7 * power;
  gsap.to($("scene"), {
    keyframes: [
      { x: -k, y: k * 0.4, duration: 0.05 }, { x: k * 0.9, y: -k * 0.5, duration: 0.06 },
      { x: -k * 0.6, y: k * 0.3, duration: 0.06 }, { x: k * 0.3, y: -k * 0.2, duration: 0.07 },
      { x: 0, y: 0, duration: 0.1 }
    ],
    overwrite: "auto"
  });
}

// Hai thanh đen kiểu phim màn ảnh rộng
export function bars(on, seconds = 0.45) {
  if (!HAS_GSAP) return Promise.resolve();
  const els = document.querySelectorAll("#bars i");
  return tween(els, { height: on ? "10.5vh" : "0vh", duration: dur(seconds), ease: on ? "power2.out" : "power2.inOut", overwrite: "auto" });
}

/* ---------- Chuyển cảnh ---------- */

// Mống mắt khép lại vào một điểm (cánh cửa vừa bước qua), hiện tên nơi đến, đổi cảnh rồi mở ra từ giữa màn hình
export async function veil(kicker, title, sub, swap, origin) {
  const cur = $("curtain"), card = $("card");
  hideTestimony();
  card.querySelector(".k").textContent = kicker;
  card.querySelector(".t").textContent = title;
  card.querySelector(".s").textContent = sub;
  cur.classList.add("on");

  if (!fancy()) {
    // Giảm chuyển động hoặc không có GSAP: màn đen mờ dần như trước
    cur.style.setProperty("--r", "-90px"); // âm: màu đen phủ kín, không còn lỗ mống mắt
    cur.style.opacity = "0";
    await anim(cur, { opacity: 1 }, dur(0.35));
    await anim(card, { opacity: 1, y: 0 }, dur(0.4));
    await wait(REDUCED ? 120 : 650);
    if (swap) swap();
    await anim(card, { opacity: 0, y: -6 }, dur(0.25));
    await anim(cur, { opacity: 0 }, dur(0.4));
    cur.classList.remove("on");
    return;
  }

  // Cửa nằm ngoài khung nhìn (đang xem phần khác của thế giới) thì mống mắt khép về mép màn hình gần nhất
  const o = origin
    ? { x: Math.min(innerWidth, Math.max(0, origin.x)), y: Math.min(innerHeight, Math.max(0, origin.y)) }
    : { x: innerWidth / 2, y: innerHeight / 2 };
  const R = Math.hypot(innerWidth, innerHeight) + 90; // đủ lớn để phủ cả màn hình kể cả mép mờ
  const iris = { r: R };
  const paint = () => cur.style.setProperty("--r", `${iris.r.toFixed(1)}px`);
  cur.style.opacity = "1";
  cur.style.setProperty("--cx", `${o.x}px`);
  cur.style.setProperty("--cy", `${o.y}px`);
  paint();

  flicker(0.8);
  bars(true, 0.4);
  pushIn(o.x, o.y, 1.09, 0.7);
  await tween(iris, { r: -90, duration: 0.65, ease: "power2.in", onUpdate: paint });

  // Màn đen hoàn toàn: đổi cảnh dưới màn, kèm dòng chữ tên nơi đến
  gsap.set(card, { opacity: 0, y: 8 });
  gsap.set(card.querySelector(".t"), { letterSpacing: "0.22em" });
  gsap.to(card, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" });
  gsap.to(card.querySelector(".t"), { letterSpacing: "0.02em", duration: 1.1, ease: "power2.out" });
  await wait(780);
  if (swap) swap();
  gsap.set($("scene"), { clearProps: "transform,transformOrigin" });
  await anim(card, { opacity: 0, y: -6 }, 0.25);

  // Mở ra từ giữa màn hình, đèn chập chờn như vừa bước vào phòng lạ
  cur.style.setProperty("--cx", `${innerWidth / 2}px`);
  cur.style.setProperty("--cy", `${innerHeight * 0.48}px`);
  flicker(0.5);
  bars(false, 0.6);
  await tween(iris, { r: R, duration: 0.85, ease: "power2.out", onUpdate: paint });
  cur.classList.remove("on");
  cur.style.opacity = "0";
}

let toastTimer = null;
export function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- Hộp thoại ---------- */

export function sheetOpen() {
  return !$("modal").classList.contains("hidden");
}

/* Bàn phím và trợ năng: khi hộp thoại mở, mọi thứ phía sau bị "inert" (không focus, không đọc được), nên Tab không lạc ra ngoài.
   Sổ tay đóng cũng inert, để Tab không rơi vào các nút nằm ngoài màn hình. Đóng thì trả focus về đúng nơi đã mở. */
const BEHIND = ["scene", "ui", "testimony", "pan-l", "pan-r"];
let nbOpen = false;
let coachOn = false; // hướng dẫn lần đầu đang chạy: khóa phần phía sau như khi có hộp thoại
let returnTo = null; // selector của phần tử giữ focus trước khi mở hộp thoại

// Sổ tay trên điện thoại là tấm 82dvh che gần hết cảnh; từ 768px trở lên chỉ là ngăn kéo bên trái nên cảnh vẫn cần chạy
const nbCovers = () => typeof matchMedia === "function" && matchMedia("(max-width: 767px)").matches;

function syncInert() {
  const lock = sheetOpen() || coachOn;
  for (const id of BEHIND) $(id).inert = lock;
  $("notebook").inert = lock || !nbOpen;
  setPaused(sheetOpen() || (nbOpen && nbCovers())); // chỉ có tác dụng ở chế độ nhẹ
}

// Bật hoặc tắt khóa phía sau trong lúc chạy hướng dẫn (coach.js)
export function setCoachActive(on) {
  coachOn = on;
  syncInert();
}

// Selector đủ để tìm lại một nút sau khi cảnh vẽ lại (phần tử cũ có thể đã bị thay)
function selectorOf(el) {
  if (!el || el === document.body) return null;
  if (el.id) return `#${CSS.escape(el.id)}`;
  const a = el.dataset && el.dataset.action;
  if (!a) return null;
  const key = ["id", "loc", "who", "tab", "k"].find((k) => el.dataset[k] !== undefined);
  return `[data-action="${a}"]${key ? `[data-${key}="${CSS.escape(el.dataset[key])}"]` : ""}`;
}

function restoreFocus() {
  const el = returnTo && document.querySelector(returnTo);
  returnTo = null;
  if (el && !el.disabled) el.focus({ preventScroll: true });
}

// Sổ tay mở hoặc đóng: bỏ inert, đưa focus vào nút đóng; đóng thì trả focus về nút Sổ tay
export function setNotebook(open) {
  const was = nbOpen;
  nbOpen = open;
  syncInert();
  if (open === was) return;
  if (open) {
    $("notebook").querySelector(".nb-close").focus({ preventScroll: true });
  } else if ($("notebook").contains(document.activeElement) || document.activeElement === document.body) {
    const toggle = document.querySelector('[data-action="nb-toggle"]');
    if (toggle) toggle.focus({ preventScroll: true });
  }
}

// opts.cinema: tin quan trọng, thêm hai thanh đen, rung và đèn chập chờn
export function showSheet(html, opts = {}) {
  $("toast").classList.remove("show");
  hideTestimony();
  const m = $("modal");
  if (!sheetOpen()) returnTo = selectorOf(document.activeElement); // vẽ lại hộp đang mở không đổi nơi sẽ trả focus
  m.innerHTML = `<div class="sheet">${html}</div>`;
  icons(m);
  // Tên của hộp thoại cho trình đọc màn hình: tiêu đề đầu tiên
  const title = m.querySelector("h2");
  if (title) {
    title.id = "sheet-title";
    m.setAttribute("aria-labelledby", "sheet-title");
  } else {
    m.removeAttribute("aria-labelledby");
  }
  m.classList.remove("hidden");
  syncInert();
  const b = m.querySelector("button");
  // Giữ hộp thoại ở đầu trang: focus vào nút cuối của một hộp dài sẽ cuộn xuống tận đáy
  if (b) b.focus({ preventScroll: true });
  const sheet = m.querySelector(".sheet");
  sheet.scrollTop = 0;
  if (fancy()) {
    // Tờ giấy rơi xuống mặt bàn rồi nằm yên
    gsap.fromTo(sheet, { y: -46, rotate: -1.8, opacity: 0, scale: 0.97 }, { y: 0, rotate: 0, opacity: 1, scale: 1, duration: 0.55, ease: "back.out(1.5)", clearProps: "transform" });
    gsap.fromTo(m, { backgroundColor: "rgba(6,4,3,0)" }, { backgroundColor: "rgba(6,4,3,0.72)", duration: 0.35, clearProps: "backgroundColor" });
    if (opts.cinema) {
      shake(1);
      flicker(1);
      bars(true, 0.4);
    }
  }
}

// Vẽ lại nội dung hộp thoại ĐANG MỞ sau một lựa chọn (chọn nghi phạm, chọn hồ sơ, gõ số khóa...): giữ nguyên vị trí cuộn và nút đang focus,
// không phát lại hoạt ảnh tờ giấy rơi. showSheet đưa hộp về đầu trang, nên dùng nó cho mỗi lần chọn thì người chơi bị giật lên đầu liên tục.
export function updateSheet(html) {
  const sheet = $("modal").querySelector(".sheet");
  if (!sheetOpen() || !sheet) return showSheet(html);
  const top = sheet.scrollTop;
  // Nút được nhận ra theo thứ tự (không theo data-id: một hồ sơ có thể xuất hiện ở nhiều bước)
  const focusAt = [...sheet.querySelectorAll("button")].indexOf(document.activeElement);
  sheet.innerHTML = html;
  icons(sheet);
  const title = sheet.querySelector("h2");
  if (title) title.id = "sheet-title";
  sheet.scrollTop = top;
  if (focusAt >= 0) {
    const b = sheet.querySelectorAll("button")[focusAt];
    if (b) b.focus({ preventScroll: true });
  }
}

export function closeSheet() {
  const m = $("modal");
  m.classList.add("hidden");
  m.innerHTML = "";
  syncInert();
  restoreFocus();
  if (HAS_GSAP) bars(false, 0.35);
}

/* ---------- Lời khai cận cảnh ---------- */

let tmTimer = null;

// Thẻ lời khai dưới màn hình: chữ hiện dần từng từ, cảnh đẩy lại gần người đang nói. Không chặn thao tác khác
export function showTestimony(html, focus) {
  const el = $("testimony");
  clearTimeout(tmTimer);
  el.innerHTML = html;
  icons(el);
  el.classList.add("on");
  if (fancy()) {
    const words = el.querySelectorAll(".w");
    gsap.fromTo(el.firstElementChild, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" });
    gsap.from(words, { opacity: 0, y: 5, filter: "blur(3px)", duration: 0.35, stagger: Math.min(0.045, 2.4 / Math.max(1, words.length)), delay: 0.25, ease: "power2.out", clearProps: "filter" });
    if (focus) pushIn(focus.x, focus.y, 1.05, 1.1);
  }
  tmTimer = setTimeout(hideTestimony, 14000);
}

export function hideTestimony() {
  const el = $("testimony");
  if (!el.classList.contains("on")) return;
  clearTimeout(tmTimer);
  el.classList.remove("on");
  el.innerHTML = "";
  pushOut(0.5);
}

/* ---------- Hiệu ứng của điểm điều tra ---------- */

// Hồ sơ vừa thu bay vào Sổ tay theo một đường cong, rồi nút Sổ tay nảy lên
export function flyToNotebook(from) {
  const target = document.querySelector('[data-action="nb-toggle"]');
  if (!fancy() || !from || !target) return;
  const t = target.getBoundingClientRect();
  const el = document.createElement("span");
  el.className = "fly";
  el.innerHTML = '<i class="fa-solid fa-folder-open"></i>';
  icons(el);
  el.style.left = `${from.left + from.width / 2}px`;
  el.style.top = `${from.top + from.height / 2}px`;
  document.body.appendChild(el);
  const dx = t.left + t.width / 2 - (from.left + from.width / 2);
  const dy = t.top + t.height / 2 - (from.top + from.height / 2);
  const d = 0.85;
  gsap.fromTo(el, { scale: 1.2, rotate: -8 }, { scale: 0.35, rotate: 300, duration: d, ease: "power2.in" });
  gsap.to(el, { x: dx, duration: d, ease: "power1.inOut" });
  gsap.to(el, {
    y: dy, duration: d, ease: "power3.in",
    onComplete: () => {
      el.remove();
      gsap.fromTo(target, { scale: 1.16 }, { scale: 1, duration: 0.5, ease: "elastic.out(1.2, 0.5)", clearProps: "transform" });
    }
  });
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
