/* =====================================================================
   Dấu vết ẩn: một số điểm điều tra chỉ hiện khi đèn pin quét tới.
   Trong vùng sáng thì điểm đó hiện rõ; hơi xa một chút thì mờ thoáng để người chơi biết có gì đó ở đây.
   Điểm đã làm thì luôn hiện (templates.js gắn sẵn is-lit cho nó).
   ===================================================================== */
const LIT = 140;  // bán kính đèn pin làm sáng hẳn, đơn vị px
const NEAR = 260; // bán kính hé sáng

// Gọi mỗi khi đèn pin đổi chỗ hoặc cảnh dịch chuyển
export function lightSecrets(s) {
  for (const el of document.querySelectorAll(".hs.is-secret:not(.is-done)")) {
    const r = el.getBoundingClientRect(); // điểm neo nằm giữa thẻ điều tra
    const d = Math.hypot(r.left - s.x, r.top - s.y);
    el.classList.toggle("is-lit", d < LIT);
    el.classList.toggle("is-near", d >= LIT && d < NEAR);
  }
}
