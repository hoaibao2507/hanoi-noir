/* =====================================================================
   Bảng ghim trong tab Liên kết của sổ tay: kéo một tấm hồ sơ thả lên tấm khác để nối bằng sợi chỉ.
   Sợi chỉ của các cặp đã tìm được vẽ bằng SVG phủ lên bảng (đỏ = mâu thuẫn, vàng = liên hệ) và
   chạy ra như được căng thật. Cách bấm chọn hai hồ sơ rồi Đối chiếu vẫn dùng được (bàn phím, màn cảm ứng).
   ===================================================================== */
import gsap from "gsap";

const NS = "http://www.w3.org/2000/svg";
const REDUCED = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const MOVE = 8; // phải kéo quá ngần này px mới tính là kéo, không phải bấm

let drawn = new Set(); // sợi chỉ đã vẽ ở lần trước; chỉ sợi mới mới chạy hoạt ảnh
let drag = null;
let suppress = false;

const boardOf = (el) => el.closest("[data-board]");

// Tâm một tấm ghim, tính theo toạ độ của bảng
function center(board, pin) {
  const b = board.getBoundingClientRect(), r = pin.getBoundingClientRect();
  return [r.left - b.left + r.width / 2, r.top - b.top + 14];
}

// Sợi chỉ chùng nhẹ ở giữa như bị trọng lực kéo xuống
function curve([x1, y1], [x2, y2]) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + Math.hypot(x2 - x1, y2 - y1) * 0.16 + 10;
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

function line(d, kind) {
  const p = document.createElementNS(NS, "path");
  p.setAttribute("d", d);
  p.setAttribute("class", `thread k-${kind}`);
  return p;
}

// Vẽ lại toàn bộ sợi chỉ của một bảng; sợi vừa có thêm thì chạy ra từ đầu này sang đầu kia
function layout(board) {
  const svg = board.querySelector(".threads");
  if (!svg) return;
  svg.replaceChildren();
  let threads;
  try {
    threads = JSON.parse(board.dataset.threads || "[]");
  } catch {
    threads = [];
  }
  const now = new Set();
  for (const [a, b, kind] of threads) {
    const pa = board.querySelector(`[data-pin="${CSS.escape(a)}"]`), pb = board.querySelector(`[data-pin="${CSS.escape(b)}"]`);
    if (!pa || !pb) continue;
    const key = `${a}|${b}`;
    now.add(key);
    const p = line(curve(center(board, pa), center(board, pb)), kind);
    svg.appendChild(p);
    if (!drawn.has(key) && !REDUCED) {
      const len = p.getTotalLength();
      gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.8, ease: "power2.out", clearProps: "strokeDasharray,strokeDashoffset" });
      for (const pin of [pa, pb]) gsap.fromTo(pin, { scale: 1.08 }, { scale: 1, duration: 0.6, ease: "elastic.out(1.2, 0.5)", clearProps: "scale" });
    }
  }
  drawn = now;
}

// Gọi sau mỗi lần vẽ lại sổ tay
export function syncPinboard(root) {
  root.querySelectorAll("[data-board]").forEach(layout);
}

// Hai tấm ghim lắc đầu: cặp này chưa cho thấy điều gì
export function wiggle(ids) {
  if (REDUCED) return;
  for (const id of ids) {
    const pin = document.querySelector(`[data-pin="${CSS.escape(id)}"]`);
    if (pin) gsap.fromTo(pin, { x: -5 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.25)", clearProps: "x" });
  }
}

function pinAt(x, y, except) {
  const hit = document.elementFromPoint(x, y);
  const pin = hit && hit.closest ? hit.closest(".pin") : null;
  return pin && pin !== except ? pin : null;
}

function endDrag() {
  if (!drag) return;
  drag.pin.classList.remove("is-drag");
  drag.board.querySelectorAll(".pin.is-target").forEach((p) => p.classList.remove("is-target"));
  if (drag.live) drag.live.remove();
  drag = null;
}

// Cắm sự kiện kéo thả vào vùng chứa sổ tay (chỉ một lần). onPair(a, b) được gọi khi thả một tấm lên tấm khác
export function mountPinboard(root, onPair) {
  root.addEventListener("pointerdown", (e) => {
    const pin = e.target.closest && e.target.closest(".pin");
    if (!pin || e.button !== 0) return;
    drag = { pin, board: boardOf(pin), x: e.clientX, y: e.clientY, on: false, live: null };
  });

  window.addEventListener("pointermove", (e) => {
    if (!drag) return;
    if (!drag.on) {
      if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < MOVE) return;
      drag.on = true;
      drag.pin.classList.add("is-drag");
      drag.live = line("", "live");
      drag.board.querySelector(".threads").appendChild(drag.live);
    }
    const b = drag.board.getBoundingClientRect();
    drag.live.setAttribute("d", curve(center(drag.board, drag.pin), [e.clientX - b.left, e.clientY - b.top]));
    const over = pinAt(e.clientX, e.clientY, drag.pin);
    drag.board.querySelectorAll(".pin.is-target").forEach((p) => p !== over && p.classList.remove("is-target"));
    if (over) over.classList.add("is-target");
  });

  window.addEventListener("pointerup", (e) => {
    if (!drag) return;
    const was = drag;
    const over = was.on ? pinAt(e.clientX, e.clientY, was.pin) : null;
    if (was.on) {
      suppress = true; // lần nhả chuột này không được tính là bấm chọn
      setTimeout(() => (suppress = false), 0);
    }
    endDrag();
    if (over) onPair(was.pin.dataset.pin, over.dataset.pin);
  });
  window.addEventListener("pointercancel", endDrag);

  // Chặn cú click sinh ra sau khi kéo, để không bị chọn nhầm hồ sơ
  root.addEventListener(
    "click",
    (e) => {
      if (!suppress) return;
      e.preventDefault();
      e.stopPropagation();
    },
    true
  );

  window.addEventListener("resize", () => syncPinboard(root));
}
