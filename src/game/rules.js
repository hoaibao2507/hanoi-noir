/* =====================================================================
   Luật chơi thuần: không đụng DOM, không đụng localStorage.
   Mọi hàm nhận trạng thái rồi trả về trạng thái mới (không sửa tại chỗ),
   nên có thể kiểm thử bằng node:test.
   ===================================================================== */

export const MAX_LIVES = 3;
export const CONFRONT_COST = 1; // giờ cho mỗi lần đưa chứng cứ

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
    confronted: {},
    wrong: 0,
    over: false,
    busy: false,
    tab: "sus"
  };
}

export const actionOf = (c, id) => c.actions.find((a) => a.id === id);

// Điểm điều tra có thể thực hiện ngay không (đủ giờ, chưa làm, hồ sơ chưa đóng, chưa mất theo đồng hồ)
export function isOpen(game, c, id) {
  const a = actionOf(c, id);
  return !!a && !game.done[id] && !game.over && game.hours >= a.cost && !isGone(game, c, id);
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

// Mốc đã ghi: các khoảng giờ từ hồ sơ đã thu, theo thứ tự thời gian.
// Mốc chỉ gắn người khi mọi hồ sơ trong "needs" đã thu; trước đó người là null và pending là true.
export function timelineEvents(game, c) {
  const out = [];
  c.actions.forEach((a) => {
    if (!game.done[a.id]) return;
    (a.spans || []).forEach((s) => {
      const known = (s.needs || []).every((id) => game.done[id]);
      out.push({
        clue: a.id,
        title: a.title,
        from: s.from,
        to: s.to,
        at: s.at,
        who: known ? s.who || null : null,
        pending: !known && !!s.who
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

// Buộc tội sai: mất một mạng, và hồ sơ đóng khi hết mạng
export function loseLife(game) {
  const lives = game.lives - 1;
  return { ...game, wrong: game.wrong + 1, lives, over: lives <= 0 };
}

// Số sao: không sai là 3, sai một lần là 2, còn lại là 1
export function starsFor(wrong) {
  return wrong === 0 ? 3 : wrong === 1 ? 2 : 1;
}

// Điểm điều tra còn làm được ở địa điểm này: chưa làm và chưa mất
export function remainingAt(game, c, loc) {
  return loc.hs.filter(([id]) => !game.done[id] && !isGone(game, c, id));
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
