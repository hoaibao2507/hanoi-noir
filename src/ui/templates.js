/* =====================================================================
   Mẫu HTML thuần: nhận dữ liệu, trả về chuỗi. Không chạm DOM, không giữ trạng thái.
   Nút dùng data-action thay cho onclick; bộ điều khiển xử lý ủy quyền ở document.
   ===================================================================== */
import { CASES, TYPES, REGIONS, casesOf } from "../data/cases.js";
import { ART } from "../art/art.js";
import { OX, WORLD_W, WORLD_H, DOOR_W } from "../world/layout.js";
import {
  isOpen, remainingAt, starsFor, allSolved, totalStars, linksOf,
  CONFRONT_COST, questioned, confrontOptions, alibisOf, timelineEvents, hasTimeline,
  isGone, clockAt, eventsDone, departed, gated, isPending, arrivalOf, waitHours, unlocksOf,
  LOCK_TRIES, LOCK_PENALTY, MAX_DEDUCE
} from "../game/rules.js";
import { esc } from "./dom.js";

const pctX = (u) => ((u / WORLD_W) * 100).toFixed(3);
const pctY = (v) => ((v / WORLD_H) * 100).toFixed(3);
const portraitOf = (s) => ART.portrait(s.look, s.id);
const starsHTML = (n, max = 3) =>
  Array.from({ length: max }, (_, i) => `<span class="st${i < n ? "" : " dim"}">★</span>`).join("");

/* ---------- Màn hình chính ---------- */
export const regionOf = (c) => REGIONS.find((r) => r.id === c.region) || REGIONS[0];

export function menuHTML(save, regionId = "hn") {
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
        <span class="block text-xs text-ink-2 mt-1">${esc(c.place)}</span>
        <span class="block mt-3 text-sm">${info}</span>
      </span>
    </button>`;
  }).join("");

  const tabs = REGIONS.map((r) => {
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
        <button class="btn btn-ghost" data-action="help" title="Cách chơi"><i class="fa-solid fa-circle-question"></i><span class="hidden sm:inline">Cách chơi</span></button>
        <button class="btn btn-ghost" data-action="reset-ask" title="Xoá tiến độ"><i class="fa-solid fa-rotate-left"></i><span class="hidden sm:inline">Xoá tiến độ</span></button>
      </div>
    </div>
    <div class="absolute inset-x-0 bottom-0 pt-24 pb-4 md:pb-7 bg-gradient-to-t from-[#070403] via-[#070403]/75 to-transparent">
      <div class="pointer-events-auto region-bar mb-3">${tabs}</div>
      <div class="text-center mb-3 pointer-events-none px-4">${finale}</div>
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
        <span class="glass rounded-full px-3.5 py-2 text-sm font-semibold tabnum flex items-center gap-2 whitespace-nowrap"><i class="fa-regular fa-clock text-lamp"></i>${clockAt(game, c)}<span class="text-ink-2">·</span><span class="hidden sm:inline">Còn&nbsp;</span>${game.hours}/${c.budget}<span class="hidden sm:inline">&nbsp;giờ</span></span>
        <span class="glass rounded-full px-3.5 py-2 text-sm flex items-center gap-1.5">${hearts}</span>
      </div>
    </div>
    <div class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 md:p-5">
      <button class="pointer-events-auto btn btn-ghost" data-action="nb-toggle" title="Sổ tay điều tra">
        <i class="fa-solid fa-book-open"></i><span class="hidden sm:inline">Sổ tay</span>
        <span class="tabnum rounded-full bg-lamp/25 px-2 text-xs text-lamp-2">${game.found.length}</span>
      </button>
      <div class="pointer-events-none glass rounded-full px-4 py-2 text-sm hidden sm:flex items-center gap-2">${hintHTML(game, c, L)}</div>
      <button class="pointer-events-auto btn btn-blood" data-action="accuse"><i class="fa-solid fa-gavel"></i> Buộc tội</button>
    </div>`;
}

