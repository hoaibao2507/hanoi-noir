/* Kiểm thử vụ s6 "Âm Mười Tám Độ" (kho lạnh chợ Bến Thành): giờ chết bị đẩy sớm lên bởi cái lạnh, tủ cấp đông nhanh làm giả mốc chín tiếng, cửa chuyển hàng không cảm biến, số học tải trọng xe nâng, vòng loại trừ ở 23:26–23:44, khóa mã nhiệt độ hai buồng, hồ sơ về muộn và lời giải. */
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

const idx = CASES.findIndex((c) => c.id === "s6");
const c = CASES[idx];
const s5 = CASES.find((x) => x.id === "s5");
const act = (id) => c.actions.find((a) => a.id === id);
const withDone = (ids, extra = {}) => ({ ...newGame(idx, c), done: Object.fromEntries(ids.map((i) => [i, true])), found: [...ids], ...extra });
const at = (spent) => ({ ...newGame(idx, c), hours: c.budget - spent });
const stars = (s) => (s.match(/★/g) || []).length;
// "21:56:58" hoặc "21:56" → số giây trong ngày
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

test("vụ s6 thuộc vùng Sài Gòn, là vụ số 6, có Vũ, Ngân, Thắm, Trang cùng hai nhân vật do tác giả đặt", () => {
  assert.equal(c.region, "sg");
  assert.equal(c.no, 6);
  assert.equal(idx, 5, "s6 nằm cuối danh sách để bản lưu của s1–s5 không đổi chỉ số");
  assert.deepEqual(casesOf("sg").map((x) => x.id).slice(0, 6), ["s1", "s2", "s3", "s4", "s5", "s6"]);
  const names = c.suspects.map((s) => s.name);
  for (const n of ["Vũ", "Ngân", "Thắm", "Trang", "Hưng", "Hạnh"]) assert.ok(names.includes(n), `${n} phải có trong vụ`);
  assert.equal(c.suspects.length, 6);
  assert.equal(c.culprit, "hanh");
  assert.notEqual(c.culprit, "hung", "người bị nghi đầu tiên (thợ máy lạnh, hay cãi nạn nhân) không phải người có tội");
  assert.match(c.place, /Kho lạnh Hợp tác xã Chợ Bến Thành/);
  assert.ok(c.suspects.every((s) => s.look && s.bio && s.role));
  assert.equal(c.locations[0].scene, "sg_cs_cold", "thẻ vụ ở menu lấy cảnh đầu tiên: Buồng 2 trữ đông");
  assert.equal(c.clock.start, "06:10");
});

test("độ khó không thấp hơn vụ s5: không ít sao, điểm, kết luận, dòng suy luận và người nói dối", () => {
  assert.ok(stars(c.level) >= stars(s5.level), `${c.level} phải ≥ ${s5.level}`);
  assert.equal(c.budget, 15);
  const points = (x) => x.actions.filter((a) => !a.via).length;
  assert.ok(points(c) >= points(s5), `s6 ${points(c)} điểm điều tra, s5 ${points(s5)}`);
  assert.ok(c.budget * 2 >= points(c), `${points(c)} điểm điều tra cần ít nhất ${points(c) / 2} giờ`);
  const concl = (x) => x.actions.filter((a) => a.via === "deduce").length;
  assert.ok(concl(c) >= concl(s5), `s6 ${concl(c)} kết luận, s5 ${concl(s5)}`);
  assert.ok(c.deduce.length >= 30);
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
  assert.deepEqual(c.chain.map((s) => s.key), ["freeze", "hands", "motive"]);
  for (const st of c.chain) for (const i of st.ids) assert.equal(act(i).via, "deduce", `${st.key}: chứng cứ của bước phải là kết luận`);
});

