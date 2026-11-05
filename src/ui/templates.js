/* =====================================================================
   Mẫu HTML thuần: nhận dữ liệu, trả về chuỗi. Không chạm DOM, không giữ trạng thái.
   Nút dùng data-action thay cho onclick; bộ điều khiển xử lý ủy quyền ở document.
   ===================================================================== */
import { CASES, TYPES, REGIONS, casesOf } from "../data/cases.js";
import { ART } from "../art/art.js";
import { OX, WORLD_W, WORLD_H, DOOR_W } from "../world/layout.js";
import {
  isOpen, remainingAt, starsFor, allSolved, totalStars,
  CONFRONT_COST, confrontOptions,
  isGone, clockAt, gated, isPending, arrivalOf, waitHours, unlocksOf,
  LOCK_TRIES, LOCK_PENALTY, spotOf, actionOf,
  overviewOf
} from "../game/rules.js";
import { esc } from "./dom.js";

const pctX = (u) => ((u / WORLD_W) * 100).toFixed(3);
const pctY = (v) => ((v / WORLD_H) * 100).toFixed(3);
const portraitOf = (s, expr) => ART.portrait(s.look, s.id, expr);
const starsHTML = (n, max = 3) =>
  Array.from({ length: max }, (_, i) => `<span class="st${i < n ? "" : " dim"}">★</span>`).join("");

/* ---------- Màn hình chính ---------- */
export const regionOf = (c) => REGIONS.find((r) => r.id === c.region) || REGIONS[0];

export function menuHTML(save, regionId = REGIONS[0].id) {
  const region = REGIONS.find((r) => r.id === regionId) || REGIONS[0];
  const list = casesOf(region.id);
  const cards = list.map((c) => {
    const i = CASES.indexOf(c);
    const st = save.stars[c.id] || 0;
    const info = `<span class="inline-flex items-center gap-2">${starsHTML(st)}<span class="text-xs text-ink-2">${st ? "đã đạt" : "chưa khép hồ sơ"}</span></span>`;
    return `<button class="case-card" data-action="start" data-i="${i}"
        aria-label="Vụ ${c.no}: ${esc(c.title)}">
      <span class="thumb">${ART.scene(c.locations[0].scene)}</span>
      <span class="block p-4 text-left">
        <span class="kicker block">Vụ ${c.no} · ${c.level}</span>
        <span class="block font-display text-xl mt-1">${esc(c.title)}</span>
        <span class="case-place block text-xs text-ink-2 mt-1">${esc(c.place)}</span>
        <span class="case-info block mt-3 text-sm">${info}</span>
      </span>
    </button>`;
  }).join("");

  // Chỉ hiện thanh chọn vùng khi có từ hai vùng trở lên
  const tabs = REGIONS.length < 2 ? "" : REGIONS.map((r) => {
    const n = casesOf(r.id).length;
    return `<button class="region-tab${r.id === region.id ? " on" : ""}" data-action="region" data-id="${r.id}" aria-pressed="${r.id === region.id}">
        <i class="fa-solid ${r.icon}"></i><span><b>${esc(r.name)}</b><small>${n} vụ</small></span></button>`;
  }).join("");

  const finale = allSolved(save, list)
    ? `<span class="glass rounded-full px-4 py-1.5 text-sm text-lamp-2"><i class="fa-solid fa-trophy"></i> Bạn đã khép lại cả ${list.length} vụ ở ${esc(region.name)} · ${totalStars(save, list)}/${list.length * 3} ★</span>`
    : `<span class="text-xs text-ink-2">${esc(region.blurb)} Tiến độ được lưu trên trình duyệt này.</span>`;

  return `
    <div class="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 md:p-5">
      <div class="pointer-events-auto glass rounded-2xl px-4 py-3 max-w-[70vw]">
        <div class="font-display text-2xl md:text-4xl leading-none text-lamp-2">Hanoi Noir</div>
        <div class="text-xs md:text-sm text-ink-2 mt-1.5">${esc(region.tagline)}</div>
      </div>
      <div class="pointer-events-auto flex gap-2">
        <button class="btn btn-ghost fs-btn" data-action="fullscreen" title="Toàn màn hình" aria-label="Toàn màn hình"><i class="fa-solid fa-expand fs-in"></i><i class="fa-solid fa-compress fs-out"></i><span class="hidden sm:inline">Toàn màn hình</span></button>
        <button class="btn btn-ghost" data-action="help" title="Cách chơi"><i class="fa-solid fa-circle-question"></i><span class="hidden sm:inline">Cách chơi</span></button>
        <button class="btn btn-ghost" data-action="reset-ask" title="Xoá tiến độ"><i class="fa-solid fa-rotate-left"></i><span class="hidden sm:inline">Xoá tiến độ</span></button>
      </div>
    </div>
    <div class="menu-dock absolute inset-x-0 bottom-0 pt-24 pb-4 md:pb-7 bg-gradient-to-t from-[#05070d] via-[#05070d]/75 to-transparent">
      ${tabs ? `<div class="pointer-events-auto region-bar mb-3">${tabs}</div>` : ""}
      <div class="menu-note text-center mb-3 pointer-events-none px-4">${finale}</div>
      <div id="menu-cards" class="pointer-events-auto flex gap-4 overflow-x-auto snap-x snap-mandatory px-5 pb-2 hscroll md:justify-center">${cards}</div>
    </div>`;
}

/* ---------- Thanh điều khiển màn điều tra (bốn góc) ---------- */
function hintHTML(game, c, L) {
  const left = remainingAt(game, c, L).length;
  if (game.hours <= 0 && !game.over) return `<i class="fa-solid fa-hourglass-end text-blood"></i> Hết giờ điều tra · hãy buộc tội`;
  const secret = L.hs.filter(([id, , , , flag]) => flag === "soi" && !game.done[id]).length;
  const waiting = L.hs.filter(([id]) => isPending(game, c, id) && !gated(game, c, id)).length;
  if (left) return `<i class="fa-solid fa-magnifying-glass text-lamp"></i> Còn <b>${left}</b> điểm điều tra tại đây${secret ? ` · <b>${secret}</b> dấu vết trong bóng tối` : ""}${waiting ? ` · <b>${waiting}</b> đang chờ kết quả` : ""}`;
  return `<i class="fa-solid fa-circle-check text-jade"></i> Đã điều tra xong nơi này`;
}