/* ---------- Thế giới: điểm điều tra và cửa ---------- */
export function hotspotsHTML(game, c, L) {
  return L.hs
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
      const note = done ? ", đã làm" : wait ? `, kết quả về lúc ${arrivalOf(c, id)}` : a.lock ? ", có khóa mã" : "";
      return `<button class="hs ${state}${secret}" data-action="act" data-id="${id}" style="left:${pctX(OX + x)}%;top:${pctY(y)}%"
          ${open || wait ? "" : "disabled"} aria-label="${esc(lab)}${note}${done || wait ? "" : `, tốn ${a.cost} giờ`}">
        <span class="hs-in"><span class="hs-chip"><i class="fa-solid ${icon}"></i></span>
        <span class="hs-tag">${done ? "✓ " : ""}${esc(lab)}${cost}</span></span>
      </button>`;
    })
    .join("");
}

export function doorsHTML(doors) {
  return doors
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

/* ---------- Sổ tay ---------- */
function visualHTML(c, a) {
  const v = a.visual;
  if (v.k === "who") {
    const s = c.suspects.find((x) => x.id === v.id);
    return `<div class="who flex items-center gap-3 mb-3">${portraitOf(s)}<span class="text-sm text-ink-2">${esc(s.name)} · ${esc(s.role)}</span></div>`;
  }
  return `<div class="vis">${ART.evidence(v)}</div>`;
}

// Nút đưa chứng cứ chỉ hiện với người đã bị hỏi; hết hồ sơ để đưa thì nút tắt
function confrontButton(game, c, s) {
  if (!questioned(game, c, s.id)) return "";
  const n = confrontOptions(game, c, s.id).length;
  return `<button class="mark confront" data-action="confront-open" data-who="${s.id}" ${n ? "" : "disabled"}
            aria-label="Đưa chứng cứ cho ${esc(s.name)}"><i class="fa-solid fa-file-lines"></i> Đưa chứng cứ${n ? ` (${n})` : ""}</button>`;
}

function susHTML(game, c) {
  const labels = ["Chưa rõ", "Nghi ngờ", "Loại trừ"];
  const icons = ["fa-circle-question", "fa-triangle-exclamation", "fa-circle-xmark"];
  return c.suspects
    .map((s) => {
      const m = game.marks[s.id];
      return `<div class="sus m${m}">
        ${portraitOf(s)}
        <div class="min-w-0">
          <h4 class="text-base">${esc(s.name)}</h4>
          <small class="text-ink-2 text-xs">${esc(s.role)}</small>${departed(game, c, s.id) ? `<span class="ltag k-mt">Đã rời đi</span>` : ""}
          <p class="text-[13px] text-ink-2 leading-snug mt-1 mb-2">${esc(s.bio)}</p>
          ${linkTags(game, c, s.id)}
          <button class="mark m${m}" data-action="mark" data-id="${s.id}" aria-label="Đánh dấu ${esc(s.name)}: ${labels[m]}">
            <i class="fa-solid ${icons[m]}"></i> ${labels[m]}</button>
          ${confrontButton(game, c, s)}
        </div>
      </div>`;
    })
    .join("");
}

function cluesHTML(game, c) {
  if (!game.found.length) {
    return `<p class="text-ink-2 italic text-sm">Chưa có hồ sơ nào. Hãy đến từng địa điểm và bấm vào các điểm điều tra trên cảnh.</p>`;
  }
  return game.found
    .slice()
    .reverse()
    .map((id) => {
      const a = c.actions.find((x) => x.id === id);
      const t = TYPES[a.type];
      return `<article class="clue tone-${t.cls}">
        <div class="text-xs text-ink-2 flex items-center gap-2"><i class="fa-solid ${t.icon}"></i>${a.type}</div>
        ${visualHTML(c, a)}
        <h4 class="text-[15px] mt-1 mb-1">${esc(a.title)}</h4>
        <p class="text-[13.5px] leading-relaxed">${esc(a.text)}</p>
      </article>`;
    })
    .join("");
}

function matrixHTML(game, c) {
  const m = c.matrix;
  const head = m.cols
    .map((col) => `<th class="px-1 py-1.5 font-semibold whitespace-nowrap">${game.done[col.act] ? "Lời " + col.label : `<i class="fa-solid fa-lock text-ink-2"></i> ${col.label}`}</th>`)
    .join("");
  const rows = m.rows
    .map((rid) => {
      const s = c.suspects.find((x) => x.id === rid);
      let n = 0;
      const cells = m.cols
        .map((col) => {
          const v = game.mx[rid + "|" + col.act] || 0;
          if (v === 1) n++;
          const open = !!game.done[col.act];
          return `<td class="p-1"><button class="mx v${v}" ${open ? "" : "disabled"} data-action="mx" data-rid="${rid}" data-act="${col.act}"
              aria-label="Nếu ${esc(s.name)} là thủ phạm, lời ${col.label} đúng hay sai">${["·", "✓", "✗"][v]}</button></td>`;
        })
        .join("");
      return `<tr><th class="text-left px-2 whitespace-nowrap">${esc(s.name)}</th>${cells}<td class="tot">${n}</td></tr>`;
    })
    .join("");
  return `<p class="text-[13px] text-ink-2 mb-3">Giả sử từng người là thủ phạm, lời khai của mỗi người đúng (✓) hay sai (✗)? Bấm ô để đổi. Lời khai chỉ mở sau khi bạn nghe. Đếm số ✓ rồi đối chiếu với biên bản.</p>
    <div class="mxwrap"><table class="mxt"><thead><tr><th class="text-left px-2">Nếu thủ phạm là</th>${head}<th>Số ✓</th></tr></thead><tbody>${rows}</tbody></table></div>`;
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
  return `
    <h2>${esc(s.name)} trả lời</h2>
    <div class="who flex items-center gap-3 mb-3">${portraitOf(s)}<span class="text-sm text-ink-2">Bạn đưa: <b>${esc(clue.title)}</b></span></div>
    <div class="expl"><p>${esc(line)}</p></div>
    ${newsList(news)}
    ${reveal ? `<div class="banner mt-3"><i class="fa-solid fa-file-lines"></i> Lời khai mới đã được ghi: <b>${esc(reveal.title)}</b></div>` : ""}
    <div class="row"><button class="btn" data-action="close">Tiếp tục</button></div>`;
}

/* ---------- Suy luận: ghép hồ sơ thành kết luận ---------- */
const conclusionIds = (c) => [...new Set(c.deduce.map((d) => d.gives))];
const conclusionsOf = (game, c) => conclusionIds(c).filter((id) => game.done[id]);

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

function conclusionCard(game, c, id) {
  const a = c.actions.find((x) => x.id === id);
  const from = (game.ddFrom || {})[id];
  const names = from ? from.map((n) => esc(c.actions.find((x) => x.id === n).title)).join(" + ") : "";
  return `<article class="clue tone-kl">
      <div class="text-xs text-ink-2 flex items-center gap-2"><i class="fa-solid fa-lightbulb"></i>Kết luận</div>
      <h4 class="text-[15px] mt-1 mb-1">${esc(a.title)}</h4>
      <p class="text-[13.5px] leading-relaxed">${esc(a.text)}</p>
      ${names ? `<p class="text-xs text-ink-2 mt-2">Rút ra từ: ${names}</p>` : ""}
      ${effectsHTML(c, id)}
    </article>`;
}

function deduceTabHTML(game, c) {
  const items = game.found.slice().reverse().map((id) => c.actions.find((a) => a.id === id));
  const picks = items.length
    ? items
        .map((a) => {
          const on = game.dpick.includes(a.id);
          return `<button class="lkc${on ? " on" : ""}${a.via === "deduce" ? " is-k" : ""}" aria-pressed="${on}" data-action="dd-pick" data-id="${a.id}">
              <i class="fa-solid ${TYPES[a.type].icon}"></i><span>${esc(a.title)}</span></button>`;
        })
        .join("")
    : `<p class="italic text-sm">Chưa có hồ sơ nào để ghép. Hãy thu thập hồ sơ trước.</p>`;
  const r = game.ddResult;
  const msg = !r
    ? ""
    : r.status === "none"
      ? `<p class="lkmsg">Những hồ sơ này chưa cho ra kết luận nào. Có thể thiếu một hồ sơ, thừa một hồ sơ, hoặc chúng chưa liên quan tới nhau.</p>`
      : r.status === "known"
        ? `<p class="lkmsg">Kết luận này đã có trong sổ tay.</p>`
        : `<p class="lkmsg ok">Kết luận mới đã được ghi lại.</p>`;
  const done = conclusionsOf(game, c);
  const chosen = game.dpick.map((id) => esc(c.actions.find((a) => a.id === id).title));
  return `
    <p class="text-[13px] text-ink-2 mb-3">Chọn từ 2 đến ${MAX_DEDUCE} hồ sơ có liên quan tới nhau rồi bấm Suy luận. Chỉ đúng tập hồ sơ mới cho ra kết luận; thừa hay thiếu một hồ sơ đều không được. Suy luận không tốn giờ. Kết luận cũng là hồ sơ, nên ghép tiếp được với hồ sơ khác, và có kết luận mở ra điểm điều tra mới.</p>
    <div class="lkgrid">${picks}</div>
    <p class="text-xs text-ink-2 mt-3">${chosen.length ? `Đang chọn (${chosen.length}): ${chosen.join(" + ")}` : "Chưa chọn hồ sơ nào."}</p>
    <div class="row mt-3">
      <button class="btn btn-ghost" data-action="dd-clear" ${chosen.length ? "" : "disabled"}>Bỏ chọn</button>
      <button class="btn" data-action="dd-try" ${game.dpick.length >= 2 ? "" : "disabled"}><i class="fa-solid fa-lightbulb"></i> Suy luận</button>
    </div>
    ${msg}
    ${game.ddTries ? `<p class="text-xs text-ink-2 mt-1">Đã thử chưa ra: ${game.ddTries} lần</p>` : ""}
    <h4 class="mt-4 mb-2">Kết luận đã rút ra: ${done.length}/${conclusionIds(c).length}</h4>
    ${done.length ? done.map((id) => conclusionCard(game, c, id)).join("") : `<p class="text-ink-2 italic text-sm">Chưa có kết luận nào.</p>`}`;
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

/* ---------- Liên kết hồ sơ ---------- */
const isMistake = (kind) => kind === "mâu thuẫn";

// Nhãn ngắn trên thẻ nghi phạm: các kết nối đã tìm nói về người này
function linkTags(game, c, sid) {
  return linksOf(game, c)
    .filter((l) => l.about === sid)
    .map((l) => `<span class="ltag ${isMistake(l.kind) ? "k-mt" : "k-lh"}"><i class="fa-solid ${isMistake(l.kind) ? "fa-triangle-exclamation" : "fa-link"}"></i> ${esc(l.kind)}</span>`)
    .join("");
}

function linkCard(c, l) {
  const who = c.suspects.find((s) => s.id === l.about);
  return `<article class="linkc ${isMistake(l.kind) ? "k-mt" : "k-lh"}">
      <div class="text-xs text-ink-2 flex items-center gap-2"><i class="fa-solid ${isMistake(l.kind) ? "fa-triangle-exclamation" : "fa-link"}"></i>${esc(l.kind)}${who ? ` · về ${esc(who.name)}` : ""}</div>
      <p class="text-[13.5px] leading-relaxed mt-1">${esc(l.text)}</p>
    </article>`;
}

// Độ nghiêng ổn định của mỗi tấm ghim (cùng một hồ sơ luôn nghiêng như nhau)
const tiltOf = (id) => ([...id].reduce((n, ch) => n + ch.charCodeAt(0), 0) % 7 - 3) * 0.9;

// Tấm ghim trên bảng: chân dung (lời khai) hoặc biểu tượng (loại hồ sơ) cùng tiêu đề
function pinHTML(game, c, a) {
  const on = game.pick.includes(a.id);
  const t = TYPES[a.type];
  const face = a.visual && a.visual.k === "who"
    ? `<span class="pin-face">${portraitOf(c.suspects.find((x) => x.id === a.visual.id))}</span>`
    : `<span class="pin-icon"><i class="fa-solid ${t.icon}"></i></span>`;
  return `<button class="pin tone-${t.cls}${on ? " on" : ""}" aria-pressed="${on}" data-action="lk-pick" data-id="${a.id}" data-pin="${a.id}" style="--tilt:${tiltOf(a.id)}deg">
      <span class="pin-nail"></span>${face}<span class="pin-title">${esc(a.title)}</span></button>`;
}

function linksHTML(game, c) {
  const clues = game.found.slice().reverse().map((id) => c.actions.find((a) => a.id === id));
  const found = linksOf(game, c);
  const threads = found.map((l) => [l.a, l.b, isMistake(l.kind) ? "mt" : "lh"]);
  const board = clues.length
    ? `<div class="pinboard" data-board data-threads="${esc(JSON.stringify(threads))}">
        <svg class="threads" aria-hidden="true"></svg>
        <div class="pins">${clues.map((a) => pinHTML(game, c, a)).join("")}</div>
      </div>`
    : `<p class="italic text-sm">Chưa có hồ sơ nào để đối chiếu. Hãy thu thập hồ sơ trước.</p>`;
  const r = game.lkResult;
  const msg = !r
    ? ""
    : r.status === "none"
      ? `<p class="lkmsg">Hai hồ sơ này chưa cho thấy điều gì. Thử cặp khác.</p>`
      : r.status === "known"
        ? `<p class="lkmsg">Kết nối này đã có trong sổ tay.</p>`
        : `<p class="lkmsg ok">Kết nối mới đã được ghi lại.</p>`;
  return `
    <p class="text-[13px] text-ink-2 mb-3">Kéo một hồ sơ thả lên hồ sơ khác để nối bằng sợi chỉ, hoặc bấm chọn hai hồ sơ rồi bấm Đối chiếu. Đối chiếu không tốn giờ, nhưng chỉ cặp đúng mới giữ được sợi chỉ.</p>
    ${board}
    <div class="row mt-3"><button class="btn" data-action="lk-check" ${game.pick.length === 2 ? "" : "disabled"}><i class="fa-solid fa-link"></i> Đối chiếu</button></div>
    ${msg}
    <h4 class="mt-4 mb-2">Kết nối đã tìm: ${found.length}/${c.links.length}</h4>
    ${found.length ? found.map((l) => linkCard(c, l)).join("") : `<p class="text-ink-2 italic text-sm">Chưa có kết nối nào.</p>`}`;
}

/* ---------- Dòng thời gian: mốc giờ và lời khai về nơi ở ---------- */
const nameOf = (c, id) => c.suspects.find((s) => s.id === id).name;

// Nhãn và màu cho từng kết quả đối chiếu lời khai về nơi ở
const ALIBI_STATUS = {
  clash: { cls: "k-mt", icon: "fa-triangle-exclamation", label: "Bị bác" },
  proof: { cls: "k-lh", icon: "fa-circle-check", label: "Được xác nhận" },
  open: { cls: "", icon: "fa-circle-question", label: "Chưa có chứng cứ" }
};

function alibiHTML(c, a) {
  const st = ALIBI_STATUS[a.status];
  const by = a.by
    ? `<p class="text-sm text-ink-2 mt-1">${a.status === "clash" ? "Mâu thuẫn với" : "Xác nhận bởi"}: ${esc(a.by.title)}, ${esc(a.by.from)}–${esc(a.by.to)} tại ${esc(a.by.at)}</p>`
    : "";
  return `<div class="linkc ${st.cls}">
    <p class="text-sm"><b>${esc(nameOf(c, a.who))}</b> khai ở <b>${esc(a.at)}</b>, ${esc(a.from)}–${esc(a.to)}</p>
    <p class="text-xs text-ink-2 mt-0.5">Từ hồ sơ “${esc(a.title)}”</p>
    <span class="ltag ${st.cls}"><i class="fa-solid ${st.icon}"></i> ${st.label}</span>
    ${by}
  </div>`;
}

// Nhãn giờ máy: mốc lấy từ thiết bị lệch giờ. Chưa hiệu chỉnh thì cảnh báo, đã hiệu chỉnh thì ghi giờ máy gốc
function devBadge(e) {
  if (!e.dev) return "";
  return e.dev.fixed
    ? `<span class="ltag k-lh"><i class="fa-regular fa-clock"></i> đã hiệu chỉnh · giờ máy ${esc(e.dev.rawFrom)}–${esc(e.dev.rawTo)}</span>`
    : `<span class="ltag k-mt"><i class="fa-regular fa-clock"></i> giờ máy ${esc(e.dev.name)} · chưa hiệu chỉnh</span>`;
}

function eventHTML(c, e) {
  const who = e.who ? ` · <b>${esc(nameOf(c, e.who))}</b>` : e.pending ? ` · <i class="text-ink-2">Chưa rõ là ai</i>` : "";
  return `<div class="tl-row${e.dev && !e.dev.fixed ? " raw" : ""}">
    <span class="tl-time">${esc(e.from)}–${esc(e.to)}</span>
    <div>
      <p class="text-sm">${esc(e.at)}${who}</p>
      <p class="text-xs text-ink-2">${esc(e.title)}</p>
      ${devBadge(e)}
    </div>
  </div>`;
}

// Cảnh báo giờ máy ở đầu tab Thời gian: nêu thiết bị nào đã hiệu chỉnh, thiết bị nào còn chưa
function devicesNote(game, c) {
  const devs = Object.values(c.devices || {});
  if (!devs.length) return "";
  return devs
    .map((d) => game.done[d.by]
      ? `<div class="banner mb-3"><i class="fa-regular fa-clock"></i> Giờ ${esc(d.name)} đã được hiệu chỉnh: giờ thật = giờ máy ${d.off >= 0 ? "+" : "−"} ${Math.abs(d.off)} phút.</div>`
      : `<div class="banner warn mb-3"><i class="fa-solid fa-triangle-exclamation"></i> Các mốc có nhãn “giờ máy” lấy từ ${esc(d.name)}. Chưa chắc giờ trên thiết bị này đúng: hãy đối chiếu với các nguồn giờ khác.</div>`)
    .join("");
}

// Diễn biến đã xảy ra theo đồng hồ, kèm giờ hiện tại
function worldHTML(game, c) {
  const done = eventsDone(game, c);
  const rows = done.length
    ? done.map((w) => `<div class="tl-row"><span class="tl-time">${esc(w.at)}</span><p class="text-sm">${esc(w.text)}</p></div>`).join("")
    : `<p class="text-ink-2 italic text-sm">Chưa có diễn biến nào. Đồng hồ đang chạy.</p>`;
  return `<h4 class="mt-2 mb-1">Diễn biến · đồng hồ ${clockAt(game, c)}</h4>${rows}`;
}

function timelineHTML(game, c) {
  const alibis = alibisOf(game, c);
  const events = timelineEvents(game, c);
  return `
    ${devicesNote(game, c)}
    ${worldHTML(game, c)}
    <p class="text-[13px] text-ink-2 mb-3 mt-4">Lời khai về nơi ở được đối chiếu với các mốc cùng giờ của chính người đó. Mốc có “chưa rõ là ai” sẽ được gắn khi bạn thu đủ hồ sơ liên quan.</p>
    <h4 class="mt-2 mb-1">Lời khai về nơi ở</h4>
    ${alibis.length ? alibis.map((a) => alibiHTML(c, a)).join("") : `<p class="text-ink-2 italic text-sm">Chưa có lời khai nào về nơi ở. Hỏi nghi phạm để nghe họ khai.</p>`}
    <h4 class="mt-4 mb-1">Mốc thời gian</h4>
    ${events.length ? events.map((e) => eventHTML(c, e)).join("") : `<p class="text-ink-2 italic text-sm">Chưa có mốc nào. Mốc xuất hiện khi bạn thu thập hồ sơ có ghi giờ.</p>`}`;
}

export function notebookHTML(game, c) {
  const tabs = [
    ["sus", "fa-user-secret", "Nghi phạm"],
    ["ho", "fa-folder-open", `Hồ sơ (${game.found.length})`]
  ];
  if (c.matrix) tabs.push(["mx", "fa-table-cells", "Đối chiếu"]);
  if (c.links) tabs.push(["lk", "fa-link", `Liên kết (${linksOf(game, c).length}/${c.links.length})`]);
  if (c.deduce) tabs.push(["dd", "fa-lightbulb", `Suy luận (${conclusionsOf(game, c).length}/${conclusionIds(c).length})`]);
  if (hasTimeline(c)) tabs.push(["tl", "fa-clock", "Thời gian"]);
  const bar = `<div class="flex gap-2 mb-4">${tabs
    .map(([k, ic, l]) => `<button class="tab${game.tab === k ? " on" : ""}" aria-pressed="${game.tab === k}" data-action="nb-tab" data-tab="${k}"><i class="fa-solid ${ic}"></i> ${l}</button>`)
    .join("")}</div>`;
  let content;
  if (game.tab === "sus") content = susHTML(game, c);
  else if (game.tab === "mx" && c.matrix) content = matrixHTML(game, c);
  else if (game.tab === "lk" && c.links) content = linksHTML(game, c);
  else if (game.tab === "dd" && c.deduce) content = deduceTabHTML(game, c);
  else if (game.tab === "tl" && hasTimeline(c)) content = timelineHTML(game, c);
  else content = cluesHTML(game, c);
  return bar + content;
}

/* ---------- Hộp thoại kiểu hồ sơ giấy ---------- */
const briefingExtra = (c) =>
  c.deduce
    ? `<p class="muted text-sm mt-2">Vụ này có thêm: tab <b>Suy luận</b> trong Sổ tay để ghép hồ sơ thành kết luận (kết luận mở ra điểm điều tra mới); một số thiết bị có <b>giờ máy lệch</b>; một số hồ sơ chỉ <b>về muộn</b> hoặc cần <b>mã số</b>; và phiên xét xử cần chỉ ra <b>nhiều người</b> cùng vai trò của từng người.</p>`
    : "";

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

export function verdictWinHTML(c, idx, wrong, save) {
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

export const helpHTML = () => `
  <h2>📖 Cách chơi</h2>
  <div class="expl">
    <p><b>Mục tiêu:</b> tìm đúng thủ phạm và viện dẫn đủ chứng cứ then chốt.</p>
    <p><b>Không gian điều tra:</b> mỗi cảnh là một thế giới rộng, phủ kín màn hình. Bốn góc có nút chức năng: ← quay về danh sách (trên trái), giờ và mạng (trên phải), Sổ tay (dưới trái), Buộc tội (dưới phải).</p>
    <p><b>Xem và di chuyển:</b> kéo màn hình, dùng mũi tên ◀ ▶ hoặc phím ← → để xem hai bên. Cửa có biển tên dẫn tới các địa điểm khác; đi qua cửa không tốn giờ.</p>
    <p><b>Điểm điều tra:</b> bấm vào các thẻ trên cảnh để hỏi cung, khám nghiệm hoặc tra cứu. Mỗi điểm thường tốn một giờ; điểm nào tốn nhiều hơn sẽ ghi rõ trên nhãn. Kết quả được lưu vào Hồ sơ.</p>
    <p><b>Giờ điều tra:</b> mỗi vụ có ngân sách giờ hữu hạn. Hãy cân nhắc việc nào cần làm trước.</p>
    <p><b>Đồng hồ và diễn biến:</b> giờ trên thanh đầu là giờ hiện tại của vụ án. Mỗi giờ điều tra là một giờ trôi qua, còn di chuyển thì không. Khi đồng hồ tới một mốc, một hồ sơ chưa thu có thể bị xóa hoặc một nghi phạm có thể rời khỏi thành phố. Diễn biến được báo ngay và ghi trong tab Thời gian của Sổ tay.</p>
    <p><b>Lời khai có thể dối:</b> đừng tin ngay. Hãy đối chiếu lời khai với camera, sổ sách và vật chứng.</p>
    <p><b>Đưa chứng cứ:</b> sau khi hỏi một người, mở Sổ tay ▸ Nghi phạm và bấm “Đưa chứng cứ” để đưa một hồ sơ cho họ xem. Mỗi lần tốn một giờ. Phản ứng có thể mở thêm một lời khai mới.</p>
    <p><b>Sổ tay:</b> gồm Nghi phạm (bấm thẻ để đánh dấu chưa rõ, nghi ngờ hoặc loại trừ; đây chỉ là ghi chú của bạn), Hồ sơ (mọi chứng cứ đã thu) và Đối chiếu nếu vụ có bảng này.</p>
    <p><b>Buộc tội:</b> chọn thủ phạm, rồi chứng minh ba bước (mỗi bước một hồ sơ làm chứng cứ). Sai thủ phạm hoặc sai một bước đều mất một mạng; bạn có ba mạng. Phản hồi sẽ nói rõ bước nào đúng, bước nào cần xem lại.</p>
    <p><b>Dấu vết trong bóng tối:</b> vài dấu vết không hiện ngay. Đưa đèn pin (con trỏ) quét qua vùng nghi ngờ; khi ánh sáng chạm tới, điểm đó sáng lên.</p>
    <p><b>Liên kết hồ sơ:</b> tab Liên kết trong Sổ tay. Chọn hai hồ sơ rồi bấm Đối chiếu. Đối chiếu không tốn giờ, nhưng chỉ cặp đúng mới ghi được một kết nối: mâu thuẫn trong lời khai, hoặc một quan hệ giữa các hồ sơ.</p>
    <p><b>Dòng thời gian:</b> tab Thời gian trong Sổ tay ghi các mốc giờ theo thứ tự và đối chiếu lời khai về nơi ở của từng người. “Bị bác” nghĩa là có chứng cứ đặt người đó ở nơi khác cùng giờ; “Được xác nhận” nghĩa là có chứng cứ đặt họ đúng nơi đã khai.</p>
    <p><b>Vùng phá án:</b> ở menu có hai vùng, Phố cổ Hà Nội và Sài Gòn. Mỗi vùng có các vụ riêng; vùng Sài Gòn dùng thêm các cơ chế dưới đây.</p>
    <p><b>Suy luận (Sài Gòn):</b> tab Suy luận trong Sổ tay. Chọn từ 2 đến 4 hồ sơ có liên quan tới nhau rồi bấm Suy luận. Chỉ đúng tập hồ sơ mới cho ra một kết luận, không tốn giờ. Kết luận cũng là hồ sơ nên ghép tiếp được với hồ sơ khác, và có kết luận mở ra điểm điều tra mới. Game chỉ xác nhận sự kiện, không bao giờ nói ai là thủ phạm: bước đó là của bạn.</p>
    <p><b>Giờ máy lệch:</b> không phải mọi đồng hồ đều đúng. Mốc nào lấy từ một thiết bị có thể sai giờ sẽ có nhãn “giờ máy” trong tab Thời gian. Hãy đối chiếu cùng một sự kiện giữa các nguồn giờ khác nhau; khi tìm ra độ lệch, mọi mốc của thiết bị đó tự được hiệu chỉnh và ngoại phạm của mọi người được so lại.</p>
    <p><b>Khóa mã và kết quả về muộn:</b> điểm có ổ khóa cần nhập mã bằng bàn phím số; sai ${LOCK_TRIES} lần thì thiết bị tự khóa và bạn mất ${LOCK_PENALTY} giờ. Hồ sơ có nhãn đồng hồ cát chỉ về sau một mốc giờ; bấm vào để chờ, và thời gian chờ cũng tính vào ngân sách giờ.</p>
    <p><b>Phiên xét xử nhiều người (Sài Gòn):</b> với vụ có nhiều người liên đới, bạn chọn người cho từng vai, một hồ sơ làm chứng cứ cho mỗi vai, và trả lời vài câu dựng lại sự việc. Kết luận có giá trị hơn hồ sơ gốc. Sai một phần nào cũng mất một mạng.</p>
    <p><b>Số sao:</b> ★★★ nếu kết tội đúng ngay lần đầu; ★★ nếu sai một lần; ★ nếu sai hai lần.</p>
  </div>
  <div class="row"><button class="btn" data-action="close">Đã hiểu</button></div>`;

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
