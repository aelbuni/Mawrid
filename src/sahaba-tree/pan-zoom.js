import { SIGN } from "./i18n.js";
import { getLaid, getBounds } from "./render.js";
import { svg, cam, stage, tl } from "./dom-utils.js";

/* ------------------------------------------------------------ pan / zoom */
let tx = 40, ty = 40, k = 1;
const apply = () => cam.setAttribute("transform", `translate(${tx},${ty}) scale(${k})`);
/* Two different jobs. On open, legibility wins: a child cannot read 6px
   names, so we clamp the zoom and let them pan. The fit button is the
   deliberate "show me everything" overview and may go small. */
export function fit({ readable = false } = {}) {
  const { H, minX, maxX } = getBounds();
  const r = stage.getBoundingClientRect(), W = maxX - minX;
  const raw = Math.min((r.width - 70) / W, (r.height - 70) / (H + 40), 1.05);
  k = readable ? Math.min(1.0, Math.max(0.68, raw)) : Math.max(.22, raw);
  tx = readable ? (SIGN() > 0 ? 40 - minX * k : r.width - 40 - maxX * k)
                : (r.width - W * k) / 2 - minX * k;
  // Center vertically rather than pinning to a fixed top offset. Readable
  // mode floors the zoom at 0.68 for legibility, which for a tall tree means
  // the rendered content can be taller than the viewport -- a fixed ty=28
  // then showed only the sparse top of the tree, silently dumping most of
  // the companions below the fold on first load. Centering (allowing ty to
  // go negative when content is taller than the viewport) balances the
  // overflow between top and bottom instead of hiding everything past one
  // screen height; a short tree still lands centered exactly as before.
  ty = (r.height - H * k) / 2 + (readable ? 16 : 12);
  apply();
}
export function zoom(f, cx, cy) {
  const r = stage.getBoundingClientRect();
  cx = cx ?? r.width / 2; cy = cy ?? r.height / 2;
  const nk = Math.min(2.4, Math.max(.2, k * f));
  tx = cx - (cx - tx) * (nk / k); ty = cy - (cy - ty) * (nk / k); k = nk; apply();
}
export function centerOn(nodeId) {
  const n = getLaid().find(x => x.id === nodeId); if (!n) return;
  const r = stage.getBoundingClientRect();
  tx = r.width / 2 - n.x * k; ty = r.height / 2 - n.y * k; apply();
}

export let moved = 0;

export function initPanZoom() {
  document.getElementById("zin").onclick = () => zoom(1.3);
  document.getElementById("zout").onclick = () => zoom(1 / 1.3);
  document.getElementById("zfit").onclick = () => fit();

  let drag = null, captured = false;
  // setPointerCapture on a container, called on EVERY pointerdown, is a known
  // cross-browser interoperability trap (w3c/pointerevents #75, #356): once a
  // container captures the pointer, several engines stop correctly targeting
  // the "click" event at whatever child was actually under the finger --
  // worst on touch, where the browser may have already implicitly captured to
  // the child first, and the container's capture call steals it, sometimes
  // leaving the child unable to receive events at all for the rest of that
  // gesture. Capturing is deferred until real drag movement is confirmed, so a
  // stationary tap never captures anything and native, uncaptured hit-testing
  // is what resolves the click -- correctly, on every child, every time.
  stage.addEventListener("pointerdown", e => {
    if (e.target.closest(".zoom,.card,.verdict,.timeline")) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, tx, ty }; moved = 0; captured = false;
  });
  stage.addEventListener("pointermove", e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
    if (!captured && moved > 6) {
      captured = true;
      svg.classList.add("drag");
      try { stage.setPointerCapture(drag.id); } catch {}
    }
    if (captured) { tx = drag.tx + dx; ty = drag.ty + dy; apply(); }
  });
  const endDrag = () => {
    if (captured && drag) { try { stage.releasePointerCapture(drag.id); } catch {} }
    drag = null; captured = false; svg.classList.remove("drag");
  };
  stage.addEventListener("pointerup", endDrag); stage.addEventListener("pointercancel", endDrag);
  stage.addEventListener("wheel", e => { e.preventDefault();
    zoom(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.offsetX, e.offsetY); }, { passive: false });
  let pinch = null;
  stage.addEventListener("touchstart", e => { if (e.touches.length === 2) {
    const [a, b] = e.touches; pinch = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); } }, { passive: true });
  stage.addEventListener("touchmove", e => { if (e.touches.length === 2 && pinch) {
    const [a, b] = e.touches, d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    zoom(d / pinch, (a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2); pinch = d; } }, { passive: true });
  stage.addEventListener("touchend", () => pinch = null);

  addEventListener("resize", () => { if (tl.hidden) apply(); });
}
