import { test } from "node:test";
import assert from "node:assert/strict";
import { CASES } from "../src/data/cases.js";
import {
  newGame, performAct, isOpen, cycleMark, cycleMatrix, judge, loseLife,
  starsFor, recordWin, emptySave, MAX_LIVES, pickClue, checkPair, linksOf, pairKey,
  confrontOptions, performConfront, CONFRONT_COST, timelineEvents, alibisOf, hasTimeline,
  isGone, departed, clockAt, nowMinutes, eventsBetween, eventsDone
} from "../src/game/rules.js";
import { doorPlan, DOOR_SLOTS, DOOR_W, OX, COMP_W, WORLD_W } from "../src/world/layout.js";
import { doorsFor } from "../src/world/doors.js";

const c1 = CASES[0];

test("performAct trừ giờ, ghi hồ sơ và không đổi trạng thái gốc", () => {
  const g0 = newGame(0, c1);
  const g1 = performAct(g0, c1, "khamtu");
  assert.equal(g1.hours, g0.hours - 1);
  assert.deepEqual(g1.found, ["khamtu"]);
  assert.equal(g1.done.khamtu, true);
  assert.equal(g0.found.length, 0, "trạng thái cũ không bị sửa");
});

test("performAct bỏ qua khi đang chuyển cảnh, đã làm, hoặc không đủ giờ", () => {
  const busy = { ...newGame(0, c1), busy: true };
  assert.equal(performAct(busy, c1, "khamtu"), busy);

  const once = performAct(newGame(0, c1), c1, "khamtu");
  assert.equal(performAct(once, c1, "khamtu"), once);

  const broke = { ...newGame(0, c1), hours: 1 };
  assert.equal(isOpen(broke, c1, "camera"), false, "camera tốn 2 giờ");
  assert.equal(performAct(broke, c1, "camera"), broke);
});

test("loseLife kết thúc hồ sơ khi hết mạng", () => {
  let g = newGame(0, c1);
  for (let i = 0; i < MAX_LIVES - 1; i++) g = loseLife(g);
  assert.equal(g.over, false);
  g = loseLife(g);
  assert.equal(g.over, true);
  assert.equal(g.lives, 0);
  assert.equal(g.wrong, MAX_LIVES);
});

test("judge chỉ thắng khi đúng người và đúng cả ba bước", () => {
  const good = { motive: "sothu", opportunity: "camera", means: "chia" };
  const win = judge(c1, "quyen", good);
  assert.equal(win.win, true);
  assert.equal(win.right, true);
  assert.ok(win.steps.every((s) => s.ok));

  assert.equal(judge(c1, "binh", good).win, false, "sai người thì không thắng dù đủ chứng cứ");
  assert.equal(judge(c1, "quyen", { ...good, means: "sothu" }).win, false, "chọn sai hồ sơ cho một bước thì không thắng");
  assert.equal(judge(c1, "quyen", { motive: "sothu" }).win, false, "thiếu bước thì không thắng");
});

test("judge chấm từng bước để phản hồi cụ thể, và bước không chọn là chưa đúng", () => {
  const r = judge(c1, "quyen", { motive: "sothu", opportunity: "giod" });
  assert.deepEqual(r.steps.map((s) => [s.key, s.ok]), [["motive", true], ["opportunity", false], ["means", false]]);
  assert.equal(r.steps[2].pick, null);
  assert.ok(r.steps[1].hint.length > 0, "bước sai có gợi ý");
  assert.equal(r.right, true, "vẫn ghi nhận đúng người");
});

test("starsFor và recordWin giữ số sao tốt nhất và mở vụ kế tiếp", () => {
  assert.equal(starsFor(0), 3);
  assert.equal(starsFor(1), 2);
  assert.equal(starsFor(2), 1);

  let save = recordWin(emptySave(), 0, "c1", { wrong: 1 });
  assert.deepEqual(save.stars, { c1: 2 });
  assert.equal(save.unlocked, 1);

  save = recordWin(save, 0, "c1", { wrong: 0 });
  assert.equal(save.stars.c1, 3, "sao tốt hơn được ghi");
  save = recordWin(save, 0, "c1", { wrong: 2 });
  assert.equal(save.stars.c1, 3, "sao kém hơn không ghi đè");
});

