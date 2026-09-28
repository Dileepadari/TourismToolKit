# Developer notes

`README.md` says what this is and `DEVELOPMENT.md` covers setup in detail. This is the part worth reading before changing anything.

## Shape

```mermaid
flowchart LR
    U[Browser] -->|GraphQL| F[Next 16 frontend]
    F -->|POST /graphql| B[FastAPI + Strawberry]
    B --> DB[(Postgres)]
    B -->|translate, TTS, STT, OCR| BH[Bhashini]

    B -.->|no credentials| ERR[those four features error;<br/>everything else still works]
```

One GraphQL endpoint, one schema file (`backend/schema.graphql`), checked in CI against the code so it cannot drift.

## Things that will surprise you

### Four features need credentials and the rest do not

Translation, text-to-speech, speech-to-text and OCR are Bhashini calls. The phrasebook, places, dictionary and accounts are local. This split is why the README has a status column rather than a feature list: a fresh clone is genuinely usable, just not for the headline feature.

### The stat band on the landing page is fact-checked now

It said "100+ Languages Supported" while the language selector offered thirteen, plus "50K+ Places Covered", "1M+ Translations Made" and "10K+ Happy Travelers" for a project with no users. Those were template placeholders that shipped as claims.

It shows thirteen and twenty, which match the selector and the seed data. The two with no honest number were removed rather than relabelled, because the labels live in thirteen locale files and inventing new English ones would have left twelve languages reading English. If you add a stat, add its label to every locale.

### The language picker does not use flags, on purpose

It did. Eleven of the thirteen languages mapped to the identical Indian flag, so the flag distinguished nothing and the user still had to read the name. English mapped to the flag of the United States, in an app about travelling in India. And Urdu mapped to the flag of Pakistan, though it is one of India's twenty-two scheduled languages with tens of millions of speakers here.

A language is not a country. It shows a two-letter code, which distinguishes all thirteen, claims no nationality, and reads the same to a screen reader as on screen. `ops/hygiene.sh` fails the build if a regional-indicator pair reappears in the frontend.

### The backend coverage floor is the real test signal

`pytest` exits 0 when it runs nothing. `cov-fail-under` in `backend/pyproject.toml` is what notices. It is at 80 and the suite sits at about 88, so there is room, but do not lower it to make a change fit.

### `next dev` writes files into the tree

`frontend/AGENTS.md` and `frontend/CLAUDE.md` are generated on every run and rewritten if deleted. Both are gitignored; check `git status` before a `git add -A`.

### main already contains the modernisation

`modernize/latest-versions` and `main` have byte-identical trees - the branch was rebased onto main and both still exist. `vercel/react-server-components-cve-vu-6fnm7k` bumped Next to 15.5.9 for an RCE advisory and is superseded: main is on 16.3.6. Both branches can go.

## Checks

```bash
cd backend && uv run ruff check . && uv run ruff format --check .
TEST_DATABASE_URL=postgresql+psycopg://tourism_user:tourism_password@localhost:5432/tourism_test \
  JWT_SECRET_KEY=local-test-secret-long-enough-to-pass-validation-000 uv run pytest

cd frontend && npx tsc --noEmit && npm run lint && npm test && npm run build

ops/hygiene.sh
```

CI adds Playwright end-to-end journeys against a built frontend and a real backend, a Docker build, and checks that `schema.graphql` and `requirements.txt` are regenerated. Push, pull request and manual dispatch only.
