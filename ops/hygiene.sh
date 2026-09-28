#!/usr/bin/env bash
#
# Tripwires for defects this repository has actually had.
#
# Usage: ops/hygiene.sh

set -uo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

FAILURES=0
check() {
    local label="$1"; shift
    if "$@"; then
        printf 'ok   %s\n' "$label"
    else
        printf 'FAIL %s\n' "$label"
        FAILURES=$((FAILURES + 1))
    fi
}

# Tracked files plus new ones that are not gitignored: `git ls-files` alone
# sees only what is committed, so a file added in the same change is skipped.
repo_files() {
    git ls-files --cached --others --exclude-standard
}

# `! cmd | xargs grep | grep .` is unreliable under `set -o pipefail`: xargs
# returns non-zero when a batch has no match, which makes the pipeline non-zero
# and the negation report success while printing the matches it found.
expect_no_matches() {
    local hits
    hits=$(eval "$1" 2>/dev/null)
    [ -z "$hits" ] && return 0
    echo "$hits" | head -20 | sed 's/^/  /'
    return 1
}

# The language picker used national flags. Eleven of the thirteen languages got
# the identical Indian flag so it distinguished nothing, English got the flag of
# the United States in an app about travelling in India, and Urdu got the flag
# of Pakistan though it is one of India's twenty-two scheduled languages. A
# language is not a country.
no_flags_for_languages() {
    expect_no_matches "repo_files | grep -E '^frontend/.*\.(ts|tsx)\$' | xargs grep -nP '[\x{1F1E6}-\x{1F1FF}]{2}'"
}

# Credentials and env files.
no_env_committed() {
    expect_no_matches "repo_files | grep -E '(^|/)\.env(\..*)?\$' | grep -vE '\.env\.example\$|\.env\.sample\$'"
}

# Build output and virtualenvs.
no_build_artefacts_committed() {
    # git ls-files, not repo_files: "committed" is about what is tracked, and an
    # artefact that is merely gitignored is already fine.
    expect_no_matches "git ls-files | grep -E '^(frontend/\.next|frontend/node_modules|backend/\.venv|backend/__pycache__|playwright-report|test-results)/|\.pyc\$'"
}

# Only Python package markers may be empty.
no_empty_source_files() {
    local bad=0 f
    for f in $(repo_files | grep -E '\.(py|ts|tsx|sh)$'); do
        if [ ! -s "$f" ] && [ "$(basename "$f")" != "__init__.py" ]; then
            echo "  empty file: $f"
            bad=1
        fi
    done
    [ "$bad" -eq 0 ]
}

# The backend coverage floor is the only thing that notices a suite which has
# stopped running anything: pytest exits 0 on zero tests.
backend_has_a_coverage_floor() {
    grep -qE 'cov-fail-under' backend/pyproject.toml
}

# CI must not be scheduled: push, pull_request and workflow_dispatch only.
ci_has_no_schedule() {
    expect_no_matches "grep -n 'schedule:' .github/workflows/*.yml"
}

# House style: no em dashes, en dashes or emoji in anything tracked.
no_decorative_glyphs() {
    expect_no_matches "repo_files | grep -vE '\.(png|jpg|jpeg|gif|svg|ico|woff2?)\$|package-lock\.json\$' | xargs grep -nP '[\x{2013}\x{2014}\x{1F000}-\x{1FAFF}\x{2600}-\x{27BF}\x{FE0F}]'"
}

readme_images_resolve() {
    local missing=0 img found=0
    for img in $( { grep -ohE '\]\(([^)]+\.(jpg|jpeg|png|gif))\)' README.md 2>/dev/null | sed -E 's/^\]\(//; s/\)$//';
                    grep -ohE 'src="([^"]+\.(jpg|jpeg|png|gif))"' README.md 2>/dev/null | sed -E 's/^src="//; s/"$//'; } | sort -u ); do
        found=$((found + 1))
        [ -f "$img" ] || { echo "  missing image: $img"; missing=1; }
    done
    # A check that matched nothing is not a check that passed.
    [ "$found" -gt 0 ] || { echo "  no image references found at all"; missing=1; }
    [ "$missing" -eq 0 ]
}

check "no national flags used for languages"   no_flags_for_languages
check "no .env committed"                      no_env_committed
check "no build artefacts committed"           no_build_artefacts_committed
check "no empty source files"                  no_empty_source_files
check "backend has a coverage floor"           backend_has_a_coverage_floor
check "CI is not scheduled"                    ci_has_no_schedule
check "no em dashes, en dashes or emoji"       no_decorative_glyphs
check "README images all resolve"              readme_images_resolve

echo
if [ "$FAILURES" -eq 0 ]; then
    echo "hygiene: all checks passed"
else
    echo "hygiene: ${FAILURES} check(s) failed"
fi
exit "$FAILURES"
