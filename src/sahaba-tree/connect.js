import { N, PEOPLE, pathUp } from "./model.js";
import { isAr, nameOf, tr, fmt, T, R } from "./i18n.js";
import { skippable, openMany } from "./collapse.js";
import { render, setHighlight, clearHighlight } from "./render.js";
import { esc, say, showHint, hideHint, stage } from "./dom-utils.js";

/* ---------------------------------------------------------- connect mode */
let mode = "browse", pick = [];
export const getMode = () => mode;

function setConnectButtonText() {
  const btn = document.getElementById("connect");
  btn.setAttribute("aria-pressed", mode === "connect");
  btn.textContent = mode === "connect" ? tr("connectDone", "Done connecting") : tr("connect", "Connect two");
}
export const updateConnectButtonText = setConnectButtonText;

export function toggleConnectMode() {
  mode = mode === "connect" ? "browse" : "connect";
  setConnectButtonText();
  pick = []; clearHighlight(); removeVerdict();
  if (mode === "connect") showHint(tr("hintPickTwo", "Tap two companions to see how they are related"));
  else hideHint();
  render();
}

export function resetSelection() {
  pick = []; clearHighlight(); removeVerdict();
}

/* Enter connect mode (if not already in it) with one companion preselected,
   used by the card's "connect to someone" action. */
export function connectFrom(pid) {
  if (mode !== "connect") {
    mode = "connect";
    setConnectButtonText();
    showHint(tr("hintPickTwo", "Tap two companions to see how they are related"));
  }
  pick = [pid];
  connect();
}

export function choose(pid) {
  if (pick.includes(pid)) pick = pick.filter(x => x !== pid);
  else if (pick.length < 2) pick.push(pid);
  else pick = [pick[1], pid];
  connect();
}

function relation(da, db, A, B) {
  const key = (x, y) => {
    if (da === 1 && db === 1)
      return x.gender === y.gender ? (x.gender === "f" ? "sisters" : "brothers") : "brotherSister";
    if (da === 2 && db === 2) return "cousins";
    if (da === 1 && db === 2) return (x.gender === "f" ? "aunt" : "uncle") + (y.gender === "f" ? "Niece" : "Nephew");
    if (da === 2 && db === 1) return (y.gender === "f" ? "aunt" : "uncle") + (x.gender === "f" ? "Niece" : "Nephew");
    return "sameFamily";
  };
  const k2 = key(A, B);
  if (isAr()) return R[k2];
  return ({ brothers:"brothers", sisters:"sisters", brotherSister:"brother and sister",
    cousins:"cousins", uncleNephew:"uncle and nephew", uncleNiece:"uncle and niece",
    auntNephew:"aunt and nephew", auntNiece:"aunt and niece",
    sameFamily:"part of the same family" })[k2];
}

export function connect() {
  clearHighlight(); removeVerdict();
  if (pick.length === 0) { showHint(tr("hintPickTwo", "Tap two companions to see how they are related")); render(); return; }
  if (pick.length === 1) {
    showHint(isAr() ? `${nameOf(PEOPLE[pick[0]])} ${T.hintPickSecond}`
                    : `${PEOPLE[pick[0]].short} — now tap a second companion`);
    render(); return;
  }
  hideHint();
  const A = PEOPLE[pick[0]], B = PEOPLE[pick[1]];
  const pa = pathUp(A.node), pb = pathUp(B.node);
  const ib = new Map(pb.map((x, i) => [x, i]));
  let hit = null, da = 0, db = 0;
  for (let i = 0; i < pa.length; i++) if (ib.has(pa[i])) { hit = pa[i]; da = i; db = ib.get(pa[i]); break; }
  if (hit === null) {
    showVerdict(A, B, tr("noMeet", `<b>Different families.</b> Their family lines don't meet in what we have recorded here.`),
      tr("noMeetSub", "Not every companion came from the same tribe — many joined from all across Arabia."));
    render({ trace: true }); return;
  }
  const litAList = pa.slice(0, da + 1), litBList = pb.slice(0, db + 1);
  setHighlight({ a: litAList, b: litBList, meet: hit });
  openMany([...litAList, ...litBList].filter(skippable));
  const anc = N.get(hit);
  // A node's OWN `x` flag marks its edge to ITS parent, so the edges actually
  // walked on each side are pa[0..da-1] and pb[0..db-1] -- the ancestor
  // itself (pa[da]) has no bearing on whether the PATH TO it was sourced.
  const approx = pa.slice(0, da).some(id => N.get(id)?.x) ||
                 pb.slice(0, db).some(id => N.get(id)?.x);
  if (approx) {
    // Same clan is as precise as the sources allow here -- stating a
    // generation count or a specific kinship term (cousins, uncle) would
    // fabricate precision the Ansari rosters don't actually give us.
    showVerdict(A, B,
      isAr() ? fmt(T.meetClan, { anc: esc(anc.a || anc.n) })
             : `They both belong to <b>${esc(anc.n)}</b>${anc.a ? ` <span class="ar">(${esc(anc.a)})</span>` : ""}.`,
      tr("meetClanSub", "The exact family position within that clan isn't recorded in the sources used here."));
  } else {
    const rel = relation(da, db, A, B);
    const gens = n => n === 1 ? T.gen1 : n === 2 ? T.gen2 : fmt(T.genN, { n });
    showVerdict(A, B,
      isAr() ? fmt(T.meetVia, { rel, anc: esc(anc.a || anc.n) })
             : `They are <b>${rel}</b> — both from ${esc(anc.n)}${anc.a ? ` <span class="ar">(${esc(anc.a)})</span>` : ""}.`,
      isAr() ? fmt(T.meetSteps, { a: gens(da), b: gens(db), A: esc(A.ismAr), B: esc(B.ismAr) })
             : `${da} step${da === 1 ? "" : "s"} up from ${esc(A.ism)}, ${db} step${db === 1 ? "" : "s"} up from ${esc(B.ism)}.`);
  }
  render({ trace: true });
}

function showVerdict(A, B, msg, sub) {
  removeVerdict();
  const d = document.createElement("div");
  d.className = "verdict"; d.id = "verdict";
  d.innerHTML = `<div class="who"><span class="chip a">${esc(nameOf(A))}</span>
    <span style="color:var(--muted);font-weight:800" aria-hidden="true">+</span>
    <span class="chip b">${esc(nameOf(B))}</span></div>
    <div class="msg">${msg}</div><div class="sub">${sub}</div>`;
  stage.appendChild(d);
  say(d.textContent.replace(/\s+/g, " ").trim());
}
export const removeVerdict = () => document.getElementById("verdict")?.remove();
