/* Kiểm thử vụ s4 "Bốn Giây" (tòa tháp Landmark 81): người khuyên can bị nghi nhất, cuộc gọi giọng giả hẹn giờ, vòng loại trừ ở khung giờ cài lịch, khóa mã từ tờ lịch, hồ sơ về muộn và lời giải. */
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

const idx = CASES.findIndex((c) => c.id === "s4");
const c = CASES[idx];
const s3 = CASES.find((x) => x.id === "s3");
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

test("vụ s4 thuộc vùng Sài Gòn, là vụ số 4, có Vũ, Ngân, Thắm, Trang cùng hai nhân vật do tác giả đặt", () => {
  assert.equal(c.region, "sg");
  assert.equal(c.no, 4);
  assert.equal(idx, 3, "s4 nằm cuối danh sách để bản lưu của s1, s2, s3 không đổi chỉ số");
  assert.deepEqual(casesOf("sg").map((x) => x.id).slice(0, 4), ["s1", "s2", "s3", "s4"]);
  const names = c.suspects.map((s) => s.name);
  for (const n of ["Vũ", "Ngân", "Thắm", "Trang", "Diệp", "Hào"]) assert.ok(names.includes(n), `${n} phải có trong vụ`);
  assert.equal(c.suspects.length, 6);
  assert.equal(c.culprit, "diep");
  assert.notEqual(c.culprit, "ngan", "người khuyên can bị nghi nhiều nhất không phải người có tội");
  assert.match(c.place, /Landmark 81/);
  assert.match(c.place, /208 Nguyễn Hữu Cảnh/);
  assert.ok(c.suspects.every((s) => s.look && s.bio && s.role));
  assert.equal(c.locations[0].scene, "sg_lm_deck", "thẻ vụ ở menu lấy cảnh đầu tiên: đài quan sát tầng 81");
});

test("độ khó không thấp hơn vụ s3: không ít sao, điểm, kết luận, dòng suy luận và người nói dối", () => {
  assert.ok(stars(c.level) >= stars(s3.level), `${c.level} phải ≥ ${s3.level}`);
  assert.equal(c.budget, 15);
  const points = (x) => x.actions.filter((a) => !a.via).length;
  assert.ok(points(c) >= points(s3), `s4 ${points(c)} điểm điều tra, s3 ${points(s3)}`);
  assert.ok(c.budget * 2 >= points(c), `${points(c)} điểm điều tra cần ít nhất ${points(c) / 2} giờ`);
  const concl = (x) => x.actions.filter((a) => a.via === "deduce").length;
  assert.ok(concl(c) > concl(s3), `s4 ${concl(c)} kết luận, s3 ${concl(s3)}`);
  assert.ok(c.deduce.length >= s3.deduce.length);
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
  assert.deepEqual(c.chain.map((s) => s.key), ["cause", "author", "motive"]);
  for (const st of c.chain) for (const i of st.ids) assert.equal(act(i).via, "deduce", `${st.key}: chứng cứ của bước phải là kết luận`);
});

test("Ngân khuyên can chứ không đẩy: dấu tay, vải, vết nắm và bản ghi âm cùng một hướng; trên đài chỉ có hai người", () => {
  assert.ok(closeDeductions(withDone(["phap_y", "hien_truong_81"]), c).done.k_keo_lai, "lối pháp y + lan can");
  assert.ok(closeDeductions(withDone(["phap_y", "ghi_am_ngan"]), c).done.k_keo_lai, "lối pháp y + bản ghi âm");
  assert.match(act("hien_truong_81").text, /căng theo hướng vào phía sàn đài/);
  assert.match(act("phap_y").text, /Không có vết bầm hình bàn tay ở lưng hay hai vai/);
  assert.ok(closeDeductions(withDone(["nk_tai_trong", "nk_cua_81"]), c).done.k_chi_hai_nguoi, "lối tải trọng thang + nhật ký cửa");
  assert.ok(closeDeductions(withDone(["cam_81", "nk_cua_81"]), c).done.k_chi_hai_nguoi, "lối camera + nhật ký cửa");
  assert.match(act("nk_tai_trong").text, /23:40 lên tầng 80, tải 84 kg; 23:46 lên tầng 80, tải 52 kg; 00:09 xuống, tải 52 kg/);
  assert.match(act("phap_y").text, /83,6 kg/, "chuyến 84 kg khớp với cân nặng của Khang");
  assert.match(act("cam_81").text, /hai tay chụp lên lưng và vai anh/, "camera chỉ ra hai bàn tay trên lưng: bề ngoài giống đẩy");
});

