import { WORLD_W, COMP_W, OX } from "../world/layout.js";
import { portrait } from "./people.js";
import { uid, esc, shade, lin, rect, path, circle, line, txt, blurs, glow } from "./kit.js";
import { sgHouse, wires, sgLobby, sgSecroom, sgGarage, sgPenthouse, sgStreet, sgLab, menuSg } from "./sg.js";
import { sgVaniGate, sgVaniOffice, sgVaniCeo, sgVaniPrint, sgVaniDock } from "./sg-vani.js";
import { sgBtxPad, sgBtxLobby, sgBtxHall, sgBtxLounge, sgBtxOps } from "./sg-btx.js";
import { sgLmDeck, sgLmParty, sgLmOps, sgLmOffice, sgLmGround } from "./sg-lm.js";
import { sgMtCar, sgMtGate, sgMtOcc, sgMtPlat, sgMtOffice } from "./sg-mt.js";
import { sgCsCold, sgCsBlast, sgCsDock, sgCsOffice, sgCsHall } from "./sg-cs.js";
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
    if (kind === "cam_btx_hall") {
      let c = rect(0, 0, 320, 190, "#120e1a") + rect(0, 120, 320, 70, "#2a1e18") + rect(14, 14, 292, 60, "#1c2142") + glow(k, 250, 24, 40, "#e8e0ff", 0.3);
      c += rect(0, 0, 20, 190, "#0a0810") + rect(252, 70, 62, 50, "#d9d4c4") + rect(268, 124, 36, 66, "#0d1118") + rect(276, 100, 22, 8, "#0a3a22") + rect(286, 100, 8, 4, "#4fe08a");
      for (let i = 0; i < 6; i++) c += rect(172 + i * 10, 74, 6, 12, i === 2 ? "#ffd27a" : "#cfe8ff", 'opacity=".85"');
      [[60, 130], [130, 140], [196, 128]].forEach(([x, y], i) => { c += circle(x, y - 22, 7, i === 1 ? "#f2d2b6" : "#e6bd96") + rect(x - 8, y - 14, 16, 36, ["#1c2742", "#7a2f3a", "#202028"][i], 'rx="4"'); });
      return c + path("M286 118 l8 -14 l8 14 z", "#4fe08a", 'opacity=".5"') + glow(k, 160, 14, 80, "#ffd98e", 0.25);
    }
    if (kind === "cam_btx_pad") {
      let c = rect(0, 0, 320, 190, "#0a0c1a") + rect(0, 110, 320, 80, "#161a24") + `<ellipse cx="160" cy="146" rx="96" ry="22" fill="none" stroke="#d9d4c4" stroke-width="3" opacity=".7"/>` + rect(0, 70, 56, 72, "#10141a") + rect(8, 90, 24, 52, "#05080e");
      c += `<ellipse cx="260" cy="118" rx="42" ry="20" fill="#1c2430"/>` + rect(286, 104, 34, 6, "#1c2430") + glow(k, 20, 60, 36, "#ffd58a", 0.4);
      c += circle(36, 122, 9, "#8a8f98") + rect(26, 130, 20, 26, "#5a5f68", 'rx="4"') + rect(40, 112, 74, 10, "#d9d4c4", 'transform="rotate(-18 40 112)"');
      c += `<g class="rain">`;
      for (let i = 0; i < 46; i++) c += line((i * 41) % 320, (i * 57) % 170, ((i * 41) % 320) - 6, ((i * 57) % 170) + 16, "#cfe8ff", 1.2, 'opacity=".4"');
      return c + `</g>`;
    }
    if (kind === "cam_btx_ops") {
      return rect(0, 0, 320, 190, "#12181f") + rect(0, 120, 320, 70, "#222a33") + rect(20, 20, 150, 66, "#05080e") + rect(26, 26, 40, 24, "#12304a") + rect(70, 26, 40, 24, "#1c3a2c") + rect(114, 26, 40, 24, "#2a2a40") + rect(26, 54, 40, 24, "#33281c") + rect(70, 54, 40, 24, "#2a2c32") + rect(114, 54, 40, 24, "#12304a") +
        rect(150, 106, 150, 34, "#4a5560") + rect(176, 82, 60, 30, "#05080e") + rect(182, 86, 48, 22, "#0b1c2c") +
        circle(120, 94, 9, "#c98f63") + rect(108, 82, 24, 8, "#e0b21f", 'rx="3"') + rect(108, 104, 24, 40, "#d97a1f", 'rx="4"') +
        glow(k, 160, 14, 90, "#e8f2ff", 0.25);
    }
    if (kind === "cam_btx_nosignal") {
      let c = rect(0, 0, 320, 190, "#1a1c20");
      for (let r = 0; r < 19; r++) for (let q = 0; q < 32; q++) {
        const v = ((r * 37 + q * 91 + r * q) % 11) / 11;
        c += rect(q * 10, r * 10, 10, 10, `rgb(${Math.round(40 + v * 90)},${Math.round(44 + v * 90)},${Math.round(50 + v * 90)})`, 'opacity=".65"');
      }
      return c + rect(70, 74, 180, 44, "#05070a", 'rx="6" opacity=".85"') + `<text x="160" y="104" text-anchor="middle" font-family="monospace" font-size="20" fill="#ff8a7a" letter-spacing="3">NO SIGNAL</text>`;
    }
    if (kind === "cam_lm_deck") {
      let c = rect(0, 0, 320, 190, "#080b1a") + rect(0, 112, 320, 78, "#151a24") + rect(0, 88, 320, 5, "#9aa5b3") + rect(0, 112, 320, 5, "#59636f");
      for (let i = 0; i <= 8; i++) c += rect(i * 40 - 2, 88, 4, 28, "#59636f");
      c += circle(60, 40, 22, "#ff6a8a", 'opacity=".25"') + circle(250, 30, 14, "#5fd6ff", 'opacity=".25"') + glow(k, 60, 40, 40, "#ff6a8a", 0.3);
      // Khang đứng trên bậu ngoài thanh ray (quay lưng), Ngân phía sau hai tay đặt lên lưng
      c += circle(172, 56, 7, "#caa07c") + rect(163, 63, 18, 40, "#d9d5c8", 'rx="4"') + rect(164, 100, 7, 18, "#2a2d36") + rect(174, 100, 7, 18, "#2a2d36");
      c += circle(150, 90, 7, "#d9ad88") + rect(141, 97, 17, 36, "#6b6f7a", 'rx="4"') + path("M156 106 L166 82", "none", 'stroke="#d9ad88" stroke-width="5" stroke-linecap="round"') + path("M156 112 L170 92", "none", 'stroke="#d9ad88" stroke-width="5" stroke-linecap="round"');
      c += rect(160, 70, 24, 10, "#cfe8ff", 'rx="3" opacity=".6"') + `<g class="rain">`;
      for (let i = 0; i < 26; i++) c += line((i * 41) % 320, (i * 57) % 170, ((i * 41) % 320) - 5, ((i * 57) % 170) + 14, "#8fb3d1", 1.1, 'opacity=".3"');
      return c + `</g>`;
    }
    if (kind === "cam_lm_party") {
      let c = rect(0, 0, 320, 190, "#0c0a14") + rect(0, 120, 320, 70, "#22160f") + rect(8, 12, 190, 64, "#14173a") + glow(k, 110, 40, 60, "#ffd45a", 0.25);
      c += rect(224, 52, 96, 76, "#1a1230") + rect(232, 100, 36, 28, "#05080e") + rect(268, 78, 20, 50, "#4a2f1c") + rect(18, 80, 8, 70, "#07060c") + rect(0, 70, 30, 60, "#0d1118") + rect(6, 84, 18, 14, "#4fe08a", 'opacity=".6"');
      [[70, 132, "#1c2742"], [118, 138, "#202028"], [164, 130, "#2a2230"]].forEach(([x, y, col]) => { c += circle(x, y - 22, 7, "#e6bd96") + rect(x - 8, y - 14, 16, 36, col, 'rx="4"'); });
      return c + circle(34, 120, 6, "#d9ad88") + rect(26, 126, 16, 30, "#1d3a40", 'rx="4"') + glow(k, 160, 14, 80, "#ffd98e", 0.2);
    }
    if (kind === "cam_lm_ops") {
      return rect(0, 0, 320, 190, "#12181f") + rect(0, 122, 320, 68, "#222a33") + rect(150, 14, 150, 66, "#05080e") + rect(156, 20, 40, 24, "#12304a") + rect(200, 20, 40, 24, "#1c3a2c") + rect(244, 20, 40, 24, "#2a2a40") + rect(156, 48, 40, 24, "#33281c") + rect(200, 48, 40, 24, "#2a2c32") + rect(244, 48, 40, 24, "#12304a") +
        rect(20, 108, 150, 22, "#4a5560") + rect(34, 70, 60, 38, "#05080e") + rect(40, 76, 48, 26, "#0b1c2c") +
        circle(124, 78, 9, "#e9c09b") + rect(112, 88, 24, 36, "#2e4b78", 'rx="4"') + rect(104, 112, 14, 10, "#e8e2d0") +
        glow(k, 160, 14, 90, "#e8f2ff", 0.25);
    }
    if (kind === "cam_lm_hall78") {
      let c = rect(0, 0, 320, 190, "#0e1219") + path("M0 190 L320 190 L240 96 L80 96 Z", "#1c2530") + rect(0, 0, 80, 190, "#1b212b") + rect(240, 0, 80, 190, "#171d27") + rect(80, 66, 160, 30, "#10151c");
      c += rect(206, 76, 40, 66, "#05080e") + rect(210, 82, 32, 60, "#1d252e") + rect(250, 110, 52, 8, "#c9a227", 'opacity=".5"');
      c += circle(52, 92, 6, "#d9ad88") + rect(44, 100, 16, 36, "#1b1f2b", 'rx="4"') + rect(54, 98, 6, 10, "#cfe8ff", 'rx="2"');
      c += circle(188, 100, 6, "#cfc3a8") + rect(180, 108, 16, 30, "#2a2230", 'rx="4"') + circle(210, 104, 6, "#d9ad88") + rect(202, 112, 16, 28, "#555", 'rx="4"');
      return c + glow(k, 160, 18, 70, "#dff3ff", 0.25);
    }
    if (kind === "cam_lm_ground") {
      let c = rect(0, 0, 320, 190, "#080b18") + path("M0 0 L110 0 L120 110 L0 110 Z", "#14233a") + rect(0, 110, 320, 80, "#161c26") + line(0, 138, 320, 138, "#2c333d", 2, 'opacity=".6"');
      c += glow(k, 220, 20, 60, "#ff6a8a", 0.3) + circle(220, 20, 14, "#ff6a8a", 'opacity=".25"');
      for (let i = 0; i < 9; i++) c += rect(10 + i * 11, 10 + (i * 13) % 80, 6, 5, "#ffd58a", 'opacity=".4"');
      c += path("M196 146 Q214 128 240 136 Q252 150 232 160 Q206 162 196 146 Z", "#0a0c12") + circle(214, 140, 4, "#caa07c", 'opacity=".5"');
      c += glow(k, 215, 148, 24, "#fff7d0", 0.3) + `<g class="rain">`;
      for (let i = 0; i < 24; i++) c += line((i * 41) % 320, (i * 57) % 170, ((i * 41) % 320) - 5, ((i * 57) % 170) + 14, "#8fb3d1", 1.1, 'opacity=".28"');
      return c + `</g>`;
    }
    if (kind === "cam_mt_car") {
      let c = rect(0, 0, 320, 190, "#10161e") + rect(0, 128, 320, 62, "#1d242d") + rect(0, 0, 320, 16, "#0a0d12");
      for (let i = 0; i < 4; i++) c += rect(14 + i * 76, 24, 64, 52, "#0a1224") + rect(14 + i * 76, 24, 64, 52, "none", 'stroke="#05070b" stroke-width="3"') + circle(34 + i * 76, 44, 2, "#ffd58a", 'opacity=".7"') + circle(52 + i * 76, 56, 2, "#7be6e0", 'opacity=".6"');
      c += rect(56, 76, 214, 30, "#1b4058", 'rx="4"') + rect(56, 104, 214, 20, "#2f6a8a", 'rx="3"') + rect(56, 124, 214, 28, "#0f141b");
      c += circle(214, 70, 8, "#d9ae88") + rect(200, 78, 26, 42, "#8a8f98", 'rx="5"') + rect(204, 112, 18, 8, "#f3ead2", 'rx="1"');
      c += circle(170, 66, 10, "#9fd6c0") + circle(170, 70, 6, "#d9ae88") + rect(156, 76, 30, 50, "#9fd6c0", 'rx="7" opacity=".95"') + rect(162, 66, 16, 6, "#dfe8ee", 'opacity=".8" rx="2"');
      c += line(30, 112, 52, 112, "#cfd8e0", 3, 'opacity=".5"');
      return c + glow(k, 160, 14, 110, "#eaf4ff", 0.22);
    }
    if (kind === "cam_mt_cab") {
      let c = rect(0, 0, 320, 190, "#0c1118") + rect(80, 14, 160, 74, "#05070b") + path("M96 88 L160 24 L224 88 Z", "#10243a", 'opacity=".8"');
      for (let i = 0; i < 6; i++) c += circle(160 + (i - 2.5) * 6, 40 + i * 6, 2, "#ffd58a", 'opacity=".8"');
      c += line(60, 14, 100, 90, "#2a313a", 4) + line(260, 14, 220, 90, "#2a313a", 4);
      c += rect(40, 100, 240, 20, "#2a3038") + rect(70, 92, 54, 12, "#4a5560") + circle(200, 104, 4, "#4fe08a") + circle(214, 104, 4, "#ffd27a") + circle(228, 104, 4, "#ff6b5a");
      c += rect(0, 120, 320, 70, "#161c24") + rect(112, 126, 60, 48, "#2a313a", 'rx="6"');
      c += circle(142, 118, 9, "#dfae85") + rect(132, 124, 20, 34, "#1d3b5a", 'rx="4"') + rect(130, 110, 24, 6, "#14202c", 'rx="2"');
      c += rect(258, 40, 44, 120, "#10151b") + rect(262, 46, 36, 64, "#1d252e");
      return c + glow(k, 160, 10, 90, "#e8f2ff", 0.22);
    }
    if (kind === "cam_mt_gate") {
      let c = rect(0, 0, 320, 190, "#10161e") + rect(0, 128, 320, 62, "#222a33") + rect(80, 12, 160, 22, "#0b4d3a");
      for (let i = 0; i < 4; i++) c += rect(30 + i * 52, 78, 30, 60, "#59636f", 'rx="3"') + rect(35 + i * 52, 84, 20, 8, "#4fe0a0");
      c += rect(240, 78, 36, 60, "#59636f", 'rx="3"') + rect(246, 84, 24, 8, "#ffd27a") + rect(290, 70, 24, 80, "#2a4a5a", 'rx="3"');
      c += circle(266, 116, 8, "#9fd6c0") + rect(256, 124, 20, 36, "#9fd6c0", 'rx="6"') + rect(254, 108, 24, 8, "#9fd6c0", 'rx="4" opacity=".9"');
      c += circle(118, 106, 7, "#d9ae88") + rect(108, 114, 20, 34, "#8a8f98", 'rx="4"');
      c += circle(60, 108, 7, "#efc9a7") + rect(50, 116, 20, 34, "#2e4a6b", 'rx="4"');
      return c + glow(k, 160, 14, 100, "#eaf4ff", 0.22);
    }
    if (kind === "cam_mt_occ") {
      let c = rect(0, 0, 320, 190, "#0e1319") + rect(30, 10, 260, 66, "#05080e") + rect(36, 16, 248, 54, "#0a1a2a") + line(50, 44, 270, 44, "#2f9a74", 3);
      for (let i = 0; i < 14; i++) c += circle(50 + i * 17, 44, i === 2 ? 4 : 2.5, i === 2 ? "#ffd27a" : "#eaf4ff");
      c += rect(74, 28, 22, 8, "#2fc990", 'rx="3"') + rect(74, 50, 22, 8, "#f0a050", 'rx="3"') + glow(k, 85, 44, 30, "#ffd27a", 0.4);
      c += rect(0, 120, 320, 70, "#1a212a") + rect(60, 100, 150, 24, "#4a5560") + rect(76, 70, 70, 34, "#05080e") + rect(82, 76, 58, 22, "#0b1c2c");
      c += circle(110, 88, 9, "#e9c09b") + rect(98, 98, 24, 34, "#355a7a", 'rx="4"') + rect(100, 82, 22, 6, "#10151b", 'rx="3"');
      c += rect(220, 90, 70, 40, "#05080e") + rect(226, 96, 58, 28, "#12304a");
      return c + glow(k, 160, 10, 90, "#e8f2ff", 0.22);
    }
    if (kind === "cam_mt_plat") {
      let c = rect(0, 0, 320, 190, "#0c1118") + path("M0 0 L320 0 L168 78 L152 78 Z", "#151c26") + rect(150, 70, 20, 16, "#05070b");
      c += path("M0 36 L150 80 L150 96 L0 190 Z", "#2c5068") + path("M320 36 L170 80 L170 96 L320 190 Z", "#2c5a50");
      c += path("M40 70 L150 84 L150 92 L40 150 Z", "#10161e") + path("M280 70 L170 84 L170 92 L280 150 Z", "#10161e");
      c += path("M72 120 L88 112 L100 168 L66 168 Z", "#d9c27a", 'opacity=".55"') + path("M248 120 L232 112 L220 168 L254 168 Z", "#bfe6d2", 'opacity=".55"');
      c += path("M100 190 L150 96 L170 96 L220 190 Z", "#4a525c");
      c += circle(132, 102, 5, "#d9ae88") + rect(126, 107, 12, 28, "#5a5e68", 'rx="3"') + rect(127, 133, 4, 14, "#222") + rect(133, 133, 4, 14, "#222");
      c += circle(186, 110, 6, "#9fd6c0") + rect(178, 116, 16, 34, "#9fd6c0", 'rx="5"') + rect(176, 104, 20, 7, "#9fd6c0", 'rx="3" opacity=".9"') + path("M178 124 L158 118", "none", 'stroke="#9fd6c0" stroke-width="4" stroke-linecap="round" opacity=".6"');
      return c + glow(k, 160, 12, 90, "#eaf4ff", 0.2);
    }
    if (kind === "cam_cs_cong") {
      let c = rect(0, 0, 320, 190, "#0b1118") + rect(0, 128, 320, 62, "#1b222b") + path("M40 190 L40 74 Q160 -12 280 74 L280 190 Z", "#18202a") + path("M84 190 L84 88 Q160 24 236 88 L236 190 Z", "#05080d");
      for (let i = 0; i < 6; i++) c += rect(100 + i * 4, 118 + i * 11, 120 - i * 8, 8, i % 2 ? "#2a333d" : "#222a33");
      c += rect(116, 44, 88, 14, "#0b4d3a") + txt(160, 55, "XUỐNG HẦM B1", 9, "#f3f1ea", 'text-anchor="middle"');
      c += circle(158, 100, 7, "#d9ae88") + rect(146, 107, 24, 40, "#4a4036", 'rx="6"') + rect(150, 140, 8, 20, "#222") + rect(160, 140, 8, 20, "#222") + rect(142, 118, 10, 12, "#f3ead2", 'rx="1"');
      c += rect(250, 120, 44, 50, "#2a2f35") + circle(272, 130, 4, "#ffd58a", 'opacity=".7"');
      return c + glow(k, 160, 20, 90, "#dff3ff", 0.22);
    }
    if (kind === "cam_cs_dock") {
      let c = rect(0, 0, 320, 190, "#0c1016") + rect(0, 140, 320, 50, "#171b20") + rect(20, 40, 200, 100, "#d4dadf", 'rx="6"') + rect(24, 100, 196, 36, "#aeb7bf");
      c += rect(36, 52, 110, 60, "#ffe8a8", 'rx="6"') + rect(36, 52, 110, 60, "none", 'rx="6" stroke="#3a444e" stroke-width="4"') + path("M62 112 Q76 78 100 96 L120 112 Z", "#3f5a3a") + circle(92, 82, 11, "#dfae85") + path("M82 74 Q92 64 104 72", "none", 'stroke="#2a1e16" stroke-width="5"');
      c += circle(60, 142, 18, "#10151b") + circle(170, 142, 18, "#10151b") + rect(160, 70, 52, 12, "#3a444e", 'rx="3"');
      c += rect(240, 0, 54, 190, "#2a2f35") + rect(236, 0, 62, 14, "#1a1d21") + rect(300, 30, 16, 120, "#10151b");
      return c + glow(k, 90, 82, 70, "#ffe8a8", 0.3) + glow(k, 150, 12, 60, "#dff3ff", 0.2);
    }
    if (kind === "cam_cs_t2") {
      let c = rect(0, 0, 320, 190, "#0e0c0a") + path("M0 190 L320 190 L220 96 L100 96 Z", "#2a2218") + path("M0 0 L100 96 L100 190 L0 190 Z", "#1c1814") + path("M320 0 L220 96 L220 190 L320 190 Z", "#17130f") + rect(100, 52, 120, 44, "#0a0806");
      c += rect(132, 58, 56, 38, "#2a241e") + rect(138, 90, 44, 4, "#ffd27a", 'opacity=".8"') + glow(k, 160, 94, 50, "#ffd27a", 0.4);
      c += line(0, 120, 100, 96, "#6a5a40", 3) + rect(10, 110, 8, 70, "#4a3d30");
      c += circle(214, 112, 7, "#efc9a7") + rect(204, 120, 20, 38, "#7a3b4a", 'rx="5"') + rect(204, 108, 20, 6, "#2a1a14", 'rx="3"');
      return c + glow(k, 160, 14, 90, "#e8f2ff", 0.2);
    }
    if (kind === "cam_cs_store") {
      let c = rect(0, 0, 320, 190, "#12161c") + rect(0, 128, 320, 62, "#2a2d33");
      for (let r = 0; r < 3; r++) for (let i = 0; i < 8; i++) c += rect(10 + i * 18, 26 + r * 28, 14, 22, ["#e9b949", "#5aa0d6", "#e07a5a", "#7fc08a"][(i + r) % 4]);
      c += rect(170, 100, 130, 40, "#59636f", 'rx="3"') + rect(178, 84, 40, 20, "#05080e") + rect(184, 88, 28, 10, "#4fe0a0", 'opacity=".7"');
      c += circle(240, 78, 8, "#f4d6bd") + rect(228, 86, 24, 44, "#c0392b", 'rx="5"') + rect(230, 90, 20, 8, "#f3f1ea", 'opacity=".9"') + path("M232 70 Q240 58 250 70", "none", 'stroke="#2a1a14" stroke-width="6"');
      c += circle(120, 108, 7, "#d9ae88") + rect(110, 116, 20, 36, "#5a5e68", 'rx="4"');
      return c + glow(k, 160, 12, 100, "#eaf4ff", 0.24);
    }
    if (kind === "cam_cs_tiec") {
      let c = rect(0, 0, 320, 190, "#0a0b14") + rect(0, 130, 320, 60, "#1c1a1c") + rect(0, 20, 320, 26, "#a93226") + rect(0, 46, 320, 6, "#5a1a14");
      for (let i = 0; i < 6; i++) c += circle(30 + i * 52, 64, 9, "#ff6a5a") + line(30 + i * 52, 46, 30 + i * 52, 56, "#d9c27a", 2) + glow(k, 30 + i * 52, 64, 20, "#ff6a5a", 0.3);
      c += rect(30, 80, 120, 70, "#251a20") + rect(36, 86, 108, 58, "#3a2230") + txt(90, 120, "SEN", 18, "#d9c27a", 'text-anchor="middle"');
      c += path("M190 156 L190 120 Q198 96 230 94 L290 94 Q310 100 312 130 L312 156 Z", "#e6e9ec") + circle(212, 156, 12, "#10151b") + circle(290, 156, 12, "#10151b") + rect(204, 104, 40, 18, "#0b1220", 'rx="3"');
      c += circle(168, 100, 7, "#f1d0b4") + rect(157, 108, 22, 40, "#5a2a3a", 'rx="5"') + path("M170 114 L186 120", "none", 'stroke="#f1d0b4" stroke-width="5" stroke-linecap="round"') + circle(204, 106, 6, "#d9ae88") + rect(196, 112, 16, 34, "#4a4a52", 'rx="4"');
      return c + glow(k, 160, 12, 80, "#ffd58a", 0.2);
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
    cam_vani_gate: 1, cam_vani_office: 1, cam_vani_canteen: 1, cam_vani_alley: 1,
    cam_btx_hall: 1, cam_btx_pad: 1, cam_btx_ops: 1, cam_btx_nosignal: 1,
    cam_lm_deck: 1, cam_lm_party: 1, cam_lm_ops: 1, cam_lm_hall78: 1, cam_lm_ground: 1,
    cam_mt_car: 1, cam_mt_cab: 1, cam_mt_gate: 1, cam_mt_occ: 1, cam_mt_plat: 1,
    cam_cs_cong: 1, cam_cs_dock: 1, cam_cs_t2: 1, cam_cs_store: 1, cam_cs_tiec: 1
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
    sg_vani_dock:   { kind: "room", wall: "#2b323c", floor: "#161c24", trim: "#07090d", lamp: "#ffd58a" },
    sg_btx_pad:     { kind: "roof", wall: "#262c36", floor: "#242a33", trim: "#0c0f14", lamp: "#ffd58a" },
    sg_btx_lobby:   { kind: "room", wall: "#1c2a40", floor: "#39434d", trim: "#070b12", lamp: "#ffd98e" },
    sg_btx_hall:    { kind: "room", wall: "#1a1426", floor: "#30221b", trim: "#07060c", lamp: "#ffd98e" },
    sg_btx_lounge:  { kind: "room", wall: "#3a2420", floor: "#3a181d", trim: "#0c0807", lamp: "#ffd98e" },
    sg_btx_ops:     { kind: "room", wall: "#222c36", floor: "#29313a", trim: "#080b0f", lamp: "#e8f2ff" },
    sg_lm_deck:     { kind: "roof", wall: "#232a35", floor: "#2a313b", trim: "#0c0f14", lamp: "#ffb347" },
    sg_lm_party:    { kind: "room", wall: "#1a1426", floor: "#30221b", trim: "#07060c", lamp: "#ffd98e" },
    sg_lm_ops:      { kind: "room", wall: "#222c36", floor: "#29313a", trim: "#080b0f", lamp: "#e8f2ff" },
    sg_lm_office:   { kind: "room", wall: "#2a2f3a", floor: "#3a2c22", trim: "#0a0c12", lamp: "#ffd27a" },
    sg_lm_ground:   { kind: "roof", wall: "#1c2a40", floor: "#2c333d", trim: "#0a0d12", lamp: "#7fc8ff" },
    sg_mt_car:      { kind: "room", wall: "#2b3441", floor: "#39424c", trim: "#0a0d12", lamp: "#eaf4ff" },
    sg_mt_gate:     { kind: "room", wall: "#2f3a46", floor: "#4a545e", trim: "#0a0d12", lamp: "#eaf4ff" },
    sg_mt_occ:      { kind: "room", wall: "#1f2a36", floor: "#2c343e", trim: "#080b0f", lamp: "#e8f2ff" },
    sg_mt_plat:     { kind: "room", wall: "#232c38", floor: "#6a727c", trim: "#0a0d12", lamp: "#eaf4ff" },
    sg_mt_office:   { kind: "room", wall: "#2a2f3a", floor: "#3a3430", trim: "#0a0c12", lamp: "#ffd27a" },
    sg_cs_cold:     { kind: "room", wall: "#7d92a4", floor: "#51657a", trim: "#2a3a4a", lamp: "#dff3ff" },
    sg_cs_blast:    { kind: "room", wall: "#4a5864", floor: "#2a3238", trim: "#10161c", lamp: "#e8f4ff" },
    sg_cs_dock:     { kind: "room", wall: "#343d49", floor: "#23272d", trim: "#0c0f14", lamp: "#ffd58a" },
    sg_cs_office:   { kind: "room", wall: "#3a3430", floor: "#3a2c22", trim: "#0e0b09", lamp: "#ffd27a" },
    sg_cs_hall:     { kind: "room", wall: "#2f3a36", floor: "#2e2e29", trim: "#0a0e0c", lamp: "#e8f2ff" }
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

  // Một bên là sân thượng trong giông: bầu trời, dãy nhà kỹ thuật bằng bê tông có cửa đi và sàn sân đáp (tọa độ thế giới)
  function roofSide(k, f, x0, doors) {
    let s = rect(x0, 0, 400, 900, `url(#${k}-fsky)`) +
      rect(x0, 260, 400, 460, shade(f.wall, 0.05)) + rect(x0, 250, 400, 14, shade(f.wall, -0.4)) +
      rect(x0, 720, 400, 180, `url(#${k}-ffloor)`) + rect(x0, 714, 400, 8, f.trim);
    for (let i = 0; i < 6; i++) s += line(x0, 300 + i * 70, x0 + 400, 300 + i * 70, shade(f.wall, -0.3), 2, 'opacity=".5"');
    s += glow(k, x0 + 200, 240, 90, f.lamp, 0.35) + rect(x0 + 170, 236, 60, 10, f.lamp);
    doors.forEach((d) => { s += roomDoor(d.x, f, d.w); });
    let rain = "";
    for (let i = 0; i < 40; i++) {
      const rx = x0 + ((i * 59) % 400), ry = (i * 131) % 900;
      rain += line(rx, ry, rx - 7, ry + 24, "#9fc3dd", 1.2, `opacity=".3" style="animation-delay:-${((i * 0.11) % 1).toFixed(2)}s"`);
    }
    return s + `<g class="rain">${rain}</g>`;
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
    const room = f.kind === "roof" ? roofSide : roomSide;
    const sideL = side ? side(k, 0, left) : room(k, f, 0, left);
    const sideR = side ? side(k, WORLD_W - 400, right) : room(k, f, WORLD_W - 400, right);
    const seam = rect(OX, 0, 60, 900, `url(#${k}-seamL)`) + rect(OX + COMP_W - 60, 0, 60, 900, `url(#${k}-seamR)`);
    return open.replace(`viewBox="0 0 ${COMP_W} 900"`, `viewBox="0 0 ${WORLD_W} 900"`) +
      `<defs>${defs}${blurs(k)}${flankDefs(k, f)}</defs>` +
      sideL + `<g transform="translate(${OX} 0)">${body}</g>` + seam + sideR + `</svg>`;
  }

  const SCENES = {
    sg_lobby: sgLobby, sg_secroom: sgSecroom, sg_garage: sgGarage, sg_penthouse: sgPenthouse, sg_street: sgStreet, sg_lab: sgLab, menu_sg: menuSg,
    sg_vani_gate: sgVaniGate, sg_vani_office: sgVaniOffice, sg_vani_ceo: sgVaniCeo, sg_vani_print: sgVaniPrint, sg_vani_dock: sgVaniDock,
    sg_btx_pad: sgBtxPad, sg_btx_lobby: sgBtxLobby, sg_btx_hall: sgBtxHall, sg_btx_lounge: sgBtxLounge, sg_btx_ops: sgBtxOps,
    sg_lm_deck: sgLmDeck, sg_lm_party: sgLmParty, sg_lm_ops: sgLmOps, sg_lm_office: sgLmOffice, sg_lm_ground: sgLmGround,
    sg_mt_car: sgMtCar, sg_mt_gate: sgMtGate, sg_mt_occ: sgMtOcc, sg_mt_plat: sgMtPlat, sg_mt_office: sgMtOffice,
    sg_cs_cold: sgCsCold, sg_cs_blast: sgCsBlast, sg_cs_dock: sgCsDock, sg_cs_office: sgCsOffice, sg_cs_hall: sgCsHall
  };

  return {
    // Cảnh điều tra được mở rộng thành thế giới panorama có cửa; menu (của mỗi vùng) giữ khung gốc. Khóa lạ rơi về menu Sài Gòn
    scene: (key, doors = []) => {
      if (key === "menu_sg" || !SCENES[key]) return SCENES.menu_sg();
      return widen(key, SCENES[key](), doors);
    },
    portrait,
    // Cho công cụ kiểm tra vụ: cảnh và loại khung camera đã đăng ký chưa (khóa lạ rơi về cảnh mặc định một cách im lặng)
    hasScene: (key) => !!SCENES[key],
    hasCam: (kind) => !!CAM_KINDS[kind],
    evidence(v) {
      if (v.k === "paper") return paper(v);
      if (v.k === "cam") return camView(v);
      if (v.k === "tide") return tideView();
      return "";
    }
  };
})();

export { ART };
