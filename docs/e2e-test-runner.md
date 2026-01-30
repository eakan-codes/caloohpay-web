# E2E Test Runner Documentation

## Overview

The E2E test runner scripts provide a simplified, validated interface for running Playwright tests in different configurations. The system supports both CI/CD matrix parallelization and local development workflows.

## Architecture

```
scripts/
├── e2e-run.sh       # Core test runner with validation
├── e2e-seeded.sh    # Wrapper for authenticated tests
└── e2e-unauth.sh    # Wrapper for unauthenticated tests
```

## Core Runner: `e2e-run.sh`

### Interface

```bash
e2e-run.sh <auth-mode> <display-mode> [projects...]
```

### Arguments

1. **`auth-mode`** (mandatory)
   - `auth` - Run with pre-seeded authentication (seeded tests)
   - `unauth` - Run without authentication (login/redirect tests)

2. **`display-mode`** (mandatory)
   - `headed` - Interactive UI mode (Playwright UI)
   - `headless` - Standard CLI mode (default for CI)

3. **`projects`** (optional)
   - Zero or more `--project="name"` flags
   - If omitted, runs ALL configured Playwright projects
   - Examples:
     - `--project="chromium (seeded)"`
     - `--project="firefox (unauth)"`
     - `--project="webkit (seeded)"`

### Input Validation

The script validates all inputs and provides clear error messages:

```bash
# Missing arguments
$ ./scripts/e2e-run.sh
❌ Error: Missing required arguments

Usage: e2e-run.sh <auth-mode> <display-mode> [project-args...]
  auth-mode: 'auth' or 'unauth'
  display-mode: 'headed' or 'headless'
  project-args: (optional) --project="browser (type)"

# Invalid auth mode
$ ./scripts/e2e-run.sh invalid headless
❌ Error: Invalid auth mode 'invalid'
Expected: 'auth' or 'unauth'

# Invalid display mode
$ ./scripts/e2e-run.sh auth invalid
❌ Error: Invalid display mode 'invalid'
Expected: 'headed' or 'headless'
```

### Examples

```bash
# Run all seeded projects (chromium, firefox, webkit) in headless mode
./scripts/e2e-run.sh auth headless

# Run single browser in UI mode
./scripts/e2e-run.sh auth headed --project="chromium (seeded)"

# Run all unauth projects in headless mode
./scripts/e2e-run.sh unauth headless

# Run specific unauth browser in UI mode
./scripts/e2e-run.sh unauth headed --project="firefox (unauth)"
```

## Wrapper Scripts

### `e2e-seeded.sh` - Authenticated Tests

**Purpose**: Run tests with pre-seeded NextAuth JWT session.

**Interface**:

```bash
e2e-seeded.sh [browser]
```

**Arguments**:

- `browser` (optional): `chromium` (default), `firefox`, or `webkit`

**Examples**:

```bash
./scripts/e2e-seeded.sh              # Chromium only (default)
./scripts/e2e-seeded.sh firefox      # Firefox only
./scripts/e2e-seeded.sh webkit       # Webkit only
```

**Implementation**:

```bash
BROWSER=${1:-chromium}
./scripts/e2e-run.sh auth headless "--project=$BROWSER (seeded)"
```

### `e2e-unauth.sh` - Unauthenticated Tests

**Purpose**: Run tests without authentication to verify login and redirect flows.

**Interface**:

```bash
e2e-unauth.sh [browser]
```

**Arguments**:

- `browser` (optional): `chromium`, `firefox`, `webkit`, or `all` (default)

**Examples**:

```bash
./scripts/e2e-unauth.sh              # All 3 browsers (default)
./scripts/e2e-unauth.sh all          # All 3 browsers (explicit)
./scripts/e2e-unauth.sh chromium     # Chromium only
./scripts/e2e-unauth.sh firefox      # Firefox only
```

**Implementation**:

```bash
BROWSER=${1:-all}
if [ "$BROWSER" = "all" ]; then
  ./scripts/e2e-run.sh unauth headless \
    "--project=chromium (unauth)" \
    "--project=firefox (unauth)" \
    "--project=webkit (unauth)"
else
  ./scripts/e2e-run.sh unauth headless "--project=$BROWSER (unauth)"
fi
```

## NPM Scripts

### Available Commands

```bash
# Unit tests
npm test                      # Run all unit tests
npm run test:watch            # Watch mode
npm run test:coverage         # Coverage report

# E2E - Seeded (authenticated)
npm run test:e2e:seeded       # Chromium only (fastest for development)
npm run test:e2e:seeded:all   # All 3 browsers
npm run test:e2e:seeded:ui    # Interactive UI mode, all browsers

# E2E - Unauth (login flows)
npm run test:e2e:unauth       # All 3 browsers
npm run test:e2e:unauth:ui    # Interactive UI mode, all browsers

# E2E - All projects
npm run test:e2e              # All seeded + unauth projects
npm run test:e2e:ui           # Interactive UI mode
npm run test:e2e:report       # View HTML report
```

