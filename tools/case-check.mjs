/* =====================================================================
   Kiểm tra một vụ án: mọi luật dữ liệu chung và vài phép thử lời giải, báo lỗi ngắn gọn.
   Dùng:  npm run check-case            (mọi vụ)
          npm run check-case -- s3      (một vụ)
          npm run check-case -- s3 --table   (thêm bảng ngoại phạm và lộ trình gợi ý)
   Lỗi (errors) làm lệnh thoát mã 1; cảnh báo (warnings) chỉ để tác giả cân nhắc.
   Module cũng xuất checkCase(c) cho tests/case-check.test.js.
   ===================================================================== */
import { pathToFileURL } from "node:url";
import { CASES, TYPES, REGIONS } from "../src/data/cases.js";
import { ART } from "../src/art/art.js";
import {
  newGame, nextStep, performAct, attemptLock, waitFor, pickDeduce, tryDeduce, performConfront, closeDeductions,
  alibisOf, judge, judgeVerdict, MAX_DEDUCE
} from "../src/game/rules.js";

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const FIELDS = ["id", "no", "region", "title", "place", "level", "budget", "clock", "intro", "suspects", "locations", "actions", "explanation"];

// Đi theo gợi ý từng bước như người chơi: trả { g, trail } hoặc { stuck: "lý do" }
function followHints(c, idx) {
  let g = newGame(idx, c);
  const trail = [];
  for (let i = 0; i < 120; i++) {
    const st = nextStep(g, c);
    if (st.kind === "accuse") return { g, trail };
    let next = g;
    const a = st.id ? c.actions.find((x) => x.id === st.id) : null;
    if (st.kind === "go") next = a.lock ? attemptLock(g, c, st.id, a.lock.code).game : performAct(g, c, st.id);
    else if (st.kind === "wait") next = waitFor(g, c, st.id);
    else if (st.kind === "deduce") { let x = g; for (const n of st.needs) x = pickDeduce(x, n); next = tryDeduce(x, c); }
    else if (st.kind === "confront") next = performConfront(g, c, st.who, st.clue);
    if (next === g) return { stuck: `gợi ý "${st.kind}" ${st.id || ""} không làm được (còn ${g.hours} giờ)`, trail };
    trail.push(`${st.kind}:${st.id || st.who}`);
    g = next;
  }
  return { stuck: "gợi ý chạy quá 120 bước", trail };
}