export function hudHTML(game, c, L) {
  const hearts = [0, 1, 2]
    .map((i) => `<i class="fa-solid fa-heart ${i < game.lives ? "text-blood" : "text-ink-2/30"}"></i>`)
    .join("");
  return `
    <div class="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 md:p-5">
      <div class="pointer-events-auto flex items-center gap-2 min-w-0">
        <button class="btn btn-ghost btn-round" data-action="menu" aria-label="Về danh sách vụ án" title="Về danh sách vụ án"><i class="fa-solid fa-arrow-left"></i></button>
        <div class="glass rounded-2xl px-3 py-2 md:px-4 min-w-0">
          <div class="kicker text-[10px] md:text-[11px] whitespace-nowrap">${esc(regionOf(c).short)} · Vụ ${c.no} · ${c.level}</div>
          <div class="font-display text-[15px] md:text-xl leading-tight truncate max-w-[40vw] md:max-w-[340px]">${esc(c.title)}</div>
        </div>
      </div>
      <div class="hidden md:flex pointer-events-auto glass rounded-full px-4 py-2 items-center gap-2 text-sm whitespace-nowrap">
        <i class="fa-solid fa-location-dot text-lamp"></i>${esc(L.name)}<span class="text-ink-2">· ${esc(L.time)}</span>
      </div>
      <div class="pointer-events-auto flex items-center gap-2">
        <span data-coach="clock" class="glass rounded-full px-3.5 py-2 text-sm font-semibold tabnum flex items-center gap-2 whitespace-nowrap"><i class="fa-regular fa-clock text-lamp"></i>${clockAt(game, c)}<span class="text-ink-2">·</span><span class="hidden sm:inline">Còn&nbsp;</span>${game.hours}/${c.budget}<span class="hidden sm:inline">&nbsp;giờ</span></span>
        <span data-coach="lives" class="glass rounded-full px-3.5 py-2 text-sm flex items-center gap-1.5">${hearts}</span>
        <button class="btn btn-ghost btn-round fs-btn" data-action="fullscreen" title="Toàn màn hình" aria-label="Toàn màn hình"><i class="fa-solid fa-expand fs-in"></i><i class="fa-solid fa-compress fs-out"></i></button>
      </div>
    </div>
    <div class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 md:p-5">
      <div class="pointer-events-auto flex gap-2">
      <button class="btn btn-ghost" data-coach="notebook" data-action="nb-toggle" title="Sổ tay điều tra">
        <i class="fa-solid fa-book-open"></i><span class="hidden sm:inline">Sổ tay</span>
        <span class="tabnum rounded-full bg-lamp/25 px-2 text-xs text-lamp-2">${game.found.length}</span>
      </button>
      <button class="btn btn-ghost" data-coach="hint" data-action="hint" title="Gợi ý" aria-label="Gợi ý"><i class="fa-solid fa-lightbulb"></i><span class="hidden sm:inline">Gợi ý</span></button>
      <button class="btn btn-ghost" data-action="overview" title="Tổng quan địa điểm (M)" aria-label="Tổng quan địa điểm"><i class="fa-solid fa-map-location-dot"></i><span class="hidden sm:inline">Địa điểm</span></button>
      </div>
      <div class="pointer-events-none glass rounded-full px-4 py-2 text-sm hidden sm:flex items-center gap-2">${hintHTML(game, c, L)}</div>
      <button class="pointer-events-auto btn btn-blood" data-coach="accuse" data-action="accuse"><i class="fa-solid fa-gavel"></i> Buộc tội</button>
    </div>`;
}

/* ---------- Thế giới: điểm điều tra và cửa ---------- */
export function hotspotsHTML(game, c, L) {
  // Xếp theo x: Tab đi từ trái sang phải đúng như mắt nhìn cảnh
  return [...L.hs]
    .sort((p, q) => p[1] - q[1])
    .filter(([id]) => !isGone(game, c, id) && !gated(game, c, id))
    .map(([id, x, y, lab, flag]) => {
      const a = c.actions.find((z) => z.id === id);
      const done = !!game.done[id];
      const open = isOpen(game, c, id);
      const wait = !done && isPending(game, c, id);
      const state = done ? "is-done" : open ? "is-open" : wait ? "is-wait" : "is-off";
      const icon = done ? "fa-check" : wait ? "fa-hourglass-half" : a.lock ? "fa-lock" : TYPES[a.type].icon;
      const cost = done ? "" : wait ? ` · chờ tới ${arrivalOf(c, id)}` : a.cost > 1 ? ` · ${a.cost} giờ` : "";
      // Dấu vết ẩn: ẩn cho tới khi đèn pin quét tới (xem ui/flashlight.js); đã làm thì luôn hiện
      const secret = flag === "soi" ? ` is-secret${done ? " is-lit" : ""}` : "";
      const hinted = !done && game.hintId === id ? " is-hint" : "";
      const note = done ? ", đã làm" : wait ? `, kết quả về lúc ${arrivalOf(c, id)}` : a.lock ? ", có khóa mã" : "";
      return `<button class="hs ${state}${secret}${hinted}" data-action="act" data-id="${id}" style="left:${pctX(OX + x)}%;top:${pctY(y)}%"
          ${open || wait ? "" : "disabled"} aria-label="${esc(lab)}${note}${done || wait ? "" : `, tốn ${a.cost} giờ`}">
        <span class="hs-in"><span class="hs-chip"><i class="fa-solid ${icon}"></i></span>
        <span class="hs-tag">${done ? "✓ " : ""}${esc(lab)}${cost}</span></span>
      </button>`;
    })
    .join("");
}

