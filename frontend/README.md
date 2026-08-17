# Alertra — frontend

The React + TypeScript + Vite dashboard. See the [project README](../README.md) for what Alertra
is, how the pieces fit together, and the known gaps.

## Quick start

```bash
npm install
cp .env.example .env   # add your Mapbox token (and Cohere key, if you want the assistant)
npm run dev            # http://localhost:5173
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) then build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint |

## Notes for working in here

- **Styling** is Tailwind. The light palette lives in `tailwind.config.js` as the `brand` scale
  (`brand-500` is `#26d3d6`); prefer those tokens over raw hex values. Global base styles and the
  Mapbox popup overrides are in `src/index.css`.
- **Shared state** goes through `src/context/sidebar-context.tsx`: the active hazard category, the
  mobile drawer, the fetched events, and `focusRequest` (which drives fly-to). Adding a new way to
  select an event means calling `focusEvent(feature)` rather than touching the map directly.
- **Icons** are `lucide-react`. The map popup is built as an HTML string, so it inlines one SVG
  constant instead (`PLANE_TAKEOFF_SVG` in `Map.tsx`).
- **Layout** relies on the page never scrolling: `html`/`body`/`#root` are `height: 100%` with
  `overflow: hidden`, and `<main>` is the scroll container. Keep `min-h-0` on the flex children or
  the panels will grow the page instead of scrolling.
