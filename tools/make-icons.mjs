/* Sinh icon PNG cho PWA (public/icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png)
   bằng Chrome thật qua playwright-core, từ cùng hình kính lúp với favicon trong index.html.
   Chạy: node tools/make-icons.mjs (cần Chrome hoặc Edge; đặt CHROME_PATH nếu không tự tìm thấy).
   Icon "maskable" tràn viền và thu nhỏ hình vào vùng an toàn 80% để Android cắt tròn/bo góc không mất nét. */
import { chromium } from "playwright-core";
import { existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const out = fileURLToPath(new URL("../public/", import.meta.url));
mkdirSync(out, { recursive: true });

const CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
].filter(Boolean);
const executablePath = CANDIDATES.find((p) => existsSync(p));
if (!executablePath) throw new Error("Không tìm thấy Chrome hoặc Edge; đặt biến CHROME_PATH");

const glass = `
  <circle cx="27" cy="27" r="13" fill="#ffd98e" fill-opacity=".18" stroke="#f0b35a" stroke-width="5"/>
  <circle cx="27" cy="27" r="4.5" fill="#ffd98e"/>
  <path d="M37 37l13 13" stroke="#f0b35a" stroke-width="6" stroke-linecap="round"/>`;

// Hình kính lúp trải từ x≈9 tới 53; dịch về giữa khung 64 cho cân
const svg = (maskable) => maskable
  ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#0c0907"/><g transform="translate(32 32) scale(.8) translate(-31 -31)">${glass}</g></svg>`
  : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0c0907"/><g transform="translate(32 32) scale(.92) translate(-31 -31)">${glass}</g></svg>`;

const jobs = [
  ["icon-192.png", 192, false],
  ["icon-512.png", 512, false],
  ["icon-maskable-512.png", 512, true],
  // iOS tự bo góc, nên dùng bản tràn viền
  ["apple-touch-icon.png", 180, true]
];

const browser = await chromium.launch({ executablePath, headless: true });
try {
  for (const [name, size, maskable] of jobs) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg(maskable)}`);
    await page.screenshot({ path: out + name, omitBackground: true });
    await page.close();
    console.log(`  ${name} (${size}x${size})`);
  }
} finally {
  await browser.close();
}
