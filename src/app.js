/* =====================================================================
   Bộ điều khiển: nối trạng thái, luật chơi, sân khấu và giao diện.
   Mọi thay đổi đi qua store; render() đọc trạng thái và cập nhật từng vùng.
   ===================================================================== */
import { CASES, REGIONS } from "./data/cases.js";
import { ART } from "./art/art.js";
import { createStore } from "./state/store.js";
import * as R from "./game/rules.js";
import { loadSave, storeSave, clearSave, loadRun, storeRun, clearRun, loadRegion, storeRegion } from "./game/save.js";
import { doorsFor } from "./world/doors.js";
import { WORLD_W, OX, COMP_W } from "./world/layout.js";
import * as stage from "./ui/stage.js";
import { onLampMove } from "./ui/cursor.js";
import { lightSecrets } from "./ui/flashlight.js";
import * as T from "./ui/templates.js";
import * as O from "./ui/overlays.js";
import { mountPinboard, wiggle } from "./ui/pinboard.js";
import { mountNotebook, unmountNotebook } from "./ui/notebook.js";
import { coachSeen, markCoachSeen, startCoach, skipCoach, coachActive } from "./ui/coach.js";
import { $, setHTML } from "./ui/dom.js";

const MENU_W = 1600;
const regionIds = REGIONS.map((r) => r.id);
const store = createStore({
  screen: "menu", save: loadSave(), game: null, nb: false,
  region: loadRegion(regionIds, regionIds[0])
});
// Lựa chọn trong phiên xét xử. Vụ một thủ phạm: người và hồ sơ cho từng bước (steps). Vụ nhiều người: người (who) và hồ sơ (evid)
// theo từng vai, và đáp án các câu dựng lại sự việc (facts). Giữ lại giữa các lần thử trong một vụ
const emptyAccuse = () => ({ culprit: null, steps: {}, who: {}, evid: {}, facts: {} });
let accuse = emptyAccuse();
// Bàn phím số đang mở: { id, code, msg } hoặc null
let lockEntry = null;
let worldKey = null;
// Đồng hồ (theo phút) đã báo diễn biến tới đó; diễn biến nằm sau mốc này sẽ được báo khi tới
let announced = 0;
// Vào vụ đầu tiên trong đời thì sau phần mở đầu sẽ chạy hướng dẫn một lần
let coachPending = false;
// Giao diện Sổ tay (từ khóa, loại đang lọc, ô ghi chú đang mở) là state của component Preact, không lưu theo ván.
// Mỗi lần vào vụ, về menu hay khôi phục ván thì tăng nbEpoch: đổi key để component dựng lại từ đầu
let nbEpoch = 0;

const game = () => store.get().game;
const setGame = (patch) => store.set({ game: { ...store.get().game, ...patch } });

// Đặt lại camera khi đổi thế giới (vào vụ, đổi địa điểm, về menu)
function syncWorld(key, worldW, center) {
  if (worldKey === key) return;
  worldKey = key;
  stage.setWorld(worldW, center, true);
}

function render() {
  const s = store.get();
  if (s.screen === "menu") renderMenu(s);
  else renderCase(s);
}

function renderMenu(s) {
  const entering = worldKey !== "menu";
  const region = REGIONS.find((r) => r.id === s.region) || REGIONS[0];
  stage.markScene("menu");
  syncWorld("menu", MENU_W, MENU_W / 2);
  stage.setArt(`menu:${region.id}`, () => ART.scene(region.scene), "menu");
  stage.setDoors("");
  stage.setHotspots("");
  setHTML($("ui"), T.menuHTML(s.save, region.id));
  unmountNotebook($("nb-body"));
  $("notebook").classList.remove("is-open");
  O.setNotebook(false);
  if (entering) O.animateMenu();
}