export function doorsHTML(doors) {
  return [...doors]
    .sort((p, q) => p.x - q.x)
    .map((d) => {
      const arrow = d.side === "left" ? "fa-arrow-left" : "fa-arrow-right";
      const w = d.w || DOOR_W, compact = w < DOOR_W;
      // Biển của khe lẻ nâng lên một hàng; địa điểm đông cửa thì cửa hẹp hơn (door-c) nên inline width ghi đè CSS
      return `<button class="door door-${d.side} door-s${(d.slot || 0) % 2}${compact ? " door-c" : ""}" style="left:${pctX(d.x + w / 2)}%${compact ? `;width:${pctX(w)}%` : ""}" data-action="go" data-loc="${d.loc}"
          aria-label="Đi tới ${esc(d.name)}" title="${esc(d.name)}">
        <span class="door-sign"><i class="fa-solid ${arrow}"></i><span class="min-w-0"><b>${esc(d.name)}</b><small>${esc(d.time)}</small></span></span>
      </button>`;
    })
    .join("");
}

/* ---------- Lời khai cận cảnh (thẻ dưới màn hình khi hỏi cung) ---------- */
export function testimonyHTML(c, a) {
  const s = c.suspects.find((x) => x.id === a.visual.id);
  const words = esc(a.text).split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
  return `<div class="tm glass">
    <div class="tm-who">${portraitOf(s)}<div><b>${esc(s.name)}</b><small>${esc(s.role)}</small></div></div>
    <p class="tm-text">${words}</p>
    <div class="tm-foot"><span><i class="fa-solid fa-book-open"></i> Đã ghi vào sổ tay: ${esc(a.title)}</span>
      <button class="mark" data-action="tm-close">Tiếp tục</button></div>
  </div>`;
}

/* ---------- Đưa chứng cứ cho người đã bị hỏi ---------- */
export function confrontHTML(game, c, who) {
  const s = c.suspects.find((x) => x.id === who);
  const options = confrontOptions(game, c, who);
  const list = options.length
    ? options
        .slice()
        .reverse()
        .map((id) => {
          const a = c.actions.find((x) => x.id === id);
          return `<button class="lkc" data-action="confront" data-who="${who}" data-clue="${id}">
              <i class="fa-solid ${TYPES[a.type].icon}"></i><span>${esc(a.title)}</span></button>`;
        })
        .join("")
    : `<p class="italic text-sm">Không còn hồ sơ nào để đưa cho ${esc(s.name)}.</p>`;
  return `
    <h2>Đưa chứng cứ</h2>
    <div class="who flex items-center gap-3 mb-3">${portraitOf(s)}<span class="text-sm text-ink-2">${esc(s.name)} · ${esc(s.role)}</span></div>
    <p class="muted text-sm">Chọn một hồ sơ để đưa cho ${esc(s.name)} xem. Mỗi lần tốn ${CONFRONT_COST} giờ, và mỗi hồ sơ chỉ đưa một lần cho mỗi người.</p>
    <div class="lkgrid mt-3">${list}</div>
    <div class="row"><button class="btn btn-ghost" data-action="close">Đóng</button></div>`;
}

// Diễn biến vừa xảy ra trong lúc điều tra; không có thì không hiện gì
const newsList = (news) =>
  news.length
    ? `<div class="mt-3 grid gap-2">${news.map((w) => `<div class="banner"><i class="fa-regular fa-clock"></i> <b>${esc(w.at)}</b> · ${esc(w.text)}</div>`).join("")}</div>`
    : "";

// Hộp thoại báo diễn biến khi một hành động làm đồng hồ tới mốc
export const newsHTML = (news, lead) => `
  <h2>🕐 Diễn biến</h2>
  ${lead ? `<p class="muted text-sm">${esc(lead)}</p>` : ""}
  ${newsList(news)}
  <div class="row"><button class="btn" data-action="close">Tiếp tục</button></div>`;

// Phản ứng của người được đưa chứng cứ; nếu có thì nêu lời khai mới đã được ghi, và diễn biến vừa xảy ra
export function reactionHTML(c, who, clueId, r, reveal, news = []) {
  const s = c.suspects.find((x) => x.id === who);
  const clue = c.actions.find((x) => x.id === clueId);
  const line = r ? r.text : `${s.name} nhìn tờ hồ sơ, rồi giữ nguyên lời khai và không nói thêm.`;
  // Nét mặt theo phản ứng: bị chạm vào điểm yếu thì căng thẳng, và lo lắng khi sắp khai thêm; giữ nguyên lời khai thì bình thản
  const expr = r ? (reveal ? "worried" : "tense") : "calm";
  return `
    <h2>${esc(s.name)} trả lời</h2>
    <div class="who flex items-center gap-3 mb-3">${portraitOf(s, expr)}<span class="text-sm text-ink-2">Bạn đưa: <b>${esc(clue.title)}</b></span></div>
    <div class="expl"><p>${esc(line)}</p></div>
    ${newsList(news)}
    ${reveal ? `<div class="banner mt-3"><i class="fa-solid fa-file-lines"></i> Lời khai mới đã được ghi: <b>${esc(reveal.title)}</b></div>` : ""}
    <div class="row"><button class="btn" data-action="close">Tiếp tục</button></div>`;
}

/* ---------- Suy luận: ghép hồ sơ thành kết luận ---------- */
// Tên địa điểm có điểm điều tra này
const placeOf = (c, id) => (c.locations.find((L) => L.hs.some((h) => h[0] === id)) || {}).name || "";

// Những gì một kết luận đã mở ra: điểm điều tra mới và thiết bị được hiệu chỉnh
function effectsHTML(c, id) {
  const { spots, devs } = unlocksOf(c, id);
  const rows = [
    ...spots.map((a) => `<div class="banner mt-2"><i class="fa-solid fa-lock-open"></i> Đã mở điểm điều tra: <b>${esc(a.title)}</b> · ${esc(placeOf(c, a.id))}</div>`),
    ...devs.map((d) => `<div class="banner mt-2"><i class="fa-regular fa-clock"></i> Giờ ${esc(d.name)} đã được hiệu chỉnh trong tab Thời gian.</div>`)
  ];
  return rows.join("");
}

// Hộp thoại khi vừa rút ra một kết luận mới
export function deduceResultHTML(c, id) {
  const a = c.actions.find((x) => x.id === id);
  return `
    <h2>💡 Kết luận mới</h2>
    <h4 class="mt-1">${esc(a.title)}</h4>
    <div class="vis mt-2">${ART.evidence(a.visual)}</div>
    <div class="expl"><p>${esc(a.text)}</p></div>
    ${effectsHTML(c, id)}
    <div class="row"><button class="btn" data-action="close">Tiếp tục</button></div>`;
}