test("đổi nhãn nghi phạm và ô đối chiếu quay vòng 0→1→2→0", () => {
  let g = newGame(2, CASES[2]);
  g = cycleMark(g, "tung");
  g = cycleMark(g, "tung");
  g = cycleMark(g, "tung");
  assert.equal(g.marks.tung, 0);
  g = cycleMatrix(g, "tung", "loi_tung");
  assert.equal(g.mx["tung|loi_tung"], 1);
});

test("doorPlan đặt cửa xen kẽ hai bên và nằm trong phần biên của mỗi bên", () => {
  const plan = doorPlan(3);
  assert.deepEqual(plan.map((d) => d.side), ["left", "right", "left"]);
  for (const d of plan) {
    if (d.side === "left") assert.ok(d.x >= 0 && d.x + DOOR_W <= OX, "cửa trái nằm trong dải trái");
    else assert.ok(d.x >= OX + COMP_W && d.x + DOOR_W <= WORLD_W, "cửa phải nằm trong dải phải");
  }
  assert.equal(DOOR_SLOTS.left.length, 2);
  assert.equal(DOOR_SLOTS.right.length, 2);
});

test("doorsFor chỉ tạo cửa tới các địa điểm khác", () => {
  const doors = doorsFor(c1.locations, 0);
  assert.equal(doors.length, c1.locations.length - 1);
  assert.ok(doors.every((d) => d.loc !== 0), "không có cửa tới chính địa điểm đang đứng");
  assert.deepEqual(doors.map((d) => d.loc), [1, 2, 3]);
});

test("dữ liệu vụ án nhất quán: điểm điều tra trỏ tới hành động có thật, mỗi hành động có đúng một vị trí", () => {
  for (const c of CASES) {
    const all = c.actions.map((a) => a.id);
    // Lời khai mở bằng cách đưa chứng cứ (via: "confront") không nằm trên điểm điều tra nào
    const ids = c.actions.filter((a) => !a.via).map((a) => a.id);
    const placed = [];
    for (const loc of c.locations) {
      for (const [id, x, y] of loc.hs) {
        assert.ok(ids.includes(id), `${c.id}: ${id} không có trong actions`);
        assert.ok(x >= 0 && x <= COMP_W && y >= 0 && y <= 900, `${c.id}: ${id} nằm ngoài khung`);
        placed.push(id);
      }
    }
    assert.deepEqual([...placed].sort(), [...ids].sort(), `${c.id}: mỗi hành động đúng một lần`);
    assert.deepEqual([...c.chain.map((s) => s.key)].sort(), ["means", "motive", "opportunity"], `${c.id}: chuỗi có đủ ba bước, mỗi bước một lần`);
    for (const st of c.chain) {
      assert.ok(st.ids.length > 0 && st.ids.every((k) => all.includes(k)), `${c.id}/${st.key}: hồ sơ của bước phải tồn tại`);
      assert.ok(st.label && st.ask && st.hint, `${c.id}/${st.key}: thiếu nhãn, câu hỏi hoặc gợi ý`);
    }
  }
});

test("pickClue chỉ nhận hồ sơ đã thu, tối đa hai, và bỏ chọn được", () => {
  let g = newGame(0, c1);
  assert.equal(pickClue(g, "xe"), g, "hồ sơ chưa thu thì không chọn được");
  for (const id of ["xe", "camera", "quyen"]) g = performAct(g, c1, id);
  g = pickClue(pickClue(g, "xe"), "camera");
  assert.deepEqual(g.pick, ["xe", "camera"]);
  g = pickClue(g, "quyen");
  assert.deepEqual(g.pick, ["camera", "quyen"], "chọn thêm thì bỏ hồ sơ được chọn cũ nhất");
  g = pickClue(g, "camera");
  assert.deepEqual(g.pick, ["quyen"]);
});