function renderCase(s) {
  const g = s.game, c = CASES[g.idx], L = c.locations[g.loc];
  stage.markScene("case");
  syncWorld(`case:${g.idx}:${g.loc}`, WORLD_W, OX + COMP_W / 2);
  const doors = doorsFor(c.locations, g.loc);
  stage.setArt(`${c.id}:${g.loc}`, () => ART.scene(L.scene, doors), L.scene);
  stage.setDoors(T.doorsHTML(doors));
  stage.setHotspots(T.hotspotsHTML(g, c, L));
  setHTML($("ui"), T.hudHTML(g, c, L));
  mountNotebook($("nb-body"), { key: nbEpoch, game: g, c, onNote: saveNote });
  $("notebook").classList.toggle("is-open", s.nb);
  O.setNotebook(s.nb);
}

// Diễn biến xảy ra từ lần báo trước tới giờ hiện tại; mỗi diễn biến chỉ được báo một lần
function freshNews(g, c) {
  const now = R.nowMinutes(g, c);
  const news = R.eventsBetween(c, announced, now);
  announced = now;
  return news;
}

/* ---------- Luồng chơi ---------- */
async function startCase(i) {
  O.closeSheet();
  const c = CASES[i];
  accuse = emptyAccuse();
  nbEpoch++;
  // Vụ đang dở: chọn lại đúng vụ đó thì tiếp tục từ chỗ đã dừng, không bắt đầu lại từ đầu
  const run = loadRun();
  if (run && run.idx === i && resumeRun(run)) return O.toast(`Tiếp tục ${c.title}`);
  const g0 = { ...R.newGame(i, c), busy: true };
  announced = R.nowMinutes(g0, c);
  store.set({ screen: "case", game: g0, nb: false, region: c.region });
  await O.veil(`${T.regionOf(c).short} · Vụ ${c.no}`, c.title, c.place, null);
  setGame({ busy: false });
  coachPending = !coachSeen();
  O.showSheet(T.briefingHTML(c));
  O.animateEntrance();
}