/* ---------- Hộp thoại kiểu hồ sơ giấy ---------- */
// Chỉ nhắc những cơ chế mà vụ này thật sự có (giờ máy lệch, hồ sơ về muộn, mã số)
const briefingExtra = (c) => {
  if (!c.deduce) return "";
  const late = (c.world || []).some((w) => w.kind === "arrive"), code = c.actions.some((a) => a.lock);
  const parts = [];
  if (c.devices) parts.push("một số thiết bị có <b>giờ máy lệch</b>");
  if (late || code) parts.push(`một số hồ sơ ${late ? "chỉ <b>về muộn</b>" : ""}${late && code ? " hoặc " : ""}${code ? "cần <b>mã số</b>" : ""}`);
  parts.push(c.verdict ? "phiên xét xử cần chỉ ra <b>nhiều người</b> cùng vai trò của từng người" : "phiên buộc tội vẫn chỉ cần một người, nhưng mỗi bước phải dựa trên một <b>kết luận</b> do chính bạn rút ra");
  const body = parts.slice(0, -1).concat(`và ${parts[parts.length - 1]}`).join("; ");
  return `<p class="muted text-sm mt-2">Vụ này có thêm: tab <b>Suy luận</b> trong Sổ tay để ghép hồ sơ thành kết luận (kết luận mở ra điểm điều tra mới); ${body}.</p>`;
};

export const briefingHTML = (c) => `
  <p class="text-xs tracking-[.16em] uppercase text-[#8a5a14]">${esc(regionOf(c).name)} · Hồ sơ vụ ${c.no} · ${c.level}</p>
  <h2 class="mt-1">${esc(c.title)}</h2>
  <p class="muted text-sm">${esc(c.place)}</p>
  <div class="expl">${c.intro}</div>
  <p class="muted text-sm mt-3">Ngân sách: ${c.budget} giờ. Đồng hồ bắt đầu lúc ${c.clock.start}, và mỗi giờ điều tra là một giờ trôi qua; có việc sẽ không đợi bạn. Mỗi điểm điều tra tốn giờ, còn di chuyển giữa các địa điểm thì không. Kéo hoặc dùng mũi tên ◀ ▶ ở mép màn hình để xem hai bên.</p>
  ${briefingExtra(c)}
  <div class="row"><button class="btn" data-action="close"><i class="fa-solid fa-magnifying-glass"></i> Bắt đầu điều tra</button></div>`;

// Các hồ sơ có thể viện dẫn làm chứng cứ trong phiên nhiều người: kết luận và lời khai mới hiện sẵn, hồ sơ gốc gập trong mục phụ
function evidenceOptions(game, c, role, acc) {
  const btn = (id) => {
    const a = c.actions.find((x) => x.id === id);
    const on = (acc.evid || {})[role.key] === id;
    return `<button class="lkc${on ? " on" : ""}${a.via === "deduce" ? " is-k" : ""}" aria-pressed="${on}" data-action="vd-ev" data-role="${role.key}" data-id="${id}">
        <i class="fa-solid ${TYPES[a.type].icon}"></i><span>${esc(a.title)}</span></button>`;
  };
  const ids = game.found.slice().reverse();
  const main = ids.filter((id) => c.actions.find((x) => x.id === id).via);
  const rest = ids.filter((id) => !c.actions.find((x) => x.id === id).via);
  if (!ids.length) return `<p class="italic text-sm">Bạn chưa có hồ sơ nào để viện dẫn.</p>`;
  return `<div class="lkgrid">${main.map(btn).join("")}</div>` +
    (rest.length ? `<details class="mt-2"><summary class="text-[13px] text-ink-2 cursor-pointer">Hồ sơ gốc (${rest.length})</summary><div class="lkgrid mt-2">${rest.map(btn).join("")}</div></details>` : "");
}

// Phiên xét xử nhiều người: mỗi vai chọn một người và một chứng cứ, rồi dựng lại sự việc
function verdictFormHTML(game, c, acc) {
  const v = c.verdict;
  const roles = v.roles
    .map((r, i) => {
      const who = c.suspects
        .map((s) => `<button class="pick${(acc.who || {})[r.key] === s.id ? " on" : ""}" data-action="vd-who" data-role="${r.key}" data-id="${s.id}">${portraitOf(s)}<span>${esc(s.name)}</span></button>`)
        .join("");
      return `<h4 class="mt-4 mb-1">${i + 1}. ${esc(r.label)}</h4>
        <p class="text-[13px] text-ink-2 mb-2">${esc(r.ask)}</p>
        <div class="picks picks-sm">${who}</div>
        <p class="text-[13px] text-ink-2 mt-3 mb-1">Chứng cứ cho vai này:</p>
        ${evidenceOptions(game, c, r, acc)}`;
    })
    .join("");
  const facts = v.facts
    .map((f, i) => `<h4 class="mt-4 mb-1">${v.roles.length + i + 1}. ${esc(f.ask)}</h4>
        <div class="lkgrid">${f.options
          .map((o) => {
            const on = (acc.facts || {})[f.key] === o.id;
            return `<button class="lkc${on ? " on" : ""}" aria-pressed="${on}" data-action="vd-fact" data-key="${f.key}" data-id="${o.id}"><span>${esc(o.label)}</span></button>`;
          })
          .join("")}</div>`)
    .join("");
  return `
    <h2>⚖️ Phiên xét xử</h2>
    <p class="muted text-sm">Vụ này có nhiều người liên đới. Với mỗi vai, chọn một người và một hồ sơ làm chứng cứ (kết luận có giá trị hơn hồ sơ gốc), rồi dựng lại sự việc. Sai một phần nào cũng mất một mạng. Lựa chọn của bạn được giữ lại khi thử lại.</p>
    ${roles}
    ${facts}
    <div class="row">
      <button class="btn btn-ghost" data-action="close">Huỷ</button>
      <button class="btn btn-blood" data-action="submit"><i class="fa-solid fa-gavel"></i> Kết tội</button>
    </div>`;
}

