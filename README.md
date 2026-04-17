# 3rd Annual Beer Run

Event homepage for the annual beer-run around Lake Merritt, Oakland CA. Three miles, three beers, one finish line.

**Event:** Saturday, May 23, 2026 · 11:00 AM · Lakeside Bandstand, Oakland CA

---

## Stack

- **Frontend:** React 18 + Vite, React Router v6
- **Backend:** Node.js + Express
- **Fonts:** Anton (display) · Inter (body) · JetBrains Mono (labels/stats)
- **No UI library** — all styles are hand-rolled CSS custom properties

---

## Getting started

```bash
npm install
npm run dev
```

This starts both the Vite dev server (port 5173) and the Express API (port 3001) concurrently. The Vite server proxies `/api/*` to Express so there are no CORS issues in development.

Open [http://localhost:5173](http://localhost:5173) for the app and [http://localhost:5173/preview](http://localhost:5173/preview) for the mobile preview.

---

## Project structure

```
beer-run/
├── package.json          # root workspace + concurrently dev script
├── client/
│   ├── index.html
│   ├── vite.config.js    # proxies /api → localhost:3001
│   └── src/
│       ├── main.jsx
│       ├── App.jsx       # router: / and /preview
│       ├── data/
│       │   └── constants.js   # EVENT_DATE, RUNNERS, STOPS
│       ├── components/
│       │   ├── Nav.jsx
│       │   ├── Hero.jsx
│       │   ├── Countdown.jsx
│       │   ├── Ticker.jsx
│       │   ├── RSVP.jsx
│       │   ├── RouteMap.jsx
│       │   ├── Runners.jsx
│       │   ├── HostView.jsx
│       │   ├── TweaksPanel.jsx
│       │   └── IOSDevice.jsx
│       ├── pages/
│       │   ├── BeerRunApp.jsx   # main event page
│       │   └── MobilePreview.jsx # three iPhone frames
│       └── styles/
│           └── styles.css       # all tokens + component styles
└── server/
    ├── package.json
    └── index.js          # Express API
```

---

## Routes

| Path | Page |
|---|---|
| `/` | Full event homepage (guest + host views) |
| `/preview` | Mobile preview — three iPhone 16-ish frames at Hero, RSVP, and Route scroll positions |

---

## Design system

### Color themes

Three themes switchable via the Tweaks panel (bottom-right of the homepage):

| Token | Amber (default) | Stout (dark) | Foam (bright) |
|---|---|---|---|
| `--paper` | `#F5ECD7` cream | `#1F1410` stout | `#FFFDF5` bright |
| `--ink` | `#1F1410` | `#F5ECD7` | `#1F1410` |
| `--amber` | `#B8701C` | `#E89944` | `#C87E24` |
| `--punch` | `#C8F03C` lime | `#C8F03C` lime | `#FF4E2A` tomato |
| `--card` | `#FBF5E5` foam | `#2A1C14` | `#FBF7EA` |
| `--muted` | `#6B5A45` | `#B09A7A` | `#7A6A55` |

### Responsive breakpoints

- `>900px` — two-column hero, RSVP, route map; four-up host KPIs
- `≤900px` — single column; countdown reorders above stamp in hero; nav status dot hides
- `≤560px` — Anton shrinks to 64px; RSVP pills stack vertically; route beer info drops below stop name; KPIs go 2-up

---

## API

The Express server runs an in-memory RSVP store. Swap the array for a database (Supabase, Postgres, etc.) when you're ready to persist.

### `POST /api/rsvp`

```json
{ "name": "Maya Okonkwo", "beer": "Hazy IPA 6-pack", "status": "going" }
```

Returns `201` with the created entry. `status` must be `going`, `maybe`, or `out`.

### `GET /api/rsvp`

Returns a summary:

```json
{ "total": 1, "going": 1, "maybe": 0, "out": 0, "entries": [...] }
```

---

## Next steps

- **Persist RSVPs** — swap the in-memory array in `server/index.js` for Supabase, Firebase, or Postgres
- **Real map** — the Lake Merritt SVG is stylized; swap for Leaflet/Mapbox with real GeoJSON
- **Email confirmations** — tie RSVP submit into Resend or Postmark
- **Bib PDF** — generate a printable bib from the confirmation screen
- **Auth** — add a host PIN so only you can see the control room
- **TypeScript** — straightforward to migrate; Vite has TS support out of the box

---

Chug responsibly. DNF = Did Not Finish (your beer).
