/* =====================================================================
   Luật chơi thuần: không đụng DOM, không đụng localStorage.
   Mọi hàm nhận trạng thái rồi trả về trạng thái mới (không sửa tại chỗ),
   nên có thể kiểm thử bằng node:test.
   ===================================================================== */

export const MAX_LIVES = 3;
export const CONFRONT_COST = 1; // giờ cho mỗi lần đưa chứng cứ
export const LOCK_TRIES = 3;    // số lần thử mã trước khi thiết bị tự khóa
export const LOCK_PENALTY = 1;  // giờ mất khi thiết bị tự khóa
export const MAX_DEDUCE = 4;    // số hồ sơ tối đa ghép được trong một suy luận

// Trạng thái một vụ đang điều tra
export function newGame(caseIdx, c) {
  const marks = {};
  c.suspects.forEach((s) => (marks[s.id] = 0));
  return {
    idx: caseIdx,
    loc: 0,
    hours: c.budget,
    lives: MAX_LIVES,
    done: {},
    found: [],
    marks,
    mx: {},
    pick: [],
    links: [],
    lkResult: null,
    dpick: [],
    ddResult: null,
    ddTries: 0,
    ddFrom: {},
    lockTries: {},
    confronted: {},
    hints: 0,
    hintId: null,
    wrong: 0,
    over: false,
    busy: false,
    tab: "sus"
  };
}

export const actionOf = (c, id) => c.actions.find((a) => a.id === id);

// Điểm điều tra còn bị khóa vì chưa có hồ sơ mở khóa ("gate", thường là một kết luận)
export const gated = (game, c, id) => {
  const a = actionOf(c, id);
  return !!a && !!a.gate && !game.done[a.gate];
};

// Hồ sơ đến muộn (diễn biến "arrive"): số phút còn phải chờ, hoặc 0 khi đã có
export function pendingMinutes(game, c, id) {
  const w = (c.world || []).find((x) => x.kind === "arrive" && x.id === id);
  if (!w) return 0;
  return Math.max(0, absMinutes(c, w.at) - nowMinutes(game, c));
}
export const isPending = (game, c, id) => !game.done[id] && pendingMinutes(game, c, id) > 0;
// Mốc giờ hồ sơ đến ("HH:MM"), hoặc null nếu hồ sơ không đến muộn
export const arrivalOf = (c, id) => ((c.world || []).find((w) => w.kind === "arrive" && w.id === id) || {}).at || null;
// Số giờ nguyên phải chờ để hồ sơ đến (làm tròn lên, vì giờ điều tra tính theo giờ nguyên)
export const waitHours = (game, c, id) => Math.ceil(pendingMinutes(game, c, id) / 60);

// Điểm điều tra có thể thực hiện ngay không (đủ giờ, chưa làm, hồ sơ chưa đóng, chưa mất theo đồng hồ, đã mở khóa, đã đến)
export function isOpen(game, c, id) {
  const a = actionOf(c, id);
  return (
    !!a && !a.via && !game.done[id] && !game.over && game.hours >= a.cost &&
    !isGone(game, c, id) && !gated(game, c, id) && !isPending(game, c, id)
  );
}

// Chờ tới khi hồ sơ đến: tốn số giờ chờ, rồi vẫn còn đủ giờ để đọc hồ sơ. Không đủ thì giữ nguyên trạng thái
export function waitFor(game, c, id) {
  const a = actionOf(c, id);
  if (game.busy || game.over || !a || a.via || game.done[id] || gated(game, c, id) || isGone(game, c, id)) return game;
  const need = waitHours(game, c, id);
  if (need <= 0 || game.hours < need + a.cost) return game;
  return { ...game, hours: game.hours - need };
}