test("cuộc gọi cuối cùng: hai lối ra “Khang rơi sau cuộc gọi”, giọng “Bi” là giọng giả, và cuộc gọi do máy tự động thực hiện", () => {
  assert.ok(closeDeductions(withDone(["cam_81", "nk_nhamang"]), c).done.k_goi_cuoi);
  assert.ok(closeDeductions(withDone(["dt_khang", "cam_buc"]), c).done.k_goi_cuoi, "lối điện thoại + camera sân bục, không qua nhà mạng");
  assert.ok(closeDeductions(withDone(["ghi_am_ngan", "giam_dinh_giong"]), c).done.k_giong_gia);
  assert.ok(closeDeductions(withDone(["nk_ivr", "ghi_am_ngan"]), c).done.k_giong_gia, "lối nhật ký dịch vụ + bản ghi âm");
  assert.ok(closeDeductions(withDone(["nk_ivr", "nk_nhamang"]), c).done.k_cuoc_goi_hen_gio);
  assert.match(act("ghi_am_ngan").text, /Bố… bố ơi/);
  assert.match(act("loi_ngan").text, /Ba chứ không phải bố/);
  assert.match(act("nk_nhamang").text, /dịch vụ gọi tự động/);
  assert.match(act("cam_buc").text, /00:06:49/);
  assert.match(act("cam_81").text, /00:06:34 anh đứng dậy/);
});

test("vòng loại trừ ở 22:47: ngoại phạm lúc 00:05:48 của Diệp không có nghĩa gì, năm nguồn che năm người, chỉ còn Diệp", () => {
  const roots = ["nk_ivr", "ban_mc", "cam_hl78", "cam_ops", "thu_de_doa", "nk_cua_81"];
  const g = play(roots);
  for (const k of ["k_22h47", "k_loai_hao_vu", "k_loai_tham", "k_loai_trang", "k_loai_ngan", "k_con_lai_diep"]) assert.ok(g.done[k], `${k} phải rút ra được`);
  // Thiếu một mắt xích thì không ra kết luận cuối
  for (const miss of ["cam_hl78", "cam_ops", "thu_de_doa", "nk_cua_81", "nk_ivr", "ban_mc"]) {
    const g2 = play(roots.filter((x) => x !== miss));
    assert.ok(!g2.done.k_con_lai_diep, `thiếu ${miss} vẫn ra k_con_lai_diep`);
  }
  assert.match(act("k_con_lai_diep").text, /Diệp rời sảnh tiệc qua cửa hậu trường lúc 22:44 và vào lại lúc 22:57/);
  // Ngoại phạm hoàn hảo ở khung giờ cuộc gọi reo
  assert.ok(closeDeductions(withDone(["cam_tiec", "ban_mc"]), c).done.k_diep_san_khau);
  assert.match(act("cam_tiec").text, /23:58 đến 00:09 Diệp đứng giữa sân khấu/);
  assert.match(act("nk_ivr").text, /22:47:12 sửa lịch gọi từ 00:02:00 thành 00:05:48/);
  assert.match(act("ban_mc").text, /đăng nhập 22:44:20, đăng xuất 22:55:40/);
  assert.match(act("loi_vu").text, /ai trong ê-kíp cũng đụng vào được/, "tài khoản dùng chung nên chỉ loại trừ mới chỉ ra được người");
});

