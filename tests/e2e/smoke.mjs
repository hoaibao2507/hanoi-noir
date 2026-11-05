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

  await run("menu hiện hai vụ Sài Gòn và không có thanh chọn vùng", async () => {
    await page.waitForSelector(".case-card", { timeout: 10000 });
    assert.equal(await page.locator(".case-card").count(), 2, "chỉ còn hai vụ Sài Gòn");
    assert.equal(await page.locator(".region-tab").count(), 0, "một vùng thì không hiện thanh chọn vùng");
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
    // Điểm được gợi ý có thể nằm ở địa điểm khác (nhấp nháy khi tới đó), nên chỉ kiểm tra số lần dùng
    await page.waitForFunction(() => /Đã dùng: 2/.test(document.querySelector("#modal .muted")?.textContent || ""));
    assert.ok((await page.evaluate(() => document.querySelectorAll(".hs.is-hint").length)) <= 1, "tối đa một điểm nhấp nháy");
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

  await run("tổng quan địa điểm: mở bằng nút và phím M, Esc trả focus, bấm một nơi để đi tới", async () => {
    const spots = () => page.evaluate(() => [...document.querySelectorAll(".hs")].map((h) => h.getAttribute("aria-label")).join("|"));
    const before = await spots();
    await page.click('[data-action="overview"]');
    await page.waitForSelector("#modal:not(.hidden) .ov-list");
    assert.ok((await active()).inModal, "focus phải nằm trong hộp thoại");
    assert.ok((await page.locator("#modal .ov-row").count()) >= 2, "phải liệt kê các địa điểm");
    assert.equal(await page.locator('#modal .ov-row[aria-current="location"]').count(), 1, "đúng một nơi đang đứng");
    await page.keyboard.press("Escape");
    await page.waitForSelector("#modal.hidden", { state: "attached" });
    assert.equal((await active()).action, "overview", "focus phải về nút Địa điểm");
    await page.keyboard.press("m");
    await page.waitForSelector("#modal:not(.hidden) .ov-list");
    await page.click('#modal .ov-row[data-action="ov-go"]');
    await page.waitForSelector("#modal.hidden", { state: "attached" });
    await page.waitForFunction((b) => [...document.querySelectorAll(".hs")].map((h) => h.getAttribute("aria-label")).join("|") !== b, before, { timeout: 15000 });
  });

  await run("sổ tay: tìm hồ sơ, đánh dấu, ghi chú mà ô nhập không mất focus", async () => {
    await page.click('[data-action="nb-toggle"]');
    await page.waitForSelector("#notebook.is-open [data-find]");
    await page.click("[data-find]");
    await page.keyboard.type("zzzz");
    assert.equal((await active()).tag, "INPUT", "gõ tìm kiếm không được làm mất focus");
    await page.waitForFunction(() => /Không có hồ sơ nào khớp/.test(document.querySelector("[data-clues]").textContent));
    assert.match(await page.textContent("[data-find-n]"), /Hiện 0\/1/);
    await page.fill("[data-find]", "");
    await page.keyboard.type("loi khai");
    await page.waitForFunction(() => document.querySelectorAll("[data-clues] .clue").length === 1);
    assert.equal((await active()).tag, "INPUT");
    await page.click(".clue .fav");
    await page.waitForSelector(".clue .fav.on");
    assert.equal(await page.inputValue("[data-find]"), "loi khai", "bộ lọc còn nguyên sau khi vẽ lại");
    // Preact giữ nguyên nút đang bấm khi vẽ lại: bấm đánh dấu sao xong thì focus vẫn ở đúng nút đó
    assert.equal(await page.evaluate(() => document.activeElement.classList.contains("fav")), true, "focus còn ở nút sao sau khi đánh dấu");
    await page.click(".clue .note-add");
    await page.waitForSelector(".clue textarea[data-note]");
    assert.equal((await active()).tag, "TEXTAREA", "mở ô ghi chú thì focus vào ô");
    await page.keyboard.type("Quyên khai mâu thuẫn mmm");
    assert.equal((await active()).tag, "TEXTAREA", "gõ ghi chú không được vẽ lại ô");
    assert.equal(await page.inputValue("textarea[data-note]"), "Quyên khai mâu thuẫn mmm");
    assert.equal(await page.evaluate(() => document.getElementById("modal").classList.contains("hidden")), true, "chữ m trong ô ghi chú không mở tổng quan");
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("hanoi-noir-run-v2")).game.notes);
    assert.ok(Object.values(saved).includes("Quyên khai mâu thuẫn mmm"), "ghi chú phải được lưu vào ván");
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.getElementById("notebook").classList.contains("is-open"));
  });

  await run("sổ tay: chuyển qua mọi tab, nút tab giữ focus, nội dung dựng được", async () => {
    await page.click('[data-action="nb-toggle"]');
    await page.waitForSelector("#notebook.is-open");
    const tabs = await page.$$eval('#nb-body [data-action="nb-tab"]', (els) => els.map((e) => e.dataset.tab));
    assert.ok(tabs.includes("sus") && tabs.includes("ho") && tabs.includes("dd") && tabs.includes("tl"), `thiếu tab: ${tabs}`);
    for (const tab of [...tabs.filter((t) => t !== "ho"), "ho"]) {
      await page.click(`#nb-body [data-action="nb-tab"][data-tab="${tab}"]`);
      await page.waitForSelector(`#nb-body [data-action="nb-tab"][data-tab="${tab}"][aria-pressed="true"]`);
      const st = await page.evaluate(() => ({ tab: document.activeElement.dataset.tab, text: document.getElementById("nb-body").textContent.length }));
      assert.equal(st.tab, tab, `bấm tab ${tab} không được làm mất focus của nút`);
      assert.ok(st.text > 60, `tab ${tab} phải có nội dung`);
    }
    assert.ok(await page.locator("#nb-body .sus").count() === 0, "tab Hồ sơ không còn thẻ nghi phạm");
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.getElementById("notebook").classList.contains("is-open"));
  });

  await run("tải lại trang: ván đang chơi, đánh dấu và ghi chú được khôi phục", async () => {
    await page.reload();
    await page.waitForSelector('[data-action="nb-toggle"]', { timeout: 15000 });
    const found = await page.evaluate(() => Number(document.querySelector('[data-action="nb-toggle"] .tabnum').textContent));
    assert.equal(found, 1, "hồ sơ đã thu phải còn sau khi tải lại");
    await page.click('[data-action="nb-toggle"]');
    await page.waitForSelector("#notebook.is-open textarea[data-note]");
    assert.equal(await page.inputValue("textarea[data-note]"), "Quyên khai mâu thuẫn mmm");
    assert.equal(await page.locator(".clue .fav.on").count(), 1, "đánh dấu sao còn sau khi tải lại");
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