test("checkPair ghi kết nối đúng một lần, không phụ thuộc thứ tự, và không tốn giờ", () => {
  let g = newGame(0, c1);
  for (const id of ["xe", "camera", "quyen"]) g = performAct(g, c1, id);
  const hours = g.hours;

  assert.equal(checkPair(g, c1), g, "chưa chọn đủ hai hồ sơ thì không đổi gì");

  let r = checkPair({ ...g, pick: ["camera", "xe"] }, c1);
  assert.deepEqual(r.links, [pairKey("xe", "camera")]);
  assert.equal(r.lkResult.status, "new");
  assert.equal(r.hours, hours, "đối chiếu không tốn giờ");

  r = checkPair({ ...r, pick: ["xe", "camera"] }, c1);
  assert.equal(r.lkResult.status, "known", "cặp đã ghi thì không ghi thêm");
  assert.equal(r.links.length, 1);

  const miss = checkPair({ ...g, pick: ["xe", "quyen"] }, c1);
  assert.equal(miss.lkResult.status, "none");
  assert.deepEqual(miss.links, []);

  assert.deepEqual(linksOf({ ...g, links: [pairKey("xe", "camera")] }, c1).map((l) => l.about), ["quyen"]);
});

test("kết nối và dấu vết ẩn trỏ tới dữ liệu có thật", () => {
  for (const c of CASES) {
    const ids = c.actions.map((a) => a.id);
    const sids = c.suspects.map((s) => s.id);
    const seen = new Set();
    for (const l of c.links || []) {
      assert.ok(ids.includes(l.a) && ids.includes(l.b) && l.a !== l.b, `${c.id}: ${l.a}/${l.b} không hợp lệ`);
      assert.ok(sids.includes(l.about), `${c.id}: ${l.about} không phải nghi phạm`);
      assert.ok(["mâu thuẫn", "liên hệ"].includes(l.kind), `${c.id}: loại kết nối lạ ${l.kind}`);
      const k = pairKey(l.a, l.b);
      assert.ok(!seen.has(k), `${c.id}: cặp ${k} bị trùng`);
      seen.add(k);
    }
    for (const loc of c.locations) {
      for (const [id, , , , flag] of loc.hs) {
        assert.ok(flag === undefined || flag === "soi", `${c.id}: ${id} có cờ lạ`);
      }
    }
  }
  const secrets = CASES.flatMap((c) => c.locations.flatMap((l) => l.hs.filter((h) => h[4] === "soi").map((h) => h[0])));
  assert.ok(secrets.length > 0, "có ít nhất một dấu vết ẩn để thử đèn pin");
});

test("đưa chứng cứ: chỉ người đã bị hỏi, mỗi cặp một lần, tốn giờ, và lời khai mới được ghi", () => {
  // Đã hỏi Khải (khai) và đã thu hồ sơ đăng ký xe (xe): Khải được đưa xe
  let g = newGame(0, c1);
  assert.deepEqual(confrontOptions(g, c1, "khai"), [], "chưa hỏi thì không đưa được");
  g = performAct(g, c1, "khai");
  g = performAct(g, c1, "xe");
  assert.ok(confrontOptions(g, c1, "khai").includes("xe"));
  assert.ok(!confrontOptions(g, c1, "khai").includes("khai"), "không đưa lại lời khai của chính họ");

  const hours = g.hours;
  const r = performConfront(g, c1, "khai", "xe");
  assert.equal(r.hours, hours - CONFRONT_COST, "tốn một giờ");
  assert.ok(r.done.khai_thu, "phản ứng mở lời khai mới");
  assert.ok(r.found.includes("khai_thu"), "lời khai mới vào hồ sơ");
  assert.equal(performConfront(r, c1, "khai", "xe"), r, "cặp đã đưa thì không đưa lại");
  assert.ok(!confrontOptions(r, c1, "khai").includes("xe"));

  // Không có phản ứng viết sẵn: vẫn đưa được, chỉ không có lời khai mới
  const q = performConfront(g, c1, "lan", "xe");
  assert.equal(q, g, "Lan chưa bị hỏi nên không đưa được");
  const plain = { ...g, done: { ...g.done, chia: true }, found: [...g.found, "chia"] };
  const nothing = performConfront(plain, c1, "khai", "chia");
  assert.equal(nothing.hours, plain.hours - CONFRONT_COST);
  assert.equal(nothing.done.khai_thu, undefined);
});