export function accuseHTML(game, c, acc) {
  if (c.verdict) return verdictFormHTML(game, c, acc);
  const picks = c.suspects
    .map((s) => `<button class="pick${acc.culprit === s.id ? " on" : ""}" data-action="pick" data-id="${s.id}">${portraitOf(s)}<span>${esc(s.name)}</span></button>`)
    .join("");
  // Ba bước chứng minh: mỗi bước chọn một hồ sơ đã thu. Lựa chọn được giữ lại giữa các lần thử
  const steps = c.chain
    .map((st, i) => {
      const options = game.found.length
        ? game.found
            .slice()
            .reverse()
            .map((id) => {
              const a = c.actions.find((x) => x.id === id);
              const on = acc.steps[st.key] === id;
              return `<button class="lkc${on ? " on" : ""}" aria-pressed="${on}" data-action="st-pick" data-step="${st.key}" data-id="${id}">
                  <i class="fa-solid ${TYPES[a.type].icon}"></i><span>${esc(a.title)}</span></button>`;
            })
            .join("")
        : `<p class="italic text-sm">Bạn chưa có hồ sơ nào để viện dẫn.</p>`;
      return `<h4 class="mt-4 mb-1">${i + 2}. ${esc(st.label)}</h4>
        <p class="text-[13px] text-ink-2 mb-2">${esc(st.ask)}</p>
        <div class="lkgrid">${options}</div>`;
    })
    .join("");
  return `
    <h2>⚖️ Phiên xét xử</h2>
    <p class="muted text-sm">Chọn thủ phạm, rồi với từng bước chọn một hồ sơ làm chứng cứ. Sai thủ phạm hoặc sai một bước đều mất một mạng. Các bước đã đúng được giữ lại khi bạn thử lại.</p>
    <h4 class="mt-4 mb-2">1. Thủ phạm là ai?</h4>
    <div class="picks">${picks}</div>
    ${steps}
    <div class="row">
      <button class="btn btn-ghost" data-action="close">Huỷ</button>
      <button class="btn btn-blood" data-action="submit"><i class="fa-solid fa-gavel"></i> Kết tội</button>
    </div>`;
}

// Phản hồi sau một lần kết tội chưa đúng: nói rõ bước nào đúng, bước nào sai và gợi ý cho bước sai
export const wrongHTML = (lives, v) => `
  <h2>❌ Chưa thuyết phục</h2>
  <p>${v.right
    ? "Bạn đã chỉ đúng người, nhưng chuỗi chứng minh còn thiếu. Xem từng bước bên dưới."
    : "Người này chưa khớp với các sự kiện trong hồ sơ. Các bước bên dưới cho biết chứng cứ nào đã vững."}</p>
  <ol class="steps">
    ${v.steps
      .map((s) => `<li class="${s.ok ? "ok" : "no"}"><b>${esc(s.label)}:</b> ${s.ok ? "đúng" : s.pick ? "chưa đúng" : "chưa chọn"}${s.ok ? "" : `<span class="text-ink-2"><br>${esc(s.hint)}</span>`}</li>`)
      .join("")}
  </ol>
  <p class="mt-2">Còn lại <b>${lives}</b> mạng.</p>
  <div class="row"><button class="btn" data-action="close">Điều tra tiếp</button></div>`;

// Phản hồi sau một phiên xét xử nhiều người chưa đúng. Cố ý không tách "đúng người" khỏi "đúng chứng cứ" và không nói câu dựng lại
// nào đúng: mỗi vai chỉ báo vững hay chưa vững (cả người lẫn chứng cứ), còn phần dựng lại chỉ báo số câu đúng.
// Như vậy không thể dò từng phần bằng cách thử lại, mà phải lập luận.
export function wrongVerdictHTML(lives, v, c) {
  const roles = v.roles
    .map((r) => {
      const ok = r.whoOk && r.evOk;
      return `<li class="${ok ? "ok" : "no"}"><b>${esc(r.label)}:</b> ${ok ? "vững" : "chưa vững"}${ok ? "" : `<span class="text-ink-2"><br>${esc(r.hint)}</span>`}</li>`;
    })
    .join("");
  const right = v.facts.filter((f) => f.ok).length;
  const allFacts = right === v.facts.length;
  const facts = `<li class="${allFacts ? "ok" : "no"}"><b>Dựng lại sự việc:</b> đúng ${right}/${v.facts.length} câu${allFacts ? "" : `<span class="text-ink-2"><br>${v.facts.map((f) => esc(f.hint)).join("<br>")}</span>`}</li>`;
  return `
    <h2>❌ Chưa thuyết phục</h2>
    <p>Một hay nhiều phần còn chưa vững. Mỗi vai chỉ vững khi bạn chọn đúng người <b>và</b> đúng chứng cứ cho vai đó. Phần nào vững đã được giữ lại.</p>
    <ol class="steps">${roles}${facts}</ol>
    <p class="mt-2">Còn lại <b>${lives}</b> mạng.</p>
    <div class="row"><button class="btn" data-action="close">Điều tra tiếp</button></div>`;
}

// Mô tả những người bị kết tội: một người (vụ thường) hoặc cả nhóm kèm vai (vụ nhiều người)
const culpritsLine = (c) =>
  c.verdict
    ? c.verdict.roles.map((r) => `${esc(r.label)}: <b>${esc(c.suspects.find((s) => s.id === r.who).name)}</b>`).join(" · ")
    : `Thủ phạm: <b>${esc(c.suspects.find((s) => s.id === c.culprit).name)}</b>`;

// Vụ kế tiếp trong cùng vùng, hoặc -1
const nextInRegion = (idx) => CASES.findIndex((x, i) => i > idx && x.region === CASES[idx].region);

