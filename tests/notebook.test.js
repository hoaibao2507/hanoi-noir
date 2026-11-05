import { test } from "node:test";
import assert from "node:assert/strict";
import { CASES } from "../src/data/cases.js";
import { FX } from "./fixture.js";
import {
  newGame, performAct, MAX_NOTE, noteKey, setNote, toggleFav, fold, filterClues, overviewOf, remainingAt
} from "../src/game/rules.js";
import { overviewHTML, hudHTML } from "../src/ui/templates.js";
import { notebookHTML, clueListHTML, findCountText } from "./nbhtml.js";

const c1 = FX;
const s1 = CASES.find((c) => c.id === "s1");

// Vụ 1 đã làm vài việc: Khám tủ (vật chứng), Bà Lan (lời khai), Sổ ghi danh (hồ sơ), Quyên (lời khai)
const played = () => ["khamtu", "chia", "giod", "quyen"].reduce((g, id) => performAct(g, c1, id), newGame(0, c1));

/* ---------- Tìm kiếm ---------- */

test("fold bỏ dấu tiếng Việt, kể cả đ, và không phân biệt hoa thường", () => {
  assert.equal(fold("Quyên"), "quyen");
  assert.equal(fold("Đám giỗ · Hàng Đào"), "dam gio · hang dao");
  assert.equal(fold("ĐỖ"), "do");
});

test("filterClues: không lọc thì trả mọi hồ sơ đã thu, mới nhất trước", () => {
  const g = played();
  assert.deepEqual(filterClues(g, c1), ["quyen", "giod", "chia", "khamtu"]);
  assert.deepEqual(filterClues(g, c1, { q: "   " }), ["quyen", "giod", "chia", "khamtu"], "từ khóa toàn khoảng trắng coi như rỗng");
  assert.deepEqual(filterClues(newGame(0, c1), c1), []);
});

test("filterClues tìm không phân biệt dấu, theo tiêu đề, nội dung, loại và tên người khai", () => {
  const g = played();
  // Dữ liệu thật: lời khai Bà Lan cũng nhắc Quyên và đám giỗ, nên chỉ kiểm tra hồ sơ cần có và hồ sơ không thể có
  const byName = filterClues(g, c1, { q: "quyen" });
  assert.ok(byName.includes("quyen"), "gõ không dấu vẫn ra Quyên");
  assert.ok(!byName.includes("khamtu"));
  const byCase = filterClues(g, c1, { q: "GIỖ" });
  assert.ok(byCase.includes("giod"), "hoa thường và dấu đều bị bỏ qua");
  assert.ok(!byCase.includes("khamtu"));
  assert.ok(filterClues(g, c1, { q: "loi khai" }).includes("chia"), "tìm theo loại hồ sơ");
  assert.deepEqual(filterClues(g, c1, { q: "xyz-khong-co" }), []);
  // Hồ sơ lời khai tìm được theo tên người khai dù tiêu đề không nhắc tới họ
  const who = c1.actions.find((a) => a.id === "chia").visual.id;
  const name = c1.suspects.find((s) => s.id === who).name;
  assert.ok(filterClues(g, c1, { q: name }).includes("chia"));
});

test("filterClues: nhiều từ thì hồ sơ phải có đủ mọi từ", () => {
  const g = played();
  assert.deepEqual(filterClues(g, c1, { q: "so ghi" }), ["giod"]);
  assert.deepEqual(filterClues(g, c1, { q: "so quyen" }), [], "mỗi từ có ở một hồ sơ khác nhau thì không khớp");
});

test("filterClues lọc theo loại và theo đánh dấu, và kết hợp được với từ khóa", () => {
  let g = played();
  assert.deepEqual(filterClues(g, c1, { type: "Lời khai" }), ["quyen", "chia"]);
  assert.deepEqual(filterClues(g, c1, { type: "Vật chứng" }), ["khamtu"]);
  g = toggleFav(toggleFav(g, "khamtu"), "chia");
  assert.deepEqual(filterClues(g, c1, { fav: true }), ["chia", "khamtu"]);
  assert.deepEqual(filterClues(g, c1, { fav: true, type: "Lời khai" }), ["chia"]);
  assert.deepEqual(filterClues(g, c1, { fav: true, q: "tu kinh" }), ["khamtu"]);
});

