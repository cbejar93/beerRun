# 3rd Annual Beer Run · Lake Merritt

Event web app for the Beer Run Society's annual 3-mile race around Lake Merritt, Oakland CA. Guests RSVP and see the field; the host runs the show from a private dashboard with a live race timer and leaderboard.

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite, React Router v6, plain CSS |
| Backend | Node.js + Express, Mongoose (MongoDB Atlas) |
| Auth | PIN → JWT (sessionStorage), Bearer token |
| Deploy | Docker (multi-stage) → Fly.io (sjc) |

Fonts: Anton (display) · Inter (body) · JetBrains Mono (mono)

---

## Getting started

```bash
# Install all workspaces
npm install

# Start dev (Vite on :5173 proxied to Express on :3001)
npm run dev
```

Create `server/.env`:

```
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/beerrun
HOST_PIN=1234
JWT_SECRET=some-random-secret
PORT=3001
```

Open `http://localhost:5173` for the app.

---

## Routes

| URL | Who | Description |
|-----|-----|-------------|
| `/` | Everyone | Hero, RSVP form, runner list |
| `/host` | Host only | Control room — tasks, CSV import, race timer |
| `/results` | Everyone | Live leaderboard, auto-refreshes every 10 s |
| `/preview` | Dev | Three iPhone mockups at different scroll depths |

---

## Host access

Triple-click the **"3"** brand mark to open the PIN modal. After a successful login the nav shows a Guest/Host toggle; the JWT lives in `sessionStorage` (survives refresh, cleared when the tab closes). Navigating directly to `/host` also prompts for a PIN if not already authenticated.

---

## Project structure

```
beerRun/
├── package.json              # root workspace — npm run dev / build / start
├── Dockerfile                # multi-stage: build client → runtime image
├── fly.toml                  # Fly.io config (region: sjc, port: 8080)
├── client/
│   ├── index.html            # OG / Twitter Card meta tags, fonts
│   ├── vite.config.js        # proxies /api → :3001 in dev
│   └── src/
│       ├── App.jsx           # routes: / /host /results /preview
│       ├── data/
│       │   ├── constants.js  # EVENT_DATE, beer stops
│       │   └── mergeRsvps.js # merges API RSVPs with local seed data
│       ├── hooks/
│       │   ├── useAuth.js    # login/logout, authFetch with Bearer header
│       │   └── useRsvps.js   # fetches /api/rsvp, exposes refresh()
│       ├── components/
│       │   ├── Nav.jsx       # countdown, Guest/Host toggle
│       │   ├── Hero.jsx      # event header + Race Results link
│       │   ├── Ticker.jsx    # scrolling stats bar (React.memo)
│       │   ├── RSVP.jsx      # guest RSVP form
│       │   ├── Runners.jsx   # avatar grid with filter chips
│       │   ├── HostView.jsx  # dashboard: tasks, broadcast, CSV import, finish line
│       │   └── HostPinModal.jsx
│       ├── pages/
│       │   ├── BeerRunApp.jsx   # /  — guest view
│       │   ├── HostPage.jsx     # /host — auth-gated host view
│       │   └── Results.jsx      # /results — public leaderboard
│       └── styles/styles.css    # all tokens + component styles
└── server/
    ├── index.js              # Express API, static serve, SPA fallback
    └── models/
        ├── Rsvp.js           # name, beer, status, timestamps
        ├── Task.js           # t, due, done, timestamps
        ├── Result.js         # name, finishedAt, year, timestamps
        └── RaceState.js      # year (unique), startedAt, endedAt
```

---

## API

All host endpoints require `Authorization: Bearer <token>`.

```
POST   /api/auth/host          # PIN → JWT  (10 req / 15 min)

GET    /api/rsvp               # Counts + entries
POST   /api/rsvp               # Submit RSVP  (5 req / hr)
POST   /api/rsvp/import        # Upload Partiful CSV  (host)
DELETE /api/rsvp/:id           # Remove entry  (host)

GET    /api/tasks              # Task checklist
POST   /api/tasks              # Add task  (host)
PATCH  /api/tasks/:id          # Toggle done  (host)
DELETE /api/tasks/:id          # Remove task  (host)

GET    /api/results            # Leaderboard, ?year=YYYY
POST   /api/results/start      # Start race / clear current year  (host)
POST   /api/results/end        # Freeze timer  (host)
DELETE /api/results/start      # Wipe current year data  (host)
POST   /api/results            # Record finisher  (host)
DELETE /api/results/:id        # Remove finisher  (host)
```

---

## CSV import

Export from Partiful: event page → Guest List → Export CSV. The importer auto-detects the `Name` and `RSVP`/`Status` columns, normalises status strings (`Going → going`, `Not Going → out`, everything else → `maybe`), and skips duplicate names. Max 2 MB.

---

## Design tokens

Three themes switchable via the hidden TweaksPanel:

| Token | Amber (default) | Stout (dark) | Foam (light) |
|-------|-----------------|--------------|--------------|
| `--paper` | #F5ECD7 | #1F1410 | #FFFDF5 |
| `--punch` | #C8F03C | #C8F03C | #FF4E2A |
| `--amber` | #B8701C | #E89944 | #C87E24 |
| `--muted` | #6B5A45 | #B09A7A | #7A6A55 |

`--punch` = "going" indicator color (lime-green in amber/stout themes).  
`--amber` = "maybe" indicator color.

---

## Deploy

```bash
fly deploy
```

Set secrets once:

```bash
fly secrets set MONGO_URI="..." HOST_PIN="..." JWT_SECRET="..."
```

App runs on port 8080, region `sjc`, scales to zero when idle.

---