export function verdictWinHTML(c, idx, wrong, save, hints = 0) {
  const st = starsFor(wrong);
  const nx = nextInRegion(idx);
  const next = nx >= 0
    ? `<button class="btn" data-action="start" data-i="${nx}"><i class="fa-solid fa-forward"></i> Vụ tiếp theo</button>`
    : "";
  const list = casesOf(c.region);
  const finale = allSolved(save, list)
    ? `<div class="banner"><i class="fa-solid fa-trophy"></i> Bạn đã khép lại cả ${list.length} vụ án ở ${esc(regionOf(c).name)}, đạt ${totalStars(save, list)}/${list.length * 3} ★.</div>`
    : "";
  return `<div>
    <figure class="polaroid" aria-hidden="true">
      <span class="polaroid-img">${ART.scene(c.locations[0].scene)}</span>
      <figcaption>${esc(c.title)}</figcaption>
      <span class="polaroid-stamp">ĐÃ KHÉP</span>
    </figure>
    <h2>🏆 Công lý đã được thực thi</h2>
    <div class="big">${starsHTML(st)}</div>
    <p>${culpritsLine(c)}</p>
    ${hints ? `<p class="muted text-sm"><i class="fa-solid fa-lightbulb"></i> Gợi ý đã dùng: ${hints}</p>` : ""}
    <div class="expl">${c.explanation}</div>
    ${finale}
    <div class="row">${next}<button class="btn btn-ghost" data-action="menu">Về danh sách vụ án</button></div>
  </div>`;
}

export const verdictLoseHTML = (c, idx) => `<div>
  <h2>📕 Hồ sơ đóng lại</h2>
  <p>Bạn đã dùng hết ba mạng. Đây là lời giải của vụ án.</p>
  <p class="mt-1.5">${culpritsLine(c)}</p>
  <div class="expl">${c.explanation}</div>
  <div class="row">
    <button class="btn btn-blood" data-action="start" data-i="${idx}"><i class="fa-solid fa-rotate-right"></i> Điều tra lại vụ này</button>
    <button class="btn btn-ghost" data-action="menu">Về danh sách</button>
  </div>
</div>`;

/* ---------- Tổng quan địa điểm ---------- */
export function overviewHTML(game, c) {
  const rows = overviewOf(game, c);
  const left = rows.reduce((n, r) => n + r.left, 0);
  const list = rows
    .map((r) => {
      const fin = r.left === 0;
      const tags = [
        r.current ? `<span class="ltag"><i class="fa-solid fa-location-dot"></i> Bạn đang ở đây</span>` : "",
        r.waiting ? `<span class="ltag k-lh"><i class="fa-solid fa-hourglass-half"></i> ${r.waiting} điểm chờ tới ${esc(r.wakeAt)}</span>` : ""
      ].join("");
      const body = `<span class="ov-ico"><i class="fa-solid ${r.current ? "fa-location-dot" : fin ? "fa-circle-check" : "fa-door-open"}"></i></span>
        <span class="ov-main"><b>${esc(r.name)}</b><small>${esc(r.time)} · ${r.done ? `đã làm ${r.done} điểm` : "chưa làm điểm nào"}</small>${tags}</span>
        <span class="ov-n${fin ? " fin" : ""}">${fin ? "Xong" : `Còn ${r.left}`}</span>`;
      // Nơi đang đứng không phải nút (đi tới chính nó là vô nghĩa)
      return r.current
        ? `<div class="ov-row cur${fin ? " fin" : ""}" aria-current="location">${body}</div>`
        : `<button class="ov-row${fin ? " fin" : ""}" data-action="ov-go" data-loc="${r.loc}" aria-label="Đi tới ${esc(r.name)}, ${fin ? "đã xong" : `còn ${r.left} điểm`}">${body}</button>`;
    })
    .join("");
  const clock = game.hours <= 0
    ? `Đã hết giờ điều tra, hãy buộc tội.`
    : `Đồng hồ ${clockAt(game, c)} · còn ${game.hours}/${c.budget} giờ · còn ${left} điểm điều tra trên cả vụ.`;
  return `
    <h2>📍 Tổng quan địa điểm</h2>
    <p class="muted text-sm">${clock} Đi qua cửa không tốn giờ; bấm một nơi để tới đó.</p>
    <div class="ov-list mt-3">${list}</div>
    <div class="row"><button class="btn btn-ghost" data-action="close">Đóng</button></div>`;
}

