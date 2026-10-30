/* Lưu tiến độ trên trình duyệt. Lỗi bộ nhớ (chế độ riêng tư, bị chặn) không làm hỏng trò chơi. */
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
