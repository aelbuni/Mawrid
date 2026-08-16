import { DATA } from "./data.js";
import { PEOPLE, colorOf, pathUp } from "./model.js";
import { isAr, nameOf, fmt, T } from "./i18n.js";
import { skippable, openMany } from "./collapse.js";
import { render, setHighlight } from "./render.js";
import { centerOn } from "./pan-zoom.js";
import { connectFrom, removeVerdict } from "./connect.js";
import { esc, say, card } from "./dom-utils.js";

/* ---------------------------------------------------------------- card */
let lastFocus = null;
export function openCard(pid) {
  const p = PEOPLE[pid], c = colorOf(p), A = isAr();
  lastFocus = document.activeElement;
  const names = [p.kunya, ...(p.laqab || [])].filter(Boolean).join(" · ");
  const grp = A ? (p.groupAr || p.clan || p.tribe)
                : (p.clan || p.tribe) + (p.clan && p.tribe && p.clan !== p.tribe ? " · " + p.tribe : "");
  const grp2 = A && p.tribeAr && p.groupAr !== p.tribeAr ? " · " + p.tribeAr : "";
  const facts = A ? p.factsAr : p.facts;
  const cites = A ? p.sourcesFullAr : p.sourcesFull;
  const citeList = c => c.map(s => `<li class="cite"><span class="cite-t">${esc(s.title)}</span>${
      s.author ? `<span class="cite-a">${esc(s.author)}</span>` : ""}${
      s.note ? `<span class="cite-n">${esc(s.note)}</span>` : ""}</li>`).join("");
  const genCls = p.genKind === "approximate" ? "gen-approx" : "gen-ok";
  card.innerHTML = `
    <div class="card-top" style="background:${c}">
      <button class="x" aria-label="${A ? T.close : "Close"}">×</button>
      <div class="ini" aria-hidden="true">${esc((A ? p.ismAr : p.ism)[0])}</div>
      <h2${A ? ' class="ar disp"' : ""}>${esc(A ? p.shortAr : p.short)}</h2>
      <div class="h-alt ${A ? "" : "ar "}disp">${esc(A ? p.lat : p.ar)}</div>
      ${names ? `<div class="h-sub">${esc(names)}</div>` : ""}
    </div>
    <div class="card-body">
      <p class="story">${esc(A ? p.storyAr : p.story)}</p>
      <div class="row"><div class="lbl">${A ? T.lblFacts : "Three things to remember"}</div>
        <ul class="facts">${facts.map((f, i) =>
          `<li><span class="b" aria-hidden="true">${i + 1}</span><span>${esc(f)}</span></li>`).join("")}</ul></div>
      <div class="row"><div class="lbl">${A ? T.lblFamily : "Family"}</div><div class="val">${esc(grp)}${esc(grp2)}</div>
        <div class="gen-note ${genCls}">${esc(A ? p.genNoteAr : p.genNote)}</div></div>
      ${p.cohort ? `<div class="row"><div class="lbl">${A ? T.lblWhen : "When they believed"}</div>
        <div class="val">${esc(A ? DATA.ar.cohort[p.cohort] : p.cohortLabel)}${p.rank ?
          (A ? ` · ${fmt(T.rankIn, { n: p.rank })}` : ` · number ${p.rank} in the order recorded`) : ""}</div></div>` : ""}
      ${p.events.length ? `<div class="row"><div class="lbl">${A ? T.lblThere : "They were there"}</div>
        <div class="chips">${(A ? p.eventsAr : p.events).map(e => `<span>${esc(e)}</span>`).join("")}</div></div>` : ""}
      ${p.dispute ? `<div class="row"><div class="flag"><b>${A ? T.lblDispute : "Scholars recorded this differently"}</b>${esc(A ? (p.disputeAr || p.dispute) : p.dispute)}</div></div>` : ""}
      <div class="row"><div class="lbl">${A ? T.lblSources : "Where this comes from"}</div>
        <ul class="cite-list">${citeList(cites)}</ul></div>
    </div>
    <div class="card-act">
      <button id="cline">${A ? (p.gender === "f" ? T.actLineF : T.actLine) : "Show their family line"}</button>
      <button class="alt" id="cconn">${A ? (p.gender === "f" ? T.actConnectF : T.actConnect) : "Connect to someone"}</button>
    </div>`;
  card.classList.add("open");
  card.querySelector(".x").onclick = closeCard;
  card.querySelector(".x").focus();
  card.querySelector("#cline").onclick = () => {
    const path = pathUp(p.node);
    setHighlight({ a: path });
    openMany(path.filter(skippable));
    removeVerdict(); closeCard(); render({ trace: true }); centerOn(p.node);
  };
  card.querySelector("#cconn").onclick = () => {
    closeCard();
    connectFrom(pid);
  };
  say(`${nameOf(p)}. ${A ? p.storyAr : p.story}`);
}
export function closeCard() {
  if (!card.classList.contains("open")) return;
  card.classList.remove("open");
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}