export const helpHTML = () => `
  <h2>📖 Cách chơi</h2>
  <div class="expl">
    <p><b>Mục tiêu:</b> tìm đúng thủ phạm và viện dẫn đủ chứng cứ then chốt.</p>
    <p><b>Không gian điều tra:</b> mỗi cảnh là một thế giới rộng, phủ kín màn hình. Bốn góc có nút chức năng: ← quay về danh sách (trên trái), giờ và mạng (trên phải), Sổ tay (dưới trái), Buộc tội (dưới phải).</p>
    <p><b>Xem và di chuyển:</b> kéo màn hình, dùng mũi tên ◀ ▶ hoặc phím ← → để xem hai bên. Cửa có biển tên dẫn tới các địa điểm khác; đi qua cửa không tốn giờ.</p>
    <p><b>Điểm điều tra:</b> bấm vào các thẻ trên cảnh để hỏi cung, khám nghiệm hoặc tra cứu. Mỗi điểm thường tốn một giờ; điểm nào tốn nhiều hơn sẽ ghi rõ trên nhãn. Kết quả được lưu vào Hồ sơ.</p>
    <p><b>Giờ điều tra:</b> mỗi vụ có ngân sách giờ hữu hạn, tối thiểu bằng nửa số điểm điều tra. Hãy cân nhắc việc nào cần làm trước.</p>
    <p><b>Đồng hồ và diễn biến:</b> giờ trên thanh đầu là giờ hiện tại của vụ án. Mỗi giờ điều tra là một giờ trôi qua, còn di chuyển thì không. Hồ sơ và chứng cứ không biến mất theo thời gian; chỉ có vài kết quả (sao kê, báo cáo) về muộn sau một mốc giờ. Diễn biến được báo ngay và ghi trong tab Thời gian của Sổ tay.</p>
    <p><b>Lời khai có thể dối:</b> đừng tin ngay. Hãy đối chiếu lời khai với camera, sổ sách và vật chứng.</p>
    <p><b>Đưa chứng cứ:</b> sau khi hỏi một người, mở Sổ tay ▸ Nghi phạm và bấm “Đưa chứng cứ” để đưa một hồ sơ cho họ xem. Mỗi lần tốn một giờ. Phản ứng có thể mở thêm một lời khai mới.</p>
    <p><b>Sổ tay:</b> gồm Nghi phạm (bấm thẻ để đánh dấu chưa rõ, nghi ngờ hoặc loại trừ; đây chỉ là ghi chú của bạn), Hồ sơ (mọi chứng cứ đã thu) và Đối chiếu nếu vụ có bảng này.</p>
    <p><b>Tìm, đánh dấu và ghi chú:</b> trong tab Hồ sơ, gõ vào ô tìm để lọc theo tên, nội dung hoặc ghi chú của bạn (gõ không dấu cũng được), lọc theo loại hồ sơ, hoặc bấm ★ để đánh dấu hồ sơ quan trọng. Nút “Ghi chú” trên mỗi hồ sơ và mỗi nghi phạm mở một ô để bạn ghi suy nghĩ riêng; ghi chú được lưu cùng ván và không ảnh hưởng luật chơi.</p>
    <p><b>Tổng quan địa điểm:</b> nút bản đồ ở góc dưới trái (hoặc phím M) liệt kê mọi địa điểm, mỗi nơi còn bao nhiêu điểm điều tra và điểm nào đang chờ hồ sơ về muộn. Bấm một nơi để đi tới đó, không tốn giờ.</p>
    <p><b>Buộc tội:</b> chọn thủ phạm, rồi chứng minh ba bước (mỗi bước một hồ sơ làm chứng cứ). Sai thủ phạm hoặc sai một bước đều mất một mạng; bạn có ba mạng. Phản hồi sẽ nói rõ bước nào đúng, bước nào cần xem lại.</p>
    <p><b>Dấu vết trong bóng tối:</b> vài dấu vết không hiện ngay. Đưa đèn pin (con trỏ) quét qua vùng nghi ngờ; khi ánh sáng chạm tới, điểm đó sáng lên.</p>
    <p><b>Liên kết hồ sơ:</b> tab Liên kết trong Sổ tay. Chọn hai hồ sơ rồi bấm Đối chiếu. Đối chiếu không tốn giờ, nhưng chỉ cặp đúng mới ghi được một kết nối: mâu thuẫn trong lời khai, hoặc một quan hệ giữa các hồ sơ.</p>
    <p><b>Dòng thời gian:</b> tab Thời gian trong Sổ tay ghi các mốc giờ theo thứ tự và đối chiếu lời khai về nơi ở của từng người. “Bị bác” nghĩa là có chứng cứ đặt người đó ở nơi khác cùng giờ; “Được xác nhận” nghĩa là có chứng cứ đặt họ đúng nơi đã khai.</p>
    <p><b>Các vụ án:</b> trò chơi có hai vụ ở Sài Gòn. Cả hai dùng các cơ chế dưới đây.</p>
    <p><b>Suy luận (Sài Gòn):</b> tab Suy luận trong Sổ tay. Chọn từ 2 đến 4 hồ sơ có liên quan tới nhau rồi bấm Suy luận. Chỉ đúng tập hồ sơ mới cho ra một kết luận, không tốn giờ. Kết luận cũng là hồ sơ nên ghép tiếp được với hồ sơ khác, và có kết luận mở ra điểm điều tra mới. Game chỉ xác nhận sự kiện, không bao giờ nói ai là thủ phạm: bước đó là của bạn.</p>
    <p><b>Giờ máy lệch:</b> không phải mọi đồng hồ đều đúng. Mốc nào lấy từ một thiết bị có thể sai giờ sẽ có nhãn “giờ máy” trong tab Thời gian. Hãy đối chiếu cùng một sự kiện giữa các nguồn giờ khác nhau; khi tìm ra độ lệch, mọi mốc của thiết bị đó tự được hiệu chỉnh và ngoại phạm của mọi người được so lại.</p>
    <p><b>Khóa mã và kết quả về muộn:</b> điểm có ổ khóa cần nhập mã bằng bàn phím số; sai ${LOCK_TRIES} lần thì thiết bị tự khóa và bạn mất ${LOCK_PENALTY} giờ. Hồ sơ có nhãn đồng hồ cát chỉ về sau một mốc giờ; bấm vào để chờ, và thời gian chờ cũng tính vào ngân sách giờ.</p>
    <p><b>Phiên xét xử nhiều người (Sài Gòn):</b> với vụ có nhiều người liên đới, bạn chọn người cho từng vai, một hồ sơ làm chứng cứ cho mỗi vai, và trả lời vài câu dựng lại sự việc. Kết luận có giá trị hơn hồ sơ gốc. Sai một phần nào cũng mất một mạng.</p>
    <p><b>Gợi ý:</b> nút bóng đèn ở góc dưới trái. Lần bấm đầu chỉ cho biết nên xem lại nơi nào hoặc làm việc gì; bấm “Chỉ rõ hơn” thì nói đúng điểm điều tra hoặc hồ sơ cần ghép, và điểm đó nhấp nháy trên cảnh. Gợi ý không tốn giờ và không ảnh hưởng số sao, chỉ được đếm ở màn kết thúc.</p>
    <p><b>Toàn màn hình trên điện thoại:</b> bấm nút mũi tên mở rộng ở góc trên để ẩn thanh địa chỉ; trên Android, game tự xoay ngang. Muốn lần nào mở cũng toàn màn hình: trong Chrome bấm ⋮ ▸ “Cài đặt ứng dụng” (hoặc “Thêm vào Màn hình chính”) rồi mở game từ biểu tượng mới. Nếu trước đó đã thêm lối tắt kiểu cũ thì xóa nó đi và cài lại. iPhone: Chia sẻ ▸ “Thêm vào Màn hình chính”.</p>
    <p><b>Số sao:</b> ★★★ nếu kết tội đúng ngay lần đầu; ★★ nếu sai một lần; ★ nếu sai hai lần.</p>
  </div>
  <div class="row"><button class="btn btn-ghost" data-action="coach-reset"><i class="fa-solid fa-circle-question"></i> Xem lại hướng dẫn</button><button class="btn" data-action="close">Đã hiểu</button></div>`;

/* ---------- Khóa mã và chờ kết quả ---------- */

