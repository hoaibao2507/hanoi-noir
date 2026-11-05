/* =====================================================================
   Sổ tay điều tra, viết bằng Preact (htm, không cần bước biên dịch JSX).
   Phần giao diện cục bộ (từ khóa tìm, loại đang lọc, ô ghi chú đang mở) là state của component, nên gõ chữ
   không phải "vẽ lại im lặng" và focus không bao giờ bị thay mất. Mọi thay đổi ảnh hưởng ván chơi vẫn đi qua
   data-action -> app.js -> rules.js như cũ; ghi chú báo lên qua onNote.
   Component thuần hiển thị: không đọc store, không tự tính luật (chỉ gọi các hàm đọc của rules.js).
   ===================================================================== */
import { h, render } from "preact";
import { useState, useRef, useLayoutEffect } from "preact/hooks";
import htm from "htm";
import { icon } from "@fortawesome/fontawesome-svg-core";
import "./icon-lib.js";
import { TYPES } from "../data/cases.js";
import { ART } from "../art/art.js";
import {
  linksOf, alibisOf, timelineEvents, hasTimeline, clockAt, eventsDone, departed, unlocksOf,
  questioned, confrontOptions, MAX_DEDUCE, MAX_NOTE, noteKey, filterClues, actionOf
} from "../game/rules.js";
import { syncPinboard } from "./pinboard.js";

const html = htm.bind(h);
const cx = (...a) => a.filter(Boolean).join(" ");

/* ---------- Đồ nghề nhỏ ---------- */
// Biểu tượng Font Awesome thành phần tử SVG thật của Preact (n = tên không có "fa-", r = bộ regular)
const toVNode = (n) => h(n.tag, n.attributes, ...(n.children || []).map(toVNode));
export function Icon({ n, r }) {
  const def = icon({ prefix: r ? "far" : "fas", iconName: n });
  return def ? toVNode(def.abstract[0]) : null;
}
const TypeIcon = ({ t }) => html`<${Icon} n=${t.icon.slice(3)} />`;

// Chuỗi SVG sinh bằng code (chân dung, hình chứng cứ). display:contents để SVG vẫn là phần tử con trực tiếp của bố cục
const Raw = ({ markup }) => h("span", { style: "display:contents", dangerouslySetInnerHTML: { __html: markup } });

// Hình chứng cứ có thể chứa id duy nhất theo mỗi lần sinh: nhớ chuỗi theo hồ sơ để không phải gán lại DOM mỗi lần vẽ
const evCache = new WeakMap();
function evidenceOf(v) {
  if (!evCache.has(v)) evCache.set(v, ART.evidence(v));
  return evCache.get(v);
}

const Portrait = ({ s }) => html`<${Raw} markup=${ART.portrait(s.look, s.id)} />`;
const nameOf = (c, id) => c.suspects.find((s) => s.id === id).name;
const placeOf = (c, id) => (c.locations.find((L) => L.hs.some((x) => x[0] === id)) || {}).name || "";

/* ---------- Ghi chú ---------- */
// Có chữ, hoặc người chơi vừa bấm mở thì hiện ô soạn; chưa thì chỉ có nút nhỏ. Bản nháp giữ trong component,
// nên xóa hết chữ cũng không làm ô biến mất giữa lúc đang gõ
function Note({ game, k, label, ctx }) {
  const saved = (game.notes || {})[k] || "";
  const [draft, setDraft] = useState(saved);
  const [shown, setShown] = useState(() => !!saved || ctx.open.has(k));
  const box = useRef(null);
  // Layout effect: focus ngay khi DOM vừa gắn, không chờ sau lượt vẽ (nút vừa bấm đã bị thay bằng ô soạn)
  useLayoutEffect(() => {
    if (ctx.focus.current === k && box.current) {
      ctx.focus.current = null;
      box.current.focus({ preventScroll: true });
    }
  }, [shown]);
  if (!shown) {
    const open = () => {
      ctx.open.add(k);
      ctx.focus.current = k;
      setShown(true);
    };
    return html`<button class="mark note-add" onClick=${open} aria-label=${`Thêm ghi chú cho ${label}`}><${Icon} n="pen" /> Ghi chú</button>`;
  }
  const type = (e) => {
    setDraft(e.target.value);
    ctx.onNote(k, e.target.value);
  };
  return html`<label class="note"><span class="note-l"><${Icon} n="pen" /> Ghi chú của bạn</span>
    <textarea ref=${box} data-note=${k} rows="2" maxlength=${MAX_NOTE} placeholder="Ghi điều bạn nghĩ, chỉ bạn thấy…"
      aria-label=${`Ghi chú cho ${label}`} value=${draft} onInput=${type}></textarea></label>`;
}

