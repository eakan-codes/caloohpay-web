# CalOohPay Web - AI Agent Instructions

## Project Overview

CalOohPay automates out-of-hours (OOH) on-call compensation calculations for PagerDuty schedules. Built with Next.js 14 (App Router), TypeScript, Material-UI, and NextAuth.js. The core payment calculation logic uses the official [caloohpay npm package](https://www.npmjs.com/package/caloohpay).

## Architecture & Key Patterns

### Dual Authentication System

- **Two authentication methods**: OAuth 2.0 and API Token (both via NextAuth.js)
- OAuth flow: Standard PagerDuty OAuth with JWT sessions
- API Token flow: Custom NextAuth credential provider that validates PagerDuty tokens directly
- **Critical**: Token management in [src/lib/auth/options.ts](src/lib/auth/options.ts) handles both flows - never mix token types
- Protected routes use Next.js middleware ([middleware.ts](middleware.ts))
- See [AUTHENTICATION.md](AUTHENTICATION.md) for full flow diagrams and security model

### Payment Calculation Architecture

- Uses official `caloohpay` npm package ([src/lib/caloohpay.ts](src/lib/caloohpay.ts))
- **DO NOT reimplement payment logic** - re-export from the package
- Rates: £50/weekday (Mon-Thu), £75/weekend (Fri-Sun) - defined in [src/lib/constants.ts](src/lib/constants.ts)
- Weekend = Friday-Sunday (not just Sat-Sun) for payment purposes
- Minimum 6 hours OOH to qualify for payment

### Path Aliases

- Use `@/*` for all src imports: `import { ROUTES } from '@/lib/constants'`
- Configured in [tsconfig.json](tsconfig.json) and [jest.config.ts](jest.config.ts)

### Component Organization

```
src/components/
├── auth/       # Authentication UI (login forms, OAuth buttons)
├── schedules/  # Schedule browsing and calendar views
├── payments/   # Payment calculation and export UI
├── ui/         # Reusable UI primitives
└── common/     # Shared layouts (Header, Footer, ErrorBoundary)
```

## Development Workflows

### Running the App

```bash
npm run dev              # Starts Next.js dev server on :3000
npm run build            # Production build (required before deploy)
npm run type-check       # TypeScript validation (no emit)
```

### Testing Strategy

- **Unit tests**: Jest + React Testing Library ([tests/unit/](tests/unit/))
  - Run: `npm test` or `npm run test:watch`
  - Coverage: `npm run test:coverage` (target >80%)
- **E2E tests**: Playwright with chromium, firefox, webkit ([tests/e2e/](tests/e2e/))
  - Run: `npm run test:e2e` (auto-starts dev server)
  - Debug: `npm run test:e2e:ui` (interactive mode)
- **Test structure**: Mirror `src/` structure in `tests/unit/`
- Mock PagerDuty API calls in tests - never use real credentials

### Code Quality

- **Pre-commit**: Husky runs `lint-staged` (auto-fixes linting/formatting)
- **Commit messages**: Enforced conventional commits via commitlint
  - Format: `type(scope): message` (e.g., `feat(auth): add API token support`)
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- **ESLint**: `npm run lint:fix` for auto-fixes
- **Prettier**: `npm run format` (already runs in pre-commit)

## Critical Integration Points

### PagerDuty API Client

- Located in [src/lib/api/pagerduty.ts](src/lib/api/pagerduty.ts)
- Uses `@pagerduty/pdjs` SDK and Axios for custom calls
- **Always pass auth token**: Either from session (`session.accessToken`) or API token
- Rate limits: Respect PagerDuty's 960 req/min limit
- Error handling: Wrap in try-catch, check for 401 (re-auth), 429 (rate limit)

### Environment Variables

- OAuth: `NEXT_PUBLIC_PAGERDUTY_CLIENT_ID`, `PAGERDUTY_CLIENT_SECRET`
- NextAuth: `NEXTAUTH_URL`, `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
- See [.env.example](.env.example) for full list
- **Client-side vars**: Must use `NEXT_PUBLIC_` prefix

### State Management

- **Global state**: Zustand for client state (lightweight Redux alternative)
- **Server state**: SWR for data fetching with automatic revalidation
- **Form state**: React Hook Form + Zod validation
- Avoid prop drilling - use Context/Zustand for shared state

## Project-Specific Conventions

### Date/Time Handling

- **Always use Luxon** ([src/lib/utils/scheduleUtils.ts](src/lib/utils/scheduleUtils.ts))
- PagerDuty returns ISO8601 strings - parse to Luxon DateTime
- Timezone-aware: Store schedules in original timezone, display in user's TZ
- Don't use native Date objects - Luxon handles DST and timezone shifts

### TypeScript Patterns

- Use `as const` for constant objects ([src/lib/constants.ts](src/lib/constants.ts))
- Type API responses explicitly ([src/lib/types/index.ts](src/lib/types/index.ts))
- Extend NextAuth types in [src/types/next-auth.d.ts](src/types/next-auth.d.ts)
- No `any` types - use `unknown` and narrow with type guards

### Material-UI Patterns

- Use `sx` prop for styling (not styled-components)
- Theme context: [src/context/ThemeContext.tsx](src/context/ThemeContext.tsx)
- Dark mode: Automatically switches based on system preference + manual toggle
- Responsive: Use MUI breakpoints (`theme.breakpoints.down('sm')`)

### CSV Export

- Located in [src/lib/utils/csvExport.ts](src/lib/utils/csvExport.ts)
- Format: Date, User, Schedule, Weekday Hours, Weekend Hours, Total Payment
- Compatible with Google Sheets and Excel

## Testing Gotchas

### Playwright Tests

- Tests run in parallel - avoid shared state
- Use `test.describe.serial()` for sequential tests
- Mock time with `page.clock.install()` for date-dependent tests
- CI runs single worker - local runs parallel

### Jest Configuration

- Transform ES modules: `transformIgnorePatterns` includes `jose`, `openid-client`, `next-auth`
- Silent mode enabled - use `console.log` for debugging (will still show)
- Coverage excludes `*.d.ts`, `*.stories.*`, `__tests__/`

## Common Tasks

### Adding a New API Endpoint

1. Create route in `src/app/api/[route]/route.ts`
2. Add endpoint to `API_ENDPOINTS` in [src/lib/constants.ts](src/lib/constants.ts)
3. Add client function in [src/lib/api/pagerduty.ts](src/lib/api/pagerduty.ts)
4. Write unit test in `tests/unit/lib/api/`

### Adding a New Page

1. Create `src/app/[route]/page.tsx` (uses App Router conventions)
2. Add route to `ROUTES` in [src/lib/constants.ts](src/lib/constants.ts)
3. Protect route: Add to `middleware.ts` matcher if auth required
4. Write E2E test in `tests/e2e/[route].spec.ts`

### Updating Payment Logic

- **DO NOT modify** - payment logic lives in `caloohpay` npm package
- To change rates/rules: Update the upstream package, then `npm update caloohpay`
- Constants (rates, hours) in [src/lib/constants.ts](src/lib/constants.ts) are for display only

## Deployment

- **Planned platform**: AWS Amplify or Vercel
- **Build command**: `npm run build`
- **Environment variables**: Copy from [.env.example](.env.example) to hosting platform
- **Health check**: GET `/api/health` (should return 200)
- **Static assets**: `public/` directory served from root

## Documentation

- **Architecture**: [docs/architecture.md](docs/architecture.md) - system design, mermaid diagrams
- **Authentication**: [AUTHENTICATION.md](AUTHENTICATION.md) - OAuth flows, JWT details
- **Setup guides**: [docs/setup/](docs/setup/) - PagerDuty OAuth and API token setup
- **Quick start**: [QUICK_START.md](QUICK_START.md) - 5-minute setup guide
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md) - PR process, coding standards

## Key Files to Reference

- Constants: [src/lib/constants.ts](src/lib/constants.ts) - routes, endpoints, rates
- Types: [src/lib/types/index.ts](src/lib/types/index.ts) - API response types
- NextAuth config: [src/lib/auth/options.ts](src/lib/auth/options.ts) - auth providers
- Utils: [src/lib/utils/scheduleUtils.ts](src/lib/utils/scheduleUtils.ts) - date/time helpers