async function goLoc(i) {
  const g = game();
  if (!g || g.busy || i === g.loc) return;
  setGame({ busy: true });
  const L = CASES[g.idx].locations[i];
  // Mống mắt khép lại đúng vào cánh cửa vừa bấm
  const door = document.querySelector(`.door[data-loc="${i}"]`);
  const box = door && door.getBoundingClientRect();
  const origin = box && { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  await O.veil("Di chuyển đến", L.name, L.time, () => setGame({ loc: i, hintId: null }), origin);
  setGame({ busy: false });
  O.animateEntrance();
}

function goMenu() {
  O.closeSheet();
  O.hideTestimony();
  nbEpoch++;
  store.set({ screen: "menu", game: null, nb: false });
}

function act(id) {
  const g = game(), c = CASES[g.idx];
  const a = c.actions.find((x) => x.id === id);
  // Hồ sơ về muộn: hỏi có chờ không. Điểm có khóa: mở bàn phím số. Hai việc này không tự làm điểm điều tra
  if (a && R.isPending(g, c, id)) return O.showSheet(T.waitHTML(g, c, a));
  if (a && a.lock && R.isOpen(g, c, id)) return openLock(id);
  // Lấy vị trí điểm điều tra trước khi cảnh được vẽ lại: hồ sơ sẽ bay từ đây vào Sổ tay
  const chip = document.querySelector(`[data-id="${id}"].hs .hs-chip`);
  const from = chip ? chip.getBoundingClientRect() : null;
  const next = R.performAct(g, c, id);
  if (next === g) return;
  store.set({ game: next });
  O.flashHotspot(id);
  O.flyToNotebook(from);
  const title = a.title;
  const news = freshNews(next, c);
  if (news.length) return O.showSheet(T.newsHTML(news, `Đã ghi vào hồ sơ: ${title}`), { cinema: true });
  // Hỏi cung: lời khai hiện ngay dưới màn hình, cảnh đẩy lại gần người đang nói
  if (a.visual && a.visual.k === "who" && a.text) {
    const focus = from && { x: from.left + from.width / 2, y: from.top + from.height / 2 };
    return O.showTestimony(T.testimonyHTML(c, a), focus);
  }
  O.toast(`Đã ghi vào hồ sơ: ${title}`);
}

/* ---------- Chờ hồ sơ về muộn ---------- */
function waitDo(id) {
  const g = game(), c = CASES[g.idx];
  const next = R.waitFor(g, c, id);
  if (next === g) return O.toast("Không đủ giờ để chờ.");
  store.set({ game: next });
  const news = freshNews(next, c);
  const lead = `Bạn đã chờ ${g.hours - next.hours} giờ. Giờ hiện tại: ${R.clockAt(next, c)}.`;
  O.showSheet(T.newsHTML(news, lead), { cinema: true });
}

/* ---------- Khóa mã ---------- */
function showLock(msg = "") {
  const g = game(), c = CASES[g.idx], a = c.actions.find((x) => x.id === lockEntry.id);
  lockEntry.msg = msg;
  O.showSheet(T.lockHTML(c, a, lockEntry.code, g.lockTries[a.id] || 0, msg));
}

function openLock(id) {
  lockEntry = { id, code: "", msg: "" };
  showLock();
}

function lockKey(k) {
  if (!lockEntry) return;
  const g = game(), a = CASES[g.idx].actions.find((x) => x.id === lockEntry.id);
  if (lockEntry.code.length >= a.lock.digits) return;
  lockEntry.code += String(k);
  showLock(lockEntry.msg);
}

function lockDel() {
  if (!lockEntry) return;
  lockEntry.code = lockEntry.code.slice(0, -1);
  showLock(lockEntry.msg);
}

function lockGo() {
  if (!lockEntry) return;
  const g = game(), c = CASES[g.idx], id = lockEntry.id;
  const a = c.actions.find((x) => x.id === id);
  if (lockEntry.code.length !== a.lock.digits) return;
  const r = R.attemptLock(g, c, id, lockEntry.code);
  lockEntry.code = "";
  if (r.status === "closed") return O.closeSheet();
  store.set({ game: r.game });
  if (r.status === "open") {
    lockEntry = null;
    O.closeSheet();
    O.flashHotspot(id);
    const news = freshNews(r.game, c);
    if (news.length) return O.showSheet(T.newsHTML(news, `Khóa đã mở. Đã ghi vào hồ sơ: ${a.title}`), { cinema: true });
    return O.toast(`Khóa đã mở. Đã ghi vào hồ sơ: ${a.title}`);
  }
  if (r.status === "wrong") return showLock(`Mã sai. Còn ${r.left} lần thử.`);
  // Bị khóa: mất giờ, và đồng hồ có thể đã tới một mốc diễn biến
  const news = freshNews(r.game, c);
  lockEntry = null;
  O.showSheet(T.newsHTML(news, `Thiết bị tự khóa vì nhập sai ${R.LOCK_TRIES} lần. Bạn mất ${R.LOCK_PENALTY} giờ chờ nó mở lại.`), { cinema: true });
}

/* ---------- Suy luận ---------- */
function ddTry() {
  const g = game(), c = CASES[g.idx];
  const next = R.tryDeduce(g, c);
  if (next === g) return;
  store.set({ game: next });
  const r = next.ddResult;
  if (r && r.status === "new") O.showSheet(T.deduceResultHTML(c, r.gives));
}

function openAccuse() {
  const g = game();
  if (!g || g.busy) return;
  if (g.over) return O.toast("Hồ sơ đã đóng. Hãy điều tra lại vụ này.");
  O.showSheet(T.accuseHTML(g, CASES[g.idx], accuse));
}

// Phiên xét xử nhiều người: chọn người cho một vai, chứng cứ cho một vai, đáp án một câu dựng lại sự việc
function vdPick(field, key, id) {
  accuse[field][key] = accuse[field][key] === id ? null : id;
  O.showSheet(T.accuseHTML(game(), CASES[game().idx], accuse));
}

function pickCulprit(id) {
  accuse.culprit = id;
  O.showSheet(T.accuseHTML(game(), CASES[game().idx], accuse));
}

// Chọn hồ sơ cho một bước; bấm lại hồ sơ đang chọn để bỏ chọn
function pickStep(key, id) {
  accuse.steps[key] = accuse.steps[key] === id ? null : id;
  O.showSheet(T.accuseHTML(game(), CASES[game().idx], accuse));
}

function submitVerdict() {
  const g = game(), c = CASES[g.idx];
  const roles = c.verdict.roles;
  if (roles.some((r) => !accuse.who[r.key])) return O.toast("Hãy chọn một người cho mỗi vai trước.");
  const v = R.judgeVerdict(c, accuse);
  if (v.win) return finish(true);
  const next = R.loseLife(g);
  store.set({ game: next });
  if (next.over) return finish(false);
  O.showSheet(T.wrongVerdictHTML(next.lives, v, c), { cinema: true });
}

function submitAccuse() {
  const g = game(), c = CASES[g.idx];
  if (R.hasVerdict(c)) return submitVerdict();
  if (!accuse.culprit) return O.toast("Hãy chọn một nghi phạm trước.");
  const v = R.judge(c, accuse.culprit, accuse.steps);
  if (v.win) return finish(true);
  const next = R.loseLife(g);
  store.set({ game: next });
  if (next.over) return finish(false);
  O.showSheet(T.wrongHTML(next.lives, v), { cinema: true });
}

function finish(win) {
  const s = store.get(), g = s.game, c = CASES[g.idx];
  if (win) {
    const save = R.recordWin(s.save, g.idx, c.id, g);
    // Thắng thì hồ sơ đóng, nên ván này không còn gì để khôi phục
    store.set({ save, game: { ...g, over: true } });
    storeSave(save);
    O.showSheet(T.verdictWinHTML(c, g.idx, g.wrong, save, g.hints || 0), { cinema: true });
  } else {
    O.showSheet(T.verdictLoseHTML(c, g.idx), { cinema: true });
  }
}

// Mở danh sách hồ sơ để đưa cho một người đã bị hỏi
function openConfront(who) {
  const g = game();
  if (!g || g.busy) return;
  if (g.over) return O.toast("Hồ sơ đã đóng. Hãy điều tra lại vụ này.");
  O.showSheet(T.confrontHTML(g, CASES[g.idx], who));
}

// Đưa một hồ sơ cho người đó: tốn giờ, hiện phản ứng, và báo nếu có lời khai mới
function confront(who, clue) {
  const g = game(), c = CASES[g.idx];
  const next = R.performConfront(g, c, who, clue);
  if (next === g) {
    if (R.departed(g, c, who)) return O.toast("Người này đã rời khỏi thành phố.");
    return O.toast(g.hours < R.CONFRONT_COST ? "Không đủ giờ để đưa chứng cứ." : "Không đưa được hồ sơ này lúc này.");
  }
  store.set({ game: next });
  const reveal = next.found.length > g.found.length
    ? c.actions.find((a) => a.id === next.found[next.found.length - 1])
    : null;
  const news = freshNews(next, c);
  O.showSheet(T.reactionHTML(c, who, clue, R.reactionFor(c, who, clue), reveal, news), { cinema: news.length > 0 });
}

function checkLinks() {
  const g = game(), c = CASES[g.idx];
  const next = R.checkPair(g, c);
  store.set({ game: next });
  if (next.lkResult && next.lkResult.status === "new") O.toast("Kết nối mới đã được ghi vào sổ tay");
}

// Kéo hồ sơ này thả lên hồ sơ kia trên bảng ghim: chọn cả hai rồi đối chiếu ngay, không tốn giờ
function pairLink(a, b) {
  const g = game(), c = CASES[g.idx];
  if (!g || g.busy || g.over) return;
  let n = R.pickClue({ ...g, pick: [] }, a);
  n = R.pickClue(n, b);
  if (n.pick.length !== 2) return;
  n = R.checkPair(n, c);
  store.set({ game: { ...n, pick: [] } });
  const status = n.lkResult && n.lkResult.status;
  if (status === "new") O.toast("Kết nối mới đã được ghi vào sổ tay");
  else if (status === "none") wiggle([a, b]);
}

/* ---------- Sổ tay: ghi chú, tổng quan địa điểm ---------- */
// Component Sổ tay báo ghi chú đang gõ lên đây. Lưu vào ván bằng cách thường (store.set): vẽ lại không làm mất focus
// vì Preact chỉ cập nhật phần đổi, và bản nháp nằm trong chính ô nhập nên bộ gõ tiếng Việt không bị gián đoạn
function saveNote(key, text) {
  const g = game();
  if (!g || g.over) return;
  const next = R.setNote(g, key, text);
  if (next === g) return;
  store.set({ game: next });
}

function openOverview() {
  const g = game();
  if (!g || g.busy) return;
  O.hideTestimony();
  O.showSheet(T.overviewHTML(g, CASES[g.idx]));
}

/* ---------- Gợi ý và hướng dẫn ---------- */
// level 1: chỉ hướng; level 2: nói rõ và làm điểm điều tra nhấp nháy. Mỗi lần mở được đếm vào g.hints
function openHint(level) {
  const g = game();
  if (!g || g.busy) return;
  if (g.over) return O.toast("Hồ sơ đã đóng. Hãy điều tra lại vụ này.");
  const c = CASES[g.idx];
  const st = R.nextStep(g, c);
  const hintId = level >= 2 && st.kind === "go" && st.loc === g.loc ? st.id : g.hintId || null;
  const next = { ...g, hints: (g.hints || 0) + 1, hintId };
  store.set({ game: next });
  O.showSheet(T.hintSheetHTML(next, c, st, level));
}

// Hộp thoại mở đầu vừa đóng và đây là lần đầu chơi: chạy hướng dẫn sau một nhịp để cảnh kịp hiện
function maybeCoach() {
  if (!coachPending || O.sheetOpen() || store.get().screen !== "case") return;
  coachPending = false;
  markCoachSeen();
  setTimeout(() => startCoach((on) => O.setCoachActive(on)), 450);
}

function resetProgress() {
  clearSave();
  clearRun();
  store.set({ save: R.emptySave() });
  O.closeSheet();
}

// Ván đang chơi được lưu sau mỗi thay đổi, để tải lại trang không mất tiến độ. Ván đã kết thúc thì xóa
function persistRun() {
  const s = store.get();
  if (s.screen !== "case" || !s.game) return;
  if (s.game.over) return clearRun();
  storeRun({ idx: s.game.idx, game: { ...s.game, busy: false } });
}

// Đưa một ván đã lưu trở lại màn hình. Trả về false nếu ván đã kết thúc hoặc không khớp với dữ liệu vụ hiện tại
function resumeRun(run) {
  if (!run || run.game.over || !CASES[run.idx] || !CASES[run.idx].locations[run.game.loc]) return false;
  const c = CASES[run.idx];
  // Dữ liệu vụ có thể đã đổi sau khi lưu: hồ sơ đã thu mà không còn tồn tại thì không khôi phục
  if (!run.game.found.every((id) => c.actions.some((a) => a.id === id))) return false;
  // Bản lưu cũ chưa có đánh dấu và ghi chú; dữ liệu sai kiểu thì bỏ, để không làm hỏng Sổ tay
  const plain = (o) => (o && typeof o === "object" && !Array.isArray(o) ? o : {});
  const g = { ...R.newGame(run.idx, c), ...run.game, fav: plain(run.game.fav), notes: plain(run.game.notes), busy: false };
  nbEpoch++;
  announced = R.nowMinutes(g, c);
  store.set({ screen: "case", game: g, nb: false, region: c.region });
  return true;
}

// Tải lại trang: nếu còn ván chưa kết thúc thì đưa người chơi về đúng vụ và địa điểm đó
function restoreRun() {
  const run = loadRun();
  if (run && !resumeRun(run)) clearRun();
}

/* ---------- Hành động gắn với data-action ---------- */
export const actions = {
  region: (d) => {
    storeRegion(d.id);
    store.set({ region: d.id });
  },
  start: (d) => startCase(Number(d.i)),
  menu: () => goMenu(),
  go: (d) => goLoc(Number(d.loc)),
  act: (d) => act(d.id),
  pan: (d) => stage.pan(Number(d.dir)),
  "nb-toggle": () => {
    O.hideTestimony();
    store.set({ nb: !store.get().nb });
  },
  "tm-close": () => O.hideTestimony(),
  "lk-pair": (d) => pairLink(d.a, d.b),
  "nb-tab": (d) => {
    $("nb-body").scrollTop = 0;
    setGame({ tab: d.tab });
  },
  mark: (d) => store.set({ game: R.cycleMark(game(), d.id) }),
  mx: (d) => store.set({ game: R.cycleMatrix(game(), d.rid, d.act) }),
  "lk-pick": (d) => store.set({ game: R.pickClue(game(), d.id) }),
  "lk-check": () => checkLinks(),
  "dd-pick": (d) => store.set({ game: R.pickDeduce(game(), d.id) }),
  "dd-clear": () => store.set({ game: { ...game(), dpick: [], ddResult: null } }),
  "dd-try": () => ddTry(),
  "lock-key": (d) => lockKey(d.k),
  "lock-del": () => lockDel(),
  "lock-go": () => lockGo(),
  "wait-do": (d) => waitDo(d.id),
  "vd-who": (d) => vdPick("who", d.role, d.id),
  "vd-ev": (d) => vdPick("evid", d.role, d.id),
  "vd-fact": (d) => vdPick("facts", d.key, d.id),
  "confront-open": (d) => openConfront(d.who),
  confront: (d) => confront(d.who, d.clue),
  accuse: () => {
    O.hideTestimony();
    openAccuse();
  },
  pick: (d) => pickCulprit(d.id),
  "st-pick": (d) => pickStep(d.step, d.id),
  submit: () => submitAccuse(),
  close: () => {
    lockEntry = null;
    O.closeSheet();
    maybeCoach();
  },
  fav: (d) => store.set({ game: R.toggleFav(game(), d.id) }),
  overview: () => openOverview(),
  "ov-go": (d) => {
    O.closeSheet();
    goLoc(Number(d.loc));
  },
  hint: () => openHint(1),
  "hint-more": () => openHint(2),
  "coach-reset": () => {
    markCoachSeen(false);
    O.toast("Hướng dẫn sẽ hiện lại khi bạn vào một vụ án.");
  },
  help: () => O.showSheet(T.helpHTML()),
  "reset-ask": () => O.showSheet(T.resetHTML()),
  "reset-confirm": () => resetProgress()
};

// Khởi động: dựng sân khấu, vẽ menu, nối phím tắt
export function boot() {
  stage.mountStage();
  mountPinboard($("nb-body"), pairLink);
  onLampMove(lightSecrets);
  restoreRun();
  store.subscribe(persistRun);
  store.subscribe(render);
  document.addEventListener("keydown", (e) => {
    if (lockEntry && O.sheetOpen()) {
      if (/^[0-9]$/.test(e.key)) return lockKey(e.key), e.preventDefault();
      if (e.key === "Backspace") return lockDel(), e.preventDefault();
      if (e.key === "Enter") return lockGo(), e.preventDefault();
    }
    if (e.key === "Escape") {
      lockEntry = null;
      if (coachActive()) skipCoach();
      else if (O.sheetOpen()) {
        O.closeSheet();
        maybeCoach();
      } else if (store.get().nb) store.set({ nb: false });
      return;
    }
    if (O.sheetOpen() || store.get().screen !== "case") return;
    // Đang gõ vào ô tìm hoặc ghi chú: mũi tên, Home, End và chữ M là của ô nhập, không phải của camera hay phím tắt
    if (e.target.closest && e.target.closest("input, textarea, select")) return;
    if (e.key.toLowerCase() === "m" && !e.ctrlKey && !e.metaKey && !e.altKey && !coachActive()) return openOverview();
    if (stage.panKey(e.key)) e.preventDefault();
  });
  render();
}
