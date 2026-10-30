import { test } from "node:test";
import assert from "node:assert/strict";
import { CASES } from "../src/data/cases.js";
import { newGame, performAct } from "../src/game/rules.js";
import { loadRun, storeRun, clearRun } from "../src/game/save.js";

// Node không có localStorage, nên dùng một bộ nhớ giả với đúng ba hàm save.js cần
const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => {
    mem.set(k, String(v));
  },
  removeItem: (k) => {
    mem.delete(k);
  }
};
const RUN_KEY = "hanoi-noir-run-v1";

const c1 = CASES[0];

test("ván đang chơi được lưu và đọc lại đúng sau khi tải lại trang", () => {
  clearRun();
  const g = performAct(newGame(0, c1), c1, "khamtu");
  storeRun({ idx: 0, game: g });
  const run = loadRun();
  assert.equal(run.idx, 0);
  assert.equal(run.game.hours, g.hours);
  assert.deepEqual(run.game.found, ["khamtu"]);
  assert.equal(run.game.done.khamtu, true);
});

test("dữ liệu lưu hỏng hoặc không khớp với ván thì bị bỏ qua, không khôi phục", () => {
  localStorage.setItem(RUN_KEY, "{ không phải json");
  assert.equal(loadRun(), null, "JSON hỏng");
  localStorage.setItem(RUN_KEY, JSON.stringify({ idx: 1, game: newGame(0, c1) }));
  assert.equal(loadRun(), null, "idx không khớp với ván");
  localStorage.setItem(RUN_KEY, JSON.stringify({ idx: 0 }));
  assert.equal(loadRun(), null, "thiếu ván");
  clearRun();
  assert.equal(loadRun(), null, "đã xóa thì không còn gì");
});

test("tiến độ số sao không bị ảnh hưởng khi lưu ván đang chơi", () => {
  localStorage.setItem("hanoi-noir-save-v2", JSON.stringify({ unlocked: 1, stars: { c1: 2 } }));
  storeRun({ idx: 0, game: newGame(0, c1) });
  clearRun();
  assert.deepEqual(JSON.parse(localStorage.getItem("hanoi-noir-save-v2")), { unlocked: 1, stars: { c1: 2 } });
});
