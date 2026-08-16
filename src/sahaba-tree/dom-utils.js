/* Single source of truth for the DOM elements shared across modules, so each
   one doesn't re-query the document for the same nodes. */
export const svg = document.getElementById("tree");
export const cam = document.getElementById("cam");
export const gLinks = document.getElementById("links");
export const gNodes = document.getElementById("nodes");
export const stage = document.getElementById("stage");
export const hint = document.getElementById("hint");
export const live = document.getElementById("live");
export const card = document.getElementById("card");
export const tl = document.getElementById("timeline");
export const q = document.getElementById("q");
export const res = document.getElementById("res");

export const esc = s => (s || "").replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));
export const say = t => { live.textContent = ""; setTimeout(() => live.textContent = t, 40); };
export const showHint = t => { hint.textContent = t; hint.hidden = false; };
export const hideHint = () => hint.hidden = true;
