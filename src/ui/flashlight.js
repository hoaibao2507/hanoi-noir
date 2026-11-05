/* =====================================================================
   Dấu vết ẩn: một số điểm điều tra chỉ hiện khi đèn pin quét tới.
   Trong vùng sáng thì điểm đó hiện rõ; hơi xa một chút thì mờ thoáng để người chơi biết có gì đó ở đây.
   Điểm đã làm thì luôn hiện (templates.js gắn sẵn is-lit cho nó).
   ===================================================================== */
const LIT = 140;  // bán kính đèn pin làm sáng hẳn, đơn vị px
const NEAR = 260; // bán kính hé sáng

// Gọi mỗi khi đèn pin đổi chỗ hoặc cảnh dịch chuyển (mỗi khung hình khi kéo cảnh)
export function lightSecrets(s) {
  const els = document.querySelectorAll(".hs.is-secret:not(.is-done)");
  if (!els.length) return;
  // Đọc hết vị trí rồi mới ghi class: xen kẽ đọc và ghi bắt trình duyệt tính lại bố cục cho từng phần tử
  const dist = Array.from(els, (el) => {
    const r = el.getBoundingClientRect(); // điểm neo nằm giữa thẻ điều tra
    return Math.hypot(r.left - s.x, r.top - s.y);
  });
  els.forEach((el, i) => {
    el.classList.toggle("is-lit", dist[i] < LIT);
    el.classList.toggle("is-near", dist[i] >= LIT && dist[i] < NEAR);
  });
}