export function checkCase(c, idx = CASES.indexOf(c)) {
  const errors = [], warnings = [], info = {};
  const err = (m) => errors.push(m), warn = (m) => warnings.push(m);

  for (const f of FIELDS) if (c[f] == null || c[f] === "") err(`thiếu trường "${f}"`);
  if (c.chain && !c.culprit) err('vụ một thủ phạm (chain) thiếu "culprit"');
  if (!c.chain && !c.verdict) err('cần "chain" (một thủ phạm) hoặc "verdict" (nhiều người)');
  if (c.chain && c.verdict) err('không dùng cả "chain" lẫn "verdict"');
  if (!REGIONS.some((r) => r.id === c.region)) err(`vùng "${c.region}" không có trong REGIONS`);
  if (!c.suspects || !c.locations || !c.actions) return { errors, warnings, info };

  const ids = c.actions.map((a) => a.id);
  const idSet = new Set(ids);
  if (idSet.size !== ids.length) err(`mã hành động bị trùng: ${ids.filter((x, i) => ids.indexOf(x) !== i).join(", ")}`);
  const act = (id) => c.actions.find((a) => a.id === id);
  const sus = new Set(c.suspects.map((s) => s.id));
  const sceneOf = new Set();

  /* ---------- Nghi phạm ---------- */
  if (sus.size !== c.suspects.length) err("mã nghi phạm bị trùng");
  for (const s of c.suspects) if (!s.name || !s.role || !s.bio || !s.look) err(`nghi phạm ${s.id}: thiếu name, role, bio hoặc look`);
  if (c.suspects.length !== 6) warn(`${c.suspects.length} nghi phạm (các vụ hiện có đều 6)`);
  if (c.culprit && !sus.has(c.culprit)) err(`culprit "${c.culprit}" không phải nghi phạm`);

  /* ---------- Địa điểm và điểm điều tra ---------- */
  const placed = [];
  c.locations.forEach((L, i) => {
    if (!L.name || !L.time) err(`địa điểm #${i}: thiếu name hoặc time`);
    if (!ART.hasScene(L.scene)) err(`địa điểm ${L.id}: cảnh "${L.scene}" chưa đăng ký trong SCENES (art.js)`);
    sceneOf.add(L.scene);
    for (const h of L.hs || []) {
      const [id, x, y, label] = h;
      placed.push(id);
      if (!idSet.has(id)) err(`${L.id}: điểm "${id}" không có trong actions`);
      if (!label) err(`${L.id}/${id}: thiếu nhãn`);
      if (!(x >= 300 && x <= 1300)) warn(`${L.id}/${id}: x=${x} ngoài 300–1300 (sát nút xem hai bên)`);
      if (!(y >= 150 && y <= 760)) warn(`${L.id}/${id}: y=${y} ngoài 150–760`);
    }
  });
  if (c.locations.length > 7) err(`${c.locations.length} địa điểm: cửa tối đa 6 mỗi cảnh (tối đa 7 địa điểm)`);
  const points = placed.length;
  for (const id of new Set(placed)) if (placed.filter((x) => x === id).length > 1) err(`điểm "${id}" đặt trên bản đồ nhiều lần`);
  for (const a of c.actions) {
    if (!a.via && !placed.includes(a.id)) err(`${a.id}: hồ sơ gốc nhưng không đặt trên bản đồ`);
    if (a.via && placed.includes(a.id)) err(`${a.id}: via "${a.via}" không được đặt trên bản đồ`);
  }
  if (c.budget * 2 < points) err(`ngân sách ${c.budget} giờ < nửa số điểm điều tra (${points} điểm cần ≥ ${points / 2} giờ)`);
  info.points = points;

  /* ---------- Từng hành động ---------- */
  for (const a of c.actions) {
    if (!a.title || !a.text) err(`${a.id}: thiếu title hoặc text`);
    if (!TYPES[a.type]) err(`${a.id}: loại "${a.type}" không có trong TYPES`);
    if (typeof a.cost !== "number" || a.cost < 0) err(`${a.id}: cost không hợp lệ`);
    if ((a.via === "deduce" || a.via === "confront") && a.cost !== 0) err(`${a.id}: via "${a.via}" phải có cost 0`);
    if (a.via && a.via !== "deduce" && a.via !== "confront") err(`${a.id}: via "${a.via}" lạ`);
    if (a.gate && !idSet.has(a.gate)) err(`${a.id}: gate "${a.gate}" không có`);
    if (a.lock && !new RegExp(`^\\d{${a.lock.digits}}$`).test(a.lock.code)) err(`${a.id}: mã khóa không khớp số chữ số`);
    if (a.alibi && !sus.has(a.alibi.who)) err(`${a.id}: alibi.who "${a.alibi.who}" không phải nghi phạm`);
    if (a.alibi && !(HHMM.test(a.alibi.from) && HHMM.test(a.alibi.to))) err(`${a.id}: alibi.from/to sai dạng HH:MM`);
    for (const s of a.spans || []) {
      if (!HHMM.test(s.from) || !HHMM.test(s.to)) err(`${a.id}: mốc ${s.from}–${s.to} sai dạng HH:MM`);
      else if (s.from >= s.to) warn(`${a.id}: mốc ${s.from}–${s.to} không tăng dần (qua nửa đêm chưa được hỗ trợ)`);
      if (s.who && !sus.has(s.who)) err(`${a.id}: mốc có who "${s.who}" không phải nghi phạm`);
      for (const n of s.needs || []) if (!idSet.has(n)) err(`${a.id}: mốc needs "${n}" không có`);
      if (s.dev && !(c.devices && c.devices[s.dev])) err(`${a.id}: mốc dev "${s.dev}" chưa khai trong devices`);
    }
    const v = a.visual;
    if (!v) { err(`${a.id}: thiếu visual`); continue; }
    if (v.k === "who") { if (!sus.has(v.id)) err(`${a.id}: visual.who "${v.id}" không phải nghi phạm`); continue; }
    if (v.k === "paper") {
      if (!v.rows || v.rows.length > 5) warn(`${a.id}: giấy tờ ${v.rows ? v.rows.length : 0} dòng (tối đa 5)`);
      if (v.title && v.title.length > 33) warn(`${a.id}: tiêu đề giấy tờ ${v.title.length} ký tự (>33 tràn khung)`);
      (v.rows || []).forEach((r, i) => { if (r.length > 41) warn(`${a.id}: dòng ${i} dài ${r.length} ký tự (>41)`); });
      if (v.stamp) (v.rows || []).forEach((r, i) => { if ((i === 2 || i === 3) && r.length > 40) warn(`${a.id}: dòng ${i} dài ${r.length} và đè lên dấu mộc`); });
    }
    if (v.k === "cam" && !ART.hasCam(v.scene)) err(`${a.id}: khung camera "${v.scene}" chưa đăng ký (CAM_KINDS trong art.js)`);
    if (!ART.evidence(v).includes("<svg")) err(`${a.id}: visual "${v.k}" không vẽ được`);
  }
  for (const s of sceneOf) if (ART.hasScene(s) && !ART.scene(s, []).includes("<svg")) err(`cảnh ${s} không vẽ được`);

  /* ---------- Suy luận ---------- */
  const seen = new Map();
  const given = new Set();
  for (const d of c.deduce || []) {
    if (d.needs.length < 2 || d.needs.length > MAX_DEDUCE) err(`${d.gives}: cần 2–${MAX_DEDUCE} hồ sơ (đang ${d.needs.length})`);
    if (new Set(d.needs).size !== d.needs.length) err(`${d.gives}: đầu vào bị lặp`);
    for (const n of d.needs) if (!idSet.has(n)) err(`${d.gives}: đầu vào "${n}" không có`);
    if (d.needs.includes(d.gives)) err(`${d.gives}: tự là đầu vào của chính nó`);
    const key = [...d.needs].sort().join("|");
    if (seen.has(key)) err(`${d.gives}: trùng tập đầu vào với ${seen.get(key)} (chỉ dòng đầu có tác dụng)`);
    seen.set(key, d.gives);
    given.add(d.gives);
    if (!act(d.gives) || act(d.gives).via !== "deduce") err(`${d.gives}: đích của suy luận phải là hành động via "deduce"`);
  }
  for (const a of c.actions.filter((x) => x.via === "deduce")) {
    if (!given.has(a.id)) err(`${a.id}: kết luận không dòng deduce nào cho ra`);
    if (a.type !== "Kết luận") err(`${a.id}: kết luận phải có type "Kết luận"`);
    if (/thủ phạm|hung thủ|kẻ giết/i.test(a.title)) err(`${a.id}: tiêu đề kết luận không được kết tội`);
  }
  info.conclusions = c.actions.filter((a) => a.via === "deduce").length;

  /* ---------- Đưa chứng cứ ---------- */
  const reveals = new Map();
  for (const r of c.confront || []) {
    if (!sus.has(r.who)) err(`confront: "${r.who}" không phải nghi phạm`);
    else if (!c.actions.some((a) => !a.via && a.visual && a.visual.k === "who" && a.visual.id === r.who)) err(`confront: ${r.who} chưa có lời khai để bị đưa chứng cứ`);
    if (!idSet.has(r.clue)) err(`confront: hồ sơ "${r.clue}" không có`);
    if (!r.text) err(`confront ${r.who}|${r.clue}: thiếu text`);
    if (r.reveal) {
      if (!act(r.reveal) || act(r.reveal).via !== "confront") err(`confront: reveal "${r.reveal}" phải là hành động via "confront"`);
      if (reveals.has(r.reveal)) err(`confront: lời khai "${r.reveal}" được mở bởi hai phản ứng (chỉ cho một)`);
      reveals.set(r.reveal, r);
    }
  }
  for (const a of c.actions.filter((x) => x.via === "confront")) if (!reveals.has(a.id)) err(`${a.id}: lời khai via "confront" không phản ứng nào mở ra`);
  info.confessions = reveals.size;

  /* ---------- Diễn biến theo đồng hồ ---------- */
  if (!HHMM.test((c.clock || {}).start || "")) err("clock.start sai dạng HH:MM");
  for (const w of c.world || []) {
    if (w.kind !== "arrive") err(`world: kind "${w.kind}" không được dùng trong trò chơi (chỉ "arrive"; gone/leave làm hồ sơ mất theo thời gian)`);
    if (!HHMM.test(w.at || "")) err(`world ${w.id}: at sai dạng HH:MM`);
    if (!idSet.has(w.id) || (act(w.id) && act(w.id).via)) err(`world: "${w.id}" phải là hồ sơ gốc có thật`);
    if (!w.text) err(`world ${w.id}: thiếu text`);
  }
  info.arrivals = (c.world || []).length;
  for (const d of Object.values(c.devices || {})) if (!idSet.has(d.by) || act(d.by).via !== "deduce") err(`devices: kết luận hiệu chỉnh "${d.by}" phải là kết luận`);

  /* ---------- Buộc tội ---------- */
  if (c.chain) {
    if (c.chain.length !== 3) err(`chain phải đúng 3 bước (đang ${c.chain.length})`);
    if (new Set(c.chain.map((s) => s.key)).size !== c.chain.length) err("khóa các bước chain bị trùng");
    for (const st of c.chain) {
      if (!st.label || !st.ask || !st.hint) err(`chain/${st.key}: thiếu label, ask hoặc hint`);
      if (!st.ids || !st.ids.length) err(`chain/${st.key}: ids rỗng`);
      for (const i of st.ids || []) {
        if (!idSet.has(i)) err(`chain/${st.key}: "${i}" không có`);
        else if (act(i).via !== "deduce") warn(`chain/${st.key}: "${i}" không phải kết luận (hai vụ trước đều dùng kết luận làm chứng cứ)`);
      }
    }
  }
  if (c.verdict) {
    for (const r of c.verdict.roles || []) {
      if (!sus.has(r.who)) err(`verdict/${r.key}: "${r.who}" không phải nghi phạm`);
      if (!r.label || !r.ask || !r.hint) err(`verdict/${r.key}: thiếu label, ask hoặc hint`);
      for (const i of r.ids || []) if (!idSet.has(i)) err(`verdict/${r.key}: "${i}" không có`);
    }
    for (const f of c.verdict.facts || []) if (!(f.options || []).some((o) => o.id === f.right)) err(`verdict/${f.key}: đáp án đúng không nằm trong lựa chọn`);
  }

  /* ---------- Lời giải ---------- */
  const roots = c.actions.filter((a) => !a.via || a.via === "confront").map((a) => a.id);
  const all = closeDeductions({ ...newGame(idx, c), done: Object.fromEntries(roots.map((i) => [i, true])), found: [...roots] }, c);
  for (const a of c.actions.filter((x) => x.via === "deduce")) if (!all.done[a.id]) err(`${a.id}: không bao giờ rút ra được dù có mọi hồ sơ gốc`);

  if (!errors.length) {
    const groups = c.verdict ? c.verdict.roles : c.chain;
    const hint = followHints(c, idx);
    if (hint.stuck) err(`làm theo gợi ý bị kẹt: ${hint.stuck}`);
    else {
      info.hintHours = c.budget - hint.g.hours;
      info.hintTrail = hint.trail;
      if (info.hintHours > c.budget - 2) warn(`lộ trình gợi ý tốn ${info.hintHours}/${c.budget} giờ, dư chưa tới 2 giờ`);
      if (c.chain) {
        const picks = Object.fromEntries(c.chain.map((st) => [st.key, st.ids.find((i) => hint.g.done[i])]));
        if (!judge(c, c.culprit, picks).win) err("buộc tội đúng bằng chứng cứ từ gợi ý mà không thắng");
        info.shortest = shortestHours(c, groups);
      } else {
        const who = Object.fromEntries(c.verdict.roles.map((r) => [r.key, r.who]));
        const evid = Object.fromEntries(c.verdict.roles.map((r) => [r.key, r.ids.find((i) => hint.g.done[i])]));
        const v = judgeVerdict(c, { who, evid, facts: {} });
        if (!v.right || !v.roles.every((r) => r.evOk)) err("chứng cứ từ gợi ý không đủ cho từng vai");
      }
    }
    // Ngoại phạm: bảng trạng thái khi đã có mọi hồ sơ; cảnh báo nơi khai không trùng mốc nào
    const spanAts = new Set(c.actions.flatMap((a) => (a.spans || []).map((s) => s.at)));
    for (const a of c.actions.filter((x) => x.alibi)) if (!spanAts.has(a.alibi.at)) warn(`${a.id}: alibi.at "${a.alibi.at}" không trùng nơi của mốc nào (không thể bị bác hay xác nhận)`);
    info.alibis = alibisOf(all, c).map((x) => `${x.who}: ${x.status}${x.by ? ` (${x.by.clue})` : ""}`);
  }
  return { errors, warnings, info };
}

