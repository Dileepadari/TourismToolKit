FROM python:3.13-slim

# uv provides the resolver + installer; the lockfile makes builds reproducible.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# UV_PROJECT_ENVIRONMENT is deliberately NOT /app/.venv: docker-compose bind-mounts
# ./backend over /app, which would hide a venv installed there. Installing into the
# system interpreter keeps the packages reachable at runtime.
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/usr/local \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# psycopg[binary] ships its own libpq, so no build-essential/libpq-dev needed.
# postgresql-client stays for pg_isready/psql in the entrypoint and Makefile targets.
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl \
        postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Dependency layer: cached until the lockfile changes.
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev

# Application layer.
COPY . .
RUN uv sync --frozen --no-dev

RUN useradd --create-home --uid 1000 app \
    && mkdir -p /app/logs \
    && chown -R app:app /app
USER app

EXPOSE 8000

# /health, not /graphql: the old check only passed because the GraphiQL IDE was
# served in production, so it would break the moment the IDE is disabled.
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -fsS http://localhost:8000/health || exit 1

# No DATABASE_URL baked in - credentials and the compose-only `db` hostname made
# the image unusable anywhere else. It is supplied by the environment.
CMD ["/app/scripts/entrypoint.sh"]