test("đưa chứng cứ bỏ qua khi đang chuyển cảnh, hết hồ sơ đóng, hoặc không đủ giờ", () => {
  let g = performAct(newGame(0, c1), c1, "khai");
  g = performAct(g, c1, "xe");
  assert.equal(performConfront({ ...g, busy: true }, c1, "khai", "xe").hours, g.hours, "đang bận thì không đưa");
  assert.equal(performConfront({ ...g, hours: 0 }, c1, "khai", "xe").hours, 0, "hết giờ thì không đưa");
  assert.equal(performConfront({ ...g, over: true }, c1, "khai", "xe").over, true);
});

test("dữ liệu đưa chứng cứ trỏ tới người đã có lời khai và hồ sơ có thật", () => {
  for (const c of CASES) {
    const ids = c.actions.map((a) => a.id);
    const reveals = new Set();
    for (const r of c.confront || []) {
      assert.ok(c.suspects.some((s) => s.id === r.who), `${c.id}: ${r.who} không phải nghi phạm`);
      assert.ok(ids.includes(r.clue), `${c.id}: ${r.clue} không có trong actions`);
      const hasStatement = c.actions.some((a) => !a.via && a.visual && a.visual.k === "who" && a.visual.id === r.who);
      assert.ok(hasStatement, `${c.id}: ${r.who} chưa có lời khai để bị hỏi`);
      if (r.reveal) {
        const a = c.actions.find((x) => x.id === r.reveal);
        assert.ok(a && a.via === "confront", `${c.id}: ${r.reveal} phải là lời khai mở bằng đưa chứng cứ`);
        assert.ok(!reveals.has(r.reveal), `${c.id}: ${r.reveal} được mở hai lần`);
        reveals.add(r.reveal);
      }
    }
    const viaActs = c.actions.filter((a) => a.via).map((a) => a.id);
    assert.deepEqual([...reveals].sort(), viaActs.sort(), `${c.id}: mọi lời khai mở bằng đưa chứng cứ đều có phản ứng`);
  }
});

test("dòng thời gian: mốc chỉ hiện khi hồ sơ đã thu, gắn người khi đủ điều kiện, và được sắp theo giờ", () => {
  assert.deepEqual(timelineEvents(newGame(0, c1), c1), []);

  let g = { ...newGame(0, c1), done: { camera: true, giod: true, bino: true } };
  const ev = timelineEvents(g, c1);
  assert.deepEqual(ev.map((e) => e.from), ["18:30", "19:00", "20:05"], "sắp theo giờ");
  const cam = ev.find((e) => e.clue === "camera");
  assert.equal(cam.who, null, "chưa có đăng ký xe thì chưa rõ là ai");
  assert.equal(cam.pending, true);
  assert.equal(cam.at, "Tiệm Hoa Sen");

  g = { ...g, done: { ...g.done, xe: true } };
  const cam2 = timelineEvents(g, c1).find((e) => e.clue === "camera");
  assert.equal(cam2.who, "quyen", "có đăng ký xe thì gắn được Quyên");
  assert.equal(cam2.pending, false);
});

