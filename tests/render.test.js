// Số đo nhân vật mà art.js gắn vào mỗi cảnh: lớp Phaser dựa vào đó để làm người thở và đổ bóng.
import test from "node:test";
import assert from "node:assert/strict";
import { ART } from "../src/art/art.js";
import { CASES } from "../src/data/cases.js";
import { parseFigures } from "../src/render/actors.js";
import { WORLD_W, WORLD_H } from "../src/world/layout.js";

const sceneKeys = [...new Set(CASES.flatMap((c) => c.locations.map((l) => l.scene)))];

test("parseFigures đọc đủ các trường và cộng độ dịch của khung cảnh gốc", () => {
  const svg = '<svg><g class="fig" data-fig="330,300.5,528.8,37,0,1,1c1511"><path/></g><g class="fig" data-fig="800,240,400,37,1,1.25,111"></g></svg>';
  const [a, b] = parseFigures(svg, 400);
  assert.deepEqual(a, { x: 730, top: 300.5, bot: 528.8, hw: 37, seated: false, s: 1, shoe: "1c1511" });
  assert.equal(b.seated, true);
  assert.equal(b.s, 1.25);
  assert.equal(b.shoe, "111");
  assert.deepEqual(parseFigures("<svg></svg>", 0), []);
});

test("mọi cảnh điều tra dựng được và người trong cảnh nằm gọn trong thế giới", () => {
  let total = 0;
  for (const key of sceneKeys) {
    const svg = ART.scene(key, []);
    const shift = svg.includes("translate(400 0)") ? 400 : 0;
    const figs = parseFigures(svg, shift);
    const drawn = (svg.match(/class="fig"/g) || []).length;
    assert.equal(figs.length, drawn, `${key}: số nhóm fig khác số người đọc được`);
    total += figs.length;
    for (const f of figs) {
      for (const v of [f.x, f.top, f.bot, f.hw, f.s]) assert.ok(Number.isFinite(v), `${key}: số đo không hợp lệ`);
      assert.ok(f.x > 0 && f.x < WORLD_W, `${key}: người ngoài thế giới (x=${f.x})`);
      assert.ok(f.top < f.bot && f.top > -50 && f.bot < WORLD_H + 80, `${key}: người ngoài khung (top=${f.top}, bot=${f.bot})`);
      assert.match(f.shoe, /^([0-9a-f]{3}|[0-9a-f]{6})$/i, `${key}: màu giày lạ`);
    }
  }
  assert.ok(total > 10, "phải có người trong các cảnh");
});

test("nhóm fig không làm vỡ cấu trúc SVG của cảnh", () => {
  for (const key of sceneKeys) {
    const svg = ART.scene(key, []);
    const opens = (svg.match(/<g[\s>]/g) || []).length;
    const closes = (svg.match(/<\/g>/g) || []).length;
    assert.equal(opens, closes, `${key}: số thẻ <g> mở và đóng không khớp`);
  }
});
