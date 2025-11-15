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

## Step 2: Register PagerDuty OAuth Application

⚠️ **Required**: You must create a PagerDuty OAuth application first.

### Quick Steps

1. **Access PagerDuty Developer Portal**
   - Log in to PagerDuty
   - Navigate to: **User Icon** → **My Profile** → **User Settings** → **Developer Apps**
   - Or go to: `https://[your-subdomain].pagerduty.com/developer/applications`

2. **Create New App**
   - Click **Create New App**
   - **App Name**: `CalOohPay`
   - **Redirect URL**: `http://localhost:3000/api/auth/callback/pagerduty`
   - **Scopes**: Select `read`, `schedules.read`, `users.read`

3. **Save Credentials**
   - Copy the **Client ID**
   - Copy the **Client Secret** (shown only once!)

📖 **Need detailed instructions?** See [docs/setup/pagerduty-oauth-setup.md](./docs/setup/pagerduty-oauth-setup.md)

## Step 3: Environment Setup

```bash
# Create your local environment file
cp .env.example .env.local
```

Edit `.env.local` with the credentials from Step 2:

```bash
# PagerDuty OAuth Configuration (from Step 2)
NEXT_PUBLIC_PAGERDUTY_CLIENT_ID=your_client_id_here
PAGERDUTY_CLIENT_SECRET=your_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)  # Generate secret

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

💡 **Tip**: Generate `NEXTAUTH_SECRET` by running: `openssl rand -base64 32`

## Step 4: Start Development Server

```bash
npm run dev
```

Your application will be running at <http://localhost:3000>

🎉 **Success!** You should see the CalOohPay login page. Click "Sign in with PagerDuty" to authenticate.

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
npm test                 # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run E2E tests with UI
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