test("ngoại phạm: cả sáu người đều bị bác, mỗi người vì một lý do khác nhau; trước khi có camera thì chưa ai bị bác", () => {
  const stm = ["loi_ngan", "loi_diep", "loi_hao", "loi_vu", "loi_tham", "loi_trang", "cam_81", "cam_tiec", "cam_ops", "cam_hl78", "nk_cua_81", "thu_de_doa", "dt_ngan"];
  const g = closeDeductions(withDone(stm), c);
  const al = (who) => alibisOf(g, c).find((a) => a.who === who);
  assert.equal(al("diep").status, "clash");
  assert.equal(al("diep").by.at, "Hậu trường sảnh tiệc (ngoài tầm camera)", "Diệp bị bác vì vắng 22:44–22:57");
  assert.equal(al("hao").status, "clash", "Hào ra cửa chính 22:48–22:58");
  assert.equal(al("vu").status, "clash", "Vũ bỏ bàn kỹ thuật 22:46–22:52");
  assert.equal(al("tham").status, "clash", "Thắm xuống sảnh tầng 1 lúc 23:58");
  assert.equal(al("trang").status, "clash", "Trang ở văn phòng tầng 66, không ở nhà");
  assert.equal(al("ngan").status, "clash", "Ngân ở trên đài quan sát từ 23:49");
  const before = alibisOf(withDone(["loi_ngan", "loi_diep", "loi_hao", "loi_vu", "loi_tham", "loi_trang"]), c);
  assert.ok(before.every((a) => a.status === "open"));
});

test("mã điện thoại của Khang là 1708: ngày 17/8 khoanh đỏ dưới tấm kính (dấu vết ẩn), viết ngày rồi tháng theo lời Trang", () => {
  assert.match(act("ban_khang").text, /17\/8/);
  assert.match(act("loi_trang").text, /viết ngày rồi tháng, bốn số/);
  assert.match(act("quy_dai_phat").text, /ngày 17\/8\/2018/, "đúng ngày ông Tự mất");
  assert.equal(act("dt_khang").lock.code, "1708");
  assert.equal(act("dt_khang").lock.digits, 4);
  assert.ok(c.locations.some((L) => L.hs.some((h) => h[0] === "ban_khang" && h[4] === "soi")));
  const g0 = newGame(idx, c);
  assert.equal(attemptLock(g0, c, "dt_khang", "0817").status, "wrong", "tháng rồi ngày");
  assert.equal(attemptLock(g0, c, "dt_khang", "1800").status, "wrong");
  assert.equal(attemptLock(g0, c, "dt_khang", "1708").status, "open");
  let g = g0;
  for (let i = 0; i < LOCK_TRIES - 1; i++) g = attemptLock(g, c, "dt_khang", "0000").game;
  assert.equal(attemptLock(g, c, "dt_khang", "0000").status, "locked", "sai ba lần thì thiết bị tự khóa");
});

test("hồ sơ về muộn và cổng mở khóa: hồ sơ hộ tịch chỉ xin được khi biết kẻ nhắn tin vì chuyện của ông Tự", () => {
  const g0 = newGame(idx, c);
  for (const [id, h] of [["ghi_am_ngan", 1], ["nk_nhamang", 2], ["nk_ivr", 3], ["giam_dinh_giong", 5]]) {
    assert.ok(isPending(g0, c, id), `${id} chưa về lúc đầu`);
    assert.equal(performAct(g0, c, id), g0);
    assert.ok(waitFor(g0, c, id).hours >= g0.hours - h - 1, `${id}: chờ quá ${h + 1} giờ`);
  }
  assert.equal(gated(g0, c, "ho_tich_diep"), true);
  assert.equal(gated(closeDeductions(withDone(["thu_de_doa", "ao_khoac"]), c), c, "ho_tich_diep"), false, "tin nhắn nhắc Tự + giấy ăn của Khang mở được hộ tịch");
  assert.equal(gated(closeDeductions(withDone(["thu_de_doa", "nk_nhamang"]), c), c, "ho_tich_diep"), false, "lối nhà mạng cũng mở được");
});

