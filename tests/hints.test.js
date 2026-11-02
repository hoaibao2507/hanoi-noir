// Gợi ý: luôn chỉ ra việc làm được, và làm theo gợi ý từng bước thì mọi vụ đều đi tới lúc đủ chứng cứ để buộc tội.
import test from "node:test";
import assert from "node:assert/strict";
import { CASES } from "../src/data/cases.js";
import {
  newGame, nextStep, spotOf, actionOf, performAct, attemptLock, waitFor, pickDeduce, tryDeduce, performConfront, judge, judgeVerdict
} from "../src/game/rules.js";

// Làm theo gợi ý đúng như người chơi sẽ làm, cho tới khi gợi ý báo đủ chứng cứ
function follow(c, idx) {
  let g = newGame(idx, c);
  const trail = [];
  for (let i = 0; i < 80; i++) {
    const st = nextStep(g, c);
    trail.push(st.kind);
    if (st.kind === "accuse") return { g, trail };
    let next = g;
    if (st.kind === "go") {
      const a = actionOf(c, st.id);
      next = a.lock ? attemptLock(g, c, st.id, a.lock.code).game : performAct(g, c, st.id);
    } else if (st.kind === "wait") {
      next = waitFor(g, c, st.id);
    } else if (st.kind === "deduce") {
      let x = g;
      for (const n of st.needs) x = pickDeduce(x, n);
      next = tryDeduce(x, c);
    } else if (st.kind === "confront") {
      next = performConfront(g, c, st.who, st.clue);
    }
    assert.notEqual(next, g, `${c.id}: gợi ý "${st.kind}" (${st.id || ""}) không làm được ở bước ${i}`);
    g = next;
  }
  assert.fail(`${c.id}: làm theo gợi ý 80 bước vẫn chưa xong: ${trail.join(" > ")}`);
}

test("mỗi vụ: làm theo gợi ý từng bước dẫn tới đủ chứng cứ trong ngân sách giờ", () => {
  CASES.forEach((c, idx) => {
    const { g } = follow(c, idx);
    assert.ok(g.hours >= 0, `${c.id}: hết giờ`);
    const groups = c.verdict ? c.verdict.roles : c.chain;
    for (const grp of groups) assert.ok(grp.ids.some((i) => g.done[i]), `${c.id}: thiếu chứng cứ cho "${grp.key}"`);
  });
});

test("có đủ chứng cứ do gợi ý chỉ ra thì buộc tội đúng thắng (vụ một thủ phạm)", () => {
  CASES.filter((c) => c.chain).forEach((c) => {
    const idx = CASES.indexOf(c);
    const { g } = follow(c, idx);
    const picks = Object.fromEntries(c.chain.map((st) => [st.key, st.ids.find((i) => g.done[i])]));
    assert.ok(judge(c, c.culprit, picks).win, `${c.id}: không thắng bằng chứng cứ từ gợi ý`);
  });
});

test("vụ nhiều người: chứng cứ từ gợi ý khớp từng vai", () => {
  CASES.filter((c) => c.verdict).forEach((c) => {
    const { g } = follow(c, CASES.indexOf(c));
    const who = Object.fromEntries(c.verdict.roles.map((r) => [r.key, r.who]));
    const evid = Object.fromEntries(c.verdict.roles.map((r) => [r.key, r.ids.find((i) => g.done[i])]));
    const v = judgeVerdict(c, { who, evid, facts: {} });
    assert.ok(v.right && v.roles.every((r) => r.evOk), `${c.id}: chứng cứ của vai không đủ`);
  });
});

test("gợi ý chỉ đến điểm điều tra có thật và đang làm được", () => {
  for (const c of CASES) {
    const g = newGame(CASES.indexOf(c), c);
    const st = nextStep(g, c);
    assert.notEqual(st.kind, "accuse", `${c.id}: chưa làm gì mà đã đủ chứng cứ`);
    if (st.kind === "go") {
      const spot = spotOf(c, st.id);
      assert.ok(spot && spot.loc === st.loc && st.label, `${c.id}: điểm ${st.id} không có trên bản đồ`);
    }
  }
});