test("ghi chú của người chơi cũng tìm được", () => {
  let g = played();
  assert.deepEqual(filterClues(g, c1, { q: "bao-hiem" }), []);
  g = setNote(g, noteKey("a", "giod"), "Nhớ hỏi lại chuyện BẢO-HIỂM");
  assert.deepEqual(filterClues(g, c1, { q: "bao-hiem" }), ["giod"]);
});

/* ---------- Ghi chú và đánh dấu ---------- */

test("setNote ghi, sửa, xóa ghi chú và không sửa trạng thái gốc", () => {
  const g0 = newGame(0, c1);
  const k = noteKey("s", "quyen");
  const g1 = setNote(g0, k, "Khai chậm hơn camera");
  assert.equal(g1.notes[k], "Khai chậm hơn camera");
  assert.deepEqual(g0.notes, {}, "trạng thái cũ không bị sửa");
  const g2 = setNote(g1, k, "Khai chậm hơn camera 10 phút");
  assert.equal(g2.notes[k], "Khai chậm hơn camera 10 phút");
  const g3 = setNote(g2, k, "  \n ");
  assert.equal(k in g3.notes, false, "chỉ còn khoảng trắng thì xóa ghi chú");
});

test("setNote không đổi gì thì trả đúng object cũ", () => {
  const g = setNote(newGame(0, c1), "a:khamtu", "đã xem");
  assert.equal(setNote(g, "a:khamtu", "đã xem"), g, "cùng nội dung");
  assert.equal(setNote(g, "a:khong-co", ""), g, "xóa ghi chú chưa từng có");
});

test("setNote giới hạn độ dài và giữ nguyên chữ gõ vào (kể cả xuống dòng đầu)", () => {
  const g = setNote(newGame(0, c1), "a:khamtu", "x".repeat(MAX_NOTE + 100));
  assert.equal(g.notes["a:khamtu"].length, MAX_NOTE);
  const h = setNote(newGame(0, c1), "a:khamtu", "\ndòng hai");
  assert.equal(h.notes["a:khamtu"], "\ndòng hai");
});

test("mã nghi phạm và mã hồ sơ trùng nhau cũng không đè ghi chú của nhau", () => {
  assert.notEqual(noteKey("s", "x"), noteKey("a", "x"));
  for (const c of CASES) {
    const ids = new Set(c.actions.map((a) => a.id));
    // Không bắt buộc, nhưng nếu có trùng thì tiền tố phải cứu được: hai khóa vẫn khác nhau
    for (const s of c.suspects) if (ids.has(s.id)) assert.notEqual(noteKey("s", s.id), noteKey("a", s.id));
  }
});

test("toggleFav chỉ đánh dấu hồ sơ đã thu, bật rồi tắt được", () => {
  const g = played();
  assert.equal(toggleFav(g, "camera"), g, "chưa thu thì không đánh dấu");
  const on = toggleFav(g, "khamtu");
  assert.equal(on.fav.khamtu, true);
  const off = toggleFav(on, "khamtu");
  assert.equal("khamtu" in off.fav, false);
  assert.deepEqual(g.fav, {}, "trạng thái cũ không bị sửa");
});

test("ván lưu cũ chưa có fav và notes vẫn dùng được các hàm mới", () => {
  const old = { ...played() };
  delete old.fav;
  delete old.notes;
  assert.equal(setNote(old, "a:khamtu", "ghi").notes["a:khamtu"], "ghi");
  assert.equal(toggleFav(old, "khamtu").fav.khamtu, true);
  assert.equal(filterClues(old, c1, { fav: true }).length, 0);
  assert.ok(filterClues(old, c1, { q: "quyen" }).includes("quyen"));
  assert.ok(notebookHTML({ ...old, tab: "ho" }, c1, {}).includes("data-find"));
});

test("newGame có sẵn fav và notes rỗng", () => {
  const g = newGame(0, c1);
  assert.deepEqual(g.fav, {});
  assert.deepEqual(g.notes, {});
});

