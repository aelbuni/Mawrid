import { N, ROOT, PEOPLE, P_BY_NODE } from "./model.js";
import { nameOf, altOf, nodeName, nodeAlt, SIGN } from "./i18n.js";
import { pillW, PAD, GAP, ROWH } from "./text-measure.js";
import { visKids } from "./collapse.js";

/* --------------------------------------------------------------- layout */
export function labelsFor(id) {
  const p = P_BY_NODE.has(id) ? PEOPLE[P_BY_NODE.get(id)] : null, d = N.get(id);
  return p ? [nameOf(p), altOf(p), p] : [nodeName(d), nodeAlt(d), null];
}

/* Lays out the currently-visible tree (respecting collapse.js's `opened`
   set) and returns the geometry render.js/pan-zoom.js need to draw and
   navigate it. Pure: takes no DOM, keeps no state of its own. */
export function layout() {
  const laid = [], links = [];
  const depthW = [];
  let y = 0;
  const place = (id, depth) => {
    const kids = visKids(id);
    const [lab, alt] = labelsFor(id);
    const w = pillW(lab, alt);
    depthW[depth] = Math.max(depthW[depth] || 0, w);
    const node = { id, depth, w };
    if (!kids.length) { node.y = y; y += ROWH(); }
    else {
      const ys = kids.map(kd => place(kd.id, depth + 1));
      node.y = (ys[0] + ys[ys.length - 1]) / 2;
      kids.forEach(kd => links.push({ a: id, b: kd.id, skipped: kd.skipped, chain: kd.chain }));
    }
    laid.push(node);
    return node.y;
  };
  visKids(ROOT).forEach(kd => place(kd.id, 0));

  // Column origins: each column clears the widest pill of the one before, so
  // wider Arabic labels push the next column across instead of colliding.
  const colX = [0];
  for (let d = 1; d < depthW.length; d++) colX[d] = colX[d - 1] + depthW[d - 1] + GAP;
  const sg = SIGN();
  for (const n of laid) n.x = colX[n.depth] * sg;

  const H = y;
  const ends = laid.map(n => sg > 0 ? n.x + n.w : n.x - n.w);
  const minX = Math.min(...laid.map(n => n.x), ...ends) - 40;
  const maxX = Math.max(...laid.map(n => n.x), ...ends) + 40;
  return { laid, links, H, minX, maxX };
}