test("hồ sơ và nghi phạm không biến mất theo thời gian, dù đồng hồ đã chạy hết ngân sách giờ", () => {
  assert.ok((c.world || []).every((w) => w.kind === "arrive"), "chỉ còn diễn biến hồ sơ về muộn");
  for (const a of c.actions.filter((x) => !x.via)) {
    assert.equal(isGone(at(0), c, a.id), false, `${a.id}: mất ngay từ đầu`);
    assert.equal(isGone(at(c.budget), c, a.id), false, `${a.id}: mất theo thời gian`);
  }
  for (const s of c.suspects) assert.equal(departed(at(c.budget), c, s.id), false, `${s.id}: rời đi theo thời gian`);
  for (const id of ["cam_81", "cam_tiec", "phap_y", "ban_mc", "loi_ngan"]) {
    assert.ok(isOpen(at(c.budget - 2), c, id), `${id}: vẫn làm được khi gần hết giờ`);
  }
});

// Lời giải ngắn nhất, và các lối độc lập cho từng bước
const PLAN = ["phap_y", "hien_truong_81", "mau_giong_bi", "nk_ivr", "quy_dai_phat", "ban_mc"];
const GOOD = { cause: "k_keo_lai", author: "k_mau_giong", motive: "k_con_gai_tu" };

test("lời giải ngắn nhất đi được, còn dư ít nhất 4 giờ, và buộc tội đúng thì thắng", () => {
  const g = play(PLAN);
  assert.ok(c.budget - g.hours <= c.budget - 4, `tốn ${c.budget - g.hours}/${c.budget} giờ`);
  for (const st of c.chain) assert.ok(st.ids.some((i) => g.done[i]), `${st.key}: chưa có chứng cứ`);
  assert.equal(judge(c, "diep", GOOD).win, true);
  assert.equal(judge(c, "diep", { cause: "k_giong_gia", author: "k_con_lai_diep", motive: "k_dong_co" }).win, true, "lối kỹ hơn cũng thắng");
});