// Thử mã của một điểm điều tra có khóa. Đúng thì làm điểm đó luôn. Sai ba lần thì thiết bị tự khóa và mất giờ.
// status: "open" (mở được), "wrong" (sai, còn "left" lần), "locked" (bị khóa, mất giờ), "closed" (không thử được)
export function attemptLock(game, c, id, code) {
  const a = actionOf(c, id);
  if (!a || !a.lock || !isOpen(game, c, id)) return { game, status: "closed" };
  if (code === a.lock.code) return { game: performAct(game, c, id), status: "open" };
  const tries = (game.lockTries[id] || 0) + 1;
  if (tries >= LOCK_TRIES) {
    return {
      game: { ...game, hours: Math.max(0, game.hours - LOCK_PENALTY), lockTries: { ...game.lockTries, [id]: 0 } },
      status: "locked"
    };
  }
  return { game: { ...game, lockTries: { ...game.lockTries, [id]: tries } }, status: "wrong", left: LOCK_TRIES - tries };
}

// Thực hiện một điểm điều tra: trừ giờ, ghi hồ sơ
export function performAct(game, c, id) {
  if (game.busy || !isOpen(game, c, id)) return game;
  const a = actionOf(c, id);
  return {
    ...game,
    hours: game.hours - a.cost,
    done: { ...game.done, [id]: true },
    found: [...game.found, id],
    tab: "ho"
  };
}

// Đổi nhãn nghi phạm: chưa rõ, nghi ngờ, loại trừ (chỉ là ghi chú của người chơi)
export function cycleMark(game, sid) {
  return { ...game, marks: { ...game.marks, [sid]: ((game.marks[sid] || 0) + 1) % 3 } };
}

// Đổi ô trong bảng đối chiếu:·, ✓, ✗
export function cycleMatrix(game, rid, act) {
  const k = `${rid}|${act}`;
  return { ...game, mx: { ...game.mx, [k]: ((game.mx[k] || 0) + 1) % 3 } };
}

// Khóa của một cặp hồ sơ, không phụ thuộc thứ tự chọn
export const pairKey = (a, b) => [a, b].sort().join("|");

/* ---------- Suy luận: ghép hồ sơ thành kết luận ---------- */

const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

// Chọn hoặc bỏ chọn một hồ sơ (kể cả kết luận đã có) để ghép. Chỉ hồ sơ đã thu mới chọn được; tối đa MAX_DEDUCE
export function pickDeduce(game, id) {
  if (!game.done[id]) return game;
  const dpick = game.dpick.includes(id)
    ? game.dpick.filter((x) => x !== id)
    : [...game.dpick, id].slice(-MAX_DEDUCE);
  return { ...game, dpick, ddResult: null };
}

// Suy luận viết sẵn cho đúng tập hồ sơ này (không phân biệt thứ tự), hoặc null
export const deductionFor = (c, ids) => (c.deduce || []).find((d) => sameSet(d.needs, ids)) || null;

// Ghép các hồ sơ đang chọn. Đúng thì ghi kết luận mới (không tốn giờ). Sai thì chỉ đếm số lần thử.
// ddResult.status: "new" (kết luận mới), "known" (đã có kết luận này), "none" (chưa cho kết luận nào)
export function tryDeduce(game, c) {
  if (game.dpick.length < 2) return game;
  const d = deductionFor(c, game.dpick);
  if (!d) return { ...game, ddTries: (game.ddTries || 0) + 1, ddResult: { status: "none" } };
  if (game.done[d.gives]) return { ...game, ddResult: { status: "known", gives: d.gives } };
  return {
    ...game,
    done: { ...game.done, [d.gives]: true },
    found: [...game.found, d.gives],
    dpick: [],
    ddFrom: { ...(game.ddFrom || {}), [d.gives]: d.needs },
    ddResult: { status: "new", gives: d.gives }
  };
}

// Mọi kết luận đã đủ hồ sơ để rút ra (dùng cho kiểm thử: một người chơi hoàn hảo luôn rút hết)
export function closeDeductions(game, c) {
  let g = game;
  let changed = true;
  while (changed) {
    changed = false;
    for (const d of c.deduce || []) {
      if (g.done[d.gives] || !d.needs.every((id) => g.done[id])) continue;
      g = { ...g, done: { ...g.done, [d.gives]: true }, found: [...g.found, d.gives], ddFrom: { ...(g.ddFrom || {}), [d.gives]: d.needs } };
      changed = true;
    }
  }
  return g;
}

