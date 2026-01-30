#!/usr/bin/env bash
set -euo pipefail

# Seeded E2E test runner - delegates to shared e2e-run.sh
# Accepts: browser type as first parameter (chromium, firefox, or webkit)
# If no parameter provided, defaults to chromium
BROWSER=${1:-chromium}  # Default to chromium if not specified
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

"$SCRIPT_DIR/e2e-run.sh" auth headless "--project=$BROWSER (seeded)"

