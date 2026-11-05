/* Chế độ nhẹ cho điện thoại và máy bảng cảm ứng. Tự bật khi con trỏ chính là ngón tay (pointer: coarse).
   Thử trên máy tính: thêm ?lite=1 vào địa chỉ (hoặc ?lite=0 để ép tắt).
   Chế độ nhẹ gắn class "lite" lên <html>; main.css bỏ làm mờ nền (backdrop-filter) và hạt phim, còn các lớp vẽ
   (render/world.js, lighting.js, ambience.js) bớt đèn, hạt bụi, mưa và tạm dừng cảnh khi hộp thoại che gần hết màn hình. */
const forced = typeof location === "object" ? new URLSearchParams(location.search).get("lite") : null;

export const LITE = forced === "1" || (forced !== "0" && typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches);

if (LITE && typeof document === "object") document.documentElement.classList.add("lite");
