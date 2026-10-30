/* Lưu tiến độ và ván đang chơi trên trình duyệt. Lỗi bộ nhớ (chế độ riêng tư, bị chặn) không làm hỏng trò chơi. */
import { emptySave } from "./rules.js";

const KEY = "hanoi-noir-save-v2";

export function loadSave() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && typeof d.unlocked === "number" && d.stars) return d;
  } catch (e) {
    /* bỏ qua: dùng tiến độ mới */
  }
  return emptySave();
}

export function storeSave(save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch (e) {
    /* không lưu được thì thôi */
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(KEY);
  } catch (e) {
    /* bỏ qua */
  }
}

// Ván đang chơi (vụ, địa điểm, hồ sơ đã thu, giờ còn lại...) lưu riêng với khóa khác để không ảnh hưởng số sao.
// Chỉ dữ liệu đúng dạng mới được dùng; dữ liệu hỏng thì coi như không có ván nào.
const RUN_KEY = "hanoi-noir-run-v1";

export function loadRun() {
  try {
    const d = JSON.parse(localStorage.getItem(RUN_KEY));
    const g = d && d.game;
    if (Number.isInteger(d?.idx) && g && g.idx === d.idx && typeof g.hours === "number" && Array.isArray(g.found)) {
      return d;
    }
  } catch (e) {
    /* bỏ qua: không có ván để khôi phục */
  }
  return null;
}

export function storeRun(run) {
  try {
    localStorage.setItem(RUN_KEY, JSON.stringify(run));
  } catch (e) {
    /* không lưu được thì thôi */
  }
}

export function clearRun() {
  try {
    localStorage.removeItem(RUN_KEY);
  } catch (e) {
    /* bỏ qua */
  }
}
