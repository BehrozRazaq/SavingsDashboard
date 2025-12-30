# Savings Dashboard (FluxFinance)

A lightweight personal finance dashboard that visualizes transactions, estimates FIRE/runway/compound growth, identifies subscriptions, and provides small utilities for inflation adjustment and other quick calculations.

---

## Table of Contents

- [Savings Dashboard (FluxFinance)](#savings-dashboard-fluxfinance)
  - [Table of Contents](#table-of-contents)
  - [Quick start ✅](#quick-start-)
  - [Features ✨](#features-)
  - [UI notes \& small quirks ⚠️](#ui-notes--small-quirks-️)
  - [Project structure 🔧](#project-structure-)
  - [Key files \& components (deep insights) 🔎](#key-files--components-deep-insights-)
  - [Data sources \& normalization 🧾](#data-sources--normalization-)
  - [Server / API 🧩](#server--api-)
  - [Environment variables ⚙️](#environment-variables-️)
  - [Development \& testing tips 💡](#development--testing-tips-)
  - [Troubleshooting 🩺](#troubleshooting-)
  - [Contributing \& License ❤️](#contributing--license-️)

---

## Quick start ✅

1. Clone repository

   ```bash
   git clone <repo-url>
   cd SavingsDashboard
   ```

2. Install dependencies

   - Root (frontend)
     ```bash
     npm install
     ```

   - Server
     ```bash
     cd server
     npm install
     ```

3. Start the app

   - Run frontend (Vite dev server):
     ```bash
     npm run dev       # from project root
     ```

   - Run server (dev):
     ```bash
     cd server
     npm run dev       # uses node --watch server.js
     ```

   - Or start server from root:
     ```bash
     npm run server    # runs node server/server.js
     ```

4. Open the frontend: http://localhost:5173 (default)

---

## Features ✨

- **Bank connection (Tink integration)**: Connect to supported banks using the Tink Link flow (server-side credential/session management).
- **Transactions feed**: Uses Tink API (when connected) or local sample files (`/src/data/*.json`) during development.
- **Runway calculator**: Estimate months/years of runway based on cash and burn rate.
- **FIRE calculator**: Estimate years to financial independence using a simplified 25x rule plus compound growth.
- **Compound interest visualizer**: See how monthly contributions compound over years (server-powered endpoint returning yearly snapshots).
- **Inflation adjuster**: Quickly convert nominal amounts into future/past equivalents given an inflation rate.
- **Subscription detection (SubscriptionSlayer)**: Identifies recurring payments and surfaces subscriptions to reduce leaky expenses.
- **Points lost / heuristics components**: Small utilities for showing rounding/subscription leakage and similar insights.
- **Nice-to-have UI components**: Compound charts (`CompoundChart.jsx`), `FikaVisualizer` (consumption breakdown), `ConnectionStatus`, and small cardized UI elements for quick metrics.

---

## UI notes & small quirks ⚠️

- **Connection status**: `ConnectionStatus` reflects Tink `credentials` data. If the server session is missing or expired you'll see `No active session` and a prompt to `Connect bank`.

- **Sidebar behavior**: The dashboard's sidebar is lightweight and expects a 2-column layout. On very small screens, several widgets collapse into vertical stacking; there is no dedicated mobile navigation mode yet.

- **Currency & rounding**: Amounts are usually rounded to whole numbers in UI cards for readability. Drill-down tooltips or raw views show decimals. Default currency is SEK (Swedish krona) unless transactions specify otherwise.

- **Subscription detection heuristics**: Subscriptions are inferred by merchant string similarity and a monthly cadence. This works well for standard recurring charges but can yield false positives for vendors with dynamic descriptors.

- **Charts & tooltips**: Recharts-powered visuals show monthly/yearly snapshots. Hover behavior is immediate, but long labels can wrap awkwardly — tooltips help but occasionally overlap edge boundaries on narrow screens.

- **Animations**: Small Framer Motion transitions are used. They are subtle; disabling JS or CSS-transitions can make UI feel static but still usable.

- **Missing-data states**: Most widgets show human-friendly fallback text (e.g., "Connect your bank to fetch transactions" or "No transactions found for the selected period").

- **Locale & dates**: Dates are rendered from transaction ISO dates without aggressive locale formatting; timezone normalization is minimal (server fetches `booked`/`value` date strings from Tink).

---

## Project structure 🔧

Top-level:

- `index.html` — Vite entry
- `src/` — React app
  - `main.jsx` — app bootstrap
  - `App.jsx` — routes + layout
  - `index.css` — Tailwind base
  - `components/` — presentational and data components
  - `hooks/` — reusable hooks
  - `utils/` — helpers (bank normalization, etc.)
  - `data/` — fixtures (`nordeaTransactions.json`, `norwegianTransactions.json`)
- `server/` — express API and middleware
  - `server.js` — API endpoints & calculators
  - `routes/auth.js` — Tink integration routes
  - `middleware/session.js` — session helpers

---

## Key files & components (deep insights) 🔎

| File | Purpose |
|------|---------|
| `src/hooks/useFinancialData.js` | Central hook to fetch transactions & aggregated metrics. It abstracts connection-checks and polling logic. Useful when you need to reuse transaction queries across components. |
| `src/utils/bankNormalizer.js` | Normalizes Tink or fixture transaction payloads into the app's shape (id, date, merchant, amount, currency, category, source). If you want to add another bank or data format, add a transformer here. |
| `src/components/CompoundChart.jsx` | Recharts area/line chart to visualize compound growth. It requests `/api/calculate/compound` for server-generated yearly snapshots. Good pattern to follow for server-backed visualizations. |
| `src/components/SubscriptionSlayer.jsx` | Performs recurring transaction analysis. Heuristics examine merchant strings + periodicity; tune thresholds here if you see false positives/negatives. |
| `src/components/ConnectionStatus.jsx` | Uses `/api/tink/status` to display connection info per bank and warns when reauth is needed. It relies on server session cookies (HTTP-only cookie set on callback). |
| `server/routes/auth.js` | Handles Tink Link URL generation (`/connect`), callback token exchange (`/callback`), transactions (`/transactions`), status (`/status`), refresh/disconnect flows. Sessions are stored in an in-memory map by default (see `middleware/session.js`) — **not** production-safe. |
| `server/server.js` | Exposes calculator endpoints (`/api/calculate/*`) for client calculators and basic server status. Good examples of small, deterministic API endpoints useful for SSR or scheduled batch jobs. |

---

## Data sources & normalization 🧾

- Development uses `src/data/*.json` as sample transaction sets.
- When connected to Tink, the server fetches `accounts`, `transactions`, and `credentials`. Server normalizes Tink payloads to a simplified shape and returns `transactions` + `accounts` to the client.
- To add another data source, implement a transformer in `src/utils/bankNormalizer.js` (or introduce a new file that feeds into the same normalized contract). Keep normalization idempotent and include `raw` payload for debugging.

---

## Server / API 🧩

Main endpoints (available under `/api`):

- `GET /api/status` — Basic API health + endpoint list
- `GET /api/tink/connect` — Return Tink Link URL to initiate bank connection
- `GET /api/tink/callback` — OAuth callback (server side handles token exchange and session creation)
- `GET /api/tink/status` — Connection status for linked banks
- `GET /api/transactions` — Returns normalized transactions + accounts for the session
- `POST /api/tink/refresh` — Refresh access token (server-side)
- `POST /api/tink/disconnect` — Clear session and disconnect bank
- `POST /api/calculate/fire` — FIRE calculator
- `POST /api/calculate/runway` — Runway calculator
- `POST /api/calculate/compound` — Compound growth (yearly snapshots)
- `POST /api/calculate/inflation` — Inflation conversion

Notes:
- The server uses cookies to maintain session id. Tokens and refresh tokens are stored server-side using the session helpers in `server/middleware/session.js`. The current default session store is an in-memory map (for development only).
- Token refresh is done lazily via `needsRefresh()` checks and a `/refresh` POST when triggered.

---

## Environment variables ⚙️

Put these variables in `server/.env` (or export in your shell):

- `PORT` (default 3001)
- `FRONTEND_URL` (default `http://localhost:5173`) — used for CORS & callback redirects
- `TINK_API_URL` (optional) — defaults to https://api.tink.com
- `TINK_CLIENT_ID` — required to use Tink
- `TINK_CLIENT_SECRET` — required to use Tink
- `TINK_REDIRECT_URI` — defaults to `http://localhost:3001/api/tink/callback` (change if deploying behind proxy)
- `NODE_ENV` — `development` or `production`

> Tip: For local testing without Tink access, rely on `src/data/*.json` and the `useFinancialData` hook's local fallback mode.

---

## Development & testing tips 💡

- To test the Tink flow end-to-end you need valid `TINK_CLIENT_*` credentials and a publicly accessible redirect or a local tunnel (ngrok) pointed at `server` port if Tink requires it.
- When experimenting with subscription detection, add noisy transactions to the fixtures in `src/data/` and tune similarity thresholds in `SubscriptionSlayer.jsx`.
- Use browser dev tools to inspect cookies. Sessions are cookie-based and HTTP-only cookies are used for security.
- The server exposes the calculator endpoints — useful for writing deterministic unit tests for financial logic without spinning up the whole frontend.

---

## Troubleshooting 🩺

- **No transactions / 401 errors**: Session expired or token is missing. Reconnect the bank via the frontend "Connect" flow or call `/api/tink/connect` to get a Tink Link URL.
- **Tink errors**: Check server logs for the full `error.response.data` (server attempts to include Tink's error message in logs). Ensure `TINK_CLIENT_ID` and `TINK_CLIENT_SECRET` are set.
- **Chart looks empty**: Verify the `/api/calculate/compound` request payload is valid and returns `data` with `year` and `balance` points.
- **UI layout breaks on narrow screens**: The app's layout is responsive but not optimized for very small phones yet. Use larger widths or desktop for best viewing.

---

## Contributing & License ❤️

Contributions are welcome — open an issue or PR describing the change and any relevant tests. Keep logic in `src/utils` or `server` for API changes and add tests where feasible.

---

If you'd like, I can also:
- Add an example `.env.example` file with the vars above ✅
- Add small unit tests for server calculators ✅
- Draft a short CONTRIBUTING.md template ✅

---

Thanks — enjoy exploring your finances. If you want, tell me which sections you'd like expanded or any particular architectural detail you'd like documented more deeply.