test("mỗi bước có ít nhất hai lối chứng cứ độc lập, đi được trong ngân sách", () => {
  const routes = {
    cause: [["phap_y", "hien_truong_81"], ["cam_81", "nk_nhamang"], ["ghi_am_ngan", "giam_dinh_giong"]],
    author: [["mau_giong_bi", "nk_ivr"], ["cam_hl78", "cam_ops", "thu_de_doa", "nk_cua_81", "nk_ivr", "ban_mc"]],
    motive: [["quy_dai_phat", "ban_mc"], ["thu_de_doa", "ao_khoac", "ho_tich_diep"]]
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
  // Khóa mã không cản đường chứng minh: điện thoại Khang cho ra một lối khác của bước "cause"
  const g = play(["dt_khang", "cam_buc"]);
  assert.ok(g.done.k_goi_cuoi);
});

test("buộc tội sai: nhầm người (nhất là Ngân), nhầm chứng cứ sang bước khác, thiếu chứng cứ đều thua", () => {
  for (const who of ["ngan", "hao", "vu", "tham", "trang"]) assert.equal(judge(c, who, GOOD).win, false, who);
  assert.equal(judge(c, "diep", { ...GOOD, motive: "k_keo_lai" }).win, false);
  assert.equal(judge(c, "diep", { ...GOOD, cause: "k_dong_co" }).win, false);
  assert.equal(judge(c, "diep", { ...GOOD, author: "ban_mc" }).win, false, "hồ sơ gốc không đủ làm chứng cứ");
  assert.equal(judge(c, "diep", { ...GOOD, author: null }).win, false);
  const r = judge(c, "ngan", GOOD);
  assert.equal(r.right, false);
  assert.ok(r.steps.every((s) => s.ok), "đúng chứng cứ nhưng sai người vẫn thua");
  // Mỗi người ngoài cuộc có hồ sơ độc lập loại trừ (camera, nhật ký có giờ mạng, nhật ký máy in)
  assert.equal(act("cam_hl78").type, "Camera");
  assert.equal(act("cam_ops").type, "Camera");
  assert.match(act("thu_de_doa").text, /22:46–22:50 in 21 trang bằng tài khoản của Trang/);
});

test("đưa chứng cứ: năm người thú nhận chuyện riêng; Diệp chỉ phản ứng, không bao giờ thú nhận", () => {
  const withStm = (who, clue, extra = []) => {
    const stm = { ngan: "loi_ngan", hao: "loi_hao", vu: "loi_vu", tham: "loi_tham", trang: "loi_trang" }[who];
    return performConfront(play([stm, clue, ...extra]), c, who, clue);
  };
  for (const [who, clue, reveal] of [["ngan", "cam_81", "ngan_thu"], ["hao", "cam_tiec", "hao_thu"], ["vu", "cam_hl78", "vu_thu"], ["tham", "nk_cua_81", "tham_thu"], ["trang", "thu_de_doa", "trang_thu"]]) {
    assert.ok(withStm(who, clue).done[reveal], `${who}: phải thú nhận ${reveal}`);
  }
  // Camera hành lang chỉ làm Hào ngập ngừng, không mở lời khai
  assert.ok(!withStm("hao", "cam_hl78").done.hao_thu);
  // Ngân bị đưa điện thoại thì chỉ nói vì sao xóa tệp ghi âm
  const g1 = withStm("ngan", "dt_ngan");
  assert.ok(!g1.done.ngan_thu);
  assert.match(act("ngan_thu").text, /năm mươi hai ký, anh tám mươi tư ký/);
  const diep = c.confront.filter((r) => r.who === "diep");
  assert.ok(diep.length >= 6 && diep.every((r) => !r.reveal), "Diệp có nhiều phản ứng nhưng không thú nhận");
  const g = play(["loi_diep", "cam_tiec"]);
  assert.ok(confrontOptions(g, c, "diep").includes("cam_tiec"));
  const after = performConfront(g, c, "diep", "cam_tiec");
  assert.notEqual(after, g);
  assert.equal(after.found.length, g.found.length, "phản ứng của Diệp không mở lời khai mới");
});

test("lối xét động cơ không cần hộ tịch: số điện thoại 0903 118 412 nối MC Diệp với người khiếu nại Lâm Thu Diệp", () => {
  assert.match(act("ban_mc").text, /0903 118 412/);
  assert.match(act("quy_dai_phat").text, /Lâm Thu Diệp, ĐT 0903 118 412/);
  assert.match(act("loi_diep").text, /Bố tôi cũng mất vì tuyệt vọng, bảy năm trước/, "Diệp nói “bảy năm” trùng ghi chú của Khang");
  let g = play(["quy_dai_phat", "ban_mc"]);
  assert.ok(g.done.k_con_gai_tu);
  g = play(["ao_khoac"], g);
  assert.ok(g.done.k_khang_ky);
  g = play(["thu_de_doa"], g);
  assert.ok(g.done.k_ke_bao_thu && g.done.k_dong_co);
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
  assert.ok(g.done.k_keo_lai && g.done.k_mau_giong && g.done.k_con_gai_tu, "gợi ý đi theo lối ngắn nhất của từng bước");
});

test("giao diện vụ s4 dựng được: HUD, sổ tay mọi tab, chuỗi chứng minh; mọi cảnh và khung camera vẽ được", () => {
  const g = play(PLAN);
  assert.match(T.hudHTML(g, c, c.locations[0]), /Sài Gòn · Vụ 4/);
  for (const tab of ["sus", "ho", "dd", "tl"]) assert.ok(notebookHTML({ ...g, tab }, c).length > 200, tab);
  const html = T.accuseHTML(g, c, { culprit: null, steps: {} });
  assert.match(html, /Điều khiến Khang buông tay/);
  assert.match(html, /Bàn tay giấu mặt/);
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

test("hộp thoại mở đầu chỉ nhắc cơ chế mà vụ có: s4 không nhắc giờ máy lệch", () => {
  const html = T.briefingHTML(c);
  assert.doesNotMatch(html, /giờ máy lệch/);
  assert.match(html, /về muộn/);
  assert.match(html, /mã số/);
  assert.match(html, /Suy luận/);
  assert.match(html, /Bốn Giây/);
});
