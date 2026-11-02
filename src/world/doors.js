/* Cửa đi giữa các địa điểm: mỗi địa điểm khác có một cửa, xếp hai bên thế giới. */
import { doorPlan } from "./layout.js";

// Trả về danh sách cửa cho địa điểm đang đứng: { loc, side, slot, x, w, name, time }
// slot là thứ tự cửa trên cùng một bên (0 hoặc 1): hai cửa kề nhau thì biển tên của cửa thứ hai được nâng lên để không đè nhau
export function doorsFor(locations, current) {
  const others = locations
    .map((L, i) => ({ L, i }))
    .filter((o) => o.i !== current);
  return doorPlan(others.length).map((d) => {
    const { L, i } = others[d.index];
    return { side: d.side, slot: Math.floor(d.index / 2), x: d.x, w: d.w, loc: i, name: L.name, time: L.time };
  });
}
