import { DATA } from "./data.js";

/* ---------------------------------------------------------------- model */
export const N = new Map(DATA.nodes.map(n => [n.i, n]));
export const KIDS = new Map();
for (const n of DATA.nodes) { if (!KIDS.has(n.p)) KIDS.set(n.p, []); KIDS.get(n.p).push(n.i); }
export const ROOT = -1;
export const PEOPLE = DATA.people;
export const P_BY_NODE = new Map();
for (const id in PEOPLE) if (PEOPLE[id].node >= 0) P_BY_NODE.set(PEOPLE[id].node, id);

/* Palette darkened until every swatch clears 7:1 against white text (WCAG AAA
   for normal-size text). Verified, not assumed -- see README. */
const PALETTE = ["#2E5B67","#7E3F27","#574B87","#325A30","#91365B","#265789","#654D2E",
                 "#3D5C28","#89442E","#385970","#634B89","#29594E","#7A4E23","#3E5271"];
const CLAN_COLOR = {};
DATA.clans.forEach((c, i) => CLAN_COLOR[c] = PALETTE[i % PALETTE.length]);
export const colorOf = p => CLAN_COLOR[p.clan || p.tribe || "Other"] || "#3A5E66";

export const LEADS = new Set();
(function mark(id) { let hit = P_BY_NODE.has(id);
  for (const k of (KIDS.get(id) || [])) if (mark(k)) hit = true;
  if (hit && id !== ROOT) LEADS.add(id); return hit; })(ROOT);

export const pathUp = id => { const o = []; let c = id;
  while (c !== undefined && c !== ROOT) { o.push(c); c = N.get(c)?.p; if (c === -1) break; } return o; };
