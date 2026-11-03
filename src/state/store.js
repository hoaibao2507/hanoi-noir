/* Kho trạng thái nhỏ: một đối tượng, cập nhật bằng patch, báo cho người đăng ký. */
export function createStore(initial) {
  let state = initial;
  const subs = new Set();
  return {
    get: () => state,
    // quiet: đổi state mà không báo ai. Dùng khi vẽ lại sẽ phá thao tác đang dở (gõ chữ vào ô ghi chú mất focus)
    set(patch, quiet = false) {
      state = { ...state, ...patch };
      if (!quiet) subs.forEach((fn) => fn(state));
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    }
  };
}
