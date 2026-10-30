/* =====================================================================
   Bộ điều khiển: nối trạng thái, luật chơi, sân khấu và giao diện.
   Mọi thay đổi đi qua store; render() đọc trạng thái và cập nhật từng vùng.
   ===================================================================== */
import { CASES } from "./data/cases.js";
import { ART } from "./art/art.js";
import { createStore } from "./state/store.js";
import * as R from "./game/rules.js";
import { loadSave, storeSave, clearSave } from "./game/save.js";
import { doorsFor } from "./world/doors.js";
import { WORLD_W, OX, COMP_W } from "./world/layout.js";
import * as stage from "./ui/stage.js";
import { onLampMove } from "./ui/cursor.js";
import { lightSecrets } from "./ui/flashlight.js";
import * as T from "./ui/templates.js";
import * as O from "./ui/overlays.js";
import { $, setHTML } from "./ui/dom.js";

const MENU_W = 1600;
const store = createStore({ screen: "menu", save: loadSave(), game: null, nb: false });
// Lựa chọn trong phiên xét xử: thủ phạm và hồ sơ đã chọn cho từng bước. Giữ lại giữa các lần thử trong một vụ
const emptyAccuse = () => ({ culprit: null, steps: {} });
let accuse = emptyAccuse();
let worldKey = null;
// Đồng hồ (theo phút) đã báo diễn biến tới đó; diễn biến nằm sau mốc này sẽ được báo khi tới
let announced = 0;

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
  stage.markScene("menu");
  syncWorld("menu", MENU_W, MENU_W / 2);
  stage.setArt("menu", () => ART.scene("menu"), "menu");
  stage.setDoors("");
  stage.setHotspots("");
  setHTML($("ui"), T.menuHTML(s.save));
  $("notebook").classList.remove("is-open");
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
  const nb = $("nb-body"), y = nb.scrollTop;
  setHTML(nb, T.notebookHTML(g, c));
  nb.scrollTop = y;
  $("notebook").classList.toggle("is-open", s.nb);
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
  const g0 = { ...R.newGame(i, c), busy: true };
  announced = R.nowMinutes(g0, c);
  store.set({ screen: "case", game: g0, nb: false });
  await O.veil(`Vụ ${c.no}`, c.title, c.place, null);
  setGame({ busy: false });
  O.showSheet(T.briefingHTML(c));
  O.animateEntrance();
}

async function goLoc(i) {
  const g = game();
  if (!g || g.busy || i === g.loc) return;
  setGame({ busy: true });
  const L = CASES[g.idx].locations[i];
  await O.veil("Di chuyển đến", L.name, L.time, () => setGame({ loc: i }));
  setGame({ busy: false });
  O.animateEntrance();
}

function goMenu() {
  O.closeSheet();
  store.set({ screen: "menu", game: null, nb: false });
}

function act(id) {
  const g = game(), c = CASES[g.idx];
  const next = R.performAct(g, c, id);
  if (next === g) return;
  store.set({ game: next });
  O.flashHotspot(id);
  const title = c.actions.find((a) => a.id === id).title;
  const news = freshNews(next, c);
  if (news.length) return O.showSheet(T.newsHTML(news, `Đã ghi vào hồ sơ: ${title}`));
  O.toast(`Đã ghi vào hồ sơ: ${title}`);
}

function openAccuse() {
  const g = game();
  if (!g || g.busy) return;
  if (g.over) return O.toast("Hồ sơ đã đóng. Hãy điều tra lại vụ này.");
  O.showSheet(T.accuseHTML(g, CASES[g.idx], accuse));
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

function submitAccuse() {
  const g = game(), c = CASES[g.idx];
  if (!accuse.culprit) return O.toast("Hãy chọn một nghi phạm trước.");
  const v = R.judge(c, accuse.culprit, accuse.steps);
  if (v.win) return finish(true);
  const next = R.loseLife(g);
  store.set({ game: next });
  if (next.over) return finish(false);
  O.showSheet(T.wrongHTML(next.lives, v));
}

function finish(win) {
  const s = store.get(), g = s.game, c = CASES[g.idx];
  if (win) {
    const save = R.recordWin(s.save, g.idx, c.id, g);
    store.set({ save });
    storeSave(save);
    O.showSheet(T.verdictWinHTML(c, g.idx, g.wrong, save));
  } else {
    O.showSheet(T.verdictLoseHTML(c, g.idx));
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
  O.showSheet(T.reactionHTML(c, who, clue, R.reactionFor(c, who, clue), reveal, news));
}

function checkLinks() {
  const g = game(), c = CASES[g.idx];
  const next = R.checkPair(g, c);
  store.set({ game: next });
  if (next.lkResult && next.lkResult.status === "new") O.toast("Kết nối mới đã được ghi vào sổ tay");
}

function resetProgress() {
  clearSave();
  store.set({ save: R.emptySave() });
  O.closeSheet();
}

/* ---------- Hành động gắn với data-action ---------- */
export const actions = {
  start: (d) => startCase(Number(d.i)),
  menu: () => goMenu(),
  go: (d) => goLoc(Number(d.loc)),
  act: (d) => act(d.id),
  pan: (d) => stage.pan(Number(d.dir)),
  "nb-toggle": () => store.set({ nb: !store.get().nb }),
  "nb-tab": (d) => {
    $("nb-body").scrollTop = 0;
    setGame({ tab: d.tab });
  },
  mark: (d) => store.set({ game: R.cycleMark(game(), d.id) }),
  mx: (d) => store.set({ game: R.cycleMatrix(game(), d.rid, d.act) }),
  "lk-pick": (d) => store.set({ game: R.pickClue(game(), d.id) }),
  "lk-check": () => checkLinks(),
  "confront-open": (d) => openConfront(d.who),
  confront: (d) => confront(d.who, d.clue),
  accuse: () => openAccuse(),
  pick: (d) => pickCulprit(d.id),
  "st-pick": (d) => pickStep(d.step, d.id),
  submit: () => submitAccuse(),
  close: () => O.closeSheet(),
  help: () => O.showSheet(T.helpHTML()),
  "reset-ask": () => O.showSheet(T.resetHTML()),
  "reset-confirm": () => resetProgress()
};

// Khởi động: dựng sân khấu, vẽ menu, nối phím tắt
export function boot() {
  stage.mountStage();
  onLampMove(lightSecrets);
  store.subscribe(render);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (O.sheetOpen()) O.closeSheet();
      else if (store.get().nb) store.set({ nb: false });
      return;
    }
    if (O.sheetOpen() || store.get().screen !== "case") return;
    if (stage.panKey(e.key)) e.preventDefault();
  });
  render();
}
