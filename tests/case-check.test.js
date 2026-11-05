// Công cụ kiểm tra vụ (tools/case-check.mjs): mọi vụ hiện có đều sạch lỗi, và công cụ thật sự bắt được các lỗi dữ liệu hay gặp.
import test from "node:test";
import assert from "node:assert/strict";
import { CASES } from "../src/data/cases.js";
import { checkCase } from "../tools/case-check.mjs";

const clone = (id) => structuredClone(CASES.find((c) => c.id === id));
const errorsOf = (c) => checkCase(c, 0).errors.join("\n");

test("mọi vụ trong trò chơi đều không có lỗi dữ liệu", () => {
  for (const c of CASES) assert.deepEqual(checkCase(c).errors, [], `${c.id}: có lỗi`);
});

test("công cụ báo thông tin hữu ích: số điểm, số kết luận, giờ của lộ trình gợi ý", () => {
  const { info } = checkCase(CASES.find((c) => c.id === "s3"));
  assert.equal(info.points, 30);
  assert.ok(info.conclusions >= 15);
  assert.ok(info.hintHours > 0 && info.hintHours <= 15);
  assert.ok(info.shortest > 0 && info.shortest <= info.hintHours);
  assert.ok(info.alibis.length >= 6);
});

test("bắt được các lỗi dữ liệu hay gặp khi viết vụ mới", () => {
  let c = clone("s3");
  c.deduce.push({ needs: [...c.deduce[0].needs].reverse(), gives: "k_dong_co" });
  assert.match(errorsOf(c), /trùng tập đầu vào/);

  c = clone("s3");
  c.confront.push({ who: "vu", clue: "cam_pad", reveal: "vu_thu", text: "x" });
  assert.match(errorsOf(c), /được mở bởi hai phản ứng/);

  c = clone("s3");
  c.budget = 10;
  assert.match(errorsOf(c), /ngân sách 10 giờ < nửa số điểm/);

  c = clone("s3");
  c.locations[0].hs.push(["khong_co", 500, 500, "x"]);
  assert.match(errorsOf(c), /"khong_co" không có trong actions/);

  c = clone("s3");
  c.locations[0].scene = "sg_khong_co";
  assert.match(errorsOf(c), /chưa đăng ký trong SCENES/);

  c = clone("s3");
  c.actions.find((a) => a.id === "cam_pad").visual.scene = "cam_khong_co";
  assert.match(errorsOf(c), /chưa đăng ký \(CAM_KINDS/);

  c = clone("s3");
  c.world.push({ at: "05:00", kind: "gone", id: "ban_cup", text: "x" });
  assert.match(errorsOf(c), /chỉ "arrive"/);

  c = clone("s3");
  c.actions.find((a) => a.id === "dt_tuyen").lock.code = "52";
  assert.match(errorsOf(c), /mã khóa không khớp/);

  c = clone("s3");
  c.chain.pop();
  assert.match(errorsOf(c), /đúng 3 bước/);

  c = clone("s3");
  c.actions.find((a) => a.id === "k_dong_co").title = "Hung thủ là Quân";
  assert.match(errorsOf(c), /không được kết tội/);

  c = clone("s3");
  c.deduce = c.deduce.filter((d) => d.gives !== "k_dong_co");
  assert.match(errorsOf(c), /kết luận không dòng deduce nào cho ra/);
});

test("bắt được lộ trình gợi ý bị kẹt vì hồ sơ đòi quá nhiều giờ", () => {
  const c = clone("s3");
  for (const a of c.actions.filter((x) => !x.via)) a.cost = 3;
  assert.match(errorsOf(c), /gợi ý bị kẹt/);
});