test("lời khai về nơi ở: được xác nhận khi mốc bao trọn cùng nơi, bị bác khi mốc cùng giờ khác nơi", () => {
  const lan = alibisOf({ ...newGame(0, c1), done: { chia: true, giod: true } }, c1).find((a) => a.who === "lan");
  assert.equal(lan.status, "proof");
  assert.equal(lan.by.clue, "giod");

  const khai = { ...newGame(0, c1), done: { khai: true } };
  assert.equal(alibisOf(khai, c1)[0].status, "open", "chưa có mốc nào thì chưa kiểm chứng");
  const broken = alibisOf({ ...khai, done: { ...khai.done, khai_thu: true } }, c1)[0];
  assert.equal(broken.status, "clash");
  assert.equal(broken.by.clue, "khai_thu");
});

test("vụ 1: Quyên bị bác qua camera chỉ khi đã có đăng ký xe, hoặc qua lời thú nhận", () => {
  let g = { ...newGame(0, c1), done: { quyen: true, camera: true } };
  assert.equal(alibisOf(g, c1)[0].status, "open", "camera chưa gắn được người");
  g = { ...g, done: { ...g.done, xe: true } };
  const r = alibisOf(g, c1)[0];
  assert.equal(r.status, "clash");
  assert.equal(r.by.clue, "camera");

  const confessed = { ...newGame(0, c1), done: { quyen: true, quyen_thu: true } };
  assert.equal(alibisOf(confessed, c1)[0].by.clue, "quyen_thu");
});

test("vụ 2: Thảo được xác nhận bởi sổ khách; Phong bị bác bởi camera hành lang; Tuấn cần hai chứng cứ mới gắn được vào hẻm", () => {
  const c2 = CASES[1];
  const thao = alibisOf({ ...newGame(1, c2), done: { hoi_thao: true, so_cong: true } }, c2)[0];
  assert.equal(thao.status, "proof");

  const phong = alibisOf({ ...newGame(1, c2), done: { hoi_phong: true, cam_kt: true } }, c2)[0];
  assert.equal(phong.status, "clash");

  const tuan = { ...newGame(1, c2), done: { hoi_tuan: true, cam_hem: true } };
  const byTuan = (g) => alibisOf(g, c2).find((a) => a.who === "tuan");
  assert.equal(byTuan(tuan).status, "open", "thiếu hai chứng cứ thì camera hẻm chưa gắn được Tuấn");
  const tuanOk = { ...tuan, done: { ...tuan.done, hoi_nga: true, quay_do: true } };
  assert.equal(byTuan(tuanOk).status, "clash");
  assert.equal(byTuan(tuanOk).by.clue, "cam_hem");
});

test("vụ 3: alibi của Phúc bị bác sau khi thú nhận quay lại phòng thờ", () => {
  const c3 = CASES[2];
  const g = { ...newGame(2, c3), done: { loi_phuc: true, ngan_bimat: true } };
  assert.equal(alibisOf(g, c3)[0].status, "open");
  const r = alibisOf({ ...g, done: { ...g.done, phuc_thu: true } }, c3)[0];
  assert.equal(r.status, "clash");
  assert.equal(r.by.clue, "phuc_thu");
});

test("vụ 4: Đạt bị bác khi nhật ký cửa hông đã gắn với sổ cấp thẻ; Long được xác nhận bởi sổ bàn quán", () => {
  const c4 = CASES[3];
  const base = { ...newGame(3, c4), done: { loi_dat: true, the_tu: true } };
  assert.equal(alibisOf(base, c4).find((a) => a.who === "dat").status, "open", "chưa biết thẻ số 3 là của ai");
  const r = alibisOf({ ...base, done: { ...base.done, phieu_khach: true } }, c4).find((a) => a.who === "dat");
  assert.equal(r.status, "clash");
  assert.equal(r.by.clue, "the_tu");

  const long = alibisOf({ ...newGame(3, c4), done: { loi_long: true, cafe_log: true } }, c4).find((a) => a.who === "long");
  assert.equal(long.status, "proof");
});

