import { isAr, setLang, tr, applyLangStrings } from "./i18n.js";
import { preloadFonts } from "./text-measure.js";
import { clearOpened } from "./collapse.js";
import { render, resetElements } from "./render.js";
import { fit, initPanZoom } from "./pan-zoom.js";
import { getMode, toggleConnectMode, resetSelection, updateConnectButtonText } from "./connect.js";
import { closeCard } from "./card.js";
import { initInteraction } from "./interaction.js";
import { initSearch } from "./search.js";
import { buildTimeline, initTimeline } from "./timeline.js";
import { initTabs } from "./tabs.js";
import { say, showHint, hideHint, res } from "./dom-utils.js";

document.getElementById("connect").onclick = () => { closeCard(); toggleConnectMode(); };

document.getElementById("reset").onclick = () => {
  resetSelection(); clearOpened(); closeCard(); render(); fit({ readable: true });
  say(tr("showAll", "Showing all"));
};

document.getElementById("lang").onclick = () => {
  setLang(isAr() ? "en" : "ar");
  resetSelection(); closeCard(); resetElements();
  applyLangStrings(); updateConnectButtonText(); buildTimeline();
  // Fonts for this script were already preloaded at boot, so this resolves
  // immediately in the normal case -- the await just closes off any residual
  // race (e.g. a font that failed and is retried) before we trust measure().
  preloadFonts().then(() => { render({ animate: false }); fit({ readable: true }); });
};

document.addEventListener("keydown", e => { if (e.key === "Escape") { closeCard(); res.hidden = true; } });

/* ---------------------------------------------------------------- start */
initPanZoom();
initInteraction();
initSearch();
initTabs();
initTimeline();

buildTimeline();
// Both scripts, both weights are loaded before the FIRST measurement, closing
// the race that let a mis-sized pill through in the first place.
preloadFonts().then(() => {
  render({ animate: false });
  fit({ readable: true });
});
showHint(tr("hintStart", "Tap any name to open it · drag to move around"));
setTimeout(() => { if (getMode() === "browse") hideHint(); }, 5600);
