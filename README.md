# Mawrid

A source, in Arabic and English, for who the early Muslims were. Currently
home to one tool, *The Companions* — an interactive family tree and timeline
of the Sahaba.

## Development

```
npm install
npm run dev
```

`npm run build` produces a static `dist/` (deployed to GitHub Pages on push
to `main`); `npm run preview` serves that build locally.

## Structure

- `index.html` — the Mawrid landing page.
- `sahaba-tree/index.html` — the Companions family tree/timeline app.
- `src/sahaba-tree/` — that app's JS modules, styles, and data.
  - `data/*.json` — the Sahaba dataset (genealogy nodes, people, clans,
    cohorts, sources, i18n strings), split out for independent editing.
  - `data.js` / `model.js` — load the JSON and derive the in-memory
    genealogy graph.
  - `i18n.js`, `text-measure.js`, `collapse.js`, `layout.js` — supporting
    pure logic.
  - `render.js`, `pan-zoom.js`, `connect.js`, `card.js`, `interaction.js`,
    `search.js`, `timeline.js`, `tabs.js` — the interactive tree/timeline UI.
  - `main.js` — wires the above together; the page's entry point.
- `src/shared/` — styles shared across pages (fonts, reset, landing page).
