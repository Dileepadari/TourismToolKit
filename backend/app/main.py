import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter

from app.core.config import get_settings
from app.core.logging import configure_logging
from app.core.middleware import RequestIdMiddleware
from app.graphql.context import get_context
from app.graphql.schema import schema

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    from app.database.session import make_engine, make_sessionmaker
    from app.services.http import build_http_client

    settings = get_settings()
    configure_logging(settings)

    app.state.settings = settings
    app.state.engine = make_engine(settings)
    app.state.sessionmaker = make_sessionmaker(app.state.engine)
    app.state.http = build_http_client(settings)

    logger.info("environment=%s", settings.environment)
    # Turns "every AI feature is silently dead" into a visible boot-time symptom.
    logger.info("bhashini: %s", settings.bhashini.describe())

    try:
        yield
    finally:
        await app.state.http.aclose()
        await app.state.engine.dispose()


settings = get_settings()

app = FastAPI(
    title="TourismToolKit API",
    version="0.2.0",
    lifespan=lifespan,
    docs_url="/docs" if not settings.is_production else None,
    redoc_url=None,
)

# Origins come from settings (CORS_ORIGINS, comma-separated) rather than being
# hardcoded here, in the old app/config.py, and in an unread env var all at once.
# Outermost, so every request (including ones CORS rejects) gets an id.
app.add_middleware(RequestIdMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=settings.cors_origin_regex,
    # Required for cookie auth: without it the browser will not send the
    # HttpOnly session cookies on cross-origin requests.
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(
    GraphQLRouter(
        schema,
        context_getter=get_context,
        graphql_ide="graphiql" if settings.graphql_ide else None,
    ),
    prefix="/graphql",
)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "message": "TourismToolKit GraphQL API",
        "graphql": "/graphql",
        "health": "/health",
    }


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "healthy"}


@app.get("/health/detail")
def health_detail() -> dict[str, object]:
    """Which upstream services are configured. Endpoint *names* only, no values."""
    if settings.is_production:
        return {"status": "healthy"}
    return {
        "status": "healthy",
        "environment": settings.environment,
        "bhashini": settings.bhashini.configured(),
    }


# The old explicit `@app.options("/graphql")` handler is gone: CORSMiddleware
# already answers preflight, and that route shadowed the GraphQL router for OPTIONS.