// Ước lượng số giờ của lối rẻ nhất qua cả ba bước (hồ sơ dùng chung giữa các bước chỉ tính một lần)
function shortestHours(c, groups) {
  const byId = (id) => c.actions.find((x) => x.id === id);
  const cost = (id, seen) => {
    if (seen.has(id)) return 0;
    const a = byId(id);
    if (!a) return Infinity;
    if (a.via === "deduce") {
      let best = null;
      for (const d of (c.deduce || []).filter((x) => x.gives === id)) {
        const trial = new Set(seen).add(id);
        const sum = d.needs.reduce((t, n) => t + cost(n, trial), 0);
        if (!best || sum < best.sum) best = { d, sum };
      }
      if (!best) return Infinity;
      seen.add(id);
      best.d.needs.forEach((n) => cost(n, seen));
      return best.sum;
    }
    seen.add(id);
    if (a.via === "confront") {
      const r = (c.confront || []).find((x) => x.reveal === id);
      if (!r) return Infinity;
      const asked = c.actions.find((x) => !x.via && x.visual && x.visual.k === "who" && x.visual.id === r.who);
      return 1 + (asked ? cost(asked.id, seen) : 0) + cost(r.clue, seen);
    }
    return a.cost + (a.gate ? cost(a.gate, seen) : 0);
  };
  const seen = new Set();
  let total = 0;
  for (const g of groups) {
    const pick = g.ids.map((i) => [i, cost(i, new Set(seen))]).sort((x, y) => x[1] - y[1])[0];
    total += cost(pick[0], seen);
  }
  return total;
}

