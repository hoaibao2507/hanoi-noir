/* =====================================================================
   Trang xem cảnh cho tác giả vụ án (npm run scenes → /tools/scenes.html).
   Dựng thẳng SVG của từng cảnh ở khung thế giới 2400 × 900, kèm chấm vị trí các điểm điều tra, nên không phải chờ chuyển cảnh trong game.
   Tham số URL:  ?case=s3          vụ cần xem (mặc định: vụ cuối)
                 &k=sg_btx_hall     chỉ một cảnh
                 &ev=1              thêm bộ sưu tập khung camera và giấy tờ của vụ
                 &labels=0          ẩn nhãn mã hành động cạnh chấm
   Chấm vàng: điểm điều tra thường; chấm xanh nét đứt: dấu vết ẩn ("soi"). Đường hồng: mép khung cảnh gốc 1600 (hai bên là phần mở rộng).
   Trang không nằm trong bản build (chỉ index.html được đóng gói).
   ===================================================================== */
import "../src/styles/fonts.css";
import { ART } from "../src/art/art.js";
import { CASES } from "../src/data/cases.js";
import { OX, WORLD_W, COMP_W } from "../src/world/layout.js";

const q = new URLSearchParams(location.search);
const c = CASES.find((x) => x.id === q.get("case")) || CASES[CASES.length - 1];
const only = q.get("k");
const showLabels = q.get("labels") !== "0";
const link = (params) => { const p = new URLSearchParams({ case: c.id, ...params }); return `?${p}`; };

// Thanh điều hướng: chọn vụ, chọn cảnh, bật bộ sưu tập
const nav = document.getElementById("nav");
nav.innerHTML = [
  "<b>Vụ:</b>",
  ...CASES.map((x) => `<a href="?case=${x.id}" class="${x.id === c.id ? "on" : ""}">${x.id}</a>`),
  "<b>Cảnh:</b>",
  `<a href="${link({})}" class="${!only && !q.get("ev") ? "on" : ""}">tất cả</a>`,
  ...[...new Set(c.locations.map((L) => L.scene))].map((s) => `<a href="${link({ k: s })}" class="${only === s ? "on" : ""}">${s}</a>`),
  `<a href="${link({ ev: 1 })}" class="${q.get("ev") ? "on" : ""}">chứng cứ (camera, giấy tờ)</a>`
].join(" ");

const main = document.getElementById("main");
const pct = (v, total) => `${((v / total) * 100).toFixed(3)}%`;

if (q.get("ev")) {
  const items = c.actions.filter((a) => a.visual && a.visual.k !== "who");
  main.innerHTML = `<div class="note">${c.title}: ${items.length} hình chứng cứ (camera trước, rồi giấy tờ)</div><div class="grid">` +
    items.sort((a, b) => (b.visual.k === "cam") - (a.visual.k === "cam"))
      .map((a) => `<div class="ev"><small>${a.id} · ${a.type}</small>${ART.evidence(a.visual)}</div>`).join("") + "</div>";
} else {
  const seen = new Set();
  const parts = [];
  for (const L of c.locations) {
    if (only && only !== L.scene) continue;
    const dup = seen.has(L.scene);
    seen.add(L.scene);
    const dots = L.hs.map(([id, x, y, label, flag]) =>
      `<div class="hs${flag === "soi" ? " soi" : ""}" style="left:${pct(x + OX, WORLD_W)};top:${pct(y, 900)}" title="${label}">${showLabels ? `<span>${id}</span>` : ""}</div>`).join("");
    const seams = `<div class="seam" style="left:${pct(OX, WORLD_W)}"></div><div class="seam" style="left:${pct(OX + COMP_W, WORLD_W)}"></div>`;
    parts.push(`<section class="scene"><h2>${L.id} · ${L.scene}${dup ? " (cảnh dùng lại)" : ""} · ${L.hs.length} điểm</h2><div class="wrap">${ART.scene(L.scene, [])}${seams}${dots}</div></section>`);
  }
  main.innerHTML = parts.join("") || `<div class="note">Không có cảnh nào khớp "${only}"</div>`;
}
