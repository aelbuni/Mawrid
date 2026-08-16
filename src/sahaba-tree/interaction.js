import { N, ROOT } from "./model.js";
import { isAr, SIGN, fmt, tr, T } from "./i18n.js";
import { childrenOf, isOpened, toggleOpen, openMany } from "./collapse.js";
import { render, getNodeEl } from "./render.js";
import { moved } from "./pan-zoom.js";
import { getMode, choose } from "./connect.js";
import { openCard } from "./card.js";
import { say, gLinks, gNodes } from "./dom-utils.js";

/* ---------------------------------------------------------- interaction */
export function initInteraction() {
  gLinks.addEventListener("click", e => {
    if (moved > 6) return;
    const b = e.target.closest(".bubble"); if (!b) return;
    popBubble(b);
  });
  gLinks.addEventListener("keydown", e => {
    const b = e.target.closest(".bubble"); if (!b) return;
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); popBubble(b); }
  });

  gNodes.addEventListener("click", e => {
    if (moved > 6) return;
    const g = e.target.closest(".node"); if (!g) return;
    activate(+g.dataset.id, g.dataset.p);
  });
  /* Arrow-key walking: up and down the generations, and between siblings. */
  gNodes.addEventListener("keydown", e => {
    const g = e.target.closest(".node"); if (!g) return;
    const id = +g.dataset.id;
    const go = t => { const el = getNodeEl(t); if (el) { el.focus(); e.preventDefault(); } };
    const up = SIGN() > 0 ? "ArrowLeft" : "ArrowRight";
    const down = SIGN() > 0 ? "ArrowRight" : "ArrowLeft";
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(id, g.dataset.p); return; }
    if (e.key === up) { const p = N.get(id)?.p; if (p !== undefined && p !== ROOT) go(p); return; }
    if (e.key === down) { const c = childrenOf(id); if (c.length) go(c[0]); return; }
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      const par = N.get(id)?.p;
      const sibs = par === undefined ? childrenOf(ROOT) : childrenOf(par);
      const i = sibs.indexOf(id);
      if (i >= 0) go(sibs[(i + (e.key === "ArrowDown" ? 1 : -1) + sibs.length) % sibs.length]);
    }
  });
}

function popBubble(b) {
  const chain = b.dataset.chain.split(",").filter(Boolean).map(Number);
  openMany(chain);
  say(isAr() ? fmt(T.aShown, { n: chain.length })
             : `${chain.length} generation${chain.length === 1 ? "" : "s"} shown`);
  render();
}

function activate(id, pid) {
  if (pid) { getMode() === "connect" ? choose(pid) : openCard(pid); return; }
  const wasOpen = isOpened(id);
  toggleOpen(id);
  say(wasOpen ? tr("aCollapsed", "Branch closed") : tr("aExpanded", "Branch opened"));
  render();
}
