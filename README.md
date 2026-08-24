# PathWise

Track every job and internship application in one place — six stages, deadlines
that surface themselves, and a funnel computed from your own log.

One Expo codebase ships all three targets:

| Target | How |
| --- | --- |
| Website — [pathwise.lol](https://pathwise.lol) | `expo export --platform web` → static export on Vercel |
| iOS | EAS Build → App Store |
| Android | EAS Build → Play Store |

The API is a Flask app in `backend/`, deployed as Vercel Python functions at
`api.pathwise.lol` against Neon Postgres.

## Layout

```
app/            Expo Router routes (landing, auth, the five app tabs, legal pages)
components/     Shared UI — primitives in components/ui
theme/          Design tokens (dark + light) and the theme provider
state/          Auth, applications, toasts, and the derived-state hook
lib/            API client, storage, date formatting, demo data
backend/        Flask API, Alembic migrations, tests
legacy-web/     The previous Next.js frontend, kept only for reference
```

`state/useDerived.ts` is the single definition of every computed value the
screens show — metrics, upcoming deadlines, board columns, the calendar grid and
the funnel. It is a direct port of the design's `renderVals()`.

## Running it

### API

```bash
cd backend
python3 -m venv .venv && ./.venv/bin/pip install -r requirements.txt
cp ../.env.example .env          # then fill in DATABASE_URL, SECRET_KEY, JWT_SECRET
FLASK_APP="app:create_app" ./.venv/bin/python -m flask db upgrade
./.venv/bin/python run_dev.py    # http://localhost:5001
```

Tests: `cd backend && ./.venv/bin/python -m pytest -q`

### App

```bash
npm install
npm start          # then press i for iOS, a for Android, w for web
```

Point the app at a different API with `EXPO_PUBLIC_API_URL` (see
`.env.local.example`).

Build the site the way Vercel does:

```bash
npm run build:web && npx serve dist
```

## Demo mode

The landing page's "View the demo" button loads twelve sample applications into
local state — no account, no network. It is the same data the design used, with
the dates shifted to be relative to today so it never goes stale.

## Deploying

Two Vercel projects share this repository:

| Project | Root directory | Output | Domain |
| --- | --- | --- | --- |
| `pathwise-web` | `.` | `dist` | `pathwise.lol`, `www.pathwise.lol` |
| `pathwise-api` | `backend` | `api/index.py` | `api.pathwise.lol` |

Set `DATABASE_URL`, `SECRET_KEY`, `JWT_SECRET`, `CORS_ORIGINS` and `APP_BASE_URL`
on `pathwise-api`, and `EXPO_PUBLIC_API_URL` on `pathwise-web`. Run
`flask db upgrade` against the Neon database yourself — the app never creates or
alters tables at runtime.
