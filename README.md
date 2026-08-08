# TourismToolKit

A multilingual travel companion for India: translation, speech, OCR, a personal
phrasebook, and practical local information - in thirteen languages.

![Docker](https://img.shields.io/badge/Docker-ready-blue?style=flat-square)
![Languages](https://img.shields.io/badge/languages-13-green?style=flat-square)
![API](https://img.shields.io/badge/API-GraphQL-purple?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square)

---

## What it does

| Feature | Status |
|---|---|
| Text translation between Indian languages | Working - needs Bhashini credentials |
| Text-to-speech | Working - needs Bhashini credentials |
| Speech-to-text | Working - needs Bhashini credentials |
| OCR from photos of signs and menus | Working - needs Bhashini credentials |
| Personal dictionary (save, tag, favourite, search) | Working |
| Tourist places, emergency contacts, culture tips | Working |
| Accounts, sessions, password reset | Working |
| Dark / light / system themes | Working |
| UI in 13 languages | Working |

The four AI features call the [Bhashini](https://bhashini.gov.in/) and
[Canvas](https://canvas.iiit.ac.in/) APIs. Without credentials the app runs and
everything else works; those four report that they are not configured. The
backend logs exactly which are available at startup:

```
INFO app.main: bhashini: asr=[bn,en,gu,hi,kn,ml,mr,pa,ta,te] tts=[default,en,hi] mt=[en_hi]
```

---

## Quick start

**Prerequisites:** Docker with Compose v2. That is all - the images bring their
own Python and Node.

```bash
git clone https://github.com/Dileepadari/TourismToolKit.git
cd TourismToolKit

# One required secret.
echo "JWT_SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(48))')" > .env

# Start, applying migrations and loading the starter content.
SEED_DB=true docker compose up -d --build
```

| | |
|---|---|
| App | http://localhost:3000 |
| GraphQL API + playground | http://localhost:8000/graphql |
| Health | http://localhost:8000/health |

To enable translation, speech and OCR, add your Bhashini credentials:

```bash
cp backend/.env.example backend/.env   # then fill in the BASHINI_* values
docker compose up -d --build backend
```

`backend/.env.example` documents every variable. Endpoints are discovered by
naming convention, so adding a language is a config change with no code change.

---

## Architecture

```
frontend/   Next.js 16 · React 19 · Apollo Client 4 · Tailwind v4
   │  HttpOnly cookies, credentials: 'include'
   ▼
backend/    FastAPI · Strawberry GraphQL · SQLModel (async) · psycopg 3
   │
   ├── PostgreSQL 18       schema owned by Alembic
   └── Bhashini / Canvas   translation, TTS, ASR, OCR (httpx, async)
```

**Frontend** - Next.js 16 App Router, React 19, Apollo Client 4, Tailwind v4
(the India-inspired palette lives in `app/globals.css`), Motion for animation,
a hand-rolled theme provider that applies the stored theme before first paint,
and locales loaded on demand rather than all thirteen up front.

**Backend** - FastAPI with a Strawberry GraphQL schema assembled from typed
domain classes, async SQLModel over psycopg 3, Alembic migrations, and
`pydantic-settings` for configuration. Every resolver takes its own session,
because GraphQL executes sibling root fields concurrently.

**Auth** - short-lived access token plus a rotating refresh token, both in
`HttpOnly` cookies. The client never handles a credential, so an XSS cannot steal
a session, and signing out revokes server-side. Refresh-token reuse is treated as
theft and ends every session for that account.

---

## Development

```bash
# Database only; run the apps on the host.
make dev

# Backend (uv manages Python and the locked dependencies)
cd backend
cp .env.example .env
uv sync
uv run python -m app.database.bootstrap    # migrate
uv run python -m app.database.seed_data    # optional starter content
uv run uvicorn app.main:app --reload

# Frontend
cd frontend
npm ci
npm run dev
```

`make help` lists every target. `DEVELOPMENT.md` covers the API, the database,
deployment and troubleshooting in depth.

---

## Tests

Everything below runs in CI on every push and pull request.

```bash
cd backend
uv run pytest              # ~240 tests against a real Postgres, coverage gated at 80%
uv run ruff check app alembic tests
uv run mypy app

cd frontend
npm test                   # Vitest
npm run typecheck
npm run lint
npm run test:e2e           # Playwright (needs the stack running)
```

Tests that exist because the bug they cover was real:

- **`test_auth_flow.py`** - registration persists a row. The mutation that
  shipped was a mock returning a valid token without writing to the database.
- **`test_dictionary_mutations.py`** - one user cannot read or modify another's
  entries, even when passing their user id.
- **`test_frontend_documents.py`** - every `gql` document in the frontend
  validates against the live schema, so a client/server mismatch fails CI rather
  than silently returning nothing in the browser.
- **`test_sessions.py`** - refresh rotation, replay detection, and that a
  password-reset token cannot be redeemed as a session.
- **Locale parity** - all 13 languages carry every key, so a gap is a test
  failure rather than a silent fallback to English.

---

## Languages

UI translations exist for all thirteen. The translation *API* covers fewer, and
`getSupportedLanguages` reports only what actually works, so the picker never
offers something that will fail.

| | Language | UI | Translate | Speech | OCR |
|---|---|:--:|:--:|:--:|:--:|
| en | English | ✅ | ✅ | ✅ | ✅ |
| hi | हिन्दी | ✅ | ✅ | ✅ | ✅ |
| te | తెలుగు | ✅ | ✅ | ✅ | ✅ |
| ta | தமிழ் | ✅ | ✅ | ✅ | ✅ |
| kn | ಕನ್ನಡ | ✅ | ✅ | ✅ | ✅ |
| ml | മലയാളം | ✅ | - | ✅ | ✅ |
| bn | বাংলা | ✅ | - | ✅ | ✅ |
| gu | ગુજરાતી | ✅ | - | ✅ | ✅ |
| mr | मराठी | ✅ | - | ✅ | ✅ |
| pa | ਪੰਜਾਬੀ | ✅ | - | ✅ | ✅ |
| ur | اردو | ✅ | - | - | - |
| as | অসমীয়া | ✅ | - | - | - |
| or | ଓଡ଼ିଆ | ✅ | - | - | - |

---

## Seeded content

`SEED_DB=true` loads 120 dictionary entries, 20 destinations, 18 emergency
contacts and 26 culture tips, plus demo accounts.

The demo accounts use well-known passwords and exist for local exploration only.
Do not seed a public deployment.

| Email | Password |
|---|---|
| admin@tourismtoolkit.com | admin123 |
| test@example.com | password123 |
| demo@tourismtoolkit.com | demo123 |

---

## Common tasks

```bash
make up / make down / make logs      # stack lifecycle
make migrate                          # apply migrations
make migration                        # create one from model changes
make seed                             # reload starter content
make shell-db                         # psql
make test / make lint                 # both projects
make schema                           # regenerate backend/schema.graphql
./scripts/reset-db.sh                 # destroy and rebuild the database
```

**Upgrading from an older checkout:** the database moved from PostgreSQL 15 to
18, whose data directory is not readable by the older server. Dump, recreate,
restore - see the comment in `docker-compose.yml`.

---

## Contributing

1. Branch from `main`.
2. Keep `make lint` and `make test` green; CI enforces both.
3. If you change the GraphQL schema, run `make schema` - the committed
   `backend/schema.graphql` is what the frontend types are checked against.
4. Migrations: `make migration`, then review the generated file before
   committing. `alembic check` must report no drift.

`IMPROVEMENTS.md` lists the known remaining work.

---

## License

MIT - see [LICENSE](LICENSE).

Built with [Bhashini](https://bhashini.gov.in/) and
[Canvas, IIIT Hyderabad](https://canvas.iiit.ac.in/).
