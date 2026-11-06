/* Toàn màn hình cho điện thoại: Fullscreen API ẩn thanh địa chỉ của Chrome, rồi khóa màn hình ngang.
   Bản cài về máy chạy kiểu standalone (manifest không còn display: fullscreen và orientation: landscape vì một số máy Xiaomi/Oppo/Vivo/Realme
   làm bản cài hỏng ngay lúc mở), nên vẫn có nút này; riêng khi đã toàn màn hình sẵn thì nút tự ẩn bằng CSS (display-mode). */
const root = document.documentElement;

const enterFn = () => root.requestFullscreen || root.webkitRequestFullscreen;
const exitFn = () => document.exitFullscreen || document.webkitExitFullscreen;

export const canFullscreen = () => !!(enterFn() && (document.fullscreenEnabled || document.webkitFullscreenEnabled));
export const isFullscreen = () => !!(document.fullscreenElement || document.webkitFullscreenElement);

function unlockOrientation() {
  try {
    screen.orientation && screen.orientation.unlock();
  } catch {
    /* không hỗ trợ khóa hướng thì thôi */
  }
}

// Trả true nếu đã đổi được trạng thái; false khi trình duyệt không cho (ví dụ iPhone Safari)
export async function toggleFullscreen() {
  if (!canFullscreen()) return false;
  try {
    if (isFullscreen()) {
      unlockOrientation();
      await exitFn().call(document);
      return true;
    }
    const enter = enterFn();
    await (enter === root.requestFullscreen ? enter.call(root, { navigationUI: "hide" }) : enter.call(root));
    try {
      // Chỉ Android Chrome cho khóa hướng, và chỉ khi đang toàn màn hình; máy tính sẽ từ chối
      await screen.orientation.lock("landscape");
    } catch {
      /* bỏ qua */
    }
    return true;
  } catch {
    return false;
  }
}

export function initFullscreen() {
  if (!canFullscreen()) root.classList.add("no-fs");
  // Bản cài về máy: thử khóa ngang (manifest không còn khóa); máy nào không cho thì bỏ qua, không ảnh hưởng gì
  if (matchMedia("(display-mode: standalone)").matches) {
    try {
      const p = screen.orientation && screen.orientation.lock && screen.orientation.lock("landscape");
      if (p && p.catch) p.catch(() => {});
    } catch {
      /* bỏ qua */
    }
  }
  // Thoát bằng cử chỉ Back của điện thoại thì cũng nhả khóa hướng, để máy xoay lại bình thường
  const onChange = () => isFullscreen() || unlockOrientation();
  document.addEventListener("fullscreenchange", onChange);
  document.addEventListener("webkitfullscreenchange", onChange);
}
