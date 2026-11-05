/* =====================================================================
   HANOI NOIR · Dữ liệu vụ án (ba vụ Sài Gòn nằm ở sg.js, sg-vani.js và sg-bitexco.js)
   - Mỗi vụ: nghi phạm, hành động điều tra, địa điểm và tọa độ điểm điều tra.
   - Tọa độ (x, y) của điểm điều tra tính trên khung cảnh 1600 × 900 (tỷ lệ 16:9).
   - Mỗi hành động thuộc đúng một địa điểm.
   ===================================================================== */

import { SG_CASES } from "./sg.js";

/* Phân loại hồ sơ: màu nhấn và biểu tượng tương ứng */
export const TYPES = {
  "Lời khai":  { cls: "loi", icon: "fa-comments" },
  "Vật chứng": { cls: "vat", icon: "fa-magnifying-glass" },
  "Camera":    { cls: "cam", icon: "fa-video" },
  "Hồ sơ":     { cls: "ho",  icon: "fa-file-lines" },
  "Biên bản":  { cls: "bb",  icon: "fa-file-circle-check" },
  "Kết luận":  { cls: "kl",  icon: "fa-lightbulb" }
};

/* Vùng phá án: mỗi vụ thuộc một vùng (trường "region"). "scene" là cảnh nền của menu khi chọn vùng đó.
   Hiện chỉ còn vùng Sài Gòn; khi có từ hai vùng trở lên menu mới hiện thanh chọn vùng. */
export const REGIONS = [
  { id: "sg", name: "Sài Gòn", short: "Sài Gòn", icon: "fa-city", scene: "menu_sg",
    tagline: "Vụ án Sài Gòn · đồng hồ lệch, ngoại phạm vòng tròn, nhiều kẻ liên đới",
    blurb: "Triều cường, hầm xe, camera. Kẻ thủ ác không còn đơn độc, và các con số có thể nói dối." }
];

// Danh sách phẳng của mọi vụ. Chỉ số trong danh sách này là chỉ số vụ dùng khắp trò chơi và trong bản lưu ván đang chơi
export const CASES = [...SG_CASES];

export const casesOf = (region) => CASES.filter((c) => c.region === region);
