/* =====================================================================
   Hướng dẫn lần đầu chơi: một chuỗi thẻ nhỏ, mỗi thẻ làm sáng một thành phần trên màn hình (các nút ở bốn góc,
   điểm điều tra, cửa) và nói ngắn gọn nó để làm gì. Chỉ hiện một lần, sau lần đầu bấm xong phần mở đầu của vụ đầu tiên;
   "Cách chơi" ở menu có nút để xem lại. Thành phần nào không có hoặc nằm ngoài khung nhìn thì bước đó được bỏ qua.
   ===================================================================== */
import gsap from "gsap";

const KEY = "hanoi-noir-coach-v1";
const REDUCED = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

export function coachSeen() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return true; // không ghi nhớ được thì đừng làm phiền mỗi lần
  }
}

export function markCoachSeen(seen = true) {
  try {
    if (seen) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {
    /* chế độ riêng tư: bỏ qua */
  }
}

// sel: bộ chọn của thành phần cần làm sáng; không có sel thì thẻ nằm giữa màn hình
const STEPS = [
  { sel: ".hs.is-open .hs-chip", title: "Điều tra", text: "Bấm vào các thẻ vàng trên cảnh để hỏi cung, khám nghiệm hoặc tra cứu. Mỗi lần tốn giờ điều tra; kết quả được ghi vào Sổ tay." },
  { sel: null, title: "Đèn pin", text: "Rê chuột như cầm đèn pin. Có những dấu vết nằm trong bóng tối, chỉ hiện ra khi ánh sáng chạm tới." },
  { sel: '[data-coach="clock"]', title: "Đồng hồ và giờ điều tra", text: "Mỗi lần điều tra là một giờ trôi qua, và giờ điều tra có hạn. Hồ sơ không biến mất theo thời gian, nhưng vài kết quả (sao kê, báo cáo) chỉ về sau một mốc giờ. Di chuyển giữa các địa điểm thì không tốn giờ." },
  { sel: '[data-coach="lives"]', title: "Ba mạng", text: "Buộc tội sai thì mất một mạng. Hết ba mạng, hồ sơ đóng lại." },
  { sel: ".door .door-sign", title: "Cửa", text: "Cửa dẫn tới địa điểm khác. Kéo màn hình hoặc dùng mũi tên ◀ ▶ để xem hai bên cảnh." },
  { sel: '[data-coach="notebook"]', title: "Sổ tay", text: "Nơi gom mọi hồ sơ, nghi phạm, mốc thời gian và các liên kết bạn tìm ra. Đừng tin ngay lời khai: hãy đối chiếu với vật chứng và camera." },
  { sel: '[data-coach="hint"]', title: "Gợi ý", text: "Kẹt rồi thì bấm đây. Gợi ý không tốn giờ và không ảnh hưởng số sao, chỉ được đếm ở màn kết thúc." },
  { sel: '[data-coach="accuse"]', title: "Buộc tội", text: "Khi đã đủ chứng cứ, bấm đây để chọn thủ phạm và hồ sơ chứng minh. Chúc bạn phá án thuận lợi." }
];

let root = null;
let active = false;
let onEnd = null;

export const coachActive = () => active;

// Điểm nằm trong khung nhìn có thể làm sáng được không
function usable(el) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && r.right > 8 && r.left < innerWidth - 8 && r.bottom > 8 && r.top < innerHeight - 8;
}

function build() {
  root = document.createElement("div");
  root.id = "coach";
  root.innerHTML = `<div class="coach-spot"></div>
    <div class="coach-card glass" role="region" aria-label="Hướng dẫn" aria-live="polite">
      <div class="kicker coach-k"></div>
      <h3 class="coach-t"></h3>
      <p class="coach-p"></p>
      <div class="coach-row">
        <button class="btn btn-ghost" data-coach-skip>Bỏ qua</button>
        <button class="btn" data-coach-next>Tiếp</button>
      </div>
    </div>`;
  document.body.appendChild(root);
  root.addEventListener("click", (e) => {
    if (e.target.closest("[data-coach-next]")) next();
    else if (e.target.closest("[data-coach-skip]")) stop();
  });
}

let queue = [];
let at = 0;

function show() {
  const step = queue[at];
  const el = step.sel ? document.querySelector(step.sel) : null;
  const spot = root.querySelector(".coach-spot"), card = root.querySelector(".coach-card");
  root.querySelector(".coach-k").textContent = `Hướng dẫn · ${at + 1}/${queue.length}`;
  root.querySelector(".coach-t").textContent = step.title;
  root.querySelector(".coach-p").textContent = step.text;
  root.querySelector("[data-coach-next]").textContent = at === queue.length - 1 ? "Bắt đầu" : "Tiếp";
  root.querySelector("[data-coach-skip]").hidden = at === queue.length - 1;

  const W = card.offsetWidth || 320, H = card.offsetHeight || 170;
  root.classList.toggle("no-spot", !el);
  if (el) {
    const r = el.getBoundingClientRect(), pad = 9;
    Object.assign(spot.style, { left: `${r.left - pad}px`, top: `${r.top - pad}px`, width: `${r.width + pad * 2}px`, height: `${r.height + pad * 2}px` });
    const mid = r.left + r.width / 2;
    card.style.left = `${Math.min(innerWidth - W - 12, Math.max(12, mid - W / 2))}px`;
    // Thẻ nằm phía có nhiều chỗ hơn so với thành phần được làm sáng
    const below = r.top + r.height / 2 < innerHeight / 2;
    card.style.top = below ? `${Math.min(innerHeight - H - 12, r.bottom + pad + 14)}px` : `${Math.max(12, r.top - pad - 14 - H)}px`;
  } else {
    card.style.left = `${Math.max(12, (innerWidth - W) / 2)}px`;
    card.style.top = `${Math.max(12, (innerHeight - H) / 2)}px`;
  }
  if (!REDUCED) gsap.fromTo(card, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", clearProps: "transform" });
  root.querySelector("[data-coach-next]").focus({ preventScroll: true });
}

function next() {
  if (at >= queue.length - 1) return stop();
  at++;
  show();
}

function stop() {
  if (!active) return;
  active = false;
  root.remove();
  root = null;
  if (onEnd) onEnd(false);
}

// Bắt đầu hướng dẫn. setBusy(true/false) cho bên ngoài khóa thao tác phía sau (inert). Trả về false nếu không có bước nào làm được
export function startCoach(setBusy) {
  if (active) return true;
  queue = STEPS.filter((s) => !s.sel || usable(document.querySelector(s.sel)));
  if (!queue.length) return false;
  active = true;
  at = 0;
  onEnd = () => setBusy(false);
  setBusy(true);
  build();
  show();
  window.addEventListener("resize", reflow, { once: true });
  return true;
}

// Đổi cỡ cửa sổ giữa chừng thì vị trí cũ sai: đặt lại bước hiện tại
function reflow() {
  if (active && root) {
    show();
    window.addEventListener("resize", reflow, { once: true });
  }
}

export function skipCoach() {
  stop();
}