test("dữ liệu dòng thời gian nhất quán: người, hồ sơ điều kiện và khoảng giờ đều hợp lệ", () => {
  const toMin = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  assert.equal(hasTimeline({ actions: [{ id: "x" }] }), false);
  for (const c of CASES) {
    const ids = c.actions.map((a) => a.id);
    const sids = c.suspects.map((s) => s.id);
    for (const a of c.actions) {
      const entries = [...(a.spans || []), ...(a.alibi ? [a.alibi] : [])];
      for (const s of entries) {
        assert.ok(/^\d{2}:\d{2}$/.test(s.from) && /^\d{2}:\d{2}$/.test(s.to), `${c.id}/${a.id}: giờ phải dạng HH:MM`);
        assert.ok(toMin(s.from) < toMin(s.to), `${c.id}/${a.id}: khoảng giờ phải có độ dài dương`);
        assert.ok(s.at && s.at.length > 0, `${c.id}/${a.id}: thiếu địa điểm`);
        if (s.who) assert.ok(sids.includes(s.who), `${c.id}/${a.id}: ${s.who} không phải nghi phạm`);
        for (const n of s.needs || []) assert.ok(ids.includes(n), `${c.id}/${a.id}: needs ${n} không có trong actions`);
      }
    }
    assert.ok(hasTimeline(c), `${c.id}: phải có dòng thời gian`);
  }
});

// Trạng thái vụ khi đã dùng "spent" giờ điều tra (di chuyển không tính)
const after = (c, idx, spent) => ({ ...newGame(idx, c), hours: c.budget - spent });

test("đồng hồ: giờ hiện tại theo số giờ đã dùng, đổi địa điểm không làm đồng hồ chạy, và qua nửa đêm vẫn đúng", () => {
  assert.equal(clockAt(newGame(0, c1), c1), "08:00");
  const g = performAct(newGame(0, c1), c1, "khamtu");
  assert.equal(clockAt(g, c1), "09:00");
  assert.equal(clockAt({ ...g, loc: 1 }, c1), "09:00", "đổi địa điểm không tốn giờ");
  const c3 = CASES[2];
  assert.equal(clockAt(after(c3, 2, 2), c3), "00:00", "22h cộng hai giờ là 00h");
});

test("hồ sơ mất: không làm được khi đồng hồ đã tới mốc, nhưng vẫn làm được trước mốc", () => {
  assert.equal(isOpen(after(c1, 0, 1), c1, "camera"), true, "09:00 còn kịp");
  assert.equal(isOpen(after(c1, 0, 2), c1, "camera"), false, "10:00 đoạn ghi đã bị xóa");
  assert.equal(isGone(after(c1, 0, 2), c1, "camera"), true);
  assert.equal(isGone({ ...after(c1, 0, 2), done: { camera: true } }, c1, "camera"), false, "đã thu thì không mất");
  assert.equal(isOpen(after(c1, 0, 2), c1, "xe"), true, "hồ sơ khác vẫn làm được");
});

test("nghi phạm rời đi: không hỏi thêm và không đưa chứng cứ được, nhưng lời khai đã thu vẫn còn", () => {
  assert.equal(departed(after(c1, 0, 2), c1, "khai"), false, "10:00 còn ở thành phố");
  assert.equal(isOpen(after(c1, 0, 2), c1, "khai"), true);
  assert.equal(departed(after(c1, 0, 3), c1, "khai"), true, "11:00 đã rời đi");
  assert.equal(isOpen(after(c1, 0, 3), c1, "khai"), false);

  const gone = { ...after(c1, 0, 3), done: { khai: true, xe: true }, found: ["khai", "xe"] };
  assert.deepEqual(confrontOptions(gone, c1, "khai"), [], "không đưa được khi đã rời đi");
  assert.equal(isGone(gone, c1, "khai"), false, "lời khai đã thu không mất");
  const still = { ...after(c1, 0, 2), done: { khai: true, xe: true }, found: ["khai", "xe"] };
  assert.ok(confrontOptions(still, c1, "khai").includes("xe"), "trước khi rời đi thì vẫn đưa được");
});

