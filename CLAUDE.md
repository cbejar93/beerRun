# CLAUDE.md — Beer Run codebase guide

## Commands

```bash
npm run dev      # start Vite (:5173) + Express (:3001) concurrently
npm run build    # Vite production build → client/dist/
npm run start    # serve built app (Express on PORT env var)
```

Server `.env` required: `MONGO_URI`, `HOST_PIN`, `JWT_SECRET`, `PORT` (default 3001).

---

## Architecture

React SPA (client) + Express API (server), npm workspaces monorepo. In dev, Vite proxies `/api/*` to Express so CORS is never an issue. In production, Express serves the Vite build from `client/dist/` and handles the SPA fallback (`GET *`).

```
client/  →  Vite + React 18
server/  →  Node.js ESM + Express + Mongoose
```

Server uses ESM (`"type": "module"`). `__dirname` is not available natively — use the shim already in `server/index.js`:

```js
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
```

---

## Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/` | `BeerRunApp` | Guest-only: Hero, Ticker, RSVP, Runners |
| `/host` | `HostPage` | Auth-gated; shows pin modal if no token |
| `/results` | `Results` | Public leaderboard, polls every 10 s |
| `/preview` | `MobilePreview` | Dev tool, three iPhone frames |

---

## Auth flow

1. User triple-clicks the **"3"** brand mark → `HostPinModal` opens.
2. PIN posted to `POST /api/auth/host` → returns a 12h JWT.
3. Token stored in `sessionStorage` via `useAuth` hook.
4. All host API calls go through `authFetch()` which attaches `Authorization: Bearer <token>`.
5. Navigating to `/host` re-uses the token if present, otherwise shows the PIN modal.

`useAuth` (`client/src/hooks/useAuth.js`) is the single source of truth. It does **not** call `logout()` when switching views — auth and display role are independent.

---

## Key components

### HostView (`components/HostView.jsx`)

Contains two sub-components:

**`FinishLine`** — race timer and finisher recording.
- State: `raceStart`, `raceEnd`, `elapsed`, `isPaused`, `results`
- Refs: `pauseOffsetRef` (total ms paused), `pausedAtRef` (current pause start)
- Timer effect stops when `raceEnd` is set OR `isPaused` is true.
- `endRace()` finalises any active pause before snapshotting elapsed, then POSTs to `/api/results/end`.
- `resetRace()` wipes only the **current year** via `DELETE /api/results/start`.
- On mount, fetches `/api/results` and reconstructs state from `startedAt`/`endedAt`.

**`AddRunner`** — inline form POSTing to `/api/rsvp`.

### Runners (`components/Runners.jsx`)

- Avatar background colour is determined by `hueFor(name)` — a deterministic hash over `AVATAR_HUES[]`.
- "going" → `--punch` border + pill; "maybe" → `--amber` border + pill; "out" → muted + 50% opacity.
- `onDelete` prop is only passed from `HostView`; on the guest page it's omitted so the × button is hidden.

### Ticker (`components/Ticker.jsx`)

Wrapped in `React.memo` to prevent parent re-renders (countdown tick, RSVP poll) from restarting the CSS marquee animation.

---

## Database models

All in `server/models/`.

| Model | Fields |
|-------|--------|
| `Rsvp` | `name` (String, required, trim), `beer` (String), `status` (enum: going/maybe/out), timestamps |
| `Task` | `t` (String, required, trim), `due` (String), `done` (Boolean, default false), timestamps |
| `Result` | `name` (String, required, trim), `finishedAt` (Date), `year` (Number, required), timestamps |
| `RaceState` | `year` (Number, unique), `startedAt` (Date), `endedAt` (Date) |

`RaceState` is one document per year. `Result` records are scoped by year. Reset only touches the current year.

Tasks are seeded with 4 sample entries on first server start (when `Task.countDocuments() === 0`).

---

## API rate limits

| Endpoint | Limit |
|----------|-------|
| `POST /api/auth/host` | 10 req / 15 min |
| `POST /api/rsvp` | 5 req / hr |

All other endpoints are unlimited.

---

## CSV import (`POST /api/rsvp/import`)

- Accepts multipart `file` field (max 2 MB).
- Auto-detects `Name` column (regex: `/^name$/i` or `/guest.?name/i`).
- Auto-detects status column (`/^(rsvp|status|response|attending)$/i`).
- Status normalisation: `going/yes/attending → going`, `not going/no/declined/out → out`, everything else → `maybe`.
- Skips rows where the name already exists in the DB (case-insensitive).

---

## Styling rules

- All styles in `client/src/styles/styles.css`. No CSS modules, no Tailwind.
- Design tokens are CSS custom properties on `:root` (amber theme default) and `[data-theme="stout"]` / `[data-theme="foam"]`.
- **Never use inline styles for values that need to be responsive** — inline styles can't be overridden by media queries. Use CSS classes (e.g. `.host-panel-grid`) instead.
- Responsive breakpoints: `900px` (tablet), `560px` (mobile).

Color conventions:
- `--punch` → "going" / active / highlighted state (lime-green in default/stout, tomato in foam)
- `--amber` → "maybe" / secondary accent
- `--muted` → "out" / disabled / de-emphasised
- `--stout` → primary dark background / text

---

## Deployment

Docker multi-stage build:
1. `client-build` stage: installs all deps, runs `vite build` → `client/dist/`
2. Runtime stage: fresh `node:20-alpine`, installs production deps only, copies `client/dist/` + `server/`

```bash
fly deploy           # build + deploy
fly logs             # tail logs
fly ssh console      # shell into running instance
```

Secrets (set once):
```bash
fly secrets set MONGO_URI="..." HOST_PIN="..." JWT_SECRET="..."
```

`fly.toml`: port 8080, region `sjc`, `NODE_ENV=production`, scale-to-zero (min 0 machines).

---

## Things to know

- `RouteMap.jsx` is commented out in `BeerRunApp.jsx` — the SVG file exists but the section is hidden.
- The "Broadcast" textarea in HostView is UI-only; the Send button has no backend yet.
- "Beer pledged (cans)" KPI in the host dashboard is hardcoded to 117 — not wired to a data source.
- The `--warn` variable (`#E8472C`) is used for the End Race button; it's defined per theme but currently the same red across all three.
- Event details live in `client/src/data/constants.js`: `EVENT_DATE`, stop names and descriptions.
