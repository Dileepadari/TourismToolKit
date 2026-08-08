"""Shared async HTTP client for outbound upstream calls.

Replaces per-call ``requests.post(..., verify=False)``. Three problems went away
with it:

* **Blocking the event loop.** Strawberry runs sync resolvers inline, so a 30s
  upstream call froze the entire worker for every concurrent user.
* **No timeout.** Six call sites had none at all, so a hung upstream hung the
  worker indefinitely.
* **Disabled TLS verification.** All nine call sites passed ``verify=False``.
  Both upstream hosts (``canvas.iiit.ac.in``, ``dhruva-api.bhashini.gov.in``)
  present valid, publicly-trusted GlobalSign chains - verification was never
  needed, and disabling it exposed the access tokens these calls carry.
"""

from __future__ import annotations

import asyncio
import logging
import random
import ssl
from typing import TYPE_CHECKING, Any

import certifi
import httpx

if TYPE_CHECKING:
    from app.core.config import Settings

logger = logging.getLogger(__name__)

# Transient upstream conditions worth a second attempt. All four Bhashini calls
# are pure functions of their input, so retrying a POST is safe.
RETRY_STATUS = frozenset({429, 500, 502, 503, 504})


class BhashiniNotConfigured(Exception):
    """No URL is configured for the requested service/language."""

    def __init__(self, service: str, keys: tuple[str, ...]) -> None:
        self.service = service
        self.keys = keys
        super().__init__(
            f"{service.upper()} is not configured for {'/'.join(keys) or 'any language'}. "
            f"Set BASHINI_{service.upper()}_API_URL_<LANG> in the environment."
        )


def build_ssl_context(settings: Settings) -> ssl.SSLContext | bool:
    bhashini = settings.bhashini

    if not bhashini.verify_ssl:
        if settings.is_production:
            raise RuntimeError(
                "BHASHINI_VERIFY_SSL=false is refused in production: these requests "
                "carry an access token, so unverified TLS leaks credentials."
            )
        logger.warning(
            "TLS verification is DISABLED for upstream calls (BHASHINI_VERIFY_SSL=false). "
            "Both known upstream hosts present valid public chains, so this should not "
            "be necessary - prefer BHASHINI_CA_BUNDLE if you hit a chain problem."
        )
        return False

    context = ssl.create_default_context(cafile=certifi.where())
    if bhashini.ca_bundle:
        # Loaded *in addition to* the public roots. Passing verify="/path.pem"
        # would replace them and break whichever host uses a public CA.
        context.load_verify_locations(cafile=str(bhashini.ca_bundle))
        logger.info("loaded additional CA bundle: %s", bhashini.ca_bundle)
    return context


def build_http_client(settings: Settings) -> httpx.AsyncClient:
    bhashini = settings.bhashini
    verify = build_ssl_context(settings)
    return httpx.AsyncClient(
        verify=verify,
        timeout=httpx.Timeout(
            bhashini.timeout,
            connect=bhashini.connect_timeout,
            write=10.0,
            pool=5.0,
        ),
        limits=httpx.Limits(max_connections=50, max_keepalive_connections=10),
        headers={"user-agent": "TourismToolKit/0.2"},
        follow_redirects=True,
    )


async def post_with_retry(
    client: httpx.AsyncClient,
    url: str,
    *,
    max_retries: int,
    label: str,
    **kwargs: Any,
) -> httpx.Response:
    """POST with bounded exponential backoff on transient failures.

    ``label`` is what gets logged - never the URL (it can embed upstream
    identifiers) and never the token.
    """
    last_error: Exception | None = None

    for attempt in range(max_retries + 1):
        try:
            response = await client.post(url, **kwargs)
            if response.status_code not in RETRY_STATUS or attempt == max_retries:
                return response
            logger.warning(
                "upstream %s returned %s (attempt %d/%d)",
                label,
                response.status_code,
                attempt + 1,
                max_retries + 1,
            )
        except (httpx.TransportError, httpx.TimeoutException) as exc:
            last_error = exc
            if attempt == max_retries:
                raise
            logger.warning(
                "upstream %s failed: %s (attempt %d/%d)",
                label,
                type(exc).__name__,
                attempt + 1,
                max_retries + 1,
            )

        await asyncio.sleep(0.25 * 2**attempt + random.uniform(0, 0.1))  # noqa: S311

    if last_error:  # pragma: no cover - unreachable, loop either returns or raises
        raise last_error
    raise RuntimeError(f"upstream {label} exhausted retries")  # pragma: no cover
