// ESLint (flat config): chỉ bắt lỗi thật (biến chưa khai báo, biến thừa, trùng khóa...), không bàn về định dạng
import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["dist/**", "node_modules/**"] },
  js.configs.recommended,
  {
    files: ["src/**/*.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module", globals: { ...globals.browser } },
    rules: {
      "no-unused-vars": ["warn", { args: "none", caughtErrors: "none", varsIgnorePattern: "^_" }]
    }
  },
  {
    files: ["tests/**/*.js", "tests/**/*.mjs", "tools/**/*.mjs", "vite.config.js", "eslint.config.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module", globals: { ...globals.node } }
  },
  {
    // Trang xem cảnh tạm của tác giả (tools/scenes.html) chạy trong trình duyệt
    files: ["tools/scenes.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module", globals: { ...globals.browser } }
  },
  {
    // Service worker (public/sw.js) chạy ngoài trang: có self, caches, fetch nhưng không có document
    files: ["public/sw.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "script", globals: { ...globals.serviceworker } }
  },
  {
    // Bài kiểm thử trình duyệt có các hàm chạy bên trong trang (page.evaluate) nên dùng được cả document, window
    files: ["tests/e2e/**/*.mjs"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } }
  }
];
