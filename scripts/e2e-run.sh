#!/usr/bin/env bash
set -euo pipefail

# Shared E2E test runner - called by both seeded and unauth scripts
# 
# Requirements:
#   - Bash 3.0+ (uses array syntax and [[ ]] conditionals)
#
# Usage: e2e-run.sh <seed-mode> <project1> <project2> <project3> [additional-args...]
#   seed-mode: "true" for seeded tests, "false" for unauth tests
#   projects: three default project flags to use

SEED_MODE="$1"
shift

PROJECT1="$1"
PROJECT2="$2"
PROJECT3="$3"
shift 3

PROJECTS=("$PROJECT1" "$PROJECT2" "$PROJECT3")

# Set environment variables
export ENABLE_TEST_SESSION_SEED="$SEED_MODE"
if [ "$SEED_MODE" = "true" ]; then
  export NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-dev-e2e-secret}
fi

# Filter out --ui from arguments (portable across all shells)
filtered_args=()
for arg in "$@"; do
  if [ "$arg" != "--ui" ]; then
    filtered_args+=("$arg")
  fi
done

# Check if user specified custom projects or other flags
if [[ "$@" == *"--project"* ]]; then
  # User provided custom projects, use them as-is
  npx playwright test "$@"
elif [[ "$@" == *"--ui"* ]]; then
  # UI mode with default projects (exclude --ui from arguments)
  npx playwright test --ui "${PROJECTS[@]}" "${filtered_args[@]}"
else
  # Standard run with default projects
  npx playwright test "${PROJECTS[@]}" "$@"
fi