### Implementation Details

```json
{
  "scripts": {
    "test:e2e:seeded": "./scripts/e2e-seeded.sh chromium",
    "test:e2e:seeded:all": "./scripts/e2e-run.sh auth headless",
    "test:e2e:seeded:ui": "./scripts/e2e-run.sh auth headed",
    "test:e2e:unauth": "./scripts/e2e-unauth.sh all",
    "test:e2e:unauth:ui": "./scripts/e2e-run.sh unauth headed"
  }
}
```

## CI/CD Integration

### GitHub Actions Matrix Strategy

Both seeded and unauth tests use matrix parallelization:

```yaml
jobs:
  seeded:
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
      fail-fast: false
    steps:
      - run: ./scripts/e2e-seeded.sh ${{ matrix.browser }}

  unauth:
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
      fail-fast: false
    steps:
      - run: ./scripts/e2e-unauth.sh ${{ matrix.browser }}
```

### Benefits

- **3× speedup**: 3 parallel jobs instead of sequential execution
- **~15 min → ~5 min**: Total CI time reduced
- **Independent retries**: Each browser can retry independently
- **Separate artifacts**: Per-browser test reports for clearer diagnostics
- **Optimized installation**: Only installs required browser per job

### Environment Variables

The core runner automatically sets:

```bash
# For auth mode
export ENABLE_TEST_SESSION_SEED="true"
export NEXTAUTH_SECRET="..."  # From .env.local or default

# For unauth mode
export ENABLE_TEST_SESSION_SEED="false"
```

## Playwright Configuration

### Project Definitions

```typescript
// playwright.config.ts
projects: [
  // Seeded (authenticated)
  { name: 'chromium (seeded)', storageState: 'tests/e2e/.auth/state.json' },
  { name: 'firefox (seeded)', storageState: 'tests/e2e/.auth/state.json' },
  { name: 'webkit (seeded)', storageState: 'tests/e2e/.auth/state.json' },

  // Unauth (no session)
  { name: 'chromium (unauth)', storageState: undefined },
  { name: 'firefox (unauth)', storageState: undefined },
  { name: 'webkit (unauth)', storageState: undefined },
];
```

### Session Seeding

Seeded tests use a pre-created JWT session stored in `tests/e2e/.auth/state.json`. This is generated by `tests/e2e/global-setup.ts` when `ENABLE_TEST_SESSION_SEED=true`.

## Best Practices

### For Local Development

```bash
# Fast iteration: Use chromium only
npm run test:e2e:seeded

# Debug specific test: Use UI mode
npm run test:e2e:seeded:ui

# Full validation: Run all browsers before PR
npm run test:e2e:seeded:all
npm run test:e2e:unauth
```

### For CI/CD

```bash
# Matrix parallelization
./scripts/e2e-seeded.sh ${{ matrix.browser }}
./scripts/e2e-unauth.sh ${{ matrix.browser }}

# Install only required browser
npx playwright install --with-deps ${{ matrix.browser }}
```

### Troubleshooting

**Tests timeout in CI:**

- Check `playwright.config.ts` timeouts (30s per test, 5min global)
- Ensure `fail-fast: false` in matrix strategy
- Review per-browser artifacts for specific failures

**Authentication issues:**

- Verify `NEXTAUTH_SECRET` is set (GitHub Actions secret)
- Check `tests/e2e/.auth/state.json` was created
- Run with `ENABLE_TEST_SESSION_SEED=true` for seeded tests

**Script errors:**

- Run `bash -n scripts/e2e-*.sh` to validate syntax
- Check argument validation error messages
- Ensure shell scripts have execute permissions: `chmod +x scripts/*.sh`

## Migration from Previous Version

### Old Interface (Deprecated)

```bash
# Old: true/false for seed mode, manual --ui flag
./scripts/e2e-run.sh true --project="..." --ui
./scripts/e2e-run.sh false --project="..."
```

### New Interface

```bash
# New: clear auth/unauth, explicit headed/headless
./scripts/e2e-run.sh auth headed --project="..."
./scripts/e2e-run.sh unauth headless --project="..."
```

### Key Changes

- ✅ `true`/`false` → `auth`/`unauth` (self-documenting)
- ✅ `--ui` flag → `headed`/`headless` argument (required, validated)
- ✅ Input validation with helpful error messages
- ✅ Removed debug echo statements
- ✅ Simplified argument parsing (no while loops)
- ✅ Consistent interface across all scripts