/* ---------- Tổng quan địa điểm ---------- */

test("overviewOf: mỗi địa điểm một dòng, đúng nơi đang đứng, đếm khớp remainingAt", () => {
  const g = newGame(0, c1);
  const ov = overviewOf(g, c1);
  assert.equal(ov.length, c1.locations.length);
  assert.deepEqual(ov.map((r) => r.current), c1.locations.map((_, i) => i === 0));
  ov.forEach((r, i) => {
    assert.equal(r.name, c1.locations[i].name);
    assert.equal(r.left, remainingAt(g, c1, c1.locations[i]).length);
    assert.equal(r.done, 0);
    assert.equal(r.waiting, 0);
    assert.equal(r.wakeAt, null);
  });
});

test("overviewOf: làm một điểm thì nơi đó bớt một điểm còn lại và thêm một điểm đã làm", () => {
  const before = overviewOf(newGame(0, c1), c1);
  const after = overviewOf(performAct(newGame(0, c1), c1, "khamtu"), c1);
  assert.equal(after[0].left, before[0].left - 1);
  assert.equal(after[0].done, 1);
  assert.equal(after[1].left, before[1].left, "nơi khác không đổi");
  assert.equal(overviewOf({ ...newGame(0, c1), loc: 2 }, c1).findIndex((r) => r.current), 2);
});

test("overviewOf không đếm điểm còn bị khóa bởi một kết luận, nên không lộ điều chưa mở", () => {
  const g = newGame(CASES.indexOf(s1), s1);
  const phong = overviewOf(g, s1)[1];
  const L = s1.locations[1];
  assert.ok(L.hs.some(([id]) => id === "dvr_log"), "dvr_log nằm ở phòng bảo vệ");
  assert.equal(phong.left, L.hs.length - 1, "dvr_log bị khóa (gate) nên không tính");
});

test("overviewOf báo điểm đang chờ hồ sơ về muộn kèm mốc giờ sớm nhất", () => {
  const g = newGame(CASES.indexOf(s1), s1);
  const lab = overviewOf(g, s1)[5];
  assert.ok(lab.waiting >= 1, "cdr_tham về lúc 02:30");
  assert.equal(lab.wakeAt, "02:30");
  assert.equal(overviewOf(g, s1)[0].waiting, 0);
});

/* ---------- Giao diện ---------- */

test("tab Hồ sơ có ô tìm, chip loại, nút đánh dấu và ghi chú", () => {
  const g = { ...toggleFav(played(), "khamtu"), tab: "ho" };
  const html = notebookHTML(g, c1, { q: "", type: "", fav: false, open: new Set() });
  assert.ok(html.includes('data-find'));
  assert.ok(html.includes("Lời khai (2)"), "chip lọc theo loại kèm số hồ sơ");
  assert.ok(html.includes("Đã đánh dấu (1)"), "chip chỉ xem hồ sơ đã đánh dấu");
  assert.ok(html.includes('data-action="fav" data-id="khamtu"'));
  assert.ok(html.includes('aria-pressed="true" aria-label="Đánh dấu hồ sơ'), "hồ sơ đã đánh dấu báo aria-pressed");
  assert.ok(html.includes("note-add") && html.includes('aria-label="Thêm ghi chú cho'), "chưa có ghi chú thì chỉ có nút nhỏ");
  assert.ok(!html.includes("<textarea"));
});

test("hồ sơ đã có ghi chú, hoặc đang mở ô, thì hiện ô soạn với nội dung đúng", () => {
  const g = { ...setNote(played(), "a:khamtu", "Ổ khóa có vết xước"), tab: "ho" };
  const html = notebookHTML(g, c1, { open: new Set(["a:giod"]) });
  assert.ok(html.includes('data-note="a:khamtu"'));
  assert.ok(html.includes("Ổ khóa có vết xước"));
  assert.ok(html.includes('data-note="a:giod"'), "ô đang mở dù trống");
  // Preact đặt nội dung ghi chú đúng nguyên văn trong textarea, không cần dòng trống đầu như khi ghép chuỗi HTML
  assert.match(html, /data-note="a:khamtu"[^>]*>Ổ khóa/);
});

