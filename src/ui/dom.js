/* Tiện ích DOM dùng chung. */
import { dom } from "@fortawesome/fontawesome-svg-core";

export const $ = (id) => document.getElementById(id);

export const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Đổi các thẻ <i class="fa-…"> trong một nút DOM thành SVG biểu tượng
export const icons = (node) => dom.i2svg({ node });

// Chỉ gán innerHTML khi nội dung thật sự đổi, để không làm mất hoạt ảnh và vị trí cuộn
export function setHTML(el, html) {
  if (el.__html === html) return false;
  el.__html = html;
  el.innerHTML = html;
  icons(el);
  return true;
}