/* ---------- Dòng lệnh ---------- */
function main() {
  const args = process.argv.slice(2);
  const table = args.includes("--table");
  const want = args.filter((a) => !a.startsWith("--"));
  const list = want.length && want[0] !== "all" ? CASES.filter((c) => want.includes(c.id)) : CASES;
  if (!list.length) { console.error(`Không có vụ nào khớp "${want.join(", ")}". Vụ hiện có: ${CASES.map((c) => c.id).join(", ")}`); process.exit(2); }
  let bad = 0;
  for (const c of list) {
    const r = checkCase(c);
    const i = r.info;
    const head = `${r.errors.length ? "✘" : "✔"} ${c.id} · ${c.title}`;
    const stat = [i.points != null && `${i.points} điểm`, i.conclusions != null && `${i.conclusions} kết luận`, i.confessions != null && `${i.confessions} thú nhận`, i.arrivals != null && `${i.arrivals} về muộn`,
      i.hintHours != null && `gợi ý ${i.hintHours}/${c.budget} giờ`, i.shortest != null && `lối rẻ nhất ≈ ${i.shortest} giờ`].filter(Boolean).join(" · ");
    console.log(`${head}\n   ${stat}`);
    for (const e of r.errors) console.log(`   LỖI    ${e}`);
    for (const w of r.warnings) console.log(`   CẢNH BÁO ${w}`);
    if (table && i.alibis) console.log(`   Ngoại phạm khi có mọi hồ sơ:\n     ${i.alibis.join("\n     ")}\n   Lộ trình gợi ý: ${i.hintTrail.join(" → ")}`);
    bad += r.errors.length;
  }
  if (bad) { console.log(`\n${bad} lỗi.`); process.exit(1); }
  console.log("\nKhông có lỗi.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
