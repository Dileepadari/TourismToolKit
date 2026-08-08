# Development Guide

Everything documented here exists and works. Where something is not implemented,
it says so.

- [Setup](#setup)
- [Configuration](#configuration)
- [Project layout](#project-layout)
- [Database](#database)
- [Authentication](#authentication)
- [GraphQL API](#graphql-api)
- [Testing](#testing)
- [Rate limits and query cost](#rate-limits-and-query-cost)
- [Logging](#logging)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Setup

### Prerequisites

| Tool | Version | Why |
|---|---|---|
| Docker + Compose v2 | any current | the only requirement for the Docker path |
| [uv](https://docs.astral.sh/uv/) | ≥ 0.5 | manages Python 3.13 and the locked backend deps |
| Node.js | ≥ 20.9 | Next.js 16's floor; 24 is what CI and the image use |

`uv` installs its own Python, so no system Python 3.13 is needed:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Docker (recommended)

```bash
echo "JWT_SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(48))')" > .env
SEED_DB=true docker compose up -d --build
```

`docker-compose.override.yml` is applied automatically and adds development
conveniences: source bind-mounts, `--reload`, and `LOG_LEVEL=DEBUG`. For a
production-shaped run, use the base file alone:

```bash
docker compose -f docker-compose.yml up -d --build
```

### Local

```bash
make dev            # starts only PostgreSQL

cd backend
cp .env.example .env                       # set JWT_SECRET_KEY
uv sync --all-groups
uv run python -m app.database.bootstrap    # apply migrations
uv run python -m app.database.seed_data    # optional
uv run uvicorn app.main:app --reload

cd frontend
npm ci
npm run dev
```

---

## Configuration

`backend/.env.example` is the authoritative list. Copy it and fill in what you
have.

### Required

| Variable | Notes |
|---|---|
| `JWT_SECRET_KEY` | Signs access tokens. `SECRET_KEY` is accepted as a legacy alias. |

Generate one with:

```bash
python3 -c 'import secrets; print(secrets.token_urlsafe(48))'
```

Outside production an unset secret produces an ephemeral key and logs a warning -
sessions drop on restart. In production, startup fails rather than signing with a
predictable value.

### Core

| Variable | Default | Notes |
|---|---|---|
| `ENVIRONMENT` | `development` | `production` forces secure cookies, JSON logs, no GraphQL IDE, no introspection |
| `LOG_LEVEL` | `INFO` | `DEBUG` includes upstream request detail |
| `DATABASE_URL` | local Postgres | `postgresql://` is rewritten to `postgresql+psycopg://` automatically |
| `CORS_ORIGINS` | localhost:3000 | comma-separated |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `15` | short by design; the refresh token carries continuity |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `30` | |
| `SEED_DB` | `false` | seeds starter content on container start |

### Bhashini endpoints

Discovered by naming convention, so adding a language is a config change only:

```
BASHINI_<SERVICE>_API_URL_<LANG>      BASHINI_<SERVICE>_API_TOKEN_<LANG>
BASHINI_MT_API_URL_<SRC>_<TGT>        BASHINI_MT_API_TOKEN_<SRC>_<TGT>
BASHINI_<SERVICE>_API_URL_DEFAULT     per-service fallback
BASHINI_API_TOKEN_DEFAULT             global fallback token
```

`<SERVICE>` is `ASR`, `TTS`, `OCR` or `MT`. The correctly spelled `BHASHINI_`
prefix also works.

On boot the backend logs what it found, so a missing endpoint is visible
immediately rather than surfacing later as a dead feature. `GET /health/detail`
reports the same outside production - names only, never values.

### TLS to upstream

`BHASHINI_VERIFY_SSL` defaults to `true` and should stay there. Both upstream
hosts present valid publicly-trusted chains. If you hit a chain problem, add the
missing CA through `BHASHINI_CA_BUNDLE` (loaded *in addition to* the public
roots) rather than disabling verification - these requests carry access tokens,
so unverified TLS leaks credentials. Disabling it is refused in production.

---

## Project layout

```
backend/
  app/
    core/          config, logging, cookies, rate limiting, middleware
    database/      models, session factory, migration bootstrap, seed data
    graphql/       schema, context, types, queries/, mutations/, extensions
    services/      auth, sessions, bhashini client, http, media, phrases
  alembic/         migrations
  tests/           pytest suite
  schema.graphql   committed SDL; CI fails if it drifts from the code

frontend/
  app/             App Router pages (all client components)
  components/      shared UI
  providers/       Apollo, theme, auth, language, preference sync
  graphql/         documents, typed results, client
  locales/         13 languages, loaded on demand
  tests/           Vitest
  e2e/             Playwright
  proxy.ts         route guard (Next 16's renamed middleware)
```

---

## Database

Alembic owns the schema. There is no `create_all` path in the application.

```bash
make migrate                                   # apply
make migration                                 # create from model changes
docker compose exec backend alembic current    # where am I
docker compose exec backend alembic downgrade -1
```

After changing a model, generate a migration and **read it** before committing.
`alembic check` must report no drift; CI runs it.

Two conventions worth knowing:

- **`import sqlmodel` is in `script.py.mako`.** Autogenerate emits
  `sqlmodel.sql.sqltypes.AutoString()` for every string column, and without the
  import each migration fails with `NameError`.
- **All timestamps are `TIMESTAMPTZ`.** The application writes timezone-aware
  values; a naive column silently drops the offset and then raises when compared
  against `utcnow()`.

`app/database/bootstrap.py` decides between `upgrade` and `stamp` at startup, so
a database created before Alembic existed is stamped rather than re-migrated.

### Seeding and reset

```bash
make seed                # reload starter content
./scripts/reset-db.sh    # destroy the volume and rebuild
```

### Upgrading from PostgreSQL 15

Version 18 cannot read a 15 data directory:

```bash
docker compose exec db pg_dump -U tourism_user tourism_db > backup.sql
docker compose down -v
docker compose up -d db
docker compose exec -T db psql -U tourism_user tourism_db < backup.sql
```

---

## Authentication

Sessions are cookie-based. The client never holds a token.

| Cookie | Contents | Flags | Path |
|---|---|---|---|
| `tt_access` | short-lived JWT | HttpOnly, SameSite=Lax, Secure in prod | `/` |
| `tt_refresh` | opaque refresh token | HttpOnly, SameSite=Lax, Secure in prod | `/graphql` |
| `tt_session` | `1` - a marker, no secret | readable by script | `/` |

`tt_session` exists so the Next.js route guard can tell signed-in from signed-out
without reading a credential it cannot access. It is not an authorisation check;
every GraphQL request is verified server-side.

**Refresh tokens are stored hashed** (SHA-256) and rotated on every use. Reusing
a rotated token is treated as theft: the whole token family is revoked. A token
revoked by ordinary sign-out does *not* trigger that, so signing out on one
device leaves the others alone.

```graphql
mutation { refreshSession { success user { id } } }
mutation { logout(everywhere: true) { sessionsEnded } }
```

API clients that cannot hold cookies may still send
`Authorization: Bearer <access token>`; the context checks the cookie first and
falls back to the header.

### Password reset

`requestPasswordReset` always reports success - telling the caller whether an
address is registered would make it an account-enumeration oracle.

**There is no mail transport configured.** The reset link is written to the
server log instead. Wiring an email provider is the one remaining step for a
public deployment; everything else in the flow (single-use tokens, expiry,
session revocation on password change) is implemented.

---

## GraphQL API

Playground at `http://localhost:8000/graphql` (disabled in production, along with
introspection). The committed `backend/schema.graphql` is the source of truth for
the frontend's types.

```graphql
# Read
query {
  getPlaces(country: "India", limit: 10) { id name city rating images }
  getEmergencyContacts(country: "India") { serviceType number description }
  getCultureTips(country: "India") { tipCategory tipText }
  getSupportedLanguages { languages { code name } }
  me { id email username }
}

# Dictionary - scope comes from the session, not from arguments
query { getUserDictionary { id word translation tags isFavorite } }

mutation {
  addDictionaryEntry(input: {
    word: "water", translation: "पानी",
    languageFrom: "en", languageTo: "hi", tags: ["basics"]
  }) { success message entry { id } }
}

# AI services
mutation {
  translateText(input: { text: "Hello", sourceLang: "en", targetLang: "hi" }) {
    success translatedText message
  }
}
```

### The `userId` argument is deprecated

Dictionary and travel operations still accept `userId` so existing clients keep
validating, but **it is ignored** - the authenticated user comes from the
session. It was previously trusted, which let any caller read and modify any
other user's entries. It will be removed in a future release.

### Errors

Unexpected errors are masked to `"Unexpected error."` with the detail in the
server log, so database errors and upstream URLs never reach a client.
Deliberate, actionable errors - rate limits, query-cost rejections - pass
through with their message intact.

---

## Testing

### Backend

Tests run against real PostgreSQL: `ilike`, the culture-tip ordering and the
migrations are all Postgres-specific. Set `TEST_DATABASE_URL` to reuse a
database, or leave it unset and `testcontainers` starts a throwaway one.

```bash
cd backend
uv run pytest                       # everything, coverage gated at 80%
uv run pytest tests/test_auth_flow.py
uv run pytest -k idor
uv run pytest --no-cov -x -vv       # fast feedback while debugging
```

| Module | Covers |
|---|---|
| `test_auth_flow.py` | registration **persists a row**, login round-trips, duplicates, inactive accounts |
| `test_sessions.py` | rotation, replay detection, revocation, reset tokens, cookie flags |
| `test_auth_service.py` | bcrypt limits, token expiry, `alg:none`, tampering, legacy token shapes |
| `test_dictionary_mutations.py` | CRUD and the IDOR regressions |
| `test_queries.py` | dictionary scoping, JSON columns, culture-tip ordering, phrases |
| `test_upstream.py` | retries, timeouts, TLS policy, payload caps, error masking |
| `test_limits.py` | rate limiting and query depth/alias caps |
| `test_config.py` | env folding, the `SECRET_KEY` alias, weak-secret rejection |
| `test_schema_shape.py` | duplicate-field guard, root field inventory, deprecations |
| `test_frontend_documents.py` | every frontend document validates against the schema |
| `test_migrations.py` | drift, downgrade/upgrade round-trip, stamp-vs-upgrade |
| `test_app.py` | ASGI: health, CORS, cookie auth, concurrent root fields |

### Frontend

```bash
cd frontend
npm test                  # Vitest
npm run test:watch
npm run test:coverage
npm run typecheck
npm run lint

npm run test:e2e          # Playwright; needs the stack running
npm run test:e2e -- auth.spec.ts
npm run test:e2e -- --headed
```

Unit tests cover locale parity across all 13 languages, the translation lookup,
the endpoint resolver and the theme provider including its pre-paint script. The
Playwright specs cover register → sign-in, the route guard, and that the Tailwind
palette and class-based dark mode resolve in a real browser.

---

## Rate limits and query cost

Applied per authenticated user, or per IP when anonymous.

| Bucket | Default | Operations |
|---|---|---|
| `auth` | 10 / 60s | `login`, `register`, `refreshSession` |
| `ai` | 30 / 60s | `translateText`, `generateSpeech`, `extractTextFromImage`, `transcribeAudio` |
| `default` | 300 / 60s | everything else |

Tunable with `RATE_LIMIT_AUTH`, `RATE_LIMIT_AI`, `RATE_LIMIT_DEFAULT` (format
`<count>/<window-seconds>`), and disabled entirely with
`RATE_LIMIT_ENABLED=false`.

Counters are in-process. That is fine for a single service and wrong the moment
you run more than one replica - move them to Redis at that point.

Documents are also capped by depth (`GRAPHQL_MAX_DEPTH`, default 12), alias count
(`GRAPHQL_MAX_ALIASES`, default 30) and token count.

---

## Logging

Readable lines in development, JSON in production (forced by `ENVIRONMENT`).
Every record carries a request id, and every response carries it back as
`x-request-id`. An id supplied by an upstream proxy is honoured, so a trace spans
the whole hop chain.

```
2026-08-08T12:52:24 INFO     [a3f9c1e2] app.main: bhashini: asr=[en,hi] tts=[default]
```

Health-check requests are not logged - they run every 30 seconds and would drown
everything else.

---

## Deployment

### Pick a target first

**Vercel cannot host this backend**: no PostgreSQL, a read-only stateless
filesystem, and a lambda that would have to carry psycopg, Pillow and bcrypt.
Both `vercel.json` files were removed because they were copy-pasted SPA rewrites
that could never have worked.

Two options that do:

**Split** - frontend on Vercel, backend on Fly/Railway/a VPS with managed
Postgres. Set `NEXT_PUBLIC_GRAPHQL_URL` at *build* time to the public backend URL
(it is inlined into the bundle, so a runtime environment variable has no effect),
and add the frontend origin to `CORS_ORIGINS`. Cookie auth across two origins
also needs `COOKIE_DOMAIN` set to a shared parent domain.

**Together** - the whole compose stack behind a reverse proxy terminating TLS.
Simpler, one machine, and cookies stay same-origin.

### Production checklist

- [ ] `ENVIRONMENT=production` (forces secure cookies, JSON logs, IDE and introspection off)
- [ ] `JWT_SECRET_KEY` set to a strong random value - startup fails otherwise
- [ ] `CORS_ORIGINS` set to the real frontend origin only
- [ ] `NEXT_PUBLIC_GRAPHQL_URL` passed as a build arg
- [ ] TLS terminated in front of both services
- [ ] `SEED_DB` unset - the demo accounts have well-known passwords
- [ ] Database backups scheduled (`make backup`)
- [ ] An email provider wired up if you want password reset to deliver

---

## Troubleshooting

**`JWT_SECRET_KEY must be set…` at startup** - production refuses to sign with a
weak or missing secret. Generate one as shown above.

**Everything works except translation, speech and OCR** - no Bhashini
credentials. Check the `bhashini:` line in the startup log, or
`GET /health/detail`.

**`relation "users" does not exist`** - migrations have not run.
`docker compose exec backend python -m app.database.bootstrap`.

**Database container restarts on boot after upgrading** - PostgreSQL 18 cannot
read a 15 data directory. See [Upgrading](#upgrading-from-postgresql-15).

**Frontend calls `localhost:8000` in a deployed environment** -
`NEXT_PUBLIC_GRAPHQL_URL` is inlined at build time. Pass it as a Docker build
arg, not a runtime environment variable, and rebuild.

**Signed out immediately after signing in** - the browser is not storing the
cookies. Over plaintext with `ENVIRONMENT=production`, `Secure` cookies are
dropped; either terminate TLS or use `development` locally. Cross-origin also
requires the frontend origin in `CORS_ORIGINS`.

**`alembic check` fails in CI** - a model changed without a migration. Run
`make migration`, review the result, commit it.

**`schema.graphql` is stale in CI** - run `make schema` and commit.

**Stale frontend after `docker compose up --build`** - Compose reuses anonymous
volumes across recreates. `make up-build` passes `--renew-anon-volumes`; use it.
