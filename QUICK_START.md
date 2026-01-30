# Quick Start Guide for CalOohPay Web

This guide will get you up and running with the CalOohPay Web application in minutes.

## Prerequisites

Ensure you have the following installed:

- **Node.js** v18 or higher
- **npm** v9 or higher
- **Git**

## Step 1: Clone and Install

```bash
# Navigate to the project directory (already done if you're reading this)
cd caloohpay-web

# Install all dependencies
npm install
```

## Step 2: Authentication Setup

CalOohPay supports **two authentication methods**. Choose the one that works best for you:

### Option A: API Token (Recommended for Getting Started)

This is the **simplest way** to get started - no OAuth app setup required!

1. **Get Your API Token**
   - Log in to PagerDuty
   - Navigate to: **User Icon** → **My Profile** → **User Settings** → **API Access**
   - Create or copy your **User API Token**

2. **Start the app** (see Step 3 below)

3. **Sign in**
   - On the login page, click the **API Token** tab
   - Paste your token and click **Sign in with API Token**

📖 **Detailed Guide**: [docs/setup/api-token-auth.md](./docs/setup/api-token-auth.md)

### Option B: OAuth 2.0 (Recommended for Production)

Use this for multi-user deployments or if you prefer OAuth authentication.

1. **Create PagerDuty OAuth App**
   - Log in to PagerDuty
   - Navigate to: **User Icon** → **My Profile** → **User Settings** → **Developer Apps**
   - Or go to: `https://[your-subdomain].pagerduty.com/developer/applications`

2. **Configure New App**
   - Click **Create New App**
   - **App Name**: `CalOohPay`
   - **Redirect URL**: `http://localhost:3000/api/auth/callback/pagerduty`
   - **Scopes**: Select `read`, `schedules.read`, `users.read`

3. **Save Credentials**
   - Copy the **Client ID**
   - Copy the **Client Secret** (shown only once!)
   - Add these to your `.env.local` file (see Step 3 below)

📖 **Detailed Guide**: [docs/setup/pagerduty-oauth-setup.md](./docs/setup/pagerduty-oauth-setup.md)

## Step 3: Environment Setup

```bash
# Create your local environment file
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```bash
# NextAuth Configuration (Required for both methods)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)  # Generate secret

# PagerDuty OAuth Configuration (Optional - only if using OAuth)
NEXT_PUBLIC_PAGERDUTY_CLIENT_ID=your_client_id_here  # From Step 2, Option B
PAGERDUTY_CLIENT_SECRET=your_client_secret_here      # From Step 2, Option B

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

💡 **Tip**: Generate `NEXTAUTH_SECRET` by running: `openssl rand -base64 32`

💡 **Using API Token?** You only need `NEXTAUTH_URL` and `NEXTAUTH_SECRET`. Skip the OAuth credentials!

## Step 4: Start Development Server

```bash
npm run dev
```

Your application will be running at <http://localhost:3000>

🎉 **Success!** You should see the CalOohPay login page with two authentication options:

- **API Token tab**: Paste your PagerDuty User API Token
- **OAuth Login tab**: Click "Sign in with PagerDuty" (requires OAuth setup from Step 2, Option B)

## Common Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Check code style
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format all code with Prettier
npm run type-check       # Check TypeScript types

# Testing

See [docs/TESTING.md](docs/TESTING.md) for comprehensive testing guidance.

Quick commands:
npm test                 # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:e2e:seeded      # Run E2E tests (pre-authenticated, chromium only)
npm run test:e2e:seeded:all  # Run E2E tests (pre-authenticated, all browsers)
npm run test:e2e:unauth      # Run E2E tests (login flows, all browsers)
```

## Project Structure at a Glance

```bash
src/
├── app/              # Next.js pages and routes
├── components/       # React components
│   ├── auth/        # Authentication components
│   ├── schedules/   # Schedule-related components
│   ├── payments/    # Payment calculation components
│   ├── ui/          # Reusable UI components
│   └── common/      # Common components (layouts, etc.)
├── context/         # React Context providers
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and logic
│   ├── api/        # API client functions
│   ├── auth/       # Authentication utilities
│   ├── calculations/ # Payment calculation logic
│   ├── utils/      # General utilities
│   └── types/      # TypeScript type definitions
└── styles/          # Global styles and themes
```

## Making Your First Contribution

1. **Create a branch**

   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes**
   - Write code
   - Add tests
   - Update documentation if needed

3. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add my feature"
   ```

   Note: Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/)

4. **Push and create a PR**

   ```bash
   git push origin feature/my-feature
   ```

## Debugging Tips

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### Type Errors

```bash
# Run type check to see all errors
npm run type-check
```

## Need Help?

- 📖 Check the full [README.md](./README.md)
- 📝 Read the [CONTRIBUTING.md](./CONTRIBUTING.md) guide
- 📋 Review the [PROJECT_PLAN.md](./PROJECT_PLAN.md)
- 🐛 Open an [issue](https://github.com/yourusername/caloohpay-web/issues)

## What's Next?

Check out [PROGRESS.md](./PROGRESS.md) to see:

- What's been completed
- What's currently in progress
- What's coming next
- How you can contribute

---

Happy coding! 🚀
