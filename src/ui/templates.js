/* =====================================================================
   Mẫu HTML thuần: nhận dữ liệu, trả về chuỗi. Không chạm DOM, không giữ trạng thái.
   Nút dùng data-action thay cho onclick; bộ điều khiển xử lý ủy quyền ở document.
   ===================================================================== */
import { CASES, TYPES } from "../data/cases.js";
import { ART } from "../art/art.js";
import { OX, WORLD_W, WORLD_H, DOOR_W } from "../world/layout.js";
import {
  isOpen, remainingAt, starsFor, allSolved, totalStars, isLocked, linksOf,
  CONFRONT_COST, questioned, confrontOptions, alibisOf, timelineEvents, hasTimeline,
  isGone, clockAt, eventsDone, departed
} from "../game/rules.js";
import { esc } from "./dom.js";

const pctX = (u) => ((u / WORLD_W) * 100).toFixed(3);
const pctY = (v) => ((v / WORLD_H) * 100).toFixed(3);
const portraitOf = (s) => ART.portrait(s.look, s.id);
const starsHTML = (n, max = 3) =>
  Array.from({ length: max }, (_, i) => `<span class="st${i < n ? "" : " dim"}">★</span>`).join("");

/* ---------- Màn hình chính ---------- */
export function menuHTML(save) {
  const cards = CASES.map((c, i) => {
    const locked = isLocked(save, i);
    const st = save.stars[c.id] || 0;
    const info = locked
      ? `<span class="text-ink-2"><i class="fa-solid fa-lock"></i> Hoàn thành vụ trước để mở</span>`
      : `<span class="inline-flex items-center gap-2">${starsHTML(st)}<span class="text-xs text-ink-2">${st ? "đã đạt" : "chưa khép hồ sơ"}</span></span>`;
    return `<button class="case-card${locked ? " locked" : ""}" ${locked ? "disabled" : `data-action="start" data-i="${i}"`}
        aria-label="Vụ ${c.no}: ${esc(c.title)}${locked ? ", đang khóa" : ""}">
      <span class="thumb">${ART.scene(c.locations[0].scene)}</span>
      <span class="block p-4 text-left">
        <span class="kicker block">Vụ ${c.no} · ${c.level}</span>
        <span class="block font-display text-xl mt-1">${esc(c.title)}</span>
        <span class="block text-xs text-ink-2 mt-1">${esc(c.place)}</span>
        <span class="block mt-3 text-sm">${info}</span>
      </span>
    </button>`;
  }).join("");

  const finale = allSolved(save, CASES)
    ? `<span class="glass rounded-full px-4 py-1.5 text-sm text-lamp-2"><i class="fa-solid fa-trophy"></i> Bạn đã khép lại cả ${CASES.length} vụ án · ${totalStars(save, CASES)}/${CASES.length * 3} ★</span>`
    : `<span class="text-xs text-ink-2">Chọn một vụ để bước vào hiện trường · tiến độ được lưu trên trình duyệt này</span>`;

  return `
    <div class="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 md:p-5">
      <div class="pointer-events-auto glass rounded-2xl px-4 py-3 max-w-[70vw]">
        <div class="font-display text-2xl md:text-4xl leading-none text-lamp-2">Hanoi Noir</div>
        <div class="text-xs md:text-sm text-ink-2 mt-1.5">Vụ án phố cổ · lắng nghe, kiểm chứng, chỉ ra đúng một kẻ thủ ác</div>
      </div>
      <div class="pointer-events-auto flex gap-2">
        <button class="btn btn-ghost" data-action="help" title="Cách chơi"><i class="fa-solid fa-circle-question"></i><span class="hidden sm:inline">Cách chơi</span></button>
        <button class="btn btn-ghost" data-action="reset-ask" title="Xoá tiến độ"><i class="fa-solid fa-rotate-left"></i><span class="hidden sm:inline">Xoá tiến độ</span></button>
      </div>
    </div>
    <div class="absolute inset-x-0 bottom-0 pt-24 pb-4 md:pb-7 bg-gradient-to-t from-[#070403] via-[#070403]/75 to-transparent">
      <div class="text-center mb-3 pointer-events-none">${finale}</div>
      <div id="menu-cards" class="pointer-events-auto flex gap-4 overflow-x-auto snap-x snap-mandatory px-5 pb-2 hscroll md:justify-center">${cards}</div>
    </div>`;
}

