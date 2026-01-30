#!/usr/bin/env bash
set -euo pipefail

# Shared E2E test runner
# Usage: e2e-run.sh <auth-mode> <display-mode> [project-args...]
#   auth-mode: "auth" for seeded tests, "unauth" for unauthenticated tests (mandatory)
#   display-mode: "headed" for UI mode, "headless" for standard mode (mandatory)
#   project-args: (optional) one or more --project flags. If omitted, runs all projects

# Validate minimum arguments
if [ $# -lt 2 ]; then
  echo "❌ Error: Missing required arguments" >&2
  echo "" >&2
  echo "Usage: e2e-run.sh <auth-mode> <display-mode> [project-args...]" >&2
  echo "  auth-mode: 'auth' or 'unauth'" >&2
  echo "  display-mode: 'headed' or 'headless'" >&2
  echo "  project-args: (optional) --project=\"browser (type)\"" >&2
  echo "" >&2
  echo "Examples:" >&2
  echo "  e2e-run.sh auth headless --project=\"chromium (seeded)\"" >&2
  echo "  e2e-run.sh unauth headed" >&2
  exit 1
fi

AUTH_MODE="$1"
DISPLAY_MODE="$2"
shift 2

# Validate auth mode
if [[ "$AUTH_MODE" != "auth" && "$AUTH_MODE" != "unauth" ]]; then
  echo "❌ Error: Invalid auth mode '$AUTH_MODE'" >&2
  echo "Expected: 'auth' or 'unauth'" >&2
  exit 1
fi

# Validate display mode
if [[ "$DISPLAY_MODE" != "headed" && "$DISPLAY_MODE" != "headless" ]]; then
  echo "❌ Error: Invalid display mode '$DISPLAY_MODE'" >&2
  echo "Expected: 'headed' or 'headless'" >&2
  exit 1
fi

# Set environment variables for auth mode
if [ "$AUTH_MODE" = "auth" ]; then
  export ENABLE_TEST_SESSION_SEED="true"
  
  # If NEXTAUTH_SECRET is not set, try to read from .env.local
  if [ -z "${NEXTAUTH_SECRET:-}" ] && [ -f ".env.local" ]; then
    NEXTAUTH_SECRET=$(grep -E "^NEXTAUTH_SECRET=" .env.local | head -n 1 | cut -d'=' -f2- | sed 's/^["'\'']//' | sed 's/["'\'']$//')
    export NEXTAUTH_SECRET
  fi
  
  # Fallback to default if still not set
  if [ -z "${NEXTAUTH_SECRET:-}" ]; then
    export NEXTAUTH_SECRET="dev-e2e-secret"
  fi
else
  export ENABLE_TEST_SESSION_SEED="false"
fi

# Run playwright with appropriate flags
if [ $# -eq 0 ]; then
  # No project args - run all projects
  if [ "$DISPLAY_MODE" = "headed" ]; then
    npx playwright test --ui
  else
    npx playwright test
  fi
else
  # Project args provided
  if [ "$DISPLAY_MODE" = "headed" ]; then
    npx playwright test --ui "$@"
  else
    npx playwright test "$@"
  fi
fi
