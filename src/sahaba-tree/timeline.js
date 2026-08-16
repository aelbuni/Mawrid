import { DATA } from "./data.js";
import { PEOPLE, colorOf } from "./model.js";
import { isAr, nameOf, tr, fmt, T } from "./i18n.js";
import { openCard } from "./card.js";
import { esc, tl } from "./dom-utils.js";

/* ------------------------------------------------------------- timeline */
export function buildTimeline() {
  let s = "";
  DATA.cohortOrder.forEach((c, i) => {
    const list = Object.values(PEOPLE).filter(p => p.cohort === c);
    if (!list.length) return;
    const ordered = list.some(p => p.rank);
    list.sort((a, b) => (a.rank || 99) - (b.rank || 99) ||
      nameOf(a).localeCompare(nameOf(b), isAr() ? "ar" : "en"));
    s += `<section class="band" aria-label="${esc(isAr() ? DATA.ar.cohort[c] : DATA.cohortLabel[c])}">
      <div class="band-h"><div class="step" aria-hidden="true">${i + 1}</div>
      <h3>${esc(isAr() ? DATA.ar.cohort[c] : DATA.cohortLabel[c])}</h3>
      <span class="count">${isAr() ? fmt(T.countPeople, { n: list.length })
        : list.length + " " + (list.length === 1 ? "person" : "people")}</span></div>
      <div class="band-b">` +
      list.map(p => `<button class="medal" data-p="${p.id}">
        <span class="ini" aria-hidden="true" style="background:${colorOf(p)}">${esc((isAr() ? p.ismAr : p.ism)[0])}</span>
        ${esc(nameOf(p))}${p.rank ? `<span class="rk">${p.rank}</span>` : ""}</button>`).join("") +
      `</div><div class="band-note">${ordered ? tr("tlOrdered",
          "The numbers show the order the biographers recorded. For the first few, the sources themselves disagree — tap a name marked with a note to see why.")
        : tr("tlUnordered", "The sources place these companions in this period, but not in a firm order within it.")}</div>
      <div class="band-cite">
        <span class="band-cite-lbl">${isAr() ? T.lblCitedTo : "Sourced to"}</span>
        ${(isAr() ? DATA.cohortSources[c].ar : DATA.cohortSources[c].en)
          .map(s => `<span class="band-cite-item">${esc(s.title)}</span>`).join("")}
      </div></section>`;
  });
  tl.innerHTML = s;
}

export function initTimeline() {
  tl.addEventListener("click", e => { const b = e.target.closest(".medal"); if (b) openCard(b.dataset.p); });
}