// Kết luận (hoặc hồ sơ) mà việc có được "id" sẽ mở ra: điểm điều tra có gate = id, và thiết bị được hiệu chỉnh
export function unlocksOf(c, id) {
  const spots = c.actions.filter((a) => a.gate === id && !a.via);
  const devs = Object.values(c.devices || {}).filter((d) => d.by === id);
  return { spots, devs };
}

// Kết nối được viết sẵn cho cặp hồ sơ này trong dữ liệu vụ, hoặc null
export function linkFor(c, a, b) {
  const k = pairKey(a, b);
  return (c.links || []).find((l) => pairKey(l.a, l.b) === k) || null;
}

// Chọn hoặc bỏ chọn một hồ sơ để đối chiếu. Chỉ hồ sơ đã thu mới chọn được; tối đa hai
export function pickClue(game, id) {
  if (!game.done[id]) return game;
  const pick = game.pick.includes(id)
    ? game.pick.filter((x) => x !== id)
    : [...game.pick, id].slice(-2);
  return { ...game, pick, lkResult: null };
}

// Đối chiếu hai hồ sơ đang chọn. Cặp đúng được ghi lại một lần; không tốn giờ
export function checkPair(game, c) {
  if (game.pick.length !== 2) return game;
  const [a, b] = game.pick;
  const key = pairKey(a, b);
  if (!linkFor(c, a, b)) return { ...game, lkResult: { status: "none", key } };
  if (game.links.includes(key)) return { ...game, lkResult: { status: "known", key } };
  return { ...game, links: [...game.links, key], lkResult: { status: "new", key } };
}

// Khóa của một cặp (người nhận, hồ sơ đưa ra)
export const confrontKey = (who, clue) => `${who}|${clue}`;

// Chỉ người đã bị hỏi (đã có lời khai của họ trong hồ sơ) mới bị đưa chứng cứ
export function questioned(game, c, who) {
  return c.actions.some((a) => game.done[a.id] && a.visual && a.visual.k === "who" && a.visual.id === who);
}

// Các hồ sơ còn đưa được cho người này: đã thu, không phải lời khai của chính họ, và chưa đưa lần nào
export function confrontOptions(game, c, who) {
  if (!questioned(game, c, who) || departed(game, c, who)) return [];
  return game.found.filter((id) => {
    const a = actionOf(c, id);
    const own = !!a && !!a.visual && a.visual.k === "who" && a.visual.id === who;
    return !own && !game.confronted[confrontKey(who, id)];
  });
}

// Phản ứng viết sẵn cho cặp này, hoặc null khi người đó chỉ giữ nguyên lời khai
export function reactionFor(c, who, clue) {
  return (c.confront || []).find((r) => r.who === who && r.clue === clue) || null;
}

// Đưa một hồ sơ cho người đã bị hỏi: tốn giờ, ghi cặp đã đưa, và nếu có phản ứng mở lời khai mới thì ghi thêm
export function performConfront(game, c, who, clue) {
  if (game.busy || game.over || game.hours < CONFRONT_COST) return game;
  if (!confrontOptions(game, c, who).includes(clue)) return game;
  const r = reactionFor(c, who, clue);
  const reveal = r && r.reveal && !game.done[r.reveal] ? r.reveal : null;
  const next = {
    ...game,
    hours: game.hours - CONFRONT_COST,
    confronted: { ...game.confronted, [confrontKey(who, clue)]: true }
  };
  if (!reveal) return next;
  return { ...next, done: { ...next.done, [reveal]: true }, found: [...next.found, reveal] };
}

// Các kết nối đã tìm được trong vụ, theo thứ tự dữ liệu
export function linksOf(game, c) {
  return (c.links || []).filter((l) => game.links.includes(pairKey(l.a, l.b)));
}

/* ---------- Dòng thời gian ---------- */

// "HH:MM" thành số phút trong ngày, để so sánh khoảng giờ
const minutesOf = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
// Hai khoảng giờ có chồng nhau không (mốc cuối là điểm dừng, không tính)
const overlaps = (a, b) => minutesOf(a.from) < minutesOf(b.to) && minutesOf(b.from) < minutesOf(a.to);
// Khoảng outer có bao trọn khoảng inner không
const covers = (outer, inner) =>
  minutesOf(outer.from) <= minutesOf(inner.from) && minutesOf(outer.to) >= minutesOf(inner.to);

