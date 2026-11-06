/* Phân tích nền (render/analyze.js): bản tối ưu phải cho cùng kết quả với bản đọc chín ô gốc,
   kể cả ở biên ảnh và với ảnh mỏng một hàng/một cột. */
import test from "node:test";
import assert from "node:assert/strict";
import { soften, normalPixels } from "../src/render/analyze.js";

const BUMP = 1.1;

// Bản gốc (chậm) làm chuẩn so sánh
function softenRef(L, w, h) {
  let src = L;
  for (let pass = 0; pass < 2; pass++) {
    const out = new Float32Array(src.length);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sum = 0;
        for (let j = -1; j <= 1; j++) {
          for (let i = -1; i <= 1; i++) sum += src[Math.min(h - 1, Math.max(0, y + j)) * w + Math.min(w - 1, Math.max(0, x + i))];
        }
        out[y * w + x] = sum / 9;
      }
    }
    src = out;
  }
  return src;
}

function normalRef(L, w, h) {
  const data = new Uint8ClampedArray(w * h * 4);
  const at = (x, y) => L[Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const gx = at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1);
      const gy = at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1);
      const nx = -gx * BUMP, ny = gy * BUMP, nz = 1;
      const len = Math.hypot(nx, ny, nz);
      const o = (y * w + x) * 4;
      data[o] = (nx / len * 0.5 + 0.5) * 255;
      data[o + 1] = (ny / len * 0.5 + 0.5) * 255;
      data[o + 2] = (nz / len * 0.5 + 0.5) * 255;
      data[o + 3] = 255;
    }
  }
  return data;
}

// Ảnh giả định, xác định (không dùng ngẫu nhiên để test ổn định)
function field(w, h) {
  const L = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) L[y * w + x] = (Math.sin(x * 0.9) * Math.cos(y * 1.3) + 1) / 2 * (x % 7 === 0 ? 1 : 0.4);
  }
  return L;
}

const SIZES = [[64, 48], [7, 5], [1, 9], [9, 1], [1, 1], [2, 2]];

test("soften: trùng bản đọc chín ô gốc ở mọi cỡ, kể cả mỏng một hàng/cột", async () => {
  for (const [w, h] of SIZES) {
    const L = field(w, h);
    const got = await soften(L, w, h), want = softenRef(L, w, h);
    assert.equal(got.length, want.length);
    for (let i = 0; i < want.length; i++) assert.ok(Math.abs(got[i] - want[i]) < 1e-5, `${w}×${h} ô ${i}: ${got[i]} khác ${want[i]}`);
  }
});

test("normalPixels: trùng bản gốc (sai lệch tối đa 1 mức màu do làm tròn) và vùng phẳng cho (128,128,255)", async () => {
  for (const [w, h] of SIZES) {
    const L = field(w, h);
    const got = await normalPixels(L, w, h), want = normalRef(L, w, h);
    assert.equal(got.length, want.length);
    for (let i = 0; i < want.length; i++) assert.ok(Math.abs(got[i] - want[i]) <= 1, `${w}×${h} byte ${i}: ${got[i]} khác ${want[i]}`);
  }
  const flat = await normalPixels(new Float32Array(16).fill(0.5), 4, 4);
  assert.deepEqual([...flat.slice(0, 4)], [128, 128, 255, 255]);
});

test("soften và normalPixels nhường luồng chính qua tick() ở cuối mỗi hàng", async () => {
  let calls = 0;
  const tick = async () => { calls++; };
  const L = field(20, 10);
  await soften(L, 20, 10, tick);
  await normalPixels(L, 20, 10, tick);
  assert.ok(calls >= 10 * 4 + 10, `chỉ gọi tick ${calls} lần`);
});
