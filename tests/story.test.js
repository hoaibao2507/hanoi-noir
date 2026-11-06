// Cốt truyện đầy đủ của từng vụ (stories.js): dữ liệu đủ, hiện ở màn thắng/thua, và có nút đọc lại ở thẻ vụ đã giải.
import { test } from "node:test";
import assert from "node:assert/strict";
import { CASES } from "../src/data/cases.js";
import { STORIES } from "../src/data/stories.js";
import * as T from "../src/ui/templates.js";

const idxOf = (id) => CASES.findIndex((c) => c.id === id);
const saveWith = (stars) => ({ unlocked: CASES.length, stars });

test("mọi vụ đều có cốt truyện: bắt đầu bằng một chương, đủ chương và mốc, mỗi mốc có at, title, text", () => {
  assert.deepEqual(Object.keys(STORIES).sort(), CASES.map((c) => c.id).sort(), "stories.js phải có đúng các vụ đang có");
  for (const c of CASES) {
    assert.ok(Array.isArray(c.story) && c.story.length, `${c.id}: thiếu cốt truyện`);
    assert.ok(c.story[0].part, `${c.id}: phải bắt đầu bằng một chương`);
    const parts = c.story.filter((e) => e.part);
    const beats = c.story.filter((e) => !e.part);
    assert.ok(parts.length >= 2, `${c.id}: ${parts.length} chương`);
    assert.ok(beats.length >= 10, `${c.id}: ${beats.length} mốc`);
    for (const e of beats) {
      assert.ok(e.at && e.title && e.text, `${c.id}: mốc ${e.title || e.at} thiếu trường`);
      assert.ok(!/[<>]/.test(`${e.at}${e.title}${e.text}`), `${c.id}: cốt truyện là chuỗi thuần, không chứa thẻ HTML`);
      assert.ok(e.text.length >= 60, `${c.id}: mốc “${e.title}” quá ngắn để kể chuyện`);
    }
    // Chương cuối kể phần điều tra và kết cục
    assert.ok(c.story.some((e) => e.at === "Kết cục"), `${c.id}: thiếu mốc “Kết cục”`);
  }
});

test("cốt truyện nhắc đúng các chi tiết then chốt của từng vụ", () => {
  const all = (id) => CASES.find((c) => c.id === id).story.map((e) => `${e.at} ${e.title || e.part} ${e.text || ""}`).join("\n");
  assert.match(all("s1"), /17 phút/);
  assert.match(all("s1"), /19:27–19:33/);
  assert.match(all("s2"), /Thái Bình Dương/);
  assert.match(all("s2"), /SMPL-0117/);
  assert.match(all("s3"), /21:51:07/);
  assert.match(all("s3"), /22:34/);
  assert.match(all("s4"), /22:47:12/);
  assert.match(all("s4"), /00:06:41/);
  assert.match(all("s4"), /0903 118 412/);
});

test("màn thắng và màn thua có khối gập “Đọc lại toàn bộ cốt truyện” chứa mọi mốc, và vẫn giữ phần lời giải", () => {
  for (const c of CASES) {
    const idx = idxOf(c.id);
    for (const html of [T.verdictWinHTML(c, idx, 0, saveWith({ [c.id]: 3 })), T.verdictLoseHTML(c, idx)]) {
      assert.match(html, /<details class="story-box">/);
      assert.match(html, /Đọc lại toàn bộ cốt truyện/);
      assert.equal((html.match(/class="story-beat"/g) || []).length, c.story.filter((e) => !e.part).length, `${c.id}: thiếu mốc trong khối cốt truyện`);
      assert.equal((html.match(/class="story-part"/g) || []).length, c.story.filter((e) => e.part).length);
      assert.ok(html.includes(c.explanation), `${c.id}: vẫn phải có phần lập luận`);
    }
  }
});

test("hộp thoại đọc lại cốt truyện có tiêu đề vụ, lời cảnh báo tiết lộ và nút đóng; mọi chuỗi được thoát HTML", () => {
  const c = CASES[idxOf("s4")];
  const html = T.storySheetHTML(c);
  assert.match(html, /Cốt truyện · Bốn Giây/);
  assert.match(html, /tiết lộ lời giải/);
  assert.match(html, /data-action="close"/);
  const evil = { ...c, title: "<b>x</b>", story: [{ part: "<i>chương</i>" }, { at: "1 & 2", title: "<script>", text: "a < b" }] };
  const h = T.storyHTML(evil);
  assert.doesNotMatch(h, /<script>|<i>chương/);
  assert.match(h, /&lt;script&gt;/);
  assert.match(h, /1 &amp; 2/);
  assert.equal(T.storyHTML({ story: [] }), "", "vụ chưa có cốt truyện thì không dựng khối rỗng");
});

test("menu chỉ hiện nút “Đọc lại cốt truyện” ở những vụ đã khép hồ sơ, và không lồng nút trong nút", () => {
  const none = T.menuHTML({ unlocked: CASES.length, stars: {} });
  assert.doesNotMatch(none, /data-action="story"/);
  const some = T.menuHTML(saveWith({ s1: 3, s4: 1 }));
  assert.equal((some.match(/data-action="story"/g) || []).length, 2);
  assert.match(some, new RegExp(`data-action="story" data-i="${idxOf("s1")}"`));
  assert.match(some, new RegExp(`data-action="story" data-i="${idxOf("s4")}"`));
  assert.doesNotMatch(some, new RegExp(`data-action="story" data-i="${idxOf("s2")}"`));
  // Số thẻ vụ không đổi; nút nằm ở khối .case-wrap, ngoài thẻ
  assert.equal((some.match(/class="case-card"/g) || []).length, CASES.length);
  assert.match(some, /<div class="case-wrap"><button class="case-card"/);
  for (const m of some.matchAll(/<button class="case-card"[\s\S]*?<\/button>/g)) assert.doesNotMatch(m[0], /data-action="story"/);
});
