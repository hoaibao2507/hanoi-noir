import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// Phaser có sẵn bản "core" (không có vật lý arcade, matter và tilemap) do chính nhà phát triển cung cấp.
// Trỏ import "phaser" về bản này để giảm khoảng 140 KB gzip; API dùng trong dự án không đổi.
const phaserCore = fileURLToPath(new URL("./node_modules/phaser/src/phaser-core.js", import.meta.url));
const spectorStub = fileURLToPath(new URL("./src/vendor/spector-stub.js", import.meta.url));

// Các cờ build của Phaser (lấy từ cấu hình webpack chính thức của Phaser). Bản core dùng
// "typeof X" để kiểm tra cờ, nên phải thay bằng giá trị cố định, nếu không nhánh gỡ lỗi luôn chạy.
const PHASER_FLAGS = {
  "typeof CANVAS_RENDERER": "true",
  "typeof WEBGL_RENDERER": "true",
  "typeof WEBGL_DEBUG": "false",
  "typeof FEATURE_SOUND": "true",
};
const phaserFlags = {
  name: "phaser-build-flags",
  enforce: "pre",
  transform(code, id) {
    if (!/node_modules[\\/]phaser[\\/]/.test(id)) return null;
    let out = code;
    for (const [flag, value] of Object.entries(PHASER_FLAGS)) out = out.split(flag).join(value);
    return out === code ? null : { code: out, map: null };
  },
};

// Bản build gom toàn bộ JS, CSS và SVG vào một file index.html,
// nên có thể mở trực tiếp bằng trình duyệt mà không cần máy chủ.
export default defineConfig({
  plugins: [phaserFlags, tailwindcss(), viteSingleFile()],
  resolve: {
    alias: [
      { find: /^phaser$/, replacement: phaserCore },
      { find: /^phaser3spectorjs$/, replacement: spectorStub },
    ],
  },
  // Bản core của Phaser là CommonJS và gán vào biến global; trình duyệt không có global nên đổi thành globalThis
  define: {
    global: "globalThis",
  },
  // Khi chạy "npm run dev", Phaser được gom trước bằng bộ tối ưu phụ thuộc, nên cần cùng bước vá cờ ở đây
  optimizeDeps: {
    rolldownOptions: {
      plugins: [phaserFlags],
    },
  },
  build: {
    target: "es2022",
  },
});
