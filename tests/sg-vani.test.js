/* Kiểm thử vụ s2 "Mực Chưa Khô" (Vani Ecommerce): múi giờ Thái Bình Dương, khung giờ bị hại, ngoại phạm, khóa mã, hồ sơ về muộn và lời giải. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { CASES, casesOf } from "../src/data/cases.js";
import {
  newGame, performAct, isOpen, isPending, waitFor, attemptLock, pickDeduce, tryDeduce, closeDeductions, gated,
  timelineEvents, alibisOf, judge, isGone, departed, clockAt, MAX_DEDUCE, performConfront, confrontOptions, nextStep
} from "../src/game/rules.js";
import { ART } from "../src/art/art.js";
import * as T from "../src/ui/templates.js";
import { notebookHTML } from "./nbhtml.js";

const idx = CASES.findIndex((c) => c.id === "s2");
const c = CASES[idx];
const act = (id) => c.actions.find((a) => a.id === id);
const withDone = (ids, extra = {}) => ({ ...newGame(idx, c), done: Object.fromEntries(ids.map((i) => [i, true])), found: [...ids], ...extra });
const at = (spent) => ({ ...newGame(idx, c), hours: c.budget - spent });

// Người chơi hoàn hảo: làm lần lượt, tự chờ hồ sơ về muộn, tự nhập mã, rút mọi kết luận sau mỗi bước
function play(ids, start = newGame(idx, c)) {
  let g = start;
  for (const id of ids) {
    if (isPending(g, c, id)) {
      const w = waitFor(g, c, id);
      assert.notEqual(w, g, `${id}: không đủ giờ để chờ (còn ${g.hours})`);
      g = w;
    }
    const a = act(id);
    const next = a.lock ? attemptLock(g, c, id, a.lock.code).game : performAct(g, c, id);
    assert.notEqual(next, g, `${id}: không làm được lúc ${clockAt(g, c)} (còn ${g.hours} giờ)`);
    g = closeDeductions(next, c);
  }
  return g;
}

test("vụ s2 thuộc vùng Sài Gòn, là vụ số 2, có Thắm, Vũ, Ngân, Trang cùng hai nhân vật do tác giả đặt", () => {
  assert.equal(c.region, "sg");
  assert.equal(c.no, 2);
  assert.deepEqual(casesOf("sg").map((x) => x.id), ["s1", "s2", "s3"]);
  const names = c.suspects.map((s) => s.name);
  for (const n of ["Vũ", "Ngân", "Thắm", "Trang"]) assert.ok(names.includes(n), `${n} phải có trong vụ`);
  assert.equal(c.suspects.length, 6);
  assert.equal(c.culprit, "vu");
  assert.match(c.place, /59 Võ Văn Hát, Long Trường/);
  assert.ok(c.suspects.every((s) => s.look && s.bio && s.role));
});

test("dữ liệu suy luận nhất quán: đầu vào và kết luận có thật, không trùng đầu vào, kết luận rút ra được từ hồ sơ gốc", () => {
  const ids = c.actions.map((a) => a.id);
  const seen = new Map();
  for (const d of c.deduce) {
    assert.ok(d.needs.length >= 2 && d.needs.length <= MAX_DEDUCE, `${d.gives}: cần 2–${MAX_DEDUCE} hồ sơ`);
    assert.equal(new Set(d.needs).size, d.needs.length);
    for (const n of d.needs) assert.ok(ids.includes(n), `${d.gives}: đầu vào ${n} không có`);
    assert.equal(act(d.gives).via, "deduce");
    assert.ok(!d.needs.includes(d.gives));
    const key = [...d.needs].sort().join("|");
    assert.ok(!seen.has(key), `${d.gives}: trùng đầu vào với ${seen.get(key)}`);
    seen.set(key, d.gives);
  }
  const given = new Set(c.deduce.map((d) => d.gives));
  for (const a of c.actions.filter((x) => x.via === "deduce")) {
    assert.ok(given.has(a.id), `${a.id}: kết luận không ai rút ra được`);
    assert.equal(a.type, "Kết luận");
    assert.equal(a.cost, 0);
    assert.ok(!/thủ phạm|hung thủ|kẻ giết/i.test(a.title), `${a.id}: tiêu đề kết luận không được kết tội`);
  }
  const roots = c.actions.filter((a) => !a.via || a.via === "confront").map((a) => a.id);
  const g = closeDeductions(withDone(roots), c);
  for (const d of c.deduce) assert.ok(g.done[d.gives], `${d.gives} không bao giờ rút ra được`);
});

test("đồ vật của vụ trỏ tới dữ liệu có thật: thiết bị, gate, khóa, diễn biến, chuỗi chứng minh", () => {
  const ids = c.actions.map((a) => a.id);
  for (const d of Object.values(c.devices)) {
    assert.equal(act(d.by).via, "deduce");
    assert.equal(d.off, 900, "Thái Bình Dương sau Việt Nam 15 giờ");
  }
  for (const a of c.actions) {
    for (const s of a.spans || []) if (s.dev) assert.ok(c.devices[s.dev]);
    if (a.gate) assert.ok(ids.includes(a.gate));
    if (a.lock) assert.match(a.lock.code, new RegExp(`^\\d{${a.lock.digits}}$`));
  }
  assert.ok(c.actions.some((a) => a.gate) && c.actions.some((a) => a.lock) && c.world.some((w) => w.kind === "arrive"));
  assert.deepEqual(c.chain.map((s) => s.key).sort(), ["means", "motive", "opportunity"]);
  for (const st of c.chain) for (const i of st.ids) assert.equal(act(i).via, "deduce", `${st.key}: chứng cứ của bước phải là kết luận`);
});

test("múi giờ: chưa hiệu chỉnh giữ nguyên giờ Thái Bình Dương; hiệu chỉnh xong thì cộng 15 giờ và khớp lời khai Vũ", () => {
  const raw = timelineEvents(withDone(["zoom_log"]), c).filter((e) => e.who === "vu");
  assert.deepEqual(raw.map((e) => [e.from, e.to, e.dev.fixed]), [["05:30", "05:35", false], ["06:07", "06:48", false]]);
  const g = closeDeductions(withDone(["zoom_log", "loi_vu"]), c);
  assert.ok(g.done.k_pst);
  const fixed = timelineEvents(g, c).filter((e) => e.clue === "zoom_log");
  assert.deepEqual(fixed.map((e) => [e.from, e.to]), [["20:30", "20:35"], ["21:07", "21:48"]]);
  // Hai lối cùng ra một kết luận; thư Amazon 05:12 PT khớp điện thoại ông Hiếu 20:12
  const g2 = closeDeductions(withDone(["br_report", "dt_hieu"]), c);
  assert.ok(g2.done.k_pst);
  assert.equal(timelineEvents(g2, c).find((e) => e.clue === "br_report").from, "20:12");
  assert.match(act("dt_hieu").text, /20:12/);
  assert.match(act("br_report").text, /05:12 AM PT/);
  // Khoảng Vũ vắng họp: 20:35–21:07 là 32 phút
  assert.match(act("k_zoom_gap").title, /32 phút/);
});

test("ngoại phạm: Vũ bị bác, Trang/Khoa/bác Sáu được xác nhận, Ngân và Thắm bị bác nhưng vì lời dối khác", () => {
  const stm = ["loi_vu", "loi_trang", "loi_khoa", "loi_sau", "loi_ngan", "loi_thap", "cam_cong", "cam_vp", "cam_nha_an", "cam_ngo", "grab_vu", "zoom_log"];
  const g = closeDeductions(withDone(stm), c);
  const st = (who) => alibisOf(g, c).find((a) => a.who === who).status;
  assert.equal(st("vu"), "clash");
  assert.equal(st("trang"), "proof");
  assert.equal(st("khoa"), "proof");
  assert.equal(st("sau"), "proof");
  assert.equal(st("ngan"), "clash", "Ngân ở văn phòng đến 21:03, không ở nhà");
  assert.equal(st("tham"), "clash", "Thắm rời nhà ăn ra hiên 20:59–21:08");
  // Trước khi đổi múi giờ, riêng báo cáo Zoom chưa bác được lời Vũ, nhưng chuyến xe đã bác
  assert.equal(alibisOf(withDone(["loi_vu", "zoom_log"]), c)[0].status, "open");
  assert.equal(alibisOf(withDone(["loi_vu", "grab_vu"]), c)[0].status, "clash");
});

test("khung giờ bị hại 20:44–21:15: chỉ Thắm có khoảng trống trong tòa nhà, và camera ngõ sau che trọn khoảng đó", () => {
  const g = closeDeductions(withDone(["phap_y", "cam_nha_an", "loi_khoa", "cam_vp", "cam_cong"]), c);
  assert.ok(g.done.k_khung_gio && g.done.k_vong_kin);
  assert.ok(closeDeductions(withDone(["phap_y", "cam_nha_an", "loi_thap"]), c).done.k_khung_gio, "lối thứ hai bằng lời Thắm");
  const ev = timelineEvents(closeDeductions(withDone(["cam_nha_an", "cam_ngo"]), c), c).filter((e) => e.who === "tham");
  assert.deepEqual(ev.map((e) => [e.from, e.to, e.at]), [
    ["20:30", "20:58", "Nhà ăn công nhân"], ["20:59", "21:08", "Hiên kho hàng (hẻm sau)"], ["21:09", "21:15", "Nhà ăn công nhân"]
  ]);
  assert.match(act("k_vong_kin").text, /20:58 đến 21:09/);
});

test("mã điện thoại ông Hiếu là ngày sinh của đứa chị: 03/09 lúc 23:58, không phải đứa em 04/09", () => {
  assert.match(act("khung_anh").text, /Ni \(chị\) — sinh 03\/09 lúc 23:58/);
  assert.match(act("khung_anh").text, /Vân \(em\) — sinh 04\/09 lúc 00:02/);
  assert.match(act("note_ma").text, /đứa chị, viết ngày rồi tháng/);
  assert.equal(act("dt_hieu").lock.code, "0309");
  assert.ok(c.locations.some((L) => L.hs.some((h) => h[0] === "note_ma" && h[4] === "soi")));
  const g0 = newGame(idx, c);
  assert.equal(attemptLock(g0, c, "dt_hieu", "0409").status, "wrong");
  assert.equal(attemptLock(g0, c, "dt_hieu", "0903").status, "wrong");
  assert.equal(attemptLock(g0, c, "dt_hieu", "0309").status, "open");
});

test("hồ sơ về muộn và cổng mở khóa", () => {
  const g0 = newGame(idx, c);
  for (const [id, h] of [["grab_vu", 2], ["zoom_log", 4], ["br_report", 6]]) {
    assert.ok(isPending(g0, c, id), `${id} chưa về lúc đầu`);
    assert.equal(performAct(g0, c, id), g0);
    assert.ok(waitFor(g0, c, id).hours <= g0.hours - h + 1);
  }
  assert.equal(gated(g0, c, "sao_ke_hang"), true);
  assert.equal(gated(closeDeductions(withDone(["br_report", "ho_so_vu"]), c), c, "sao_ke_hang"), false);
});

test("hồ sơ và nghi phạm không biến mất theo thời gian, dù đồng hồ đã chạy hết ngân sách giờ", () => {
  assert.ok((c.world || []).every((w) => w.kind === "arrive"), "chỉ còn diễn biến hồ sơ về muộn");
  for (const a of c.actions.filter((x) => !x.via)) {
    assert.equal(isGone(at(0), c, a.id), false, `${a.id}: mất ngay từ đầu`);
    assert.equal(isGone(at(c.budget), c, a.id), false, `${a.id}: mất theo thời gian`);
  }
  for (const s of c.suspects) assert.equal(departed(at(c.budget), c, s.id), false, `${s.id}: rời đi theo thời gian`);
  for (const id of ["hien_truong", "cam_ngo", "cam_nha_an", "thung_rac", "so_mau", "loi_trang"]) {
    assert.ok(isOpen(at(c.budget - 2), c, id), `${id}: vẫn làm được khi gần hết giờ`);
  }
});

// Lời giải ngắn nhất cho từng bước, và lối thứ hai độc lập
const PLAN = ["cam_ngo", "grab_vu", "thung_rac", "so_mau", "ho_so_vu", "br_report"];
const GOOD = { opportunity: "k_xe_den", means: "k_ao_mau", motive: "k_gian_hang_vu" };

test("lời giải ngắn nhất đi được, còn dư ít nhất 4 giờ, và buộc tội đúng thì thắng", () => {
  const g = play(PLAN);
  assert.ok(c.budget - g.hours <= c.budget - 4, `tốn ${c.budget - g.hours}/${c.budget} giờ`);
  for (const st of c.chain) assert.ok(st.ids.some((i) => g.done[i]), `${st.key}: chưa có chứng cứ`);
  assert.equal(judge(c, "vu", GOOD).win, true);
});

test("mỗi bước có ít nhất hai lối chứng cứ độc lập, đi được trong ngân sách", () => {
  const routes = {
    opportunity: [["cam_ngo", "grab_vu"], ["zoom_log", "loi_vu"]],
    means: [["thung_rac", "so_mau"], ["phap_y", "may_dtf2", "so_mau"]],
    motive: [["br_report", "ho_so_vu"], ["br_report", "ho_so_vu", "hop_dong_vu"], ["trang_thu_route"]]
  };
  for (const st of c.chain) {
    let ok = 0;
    for (const path of routes[st.key]) {
      if (path[0] === "trang_thu_route") {
        // Lối qua lời thú nhận của Trang: hỏi Trang, thu bản quyền, đưa chứng cứ, rồi ghép với thư Amazon
        let g = play(["loi_trang", "usco_trang"]);
        const g2 = performConfront(g, c, "trang", "usco_trang");
        if (g2 === g) continue;
        g = play(["br_report"], g2);
        if (st.ids.some((i) => g.done[i])) ok++;
        continue;
      }
      let g;
      try { g = play(path); } catch { continue; }
      if (st.ids.some((i) => g.done[i])) ok++;
    }
    assert.ok(ok >= 2, `${st.key}: chỉ ${ok} lối chứng cứ đi được`);
  }
});

test("buộc tội sai: nhầm người, nhầm chứng cứ sang bước khác, thiếu chứng cứ đều thua; người ngoài cuộc đều có hồ sơ độc lập loại trừ", () => {
  for (const who of ["ngan", "tham", "trang", "sau", "khoa"]) assert.equal(judge(c, who, GOOD).win, false, who);
  assert.equal(judge(c, "vu", { ...GOOD, means: "k_dong_co" }).win, false);
  assert.equal(judge(c, "vu", { ...GOOD, motive: "k_ao_mau" }).win, false);
  assert.equal(judge(c, "vu", { ...GOOD, opportunity: "grab_vu" }).win, false, "hồ sơ gốc không đủ làm chứng cứ");
  assert.equal(judge(c, "vu", { ...GOOD, opportunity: null }).win, false);
  const r = judge(c, "ngan", GOOD);
  assert.equal(r.right, false);
  assert.ok(r.steps.every((s) => s.ok), "đúng chứng cứ nhưng sai người vẫn thua");
  // Người ngoài cuộc bị loại bằng camera hoặc hồ sơ, không bằng lời khai của chính họ
  for (const ev of ["cam_vp", "cam_nha_an", "cam_cong", "cam_ngo"]) assert.equal(act(ev).type, "Camera");
});

test("đưa chứng cứ: Ngân, Thắm, Trang thú nhận chuyện riêng; Vũ chỉ phản ứng, không thú nhận", () => {
  const withStm = (who, clue) => {
    const g = play([`loi_${who === "tham" ? "thap" : who}`, clue]);
    return performConfront(g, c, who, clue);
  };
  for (const [who, clue, reveal] of [["ngan", "hoa_don_khong", "ngan_thu"], ["tham", "cam_ngo", "thap_thu"], ["trang", "usco_trang", "trang_thu"]]) {
    const g = withStm(who, clue);
    assert.ok(g.done[reveal], `${who}: phải thú nhận`);
  }
  const reveals = c.confront.filter((r) => r.who === "vu").map((r) => r.reveal);
  assert.ok(reveals.every((r) => !r), "Vũ không có lời thú nhận");
  assert.ok(c.confront.filter((r) => r.who === "vu").length >= 4, "Vũ có nhiều phản ứng khi bị đưa chứng cứ");
  const g = play(["loi_vu", "zoom_log"]);
  assert.ok(confrontOptions(g, c, "vu").includes("zoom_log"));
  const after = performConfront(g, c, "vu", "zoom_log");
  assert.notEqual(after, g);
  assert.equal(after.found.length, g.found.length, "phản ứng của Vũ không mở lời khai mới");
});

test("gợi ý đi được tới đủ chứng cứ", () => {
  let g = newGame(idx, c);
  for (let i = 0; i < 40; i++) {
    const st = nextStep(g, c);
    if (st.kind === "accuse") break;
    let n = g;
    if (st.kind === "go") n = closeDeductions(performAct(g, c, st.id), c);
    else if (st.kind === "wait") n = waitFor(g, c, st.id);
    else if (st.kind === "deduce") { for (const x of st.needs) g = pickDeduce(g, x); n = tryDeduce(g, c); }
    else if (st.kind === "confront") n = performConfront(g, c, st.who, st.clue);
    assert.notEqual(n, g, `gợi ý ${st.kind} ${st.id || ""} không đi được`);
    g = n;
  }
  assert.equal(nextStep(g, c).kind, "accuse");
  assert.ok(g.hours >= c.budget - 8);
});

test("giao diện vụ s2 dựng được: HUD, sổ tay mọi tab, chuỗi chứng minh, thắng; mọi cảnh và khung camera vẽ được", () => {
  let g = play(PLAN);
  assert.match(T.hudHTML(g, c, c.locations[0]), /Sài Gòn · Vụ 2/);
  for (const tab of ["sus", "ho", "dd", "tl"]) assert.ok(notebookHTML({ ...g, tab }, c).length > 200, tab);
  assert.match(notebookHTML({ ...g, tab: "tl" }, c), /đã hiệu chỉnh|chưa hiệu chỉnh|Thái Bình Dương/);
  const raw = notebookHTML({ ...withDone(["zoom_log"]), tab: "tl" }, c);
  assert.match(raw, /chưa hiệu chỉnh/);
  const fixed = notebookHTML({ ...closeDeductions(withDone(["zoom_log", "loi_vu"]), c), tab: "tl" }, c);
  assert.match(fixed, /giờ thật = giờ máy \+ 15 giờ/);
  assert.match(T.accuseHTML(g, c, { culprit: null, steps: {} }), /Cơ hội/);
  for (const L of c.locations) {
    const svg = ART.scene(L.scene, []);
    assert.ok(svg.includes("<svg") && svg.length > 2000, `${L.scene} phải vẽ được`);
  }
  for (const a of c.actions) if (a.visual && a.visual.k !== "who") assert.ok(ART.evidence(a.visual).includes("<svg"), `${a.id}: hình minh họa`);
});
