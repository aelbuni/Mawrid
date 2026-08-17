import { DATA } from "./data.js";
import { N, colorOf } from "./model.js";
import { isAr, SIGN, fmt, T } from "./i18n.js";
import { layout, labelsFor } from "./layout.js";
import { childrenOf } from "./collapse.js";
import { PILLH, verifyRendered } from "./text-measure.js";
import { gNodes, gLinks, esc } from "./dom-utils.js";

const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* highlight state, set by card.js / search.js via setHighlight to trace a
   companion's family line */
let litA = new Set();
export const setHighlight = (ids = []) => { litA = new Set(ids); };
export const clearHighlight = () => setHighlight();

/* current layout snapshot, refreshed on every render() */
let laid = [], links = [], H = 0, minX = 0, maxX = 0;
export const getLaid = () => laid;
export const getBounds = () => ({ H, minX, maxX });
export const getNodeEl = id => els.get(id)?.g;

/* ------------------------------------------------ keyed render + tweening */
/* v1 rebuilt the whole SVG with innerHTML on every change, which destroyed
   any chance of animation -- that is what made it feel static. Elements are
   now kept and reused by id, and positions are tweened on a rAF loop so the
   tree grows and settles instead of teleporting. */
const els = new Map();                     // id -> {g, sig}
const cur = new Map();                     // id -> {x,y} live position
const tgt = new Map();
let anim = null;

export function resetElements() {
  for (const [, rec] of els) rec.g.remove();
  els.clear(); cur.clear(); tgt.clear();
  for (const [, el] of linkEls) el.remove(); linkEls.clear();
  for (const [, el] of bubbleEls) el.remove(); bubbleEls.clear();
}

function nodeInner(n) {
  const [lab, alt, p] = labelsFor(n.id);
  const sg = SIGN(), w = n.w, ph = PILLH();
  const px = sg > 0 ? -10 : 10 - w, tx0 = sg > 0 ? 8 : -8;
  // text-anchor's start/end are defined against the element's OWN `direction`
  // property, not against the script of the characters inside it. Leaving
  // direction unset means it falls back to whatever the SVG inherits from
  // its ancestors -- ambient, and not something to depend on. Both lines get
  // an EXPLICIT direction so the anchor's meaning is pinned down regardless
  // of inheritance (the earlier "lines flying apart" bug was from applying
  // direction to only one of the two lines, not from applying it at all).
  //
  // With an explicit direction, "start" is the edge nearest the reading
  // start: the LEFT edge under ltr, the RIGHT edge under rtl. The pill's
  // fixed edge (where the branch attaches) sits on the right in RTL and the
  // left in LTR -- exactly the "start" edge in both cases -- so anchor is
  // "start" unconditionally; only `direction` and the geometry (px/tx0,
  // already sign-aware) differ between the two directions.
  const dir = isAr() ? "rtl" : "ltr";
  const fill = p ? colorOf(p) : "var(--paper)";
  const y1 = alt ? (isAr() ? -8 : -6) : 1, y2 = isAr() ? 11 : 10;
  let s = `<rect class="hit" x="${px - 6}" y="${-ph / 2 - 5}" width="${w + 12}" height="${ph + 10}"/>`;
  s += `<rect class="pill" x="${px}" y="${-ph / 2}" width="${w}" height="${ph}" fill="${fill}"/>`;
  s += `<text class="nm" x="${tx0}" y="${y1}" text-anchor="start" direction="${dir}">${esc(lab)}</text>`;
  if (alt) s += `<text class="alt" x="${tx0}" y="${y2}" text-anchor="start" direction="${dir}">${esc(alt)}</text>`;
  if (p && p.rank) { const sx = sg > 0 ? w - 16 : 16 - w;
    s += `<circle class="star" cx="${sx}" cy="${-ph / 2}" r="9"/>` +
         `<text x="${sx}" y="${-ph / 2}" text-anchor="middle" dominant-baseline="central" ` +
         `style="font-size:10px;font-weight:800;fill:#4A3100;font-family:Nunito">${p.rank}</text>`; }
  return s;
}

