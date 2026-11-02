/* Kiểm thử khói bằng trình duyệt thật: mở bản build một file (dist/index.html) bằng Chrome, chơi vài bước đầu của một vụ án
   và bắt các lỗi mà test đơn vị không thấy được: lỗi console, WebGL/ánh sáng không chạy, font hay thư viện tải từ mạng,
   hộp thoại để lọt focus ra phía sau, sổ tay không trả focus, ván đang chơi không khôi phục khi tải lại.

   Chạy: npm run e2e (tự build trước). Cần Chrome hoặc Edge đã cài; đặt CHROME_PATH nếu không tự tìm thấy.
   E2E_NO_GL=1 bỏ qua kiểm tra WebGL (máy không có GPU hay phần mềm vẽ thay thế). */
import { chromium } from "playwright-core";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert/strict";

const dist = fileURLToPath(new URL("../../dist/index.html", import.meta.url));
assert.ok(existsSync(dist), "Chưa có dist/index.html: chạy npm run build trước");

const CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
].filter(Boolean);
const executablePath = CANDIDATES.find((p) => existsSync(p));
assert.ok(executablePath, "Không tìm thấy Chrome hoặc Edge; đặt biến CHROME_PATH");

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

const problems = [];
page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text()}`));
page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
page.on("request", (r) => /^https?:/.test(r.url()) && problems.push(`yêu cầu mạng: ${r.url()}`));

let step = "khởi động";
const run = async (name, fn) => {
  step = name;
  await fn();
  console.log(`  ok  ${name}`);
};
const active = () => page.evaluate(() => {
  const a = document.activeElement;
  return a ? { tag: a.tagName, cls: a.className, action: a.dataset && a.dataset.action, inModal: !!a.closest("#modal"), inNotebook: !!a.closest("#notebook") } : null;
});
const inert = (id) => page.evaluate((i) => document.getElementById(i).inert, id);

try {
  await page.goto(pathToFileURL(dist).href);

  await run("menu hiện các vụ án và chuyển vùng", async () => {
    await page.waitForSelector(".case-card", { timeout: 10000 });
    assert.equal(await page.locator(".case-card").count(), 5, "vùng Hà Nội phải có 5 vụ");
    await page.click('.region-tab[data-id="sg"]');
    await page.waitForFunction(() => document.querySelectorAll(".case-card").length === 1);
    await page.click('.region-tab[data-id="hn"]');
    await page.waitForFunction(() => document.querySelectorAll(".case-card").length === 5);
  });

  await run("vào vụ án: chuyển cảnh rồi hộp thoại mở đầu giữ focus", async () => {
    await page.click('.case-card[data-i="0"]');
    await page.waitForSelector("#modal:not(.hidden) .sheet", { timeout: 15000 });
    const a = await active();
    assert.ok(a && a.inModal, "focus phải nằm trong hộp thoại");
    assert.equal(await inert("scene"), true, "cảnh phía sau phải inert khi hộp thoại mở");
    assert.equal(await inert("ui"), true, "HUD phía sau phải inert khi hộp thoại mở");
    assert.ok(await page.getAttribute("#modal", "aria-labelledby"), "hộp thoại phải có tên (aria-labelledby)");
  });

  await run("đóng hộp thoại: cảnh sống lại, đèn thật chạy", async () => {
    await page.click("#modal .btn");
    await page.waitForSelector("#modal.hidden", { state: "attached" });
    await page.waitForSelector(".hs.is-open", { state: "attached", timeout: 10000 });
    await page.waitForSelector("#gl canvas");
    if (!process.env.E2E_NO_GL) {
      await page.waitForFunction(() => document.getElementById("scene").classList.contains("gl-lit"), null, { timeout: 15000 });
    }
  });

  await run("lần đầu chơi: hướng dẫn hiện ra, khóa phía sau, bấm Tiếp và Bỏ qua, không hiện lại", async () => {
    await page.waitForSelector("#coach .coach-card", { timeout: 10000 });
    assert.equal(await inert("scene"), true, "hướng dẫn chạy thì cảnh phía sau phải inert");
    assert.match(await page.textContent(".coach-k"), /^Hướng dẫn · 1\//);
    await page.click("[data-coach-next]");
    await page.waitForFunction(() => /· 2\//.test(document.querySelector(".coach-k").textContent));
    await page.click("[data-coach-skip]");
    await page.waitForSelector("#coach", { state: "detached" });
    assert.equal(await inert("scene"), false, "tắt hướng dẫn thì cảnh phải dùng lại được");
    assert.equal(await page.evaluate(() => localStorage.getItem("hanoi-noir-coach-v1")), "1");
  });

  await run("gợi ý: chỉ hướng rồi chỉ rõ, điểm điều tra nhấp nháy, số lần được đếm", async () => {
    await page.click('[data-action="hint"]');
    await page.waitForSelector("#modal:not(.hidden) .expl");
    assert.equal(await page.evaluate(() => document.querySelectorAll(".hs.is-hint").length), 0, "mức 1 chưa chỉ rõ điểm nào");
    await page.click('[data-action="hint-more"]');
    await page.waitForFunction(() => document.querySelectorAll(".hs.is-hint").length === 1);
    assert.match(await page.textContent("#modal .muted"), /Đã dùng: 2/);
    await page.click("#modal .btn");
    await page.waitForSelector("#modal.hidden", { state: "attached" });
  });

  await run("điểm điều tra xếp theo x để Tab đi từ trái sang phải", async () => {
    const xs = await page.evaluate(() => [...document.querySelectorAll(".hs")].map((h) => parseFloat(h.style.left)));
    assert.ok(xs.length >= 3, "cảnh đầu phải có từ 3 điểm điều tra");
    assert.deepEqual(xs, [...xs].sort((p, q) => p - q));
    // Tab thật từ đầu trang tới khi chạm một điểm điều tra
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    let hit = null;
    for (let i = 0; i < 40 && !hit; i++) {
      await page.keyboard.press("Tab");
      const a = await active();
      if (a && /\bhs\b/.test(a.cls)) hit = a;
    }
    assert.ok(hit, "Tab phải tới được điểm điều tra");
    // Sổ tay đóng thì không được lọt vào thứ tự Tab
    assert.equal(await inert("notebook"), true);
  });

  await run("hỏi cung: lời khai cận cảnh hiện ra, hồ sơ được ghi", async () => {
    await page.click('.hs.is-open[aria-label^="Hỏi"] .hs-chip');
    await page.waitForFunction(
      () => document.getElementById("testimony").classList.contains("on") || !document.getElementById("modal").classList.contains("hidden"),
      null,
      { timeout: 10000 }
    );
    const found = await page.evaluate(() => Number(document.querySelector('[data-action="nb-toggle"] .tabnum').textContent));
    assert.equal(found, 1, "sổ tay phải có 1 hồ sơ");
    if (await page.evaluate(() => !document.getElementById("modal").classList.contains("hidden"))) {
      await page.click("#modal .btn"); // có diễn biến: đóng hộp thoại tin tức
      await page.waitForSelector("#modal.hidden", { state: "attached" });
    }
  });

  await run("sổ tay: mở vào đúng nút đóng, Esc đóng và trả focus", async () => {
    await page.click('[data-action="nb-toggle"]');
    await page.waitForSelector("#notebook.is-open");
    assert.equal(await inert("notebook"), false);
    assert.equal((await active()).inNotebook, true, "focus phải vào sổ tay");
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.getElementById("notebook").classList.contains("is-open"));
    assert.equal(await inert("notebook"), true, "sổ tay đóng phải inert");
    assert.equal((await active()).action, "nb-toggle", "focus phải về nút Sổ tay");
  });

  await run("tải lại trang: ván đang chơi được khôi phục", async () => {
    await page.reload();
    await page.waitForSelector('[data-action="nb-toggle"]', { timeout: 15000 });
    const found = await page.evaluate(() => Number(document.querySelector('[data-action="nb-toggle"] .tabnum').textContent));
    assert.equal(found, 1, "hồ sơ đã thu phải còn sau khi tải lại");
  });
} catch (err) {
  problems.unshift(`thất bại ở bước "${step}": ${err.message}`);
  await page.screenshot({ path: fileURLToPath(new URL("../../e2e-failure.png", import.meta.url)) }).catch(() => {});
}

await browser.close();
if (problems.length) {
  console.error("\nKiểm thử trình duyệt thất bại:\n - " + problems.join("\n - "));
  process.exit(1);
}
console.log("\nKiểm thử trình duyệt: đạt");