/* ---------- Thanh điều khiển màn điều tra (bốn góc) ---------- */
function hintHTML(game, c, L) {
  const left = remainingAt(game, c, L).length;
  if (game.hours <= 0 && !game.over) return `<i class="fa-solid fa-hourglass-end text-blood"></i> Hết giờ điều tra · hãy buộc tội`;
  const secret = L.hs.filter(([id, , , , flag]) => flag === "soi" && !game.done[id]).length;
  if (left) return `<i class="fa-solid fa-magnifying-glass text-lamp"></i> Còn <b>${left}</b> điểm điều tra tại đây${secret ? ` · <b>${secret}</b> dấu vết trong bóng tối` : ""}`;
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
          <div class="kicker text-[10px] md:text-[11px] whitespace-nowrap">Vụ ${c.no} · ${c.level}</div>
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
    .filter(([id]) => !isGone(game, c, id))
    .map(([id, x, y, lab, flag]) => {
      const a = c.actions.find((z) => z.id === id);
      const done = !!game.done[id];
      const open = isOpen(game, c, id);
      const state = done ? "is-done" : open ? "is-open" : "is-off";
      const icon = done ? "fa-check" : TYPES[a.type].icon;
      const cost = !done && a.cost > 1 ? ` · ${a.cost} giờ` : "";
      // Dấu vết ẩn: ẩn cho tới khi đèn pin quét tới (xem ui/flashlight.js); đã làm thì luôn hiện
      const secret = flag === "soi" ? ` is-secret${done ? " is-lit" : ""}` : "";
      return `<button class="hs ${state}${secret}" data-action="act" data-id="${id}" style="left:${pctX(OX + x)}%;top:${pctY(y)}%"
          ${open ? "" : "disabled"} aria-label="${esc(lab)}${done ? ", đã làm" : `, tốn ${a.cost} giờ`}">
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
      return `<button class="door door-${d.side}" style="left:${pctX(d.x + DOOR_W / 2)}%" data-action="go" data-loc="${d.loc}"
          aria-label="Đi tới ${esc(d.name)}">
        <span class="door-sign"><i class="fa-solid ${arrow}"></i><span class="min-w-0"><b>${esc(d.name)}</b><small>${esc(d.time)}</small></span></span>
      </button>`;
    })
    .join("");
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

function linksHTML(game, c) {
  const clues = game.found.slice().reverse().map((id) => c.actions.find((a) => a.id === id));
  const picks = clues.length
    ? clues
        .map((a) => {
          const on = game.pick.includes(a.id);
          return `<button class="lkc${on ? " on" : ""}" aria-pressed="${on}" data-action="lk-pick" data-id="${a.id}">
              <i class="fa-solid ${TYPES[a.type].icon}"></i><span>${esc(a.title)}</span></button>`;
        })
        .join("")
    : `<p class="italic text-sm">Chưa có hồ sơ nào để đối chiếu. Hãy thu thập hồ sơ trước.</p>`;
  const r = game.lkResult;
  const msg = !r
    ? ""
    : r.status === "none"
      ? `<p class="lkmsg">Hai hồ sơ này chưa cho thấy điều gì. Thử cặp khác.</p>`
      : r.status === "known"
        ? `<p class="lkmsg">Kết nối này đã có trong sổ tay.</p>`
        : `<p class="lkmsg ok">Kết nối mới đã được ghi lại.</p>`;
  const found = linksOf(game, c);
  return `
    <p class="text-[13px] text-ink-2 mb-3">Chọn hai hồ sơ rồi bấm Đối chiếu. Đối chiếu không tốn giờ, nhưng chỉ cặp đúng mới cho kết quả.</p>
    <div class="lkgrid">${picks}</div>
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

function eventHTML(c, e) {
  const who = e.who ? ` · <b>${esc(nameOf(c, e.who))}</b>` : e.pending ? ` · <i class="text-ink-2">Chưa rõ là ai</i>` : "";
  return `<div class="tl-row">
    <span class="tl-time">${esc(e.from)}–${esc(e.to)}</span>
    <div>
      <p class="text-sm">${esc(e.at)}${who}</p>
      <p class="text-xs text-ink-2">${esc(e.title)}</p>
    </div>
  </div>`;
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
  if (hasTimeline(c)) tabs.push(["tl", "fa-clock", "Thời gian"]);
  const bar = `<div class="flex gap-2 mb-4">${tabs
    .map(([k, ic, l]) => `<button class="tab${game.tab === k ? " on" : ""}" aria-pressed="${game.tab === k}" data-action="nb-tab" data-tab="${k}"><i class="fa-solid ${ic}"></i> ${l}</button>`)
    .join("")}</div>`;
  let content;
  if (game.tab === "sus") content = susHTML(game, c);
  else if (game.tab === "mx" && c.matrix) content = matrixHTML(game, c);
  else if (game.tab === "lk" && c.links) content = linksHTML(game, c);
  else if (game.tab === "tl" && hasTimeline(c)) content = timelineHTML(game, c);
  else content = cluesHTML(game, c);
  return bar + content;
}

/* ---------- Hộp thoại kiểu hồ sơ giấy ---------- */
export const briefingHTML = (c) => `
  <p class="text-xs tracking-[.16em] uppercase text-[#8a5a14]">Hồ sơ vụ ${c.no} · ${c.level}</p>
  <h2 class="mt-1">${esc(c.title)}</h2>
  <p class="muted text-sm">${esc(c.place)}</p>
  <div class="expl">${c.intro}</div>
  <p class="muted text-sm mt-3">Ngân sách: ${c.budget} giờ. Đồng hồ bắt đầu lúc ${c.clock.start}, và mỗi giờ điều tra là một giờ trôi qua; có việc sẽ không đợi bạn. Mỗi điểm điều tra tốn giờ, còn di chuyển giữa các địa điểm thì không. Kéo hoặc dùng mũi tên ◀ ▶ ở mép màn hình để xem hai bên.</p>
  <div class="row"><button class="btn" data-action="close"><i class="fa-solid fa-magnifying-glass"></i> Bắt đầu điều tra</button></div>`;

export function accuseHTML(game, c, acc) {
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

export function verdictWinHTML(c, idx, wrong, save) {
  const st = starsFor(wrong);
  const next = idx + 1 < CASES.length
    ? `<button class="btn" data-action="start" data-i="${idx + 1}"><i class="fa-solid fa-forward"></i> Vụ tiếp theo</button>`
    : "";
  const finale = allSolved(save, CASES)
    ? `<div class="banner"><i class="fa-solid fa-trophy"></i> Bạn đã khép lại cả ${CASES.length} vụ án, đạt ${totalStars(save, CASES)}/${CASES.length * 3} ★.</div>`
    : "";
  return `<div>
    <h2>🏆 Công lý đã được thực thi</h2>
    <div class="big">${starsHTML(st)}</div>
    <p>Thủ phạm: <b>${esc(c.suspects.find((s) => s.id === c.culprit).name)}</b></p>
    <div class="expl">${c.explanation}</div>
    ${finale}
    <div class="row">${next}<button class="btn btn-ghost" data-action="menu">Về danh sách vụ án</button></div>
  </div>`;
}

export const verdictLoseHTML = (c, idx) => `<div>
  <h2>📕 Hồ sơ đóng lại</h2>
  <p>Bạn đã dùng hết ba mạng. Đây là lời giải của vụ án.</p>
  <p class="mt-1.5">Thủ phạm: <b>${esc(c.suspects.find((s) => s.id === c.culprit).name)}</b></p>
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
    <p><b>Số sao:</b> ★★★ nếu kết tội đúng ngay lần đầu; ★★ nếu sai một lần; ★ nếu sai hai lần.</p>
  </div>
  <div class="row"><button class="btn" data-action="close">Đã hiểu</button></div>`;

export const resetHTML = () => `
  <h2>Xoá toàn bộ tiến độ?</h2>
  <p class="muted">${CASES.length} vụ sẽ bị khóa lại từ vụ 1 và số sao sẽ mất.</p>
  <div class="row"><button class="btn btn-ghost" data-action="close">Huỷ</button><button class="btn btn-blood" data-action="reset-confirm">Xoá tiến độ</button></div>`;

export { starsHTML };