export function render({ animate = true, trace = false, _pass = 0 } = {}) {
  ({ laid, links, H, minX, maxX } = layout());
  const dimming = litA.size > 0;
  const seen = new Set();

  for (const n of laid) {
    seen.add(n.id);
    const [lab, alt, p] = labelsFor(n.id);
    const lit = litA.has(n.id);
    let cls = "node " + (p ? "sah" : "anc");
    if (dimming && !lit) cls += " dim";
    const sig = [lab, alt, n.w, SIGN(), cls, p ? colorOf(p) : "a"].join("|");

    let rec = els.get(n.id);
    if (!rec) {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.dataset.id = n.id;
      gNodes.appendChild(g);
      rec = { g, sig: null }; els.set(n.id, rec);
      // grow out of the parent so expanding reads as the tree branching
      const par = N.get(n.id)?.p, from = cur.get(par);
      cur.set(n.id, from ? { x: from.x, y: from.y } : { x: n.x, y: n.y });
      if (!REDUCED) { g.classList.add("enter"); setTimeout(() => g.classList.remove("enter"), 420); }
    }
    if (rec.sig !== sig) { rec.g.innerHTML = nodeInner(n); rec.sig = sig; }
    rec.g.setAttribute("class", cls);
    if (p) rec.g.dataset.p = p.id; else delete rec.g.dataset.p;
    rec.g.setAttribute("aria-label", ariaFor(n, p, lab));
    tgt.set(n.id, { x: n.x, y: n.y });
  }
  for (const [id, rec] of els) if (!seen.has(id)) { rec.g.remove(); els.delete(id); cur.delete(id); tgt.delete(id); }

  drawLinks(dimming, trace);
  if (animate && !REDUCED) startTween(); else { for (const [id, t] of tgt) cur.set(id, { ...t }); paint(); }
  document.getElementById("stat").textContent = isAr()
    ? fmt(T.stat, { n: DATA.stats.people, e: DATA.stats.edges })
    : `${DATA.stats.people} companions · ${DATA.stats.edges} family links`;

  // Self-heal: the canvas estimate can still miss a font-loading edge case
  // that a preload didn't anticipate. Check the ACTUAL rendered text against
  // what the pill was sized for; if reality is wider, correct the cache and
  // relayout once. Bounded to one corrective pass so a genuine oscillation
  // can't loop forever.
  if (_pass < 2) {
    let dirty = false;
    for (const n of laid) {
      const rec = els.get(n.id); if (!rec) continue;
      const [lab, alt] = labelsFor(n.id);
      if (verifyRendered(rec.g, "700", 15, lab)) dirty = true;
      if (alt && verifyRendered(rec.g, "600", 12.5, alt)) dirty = true;
    }
    if (dirty) { render({ animate: false, trace: false, _pass: _pass + 1 }); return; }
  }
}

function ariaFor(n, p, lab) {
  if (p) return `${lab}. ${isAr() ? T.lblFamily : "Family"}: ${isAr() ? (p.groupAr || p.clan) : (p.clan || p.tribe)}.`;
  const k = childrenOf(n.id).length;
  return `${lab}. ${k} ${isAr() ? "من الفروع" : (k === 1 ? "branch" : "branches")}.`;
}

