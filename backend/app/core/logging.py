"""Logging setup.

The service layer previously used ~20 bare ``print(f"DEBUG: ...")`` calls that
emitted upstream URLs and full response bodies unconditionally. Those are now
``logger.debug``, off by default and controlled by LOG_LEVEL.

Output is line-oriented in development (readable) and JSON in production
(parseable), and every record carries the request id so one user's requests can
be followed across the log.
"""

from __future__ import annotations

import json
import logging
import logging.config
from contextvars import ContextVar
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from app.core.config import Settings

# Set by the request-id middleware; read by the log filter below.
request_id_var: ContextVar[str | None] = ContextVar("request_id", default=None)

_CONFIGURED = False

# Attributes LogRecord always carries; anything else was passed as `extra` and
# is worth including in the structured output.
_STANDARD_ATTRS = frozenset(logging.LogRecord("", 0, "", 0, "", None, None).__dict__) | {
    "asctime",
    "message",
    "taskName",
    "request_id",
}


class RequestIdFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_var.get() or "-"
        return True


class JsonFormatter(logging.Formatter):
    """One JSON object per line, for ingestion by a log aggregator."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": getattr(record, "request_id", "-"),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        for key, value in record.__dict__.items():
            if key not in _STANDARD_ATTRS and not key.startswith("_"):
                payload[key] = value

        return json.dumps(payload, default=str)


def configure_logging(settings: Settings) -> None:
    global _CONFIGURED
    if _CONFIGURED:
        return

    level = settings.log_level.upper()
    formatter = "json" if settings.log_json else "console"

    logging.config.dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "filters": {"request_id": {"()": RequestIdFilter}},
            "formatters": {
                "console": {
                    "format": "%(asctime)s %(levelname)-8s [%(request_id)s] %(name)s: %(message)s",
                    "datefmt": "%Y-%m-%dT%H:%M:%S",
                },
                "json": {"()": JsonFormatter},
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": formatter,
                    "filters": ["request_id"],
                    "stream": "ext://sys.stdout",
                },
            },
            "root": {"handlers": ["console"], "level": level},
            "loggers": {
                "app": {"level": level, "handlers": ["console"], "propagate": False},
                # httpx logs every request line at INFO, including the full URL.
                # Those URLs can embed upstream identifiers, so keep it quieter.
                "httpx": {"level": "WARNING"},
                "httpcore": {"level": "WARNING"},
                "uvicorn.access": {"level": "INFO"},
            },
        }
    )
    _CONFIGURED = True