// Cộng (hoặc trừ) số phút vào một mốc "HH:MM", quay vòng trong ngày
const shiftTime = (hhmm, mins) => {
  const m = (((minutesOf(hhmm) + mins) % (24 * 60)) + 24 * 60) % (24 * 60);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

// Mốc đã ghi: các khoảng giờ từ hồ sơ đã thu, theo thứ tự thời gian.
// Mốc chỉ gắn người khi mọi hồ sơ trong "needs" đã thu; trước đó người là null và pending là true.
// Mốc có "dev" lấy giờ từ một thiết bị lệch giờ (c.devices): giữ nguyên giờ máy cho tới khi kết luận "by" của thiết bị được
// rút ra, sau đó cộng độ lệch "off". Mọi so sánh ngoại phạm đều dùng giờ đã hiệu chỉnh nếu có.
export function timelineEvents(game, c) {
  const out = [];
  c.actions.forEach((a) => {
    if (!game.done[a.id]) return;
    (a.spans || []).forEach((s) => {
      const known = (s.needs || []).every((id) => game.done[id]);
      const dev = s.dev && c.devices ? c.devices[s.dev] : null;
      const fixed = !!dev && !!game.done[dev.by];
      out.push({
        clue: a.id,
        title: a.title,
        from: fixed ? shiftTime(s.from, dev.off) : s.from,
        to: fixed ? shiftTime(s.to, dev.off) : s.to,
        at: s.at,
        who: known ? s.who || null : null,
        pending: !known && !!s.who,
        dev: dev ? { name: dev.name, fixed, off: dev.off, rawFrom: s.from, rawTo: s.to } : null
      });
    });
  });
  return out.sort((x, y) => minutesOf(x.from) - minutesOf(y.from) || minutesOf(x.to) - minutesOf(y.to));
}

// Lời khai về nơi ở đã ghi, kèm kết quả đối chiếu với các mốc của đúng người đó:
// "clash" (bị bác): có mốc chồng giờ nhưng khác nơi; "proof" (được xác nhận): có mốc bao trọn khoảng khai ở cùng nơi;
// "open": chưa có chứng cứ. by là mốc gây ra kết quả, hoặc null.
export function alibisOf(game, c) {
  const events = timelineEvents(game, c);
  return c.actions
    .filter((a) => game.done[a.id] && a.alibi)
    .map((a) => {
      const al = a.alibi;
      const mine = events.filter((e) => e.who === al.who);
      const clash = mine.find((e) => e.at !== al.at && overlaps(e, al)) || null;
      const proof = clash ? null : mine.find((e) => e.at === al.at && covers(e, al)) || null;
      const status = clash ? "clash" : proof ? "proof" : "open";
      return { clue: a.id, title: a.title, ...al, status, by: clash || proof };
    });
}

// Vụ có dòng thời gian khi có mốc, lời khai về nơi ở, hoặc diễn biến theo đồng hồ
export const hasTimeline = (c) =>
  (c.world || []).length > 0 || c.actions.some((a) => a.alibi || (a.spans && a.spans.length));

/* ---------- Đồng hồ và diễn biến ---------- */

const DAY = 24 * 60;
const pad = (n) => String(n).padStart(2, "0");

// Phút của một mốc "HH:MM" trên cùng trục thời gian với giờ bắt đầu. Mốc trước giờ bắt đầu là sang ngày hôm sau
const absMinutes = (c, hhmm) => {
  const m = minutesOf(hhmm);
  return m < minutesOf(c.clock.start) ? m + DAY : m;
};

// Phút hiện tại: giờ bắt đầu cộng số giờ đã dùng. Di chuyển không tốn giờ nên không làm đồng hồ chạy
export const nowMinutes = (game, c) => minutesOf(c.clock.start) + (c.budget - game.hours) * 60;

// Giờ hiện tại dạng "HH:MM"
export function clockAt(game, c) {
  const m = nowMinutes(game, c) % DAY;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

// Diễn biến nằm trong khoảng (from, to] theo phút, sắp theo thời gian
export function eventsBetween(c, from, to) {
  return (c.world || [])
    .filter((w) => absMinutes(c, w.at) > from && absMinutes(c, w.at) <= to)
    .sort((x, y) => absMinutes(c, x.at) - absMinutes(c, y.at));
}

// Diễn biến đã xảy ra tới giờ hiện tại
export const eventsDone = (game, c) => eventsBetween(c, -Infinity, nowMinutes(game, c));

// Hồ sơ đã mất: có diễn biến "gone" nhắm vào hồ sơ này và đã tới mốc. Hồ sơ đã thu thì không mất.
// Lời khai của người đã rời đi cũng mất theo, vì không còn ai để hỏi.
export function isGone(game, c, id) {
  if (game.done[id]) return false;
  const a = actionOf(c, id);
  const now = nowMinutes(game, c);
  return (c.world || []).some((w) => absMinutes(c, w.at) <= now && (
    (w.kind === "gone" && w.id === id) ||
    (w.kind === "leave" && !!a && !!a.visual && a.visual.k === "who" && a.visual.id === w.id)
  ));
}

// Nghi phạm đã rời khỏi thành phố: không hỏi được và không đưa chứng cứ được nữa
export const departed = (game, c, who) =>
  (c.world || []).some((w) => w.kind === "leave" && w.id === who && absMinutes(c, w.at) <= nowMinutes(game, c));

// Đánh giá một lần buộc tội theo chuỗi chứng minh. picks: { [key của bước]: id hồ sơ đã chọn }.
// Thắng khi đúng người và đúng cả các bước. Mỗi bước được chấm riêng để phản hồi cụ thể.
export function judge(c, culprit, picks) {
  const steps = c.chain.map((st) => {
    const pick = picks[st.key] || null;
    return { key: st.key, label: st.label, pick, ok: !!pick && st.ids.includes(pick), hint: st.hint };
  });
  const right = culprit === c.culprit;
  return { right, steps, win: right && steps.every((s) => s.ok) };
}

// Những người bị kết tội trong vụ: nhiều người khi vụ có phiên xét xử nhiều vai ("verdict"), nếu không thì một người
export const culpritIds = (c) => (c.verdict ? c.verdict.roles.map((r) => r.who) : [c.culprit]);

// Vụ có phiên xét xử nhiều người (chủ mưu, kẻ ra tay, đồng phạm)
export const hasVerdict = (c) => !!c.verdict;

// Đánh giá phiên xét xử nhiều người. picks: { who: {vai: id người}, evid: {vai: id hồ sơ}, facts: {câu: id lựa chọn} }.
// Mỗi vai cần đúng người và một hồ sơ chứng cứ thuộc "ids" của vai đó; mỗi câu dựng lại sự việc cần đúng lựa chọn.
// Từng phần được chấm riêng để phản hồi cụ thể. Thắng khi mọi phần đều đúng.
export function judgeVerdict(c, picks = {}) {
  const who = picks.who || {}, evid = picks.evid || {}, facts = picks.facts || {};
  const roles = c.verdict.roles.map((r) => {
    const w = who[r.key] || null, e = evid[r.key] || null;
    return { key: r.key, label: r.label, who: w, ev: e, whoOk: w === r.who, evOk: !!e && r.ids.includes(e), hint: r.hint };
  });
  const fs = c.verdict.facts.map((f) => {
    const pick = facts[f.key] || null;
    return { key: f.key, ask: f.ask, pick, ok: pick === f.right, hint: f.hint };
  });
  const right = roles.every((r) => r.whoOk);
  return { right, roles, facts: fs, win: right && roles.every((r) => r.evOk) && fs.every((f) => f.ok) };
}

// Buộc tội sai: mất một mạng, và hồ sơ đóng khi hết mạng
export function loseLife(game) {
  const lives = game.lives - 1;
  return { ...game, wrong: game.wrong + 1, lives, over: lives <= 0 };
}

// Số sao: không sai là 3, sai một lần là 2, còn lại là 1
export function starsFor(wrong) {
  return wrong === 0 ? 3 : wrong === 1 ? 2 : 1;
}

// Điểm điều tra còn làm được ở địa điểm này: chưa làm, chưa mất, và đã mở khóa
export function remainingAt(game, c, loc) {
  return loc.hs.filter(([id]) => !game.done[id] && !isGone(game, c, id) && !gated(game, c, id));
}

// Tiến độ lưu: số sao tốt nhất của mỗi vụ. Mọi vụ đều mở từ đầu; unlocked chỉ giữ để tương thích bản lưu cũ
export function recordWin(save, caseIdx, caseId, game) {
  const st = starsFor(game.wrong);
  return {
    ...save,
    stars: { ...save.stars, [caseId]: Math.max(save.stars[caseId] || 0, st) },
    unlocked: Math.max(save.unlocked, caseIdx + 1)
  };
}

export const totalStars = (save, cases) => cases.reduce((s, c) => s + (save.stars[c.id] || 0), 0);
export const allSolved = (save, cases) => cases.every((c) => save.stars[c.id]);

export const emptySave = () => ({ unlocked: 0, stars: {} });

/* ---------- Gợi ý ---------- */
// Gợi ý không tốn giờ và không ảnh hưởng số sao; chỉ được đếm để hiện ở màn kết thúc.

// Các nhóm hồ sơ then chốt: mỗi nhóm cần ít nhất một hồ sơ trong `ids` (bước của chain, hoặc vai của verdict)
const keyGroups = (c) => (c.verdict ? c.verdict.roles : c.chain || []).map((g) => g.ids);

// Điểm điều tra của một hồ sơ: { loc: chỉ số địa điểm, label: nhãn trên cảnh }, hoặc null nếu hồ sơ không đặt trên bản đồ
export function spotOf(c, id) {
  for (let i = 0; i < c.locations.length; i++) {
    const h = c.locations[i].hs.find(([hid]) => hid === id);
    if (h) return { loc: i, label: h[3] };
  }
  return null;
}

// Việc cần làm để lấy được hồ sơ `id`: đến điểm điều tra (go), chờ hồ sơ về (wait), ghép suy luận (deduce) hoặc đưa chứng cứ (confront).
// Đi ngược qua mọi điều kiện: điểm bị khóa bởi một kết luận, kết luận cần các hồ sơ khác, lời khai mới cần hỏi người đó trước
function stepFor(game, c, id, depth = 0) {
  const a = actionOf(c, id);
  if (!a || depth > 8 || game.done[id]) return null;
  if (a.gate && !game.done[a.gate]) return stepFor(game, c, a.gate, depth + 1);
  if (a.via === "deduce") {
    const d = (c.deduce || []).find((x) => x.gives === id);
    if (!d) return null;
    const missing = d.needs.find((n) => !game.done[n]);
    return missing ? stepFor(game, c, missing, depth + 1) : { kind: "deduce", id, needs: d.needs };
  }
  if (a.via === "confront") {
    const r = (c.confront || []).find((x) => x.reveal === id);
    if (!r) return null;
    if (!questioned(game, c, r.who)) {
      const ask = c.actions.find((x) => !x.via && x.visual && x.visual.k === "who" && x.visual.id === r.who);
      return ask ? stepFor(game, c, ask.id, depth + 1) : null;
    }
    return game.done[r.clue] ? { kind: "confront", id, who: r.who, clue: r.clue } : stepFor(game, c, r.clue, depth + 1);
  }
  if (isPending(game, c, id)) return { kind: "wait", id, at: arrivalOf(c, id) };
  const spot = spotOf(c, id);
  return spot ? { kind: "go", id, ...spot } : null;
}

// Việc nên làm tiếp theo: hồ sơ then chốt đầu tiên còn thiếu, theo lối còn đi được. Đủ rồi thì { kind: "accuse" }
export function nextStep(game, c) {
  for (const ids of keyGroups(c)) {
    if (ids.some((i) => game.done[i])) continue;
    for (const id of ids) {
      if (isGone(game, c, id)) continue;
      const st = stepFor(game, c, id);
      if (st) return st;
    }
  }
  return { kind: "accuse" };
}
