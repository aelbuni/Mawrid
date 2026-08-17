import { closeCard } from "./card.js";
import { svg, tl, hideHint, showTreeView } from "./dom-utils.js";

/* ----------------------------------------------------------------- tabs */
export function initTabs() {
  document.querySelectorAll(".tab").forEach(t => t.onclick = () => {
    if (t.dataset.view === "tree") {
      showTreeView();
    } else {
      document.querySelectorAll(".tab").forEach(x => x.setAttribute("aria-selected", String(x === t)));
      svg.style.display = "none";
      document.querySelector(".zoom").style.display = "none";
      tl.hidden = false;
      hideHint();
    }
    closeCard();
  });
}
