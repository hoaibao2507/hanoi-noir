/* Kiểm thử vụ s5 "Hai Phút Một Ga" (tuyến metro số 1): bảng giờ chạy tàu cố định làm đồng hồ, đổi đoàn tàu trên sân ga đảo Ba Son không để lại lượt quẹt thẻ, vòng ra-vào cùng một ga, vòng loại trừ ở 22:03, khóa mã số hiệu đoàn tàu, hồ sơ về muộn và lời giải. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { CASES, casesOf } from "../src/data/cases.js";
import {
  newGame, performAct, isOpen, isPending, waitFor, attemptLock, pickDeduce, tryDeduce, closeDeductions, gated,
  alibisOf, judge, isGone, departed, clockAt, MAX_DEDUCE, performConfront, confrontOptions, nextStep, LOCK_TRIES
} from "../src/game/rules.js";
import { ART } from "../src/art/art.js";
import * as T from "../src/ui/templates.js";
import { notebookHTML } from "./nbhtml.js";

const idx = CASES.findIndex((c) => c.id === "s5");
const c = CASES[idx];
const s4 = CASES.find((x) => x.id === "s4");
const act = (id) => c.actions.find((a) => a.id === id);
const withDone = (ids, extra = {}) => ({ ...newGame(idx, c), done: Object.fromEntries(ids.map((i) => [i, true])), found: [...ids], ...extra });
const at = (spent) => ({ ...newGame(idx, c), hours: c.budget - spent });
const stars = (s) => (s.match(/★/g) || []).length;
// "21:56:58" → số giây trong ngày
const sec = (hms) => hms.split(":").reduce((t, v, i) => t + Number(v) * [3600, 60, 1][i], 0);

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

test("vụ s5 thuộc vùng Sài Gòn, là vụ số 5, có Vũ, Ngân, Thắm, Trang cùng hai nhân vật do tác giả đặt", () => {
  assert.equal(c.region, "sg");
  assert.equal(c.no, 5);
  assert.equal(idx, 4, "s5 nằm cuối danh sách để bản lưu của s1–s4 không đổi chỉ số");
  assert.deepEqual(casesOf("sg").map((x) => x.id).slice(0, 5), ["s1", "s2", "s3", "s4", "s5"]);
  const names = c.suspects.map((s) => s.name);
  for (const n of ["Vũ", "Ngân", "Thắm", "Trang", "Kiên", "Phương"]) assert.ok(names.includes(n), `${n} phải có trong vụ`);
  assert.equal(c.suspects.length, 6);
  assert.equal(c.culprit, "phuong");
  assert.notEqual(c.culprit, "kien", "người có động cơ lộ liễu nhất (nhà thầu) không phải người có tội");
  assert.match(c.place, /metro số 1/);
  assert.ok(c.suspects.every((s) => s.look && s.bio && s.role));
  assert.equal(c.locations[0].scene, "sg_mt_car", "thẻ vụ ở menu lấy cảnh đầu tiên: toa 3 đoàn tàu");
  assert.equal(c.clock.start, "23:40");
});

test("độ khó không thấp hơn vụ s4: không ít sao, điểm, kết luận, dòng suy luận và người nói dối", () => {
  assert.ok(stars(c.level) >= stars(s4.level), `${c.level} phải ≥ ${s4.level}`);
  assert.equal(c.budget, 15);
  const points = (x) => x.actions.filter((a) => !a.via).length;
  assert.ok(points(c) >= points(s4), `s5 ${points(c)} điểm điều tra, s4 ${points(s4)}`);
  assert.ok(c.budget * 2 >= points(c), `${points(c)} điểm điều tra cần ít nhất ${points(c) / 2} giờ`);
  const concl = (x) => x.actions.filter((a) => a.via === "deduce").length;
  assert.ok(concl(c) >= concl(s4), `s5 ${concl(c)} kết luận, s4 ${concl(s4)}`);
  assert.ok(c.deduce.length >= s4.deduce.length);
  assert.ok(c.confront.filter((r) => r.reveal).length >= 5, "năm người giấu chuyện riêng");
  assert.ok(c.world.length >= 4 && c.world.every((w) => w.kind === "arrive"));
});

test("dữ liệu suy luận nhất quán: đầu vào và kết luận có thật, không trùng đầu vào, kết luận rút ra được từ hồ sơ gốc", () => {
  const ids = c.actions.map((a) => a.id);
  const seen = new Map();
  for (const d of c.deduce) {
    assert.equal(d.needs.length, MAX_DEDUCE, `${d.gives}: cần đúng ${MAX_DEDUCE} hồ sơ`);
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
  for (const a of c.actions) {
    if (a.gate) assert.ok(ids.includes(a.gate), `${a.id}: gate trỏ tới ${a.gate}`);
    if (a.lock) assert.match(a.lock.code, new RegExp(`^\\d{${a.lock.digits}}$`));
    for (const s of a.spans || []) for (const n of s.needs || []) assert.ok(ids.includes(n), `${a.id}: needs ${n}`);
  }
  assert.ok(c.actions.some((a) => a.gate) && c.actions.some((a) => a.lock));
  assert.deepEqual(c.chain.map((s) => s.key), ["when", "escape", "motive"]);
  for (const st of c.chain) for (const i of st.ids) assert.equal(act(i).via, "deduce", `${st.key}: chứng cứ của bước phải là kết luận`);
});

test("bảng giờ chạy tàu là một cái đồng hồ: hai phút một ga, U-07 và D-05 cùng tới Ba Son lúc 22:04, các mốc trong dữ liệu khớp phép tính", () => {
  // Chỉ số ga: Bến Thành 0, Nhà hát 1, Ba Son 2 … Suối Tiên 13; mỗi chặng 2 phút
  const SEG = 120, BS = 2, ST = 13;
  const u07 = (i) => sec("22:00:00") + i * SEG;
  const d05 = (i) => sec("21:42:00") + (ST - i) * SEG;
  assert.equal(u07(BS), sec("22:04:00"), "U-07 tới Ba Son 22:04");
  assert.equal(d05(BS), sec("22:04:00"), "D-05 tới Ba Son cũng 22:04 (sau khi dời 2 phút)");
  assert.equal(u07(ST), sec("22:26:00"), "U-07 tới Suối Tiên 22:26");
  assert.equal(d05(0), sec("22:08:00"), "D-05 tới Bến Thành 22:08");
  assert.equal(d05(BS) + 2 * SEG, d05(0), "Ba Son → Bến Thành là hai chặng, bốn phút");
  // Trước khi sửa, D-05 rời Suối Tiên 21:40 nên tới Ba Son 22:02, sớm hơn U-07 hai phút
  assert.equal(sec("21:40:00") + (ST - BS) * SEG, sec("22:02:00"));
  // Vòng đi về của thẻ NV-0417: 21:56:58 vào, 22:11:40 ra = 14 phút 42 giây, trong đó trên tàu đúng 8 phút
  const loop = sec("22:11:40") - sec("21:56:58");
  assert.equal(loop, 14 * 60 + 42);
  assert.ok(loop >= 4 * SEG, "ít nhất bốn chặng hai phút trên tàu");
  assert.ok(loop - 4 * SEG <= 8 * 60, "phần còn lại (đi bộ, chờ tàu) chỉ vài phút");
  // Các văn bản nhắc đúng những mốc ấy
  assert.match(act("bang_gio").text, /cố định 2 phút/);
  assert.match(act("bieu_do").text, /Ba Son 22:04, Văn Thánh 22:06/);
  assert.match(act("nk_vi_tri").text, /Ba Son tới 22:04:00, rời 22:04:48/);
  assert.match(act("nk_vi_tri").text, /Ba Son tới 22:04:01, rời 22:04:47/);
  assert.match(act("nk_vi_tri").text, /Bến Thành tới 22:08:00/);
  assert.match(act("nk_the_bt").text, /Phương vào Bến Thành 21:56:58, ra Bến Thành 22:11:40/);
  assert.match(act("nk_cong_bt").text, /22:11:40 NV-0417/);
  assert.ok(closeDeductions(withDone(["bang_gio", "bieu_do"]), c).done.k_hai_phut);
});

test("giờ và nơi ra tay: ba lối ra kết luận, thiếu mắt xích thì không ra", () => {
  assert.ok(closeDeductions(withDone(["cam_bs", "nk_cua_chan"]), c).done.k_xuong_ba_son, "lối camera sân ga + cửa chắn");
  assert.ok(closeDeductions(withDone(["cam_toa3", "nk_vi_tri"]), c).done.k_xuong_ba_son, "lối camera trong toa + nhật ký vị trí");
  assert.ok(closeDeductions(withDone(["phap_y", "dt_thinh"]), c).done.k_chet_giua_chang, "lối pháp y + điện thoại, không cần camera");
  assert.ok(closeDeductions(withDone(["cam_toa3", "doc_chat"]), c).done.k_chet_giua_chang, "lối camera trong toa + độc chất");
  assert.ok(!closeDeductions(withDone(["cam_bs"]), c).done.k_xuong_ba_son);
  assert.match(act("cam_toa3").text, /22:03:48 đầu Thịnh gục xuống, bất động/);
  assert.match(act("cam_toa3").text, /22:04:10 người áo mưa đứng dậy, xuống ở Ba Son/);
  assert.match(act("nk_cua_chan").text, /một lượt ra, không lượt vào/);
  assert.match(act("dt_thinh").text, /22:02:41/);
  assert.match(act("phap_y").text, /tim ngừng trong khoảng một đến hai phút/);
  assert.match(act("phap_y").text, /Thân nhiệt vô giá trị/, "không dùng thân nhiệt làm nguồn giờ chết");
});

test("đổi đoàn tàu trên sân ga đảo: hai đoàn đứng cạnh nhau, người áo mưa sang D-05, áo mưa nằm ở Bến Thành; hai lối ra", () => {
  assert.ok(closeDeductions(withDone(["so_do_ba_son", "bieu_do"]), c).done.k_hai_tau_gap_nhau);
  assert.ok(closeDeductions(withDone(["nk_vi_tri", "so_do_ba_son"]), c).done.k_hai_tau_gap_nhau);
  assert.ok(!closeDeductions(withDone(["bieu_do", "nk_vi_tri"]), c).done.k_hai_tau_gap_nhau, "thiếu sơ đồ sân ga đảo thì chưa biết hai đoàn đứng cạnh nhau");
  assert.ok(play(["so_do_ba_son", "bieu_do", "cam_bs"]).done.k_doi_tau, "lối camera sân ga");
  assert.ok(play(["cam_toa3", "ao_mua"]).done.k_doi_tau, "lối camera trong toa + áo mưa ở sảnh Bến Thành");
  assert.match(act("so_do_ba_son").text, /sân ga đảo/);
  assert.match(act("cam_bs").text, /22:04:25 người ấy bước ngang sân ga, lên toa 4 của D-05/);
  assert.match(act("ao_mua").text, /ngoài cổng soát vé/);
  assert.match(act("nk_cong_bs").text, /Không ai trong ba lượt ra đi từ toa 3/);
});

test("sổ vé chỉ thấy một vòng ra-vào: hai thẻ ra Bến Thành sau 22:08, thẻ NV-0417 chưa từng qua ga nào; các hồ sơ muộn chưa có lúc đầu", () => {
  const g0 = newGame(idx, c);
  assert.ok(isPending(g0, c, "nk_the_bt"), "sao kê thẻ toàn tuyến về muộn");
  assert.ok(isPending(g0, c, "cam_toa3"));
  const g = play(["nk_cong_bt", "nk_the_bt"]);
  assert.ok(g.done.k_the_ra_bt);
  assert.ok(!closeDeductions(withDone(["nk_cong_bt"]), c).done.k_the_ra_bt, "sổ cổng chỉ có số thẻ, chưa có tên chủ thẻ");
  const g2 = play(["nk_cong_bt", "nk_the_bt", "so_do_ba_son", "bieu_do", "cam_bs"]);
  assert.ok(g2.done.k_vong_ga, "vòng 14 phút 42 giây khớp chuyến đổi đoàn tàu");
  assert.match(act("k_vong_ga").text, /Chỉ một thẻ có vòng ấy: thẻ của Phương/);
  assert.match(act("nk_cong_bt").text, /chỉ ghi số thẻ \(không ghi tên chủ thẻ\)/);
  assert.match(act("nk_the_bt").text, /NV-0417 Phan Thị Phương/);
});

test("người sửa đồng hồ: nhật ký biểu đồ cho thấy tài khoản của Trưởng phòng Kế hoạch dời giờ D-05 hai phút 21 ngày trước", () => {
  assert.ok(play(["nk_bieu_do", "bieu_do"]).done.k_chinh_bieu_do);
  assert.ok(play(["nk_bieu_do", "so_do_ba_son", "bieu_do"]).done.k_chinh_bieu_do, "lối qua kết luận hai đoàn gặp nhau");
  assert.match(act("nk_bieu_do").text, /21 ngày trước, 16:42: tài khoản phuong\.kh/);
  assert.match(act("nk_bieu_do").text, /từ 21:40 thành 21:42/);
  assert.match(act("loi_phuong").text, /từ ngày khai trương tới giờ không đổi/, "lời khai của Phương mâu thuẫn với nhật ký sửa biểu đồ");
  assert.match(act("loi_tham").text, /ba tuần nay vẫn vậy/);
});

test("vòng loại trừ ở 22:03: năm nguồn che năm người, chỉ còn Phương", () => {
  const roots = ["cam_cab", "cam_occ", "cam_bs", "nk_the_bt", "nk_cua_vp", "nk_cua_chan", "cam_toa3", "nk_cong_bs"];
  const g = play(roots);
  for (const k of ["k_loai_vu_tham", "k_loai_kien", "k_loai_trang", "k_loai_ngan", "k_loai_ba_nguoi", "k_loai_hai", "k_con_lai_phuong"]) assert.ok(g.done[k], `${k} phải rút ra được`);
  // Thiếu một mắt xích thì không ra kết luận cuối
  for (const miss of roots) {
    const g2 = play(roots.filter((x) => x !== miss));
    // k_xuong_ba_son (cho k_loai_trang) còn ra được từ cam_toa3 + nk_vi_tri; bỏ cam_bs hoặc nk_cua_chan thì vẫn thiếu nguồn khác, nên chỉ kiểm khi mất hẳn nguồn
    if (["cam_cab", "cam_occ", "nk_the_bt", "nk_cua_vp", "nk_cong_bs"].includes(miss)) assert.ok(!g2.done.k_con_lai_phuong, `thiếu ${miss} vẫn ra k_con_lai_phuong`);
  }
  assert.match(act("k_con_lai_phuong").text, /rời phòng Kế hoạch lúc 21:53:40 và quay lại lúc 22:14:50/);
  assert.match(act("nk_cua_vp").text, /21:53:40 Phương ra\. 22:14:50 Phương vào lại/);
  assert.match(act("cam_cab").text, /22:04:05 Vũ mở cửa cabin/);
  assert.match(act("cam_bs").text, /21:58 một người đàn ông vest xám/);
});

test("ngoại phạm: cả sáu người đều bị bác, mỗi người vì một lý do khác nhau; trước khi có camera thì chưa ai bị bác", () => {
  const stm = ["loi_vu", "loi_ngan", "loi_tham", "loi_kien", "loi_trang", "loi_phuong", "cam_cab", "cam_cong_bt", "cam_occ", "cam_bs", "cam_toa3", "nk_cong_bs", "nk_cua_vp", "nk_the_bt"];
  const g = closeDeductions(withDone(stm), c);
  const al = (who) => alibisOf(g, c).find((a) => a.who === who);
  assert.equal(al("phuong").status, "clash", "Phương rời tầng 3 từ 21:54 tới 22:14 và có vòng ra-vào Bến Thành");
  assert.equal(al("vu").status, "clash", "Vũ ra sân ga Ba Son lúc 22:04");
  assert.equal(al("tham").status, "clash", "Thắm ra hành lang 22:10–22:22");
  assert.equal(al("kien").status, "clash", "Kiên ở sân ga Ba Son, không ở nhà hàng");
  assert.equal(al("trang").status, "clash", "Trang ở văn phòng, không ở nhà");
  assert.equal(al("ngan").status, "clash", "Ngân ra ga Ba Son lúc 22:05");
  const before = alibisOf(withDone(["loi_vu", "loi_ngan", "loi_tham", "loi_kien", "loi_trang", "loi_phuong"]), c);
  assert.ok(before.every((a) => a.status === "open"));
});

test("mã điện thoại của Thịnh là 1207: số hiệu đoàn tàu (ĐT-12, nhãn dưới tay vịn) rồi số hiệu chuyến (U-07, bảng giờ), theo lời Trang", () => {
  assert.match(act("ban_ghe").text, /ĐT-12/);
  assert.match(act("bang_gio").text, /chuyến số 07 \(U-07\)/);
  assert.match(act("loi_trang").text, /số hiệu đoàn tàu rồi số hiệu chuyến, bốn số/);
  assert.equal(act("dt_thinh").lock.code, "1207");
  assert.equal(act("dt_thinh").lock.digits, 4);
  assert.ok(c.locations.some((L) => L.hs.some((h) => h[0] === "ban_ghe" && h[4] === "soi")));
  const g0 = newGame(idx, c);
  assert.equal(attemptLock(g0, c, "dt_thinh", "0712").status, "wrong", "chuyến rồi đoàn");
  assert.equal(attemptLock(g0, c, "dt_thinh", "1200").status, "wrong");
  assert.equal(attemptLock(g0, c, "dt_thinh", "1207").status, "open");
  let g = g0;
  for (let i = 0; i < LOCK_TRIES - 1; i++) g = attemptLock(g, c, "dt_thinh", "0000").game;
  assert.equal(attemptLock(g, c, "dt_thinh", "0000").status, "locked", "sai ba lần thì thiết bị tự khóa");
});

test("hồ sơ về muộn và cổng mở khóa: sao kê tài khoản công ty chỉ xin được khi biết nghiệm thu phanh là khống", () => {
  const g0 = newGame(idx, c);
  for (const [id, h] of [["cam_toa3", 2], ["nk_the_bt", 3], ["nk_bieu_do", 4], ["doc_chat", 5]]) {
    assert.ok(isPending(g0, c, id), `${id} chưa về lúc đầu`);
    assert.equal(performAct(g0, c, id), g0);
    assert.ok(waitFor(g0, c, id).hours >= g0.hours - h - 1, `${id}: chờ quá ${h + 1} giờ`);
  }
  assert.equal(gated(g0, c, "sao_ke_nh"), true);
  assert.equal(gated(closeDeductions(withDone(["ho_so_phanh", "hd_thau"]), c), c, "sao_ke_nh"), false, "hồ sơ phanh + hợp đồng mở được sao kê");
  assert.equal(gated(closeDeductions(withDone(["ho_so_phanh", "trang_thu"]), c), c, "sao_ke_nh"), false, "lối lời thú nhận của Trang cũng mở được");
  assert.ok(play(["ho_so_phanh", "hd_thau", "sao_ke_nh"]).done.k_hoi_lo);
  assert.ok(play(["ho_so_phanh", "hd_thau", "dt_thinh", "loi_trang"]).done.k_dong_co, "lối động cơ không qua sao kê ngân hàng");
  assert.match(act("sao_ke_nh").text, /0907 441 028/);
  assert.match(act("hd_thau").text, /Phương, ĐT 0907 441 028/, "số điện thoại nối công ty Thiện Nhân với đầu mối nghiệm thu");
});

test("hồ sơ và nghi phạm không biến mất theo thời gian, dù đồng hồ đã chạy hết ngân sách giờ", () => {
  assert.ok((c.world || []).every((w) => w.kind === "arrive"), "chỉ còn diễn biến hồ sơ về muộn");
  for (const a of c.actions.filter((x) => !x.via)) {
    assert.equal(isGone(at(0), c, a.id), false, `${a.id}: mất ngay từ đầu`);
    assert.equal(isGone(at(c.budget), c, a.id), false, `${a.id}: mất theo thời gian`);
  }
  for (const s of c.suspects) assert.equal(departed(at(c.budget), c, s.id), false, `${s.id}: rời đi theo thời gian`);
  for (const id of ["cam_bs", "bieu_do", "phap_y", "nk_cua_vp", "loi_phuong"]) {
    assert.ok(isOpen(at(c.budget - 2), c, id), `${id}: vẫn làm được khi gần hết giờ`);
  }
});

// Lời giải ngắn nhất, và các lối độc lập cho từng bước
const PLAN = ["cam_bs", "nk_cua_chan", "bieu_do", "nk_bieu_do", "ho_so_phanh", "hd_thau", "sao_ke_nh"];
const GOOD = { when: "k_xuong_ba_son", escape: "k_chinh_bieu_do", motive: "k_hoi_lo" };

test("lời giải ngắn nhất đi được, còn dư ít nhất 4 giờ, và buộc tội đúng thì thắng", () => {
  const g = play(PLAN);
  assert.ok(c.budget - g.hours <= c.budget - 4, `tốn ${c.budget - g.hours}/${c.budget} giờ`);
  for (const st of c.chain) assert.ok(st.ids.some((i) => g.done[i]), `${st.key}: chưa có chứng cứ`);
  assert.equal(judge(c, "phuong", GOOD).win, true);
  assert.equal(judge(c, "phuong", { when: "k_chet_giua_chang", escape: "k_vong_ga", motive: "k_dong_co" }).win, true, "lối kỹ hơn cũng thắng");
  assert.equal(judge(c, "phuong", { when: "k_xuong_ba_son", escape: "k_con_lai_phuong", motive: "k_hoi_lo" }).win, true, "lối loại trừ cũng thắng");
});

test("mỗi bước có ít nhất hai lối chứng cứ độc lập, đi được trong ngân sách", () => {
  const routes = {
    when: [["cam_bs", "nk_cua_chan"], ["phap_y", "dt_thinh"], ["cam_toa3", "nk_vi_tri"]],
    escape: [["nk_bieu_do", "bieu_do"], ["nk_cong_bt", "nk_the_bt", "so_do_ba_son", "bieu_do", "cam_bs"],
      ["cam_cab", "cam_occ", "cam_bs", "nk_cua_chan", "nk_cua_vp", "nk_cong_bs", "nk_the_bt", "cam_toa3"]],
    motive: [["ho_so_phanh", "hd_thau", "sao_ke_nh"], ["ho_so_phanh", "hd_thau", "dt_thinh", "loi_trang"]]
  };
  for (const st of c.chain) {
    let ok = 0;
    for (const path of routes[st.key]) {
      let g;
      try { g = play(path); } catch { continue; }
      if (g.hours >= 0 && st.ids.some((i) => g.done[i])) ok++;
    }
    assert.ok(ok >= 2, `${st.key}: chỉ ${ok} lối chứng cứ đi được`);
  }
  // Khóa mã không cản đường chứng minh: điện thoại Thịnh cho ra một lối khác của bước "when"
  assert.ok(play(["phap_y", "dt_thinh"]).done.k_chet_giua_chang);
});

test("buộc tội sai: nhầm người (nhất là Kiên), nhầm chứng cứ sang bước khác, thiếu chứng cứ đều thua", () => {
  for (const who of ["ngan", "vu", "tham", "trang", "kien"]) assert.equal(judge(c, who, GOOD).win, false, who);
  assert.equal(judge(c, "phuong", { ...GOOD, motive: "k_xuong_ba_son" }).win, false);
  assert.equal(judge(c, "phuong", { ...GOOD, when: "k_dong_co" }).win, false);
  assert.equal(judge(c, "phuong", { ...GOOD, escape: "bieu_do" }).win, false, "hồ sơ gốc không đủ làm chứng cứ");
  assert.equal(judge(c, "phuong", { ...GOOD, escape: null }).win, false);
  const r = judge(c, "kien", GOOD);
  assert.equal(r.right, false);
  assert.ok(r.steps.every((s) => s.ok), "đúng chứng cứ nhưng sai người vẫn thua");
  // Mỗi người ngoài cuộc có hồ sơ độc lập loại trừ (camera, nhật ký cửa, sổ thẻ)
  assert.equal(act("cam_cab").type, "Camera");
  assert.equal(act("cam_occ").type, "Camera");
  assert.equal(act("cam_bs").type, "Camera");
  assert.match(act("nk_cua_vp").text, /Trang từ 19:40 tới 22:20 ở trong văn phòng/);
});

test("đưa chứng cứ: năm người thú nhận chuyện riêng; Phương chỉ phản ứng, không bao giờ thú nhận", () => {
  const stmt = { ngan: "loi_ngan", vu: "loi_vu", tham: "loi_tham", kien: "loi_kien", trang: "loi_trang" };
  const withStm = (who, clue) => performConfront(play([stmt[who], clue]), c, who, clue);
  for (const [who, clue, reveal] of [["ngan", "nk_cong_bs", "ngan_thu"], ["vu", "cam_cab", "vu_thu"], ["tham", "cam_occ", "tham_thu"], ["kien", "cam_bs", "kien_thu"], ["trang", "nk_cua_vp", "trang_thu"]]) {
    assert.ok(withStm(who, clue).done[reveal], `${who}: phải thú nhận ${reveal}`);
  }
  // Camera sảnh chỉ làm Ngân ngập ngừng, không mở lời khai
  assert.ok(!withStm("ngan", "cam_cong_bt").done.ngan_thu);
  assert.match(act("ngan_thu").text, /ba triệu cho em trai/);
  assert.match(act("tham_thu").text, /chị Phương đưa bản mới/, "Thắm chỉ ra người đưa biểu đồ mới khi bị đưa chứng cứ");
  const p = c.confront.filter((r) => r.who === "phuong");
  assert.ok(p.length >= 6 && p.every((r) => !r.reveal), "Phương có nhiều phản ứng nhưng không thú nhận");
  const g = play(["loi_phuong", "nk_cua_vp"]);
  assert.ok(confrontOptions(g, c, "phuong").includes("nk_cua_vp"));
  const after = performConfront(g, c, "phuong", "nk_cua_vp");
  assert.notEqual(after, g);
  assert.equal(after.found.length, g.found.length, "phản ứng của Phương không mở lời khai mới");
});

test("động cơ: hợp đồng bắt buộc thử phanh, mười một biên bản khống, 2,4 tỷ chảy về anh rể người ký, hạn nộp báo cáo 07:00", () => {
  assert.match(act("hd_thau").text, /Điều 9\.3: mỗi đoàn tàu phải thử phanh khẩn 120 lần mỗi năm/);
  assert.match(act("ho_so_phanh").text, /Khống\. 11\/14\. 7h nộp\./);
  assert.match(act("sao_ke_nh").text, /tổng 2,4 tỷ/);
  assert.match(act("dt_thinh").text, /07:00 thứ Sáu “Nộp báo cáo phanh bogie 14 đoàn tàu/);
  let g = play(["ho_so_phanh", "hd_thau"]);
  assert.ok(g.done.k_nghiem_thu_khong);
  g = play(["sao_ke_nh"], g);
  assert.ok(g.done.k_hoi_lo);
  g = play(["dt_thinh", "loi_trang"], g);
  assert.ok(g.done.k_han_7h && g.done.k_dong_co);
  assert.ok(c.budget - g.hours <= 6, `tốn ${c.budget - g.hours} giờ`);
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
  assert.ok(g.done.k_xuong_ba_son && g.done.k_chinh_bieu_do && g.done.k_hoi_lo, "gợi ý đi theo lối ngắn nhất của từng bước");
});

test("giao diện vụ s5 dựng được: HUD, sổ tay mọi tab, chuỗi chứng minh; mọi cảnh và khung camera vẽ được", () => {
  const g = play(PLAN);
  assert.match(T.hudHTML(g, c, c.locations[0]), /Sài Gòn · Vụ 5/);
  for (const tab of ["sus", "ho", "dd", "tl"]) assert.ok(notebookHTML({ ...g, tab }, c).length > 200, tab);
  const html = T.accuseHTML(g, c, { culprit: null, steps: {} });
  assert.match(html, /Giờ và nơi ra tay/);
  assert.match(html, /Đường biến mất/);
  assert.match(html, /Động cơ/);
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
  const cams = c.actions.filter((x) => x.visual && x.visual.k === "cam");
  assert.equal(cams.length, 5);
  for (const a of cams) assert.ok(ART.evidence(a.visual).includes("REC"), `${a.id}: khung camera`);
  assert.equal(new Set(cams.map((a) => a.visual.scene)).size, 5, "mỗi camera một khung riêng");
});

test("mỗi hình giấy tờ gọn trong khung: tối đa năm dòng, không dòng nào quá dài", () => {
  for (const a of c.actions.filter((x) => x.visual && x.visual.k === "paper")) {
    assert.ok(a.visual.rows.length <= 5, `${a.id}: ${a.visual.rows.length} dòng`);
    assert.ok(a.visual.title.length <= 33, `${a.id}: tiêu đề quá dài`);
    for (const r of a.visual.rows) assert.ok(r.length <= 41, `${a.id}: dòng quá dài (${r.length}): ${r}`);
  }
});

test("hộp thoại mở đầu chỉ nhắc cơ chế mà vụ có: s5 không nhắc giờ máy lệch", () => {
  const html = T.briefingHTML(c);
  assert.doesNotMatch(html, /giờ máy lệch/);
  assert.match(html, /về muộn/);
  assert.match(html, /mã số/);
  assert.match(html, /Suy luận/);
  assert.match(html, /Hai Phút Một Ga/);
});