// Bàn phím số cho điểm điều tra có khóa. entry là chuỗi số đã nhập; msg là thông báo sau lần thử gần nhất
export function lockHTML(c, a, entry, tries, msg = "") {
  const digits = a.lock.digits;
  const screen = Array.from({ length: digits }, (_, i) => `<span class="kp-d${entry[i] ? " on" : ""}">${entry[i] || ""}</span>`).join("");
  const key = (k) => `<button class="kp-key" data-action="lock-key" data-k="${k}" aria-label="Số ${k}">${k}</button>`;
  return `
    <h2>🔒 ${esc(a.title)}</h2>
    <p class="muted text-sm">${esc(a.lock.prompt || "Thiết bị có khóa mã.")} Nhập ${digits} chữ số. Sai ${LOCK_TRIES} lần thì thiết bị tự khóa và bạn mất ${LOCK_PENALTY} giờ.</p>
    <div class="kp" role="group" aria-label="Bàn phím số">
      <div class="kp-screen" aria-live="polite">${screen}</div>
      <div class="kp-grid">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(key).join("")}
        <button class="kp-key kp-fn" data-action="lock-del" aria-label="Xóa số vừa nhập"><i class="fa-solid fa-delete-left"></i></button>
        ${key(0)}
        <button class="kp-key kp-ok" data-action="lock-go" aria-label="Thử mã" ${entry.length === digits ? "" : "disabled"}><i class="fa-solid fa-check"></i></button>
      </div>
      <p class="kp-msg">${msg ? esc(msg) : `Còn ${LOCK_TRIES - tries} lần thử.`}</p>
    </div>
    <div class="row"><button class="btn btn-ghost" data-action="close">Để sau</button></div>`;
}

// Hỏi có chờ hồ sơ về muộn không: nêu mốc giờ, số giờ chờ và số giờ đọc hồ sơ
export function waitHTML(game, c, a) {
  const at = arrivalOf(c, a.id), need = waitHours(game, c, a.id), can = game.hours >= need + a.cost;
  return `
    <h2>⏳ Kết quả chưa về</h2>
    <p><b>${esc(a.title)}</b> sẽ có lúc <b>${at}</b>. Chờ tới lúc đó tốn <b>${need}</b> giờ, rồi đọc hồ sơ tốn thêm ${a.cost} giờ. Trong lúc chờ đồng hồ vẫn chạy: hồ sơ khác có thể bị mất và nghi phạm có thể rời đi.</p>
    ${can ? "" : `<p class="mt-2 text-[#a13b2a]">Bạn chỉ còn ${game.hours} giờ, không đủ để chờ và đọc hồ sơ này.</p>`}
    <div class="row">
      <button class="btn btn-ghost" data-action="close">Để sau</button>
      <button class="btn" data-action="wait-do" data-id="${a.id}" ${can ? "" : "disabled"}><i class="fa-solid fa-hourglass-half"></i> Chờ ${need} giờ</button>
    </div>`;
}

export const resetHTML = () => `
  <h2>Xoá toàn bộ tiến độ?</h2>
  <p class="muted">Số sao của cả ${CASES.length} vụ sẽ mất.</p>
  <div class="row"><button class="btn btn-ghost" data-action="close">Huỷ</button><button class="btn btn-blood" data-action="reset-confirm">Xoá tiến độ</button></div>`;

export { starsHTML };

/* ---------- Gợi ý ---------- */
// Lời gợi ý cho một việc cần làm tiếp (từ nextStep). level 1: chỉ hướng; level 2: nói rõ điểm, hồ sơ
function hintLine(game, c, st, level) {
  const title = (id) => (actionOf(c, id) || {}).title || id;
  const nameOf = (id) => (c.suspects.find((x) => x.id === id) || {}).name || id;
  if (st.kind === "accuse") return "Bạn đã có đủ chứng cứ then chốt cho mọi bước buộc tội. Hãy mở Buộc tội và chọn đúng hồ sơ cho từng bước.";
  if (st.kind === "go" || st.kind === "wait") {
    const spot = spotOf(c, st.id);
    const L = spot ? c.locations[spot.loc] : null;
    const here = !!spot && spot.loc === game.loc;
    if (st.kind === "wait") {
      return level < 2
        ? "Có một hồ sơ quan trọng sắp về muộn. Hãy xem lại khi đồng hồ tới mốc."
        : `Hồ sơ “${esc(title(st.id))}” về lúc ${esc(st.at || "")}${L ? ` ở ${esc(L.name)}` : ""}. Bấm vào điểm của nó để chờ.`;
    }
    if (level < 2) return here ? "Còn một điều đáng xem ngay tại đây." : `Hãy xem lại ${esc(L.name)}.`;
    return here ? `Hãy điều tra “${esc(spot.label)}”.` : `Hãy tới ${esc(L.name)} và điều tra “${esc(spot.label)}”.`;
  }
  if (st.kind === "deduce") {
    return level < 2
      ? "Một vài hồ sơ bạn đang có có thể ghép lại thành kết luận. Hãy mở tab Suy luận trong Sổ tay."
      : `Trong tab Suy luận, thử ghép: ${st.needs.map((n) => `“${esc(title(n))}”`).join(" + ")}.`;
  }
  // confront
  return level < 2
    ? `Thử đưa một hồ sơ cho ${esc(nameOf(st.who))} xem phản ứng.`
    : `Đưa “${esc(title(st.clue))}” cho ${esc(nameOf(st.who))} (Sổ tay ▸ Nghi phạm ▸ Đưa chứng cứ).`;
}

export function hintSheetHTML(game, c, st, level) {
  const more = level < 2 && st.kind !== "accuse";
  return `
    <h2>💡 Gợi ý</h2>
    <div class="expl"><p>${hintLine(game, c, st, level)}</p></div>
    <p class="muted text-sm mt-2">Gợi ý không tốn giờ và không ảnh hưởng số sao. Đã dùng: ${game.hints || 0}.</p>
    <div class="row"><button class="btn" data-action="close">Đã hiểu</button>${more ? `<button class="btn btn-ghost" data-action="hint-more"><i class="fa-solid fa-lightbulb"></i> Chỉ rõ hơn</button>` : ""}</div>`;
}