/* ---------- Tab Nghi phạm ---------- */
const isMistake = (kind) => kind === "mâu thuẫn";
const MARK_LABELS = ["Chưa rõ", "Nghi ngờ", "Loại trừ"];
const MARK_ICONS = ["circle-question", "triangle-exclamation", "circle-xmark"];

// Nhãn ngắn trên thẻ nghi phạm: các kết nối đã tìm nói về người này
function LinkTags({ game, c, sid }) {
  return linksOf(game, c)
    .filter((l) => l.about === sid)
    .map((l) => html`<span class=${cx("ltag", isMistake(l.kind) ? "k-mt" : "k-lh")}><${Icon} n=${isMistake(l.kind) ? "triangle-exclamation" : "link"} /> ${l.kind}</span>`);
}

// Nút đưa chứng cứ chỉ hiện với người đã bị hỏi; hết hồ sơ để đưa thì nút tắt
function ConfrontButton({ game, c, s }) {
  if (!questioned(game, c, s.id)) return null;
  const n = confrontOptions(game, c, s.id).length;
  return html`<button class="mark confront" data-action="confront-open" data-who=${s.id} disabled=${!n} aria-label=${`Đưa chứng cứ cho ${s.name}`}>
    <${Icon} n="file-lines" /> Đưa chứng cứ${n ? ` (${n})` : ""}</button>`;
}

function Suspects({ game, c, ctx }) {
  return c.suspects.map((s) => {
    const m = game.marks[s.id];
    return html`<div class=${`sus m${m}`} key=${s.id}>
      <${Portrait} s=${s} />
      <div class="min-w-0">
        <h4 class="text-base">${s.name}</h4>
        <small class="text-ink-2 text-xs">${s.role}</small>${departed(game, c, s.id) && html`<span class="ltag k-mt">Đã rời đi</span>`}
        <p class="text-[13px] text-ink-2 leading-snug mt-1 mb-2">${s.bio}</p>
        <${LinkTags} game=${game} c=${c} sid=${s.id} />
        <button class=${`mark m${m}`} data-action="mark" data-id=${s.id} aria-label=${`Đánh dấu ${s.name}: ${MARK_LABELS[m]}`}>
          <${Icon} n=${MARK_ICONS[m]} /> ${MARK_LABELS[m]}</button>
        <${ConfrontButton} game=${game} c=${c} s=${s} />
        <${Note} game=${game} k=${noteKey("s", s.id)} label=${s.name} ctx=${ctx} />
      </div>
    </div>`;
  });
}

/* ---------- Tab Hồ sơ: tìm, lọc theo loại, đánh dấu sao, ghi chú ---------- */
const isFiltering = (f) => !!((f.q || "").trim() || f.type || f.fav);

export function findCountText(game, c, f = {}) {
  const n = filterClues(game, c, f).length;
  return isFiltering(f) ? `Hiện ${n}/${game.found.length} hồ sơ` : `${game.found.length} hồ sơ`;
}

function Visual({ c, a }) {
  const v = a.visual;
  if (v.k === "who") {
    const s = c.suspects.find((x) => x.id === v.id);
    return html`<div class="who flex items-center gap-3 mb-3"><${Portrait} s=${s} /><span class="text-sm text-ink-2">${s.name} · ${s.role}</span></div>`;
  }
  return html`<div class="vis"><${Raw} markup=${evidenceOf(v)} /></div>`;
}

