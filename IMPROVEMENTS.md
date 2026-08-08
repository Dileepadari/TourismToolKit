# Remaining Work

The modernization brought every dependency current, fixed the defects that made
the app non-functional, and then worked through the improvement backlog. This is
what is left.

---

## Needs a decision, not code

### Choose a deployment target

Nothing operational can be finished until this is settled. Vercel cannot host the
backend (no PostgreSQL, stateless read-only filesystem, and a lambda that would
carry psycopg + Pillow + bcrypt). Both `vercel.json` files were removed for that
reason.

- **Split** - frontend on Vercel, backend on Fly/Railway/a VPS. Needs
  `NEXT_PUBLIC_GRAPHQL_URL` as a build arg, the frontend origin in
  `CORS_ORIGINS`, and `COOKIE_DOMAIN` set to a shared parent domain so the auth
  cookies work across both.
- **Together** - the compose stack behind one reverse proxy. Simpler, and
  cookies stay same-origin.

`DEVELOPMENT.md` has the checklist for either.

### Email delivery for password reset

The whole flow is implemented - single-use tokens, expiry, session revocation on
change, no account enumeration. The only missing piece is transport: the reset
link is written to the server log instead of sent. Pick a provider (SES, Postmark,
Resend) and add one `send_email` call in `request_password_reset`.

### Language coverage

The UI ships thirteen languages; the translation API covers five pairs, TTS four
languages, ASR/OCR ten. `getSupportedLanguages` reports the honest union so the
picker never offers something that fails, but `ur`, `as` and `or` still have full
UI text and no translation backend. Either source those endpoints or drop the
three from the picker.

---

## Worth doing, no blockers

### Server-side rendering - *~2–3 days*

Every page is a client component; `app/layout.tsx` is the only server component,
so the App Router's server story is entirely unused and each page ships its data
fetching to the browser.

**Prerequisite:** `translator/page.tsx` (~1,250 lines) and `dictionary/page.tsx`
(~1,230 lines) want decomposition into hooks plus presentational components
first. They are what makes any change in this area expensive. Once that is done,
`/places` and `/guide` are the obvious candidates for RSC data fetching with
`@apollo/client-integration-nextjs`.

### Distributed rate limiting - *when you scale past one replica*

Counters are in-process. Correct for a single service, wrong the moment there are
two: each replica would enforce its own limit. Swap `_MemoryBackend` in
`app/core/ratelimit.py` for Redis at that point - the interface is one method.

### DataLoader - *when the first relationship is exposed*

No resolver traverses a `Relationship` today, so there is no N+1. The moment one
does (`user { dictionaryEntries { … } }`), there will be. Add
`strawberry.dataloader` batching in the same change that exposes it, not before.

### Reclaim repository history - *needs coordination*

`262.mp4` (17 MB) is untracked now but still in history, and accounts for
essentially the whole weight of the repo.

```bash
git filter-repo --path 262.mp4 --path Bhashini.pdf --invert-paths
```

This rewrites every commit hash, so it needs agreeing with anyone holding a
clone. Left undone deliberately.

### Tracing

Logging is structured and request-scoped. The next step is OpenTelemetry spans
around the four upstream calls - that is where the latency actually is.

---

## Smaller items

- **Trip photos and favourite phrases.** `travel_history` stores both as JSON and
  the API returns them, but `/trips` only writes destination, country, date and
  notes. Photos need an upload target before the field means anything.
- **Place detail is read-only.** No reviews, no user photos, and `culturalInfo` /
  `localCustoms` / `emergencyContacts` are columns on `places` that the GraphQL
  type does not expose yet.
- **Expired token cleanup.** `sessions.purge_expired()` exists but nothing calls
  it; rows accumulate. Needs a periodic job.
- **`getCommonPhrases` / `getEmergencyPhrases`** return a hand-written static
  list in three languages. Fine as a fallback, but the other ten fall back to
  English.

---

## Done in this pass

For reference, since the earlier version of this file listed these as pending:

- HttpOnly cookie auth with rotating refresh tokens and replay detection
- Server-side session revocation, including sign-out-everywhere
- Password reset flow (minus email transport)
- Rate limiting on auth and the AI mutations; query depth and alias caps
- Indexes on the dictionary hot path, including pg_trgm for the `ilike` search
- Locale bundle splitting - twelve of thirteen languages are now lazy chunks
- Structured JSON logging with request ids
- Timestamps corrected to `TIMESTAMPTZ`
- Dashboard stat tiles now show real counts instead of invented numbers
- Dashboard "recent activity" derived from real dictionary entries and trips
- Web Speech controls disabled where the browser does not support them
- Saving a place, and sharing one, from both the list and the detail page
- `/places/[id]` detail route - "View Details" used to link to a 404
- Directions on a place open a map instead of rendering an inert button
- `/trips` travel journal: record, list and delete trips
- `fullName` and `homeCountry` persist through `updateProfile`
- An active-sessions panel in `/settings`, with sign-out-everywhere
