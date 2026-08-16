import { DATA } from "./data.js";

/* ------------------------------------------------------------------ i18n */
let LANG = "en";
export const T = DATA.ar.ui, R = DATA.ar.relation;
export const getLang = () => LANG;
export const setLang = lang => { LANG = lang; };
export const isAr = () => LANG === "ar";
export const SIGN = () => isAr() ? -1 : 1;
export const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k] ?? "");
export const nameOf = p => isAr() ? p.shortAr : p.short;
export const altOf  = p => isAr() ? p.short   : p.shortAr;
export const nodeName = d => (isAr() ? d.a : d.n) || d.n;
export const nodeAlt  = d => (isAr() ? d.n : d.a) || "";
export const tr = (arKey, en) => isAr() ? T[arKey] : en;

/* Updates the static chrome (header, tabs, search, buttons) for the current
   language. Callers are responsible for re-rendering the tree/timeline and
   for anything else that depends on LANG. */
export function applyLangStrings() {
  const A = isAr(), $ = id => document.getElementById(id);
  document.body.setAttribute("dir", A ? "rtl" : "ltr");
  document.documentElement.lang = A ? "ar" : "en";
  document.querySelector(".brand h1").textContent = A ? T.title : "The Companions";
  document.querySelector(".brand .sub").textContent = A ? T.tagline : "who they were, and how they were related";
  const tabs = document.querySelectorAll(".tab");
  tabs[0].textContent = A ? T.tabTree : "Family tree";
  tabs[1].textContent = A ? T.tabTime : "Timeline";
  $("q").placeholder = A ? T.search : "Find a companion…";
  $("q").setAttribute("aria-label", A ? T.search : "Find a companion");
  $("reset").textContent = A ? T.showAll : "Show all";
  $("lang").textContent = A ? T.langButton : "العربية";
  $("zin").setAttribute("aria-label", A ? T.zoomIn : "Zoom in");
  $("zout").setAttribute("aria-label", A ? T.zoomOut : "Zoom out");
  $("zfit").setAttribute("aria-label", A ? T.fit : "Fit to screen");
  $("zfit").textContent = A ? "ملء" : "fit";
  document.querySelector(".skip").textContent = A ? T.skip : "Skip to the tree";
}
