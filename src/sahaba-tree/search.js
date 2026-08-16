import { PEOPLE, pathUp } from "./model.js";
import { isAr, nameOf, tr } from "./i18n.js";
import { skippable, openMany } from "./collapse.js";
import { render, setHighlight } from "./render.js";
import { centerOn } from "./pan-zoom.js";
import { removeVerdict } from "./connect.js";
import { openCard } from "./card.js";
import { esc, q, res } from "./dom-utils.js";

/* -------------------------------------------------------------- search */
let hits = [], hi = -1;

export function initSearch() {
  q.addEventListener("input", () => {
    const v = q.value.trim().toLowerCase();
    if (!v) { res.hidden = true; q.setAttribute("aria-expanded", "false"); return; }
    hits = Object.values(PEOPLE).filter(p =>
      p.lat.toLowerCase().includes(v) || (p.ar || "").includes(q.value.trim()) ||
      (p.kunya || "").toLowerCase().includes(v) ||
      (p.laqab || []).some(l => l.toLowerCase().includes(v))).slice(0, 8);
    hi = -1;
    res.innerHTML = hits.length
      ? hits.map((p, i) => `<button role="option" id="opt${i}" aria-selected="false" data-p="${p.id}">
          <span${isAr() ? ' class="ar"' : ""}>${esc(nameOf(p))}</span>
          <span class="alt">${esc(isAr() ? p.ism : p.ismAr)}</span></button>`).join("")
      : `<div style="padding:12px 14px;color:var(--muted);font-weight:700">${tr("noHit", "No companion by that name yet")}</div>`;
    res.hidden = false; q.setAttribute("aria-expanded", "true");
  });
  q.addEventListener("keydown", e => {
    if (res.hidden || !hits.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      hi = (hi + (e.key === "ArrowDown" ? 1 : -1) + hits.length) % hits.length;
      [...res.children].forEach((c, i) => c.setAttribute && c.setAttribute("aria-selected", i === hi));
      q.setAttribute("aria-activedescendant", "opt" + hi);
    } else if (e.key === "Enter" && hi >= 0) { e.preventDefault(); pickResult(hits[hi].id); }
  });
  res.addEventListener("click", e => { const b = e.target.closest("button[data-p]"); if (b) pickResult(b.dataset.p); });
  document.addEventListener("click", e => { if (!e.target.closest(".search")) res.hidden = true; });
}

function pickResult(pid) {
  res.hidden = true; q.value = ""; q.setAttribute("aria-expanded", "false");
  const p = PEOPLE[pid];
  const path = pathUp(p.node);
  setHighlight({ a: path });
  openMany(path.filter(skippable));
  removeVerdict(); render({ trace: true }); centerOn(p.node); openCard(p.id);
}
