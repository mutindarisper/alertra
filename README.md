# Alertra

A disaster monitoring dashboard. Alertra plots live natural-disaster events from
[GDACS](https://www.gdacs.org) on a map, lets you drill into any incident, and simulates
dispatching a relief drone to it.

- **Map first** — every event is a pin on a full-width Mapbox map.
- **Filter by hazard** — floods, earthquakes, tsunamis, volcanoes, wildfires, or all at once.
- **Click to locate** — selecting an event card *or* a map pin flies the camera to it, zooms in,
  and opens its details.
- **Drone dispatch (simulated)** — request a drone from an event popup and watch it fly out from
  base, drop aid, and return, with a running activity log.
- **AI assistant** — ask questions about the events currently on the map (Cohere).
- **Responsive** — three-stage layout: full sidebar on desktop, icon rail on tablet, off-canvas
  drawer on mobile.

## Tech stack

| Area | Stack |
| --- | --- |
| Frontend | React 18, TypeScript, Vite 6, Tailwind CSS 3, Mapbox GL JS 3, lucide-react, axios |
| Backend | Node (ESM), Express 4, `ws`, ioredis |
| Data | GDACS public event API; Redis for caching and pub/sub |

The UI is light-themed, built on white surfaces with a `#26d3d6` brand accent (exposed as the
`brand` color scale in `frontend/tailwind.config.js`).

## Repository layout

```
alertra/
├── frontend/                  # Vite + React dashboard (the app you run)
│   └── src/
│       ├── components/
│       │   ├── Dashboard.tsx      # sidebar + main content shell
│       │   ├── Navbar.tsx         # brand bar, mobile drawer toggle
│       │   ├── Sidebar.tsx        # hazard categories (also exports `menuItems`)
│       │   ├── MainContent.tsx    # map, recent events, alert-level breakdown
│       │   ├── Map.tsx            # Mapbox map, markers, popups, drone simulation
│       │   └── Chatbot.tsx        # Cohere-backed assistant
│       ├── context/
│       │   └── sidebar-context.tsx  # active category, drawer state, events, focus requests
│       └── service/
│           ├── events.ts          # DisasterFeature type, eventTitle(), eventKey()
│           └── drones.ts          # in-memory drone fleet
└── backend/                   # Express + Redis + WebSocket service (see "Status" below)
    └── src/
        ├── server.js              # HTTP + WebSocket server, 10-minute GDACS poll
        ├── fetchDisasters.js      # fetch → cache → publish
        ├── redis.js               # ioredis connection
        ├── redisCache.js          # get/set/delete with a 5-minute TTL
        └── redisPubSub.js         # publish/subscribe helpers
```

## Getting started

### Prerequisites

- Node.js 18+ (developed on 25.x) and npm
- A [Mapbox access token](https://account.mapbox.com/access-tokens/)
- A [Cohere API key](https://dashboard.cohere.com/api-keys) if you want the AI assistant
- Redis on `127.0.0.1:6379` — only needed for the backend

### Run the frontend

```bash
cd frontend
npm install
cp .env.example .env   # then fill in your keys (see below)
npm run dev
```

The dashboard is served at <http://localhost:5173>.

### Environment variables

`frontend/.env`:

| Variable | Required | Used by |
| --- | --- | --- |
| `VITE_MAPBOX_ACCESS_TOKEN` | Yes — the map will not render without it | `src/components/Map.tsx` |
| `VITE_COHERE_ACCESS_TOKEN` | Only for the AI assistant | `src/components/Chatbot.tsx` |

`.env` is gitignored; `.env.example` documents the shape.

The backend reads no environment variables — the Redis host/port and the server port (`5001`) are
hardcoded in `backend/src/redis.js` and `backend/src/server.js`.

### Run the backend

```bash
# make sure Redis is running, e.g. `brew services start redis`
cd backend
npm install
npm run dev        # nodemon ./src/server.js -> http://localhost:5001
```

| Route | Method | Description |
| --- | --- | --- |
| `/api/disasters/cached` | GET | Cached GDACS event list (5-minute TTL) |
| `/api/alert` | POST | Publish an alert onto the `disaster-alerts` channel |

Connected WebSocket clients receive every message published to `disaster-alerts`.

## Scripts

**frontend/**

| Script | Description |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) then build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint |

**backend/**

| Script | Description |
| --- | --- |
| `npm run dev` | Start with nodemon |

## How the data flows

The frontend talks to GDACS **directly** — it does not go through the backend. `Map.tsx` requests
the GDACS event list whenever the active category changes, stores the results in
`sidebar-context`, and renders them both as map markers and as the "Most recent" list, so the two
always describe the same set of events.

Selecting an event from either side sets a `focusRequest` (event key + coordinates + a nonce) on
the context. `Map.tsx` watches it and flies the camera to that point, zooming to at least level 5
and opening the matching popup. Because both the card and the pin go through this one path, they
stay in sync — clicking a pin highlights its card, and vice versa.

## Status and known gaps

Worth knowing before you dig in:

- **The GDACS query uses a fixed date window** (`2023-10-06` → `2025-03-14`), hardcoded in
  `Map.tsx`. Results look live but are a frozen range; widen it there when you want current data.
- **Drone dispatch is a simulation.** `service/drones.ts` is an in-memory fleet of two drones and
  the flight is a `requestAnimationFrame` interpolation — no hardware or API behind it.

