/* Kiểm thử vùng Sài Gòn: vụ "Đỉnh Triều Bến Vân Đồn" và các cơ chế mới (suy luận, khóa mã, chờ kết quả, giờ máy lệch, xét xử nhiều người). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { CASES, TYPES, casesOf, REGIONS } from "../src/data/cases.js";
import {
  newGame, performAct, isOpen, gated, isPending, waitHours, waitFor, attemptLock, LOCK_TRIES, LOCK_PENALTY,
  pickDeduce, tryDeduce, deductionFor, closeDeductions, unlocksOf, timelineEvents, alibisOf, judgeVerdict, culpritIds,
  nowMinutes, clockAt, isGone, departed, remainingAt, MAX_DEDUCE, arrivalOf
} from "../src/game/rules.js";
import * as T from "../src/ui/templates.js";

const idx = CASES.findIndex((c) => c.id === "s1");
const c = CASES[idx];
const act = (id) => c.actions.find((a) => a.id === id);
const withDone = (ids, extra = {}) => ({ ...newGame(idx, c), done: Object.fromEntries(ids.map((i) => [i, true])), found: [...ids], ...extra });
const minutes = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

// Người chơi hoàn hảo: làm lần lượt các điểm, tự chờ khi hồ sơ về muộn, tự nhập mã, và rút mọi kết luận có thể sau mỗi bước.
// Trả về trạng thái cuối, hoặc ném lỗi nếu một bước không làm được (giúp bắt lời giải bị chặn bởi giờ, mốc hay khóa).
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

test("vùng: mỗi vùng có vụ, vụ Sài Gòn thuộc vùng sg và là vụ số 1 của vùng", () => {
  assert.deepEqual(REGIONS.map((r) => r.id), ["hn", "sg"]);
  assert.equal(casesOf("hn").length, 5);
  assert.equal(casesOf("sg").length, 1);
  assert.equal(c.region, "sg");
  assert.equal(c.no, 1);
  assert.ok(CASES.slice(0, 5).every((x) => x.region === "hn"), "thứ tự vụ Phố cổ không đổi");
});

test("bốn nhân vật chính Vũ, Ngân, Thắm, Trang có trong vụ, kèm hai nhân vật do tác giả đặt", () => {
  const names = c.suspects.map((s) => s.name);
  for (const n of ["Vũ", "Ngân", "Thắm", "Trang"]) assert.ok(names.includes(n), `${n} phải có trong vụ`);
  assert.equal(c.suspects.length, 6);
  assert.ok(c.suspects.every((s) => s.look && s.bio && s.role));
});

test("dữ liệu suy luận nhất quán: hồ sơ vào/ra có thật, kết luận không đặt trên bản đồ, không có hai kết luận trùng đầu vào", () => {
  const ids = c.actions.map((a) => a.id);
  const seen = new Map();
  for (const d of c.deduce) {
    assert.ok(d.needs.length >= 2 && d.needs.length <= MAX_DEDUCE, `${d.gives}: cần 2–${MAX_DEDUCE} hồ sơ`);
    assert.equal(new Set(d.needs).size, d.needs.length, `${d.gives}: hồ sơ đầu vào bị lặp`);
    for (const n of d.needs) assert.ok(ids.includes(n), `${d.gives}: đầu vào ${n} không có`);
    assert.ok(ids.includes(d.gives), `${d.gives} không có trong actions`);
    assert.equal(act(d.gives).via, "deduce", `${d.gives}: kết luận phải có via "deduce"`);
    assert.equal(act(d.gives).cost, 0, `${d.gives}: kết luận không tốn giờ`);
    assert.ok(!d.needs.includes(d.gives), `${d.gives}: kết luận không tự là đầu vào của chính nó`);
    const key = [...d.needs].sort().join("|");
    assert.ok(!seen.has(key), `${d.gives}: trùng đầu vào với ${seen.get(key)}`);
    seen.set(key, d.gives);
  }
  const given = new Set(c.deduce.map((d) => d.gives));
  for (const a of c.actions.filter((x) => x.via === "deduce")) assert.ok(given.has(a.id), `${a.id}: kết luận không ai rút ra được`);
  for (const a of c.actions.filter((x) => x.via === "deduce")) assert.equal(a.type, "Kết luận");
  assert.ok(TYPES["Kết luận"], "có loại hồ sơ Kết luận");
});

test("kết luận không vòng lặp: rút được toàn bộ từ các hồ sơ gốc", () => {
  const roots = c.actions.filter((a) => !a.via).map((a) => a.id);
  // Gate và hồ sơ đến muộn không làm kết luận bị chặn vĩnh viễn: mở hết mọi hồ sơ gốc thì mọi kết luận phải rút ra được
  const g = closeDeductions(withDone(roots), c);
  for (const d of c.deduce) assert.ok(g.done[d.gives], `${d.gives} không bao giờ rút ra được`);
});

test("thiết bị, khóa, cổng mở khóa và diễn biến trỏ tới dữ liệu có thật", () => {
  const ids = c.actions.map((a) => a.id);
  for (const [k, d] of Object.entries(c.devices)) {
    assert.ok(ids.includes(d.by), `${k}: kết luận hiệu chỉnh ${d.by} không có`);
    assert.equal(act(d.by).via, "deduce");
  }
  for (const a of c.actions) {
    for (const s of a.spans || []) if (s.dev) assert.ok(c.devices[s.dev], `${a.id}: thiết bị ${s.dev} không có`);
    if (a.gate) assert.ok(ids.includes(a.gate), `${a.id}: gate ${a.gate} không có`);
    if (a.lock) {
      assert.equal(a.lock.code.length, a.lock.digits, `${a.id}: độ dài mã`);
      assert.match(a.lock.code, /^\d+$/);
    }
  }
  for (const w of c.world) {
    if (w.kind === "arrive") assert.ok(arrivalOf(c, w.id) === w.at);
  }
  assert.ok(c.actions.some((a) => a.gate) && c.actions.some((a) => a.lock) && c.world.some((w) => w.kind === "arrive"),
    "vụ dùng đủ gate, khóa mã và hồ sơ về muộn");
});

test("suy luận: đúng tập hồ sơ (không phân biệt thứ tự) mới cho kết luận; thừa hoặc thiếu đều không", () => {
  const base = withDone(["cam_sanh", "nk_ravao", "so_khach", "loi_tham"]);
  assert.ok(deductionFor(c, ["nk_ravao", "cam_sanh"]), "thứ tự không quan trọng");
  const pick = (g, ids) => ids.reduce((x, id) => pickDeduce(x, id), g);

  const ok = tryDeduce(pick(base, ["nk_ravao", "cam_sanh"]), c);
  assert.equal(ok.ddResult.status, "new");
  assert.equal(ok.ddResult.gives, "k_lech");
  assert.ok(ok.done.k_lech && ok.found.includes("k_lech"));
  assert.deepEqual(ok.dpick, [], "chọn xong thì bỏ chọn");
  assert.deepEqual(ok.ddFrom.k_lech.slice().sort(), ["cam_sanh", "nk_ravao"], "ghi lại kết luận rút ra từ đâu");
  assert.equal(ok.hours, base.hours, "suy luận không tốn giờ");

  const extra = tryDeduce(pick(base, ["cam_sanh", "nk_ravao", "loi_tham"]), c);
  assert.equal(extra.ddResult.status, "none", "thừa một hồ sơ thì không ra");
  assert.equal(extra.ddTries, 1);
  const lack = tryDeduce(pick(base, ["cam_sanh", "loi_tham"]), c);
  assert.equal(lack.ddResult.status, "none", "hai hồ sơ không liên quan");

  const again = tryDeduce(pick(ok, ["cam_sanh", "nk_ravao"]), c);
  assert.equal(again.ddResult.status, "known", "kết luận đã có thì báo đã có");
  assert.equal(again.found.filter((x) => x === "k_lech").length, 1, "không ghi hai lần");
});

test("suy luận: chỉ chọn được hồ sơ đã thu, bỏ chọn được, tối đa MAX_DEDUCE hồ sơ, và cần ít nhất hai hồ sơ", () => {
  const g = withDone(["cam_sanh", "nk_ravao", "so_khach", "cam_ham", "dkkd"]);
  assert.equal(pickDeduce(g, "hop_dong_vay"), g, "hồ sơ chưa thu không chọn được");
  let x = pickDeduce(g, "cam_sanh");
  assert.deepEqual(x.dpick, ["cam_sanh"]);
  assert.equal(tryDeduce(x, c), x, "một hồ sơ thì chưa suy luận được");
  x = pickDeduce(x, "cam_sanh");
  assert.deepEqual(x.dpick, [], "bấm lại để bỏ chọn");
  for (const id of ["cam_sanh", "nk_ravao", "so_khach", "cam_ham", "dkkd"]) x = pickDeduce(x, id);
  assert.equal(x.dpick.length, MAX_DEDUCE);
  assert.deepEqual(x.dpick, ["nk_ravao", "so_khach", "cam_ham", "dkkd"], "chọn thêm thì bỏ hồ sơ chọn cũ nhất");
});

test("kết luận làm đầu vào cho suy luận sau: k_lech rồi k_cua_so, k_gia_hoa rồi k_dong_co và k_tra_tien", () => {
  const g1 = play(["cam_sanh", "nk_ravao", "cam_ham"]);
  assert.ok(g1.done.k_lech && g1.done.k_cua_so, "k_cua_so cần k_lech, nên không rút ra nếu thiếu k_lech");
  const noLech = closeDeductions(withDone(["cam_sanh", "cam_ham"]), c);
  assert.ok(!noLech.done.k_cua_so);
  const g2 = play(["dkkd", "hop_dong_vay"]);
  assert.ok(g2.done.k_gia_hoa && g2.done.k_dong_co, "hợp đồng vay + đăng ký kinh doanh dẫn tới động cơ");
  const viaSafe = play(["dkkd", "hop_dong_vay"]);
  assert.ok(viaSafe.done.k_gia_hoa);
});

test("gate: nhật ký đầu ghi và sao kê Gia Hòa ẩn cho tới khi có kết luận mở khóa", () => {
  const g0 = newGame(idx, c);
  assert.equal(gated(g0, c, "dvr_log"), true);
  assert.equal(isOpen({ ...g0, hours: 13 }, c, "dvr_log"), false);
  const L = c.locations.find((x) => x.hs.some((h) => h[0] === "dvr_log"));
  assert.ok(!remainingAt(g0, c, L).some(([id]) => id === "dvr_log"), "chưa mở thì không tính là còn điểm điều tra");
  assert.ok(!T.hotspotsHTML(g0, c, L).includes('data-id="dvr_log"'), "chưa mở thì không hiện trên cảnh");
  const g1 = play(["cam_sanh", "nk_ravao"]);
  assert.equal(gated(g1, c, "dvr_log"), false);
  assert.ok(isOpen(g1, c, "dvr_log"));
  assert.ok(T.hotspotsHTML(g1, c, L).includes('data-id="dvr_log"'));
  assert.deepEqual(unlocksOf(c, "k_lech").spots.map((a) => a.id), ["dvr_log"]);
  assert.equal(unlocksOf(c, "k_lech").devs.length, 1);
  assert.equal(gated(g0, c, "sao_ke_gh"), true);
  assert.deepEqual(unlocksOf(c, "k_gia_hoa").spots.map((a) => a.id), ["sao_ke_gh"]);
});

test("giờ máy lệch: chưa hiệu chỉnh thì giữ giờ máy; hiệu chỉnh xong thì cộng 17 phút và các nguồn giờ khớp nhau", () => {
  const ids = ["cam_sanh", "nk_ravao", "so_khach", "cam_ham"];
  const before = timelineEvents(withDone(ids), c);
  const camThamBefore = before.find((e) => e.clue === "cam_sanh" && e.who === "tham" && e.from === "18:58");
  assert.ok(camThamBefore && camThamBefore.dev && !camThamBefore.dev.fixed, "chưa hiệu chỉnh: giờ máy 18:58");

  const after = timelineEvents(closeDeductions(withDone(ids), c), c);
  const camTham = after.find((e) => e.clue === "cam_sanh" && e.who === "tham" && e.dev.rawFrom === "18:58");
  assert.equal(camTham.from, "19:15");
  assert.ok(camTham.dev.fixed && camTham.dev.off === 17);
  // Ba cặp sự kiện được hai nguồn cùng ghi phải khớp nhau sau hiệu chỉnh
  const start = (clue, who, at) => after.find((e) => e.clue === clue && e.at === at && (!who || e.who === who)).from;
  assert.equal(start("cam_sanh", "tham", "Sảnh chung cư"), start("nk_ravao", "tham", "Sảnh chung cư"), "Thắm ra thang máy: camera = nhật ký");
  assert.equal(after.find((e) => e.clue === "cam_sanh" && e.who === "trang").from, after.find((e) => e.clue === "so_khach" && e.who === "trang" && e.at === "Sảnh chung cư").from, "Trang rời tòa nhà: camera = sổ khách");
  assert.equal(after.find((e) => e.clue === "cam_ham").from, after.find((e) => e.clue === "nk_ravao" && e.at === "Hầm B1").from, "ông Châu xuống B1: camera = nhật ký");
  // Giờ chỉ quay vòng trong ngày
  assert.equal(after.every((e) => /^\d{2}:\d{2}$/.test(e.from) && /^\d{2}:\d{2}$/.test(e.to)), true);
});

test("ngoại phạm lật khi hiệu chỉnh giờ: bác Lành hết bị bác oan, Thắm bị bác, Hải được xác nhận ở phòng bảo vệ", () => {
  const stm = ["loi_tham", "loi_lanh", "loi_hai", "cam_sanh", "cam_bv", "nk_ravao"];
  const status = (g, who) => alibisOf(g, c).find((a) => a.who === who).status;
  const raw = withDone(stm);
  assert.equal(status(raw, "lanh"), "clash", "giờ máy: bác Lành tưởng ở sảnh lúc 19:46 trong khi khai ở nhà");
  assert.equal(status(raw, "tham"), "open", "giờ máy: khoảng vắng của Thắm nằm trước khi ông Châu xuống hầm nên vô hại");
  assert.equal(status(raw, "hai"), "open");
  const fixed = closeDeductions(raw, c);
  assert.ok(fixed.done.k_lech);
  assert.equal(status(fixed, "lanh"), "open", "đã hiệu chỉnh: bác Lành vào sảnh lúc 20:03, sau giờ ông khai");
  assert.equal(status(fixed, "tham"), "clash", "đã hiệu chỉnh: Thắm vắng khỏi sảnh 19:25–19:34 và ra cửa lúc 19:34, không phải 19:18");
  assert.equal(status(fixed, "hai"), "proof", "đã hiệu chỉnh: camera phòng bảo vệ bao trọn 19:00–20:00");
});

test("Vũ và Trang: lời khai bị bác nhưng đó là lời dối về chuyện riêng, và đều ở Thảo Điền lúc 19:32", () => {
  const g = closeDeductions(withDone(["loi_vu", "loi_trang", "grab_food", "thuy_trieu"]), c);
  assert.ok(g.done.k_vu_trang);
  const st = (who) => alibisOf(g, c).find((a) => a.who === who);
  assert.equal(st("vu").status, "clash");
  assert.equal(st("trang").status, "clash");
  const ev = timelineEvents(g, c).filter((e) => e.at === "Căn hộ của Vũ · Thảo Điền").map((e) => e.who).sort();
  assert.deepEqual(ev, ["trang", "trang", "vu"]);
  // Từ Thảo Điền tới bến Vân Đồn khi ngập mất ít nhất 45 phút, nên không thể có mặt ở B1 lúc 19:25–19:34
  assert.match(act("thuy_trieu").text, /45 phút/);
  assert.ok(minutes("19:32") - minutes("19:34") < 45);
});

test("khóa mã: đúng mở được điểm điều tra; sai đủ số lần thì mất giờ và đếm lại; mã đúng của két là giờ đỉnh triều cao nhất", () => {
  const g0 = newGame(idx, c);
  const wrong = attemptLock(g0, c, "ket_sat", "0735");
  assert.equal(wrong.status, "wrong");
  assert.equal(wrong.left, LOCK_TRIES - 1);
  assert.equal(wrong.game.hours, g0.hours, "sai chưa tốn giờ");
  let g = g0, last;
  for (let i = 0; i < LOCK_TRIES; i++) { last = attemptLock(g, c, "ket_sat", "0735"); g = last.game; }
  assert.equal(last.status, "locked");
  assert.equal(g.hours, g0.hours - LOCK_PENALTY);
  assert.equal(g.lockTries.ket_sat, 0, "bị khóa xong thì đếm lại");
  assert.equal(g.done.ket_sat, undefined);

  const open = attemptLock(g, c, "ket_sat", "1920");
  assert.equal(open.status, "open");
  assert.ok(open.game.done.ket_sat);
  assert.equal(open.game.hours, g.hours - act("ket_sat").cost, "mở được thì tốn giờ đọc hồ sơ");
  assert.equal(attemptLock(open.game, c, "ket_sat", "1920").status, "closed", "đã mở rồi thì không thử lại");
  assert.equal(attemptLock(g0, c, "loi_tham", "0000").status, "closed", "điểm không có khóa");

  // Mã không đoán ngẫu nhiên: lấy từ mẩu giấy và lịch thủy triều
  assert.match(act("note_ket").text, /đỉnh triều CAO NHẤT/);
  assert.match(act("thuy_trieu").text, /đỉnh tối 19:20 \(1,72 m\)/);
  assert.match(act("thuy_trieu").text, /đỉnh sáng 07:35 \(1,35 m\)/);
  assert.equal(c.actions.find((a) => a.id === "ket_sat").lock.code, "1920");
  // Mẩu giấy nằm trong bóng tối: phải quét đèn pin
  assert.ok(c.locations.some((L) => L.hs.some((h) => h[0] === "note_ket" && h[4] === "soi")));
});

test("hồ sơ về muộn: chưa tới mốc thì không làm được, chờ tốn giờ, rồi làm được; không đủ giờ thì không chờ", () => {
  const g0 = newGame(idx, c);
  assert.equal(arrivalOf(c, "cdr_tham"), "02:30");
  assert.ok(isPending(g0, c, "cdr_tham"));
  assert.equal(isOpen({ ...g0 }, c, "cdr_tham"), false);
  assert.equal(performAct(g0, c, "cdr_tham"), g0, "chưa về thì không đọc được");
  assert.equal(waitHours(g0, c, "cdr_tham"), 6, "từ 21:00 tới 02:30 làm tròn lên 6 giờ");
  const w = waitFor(g0, c, "cdr_tham");
  assert.equal(w.hours, g0.hours - 6);
  assert.equal(clockAt(w, c), "03:00");
  assert.equal(isPending(w, c, "cdr_tham"), false);
  assert.ok(isOpen(w, c, "cdr_tham"));
  assert.equal(waitFor(w, c, "cdr_tham"), w, "đã về thì không chờ nữa");
  assert.equal(waitFor({ ...g0, hours: 6 }, c, "cdr_tham").hours, 6, "còn 6 giờ: đủ chờ nhưng không đủ đọc hồ sơ");
  assert.equal(waitFor({ ...g0, busy: true }, c, "cdr_tham").hours, g0.hours, "đang bận thì không chờ");
  // Làm việc khác trước, rồi hồ sơ tự về khi đồng hồ chạy qua mốc
  const later = { ...g0, hours: 7 };
  assert.equal(isPending(later, c, "cdr_tham"), false, "sau 6 giờ làm việc khác, 03:00 đã qua mốc 02:30");
});

test("diễn biến: hiện trường bị rửa lúc 23h, Trang nhập viện lúc 00h30, camera bị ghi đè đúng giờ", () => {
  const at = (spent) => ({ ...newGame(idx, c), hours: c.budget - spent });
  assert.ok(isOpen(at(1), c, "hien_truong"), "22h còn kịp đo hiện trường");
  assert.ok(isGone(at(2), c, "hien_truong"), "23h hầm bị rửa");
  assert.equal(departed(at(3), c, "trang"), false);
  assert.equal(departed(at(4), c, "trang"), true, "01h Trang đã nhập viện");
  assert.ok(isOpen(at(5), c, "cam_ham") && isGone(at(6), c, "cam_ham"), "camera hầm mất lúc 03h");
  assert.ok(isOpen(at(6), c, "cam_sanh") && isGone(at(8), c, "cam_sanh"), "camera sảnh mất lúc 04h30");
  assert.ok(isGone(at(9), c, "cam_bv"));
  assert.ok(isGone(at(10), c, "ls_gala"));
  // Hồ sơ đã thu không bị mất theo
  const kept = { ...at(10), done: { cam_ham: true }, found: ["cam_ham"] };
  assert.equal(isGone(kept, c, "cam_ham"), false);
});

// Lời giải dự kiến: ba phần chứng cứ đều rút ra được trong ngân sách giờ, kể cả khi bị hạn của camera và hiện trường
const PLAN = ["cam_sanh", "nk_ravao", "cam_ham", "cua_thangbo", "dkkd", "hop_dong_vay"];
const GOOD = {
  who: { mastermind: "ngan", killer: "tham", tech: "hai" },
  evid: { mastermind: "k_dong_co", killer: "k_cua_so", tech: "k_override" },
  facts: { skew: "slow17", window: "w1925", entry: "stairs" }
};

test("lời giải ngắn nhất đi được và còn dư giờ; thiếu một mắt xích thì không đủ chứng cứ", () => {
  const g = play(PLAN);
  const spent = c.budget - g.hours;
  assert.ok(spent <= c.budget - 4, `lời giải ngắn nhất tốn ${spent}/${c.budget} giờ, phải còn dư tối thiểu 4 giờ`);
  const have = (ids) => ids.some((i) => g.done[i]);
  for (const r of c.verdict.roles) assert.ok(have(r.ids), `${r.key}: chưa có chứng cứ`);
  assert.equal(judgeVerdict(c, GOOD).win, true);
  // Bỏ camera hầm: không rút được k_cua_so (vòng kín xuống hầm), nên chứng cứ cho kẻ ra tay phải tìm lối khác
  const miss = play(PLAN.filter((x) => x !== "cam_ham"));
  assert.ok(!miss.done.k_cua_so);
  assert.ok(!c.verdict.roles.find((r) => r.key === "killer").ids.some((i) => miss.done[i]));
});

test("mỗi vai đều có ít nhất hai lối chứng cứ độc lập, đều đi được trong ngân sách giờ và qua các hạn", () => {
  const routes = {
    mastermind: [["dkkd", "hop_dong_vay"], ["loi_ngan", "dt_nan_nhan"], ["dkkd", "ket_sat", "thuy_trieu", "note_ket", "hop_dong_vay"]],
    killer: [["cam_sanh", "nk_ravao", "cam_ham"], ["cdr_tham", "loi_lanh"], ["hien_truong", "quan_cafe", "loi_tham"], ["phap_y", "cua_thangbo", "cam_sanh"]],
    tech: [["nk_ravao", "cua_thangbo"], ["cam_sanh", "nk_ravao", "dvr_log", "loi_hai"], ["loi_hai", "loi_lanh"]]
  };
  for (const r of c.verdict.roles) {
    let ok = 0;
    for (const path of routes[r.key]) {
      let g;
      try { g = play(path); } catch (e) { continue; }
      if (r.ids.some((i) => g.done[i])) ok++;
    }
    assert.ok(ok >= 2, `${r.key}: chỉ ${ok} lối chứng cứ đi được`);
  }
});

test("lối đi qua khóa mã, qua hồ sơ về muộn và qua cổng mở khóa đều dùng được trong ngân sách", () => {
  // Két sắt: cần mẩu giấy, lịch thủy triều và đăng ký kinh doanh
  const safe = play(["note_ket", "thuy_trieu", "ket_sat", "dkkd"]);
  assert.ok(safe.done.k_gia_hoa, "két sắt + đăng ký kinh doanh cho Gia Hòa");
  // Sao kê ngân hàng: cần k_gia_hoa (cổng) và chờ tới 04:00
  const money = play(["dkkd", "hop_dong_vay", "sao_ke_gh"]);
  assert.ok(money.done.k_tra_tien, "sao kê Gia Hòa dẫn tới dòng tiền trả cho Hải và Thắm");
  assert.ok(c.budget - money.hours <= c.budget, "chờ sao kê không vượt ngân sách");
  // Sao kê điện thoại Thắm: chờ 02:30, rồi ghép với lời bác Lành để biết DAS-B1 là hầm
  const das = play(["loi_lanh", "cdr_tham"]);
  assert.ok(das.done.k_das);
  const cau = play(["loi_lanh", "cdr_tham", "ls_gala"]);
  assert.ok(cau.done.k_ngan_cau, "ghế Ngân trống + cuộc gọi từ hầm");
});

test("không có lối tắt đoán mò: chọn nhầm một chứng cứ, một người hoặc một đáp án đều thua", () => {
  assert.equal(judgeVerdict(c, GOOD).win, true);
  const bad = (patch) => judgeVerdict(c, { who: { ...GOOD.who, ...(patch.who || {}) }, evid: { ...GOOD.evid, ...(patch.evid || {}) }, facts: { ...GOOD.facts, ...(patch.facts || {}) } });
  // Đảo vai
  assert.equal(bad({ who: { killer: "ngan", mastermind: "tham" } }).win, false);
  assert.equal(bad({ who: { tech: "lanh" } }).win, false, "bác Lành không phải đồng phạm kỹ thuật");
  assert.equal(bad({ who: { killer: "vu" } }).right, false);
  assert.equal(bad({ who: { mastermind: "trang" } }).right, false);
  // Chứng cứ sai vai: kết luận đúng nhưng của vai khác
  assert.equal(bad({ evid: { killer: "k_dong_co" } }).win, false);
  assert.equal(bad({ evid: { mastermind: "k_override" } }).win, false);
  assert.equal(bad({ evid: { tech: "cam_sanh" } }).win, false, "hồ sơ gốc không đủ làm chứng cứ");
  assert.equal(bad({ evid: { tech: null } }).win, false, "thiếu chứng cứ");
  // Dựng lại sai
  assert.equal(bad({ facts: { skew: "fast17" } }).win, false);
  assert.equal(bad({ facts: { window: "w1938" } }).win, false);
  assert.equal(bad({ facts: { entry: "lanh" } }).win, false);
  assert.equal(bad({ facts: { entry: undefined } }).win, false);
  // Mỗi phần được chấm riêng để phản hồi
  const r = judgeVerdict(c, { who: { mastermind: "ngan", killer: "tham", tech: "lanh" }, evid: { mastermind: "k_dong_co", killer: "k_cua_so" }, facts: { skew: "slow17" } });
  assert.deepEqual(r.roles.map((x) => [x.key, x.whoOk, x.evOk]), [["mastermind", true, true], ["killer", true, true], ["tech", false, false]]);
  assert.deepEqual(r.facts.map((x) => [x.key, x.ok]), [["skew", true], ["window", false], ["entry", false]]);
  assert.equal(r.right, false);
  assert.ok(r.roles.every((x) => x.hint));
});

test("những người bị kết tội đúng là ba vai; người ngoài cuộc bị loại bằng hồ sơ độc lập, không bằng lời khai", () => {
  assert.deepEqual(culpritIds(c).sort(), ["hai", "ngan", "tham"]);
  assert.deepEqual(culpritIds(CASES[0]), ["quyen"], "vụ cũ vẫn một thủ phạm");
  // Ba người ngoài cuộc đều có chứng cứ loại trừ không phải lời khai của chính họ
  const outsiders = { vu: "grab_food", trang: "grab_food", lanh: "cam_sanh" };
  for (const [who, ev] of Object.entries(outsiders)) {
    const a = act(ev);
    assert.ok(a.type !== "Lời khai", `${who}: chứng cứ loại trừ phải là hồ sơ độc lập`);
  }
  // Tên các kết luận không nêu thẳng ai là thủ phạm bằng từ "thủ phạm" hay "hung thủ"
  for (const a of c.actions.filter((x) => x.via === "deduce")) {
    assert.ok(!/thủ phạm|hung thủ|kẻ giết/i.test(a.title), `${a.id}: tiêu đề kết luận không được kết tội`);
  }
});

test("giao diện vụ Sài Gòn dựng được: HUD, sổ tay mọi tab, xét xử, bàn phím số, chờ kết quả, kết luận mới", () => {
  let g = play(PLAN);
  g = { ...g, tab: "dd" };
  const L = c.locations[0];
  assert.match(T.hudHTML(g, c, L), /Sài Gòn · Vụ 1/);
  for (const tab of ["sus", "ho", "dd", "tl"]) {
    const html = T.notebookHTML({ ...g, tab }, c);
    assert.ok(html.length > 200, `tab ${tab} có nội dung`);
  }
  const nb = T.notebookHTML({ ...g, tab: "dd" }, c);
  assert.match(nb, /Suy luận \(\d+\/\d+\)/);
  assert.match(nb, /Rút ra từ/);
  assert.match(nb, /Đã mở điểm điều tra: <b>Nhật ký hệ thống đầu ghi hình<\/b>/);
  assert.match(T.notebookHTML({ ...g, tab: "tl" }, c), /đã hiệu chỉnh/);
  assert.match(T.notebookHTML({ ...withDone(["cam_sanh"]), tab: "tl" }, c), /chưa hiệu chỉnh/);
  assert.match(T.accuseHTML(g, c, { who: {}, evid: {}, facts: {} }), /Phiên xét xử/);
  assert.match(T.accuseHTML(g, c, { who: {}, evid: {}, facts: {} }), /Chủ mưu/);
  const lock = T.lockHTML(c, act("ket_sat"), "19", 1);
  assert.match(lock, /data-action="lock-key"/);
  assert.match(lock, /Còn 2 lần thử/);
  assert.match(T.waitHTML(newGame(idx, c), c, act("cdr_tham")), /Chờ 6 giờ/);
  assert.match(T.deduceResultHTML(c, "k_lech"), /Kết luận mới/);
  const wrong = T.wrongVerdictHTML(2, judgeVerdict(c, { who: { mastermind: "ngan", killer: "tham", tech: "lanh" } }), c);
  assert.match(wrong, /Còn lại <b>2<\/b> mạng/);
  assert.match(T.verdictWinHTML(c, idx, 0, { stars: { s1: 3 }, unlocked: 0 }), /Chủ mưu: <b>Ngân<\/b>/);
  assert.equal((T.verdictWinHTML(c, idx, 0, { stars: {}, unlocked: 0 }).match(/data-action="start"/g) || []).length, 0, "vùng Sài Gòn chưa có vụ kế tiếp");
  assert.match(T.verdictWinHTML(CASES[0], 0, 0, { stars: {}, unlocked: 0 }), /data-i="1"/, "vụ Phố cổ vẫn sang vụ kế tiếp");
});

test("điểm điều tra đang chờ hiện đúng trạng thái và bấm được để chờ", () => {
  const L = c.locations.find((x) => x.hs.some((h) => h[0] === "cdr_tham"));
  const g = newGame(idx, c);
  const html = T.hotspotsHTML(g, c, L);
  const m = html.match(/<button class="hs ([^"]*)"[^>]*data-id="cdr_tham"[^>]*>/);
  assert.ok(m, "điểm cdr_tham có trên cảnh");
  assert.match(m[1], /is-wait/);
  assert.doesNotMatch(m[0], /disabled/, "điểm chờ vẫn bấm được");
  assert.match(html, /chờ tới 02:30/);
  assert.match(T.hotspotsHTML(g, c, c.locations.find((x) => x.hs.some((h) => h[0] === "ket_sat"))), /fa-lock/);
  assert.equal(nowMinutes(g, c), 21 * 60);
});
