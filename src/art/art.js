import { WORLD_W, COMP_W, OX } from "../world/layout.js";
import { portrait } from "./people.js";
import { uid, esc, shade, lin, rect, path, circle, line, blurs, glow } from "./kit.js";
import { sgHouse, wires, sgLobby, sgSecroom, sgGarage, sgPenthouse, sgStreet, sgLab, menuSg } from "./sg.js";
import { sgVaniGate, sgVaniOffice, sgVaniCeo, sgVaniPrint, sgVaniDock } from "./sg-vani.js";
/* =====================================================================
   HANOI NOIR · Minh họa SVG
   Toàn bộ hình ảnh vẽ bằng SVG (không dùng ảnh bitmap).
   Cảnh vẽ trên hệ tọa độ 1600 × 900 (16:9) để khớp với sân khấu toàn màn hình.
   Mỗi cảnh có tiền tố id riêng, nên nhiều cảnh có thể nằm chung trên một trang.
   ===================================================================== */
const ART = (() => {

  /* ---------- Cảnh camera an ninh (khung nhỏ 320 × 190) ---------- */
  function camBody(k, kind) {
    if (kind === "cam_sg_lobby") {
      return rect(0, 0, 320, 190, "#10181c") +
        rect(0, 120, 320, 70, "#2a3236") + line(0, 150, 320, 150, "#3a4448", 2, 'opacity=".5"') +
        rect(20, 30, 90, 90, "#c3ccd0") + line(65, 30, 65, 120, "#5a666a", 2) + rect(44, 18, 42, 10, "#04080a") + rect(52, 20, 14, 6, "#ff7a45") +
        rect(120, 30, 90, 90, "#b4bec2") + line(165, 30, 165, 120, "#5a666a", 2) +
        rect(250, 30, 70, 100, "#06080a") + rect(256, 38, 58, 8, "#14b860", 'opacity=".8"') +
        circle(70, 96, 9, "#f3d1ae") + rect(60, 106, 20, 38, "#b5446e", 'rx="4"') + rect(61, 142, 7, 20, "#222") + rect(72, 142, 7, 20, "#222") +
        glow(k, 160, 20, 70, "#dff3ff", 0.28);
    }
    if (kind === "cam_sg_garage") {
      return rect(0, 0, 320, 190, "#0a1014") + rect(0, 0, 320, 40, "#12181e") +
        rect(30, 40, 26, 100, "#2d363d") + rect(250, 40, 30, 100, "#2d363d") +
        rect(0, 110, 320, 80, "#0f2a34") + line(0, 130, 320, 130, "#a8e0f0", 1, 'opacity=".2"') +
        rect(110, 44, 70, 76, "#1a222a") + rect(116, 50, 28, 70, "#8d9aa3") + rect(146, 50, 28, 70, "#6c7a84") +
        circle(150, 96, 8, "#e0b98e") + rect(139, 104, 22, 40, "#6b7a2e", 'rx="4"') + rect(140, 142, 8, 22, "#222") + rect(152, 142, 8, 22, "#222") +
        glow(k, 160, 18, 80, "#dff3ff", 0.28);
    }
    if (kind === "cam_sg_sec") {
      return rect(0, 0, 320, 190, "#0e1614") +
        rect(20, 16, 280, 60, "#06090b") + [0, 1, 2, 3].map((i) => rect(28 + i * 68, 22, 60, 48, "#16313a")).join("") +
        rect(40, 118, 240, 18, "#6a4a30") + rect(60, 136, 200, 54, "#2b1d10") +
        circle(120, 96, 9, "#d9a77c") + rect(108, 106, 24, 34, "#2c5d86", 'rx="4"') + rect(104, 98, 32, 8, "#2c5d86", 'rx="3"') +
        rect(176, 96, 70, 22, "#04080a", 'rx="2"') + rect(182, 100, 40, 3, "#4fe0a0") + rect(182, 108, 54, 3, "#4fe0a0", 'opacity=".6"') +
        glow(k, 160, 14, 90, "#dff3ff", 0.25);
    }
    if (kind === "cam_sg_cafe") {
      let c = rect(0, 0, 320, 190, "#0b1020") + rect(0, 110, 320, 80, "#17213a") + rect(180, 20, 8, 110, "#2a2d36") +
        glow(k, 184, 30, 40, "#ffd58a", 0.6) + rect(20, 40, 110, 70, "#1c1630") + rect(30, 50, 90, 14, "#e9b949", 'opacity=".5"') +
        circle(236, 76, 8, "#e0b98e") + path("M222 84 Q236 80 252 86 L258 130 L218 130 Z", "#e9d73a") + rect(224, 128, 7, 22, "#222") + rect(240, 128, 7, 22, "#222") +
        rect(190, 138, 90, 30, "#17213a", 'opacity=".7"') + `<g class="rain">`;
      for (let i = 0; i < 30; i++) c += line((i * 41) % 320, (i * 57) % 170, ((i * 41) % 320) - 5, ((i * 57) % 170) + 14, "#8fb3d1", 1.2, 'opacity=".35"');
      return c + `</g>`;
    }
    if (kind === "cam_sg_gala") {
      return rect(0, 0, 320, 190, "#1a1020") + rect(70, 20, 180, 56, "#2a1a38") + rect(80, 28, 160, 40, "#3a2250") +
        rect(150, 36, 20, 30, "#c8a24a") + circle(160, 32, 6, "#e0b98e") +
        rect(0, 120, 320, 70, "#2a1e22") +
        [[50, 120], [160, 130], [270, 120]].map(([x, y], i) => circle(x, y, 28, i === 1 ? "#4a2e3e" : "#3a2430") + circle(x - 16, y - 18, 6, i === 1 ? "#f0e0c8" : "#6a4a5a") + circle(x + 18, y - 14, 6, "#6a4a5a")).join("") +
        circle(160, 130, 20, "#4a2e3e") + rect(150, 100, 20, 8, "none", 'stroke="#ffd27a" stroke-dasharray="3 3"') +
        glow(k, 160, 40, 80, "#ffd27a", 0.3);
    }
    if (kind === "cam_vani_gate") {
      return rect(0, 0, 320, 190, "#0b1020") + rect(0, 120, 320, 70, "#1a212c") +
        rect(200, 36, 120, 90, "#2a3340") + rect(214, 50, 44, 28, "#ffd27a", 'opacity=".6"') +
        rect(18, 60, 96, 66, "#202a35") + rect(28, 72, 76, 40, "#27414c") + circle(66, 88, 7, "#d2a074") + rect(57, 94, 18, 18, "#2c5d86", 'rx="3"') +
        rect(120, 108, 76, 6, "#e8e8e8") + rect(120, 108, 24, 6, "#d94a4a") + rect(156, 108, 24, 6, "#d94a4a") +
        path("M222 152 L226 130 Q248 120 280 126 L292 152 Z", "#cfd4da") + circle(236, 154, 8, "#111") + circle(278, 154, 8, "#111") + circle(290, 140, 3, "#ff4d4d") +
        glow(k, 150, 26, 60, "#ffd58a", 0.3);
    }
    if (kind === "cam_vani_office") {
      return rect(0, 0, 320, 190, "#141a22") + rect(0, 120, 320, 70, "#222730") +
        rect(24, 86, 120, 40, "#3a4452") + rect(48, 64, 52, 30, "#05080e") + rect(54, 70, 40, 18, "#12284a") +
        circle(72, 108, 8, "#f4d6bd") + rect(62, 116, 20, 26, "#e0a31f", 'rx="4"') +
        rect(176, 90, 120, 36, "#3a4452") + rect(210, 70, 40, 24, "#05080e") + rect(214, 74, 32, 16, "#1c4a3a") +
        circle(226, 108, 8, "#f2d2b6") + rect(216, 116, 20, 26, "#7a4a8a", 'rx="4"') +
        rect(0, 30, 90, 20, "#0b0f14") + glow(k, 160, 14, 90, "#e8f2ff", 0.25);
    }
    if (kind === "cam_vani_canteen") {
      let c = rect(0, 0, 320, 190, "#1c1712") + rect(0, 110, 320, 80, "#2a2018") + rect(220, 40, 90, 60, "#3a2c20") + rect(228, 48, 74, 44, "#d9c3a0", 'opacity=".5"');
      [[40, 120], [110, 130], [180, 122]].forEach(([x, y]) => { c += rect(x, y, 56, 20, "#6a4a30") + circle(x + 10, y - 14, 7, "#d9a77c") + rect(x + 4, y - 8, 14, 16, "#2f6f62", 'rx="3"') + circle(x + 44, y - 14, 7, "#e0b98e") + rect(x + 38, y - 8, 14, 16, "#a85a2a", 'rx="3"'); });
      return c + circle(260, 118, 8, "#e0b98e") + rect(250, 126, 20, 30, "#8a8f98", 'rx="4"') + glow(k, 160, 10, 80, "#ffd27a", 0.25);
    }
    if (kind === "cam_vani_alley") {
      let c = rect(0, 0, 320, 190, "#0a0f18") + path("M0 190 L320 190 L220 90 L100 90 Z", "#18202a") + rect(0, 0, 100, 190, "#1e2530") + rect(220, 0, 100, 190, "#1b212b") +
        rect(100, 70, 120, 20, "#10151c") + rect(14, 64, 62, 96, "#05080e") + rect(18, 70, 54, 12, "#59636f") + glow(k, 40, 70, 40, "#ffd27a", 0.3);
      c += circle(156, 104, 6, "#8a8f98") + path("M146 112 Q156 106 168 112 L172 140 L144 140 Z", "#8a8f98") + rect(146, 138, 7, 18, "#222") + rect(160, 138, 7, 18, "#222");
      c += circle(44, 120, 7, "#e9c09b") + rect(34, 128, 20, 28, "#2f6f62", 'rx="4"') + rect(36, 154, 7, 14, "#222") + rect(46, 154, 7, 14, "#222") + `<g class="rain">`;
      for (let i = 0; i < 30; i++) c += line((i * 41) % 320, (i * 57) % 170, ((i * 41) % 320) - 5, ((i * 57) % 170) + 14, "#8fb3d1", 1.2, 'opacity=".35"');
      return c + `</g>`;
    }
    return "";
  }
  const CAM_DEFS = (k) => blurs(k);

  /* ---------- Hình minh họa chứng cứ ---------- */

  // Hồ sơ giấy: trang giấy cũ có tiêu đề, dòng chữ và dấu mộc
  function paper(o) {
    const k = uid("pap");
    const rows = o.rows.map((row, i) =>
      `<text x="34" y="${76 + i * 22}" font-family="'Be Vietnam Pro',Arial,sans-serif" font-size="13" fill="#3b2a1b">${esc(row)}</text>`).join("");
    const stamp = o.stamp
      ? `<g transform="rotate(-9 252 140)"><rect x="196" y="122" width="112" height="36" rx="5" fill="none" stroke="#a93226" stroke-width="3"/>` +
        `<text x="252" y="146" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="15" fill="#a93226" letter-spacing="1">${esc(o.stamp)}</text></g>`
      : "";
    return `<svg viewBox="0 0 320 190" role="img" aria-label="${esc(o.alt)}">` +
      `<defs>${lin(`${k}-p`, [[0, "#fbf3dc"], [1, "#ecdcb3"]])}${lin(`${k}-w`, [[0, "#7a5530"], [1, "#4a2e18"]], 0, 0, 1, 1)}</defs>` +
      `<rect width="320" height="190" fill="url(#${k}-w)"/>` +
      `<path d="M22 14 L300 10 L304 180 L18 184 Z" fill="url(#${k}-p)"/>` +
      `<circle cx="268" cy="150" r="22" fill="none" stroke="#7a4a1a" stroke-width="3" opacity=".2"/>` +
      `<text x="160" y="40" text-anchor="middle" font-family="Georgia,serif" font-size="15" font-weight="700" fill="#2b1d12" letter-spacing="1">${esc(o.title)}</text>` +
      `<line x1="30" y1="52" x2="290" y2="50" stroke="#b9a078" stroke-width="1.5"/>` +
      rows + stamp + `</svg>`;
  }

  // Khung camera: nền ảnh đen trắng, dấu REC, mã camera và thanh quét
  function camView(o) {
    const k = uid("cam");
    const scene = CAM_KINDS[o.scene] ? camBody(k, o.scene) : camBody(k, "cam_sg_lobby");
    return `<div class="cam-view"><svg viewBox="0 0 320 190" role="img" aria-label="${esc(o.alt)}">` +
      `<defs>${CAM_DEFS(k)}</defs>${scene}` +
      `<rect x="2" y="2" width="316" height="186" fill="none" stroke="#3a4a58" stroke-width="3"/>` +
      `<rect x="8" y="8" width="132" height="20" fill="#000" fill-opacity=".55" rx="3"/>` +
      `<circle cx="18" cy="18" r="4" fill="#ff4d4d"/>` +
      `<text x="28" y="22" font-family="monospace" font-size="11" fill="#e8eef4">REC ${esc(o.time)}</text>` +
      `<text x="310" y="182" text-anchor="end" font-family="monospace" font-size="10" fill="#9fb3c8">${esc(o.cam)}</text>` +
      `</svg></div>`;
  }
  const CAM_KINDS = {
    cam_sg_lobby: 1, cam_sg_garage: 1, cam_sg_sec: 1, cam_sg_cafe: 1, cam_sg_gala: 1,
    cam_vani_gate: 1, cam_vani_office: 1, cam_vani_canteen: 1, cam_vani_alley: 1
  };

  // Biểu đồ thủy triều trong ngày: hai đỉnh, mức báo động và khoảng đường ngập
  function tideView() {
    const X = (h) => 28 + (h / 24) * 270, Y = (m) => 150 - ((m - 0.2) / 1.6) * 110;
    const pts = [[1.17, 0.3], [7.58, 1.35], [13.33, 0.45], [19.33, 1.72], [24, 0.9]];
    let d = `M${X(0)} ${Y(0.8)}`;
    pts.forEach(([h, m], i) => {
      const [ph, pm] = i ? pts[i - 1] : [0, 0.8];
      const mid = (ph + h) / 2;
      d += ` C${X(mid)} ${Y(pm)} ${X(mid)} ${Y(m)} ${X(h)} ${Y(m)}`;
    });
    return `<svg viewBox="0 0 320 190" role="img" aria-label="Biểu đồ thủy triều hôm nay: đỉnh 1,72 m lúc 19 giờ 20">` +
      `<rect width="320" height="190" fill="#0e1a2c"/>` +
      `<rect x="${X(18.67)}" y="30" width="${X(21.5) - X(18.67)}" height="122" fill="#ff4fa3" opacity=".12"/>` +
      `<line x1="28" y1="${Y(1.6)}" x2="298" y2="${Y(1.6)}" stroke="#ff4fa3" stroke-width="1.4" stroke-dasharray="5 4"/>` +
      `<text x="30" y="${Y(1.6) - 4}" font-family="monospace" font-size="9" fill="#ff8ac0">báo động 3 · 1,60 m</text>` +
      `<line x1="28" y1="150" x2="298" y2="150" stroke="#4a6a8a" stroke-width="1.5"/>` +
      [0, 6, 12, 18, 24].map((h) => `<text x="${X(h)}" y="164" text-anchor="middle" font-family="monospace" font-size="9" fill="#9fb3c8">${String(h).padStart(2, "0")}h</text>`).join("") +
      `<path d="${d}" fill="none" stroke="#4fd6c6" stroke-width="3"/>` +
      `<circle cx="${X(7.58)}" cy="${Y(1.35)}" r="4" fill="#ffd27a"/><text x="${X(7.58)}" y="${Y(1.35) - 8}" text-anchor="middle" font-family="monospace" font-size="9" fill="#ffd27a">07:35 · 1,35 m</text>` +
      `<circle cx="${X(19.33)}" cy="${Y(1.72)}" r="4" fill="#ffd27a"/><text x="${X(19.33) - 4}" y="${Y(1.72) - 8}" text-anchor="middle" font-family="monospace" font-size="9" fill="#ffd27a">19:20 · 1,72 m</text>` +
      `<text x="160" y="182" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#cfe8ff">Thủy triều hôm nay · đường ngập 18:40–21:30</text>` +
      `</svg>`;
  }

  // Hai đồng hồ: cùng một sự kiện, camera chậm 17 phút so với giờ thật
  // Mặt đồng hồ kim: tâm (cx, cy), nhãn dưới mặt, giờ hh:mm, màu viền
  function clockFace(cx, cy, label, hh, mm, col) {
    const ah = ((hh % 12) + mm / 60) * 30, am = mm * 6;
    const pt = (deg, r) => `${cx + r * Math.sin((deg * Math.PI) / 180)} ${cy - r * Math.cos((deg * Math.PI) / 180)}`;
    let s = `<circle cx="${cx}" cy="${cy}" r="46" fill="#f5efe0" stroke="${col}" stroke-width="5"/>`;
    for (let i = 0; i < 12; i++) s += `<line x1="${pt(i * 30, 38).split(" ")[0]}" y1="${pt(i * 30, 38).split(" ")[1]}" x2="${pt(i * 30, 43).split(" ")[0]}" y2="${pt(i * 30, 43).split(" ")[1]}" stroke="#2b2b2b" stroke-width="2"/>`;
    s += `<line x1="${cx}" y1="${cy}" x2="${pt(ah, 24).split(" ")[0]}" y2="${pt(ah, 24).split(" ")[1]}" stroke="#2b2b2b" stroke-width="4" stroke-linecap="round"/>`;
    s += `<line x1="${cx}" y1="${cy}" x2="${pt(am, 36).split(" ")[0]}" y2="${pt(am, 36).split(" ")[1]}" stroke="#2b2b2b" stroke-width="2.6" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="3.5" fill="#2b2b2b"/>`;
    return s + `<text x="${cx}" y="${cy + 66}" text-anchor="middle" font-family="monospace" font-size="11" fill="#e8eef4">${label}</text>`;
  }

  // Hai đồng hồ: cùng một cuộc họp, giờ Thái Bình Dương sớm hơn giờ Việt Nam 15 giờ
  function tzView() {
    return `<svg viewBox="0 0 320 190" role="img" aria-label="Hai đồng hồ lệch nhau 15 giờ: Thái Bình Dương 5 giờ 30 sáng, Việt Nam 20 giờ 30 tối">` +
      `<rect width="320" height="190" fill="#14202e"/>` + clockFace(70, 78, "SEATTLE (PT) 05:30", 5, 30, "#3b6fa0") + clockFace(250, 78, "VIỆT NAM 20:30", 8, 30, "#c9a227") +
      `<path d="M126 78 L194 78" stroke="#ff4fa3" stroke-width="3" stroke-dasharray="6 4"/><path d="M188 70 L198 78 L188 86" fill="none" stroke="#ff4fa3" stroke-width="3"/>` +
      `<text x="160" y="68" text-anchor="middle" font-family="Georgia,serif" font-size="15" font-weight="700" fill="#ff8ac0">+15 giờ</text>` +
      `<text x="160" y="182" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#cfe8ff">giờ Việt Nam = giờ Thái Bình Dương + 15 giờ</text>` +
      `</svg>`;
  }

  // Hai đồng hồ: cùng một sự kiện, camera chậm 17 phút so với giờ thật
  function skewView() {
    const clock = clockFace;
    return `<svg viewBox="0 0 320 190" role="img" aria-label="Hai đồng hồ lệch nhau 17 phút: camera 18 giờ 03, giờ thật 18 giờ 20">` +
      `<rect width="320" height="190" fill="#14202e"/>` + clock(70, 78, "CAMERA 18:03", 6, 3, "#3b6fa0") + clock(250, 78, "GIỜ THẬT 18:20", 6, 20, "#c9a227") +
      `<path d="M126 78 L194 78" stroke="#ff4fa3" stroke-width="3" stroke-dasharray="6 4"/><path d="M188 70 L198 78 L188 86" fill="none" stroke="#ff4fa3" stroke-width="3"/>` +
      `<text x="160" y="68" text-anchor="middle" font-family="Georgia,serif" font-size="15" font-weight="700" fill="#ff8ac0">+17 phút</text>` +
      `<text x="160" y="182" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#cfe8ff">giờ thật = giờ máy + 17 phút</text>` +
      `</svg>`;
  }

  /* ---------- Thế giới panorama: khung cảnh gốc ở giữa, hai bên là phòng hoặc phố nối tiếp ---------- */
  // Phong cách hai bên theo từng cảnh: "room" là căn phòng, "sgstreet" là phố Sài Gòn
  const FLANK = {
    sg_lobby:     { kind: "room", wall: "#26343a", floor: "#59656a", trim: "#0e1518", lamp: "#fff1d0" },
    sg_secroom:   { kind: "room", wall: "#26352f", floor: "#2b3733", trim: "#0c1210", lamp: "#dff3ff" },
    sg_garage:    { kind: "room", wall: "#222b32", floor: "#10242c", trim: "#0c1014", lamp: "#dff3ff" },
    sg_penthouse: { kind: "room", wall: "#2a2530", floor: "#3a281c", trim: "#14111a", lamp: "#ffd27a" },
    sg_street:    { kind: "sgstreet" },
    sg_lab:       { kind: "room", wall: "#1c2a40", floor: "#1d2736", trim: "#070b12", lamp: "#cfe8ff" },
    sg_vani_gate:   { kind: "sgstreet" },
    sg_vani_office: { kind: "room", wall: "#2b3340", floor: "#2a2e36", trim: "#0a0d12", lamp: "#e8f2ff" },
    sg_vani_ceo:    { kind: "room", wall: "#2e2824", floor: "#3a281c", trim: "#0c0a08", lamp: "#ffd27a" },
    sg_vani_print:  { kind: "room", wall: "#2c3640", floor: "#2a2f36", trim: "#0c1015", lamp: "#e8f2ff" },
    sg_vani_dock:   { kind: "room", wall: "#2b323c", floor: "#161c24", trim: "#07090d", lamp: "#ffd58a" }
  };

  // Gradient dùng chung cho hai bên của một cảnh (tiền tố k là tiền tố cảnh + "-w")
  function flankDefs(k, f) {
    const wall = f.wall || "#3a2d3f", floor = f.floor || "#2b2233";
    return lin(`${k}-seamL`, [[0, "#000", 0.42], [1, "#000", 0]], 0, 0, 1, 0) +
      lin(`${k}-seamR`, [[0, "#000", 0], [1, "#000", 0.42]], 0, 0, 1, 0) +
      lin(`${k}-fwall`, [[0, shade(wall, 0.1)], [1, shade(wall, -0.25)]]) +
      lin(`${k}-ffloor`, [[0, floor], [1, shade(floor, -0.5)]]) +
      lin(`${k}-fsky`, [[0, "#0b1120"], [1, "#22304f"]]) +
      lin(`${k}-fstreet`, [[0, "#232833"], [1, "#0d1016"]]);
  }

  // Cửa phòng: khung gỗ, khoảng tối và vệt sáng dưới cửa
  function roomDoor(x, f, w = 130) {
    return rect(x - 8, 340, w + 16, 380, f.trim) +
      rect(x, 352, w, 368, "#120c08") +
      rect(x + 12, 364, w - 24, 344, "#22170e") +
      rect(x + 12, 712, w - 24, 6, "#e9b949", 'opacity=".5"');
  }

  // Cửa cửa hàng ngoài phố: mái che đỏ và khoảng tối bên dưới
  function streetDoor(x, w = 130) {
    return rect(x - 6, 528, w + 12, 12, "#8b1e1e", 'rx="3"') +
      rect(x, 540, w, 180, "#120c08") +
      rect(x + 12, 552, w - 24, 6, "#f0c15a", 'opacity=".6"');
  }

  // Một bên là căn phòng: tường, trần, sàn và các cửa đi (tọa độ thế giới)
  function roomSide(k, f, x0, doors) {
    let s = rect(x0, 0, 400, 720, `url(#${k}-fwall)`) +
      rect(x0, 0, 400, 56, shade(f.wall, -0.35)) +
      rect(x0, 712, 400, 10, f.trim) +
      rect(x0, 720, 400, 180, `url(#${k}-ffloor)`);
    for (let i = 0; i < 5; i++) s += line(x0, 740 + i * 36, x0 + 400, 740 + i * 36, "#2a170b", 2, 'opacity=".45"');
    s += glow(k, x0 + 200, 150, 90, f.lamp, 0.35) + circle(x0 + 200, 150, 10, f.lamp);
    s += rect(x0 + 186, 120, 28, 10, shade(f.trim, 0.2), 'rx="3"');
    doors.forEach((d) => { s += roomDoor(d.x, f, d.w); });
    return s;
  }

  // Một bên là phố Sài Gòn ngập nước: nhà phố có neon, dây điện và mặt đường phản chiếu (tọa độ thế giới)
  function sgStreetSide(k, x0, doors) {
    const left = x0 === 0;
    let s = rect(x0, 0, 400, 900, `url(#${k}-fsky)`);
    const houses = left
      ? [[-20, 740, 210, 600, 0, "#ff4fa3"], [190, 680, 200, 450, 1, "#ffb347"]]
      : [[2000, 740, 200, 590, 2, "#3fd6c6"], [2200, 680, 200, 450, 0, "#ff4fa3"]];
    houses.forEach(([x, base, w, h, seed, neon]) => {
      s += sgHouse(k, x, base, w, h, { wall: seed % 2 ? "#3a3a58" : "#4a3346", seed, neon });
    });
    s += wires(130, 3) + rect(x0, 720, 400, 180, `url(#${k}-fstreet)`);
    doors.forEach((d) => { s += streetDoor(d.x, d.w); });
    return s;
  }

  // Đặt khung cảnh gốc (1600 đơn vị) vào giữa thế giới 2400, hai bên dựng theo phong cách của cảnh
  function widen(key, svg, doors = []) {
    const m = svg.match(/^(<svg[^>]*>)<defs>([\s\S]*?)<\/defs>([\s\S]*)<\/svg>$/);
    if (!m) return svg;
    const [, open, defs, body] = m;
    const f = FLANK[key] || FLANK.sg_lobby;
    const k = `${key}-w`;
    const left = doors.filter((d) => d.side === "left");
    const right = doors.filter((d) => d.side === "right");
    const side = f.kind === "sgstreet" ? sgStreetSide : null;
    const sideL = side ? side(k, 0, left) : roomSide(k, f, 0, left);
    const sideR = side ? side(k, WORLD_W - 400, right) : roomSide(k, f, WORLD_W - 400, right);
    const seam = rect(OX, 0, 60, 900, `url(#${k}-seamL)`) + rect(OX + COMP_W - 60, 0, 60, 900, `url(#${k}-seamR)`);
    return open.replace(`viewBox="0 0 ${COMP_W} 900"`, `viewBox="0 0 ${WORLD_W} 900"`) +
      `<defs>${defs}${blurs(k)}${flankDefs(k, f)}</defs>` +
      sideL + `<g transform="translate(${OX} 0)">${body}</g>` + seam + sideR + `</svg>`;
  }

  const SCENES = {
    sg_lobby: sgLobby, sg_secroom: sgSecroom, sg_garage: sgGarage, sg_penthouse: sgPenthouse, sg_street: sgStreet, sg_lab: sgLab, menu_sg: menuSg,
    sg_vani_gate: sgVaniGate, sg_vani_office: sgVaniOffice, sg_vani_ceo: sgVaniCeo, sg_vani_print: sgVaniPrint, sg_vani_dock: sgVaniDock
  };

  return {
    // Cảnh điều tra được mở rộng thành thế giới panorama có cửa; menu (của mỗi vùng) giữ khung gốc. Khóa lạ rơi về menu Sài Gòn
    scene: (key, doors = []) => {
      if (key === "menu_sg" || !SCENES[key]) return SCENES.menu_sg();
      return widen(key, SCENES[key](), doors);
    },
    portrait,
    evidence(v) {
      if (v.k === "paper") return paper(v);
      if (v.k === "cam") return camView(v);
      if (v.k === "tide") return tideView();
      if (v.k === "skew") return skewView();
      if (v.k === "tz") return tzView();
      return "";
    }
  };
})();

export { ART };
