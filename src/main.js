import "@fortawesome/fontawesome-svg-core/styles.css";
import "./styles/fonts.css";
import "./styles/main.css";
import { dom } from "@fortawesome/fontawesome-svg-core";
import "./ui/icon-lib.js";
import { boot, actions } from "./app.js";
import { consumeDrag } from "./ui/stage.js";
import { ripple } from "./ui/overlays.js";

// Thẻ <i> có sẵn trong index.html được đổi thành SVG; các thẻ vẽ sau đó tự đổi khi vẽ
dom.i2svg();

// Kéo sân khấu không được coi là một lần bấm nút
document.addEventListener(
  "click",
  (e) => {
    if (consumeDrag()) {
      e.preventDefault();
      e.stopPropagation();
    }
  },
  true
);

// Ủy quyền toàn bộ hành động qua data-action, không dùng onclick
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  const run = el && actions[el.dataset.action];
  if (!run) return;
  if (el.classList.contains("hs")) ripple(el);
  run(el.dataset);
});

boot();

// Service worker để Chrome cho "Cài đặt ứng dụng" (bản cài mở toàn màn hình) và chơi lại được khi mất mạng.
// Chỉ đăng ký trên bản build chạy qua http(s): mở file trực tiếp hay `npm run dev` thì bỏ qua để khỏi dính bản cũ trong bộ nhớ đệm
if ("serviceWorker" in navigator && import.meta.env.PROD && /^https?:$/.test(location.protocol)) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
