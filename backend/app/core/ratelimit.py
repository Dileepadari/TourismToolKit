"""Fixed-window rate limiting.

There was none: `DEVELOPMENT.md` documented a table of limits that had never been
implemented. The two things worth protecting are the auth mutations (credential
stuffing) and the four upstream-calling mutations, each of which costs real money
per request.

In-process counters are deliberate - this app runs as a single service and the
alternative (Redis) is infrastructure the project does not otherwise need. That
choice does not survive horizontal scaling; swap `_MemoryBackend` for a shared
store at that point.
"""

from __future__ import annotations

import threading
import time
from dataclasses import dataclass


@dataclass(frozen=True)
class Limit:
    count: int
    window_seconds: int

    @classmethod
    def parse(cls, spec: str) -> Limit:
        """Parse ``"<count>/<window-seconds>"``, e.g. ``"10/60"``."""
        raw_count, _, raw_window = spec.partition("/")
        try:
            count, window = int(raw_count), int(raw_window)
        except ValueError as exc:
            raise ValueError(f"invalid rate limit {spec!r}; expected '<count>/<seconds>'") from exc
        if count < 1 or window < 1:
            raise ValueError(f"invalid rate limit {spec!r}; both parts must be positive")
        return cls(count, window)


@dataclass
class Decision:
    allowed: bool
    remaining: int
    retry_after: int


class _MemoryBackend:
    """Fixed-window counters, pruned lazily as keys are touched."""

    def __init__(self) -> None:
        self._counters: dict[str, tuple[int, float]] = {}
        self._lock = threading.Lock()

    def hit(self, key: str, limit: Limit, *, now: float | None = None) -> Decision:
        now = time.monotonic() if now is None else now
        with self._lock:
            count, window_start = self._counters.get(key, (0, now))

            if now - window_start >= limit.window_seconds:
                count, window_start = 0, now

            count += 1
            self._counters[key] = (count, window_start)

            if len(self._counters) > 10_000:
                self._prune(now)

        if count > limit.count:
            retry_after = max(1, int(limit.window_seconds - (now - window_start)))
            return Decision(allowed=False, remaining=0, retry_after=retry_after)
        return Decision(allowed=True, remaining=limit.count - count, retry_after=0)

    def _prune(self, now: float) -> None:
        """Drop windows that can no longer be current. Caller holds the lock."""
        cutoff = now - 3600
        self._counters = {key: value for key, value in self._counters.items() if value[1] > cutoff}

    def reset(self) -> None:
        with self._lock:
            self._counters.clear()


limiter = _MemoryBackend()


# Mutations whose cost justifies a tighter limit than the default.
#
# The tight `auth` limit exists to blunt credential stuffing, so it covers the
# fields that accept a guessable credential. `refreshSession` is *not* one of
# them: it authenticates with a 32-byte random cookie, replay is already caught
# by reuse detection, and every client calls it automatically. Sharing the
# credential bucket meant a signed-in user browsing ten pages in a minute was
# locked out of refreshing their own session.
AUTH_OPERATIONS = frozenset({"login", "register"})
SESSION_OPERATIONS = frozenset({"refreshSession"})
AI_OPERATIONS = frozenset(
    {"translateText", "generateSpeech", "extractTextFromImage", "transcribeAudio"}
)


def bucket_for(field_name: str) -> str:
    if field_name in AUTH_OPERATIONS:
        return "auth"
    if field_name in SESSION_OPERATIONS:
        return "session"
    if field_name in AI_OPERATIONS:
        return "ai"
    return "default"
