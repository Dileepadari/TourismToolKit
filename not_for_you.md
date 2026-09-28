# Not for you

An honest list of reasons to close this tab.

**You want the translation to work out of the box.** Translation, text-to-speech, speech-to-text and OCR all go through [Bhashini](https://bhashini.gov.in), the Government of India's language platform. Without credentials those four features return errors. Everything else - the phrasebook, places, dictionary, accounts - works on seeded data with no external service at all, which is why the README marks each feature separately.

**You want a large dataset.** Twenty places and a hundred and twenty dictionary entries, seeded. It is enough to develop against and to demonstrate; it is not a guidebook. The front page says thirteen and twenty because those are the real numbers.

**You want it outside India.** Thirteen Indian languages, Indian places, Indian transport and etiquette notes. The model does not generalise.

**You want to avoid running three things.** Postgres, a Python backend and a Next frontend, wired by `docker compose`. `make up` is one command but it is still three services and a database migration.

**You want a mobile app.** It is a responsive web app. There is no native client and no offline mode: close the tab on a train with no signal and you have nothing.

**You want the front end tested as thoroughly as the back.** The backend has 273 tests at 88% coverage behind an enforced 80% floor. The frontend has 62 unit tests and Playwright end-to-end journeys in CI, which is real but thinner, and most components are verified by looking at them.

**You want to trust the landing page copy.** It says "Your Ultimate Travel Companion" and "AI-powered". Those are a template's words, and this pass only fixed the claims that were checkably false - the stat band said "100+ Languages Supported" for an app with thirteen, and "1M+ Translations Made" and "10K+ Happy Travelers" for a project with no users. The adjectives are still adjectives.

**You need a language picker with flags.** It had them and they are gone deliberately. Eleven of the thirteen languages carried the same Indian flag, so the flag distinguished nothing; English carried the flag of the United States; and Urdu carried the flag of Pakistan, though it is one of India's twenty-two scheduled languages. A language is not a country. It shows the language code now.

**You want a stable API.** GraphQL, one schema file, no versioning and no deprecation policy. `backend/schema.graphql` is checked in CI to match the code, so it will not drift silently, but it will change.
