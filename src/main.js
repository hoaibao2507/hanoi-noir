import "@fortawesome/fontawesome-svg-core/styles.css";
import "./styles/main.css";
import { config, dom, library } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowLeft, faArrowRight, faBookOpen, faCheck, faChevronLeft, faChevronRight,
  faCircleCheck, faCircleQuestion, faCircleXmark, faComments, faFileCircleCheck,
  faFileLines, faFolderOpen, faForward, faGavel, faHeart, faHourglassEnd,
  faLink, faLocationDot, faLock, faMagnifyingGlass, faRotateLeft, faRotateRight, faTableCells,
  faTriangleExclamation, faTrophy, faUserSecret, faVideo, faXmark
} from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import { boot, actions } from "./app.js";
import { consumeDrag } from "./ui/stage.js";
import { ripple } from "./ui/overlays.js";

// Chỉ đóng gói các biểu tượng thật sự dùng; thẻ <i> được đổi thành SVG khi vẽ
config.autoAddCss = false;
library.add(
  faArrowLeft, faArrowRight, faBookOpen, faCheck, faChevronLeft, faChevronRight,
  faCircleCheck, faCircleQuestion, faCircleXmark, faComments, faFileCircleCheck,
  faFileLines, faFolderOpen, faForward, faGavel, faHeart, faHourglassEnd,
  faLink, faLocationDot, faLock, faMagnifyingGlass, faRotateLeft, faRotateRight, faTableCells,
  faTriangleExclamation, faTrophy, faUserSecret, faVideo, faXmark,
  faClock
);
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
