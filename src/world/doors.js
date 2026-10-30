/* Cửa đi giữa các địa điểm: mỗi địa điểm khác có một cửa, xếp hai bên thế giới. */
import { doorPlan } from "./layout.js";

// Trả về danh sách cửa cho địa điểm đang đứng: { loc, side, x, name, time }
export function doorsFor(locations, current) {
  const others = locations
    .map((L, i) => ({ L, i }))
    .filter((o) => o.i !== current);
  return doorPlan(others.length).map((d) => {
    const { L, i } = others[d.index];
    return { side: d.side, x: d.x, loc: i, name: L.name, time: L.time };
  });
}