test("diễn biến: báo đúng một lần theo thứ tự, và qua nửa đêm vẫn đúng", () => {
  const c3 = CASES[2];
  assert.deepEqual(eventsDone(after(c3, 2, 0), c3), []);
  assert.deepEqual(eventsDone(after(c3, 2, 1), c3).map((w) => w.id), ["tung"]);
  assert.deepEqual(eventsDone(after(c3, 2, 2), c3).map((w) => w.id), ["tung", "camera_ngo"]);
  const fresh = eventsBetween(c3, nowMinutes(after(c3, 2, 1), c3), nowMinutes(after(c3, 2, 2), c3));
  assert.deepEqual(fresh.map((w) => w.id), ["camera_ngo"], "chỉ báo diễn biến vừa xảy ra");
});

test("mọi vụ vẫn có lời giải đi được khi tính cả hạn của hồ sơ và việc nghi phạm rời đi", () => {
  CASES.forEach((c, ci) => {
    const acts = c.actions.filter((a) => !a.via);
    const stateOf = (mask) => {
      const done = {};
      let spent = 0;
      acts.forEach((a, k) => {
        if (mask & (1 << k)) {
          done[a.id] = true;
          spent += a.cost;
        }
      });
      return { ...newGame(ci, c), done, found: Object.keys(done), hours: c.budget - spent };
    };
    // Tìm theo chiều rộng trên tập hồ sơ đã làm; mỗi bước chỉ làm việc còn mở đúng lúc đó
    const seen = new Set([0]);
    const queue = [0];
    let solved = false;
    while (queue.length && !solved) {
      const mask = queue.shift();
      const g = stateOf(mask);
      const found = g.found;
      if (c.chain.every((st) => st.ids.some((id) => found.includes(id)))) {
        solved = true;
        break;
      }
      acts.forEach((a, k) => {
        const next = mask | (1 << k);
        if (mask & (1 << k) || seen.has(next) || !isOpen(g, c, a.id)) return;
        seen.add(next);
        queue.push(next);
      });
    }
    assert.ok(solved, `${c.id}: không có lời giải đi được`);
  });
});

test("dữ liệu đồng hồ và diễn biến nhất quán: giờ đúng dạng, nằm trong thời gian điều tra, hồ sơ mất là hồ sơ thật", () => {
  const toMin = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  for (const c of CASES) {
    const start = toMin(c.clock.start);
    const toAbs = (t) => (toMin(t) < start ? toMin(t) + 1440 : toMin(t));
    assert.ok(/^\d{2}:\d{2}$/.test(c.clock.start), `${c.id}: giờ bắt đầu dạng HH:MM`);
    const goneIds = [];
    for (const w of c.world || []) {
      assert.ok(/^\d{2}:\d{2}$/.test(w.at), `${c.id}: ${w.at} không đúng dạng`);
      assert.ok(toAbs(w.at) > start && toAbs(w.at) <= start + c.budget * 60, `${c.id}: ${w.at} nằm ngoài thời gian điều tra`);
      assert.ok(w.text && w.text.length > 0, `${c.id}: diễn biến thiếu nội dung`);
      if (w.kind === "gone") {
        const a = c.actions.find((x) => x.id === w.id);
        assert.ok(a && !a.via, `${c.id}: ${w.id} không phải hồ sơ đặt trên bản đồ`);
        goneIds.push(w.id);
      } else {
        assert.equal(w.kind, "leave", `${c.id}: loại diễn biến lạ ${w.kind}`);
        assert.ok(c.suspects.some((s) => s.id === w.id), `${c.id}: ${w.id} không phải nghi phạm`);
        assert.ok(
          c.actions.some((a) => !a.via && a.visual && a.visual.k === "who" && a.visual.id === w.id),
          `${c.id}: ${w.id} chưa có lời khai để hỏi`
        );
      }
    }
    assert.equal(new Set(goneIds).size, goneIds.length, `${c.id}: một hồ sơ chỉ mất một lần`);
  }
});