let linkEls = new Map(), bubbleEls = new Map();
function drawLinks(dimming, trace) {
  const seen = new Set(), bseen = new Set();
  let i = 0;
  for (const L of links) {
    const key = L.a + "-" + L.b; seen.add(key);
    let el = linkEls.get(key);
    if (!el) {
      el = document.createElementNS("http://www.w3.org/2000/svg", "path");
      gLinks.appendChild(el); linkEls.set(key, el);
    }
    let cls = "link";
    if (N.get(L.b)?.c) cls += " spine";
    if (N.get(L.b)?.x) cls += " approx";
    const lit = litA.has(L.b) ? "lit-a" : null;
    if (lit) cls += " " + lit; else if (dimming) cls += " dim";
    if (lit && trace && !REDUCED) { cls += " tracing"; el.style.setProperty("--d", (i++ * 55) + "ms"); }
    else el.style.removeProperty("--d");
    el.setAttribute("class", cls);

    // A folded run gets a tappable bubble on its branch showing how many
    // generations are tucked away. Popping it is the main thing to fiddle with.
    if (L.skipped > 0) {
      bseen.add(key);
      let b = bubbleEls.get(key);
      if (!b) {
        b = document.createElementNS("http://www.w3.org/2000/svg", "g");
        b.setAttribute("class", "bubble");
        b.setAttribute("tabindex", "0");
        b.setAttribute("role", "button");
        b.dataset.chain = L.chain.join(",");
        b.innerHTML = `<circle class="hit" r="22"/><circle class="ring" r="15"/><text text-anchor="middle" dominant-baseline="central">+${L.skipped}</text>`;
        gLinks.appendChild(b); bubbleEls.set(key, b);
      }
      b.dataset.chain = L.chain.join(",");
      b.querySelector("text").textContent = "+" + L.skipped;
      b.setAttribute("aria-label", isAr()
        ? fmt(T.aHidden, { n: L.skipped }) : `Show ${L.skipped} hidden generation${L.skipped === 1 ? "" : "s"}`);
      b.setAttribute("class", "bubble" + (dimming && !lit ? " dim" : ""));
    }
  }
  for (const [k, el] of linkEls) if (!seen.has(k)) { el.remove(); linkEls.delete(k); }
  for (const [k, el] of bubbleEls) if (!bseen.has(k)) { el.remove(); bubbleEls.delete(k); }
}

function paint() {
  for (const [id, rec] of els) {
    const c = cur.get(id); if (!c) continue;
    rec.g.setAttribute("transform", `translate(${c.x.toFixed(1)},${c.y.toFixed(1)})`);
  }
  const sg = SIGN();
  const wOf = id => laid.find(n => n.id === id)?.w || 0;
  for (const L of links) {
    const key = L.a + "-" + L.b, el = linkEls.get(key); if (!el) continue;
    const na = cur.get(L.a), nb = cur.get(L.b); if (!na || !nb) continue;
    const wa = wOf(L.a);
    const x1 = na.x + (sg > 0 ? wa - 10 : 10 - wa), x2 = nb.x - 10 * sg;
    const mx = (x1 + x2) / 2;
    el.setAttribute("d", `M${x1.toFixed(1)} ${na.y.toFixed(1)} C${mx.toFixed(1)} ${na.y.toFixed(1)} ${mx.toFixed(1)} ${nb.y.toFixed(1)} ${x2.toFixed(1)} ${nb.y.toFixed(1)}`);
    if (el.classList.contains("tracing"))
      el.style.setProperty("--len", (Math.hypot(x2 - x1, nb.y - na.y) + 40).toFixed(0));
    const b = bubbleEls.get(key);
    if (b) b.setAttribute("transform",
      `translate(${mx.toFixed(1)},${((na.y + nb.y) / 2).toFixed(1)})`);
  }
}

function startTween() {
  if (anim) cancelAnimationFrame(anim);
  const t0 = performance.now(), DUR = 460;
  const from = new Map();
  for (const [id, t] of tgt) from.set(id, { ...(cur.get(id) || t) });
  const ease = x => 1 - Math.pow(1 - x, 3);
  const step = now => {
    const u = Math.min(1, (now - t0) / DUR), e = ease(u);
    for (const [id, t] of tgt) {
      const f = from.get(id) || t;
      cur.set(id, { x: f.x + (t.x - f.x) * e, y: f.y + (t.y - f.y) * e });
    }
    paint();
    if (u < 1) anim = requestAnimationFrame(step); else anim = null;
  };
  anim = requestAnimationFrame(step);
}
