import { isAr } from "./i18n.js";

/* ------------------------------------------------------- text measurement */
/* v1: fixed column width, guessed from character count -> overlapped.
   v2: measured with ctx.measureText -> still overflowed, because canvas font
   loading is NOT reliably synced with the page. On first load only Latin-700
   (the main name) and Arabic-600 (the small alt line under it) ever get
   painted, so only those get fetched. Arabic-700 -- the WEIGHT the main name
   uses once you switch language -- is never touched until the moment you
   flip, and canvas silently measures it with a fallback font in the meantime.
   The pill is sized from that wrong number and the real glyphs overflow it.

   Fix has two layers:
   1. Explicitly load every weight/script combo BEFORE trusting any
      measurement, via the Font Loading API, which -- unlike ctx.font --
      returns a promise that resolves only once that exact face is ready.
   2. Self-heal: after text actually lands in the DOM, read its REAL width
      back with getComputedTextLength() and correct the cache if canvas
      under-measured it, then relayout. This does not depend on correctly
      guessing every race in advance. */
const ctx = document.createElement("canvas").getContext("2d");
const mcache = new Map();
const FONT_SPECS = [["700", 15], ["600", 12.5]];
function fkey(text, weight, size) { return weight + "|" + size + "|" + text; }
export function measure(text, weight, size) {
  if (!text) return 0;
  const key = fkey(text, weight, size);
  let v = mcache.get(key);
  if (v === undefined) {
    ctx.font = `${weight} ${size}px "Baloo Bhaijaan 2", Nunito, sans-serif`;
    v = ctx.measureText(text).width; mcache.set(key, v);
  }
  return v;
}
export function preloadFonts() {
  if (!("fonts" in document)) return Promise.resolve();
  const sample = "Ali Umar علي عمر"; // latin + arabic probe
  const loads = FONT_SPECS.flatMap(([w, s]) =>
    [`${w} ${s}px "Baloo Bhaijaan 2"`].map(spec =>
      document.fonts.load(spec, sample).catch(() => {})));
  const ready = Promise.all(loads).then(() => document.fonts.ready).catch(() => {});
  // A stalled font load must never leave a child staring at a blank screen --
  // fall through to the canvas estimate (self-heal will correct it afterward).
  const timeout = new Promise(res => setTimeout(res, 1200));
  return Promise.race([ready, timeout]);
}
/* After a node's <text> elements are actually in the DOM, verify the canvas
   estimate against the real rendered length. Returns true if the cache had
   to be corrected (caller should relayout). */
export function verifyRendered(g, weight, size, text) {
  if (!text) return false;
  const el = weight === "700" ? g.querySelector(".nm") : g.querySelector(".alt");
  if (!el || !el.getComputedTextLength) return false;
  const real = el.getComputedTextLength();
  const key = fkey(text, weight, size);
  const had = mcache.get(key) ?? 0;
  if (real > had + 0.5) { mcache.set(key, real); return true; }
  return false;
}

export const PAD = 36, GAP = 30;
// Arabic ascenders and descenders in Baloo Bhaijaan 2 run taller than Latin,
// so the pill and the row both grow rather than clipping the glyphs.
export const PILLH = () => isAr() ? 46 : 38;
export const ROWH  = () => isAr() ? 62 : 52;
export function pillW(label, alt) {
  return Math.max(100, Math.ceil(Math.max(measure(label, "700", 15),
                                          measure(alt || "", "600", 12.5))) + PAD);
}
