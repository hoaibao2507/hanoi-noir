// Vẽ component Sổ tay (Preact) ra chuỗi HTML để test trong Node, không cần trình duyệt
import { h } from "preact";
import { renderToString } from "preact-render-to-string";
import { Notebook, ClueList, findCountText } from "../src/ui/notebook.js";

// ui = trạng thái giao diện ban đầu { q, type, fav, open }
export const notebookHTML = (game, c, ui = {}) => renderToString(h(Notebook, { game, c, ui }));

// Danh sách thẻ hồ sơ khớp bộ lọc f = { q, type, fav }
export const clueListHTML = (game, c, f = {}) => renderToString(h(ClueList, { game, c, f, ctx: { clear() {}, onNote() {}, open: new Set(), focus: { current: null } } }));

export { findCountText };
