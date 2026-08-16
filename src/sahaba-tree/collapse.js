import { KIDS, LEADS, P_BY_NODE } from "./model.js";

/* --------------------------------------------------------------- collapse */
/* A child should not have to scroll through the eleven single-child
   generations between Qusayy and Adnan to find the next family. Those runs
   fold into one tappable "+N" bubble on the branch. A node folds only if it
   is a pass-through: not a Companion, exactly one child, not already opened. */
const opened = new Set();
const rawKids = id => (KIDS.get(id) || []).filter(k => LEADS.has(k));
export const skippable = k => !P_BY_NODE.has(k) && rawKids(k).length === 1 && !opened.has(k);

export function visKids(id) {
  return rawKids(id).map(k => {
    let n = k; const chain = [];
    while (skippable(n)) { chain.push(n); n = rawKids(n)[0]; }
    return { id: n, skipped: chain.length, chain };
  });
}
export const childrenOf = id => visKids(id).map(v => v.id);

export const isOpened = id => opened.has(id);
export const openNode = id => opened.add(id);
export const openMany = ids => ids.forEach(id => opened.add(id));
export const toggleOpen = id => { const was = opened.has(id); was ? opened.delete(id) : opened.add(id); return was; };
export const clearOpened = () => opened.clear();