test("nội dung ghi chú và từ khóa được escape, không chèn được HTML", () => {
  const evil = `<img src=x onerror=alert(1)> "quote" </textarea><script>1</script>`;
  const g = { ...setNote(played(), "a:khamtu", evil), tab: "ho" };
  const html = notebookHTML(g, c1, { q: evil });
  assert.ok(!html.includes("<img src=x"));
  assert.ok(!html.includes("<script>1"));
  assert.ok(html.includes("&lt;img src=x"));
  assert.ok(html.includes("&lt;/textarea"), "không đóng được textarea để thoát ra ngoài");
});

test("danh sách lọc: hiện số hồ sơ khớp, và gợi ý xóa bộ lọc khi không có gì", () => {
  const g = played();
  assert.equal(findCountText(g, c1, {}), "4 hồ sơ");
  assert.equal(findCountText(g, c1, { type: "Lời khai" }), "Hiện 2/4 hồ sơ");
  const none = clueListHTML(g, c1, { q: "xyz-khong-co" });
  assert.ok(none.includes("Không có hồ sơ nào khớp"));
  assert.ok(none.includes("Xóa bộ lọc"));
  const some = clueListHTML(g, c1, { q: "so ghi" });
  assert.ok(some.includes("no-rise"), "đang lọc thì tắt hiệu ứng nổi lên");
  assert.equal(some.split("<article").length - 1, 1);
  assert.ok(!clueListHTML(g, c1, {}).includes("no-rise"), "không lọc thì giữ hiệu ứng");
});

test("chưa có hồ sơ nào thì tab Hồ sơ chỉ có lời nhắc, không có ô tìm", () => {
  const html = notebookHTML({ ...newGame(0, c1), tab: "ho" }, c1, {});
  assert.ok(html.includes("Chưa có hồ sơ nào"));
  assert.ok(!html.includes("data-find"));
});

test("tab Nghi phạm có ô ghi chú cho từng nghi phạm", () => {
  const g = setNote({ ...newGame(0, c1), tab: "sus" }, "s:quyen", "Nói dối về giờ về");
  const html = notebookHTML(g, c1, { open: new Set() });
  assert.ok(html.includes('data-note="s:quyen"'));
  assert.ok(html.includes("Nói dối về giờ về"));
  for (const s of c1.suspects) {
    if (s.id !== "quyen") assert.ok(html.includes(`aria-label="Thêm ghi chú cho ${s.name}"`), `${s.name} có nút Ghi chú`);
  }
});

test("tổng quan địa điểm: nơi đang đứng không phải nút, các nơi khác là nút đi tới", () => {
  const html = overviewHTML({ ...newGame(0, c1), loc: 1 }, c1);
  assert.ok(html.includes('aria-current="location"'));
  const goTargets = [...html.matchAll(/data-action="ov-go" data-loc="(\d+)"/g)].map((m) => Number(m[1]));
  assert.deepEqual(goTargets, c1.locations.map((_, i) => i).filter((i) => i !== 1));
  for (const L of c1.locations) assert.ok(html.includes(L.name.replace("&", "&amp;")));
});

test("tổng quan địa điểm nói rõ khi hết giờ, và hiện chờ hồ sơ về muộn ở vụ Sài Gòn", () => {
  const out = overviewHTML({ ...newGame(0, c1), hours: 0 }, c1);
  assert.ok(out.includes("hết giờ điều tra"));
  const sg = overviewHTML(newGame(CASES.indexOf(s1), s1), s1);
  assert.ok(sg.includes("chờ tới 02:30"));
});

test("nút Địa điểm có ở thanh điều khiển của mọi vụ, và tổng quan dựng được ở mọi vụ", () => {
  CASES.forEach((c, i) => {
    const g = newGame(i, c);
    assert.ok(hudHTML(g, c, c.locations[0]).includes('data-action="overview"'), c.id);
    const html = overviewHTML(g, c);
    assert.equal((html.match(/class="ov-row/g) || []).length, c.locations.length, c.id);
    assert.ok(notebookHTML({ ...g, tab: "ho" }, c, {}).length > 0, c.id);
  });
});