function ClueCard({ game, c, f, id, ctx }) {
  const a = actionOf(c, id);
  const t = TYPES[a.type];
  const fav = !!(game.fav || {})[id];
  // Đang lọc thì bỏ hiệu ứng nổi lên: danh sách đổi theo từng phím gõ, hiệu ứng sẽ nhấp nháy
  return html`<article class=${cx("clue", `tone-${t.cls}`, isFiltering(f) && "no-rise")}>
    <div class="flex items-center justify-between gap-2">
      <div class="text-xs text-ink-2 flex items-center gap-2"><${TypeIcon} t=${t} />${a.type}</div>
      <button class=${cx("fav", fav && "on")} data-action="fav" data-id=${id} aria-pressed=${fav}
        aria-label=${`Đánh dấu hồ sơ ${a.title}`} title=${fav ? "Bỏ đánh dấu" : "Đánh dấu hồ sơ quan trọng"}><${Icon} n="star" r=${!fav} /></button>
    </div>
    <${Visual} c=${c} a=${a} />
    <h4 class="text-[15px] mt-1 mb-1">${a.title}</h4>
    <p class="text-[13.5px] leading-relaxed">${a.text}</p>
    <div class="mt-2"><${Note} game=${game} k=${noteKey("a", id)} label=${a.title} ctx=${ctx} /></div>
  </article>`;
}

export function ClueList({ game, c, f, ctx }) {
  const ids = filterClues(game, c, f);
  if (!ids.length) {
    return html`<p class="text-ink-2 italic text-sm">Không có hồ sơ nào khớp. <button class="mark" onClick=${ctx.clear}>Xóa bộ lọc</button></p>`;
  }
  return ids.map((id) => html`<${ClueCard} key=${id} game=${game} c=${c} f=${f} id=${id} ctx=${ctx} />`);
}

const Chip = ({ on, disabled, onClick, children }) =>
  html`<button class=${cx("chip", on && "on")} aria-pressed=${on} disabled=${disabled} onClick=${onClick}>${children}</button>`;

