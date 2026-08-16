import { removeVerdict } from "./connect.js";
import { closeCard } from "./card.js";
import { svg, tl, hideHint } from "./dom-utils.js";

/* ----------------------------------------------------------------- tabs */
export function initTabs() {
  document.querySelectorAll(".tab").forEach(t => t.onclick = () => {
    document.querySelectorAll(".tab").forEach(x => x.setAttribute("aria-selected", x === t));
    const tree = t.dataset.view === "tree";
    svg.style.display = tree ? "block" : "none";
    document.querySelector(".zoom").style.display = tree ? "flex" : "none";
    tl.hidden = tree; if (!tree) hideHint();
    removeVerdict(); closeCard();
  });
}
