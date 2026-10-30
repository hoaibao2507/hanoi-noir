/* =====================================================================
   Bố cục thế giới panorama.
   - Mỗi địa điểm có một thế giới rộng WORLD_W × WORLD_H đơn vị.
   - Khung cảnh gốc (COMP_W × WORLD_H, tọa độ điểm điều tra) đặt ở giữa, lệch OX.
   - Hai bên là phòng hoặc phố nối tiếp, có sẵn chỗ cho các cửa đi.
   ===================================================================== */

export const WORLD_H = 900;
export const WORLD_W = 2400;
export const COMP_W = 1600;
export const OX = 400;
export const DOOR_W = 130;

// Vị trí các cửa ở hai bên (đơn vị thế giới, tính từ mép trái của thế giới)
export const DOOR_SLOTS = {
  left: [40, 230],
  right: [2040, 2220]
};

// Thế giới của một cảnh: menu dùng khung 1600, các cảnh điều tra dùng khung 2400
export function worldWidth(sceneKey) {
  return sceneKey === "menu" ? COMP_W : WORLD_W;
}

// Xếp cửa cho các địa điểm khác: xen kẽ trái, phải, rồi lấp các khe kế tiếp
export function doorPlan(count) {
  const doors = [];
  for (let j = 0; j < count; j++) {
    const side = j % 2 === 0 ? "left" : "right";
    const slot = Math.floor(j / 2);
    doors.push({ side, x: DOOR_SLOTS[side][slot], index: j });
  }
  return doors;
}

// Đổi tọa độ khung cảnh gốc (1600 × 900) sang tọa độ thế giới
export const toWorldX = (x) => x + OX;