function Finder({ game, c, f, ctx }) {
  const kinds = Object.keys(TYPES).filter((k) => game.found.some((id) => actionOf(c, id).type === k));
  const count = (k) => game.found.filter((id) => actionOf(c, id).type === k).length;
  const favs = game.found.filter((id) => (game.fav || {})[id]).length;
  return html`<div class="finder">
    <label class="find"><${Icon} n="magnifying-glass" />
      <input type="search" data-find="" value=${f.q} onInput=${(e) => ctx.patch({ q: e.target.value })}
        placeholder="Tìm hồ sơ, tên người, từ khóa…" aria-label="Tìm trong hồ sơ" autocomplete="off" spellcheck=${false} /></label>
    <div class="chips">
      <${Chip} on=${!f.type} onClick=${() => ctx.patch({ type: "" })}>Tất cả<//>
      ${kinds.map((k) => html`<${Chip} key=${k} on=${f.type === k} onClick=${() => ctx.patch({ type: k })}>${`${k} (${count(k)})`}<//>`)}
      <${Chip} on=${f.fav} disabled=${!(favs || f.fav)} onClick=${() => ctx.patch({ fav: !f.fav })}><${Icon} n="star" /> ${`Đã đánh dấu (${favs})`}<//>
    </div>
    <p class="find-n" data-find-n="" role="status">${findCountText(game, c, f)}</p>
  </div>`;
}

function Clues({ game, c, ctx }) {
  if (!game.found.length) {
    return html`<p class="text-ink-2 italic text-sm">Chưa có hồ sơ nào. Hãy đến từng địa điểm và bấm vào các điểm điều tra trên cảnh.</p>`;
  }
  return html`<${Finder} game=${game} c=${c} f=${ctx.f} ctx=${ctx} />
    <div data-clues=""><${ClueList} game=${game} c=${c} f=${ctx.f} ctx=${ctx} /></div>`;
}

/* ---------- Tab Đối chiếu (ma trận) ---------- */
function Matrix({ game, c }) {
  const m = c.matrix;
  return html`<p class="text-[13px] text-ink-2 mb-3">Giả sử từng người là thủ phạm, lời khai của mỗi người đúng (✓) hay sai (✗)? Bấm ô để đổi. Lời khai chỉ mở sau khi bạn nghe. Đếm số ✓ rồi đối chiếu với biên bản.</p>
    <div class="mxwrap"><table class="mxt">
      <thead><tr><th class="text-left px-2">Nếu thủ phạm là</th>${m.cols.map((col) =>
        html`<th class="px-1 py-1.5 font-semibold whitespace-nowrap">${game.done[col.act] ? `Lời ${col.label}` : html`<${Icon} n="lock" /> ${col.label}`}</th>`)}<th>Số ✓</th></tr></thead>
      <tbody>${m.rows.map((rid) => {
        const s = c.suspects.find((x) => x.id === rid);
        const vals = m.cols.map((col) => game.mx[rid + "|" + col.act] || 0);
        return html`<tr key=${rid}><th class="text-left px-2 whitespace-nowrap">${s.name}</th>${m.cols.map((col, i) =>
          html`<td class="p-1"><button class=${`mx v${vals[i]}`} disabled=${!game.done[col.act]} data-action="mx" data-rid=${rid} data-act=${col.act}
            aria-label=${`Nếu ${s.name} là thủ phạm, lời ${col.label} đúng hay sai`}>${["·", "✓", "✗"][vals[i]]}</button></td>`)}<td class="tot">${vals.filter((v) => v === 1).length}</td></tr>`;
      })}</tbody></table></div>`;
}

/* ---------- Tab Liên kết (bảng ghim) ---------- */
// Độ nghiêng ổn định của mỗi tấm ghim (cùng một hồ sơ luôn nghiêng như nhau)
const tiltOf = (id) => ([...id].reduce((n, ch) => n + ch.charCodeAt(0), 0) % 7 - 3) * 0.9;

function Pin({ game, c, a }) {
  const on = game.pick.includes(a.id);
  const t = TYPES[a.type];
  return html`<button class=${cx("pin", `tone-${t.cls}`, on && "on")} aria-pressed=${on} data-action="lk-pick" data-id=${a.id} data-pin=${a.id} style=${`--tilt:${tiltOf(a.id)}deg`}>
    <span class="pin-nail"></span>
    ${a.visual && a.visual.k === "who"
      ? html`<span class="pin-face"><${Portrait} s=${c.suspects.find((x) => x.id === a.visual.id)} /></span>`
      : html`<span class="pin-icon"><${TypeIcon} t=${t} /></span>`}
    <span class="pin-title">${a.title}</span></button>`;
}

function LinkCard({ c, l }) {
  const who = c.suspects.find((s) => s.id === l.about);
  return html`<article class=${cx("linkc", isMistake(l.kind) ? "k-mt" : "k-lh")}>
    <div class="text-xs text-ink-2 flex items-center gap-2"><${Icon} n=${isMistake(l.kind) ? "triangle-exclamation" : "link"} />${l.kind}${who ? ` · về ${who.name}` : ""}</div>
    <p class="text-[13.5px] leading-relaxed mt-1">${l.text}</p>
  </article>`;
}

function Links({ game, c }) {
  const clues = game.found.slice().reverse().map((id) => c.actions.find((a) => a.id === id));
  const found = linksOf(game, c);
  const threads = found.map((l) => [l.a, l.b, isMistake(l.kind) ? "mt" : "lh"]);
  const r = game.lkResult;
  const msg = !r ? null
    : r.status === "none" ? html`<p class="lkmsg">Hai hồ sơ này chưa cho thấy điều gì. Thử cặp khác.</p>`
    : r.status === "known" ? html`<p class="lkmsg">Kết nối này đã có trong sổ tay.</p>`
    : html`<p class="lkmsg ok">Kết nối mới đã được ghi lại.</p>`;
  return html`<p class="text-[13px] text-ink-2 mb-3">Kéo một hồ sơ thả lên hồ sơ khác để nối bằng sợi chỉ, hoặc bấm chọn hai hồ sơ rồi bấm Đối chiếu. Đối chiếu không tốn giờ, nhưng chỉ cặp đúng mới giữ được sợi chỉ.</p>
    ${clues.length
      ? html`<div class="pinboard" data-board="" data-threads=${JSON.stringify(threads)}>
          <svg class="threads" aria-hidden="true"></svg>
          <div class="pins">${clues.map((a) => html`<${Pin} key=${a.id} game=${game} c=${c} a=${a} />`)}</div>
        </div>`
      : html`<p class="italic text-sm">Chưa có hồ sơ nào để đối chiếu. Hãy thu thập hồ sơ trước.</p>`}
    <div class="row mt-3"><button class="btn" data-action="lk-check" disabled=${game.pick.length !== 2}><${Icon} n="link" /> Đối chiếu</button></div>
    ${msg}
    <h4 class="mt-4 mb-2">${`Kết nối đã tìm: ${found.length}/${c.links.length}`}</h4>
    ${found.length ? found.map((l) => html`<${LinkCard} key=${l.a + l.b} c=${c} l=${l} />`) : html`<p class="text-ink-2 italic text-sm">Chưa có kết nối nào.</p>`}`;
}

/* ---------- Tab Suy luận ---------- */
const conclusionIds = (c) => [...new Set(c.deduce.map((d) => d.gives))];
const conclusionsOf = (game, c) => conclusionIds(c).filter((id) => game.done[id]);

// Những gì một kết luận đã mở ra: điểm điều tra mới và thiết bị được hiệu chỉnh
function Effects({ c, id }) {
  const { spots, devs } = unlocksOf(c, id);
  return [
    ...spots.map((a) => html`<div class="banner mt-2"><${Icon} n="lock-open" /> Đã mở điểm điều tra: <b>${a.title}</b> · ${placeOf(c, a.id)}</div>`),
    ...devs.map((d) => html`<div class="banner mt-2"><${Icon} r n="clock" /> Giờ ${d.name} đã được hiệu chỉnh trong tab Thời gian.</div>`)
  ];
}

function Conclusion({ game, c, id }) {
  const a = c.actions.find((x) => x.id === id);
  const from = (game.ddFrom || {})[id];
  const names = from ? from.map((n) => c.actions.find((x) => x.id === n).title).join(" + ") : "";
  return html`<article class="clue tone-kl">
    <div class="text-xs text-ink-2 flex items-center gap-2"><${Icon} n="lightbulb" />Kết luận</div>
    <h4 class="text-[15px] mt-1 mb-1">${a.title}</h4>
    <p class="text-[13.5px] leading-relaxed">${a.text}</p>
    ${names && html`<p class="text-xs text-ink-2 mt-2">${`Rút ra từ: ${names}`}</p>`}
    <${Effects} c=${c} id=${id} />
  </article>`;
}

function Deduce({ game, c }) {
  const items = game.found.slice().reverse().map((id) => c.actions.find((a) => a.id === id));
  const r = game.ddResult;
  const msg = !r ? null
    : r.status === "none" ? html`<p class="lkmsg">Những hồ sơ này chưa cho ra kết luận nào. Có thể thiếu một hồ sơ, thừa một hồ sơ, hoặc chúng chưa liên quan tới nhau.</p>`
    : r.status === "known" ? html`<p class="lkmsg">Kết luận này đã có trong sổ tay.</p>`
    : html`<p class="lkmsg ok">Kết luận mới đã được ghi lại.</p>`;
  const done = conclusionsOf(game, c);
  const chosen = game.dpick.map((id) => c.actions.find((a) => a.id === id).title);
  return html`<p class="text-[13px] text-ink-2 mb-3">${`Chọn từ 2 đến ${MAX_DEDUCE} hồ sơ có liên quan tới nhau rồi bấm Suy luận. Chỉ đúng tập hồ sơ mới cho ra kết luận; thừa hay thiếu một hồ sơ đều không được. Suy luận không tốn giờ. Kết luận cũng là hồ sơ, nên ghép tiếp được với hồ sơ khác, và có kết luận mở ra điểm điều tra mới.`}</p>
    <div class="lkgrid">${items.length
      ? items.map((a) => {
          const on = game.dpick.includes(a.id);
          return html`<button key=${a.id} class=${cx("lkc", on && "on", a.via === "deduce" && "is-k")} aria-pressed=${on} data-action="dd-pick" data-id=${a.id}>
            <${TypeIcon} t=${TYPES[a.type]} /><span>${a.title}</span></button>`;
        })
      : html`<p class="italic text-sm">Chưa có hồ sơ nào để ghép. Hãy thu thập hồ sơ trước.</p>`}</div>
    <p class="text-xs text-ink-2 mt-3">${chosen.length ? `Đang chọn (${chosen.length}): ${chosen.join(" + ")}` : "Chưa chọn hồ sơ nào."}</p>
    <div class="row mt-3">
      <button class="btn btn-ghost" data-action="dd-clear" disabled=${!chosen.length}>Bỏ chọn</button>
      <button class="btn" data-action="dd-try" disabled=${game.dpick.length < 2}><${Icon} n="lightbulb" /> Suy luận</button>
    </div>
    ${msg}
    ${game.ddTries ? html`<p class="text-xs text-ink-2 mt-1">${`Đã thử chưa ra: ${game.ddTries} lần`}</p>` : null}
    <h4 class="mt-4 mb-2">${`Kết luận đã rút ra: ${done.length}/${conclusionIds(c).length}`}</h4>
    ${done.length ? done.map((id) => html`<${Conclusion} key=${id} game=${game} c=${c} id=${id} />`) : html`<p class="text-ink-2 italic text-sm">Chưa có kết luận nào.</p>`}`;
}

/* ---------- Tab Thời gian ---------- */
// Nhãn và màu cho từng kết quả đối chiếu lời khai về nơi ở
const ALIBI_STATUS = {
  clash: { cls: "k-mt", icon: "triangle-exclamation", label: "Bị bác" },
  proof: { cls: "k-lh", icon: "circle-check", label: "Được xác nhận" },
  open: { cls: "", icon: "circle-question", label: "Chưa có chứng cứ" }
};

function Alibi({ c, a }) {
  const st = ALIBI_STATUS[a.status];
  return html`<div class=${cx("linkc", st.cls)}>
    <p class="text-sm"><b>${nameOf(c, a.who)}</b> khai ở <b>${a.at}</b>${`, ${a.from}–${a.to}`}</p>
    <p class="text-xs text-ink-2 mt-0.5">${`Từ hồ sơ “${a.title}”`}</p>
    <span class=${cx("ltag", st.cls)}><${Icon} n=${st.icon} /> ${st.label}</span>
    ${a.by && html`<p class="text-sm text-ink-2 mt-1">${`${a.status === "clash" ? "Mâu thuẫn với" : "Xác nhận bởi"}: ${a.by.title}, ${a.by.from}–${a.by.to} tại ${a.by.at}`}</p>`}
  </div>`;
}

// Mốc lấy từ thiết bị lệch giờ: chưa hiệu chỉnh thì cảnh báo, đã hiệu chỉnh thì ghi giờ máy gốc
const DevBadge = ({ e }) => !e.dev ? null : e.dev.fixed
  ? html`<span class="ltag k-lh"><${Icon} r n="clock" /> ${`đã hiệu chỉnh · giờ máy ${e.dev.rawFrom}–${e.dev.rawTo}`}</span>`
  : html`<span class="ltag k-mt"><${Icon} r n="clock" /> ${`giờ máy ${e.dev.name} · chưa hiệu chỉnh`}</span>`;

function TimelineEvent({ c, e }) {
  const who = e.who ? html` · <b>${nameOf(c, e.who)}</b>` : e.pending ? html` · <i class="text-ink-2">Chưa rõ là ai</i>` : null;
  return html`<div class=${cx("tl-row", e.dev && !e.dev.fixed && "raw")}>
    <span class="tl-time">${`${e.from}–${e.to}`}</span>
    <div>
      <p class="text-sm">${e.at}${who}</p>
      <p class="text-xs text-ink-2">${e.title}</p>
      <${DevBadge} e=${e} />
    </div>
  </div>`;
}

// Độ lệch giờ máy: tròn giờ thì ghi bằng giờ (múi giờ), còn lại ghi bằng phút
const offLabel = (off) => {
  const a = Math.abs(off);
  return a >= 60 && a % 60 === 0 ? `${a / 60} giờ` : `${a} phút`;
};

function DevicesNote({ game, c }) {
  return Object.values(c.devices || {}).map((d) => game.done[d.by]
    ? html`<div class="banner mb-3"><${Icon} r n="clock" /> ${`Giờ ${d.name} đã được hiệu chỉnh: giờ thật = giờ máy ${d.off >= 0 ? "+" : "−"} ${offLabel(d.off)}.`}</div>`
    : html`<div class="banner warn mb-3"><${Icon} n="triangle-exclamation" /> ${`Các mốc có nhãn “giờ máy” lấy từ ${d.name}. Chưa chắc giờ trên thiết bị này đúng: hãy đối chiếu với các nguồn giờ khác.`}</div>`);
}

function Timeline({ game, c }) {
  const alibis = alibisOf(game, c);
  const events = timelineEvents(game, c);
  const world = eventsDone(game, c);
  return html`<${DevicesNote} game=${game} c=${c} />
    <h4 class="mt-2 mb-1">${`Diễn biến · đồng hồ ${clockAt(game, c)}`}</h4>
    ${world.length
      ? world.map((w) => html`<div class="tl-row"><span class="tl-time">${w.at}</span><p class="text-sm">${w.text}</p></div>`)
      : html`<p class="text-ink-2 italic text-sm">Chưa có diễn biến nào. Đồng hồ đang chạy.</p>`}
    <p class="text-[13px] text-ink-2 mb-3 mt-4">Lời khai về nơi ở được đối chiếu với các mốc cùng giờ của chính người đó. Mốc có “chưa rõ là ai” sẽ được gắn khi bạn thu đủ hồ sơ liên quan.</p>
    <h4 class="mt-2 mb-1">Lời khai về nơi ở</h4>
    ${alibis.length ? alibis.map((a) => html`<${Alibi} c=${c} a=${a} />`) : html`<p class="text-ink-2 italic text-sm">Chưa có lời khai nào về nơi ở. Hỏi nghi phạm để nghe họ khai.</p>`}
    <h4 class="mt-4 mb-1">Mốc thời gian</h4>
    ${events.length ? events.map((e) => html`<${TimelineEvent} c=${c} e=${e} />`) : html`<p class="text-ink-2 italic text-sm">Chưa có mốc nào. Mốc xuất hiện khi bạn thu thập hồ sơ có ghi giờ.</p>`}`;
}

/* ---------- Sổ tay ---------- */
const noop = () => {};

// ui = trạng thái giao diện ban đầu { q, type, fav, open }; sau đó component tự giữ. Đổi `key` để đặt lại (vào vụ khác)
export function Notebook({ game, c, ui = {}, onNote = noop }) {
  const [f, setF] = useState(() => ({ q: ui.q || "", type: ui.type || "", fav: !!ui.fav }));
  const open = useRef(null);
  if (!open.current) open.current = new Set(ui.open || []);
  const focus = useRef(null);
  const root = useRef(null);
  // Sợi chỉ của bảng ghim là SVG vẽ bằng tay (pinboard.js): vẽ lại sau mỗi lần component cập nhật
  useLayoutEffect(() => {
    if (root.current) syncPinboard(root.current);
  });

  const ctx = {
    f, onNote, focus, open: open.current,
    patch: (p) => setF((s) => ({ ...s, ...p })),
    clear: () => setF({ q: "", type: "", fav: false })
  };
  const tabs = [
    ["sus", "user-secret", "Nghi phạm"],
    ["ho", "folder-open", `Hồ sơ (${game.found.length})`]
  ];
  if (c.matrix) tabs.push(["mx", "table-cells", "Đối chiếu"]);
  if (c.links) tabs.push(["lk", "link", `Liên kết (${linksOf(game, c).length}/${c.links.length})`]);
  if (c.deduce) tabs.push(["dd", "lightbulb", `Suy luận (${conclusionsOf(game, c).length}/${conclusionIds(c).length})`]);
  if (hasTimeline(c)) tabs.push(["tl", "clock", "Thời gian"]);

  let body;
  if (game.tab === "sus") body = html`<${Suspects} game=${game} c=${c} ctx=${ctx} />`;
  else if (game.tab === "mx" && c.matrix) body = html`<${Matrix} game=${game} c=${c} />`;
  else if (game.tab === "lk" && c.links) body = html`<${Links} game=${game} c=${c} />`;
  else if (game.tab === "dd" && c.deduce) body = html`<${Deduce} game=${game} c=${c} />`;
  else if (game.tab === "tl" && hasTimeline(c)) body = html`<${Timeline} game=${game} c=${c} />`;
  else body = html`<${Clues} game=${game} c=${c} ctx=${ctx} />`;

  return html`<div ref=${root} style="display:contents">
    <div class="flex gap-2 mb-4">${tabs.map(([k, ic, l]) =>
      html`<button key=${k} class=${cx("tab", game.tab === k && "on")} aria-pressed=${game.tab === k} data-action="nb-tab" data-tab=${k}><${Icon} r=${k === "tl"} n=${ic} /> ${l}</button>`)}</div>
    ${body}
  </div>`;
}

/* ---------- Gắn vào trang ---------- */
export const mountNotebook = (el, props) => render(h(Notebook, props), el);
export const unmountNotebook = (el) => render(null, el);
