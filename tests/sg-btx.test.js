/* Kiểm thử vụ s3 "Búp Sen Đen" (tháp Bitexco): giờ chết bị dời, vòng loại trừ, ngoại phạm, khóa mã từ bảng chỉ dẫn tầng, cổng mở khóa, hồ sơ về muộn và lời giải. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { CASES, casesOf } from "../src/data/cases.js";
import {
  newGame, performAct, isOpen, isPending, waitFor, attemptLock, pickDeduce, tryDeduce, closeDeductions, gated,
  timelineEvents, alibisOf, judge, isGone, departed, clockAt, MAX_DEDUCE, performConfront, confrontOptions, nextStep, LOCK_TRIES
} from "../src/game/rules.js";
import { ART } from "../src/art/art.js";
import * as T from "../src/ui/templates.js";
import { notebookHTML } from "./nbhtml.js";

const idx = CASES.findIndex((c) => c.id === "s3");
const c = CASES[idx];
const s2 = CASES.find((x) => x.id === "s2");
const act = (id) => c.actions.find((a) => a.id === id);
const withDone = (ids, extra = {}) => ({ ...newGame(idx, c), done: Object.fromEntries(ids.map((i) => [i, true])), found: [...ids], ...extra });
const at = (spent) => ({ ...newGame(idx, c), hours: c.budget - spent });
const stars = (s) => (s.match(/★/g) || []).length;

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

test("vụ s3 thuộc vùng Sài Gòn, là vụ số 3, có Vũ, Ngân, Thắm, Trang cùng hai nhân vật do tác giả đặt", () => {
  assert.equal(c.region, "sg");
  assert.equal(c.no, 3);
  assert.equal(idx, 2, "s3 nằm cuối danh sách để bản lưu của s1, s2 không đổi chỉ số");
  assert.deepEqual(casesOf("sg").map((x) => x.id), ["s1", "s2", "s3"]);
  const names = c.suspects.map((s) => s.name);
  for (const n of ["Vũ", "Ngân", "Thắm", "Trang", "Quân", "Sơn"]) assert.ok(names.includes(n), `${n} phải có trong vụ`);
  assert.equal(c.suspects.length, 6);
  assert.equal(c.culprit, "quan");
  assert.match(c.place, /Bitexco/);
  assert.match(c.place, /2 Hải Triều/);
  assert.ok(c.suspects.every((s) => s.look && s.bio && s.role));
  assert.equal(c.locations[0].scene, "sg_btx_pad", "thẻ vụ ở menu lấy cảnh đầu tiên: sân đáp trực thăng");
});

test("độ khó không thấp hơn vụ s2: nhiều sao hơn, nhiều điểm hơn, nhiều kết luận và nhiều người nói dối hơn", () => {
  assert.ok(stars(c.level) >= stars(s2.level), `${c.level} phải ≥ ${s2.level}`);
  assert.equal(c.budget, 15);
  const points = (x) => x.actions.filter((a) => !a.via).length;
  assert.ok(points(c) >= points(s2) - 1, `s3 ${points(c)} điểm điều tra, s2 ${points(s2)}`);
  assert.ok(points(c) >= 30, "ngân sách giờ ≥ nửa số điểm điều tra");
  assert.ok(c.budget * 2 >= points(c), `${points(c)} điểm điều tra cần ít nhất ${points(c) / 2} giờ`);
  const concl = (x) => x.actions.filter((a) => a.via === "deduce").length;
  assert.ok(concl(c) > concl(s2), `s3 ${concl(c)} kết luận, s2 ${concl(s2)}`);
  assert.ok(c.deduce.length > s2.deduce.length);
  assert.ok(c.confront.filter((r) => r.reveal).length >= 5, "năm người giấu chuyện riêng");
  assert.ok(c.world.length >= 4 && c.world.every((w) => w.kind === "arrive"));
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

test("đồ vật của vụ trỏ tới dữ liệu có thật: gate, khóa, hồ sơ về muộn, chuỗi chứng minh; không có thiết bị lệch giờ", () => {
  const ids = c.actions.map((a) => a.id);
  assert.equal(c.devices, undefined, "vụ này không dựa vào giờ máy lệch");
  for (const a of c.actions) {
    if (a.gate) assert.ok(ids.includes(a.gate), `${a.id}: gate trỏ tới ${a.gate}`);
    if (a.lock) assert.match(a.lock.code, new RegExp(`^\\d{${a.lock.digits}}$`));
    for (const s of a.spans || []) for (const n of s.needs || []) assert.ok(ids.includes(n), `${a.id}: needs ${n}`);
  }
  assert.ok(c.actions.some((a) => a.gate) && c.actions.some((a) => a.lock));
  assert.deepEqual(c.chain.map((s) => s.key), ["time", "access", "motive"]);
  for (const st of c.chain) for (const i of st.ids) assert.equal(act(i).via, "deduce", `${st.key}: chứng cứ của bước phải là kết luận`);
});

test("giờ chết thật là 21:51: hai lối cùng ra một kết luận, và nó nằm trước giờ thẻ bị quẹt 22:30–22:34", () => {
  assert.ok(closeDeductions(withDone(["khay_tra", "hop_thu"]), c).done.k_gio_chet, "lối hộp thư thoại + khay trà");
  assert.ok(closeDeductions(withDone(["dt_tuyen", "phap_y"]), c).done.k_gio_chet, "lối đồng hồ thông minh + pháp y");
  assert.match(act("hop_thu").text, /21:49:03.*21:51:07/);
  assert.match(act("dt_tuyen").text, /nhịp tim ngừng ghi lúc 21:51/);
  assert.match(act("khay_tra").text, /Thắm – 21:46/);
  assert.match(act("nk_cua").text, /22:30 thẻ CT-01.*22:34 thẻ CT-01/);
  assert.match(act("k_gio_chet").title, /21h51/);
  // Lời khai đầu tiên chưa đủ: thẻ quẹt 22:34 là bằng chứng "bà còn sống" nếu chưa biết giờ thật
  const g = closeDeductions(withDone(["nk_cua", "phap_y", "hien_truong"]), c);
  assert.ok(g.done.k_bi_chuyen && g.done.k_ngu_trang, "chuyển xác + thẻ quẹt cho ra kết luận dựng hiện trường");
});

test("bà gọi kẻ vào phòng là “cậu”: hộp thư thoại + lời Thắm thu hẹp còn Quân và Vũ", () => {
  assert.match(act("hop_thu").text, /Ơ, cậu\? Cậu lên đây làm gì\? Ai cho cậu thẻ/);
  assert.match(act("loi_tham").text, /gọi anh Quân và cơ trưởng Vũ là “cậu”.*gọi ông Sơn là “anh Sơn”/);
  const g = closeDeductions(withDone(["loi_tham", "hop_thu"]), c);
  assert.ok(g.done.k_xung_ho);
  assert.match(act("k_xung_ho").text, /Quân hoặc Vũ/);
});

test("ngoại phạm: Quân, Ngân, Trang, Thắm bị bác (mỗi người vì một lý do khác nhau); Vũ và Sơn được xác nhận ở đúng khung giờ họ khai", () => {
  const stm = ["loi_quan", "loi_ngan", "loi_trang", "loi_tham", "loi_vu", "loi_son", "cam_tiec", "cam_pad", "cam_vanhanh", "nk_dien_dam", "nk_thang"];
  const g = closeDeductions(withDone(stm), c);
  const al = (who) => alibisOf(g, c).find((a) => a.who === who);
  assert.equal(al("quan").status, "clash");
  assert.equal(al("quan").by.at, "Ngoài sảnh tiệc (cửa phụ, ngoài tầm camera)", "Quân bị bác vì vắng 21:43–21:58");
  assert.equal(al("ngan").status, "clash", "Ngân rời sảnh 21:20–21:35");
  assert.equal(al("trang").status, "clash", "Trang rời sảnh 21:20–21:35");
  assert.equal(al("tham").status, "clash", "Thắm rời sảnh 22:03–22:09 để rút nêm");
  assert.equal(al("vu").status, "proof", "Vũ gọi điện cố định 21:41–21:56");
  assert.equal(al("son").status, "proof", "Sơn ngồi trước camera 21:00–22:05");
  // Trước khi có camera sảnh tiệc, chưa ai bị bác
  const before = alibisOf(withDone(["loi_quan", "loi_ngan", "loi_trang", "loi_tham"]), c);
  assert.ok(before.every((a) => a.status === "open"));
});

test("camera sân đáp: bóng người vác vật dài chỉ gắn vào Quân sau khi biết thẻ bị dùng giả; Vũ gắn ngay", () => {
  const raw = timelineEvents(withDone(["cam_pad"]), c);
  assert.equal(raw.find((e) => e.who === "vu").at, "Sân đáp trực thăng (tầng 52)");
  assert.ok(raw.some((e) => e.pending && e.from === "22:34"), "mốc 22:34 chưa gắn người");
  const g = closeDeductions(withDone(["cam_pad", "nk_cua", "khay_tra", "hop_thu"]), c);
  assert.ok(g.done.k_ngu_trang);
  const who = timelineEvents(g, c).filter((e) => e.clue === "cam_pad").map((e) => e.who).sort();
  assert.deepEqual(who, ["quan", "vu"]);
});

test("vòng loại trừ lúc 21:51: bốn nguồn che từng người, chỉ còn Quân", () => {
  const roots = ["khay_tra", "hop_thu", "loi_tham", "nk_dien_dam", "cam_vanhanh", "cam_tiec"];
  const g = play(roots);
  for (const k of ["k_gio_chet", "k_xung_ho", "k_loai_vu", "k_loai_son", "k_quan_vang", "k_con_lai_quan"]) assert.ok(g.done[k], `${k} phải rút ra được`);
  // Thiếu một mắt xích thì không ra kết luận cuối
  for (const miss of ["loi_tham", "nk_dien_dam", "cam_vanhanh", "cam_tiec"]) {
    const g2 = play(roots.filter((x) => x !== miss));
    assert.ok(!g2.done.k_con_lai_quan, `thiếu ${miss} vẫn ra k_con_lai_quan`);
  }
  assert.match(act("k_con_lai_quan").text, /21:43 đến 21:58/);
  // Lối thứ hai không qua camera sảnh tiệc: điểm mù tầng 51
  const g3 = play(["khay_tra", "hop_thu", "cam_vanhanh", "cam_hl51", "thong_bao_cam", "nk_cua", "quyen_the"]);
  assert.ok(g3.done.k_mu_cam && g3.done.k_cua_mo && g3.done.k_diem_mu);
});

test("mã điện thoại bà Thục Anh là 5249: tầng sân đáp (52) rồi tầng đài quan sát (49), lấy từ bảng chỉ dẫn các tầng", () => {
  assert.match(act("bang_tang").text, /Tầng 52 – Sân đáp trực thăng/);
  assert.match(act("bang_tang").text, /Tầng 49 – Đài quan sát/);
  assert.match(act("note_ma").text, /tầng tôi hạ cánh, rồi tầng đài quan sát/);
  assert.equal(act("dt_tuyen").lock.code, "5249");
  assert.equal(act("dt_tuyen").lock.digits, 4);
  assert.ok(c.locations.some((L) => L.hs.some((h) => h[0] === "note_ma" && h[4] === "soi")));
  const g0 = newGame(idx, c);
  assert.equal(attemptLock(g0, c, "dt_tuyen", "4952").status, "wrong", "thứ tự đảo ngược");
  assert.equal(attemptLock(g0, c, "dt_tuyen", "5050").status, "wrong");
  assert.equal(attemptLock(g0, c, "dt_tuyen", "5249").status, "open");
  let g = g0;
  for (let i = 0; i < LOCK_TRIES - 1; i++) g = attemptLock(g, c, "dt_tuyen", "0000").game;
  assert.equal(attemptLock(g, c, "dt_tuyen", "0000").status, "locked", "sai ba lần thì thiết bị tự khóa");
});

test("hồ sơ về muộn và hai cổng mở khóa", () => {
  const g0 = newGame(idx, c);
  for (const [id, h] of [["hop_thu", 1], ["nk_thang", 3], ["dkkd_sen_vang", 4], ["lab_cup", 5]]) {
    assert.ok(isPending(g0, c, id), `${id} chưa về lúc đầu`);
    assert.equal(performAct(g0, c, id), g0);
    assert.ok(waitFor(g0, c, id).hours >= g0.hours - h - 1, `${id}: chờ quá ${h + 1} giờ`);
  }
  assert.equal(gated(g0, c, "sao_ke_sv"), true);
  assert.equal(gated(closeDeductions(withDone(["dkkd_sen_vang", "loi_ngan"]), c), c, "sao_ke_sv"), false, "biết Sen Vàng của em vợ Quân thì xin được sao kê");
  assert.equal(gated(g0, c, "usb_trang"), true);
  assert.equal(gated({ ...g0, done: { trang_thu: true } }, c, "usb_trang"), false);
});

test("hồ sơ và nghi phạm không biến mất theo thời gian, dù đồng hồ đã chạy hết ngân sách giờ", () => {
  assert.ok((c.world || []).every((w) => w.kind === "arrive"), "chỉ còn diễn biến hồ sơ về muộn");
  for (const a of c.actions.filter((x) => !x.via)) {
    assert.equal(isGone(at(0), c, a.id), false, `${a.id}: mất ngay từ đầu`);
    assert.equal(isGone(at(c.budget), c, a.id), false, `${a.id}: mất theo thời gian`);
  }
  for (const s of c.suspects) assert.equal(departed(at(c.budget), c, s.id), false, `${s.id}: rời đi theo thời gian`);
  for (const id of ["hien_truong", "cam_tiec", "khay_tra", "ban_cup", "loi_quan"]) {
    assert.ok(isOpen(at(c.budget - 2), c, id), `${id}: vẫn làm được khi gần hết giờ`);
  }
});

// Lời giải ngắn nhất, và các lối độc lập cho từng bước
const PLAN = ["khay_tra", "hop_thu", "cam_tiec", "dkkd_sen_vang", "loi_ngan", "sao_ke_sv"];
const GOOD = { time: "k_gio_chet", access: "k_quan_vang", motive: "k_chuyen_tien" };

test("lời giải ngắn nhất đi được, còn dư ít nhất 4 giờ, và buộc tội đúng thì thắng", () => {
  const g = play(PLAN);
  assert.ok(c.budget - g.hours <= c.budget - 4, `tốn ${c.budget - g.hours}/${c.budget} giờ`);
  for (const st of c.chain) assert.ok(st.ids.some((i) => g.done[i]), `${st.key}: chưa có chứng cứ`);
  assert.equal(judge(c, "quan", GOOD).win, true);
  assert.equal(judge(c, "quan", { time: "k_ngu_trang", access: "k_con_lai_quan", motive: "k_dong_co" }).win, true, "lối kỹ hơn cũng thắng");
});

test("mỗi bước có ít nhất hai lối chứng cứ độc lập, đi được trong ngân sách", () => {
  const routes = {
    time: [["khay_tra", "hop_thu"], ["dt_tuyen", "phap_y"]],
    access: [["khay_tra", "hop_thu", "cam_tiec"], ["dt_tuyen", "phap_y", "cam_tiec"], ["khay_tra", "hop_thu", "cam_vanhanh", "cam_hl51", "thong_bao_cam", "nk_cua", "quyen_the"]],
    motive: [["dkkd_sen_vang", "loi_ngan", "sao_ke_sv"], ["trang_route"]]
  };
  for (const st of c.chain) {
    let ok = 0;
    for (const path of routes[st.key]) {
      let g;
      if (path[0] === "trang_route") {
        // Hỏi Trang, thu camera sảnh tiệc, đưa chứng cứ để Trang giao USB, rồi xin sao kê Sen Vàng
        g = play(["loi_trang", "cam_tiec"]);
        const g2 = performConfront(g, c, "trang", "cam_tiec");
        if (g2 === g) continue;
        g = play(["usb_trang", "sao_ke_sv"], closeDeductions(g2, c));
      } else {
        try { g = play(path); } catch { continue; }
      }
      if (st.ids.some((i) => g.done[i])) ok++;
    }
    assert.ok(ok >= 2, `${st.key}: chỉ ${ok} lối chứng cứ đi được`);
  }
});

test("buộc tội sai: nhầm người, nhầm chứng cứ sang bước khác, thiếu chứng cứ đều thua; mỗi người ngoài cuộc có hồ sơ độc lập loại trừ", () => {
  for (const who of ["vu", "son", "tham", "ngan", "trang"]) assert.equal(judge(c, who, GOOD).win, false, who);
  assert.equal(judge(c, "quan", { ...GOOD, motive: "k_gio_chet" }).win, false);
  assert.equal(judge(c, "quan", { ...GOOD, time: "k_dong_co" }).win, false);
  assert.equal(judge(c, "quan", { ...GOOD, access: "hop_thu" }).win, false, "hồ sơ gốc không đủ làm chứng cứ");
  assert.equal(judge(c, "quan", { ...GOOD, access: null }).win, false);
  const r = judge(c, "vu", GOOD);
  assert.equal(r.right, false);
  assert.ok(r.steps.every((s) => s.ok), "đúng chứng cứ nhưng sai người vẫn thua");
  // Người ngoài cuộc bị loại bằng camera, nhật ký có giờ mạng, hoặc đường dây cố định
  assert.equal(act("cam_vanhanh").type, "Camera");
  assert.equal(act("cam_tiec").type, "Camera");
  assert.match(act("nk_dien_dam").text, /không dùng ở nơi nào khác được/);
});

test("đưa chứng cứ: năm người thú nhận chuyện riêng; Quân chỉ phản ứng, không bao giờ thú nhận", () => {
  const withStm = (who, clue, extra = []) => {
    const stm = { tham: "loi_tham", ngan: "loi_ngan", trang: "loi_trang", son: "loi_son", vu: "loi_vu" }[who];
    return performConfront(play([stm, clue, ...extra]), c, who, clue);
  };
  for (const [who, clue, reveal] of [["tham", "nk_cua", "tham_thu"], ["ngan", "cam_tiec", "ngan_thu"], ["trang", "cam_tiec", "trang_thu"], ["son", "cam_vanhanh", "son_thu"], ["vu", "phieu_tai", "vu_thu"]]) {
    assert.ok(withStm(who, clue).done[reveal], `${who}: phải thú nhận ${reveal}`);
  }
  // Camera sân đáp chỉ làm Vũ ngập ngừng, không mở lời khai
  assert.ok(!withStm("vu", "cam_pad").done.vu_thu);
  const quan = c.confront.filter((r) => r.who === "quan");
  assert.ok(quan.length >= 6 && quan.every((r) => !r.reveal), "Quân có nhiều phản ứng nhưng không thú nhận");
  const g = play(["loi_quan", "cam_tiec"]);
  assert.ok(confrontOptions(g, c, "quan").includes("cam_tiec"));
  const after = performConfront(g, c, "quan", "cam_tiec");
  assert.notEqual(after, g);
  assert.equal(after.found.length, g.found.length, "phản ứng của Quân không mở lời khai mới");
});

test("lối thú nhận của Trang đủ để dựng lại động cơ mà không cần chờ đăng ký kinh doanh", () => {
  let g = play(["loi_trang", "cam_tiec"]);
  g = performConfront(g, c, "trang", "cam_tiec");
  g = closeDeductions(g, c);
  assert.equal(isOpen(g, c, "usb_trang"), true, "USB mở ra khi Trang thú nhận");
  g = play(["usb_trang", "sao_ke_sv"], g);
  for (const k of ["k_sen_vang_quan", "k_chuyen_tien"]) assert.ok(g.done[k], k);
  assert.ok(g.hours >= 5, `tốn quá nhiều giờ: còn ${g.hours}`);
});

test("gợi ý đi được tới đủ chứng cứ trong ngân sách, và dừng ngay khi mỗi bước đã có một chứng cứ", () => {
  let g = newGame(idx, c);
  for (let i = 0; i < 60; i++) {
    const st = nextStep(g, c);
    if (st.kind === "accuse") break;
    let n = g;
    if (st.kind === "go") n = closeDeductions(act(st.id).lock ? attemptLock(g, c, st.id, act(st.id).lock.code).game : performAct(g, c, st.id), c);
    else if (st.kind === "wait") n = waitFor(g, c, st.id);
    else if (st.kind === "deduce") { for (const x of st.needs) g = pickDeduce(g, x); n = tryDeduce(g, c); }
    else if (st.kind === "confront") n = performConfront(g, c, st.who, st.clue);
    assert.notEqual(n, g, `gợi ý ${st.kind} ${st.id || ""} không đi được`);
    g = n;
  }
  assert.equal(nextStep(g, c).kind, "accuse");
  assert.ok(g.hours >= 4, `gợi ý tốn quá nhiều giờ: còn ${g.hours}`);
  for (const st of c.chain) assert.ok(st.ids.some((i) => g.done[i]), `${st.key}: gợi ý chưa dẫn tới chứng cứ`);
  assert.ok(g.done.k_gio_chet && g.done.k_quan_vang && g.done.k_chuyen_tien, "gợi ý đi theo lối ngắn nhất của từng bước");
});

test("giao diện vụ s3 dựng được: HUD, sổ tay mọi tab, chuỗi chứng minh; mọi cảnh và khung camera vẽ được", () => {
  const g = play(PLAN);
  assert.match(T.hudHTML(g, c, c.locations[0]), /Sài Gòn · Vụ 3/);
  for (const tab of ["sus", "ho", "dd", "tl"]) assert.ok(notebookHTML({ ...g, tab }, c).length > 200, tab);
  assert.match(T.accuseHTML(g, c, { culprit: null, steps: {} }), /Thời điểm/);
  assert.match(T.accuseHTML(g, c, { culprit: null, steps: {} }), /Động cơ/);
  const keys = new Set();
  for (const L of c.locations) {
    const svg = ART.scene(L.scene, []);
    assert.ok(svg.includes("<svg") && svg.length > 2000, `${L.scene} phải vẽ được`);
    keys.add(L.scene);
    // Mỗi điểm điều tra nằm trong khung cảnh 1600×900 và tránh sát mép
    for (const [, x, y] of L.hs) assert.ok(x >= 300 && x <= 1300 && y >= 150 && y <= 760, `${L.id}: điểm (${x},${y}) ngoài vùng an toàn`);
  }
  assert.equal(keys.size, 6);
  for (const a of c.actions) if (a.visual && a.visual.k !== "who") assert.ok(ART.evidence(a.visual).includes("<svg"), `${a.id}: hình minh họa`);
  for (const a of c.actions.filter((x) => x.visual && x.visual.k === "cam")) assert.ok(ART.evidence(a.visual).includes("REC"), `${a.id}: khung camera`);
});

test("mỗi hình giấy tờ gọn trong khung: tối đa năm dòng, không dòng nào quá dài", () => {
  for (const a of c.actions.filter((x) => x.visual && x.visual.k === "paper")) {
    assert.ok(a.visual.rows.length <= 5, `${a.id}: ${a.visual.rows.length} dòng`);
    assert.ok(a.visual.title.length <= 33, `${a.id}: tiêu đề quá dài`);
    for (const r of a.visual.rows) assert.ok(r.length <= 41, `${a.id}: dòng quá dài (${r.length}): ${r}`);
  }
});

test("hộp thoại mở đầu chỉ nhắc cơ chế mà vụ có: s3 không nhắc giờ máy lệch, s1 và s2 vẫn nhắc", () => {
  const html = T.briefingHTML(c);
  assert.doesNotMatch(html, /giờ máy lệch/);
  assert.match(html, /về muộn/);
  assert.match(html, /mã số/);
  assert.match(html, /Suy luận/);
  assert.match(html, /Búp Sen Đen/);
  for (const id of ["s1", "s2"]) assert.match(T.briefingHTML(CASES.find((x) => x.id === id)), /giờ máy lệch/, `${id}: vẫn có thiết bị lệch giờ`);
});