test("cái lạnh làm giờ chết bị đẩy sớm: các phép tính giữa sổ cửa, bảng quy đổi, tủ cấp đông và xe nâng khớp từng giây", () => {
  // Mốc bẫy: ≥ 9 giờ ở −18°C tính từ lúc thấy thi thể (05:11) → vào buồng trước 20:10; sổ cửa Buồng 2 chỉ mở 19:12:08–19:18:40
  const nineBefore = sec("05:11:12") + 24 * 3600 - 9 * 3600;
  assert.ok(nineBefore >= sec("20:08:00") && nineBefore <= sec("20:12:00"), "9 giờ trước 05:11 là khoảng 20:10");
  assert.equal(sec("19:18:40") - sec("19:12:08"), 6 * 60 + 32);
  assert.match(act("phap_y").text, /ít nhất 9 giờ/);
  assert.match(act("phap_y").text, /từ trước 20:10/);
  assert.match(act("nk_cua_b2").text, /mở 19:12:08, đóng 19:18:40 \(6 phút 32 giây/);
  // Ông còn sống 22:33:40, hơn hai tiếng sau mốc bẫy
  assert.equal(sec("22:33:40") - sec("20:10:00"), 2 * 3600 + 23 * 60 + 40);
  assert.match(act("k_song_toi_22h").text, /hơn hai tiếng sau/);
  assert.match(act("cam_cong").text, /22:33:40 ông xuống hầm lần cuối/);
  assert.match(act("dt_dong").text, /22:31:05 gọi đi Trang 41 giây/);
  // Tủ cấp đông: chu kỳ đúng 180 phút, tự dừng
  assert.equal(sec("23:53:41") + 180 * 60, sec("02:53:41") + 24 * 3600);
  assert.equal(sec("23:53:40") - sec("23:49:30"), 4 * 60 + 10, "cửa Buồng 3 mở bốn phút mười giây");
  assert.match(act("nk_cap_dong").text, /23:53:41 khởi động chương trình P-180/);
  assert.match(act("nk_cap_dong").text, /02:53:41 chu kỳ kết thúc/);
  assert.match(act("thong_so").text, /180 phút, hàng tới 100 kg/);
  // Thi thể 78 kg = tải 98 kg trừ pallet 20 kg, lọt giới hạn 100 kg của tủ
  assert.equal(98 - 20, 78);
  assert.match(act("hien_truong").text, /78 kg/);
  assert.match(act("phap_y").text, /nặng 78 kg/);
  assert.match(act("xe_nang").text, /tải tăng từ 0 lên 98 kg/);
  assert.match(act("xe_nang").text, /Pallet rỗng 20 kg/);
  assert.ok(78 <= 100);
  // Năm mươi ba phút giữa lần xuống hầm cuối và lúc bắt đầu đẩy xe; ông nằm trong Buồng 2 chỉ hơn hai tiếng
  assert.equal(sec("23:26:40") - sec("22:33:40"), 53 * 60);
  assert.equal(sec("05:11:12") - sec("02:58:00"), 2 * 3600 + 13 * 60 + 12);
  assert.match(act("k_gio_that").text, /năm mươi ba phút/);
  assert.match(act("k_dong_gia").text, /hai tiếng mười ba phút/);
  // Lô 4C: nhập 12,4 tấn, tồn 6,2 tấn, đã xuất 1,8 + 2,1 + 2,3 = 6,2 tấn
  assert.ok(Math.abs(1.8 + 2.1 + 2.3 - 6.2) < 1e-9 && Math.abs(12.4 - 6.2 - 6.2) < 1e-9);
  assert.match(act("so_kiem_ke").text, /nhập 12,4 tấn, tồn 6,2 tấn/);
  assert.match(act("so_kiem_ke").text, /1,8 – 2,1 – 2,3 tấn/);
});

test("giờ chết thật và cái lạnh: hai lối ra kết luận cấp đông nhanh, hai lối ra cửa chuyển hàng, thiếu mắt xích thì không ra", () => {
  assert.ok(closeDeductions(withDone(["thong_so", "phap_y_ct"]), c).done.k_cap_dong_nhanh, "lối giải phẫu + bảng thông số tủ");
  assert.ok(closeDeductions(withDone(["nk_cap_dong", "phap_y_ct"]), c).done.k_cap_dong_nhanh, "lối giải phẫu + bộ điều khiển tủ");
  assert.ok(!closeDeductions(withDone(["thong_so", "nk_cap_dong"]), c).done.k_cap_dong_nhanh, "thiếu giải phẫu thì chưa biết tinh thể đá nhỏ");
  assert.ok(!closeDeductions(withDone(["phap_y", "thong_so"]), c).done.k_cap_dong_nhanh, "pháp y sơ bộ không đủ, nó còn ủng hộ mốc chín tiếng");
  assert.ok(closeDeductions(withDone(["so_do_kho", "nk_cua_b2"]), c).done.k_cua_chuyen, "lối sơ đồ + sổ cửa");
  assert.ok(closeDeductions(withDone(["cua_chuyen", "nk_nhiet"]), c).done.k_cua_chuyen, "lối cửa thật + cảm biến nhiệt");
  assert.ok(!closeDeductions(withDone(["nk_cua_b2", "nk_nhiet"]), c).done.k_cua_chuyen, "sổ cửa và nhiệt chưa đủ nếu không có sơ đồ hay cửa thật");
  assert.ok(closeDeductions(withDone(["xe_nang", "nk_cap_dong"]), c).done.k_xe_nang);
  assert.ok(closeDeductions(withDone(["xe_nang", "phap_y"]), c).done.k_xe_nang, "lối cân nặng thi thể");
  assert.ok(play(["dt_dong", "cam_cong"]).done.k_song_toi_22h, "lối điện thoại + camera cổng");
  assert.ok(play(["dt_dong", "loi_trang"]).done.k_song_toi_22h, "lối điện thoại + lời Trang");
  assert.ok(!closeDeductions(withDone(["cam_cong"]), c).done.k_song_toi_22h, "thiếu điện thoại");
  assert.ok(play(["dt_dong", "cam_cong", "xe_nang", "nk_cap_dong"]).done.k_gio_that, "ông còn sống tới 22:33 và xe nâng bắt đầu lúc 23:26");
  assert.ok(play(["thong_so", "phap_y_ct", "so_do_kho", "nk_cua_b2"]).done.k_dong_gia, "mốc chín tiếng là giả");
  assert.ok(play(["phap_y_ct", "hien_truong"]).done.k_chet_noi_khac);
  assert.ok(play(["so_do_kho", "cam_dock"]).done.k_loi_vao_dem);
  assert.match(act("phap_y_ct").text, /Tinh thể đá trong mô gan và cơ nhỏ, đều/);
  assert.match(act("nk_nhiet").text, /02:58–03:02 tăng nhẹ từ −18,0 lên −16,7°C/);
  assert.match(act("so_do_kho").text, /không cảm biến/);
});

test("vòng loại trừ ở 23:26–23:44: năm nguồn che năm người, chỉ còn Hạnh", () => {
  const roots = ["cam_t2", "xe_nang", "nk_cap_dong", "cam_dock", "can_dock", "cam_cuahang", "phieu_hung", "video_tiec", "loi_hanh"];
  const g = play(roots);
  for (const k of ["k_xe_nang", "k_loai_ngan", "k_loai_vu_tham", "k_loai_trang_hung", "k_loai_ba", "k_loai_nam", "k_hanh_roi_tiec", "k_con_lai_hanh"]) assert.ok(g.done[k], `${k} phải rút ra được`);
  // Thiếu một nguồn che thì không ra kết luận cuối
  for (const miss of ["cam_t2", "cam_dock", "can_dock", "cam_cuahang", "phieu_hung", "video_tiec", "loi_hanh"]) {
    const g2 = play(roots.filter((x) => x !== miss));
    assert.ok(!g2.done.k_con_lai_hanh, `thiếu ${miss} vẫn ra k_con_lai_hanh`);
  }
  assert.match(act("k_con_lai_hanh").text, /chỉ chị không có chứng cứ nào cho thấy chị ở chỗ khác/);
  assert.match(act("cam_t2").text, /22:38:20 Ngân đi lên cầu thang/);
  assert.match(act("cam_dock").text, /Từ 22:50 tới 00:20 anh ngồi trong cabin/);
  assert.match(act("can_dock").text, /bảy lần xác nhận cách nhau đúng năm phút/);
  assert.match(act("video_tiec").text, /22:05:20 Hạnh bắt tay vị khách cuối/);
  assert.match(act("phieu_hung").text, /bắt đầu 22:35, hoàn tất 00:40/);
  // Mọi khoảng che trùm trọn cửa sổ xe nâng chạy tải 23:26:40–23:44:50
  const cover = (id, who) => act(id).spans.find((s) => s.who === who);
  for (const [id, who] of [["cam_t2", "ngan"], ["cam_dock", "vu"], ["can_dock", "tham"], ["cam_cuahang", "trang"], ["phieu_hung", "hung"]]) {
    const s = cover(id, who);
    assert.ok(sec(s.from) <= sec("23:26:40") && sec(s.to) >= sec("23:44:50"), `${who}: khoảng che ${s.from}–${s.to} phải trùm 23:26:40–23:44:50`);
  }
  // Ba người dự tiệc có ngoại phạm hoàn hảo ở khung giờ bẫy 19:12–20:10
  for (const who of ["hanh", "ngan", "tham"]) {
    const s = cover("video_tiec", who);
    assert.ok(sec(s.from) <= sec("19:12") && sec(s.to) >= sec("20:10"), `${who} ở tiệc suốt 19:12–20:10`);
  }
  // Hạnh rời tiệc lúc 22:05, sớm hơn lời khai 22:20 về nhà, và không mốc nào đặt chị ở đâu sau đó
  assert.equal(cover("video_tiec", "hanh").to, "22:05");
  assert.ok(!c.actions.some((a) => (a.spans || []).some((s) => s.who === "hanh" && sec(s.to) > sec("22:05"))));
});

test("ngoại phạm: năm người bị bác, mỗi người vì một lý do khác nhau; Hạnh không bị bác nên chỉ còn lời của chính chị; trước khi có hồ sơ thì chưa ai bị bác", () => {
  const stm = ["loi_hung", "loi_vu", "loi_tham", "loi_ngan", "loi_hanh", "loi_trang", "cam_t2", "cam_dock", "can_dock", "cam_cuahang", "phieu_hung", "video_tiec"];
  const g = closeDeductions(withDone(stm), c);
  const al = (who) => alibisOf(g, c).find((a) => a.who === who);
  assert.equal(al("hung").status, "clash", "Hưng ở nhà hàng Ngọc Lan, không nằm nhà ốm");
  assert.equal(al("vu").status, "clash", "Vũ ngủ trong cabin, không về nhà");
  assert.equal(al("tham").status, "clash", "Thắm ở phòng cân, không về nhà");
  assert.equal(al("ngan").status, "clash", "Ngân ở phòng kế toán, không về nhà");
  assert.equal(al("trang").status, "clash", "Trang ở cửa hàng tiện lợi, không ở ký túc xá");
  assert.equal(al("hanh").status, "open", "chị rời tiệc 22:05 và từ đó chỉ có lời của chính chị");
  const before = alibisOf(withDone(["loi_hung", "loi_vu", "loi_tham", "loi_ngan", "loi_hanh", "loi_trang"]), c);
  assert.ok(before.every((a) => a.status === "open"));
});

test("mã điện thoại của Đông là 1840: nhiệt độ Buồng 2 (nhãn đồng) rồi buồng cấp đông (bảng thông số), bỏ dấu âm, theo lời Trang", () => {
  assert.match(act("nhan_b2").text, /−18°C/);
  assert.match(act("thong_so").text, /−40°C/);
  assert.match(act("loi_trang").text, /buồng thường trước, buồng cấp đông sau, bỏ dấu âm/);
  assert.equal(act("dt_dong").lock.code, "1840");
  assert.equal(act("dt_dong").lock.digits, 4);
  assert.ok(c.locations.some((L) => L.hs.some((h) => h[0] === "nhan_b2" && h[4] === "soi")), "nhãn đồng là dấu vết ẩn, cần đèn pin");
  const g0 = newGame(idx, c);
  assert.equal(attemptLock(g0, c, "dt_dong", "4018").status, "wrong", "buồng cấp đông rồi buồng thường");
  assert.equal(attemptLock(g0, c, "dt_dong", "1800").status, "wrong");
  assert.equal(attemptLock(g0, c, "dt_dong", "1840").status, "open");
  let g = g0;
  for (let i = 0; i < LOCK_TRIES - 1; i++) g = attemptLock(g, c, "dt_dong", "0000").game;
  assert.equal(attemptLock(g, c, "dt_dong", "0000").status, "locked", "sai ba lần thì thiết bị tự khóa");
});

test("hồ sơ về muộn và cổng mở khóa: đăng ký kinh doanh Bình An chỉ xin được khi biết lô 4C bị đổi tem", () => {
  const g0 = newGame(idx, c);
  for (const [id, h] of [["nk_nhiet", 1], ["phap_y_ct", 2], ["cam_cuahang", 3], ["video_tiec", 4]]) {
    assert.ok(isPending(g0, c, id), `${id} chưa về lúc đầu`);
    assert.equal(performAct(g0, c, id), g0);
    assert.ok(waitFor(g0, c, id).hours >= g0.hours - h - 1, `${id}: chờ quá ${h + 1} giờ`);
  }
  assert.equal(gated(g0, c, "dkkd_binh_an"), true);
  assert.equal(gated(closeDeductions(withDone(["so_kiem_ke", "pallet_tem"]), c), c, "dkkd_binh_an"), false, "bản kiểm kê + pallet mở được đăng ký kinh doanh");
  assert.equal(gated(closeDeductions(withDone(["pallet_tem", "may_in_tem"]), c), c, "dkkd_binh_an"), false, "lối pallet + máy in tem cũng mở được");
  assert.equal(gated(closeDeductions(withDone(["so_kiem_ke", "may_in_tem"]), c), c, "dkkd_binh_an"), false);
  assert.ok(play(["so_kiem_ke", "pallet_tem", "dkkd_binh_an"]).done.k_loi_ich_hanh);
  assert.ok(play(["so_kiem_ke", "pallet_tem", "dkkd_binh_an", "loi_trang"]).done.k_dong_co, "lối động cơ qua đăng ký kinh doanh");
  assert.ok(play(["so_kiem_ke", "pallet_tem", "loi_trang"]).done.k_dong_co, "lối động cơ không qua đăng ký kinh doanh: lô 4C đổi tem + hạn thứ Hai");
  assert.match(act("dkkd_binh_an").text, /quan hệ: vợ/);
  assert.match(act("hd_bep_an").text, /Dương Mỹ Hạnh/);
  assert.match(act("may_in_tem").text, /Đóng gói cho Bếp ăn Bình An/);
});

test("hồ sơ và nghi phạm không biến mất theo thời gian, dù đồng hồ đã chạy hết ngân sách giờ", () => {
  assert.ok((c.world || []).every((w) => w.kind === "arrive"), "chỉ còn diễn biến hồ sơ về muộn");
  for (const a of c.actions.filter((x) => !x.via)) {
    assert.equal(isGone(at(0), c, a.id), false, `${a.id}: mất ngay từ đầu`);
    assert.equal(isGone(at(c.budget), c, a.id), false, `${a.id}: mất theo thời gian`);
  }
  for (const s of c.suspects) assert.equal(departed(at(c.budget), c, s.id), false, `${s.id}: rời đi theo thời gian`);
  for (const id of ["cam_dock", "xe_nang", "phap_y", "cam_t2", "loi_hanh"]) {
    assert.ok(isOpen(at(c.budget - 2), c, id), `${id}: vẫn làm được khi gần hết giờ`);
  }
});

// Lời giải ngắn nhất, và các lối độc lập cho từng bước. Bước "hands" cần đưa chứng cứ nên dựng riêng.
function planShort() {
  let g = play(["thong_so", "phap_y_ct", "loi_hung", "phieu_hung"]);
  g = closeDeductions(performConfront(g, c, "hung", "phieu_hung"), c);
  return play(["so_kiem_ke", "pallet_tem", "dkkd_binh_an"], g);
}
const GOOD = { freeze: "k_cap_dong_nhanh", hands: "k_hanh_biet_chu_ky", motive: "k_loi_ich_hanh" };

test("lời giải ngắn nhất đi được, còn dư ít nhất 4 giờ, và buộc tội đúng thắng", () => {
  const g = planShort();
  assert.ok(c.budget - g.hours <= c.budget - 4, `tốn ${c.budget - g.hours}/${c.budget} giờ`);
  for (const st of c.chain) assert.ok(st.ids.some((i) => g.done[i]), `${st.key}: chưa có chứng cứ`);
  assert.equal(judge(c, "hanh", GOOD).win, true);
  assert.equal(judge(c, "hanh", { freeze: "k_gio_that", hands: "k_con_lai_hanh", motive: "k_dong_co" }).win, true, "lối kỹ hơn cũng thắng");
  assert.equal(judge(c, "hanh", { freeze: "k_dong_gia", hands: "k_con_lai_hanh", motive: "k_loi_ich_hanh" }).win, true, "lối loại trừ cũng thắng");
});

test("mỗi bước có ít nhất hai lối chứng cứ độc lập, đi được trong ngân sách", () => {
  const routes = {
    freeze: [["thong_so", "phap_y_ct"], ["dt_dong", "cam_cong", "xe_nang", "nk_cap_dong"], ["so_do_kho", "nk_cua_b2", "thong_so", "phap_y_ct"]],
    hands: [["cam_t2", "xe_nang", "nk_cap_dong", "cam_dock", "can_dock", "cam_cuahang", "phieu_hung", "video_tiec", "loi_hanh"]],
    motive: [["so_kiem_ke", "pallet_tem", "dkkd_binh_an"], ["so_kiem_ke", "pallet_tem", "dkkd_binh_an", "loi_trang"], ["pallet_tem", "may_in_tem", "dkkd_binh_an", "dt_dong", "so_kiem_ke"]]
  };
  for (const st of c.chain) {
    let ok = 0;
    for (const path of routes[st.key]) {
      let g;
      try { g = play(path); } catch { continue; }
      if (g.hours >= 0 && st.ids.some((i) => g.done[i])) ok++;
    }
    assert.ok(ok >= (st.key === "hands" ? 1 : 2), `${st.key}: chỉ ${ok} lối chứng cứ đi được`);
  }
  // Bước "hands" có lối thứ hai: lời thú nhận của Hưng + kết luận cấp đông nhanh (qua đưa chứng cứ)
  let g = play(["thong_so", "phap_y_ct", "loi_hung", "phieu_hung"]);
  g = closeDeductions(performConfront(g, c, "hung", "phieu_hung"), c);
  assert.ok(g.done.hung_thu && g.done.k_hanh_biet_chu_ky);
  assert.ok(g.hours >= 6, "lối biết trước tủ cấp đông đi được rất rẻ");
  // Khóa mã không cản đường chứng minh
  assert.ok(play(["thong_so", "phap_y_ct"]).done.k_cap_dong_nhanh);
});

test("buộc tội sai: nhầm người (nhất là Hưng), nhầm chứng cứ sang bước khác, thiếu chứng cứ đều thua", () => {
  for (const who of ["ngan", "vu", "tham", "trang", "hung"]) assert.equal(judge(c, who, GOOD).win, false, who);
  assert.equal(judge(c, "hanh", { ...GOOD, motive: "k_cap_dong_nhanh" }).win, false);
  assert.equal(judge(c, "hanh", { ...GOOD, freeze: "k_dong_co" }).win, false);
  assert.equal(judge(c, "hanh", { ...GOOD, hands: "dkkd_binh_an" }).win, false, "hồ sơ gốc không đủ làm chứng cứ");
  assert.equal(judge(c, "hanh", { ...GOOD, hands: null }).win, false);
  const r = judge(c, "hung", GOOD);
  assert.equal(r.right, false);
  assert.ok(r.steps.every((s) => s.ok), "đúng chứng cứ nhưng sai người vẫn thua");
  // Cái bẫy "H" trong ghi chú: Hưng và Hạnh cùng chữ cái đầu, và Hưng bị loại bằng phiếu công lệnh độc lập
  assert.match(act("dt_dong").text, /Nói với H lần cuối/);
  assert.equal(act("phieu_hung").type, "Vật chứng");
  assert.match(act("phieu_hung").text, /Không có tên Hợp tác xã trên phiếu/);
});

test("đưa chứng cứ: năm người thú nhận chuyện riêng; Hạnh chỉ phản ứng, không bao giờ thú nhận", () => {
  const stmt = { ngan: "loi_ngan", vu: "loi_vu", tham: "loi_tham", trang: "loi_trang", hung: "loi_hung" };
  const withStm = (who, clue) => performConfront(play([stmt[who], clue]), c, who, clue);
  for (const [who, clue, reveal] of [["ngan", "cam_t2", "ngan_thu"], ["vu", "cam_dock", "vu_thu"], ["tham", "can_dock", "tham_thu"], ["trang", "cam_cuahang", "trang_thu"], ["hung", "phieu_hung", "hung_thu"]]) {
    assert.ok(withStm(who, clue).done[reveal], `${who}: phải thú nhận ${reveal}`);
  }
  assert.match(act("ngan_thu").text, /910 triệu/);
  assert.match(act("ngan_thu").text, /chị Hạnh dặn: dòng ấy để chị lo/, "Ngân kể Hạnh dặn gạch ba dòng xuất kho lô 4C");
  assert.match(act("vu_thu").text, /340 kg cá không hóa đơn/);
  assert.match(act("vu_thu").text, /ánh đèn vàng quay của xe nâng/);
  assert.match(act("tham_thu").text, /ký “−16°C” cho hàng mà không đo/);
  assert.match(act("trang_thu").text, /làm thêm ca đêm ở cửa hàng tiện lợi/);
  assert.match(act("hung_thu").text, /chiều thứ Năm chị Hạnh/);
  assert.match(act("hung_thu").text, /P-180 mấy tiếng thì lõi đông cứng như nằm cả đêm/);
  const p = c.confront.filter((r) => r.who === "hanh");
  assert.ok(p.length >= 6 && p.every((r) => !r.reveal), "Hạnh có nhiều phản ứng nhưng không thú nhận");
  const g = play(["loi_hanh", "dt_dong"]);
  assert.ok(confrontOptions(g, c, "hanh").includes("dt_dong"));
  const after = performConfront(g, c, "hanh", "dt_dong");
  assert.notEqual(after, g);
  assert.equal(after.found.length, g.found.length, "phản ứng của Hạnh không mở lời khai mới");
});

test("biết trước tủ cấp đông: lời Hưng + cấp đông nhanh ra kết luận, mâu thuẫn với lời Hạnh “không rành kỹ thuật”", () => {
  const g0 = play(["thong_so", "phap_y_ct", "loi_hung", "phieu_hung"]);
  assert.ok(!g0.done.hung_thu && !g0.done.k_hanh_biet_chu_ky, "chưa đưa chứng cứ thì Hưng chưa kể");
  const g1 = closeDeductions(performConfront(g0, c, "hung", "phieu_hung"), c);
  assert.ok(g1.done.k_hanh_biet_chu_ky);
  const g2 = closeDeductions(performConfront(play(["thong_so", "loi_hung", "phieu_hung"]), c, "hung", "phieu_hung"), c);
  assert.ok(g2.done.k_hanh_biet_chu_ky, "lối lời Hưng + bảng thông số tủ, không cần giải phẫu");
  assert.match(act("loi_hanh").text, /Tôi không rành kỹ thuật/);
  assert.match(act("k_hanh_biet_chu_ky").text, /không rành kỹ thuật/);
});

test("động cơ: lô 4C quá hạn mười tháng bị đổi tem, nửa lô chảy về công ty của chồng Hạnh, hạn nộp bản kiểm kê thứ Hai", () => {
  assert.match(act("so_kiem_ke").text, /QUÁ HẠN 10 THÁNG\. HỦY\./);
  assert.match(act("pallet_tem").text, /NSX 03\/2023 · HSD 03\/2025/);
  assert.match(act("pallet_tem").text, /310 thùng/);
  assert.match(act("may_in_tem").text, /310 lệnh in liên tiếp/);
  assert.match(act("hd_bep_an").text, /18,6 tỷ đồng một năm/);
  assert.match(act("hd_bep_an").text, /tối thiểu sáu tháng khi giao/);
  let g = play(["so_kiem_ke", "pallet_tem"]);
  assert.ok(g.done.k_doi_tem);
  g = play(["dkkd_binh_an"], g);
  assert.ok(g.done.k_loi_ich_hanh);
  g = play(["loi_trang"], g);
  assert.ok(g.done.k_han_thu_hai && g.done.k_dong_co);
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
  assert.ok(g.done.k_cap_dong_nhanh && g.done.k_hanh_biet_chu_ky && g.done.k_loi_ich_hanh, "gợi ý đi theo lối ngắn nhất của từng bước");
});

test("giao diện vụ s6 dựng được: HUD, sổ tay mọi tab, chuỗi chứng minh; mọi cảnh và khung camera vẽ được", () => {
  const g = planShort();
  assert.match(T.hudHTML(g, c, c.locations[0]), /Sài Gòn · Vụ 6/);
  for (const tab of ["sus", "ho", "dd", "tl"]) assert.ok(notebookHTML({ ...g, tab }, c).length > 200, tab);
  const html = T.accuseHTML(g, c, { culprit: null, steps: {} });
  assert.match(html, /Giờ chết và cái lạnh/);
  assert.match(html, /Bàn tay/);
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

test("hộp thoại mở đầu chỉ nhắc cơ chế mà vụ có: s6 không nhắc giờ máy lệch", () => {
  const html = T.briefingHTML(c);
  assert.doesNotMatch(html, /giờ máy lệch/);
  assert.match(html, /về muộn/);
  assert.match(html, /mã số/);
  assert.match(html, /Suy luận/);
  assert.match(html, /Âm Mười Tám Độ/);
});
