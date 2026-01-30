# CalOohPay Web

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Material UI](https://img.shields.io/badge/Material%20UI-007FFF?style=flat&logo=mui&logoColor=white)](https://mui.com/)
[![PagerDuty](https://img.shields.io/badge/PagerDuty-06AC38?style=flat&logo=pagerduty&logoColor=white)](https://www.pagerduty.com/)

A modern web application that automates the calculation of out-of-hours (OOH) on-call compensation for engineering teams using PagerDuty schedules. Built with Next.js, TypeScript, and Material UI.

## Features

- 🔐 **Secure Authentication** - Dual authentication (OAuth 2.0 + API Token) with NextAuth.js
- 🔎 **Progressive Search** - Instant local results with seamless API search in background
- 📅 **Schedule Visualization** - Dual view modes (List & Calendar) for on-call schedules
  - **List View**: Detailed breakdown of on-call periods by user
  - **Calendar View**: Interactive monthly calendar with FullCalendar integration
- 💰 **Payment Calculation** - Uses the official [caloohpay](https://www.npmjs.com/package/caloohpay) package for accurate out-of-hours compensation
- 📑 **Multi-Schedule Reports** - Calculate compensation across multiple schedules with overlap detection
- 📊 **Export Capabilities** - Generate CSV reports for payroll processing
- 🎨 **Modern UI** - Built with Material-UI and Tailwind CSS
- 🔒 **Type Safety** - Full TypeScript implementation
- ♿ **Accessible** - WCAG compliant with keyboard navigation support

## 📋 Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **PagerDuty Account** with API access
- **Work Email Address** for authentication

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [Material UI v5](https://mui.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/)
- **Date Handling**: [Luxon](https://moment.github.io/luxon/)
- **Calendar**: [FullCalendar](https://fullcalendar.io/) with Luxon plugin
- **API Client**: [Axios](https://axios-http.com/)
- **Data Fetching**: [SWR](https://swr.vercel.app/)
- **Testing**: [Jest](https://jestjs.io/), [React Testing Library](https://testing-library.com/), [Playwright](https://playwright.dev/)
- **Code Quality**: [ESLint](https://eslint.org/), [Prettier](https://prettier.io/)
- **Git Hooks**: [Husky](https://typicode.github.io/husky/)
- **Deployment**: [Vercel](https://vercel.com/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/caloohpay-web.git
cd caloohpay-web
```

### 2. Install Dependencies

```bash
npm install
```

**Note**: This will automatically install Playwright browsers needed for E2E testing via the postinstall script.

### 3. Authentication Setup

CalOohPay supports **two authentication methods**:

#### Option A: API Token (Simpler - Recommended for Getting Started)

1. Log in to your PagerDuty account
2. Navigate to **User Icon** → **My Profile** → **User Settings** → **API Access**
3. Create or copy your **User API Token**
4. Use this token to sign in on the login page (select the "API Token" tab)

📖 **Detailed Guide**: [docs/setup/api-token-auth.md](./docs/setup/api-token-auth.md)

#### Option B: OAuth 2.0 (Recommended for Production)

1. Log in to your PagerDuty account
2. Navigate to **User Icon** → **My Profile** → **User Settings** → **Developer Apps**
3. Click **Create New App**
4. Fill in the details:
   - **App Name**: `CalOohPay` (or your preferred name)
   - **Redirect URL**: `http://localhost:3000/api/auth/callback/pagerduty`
   - **Scopes**: `read`, `schedules.read`, `users.read`
5. Save and copy your **Client ID** and **Client Secret**
6. Add these to your `.env.local` file (see step 4 below)

📖 **Detailed Instructions**: [docs/setup/pagerduty-oauth-setup.md](./docs/setup/pagerduty-oauth-setup.md)

### 4. Environment Setup

Create a `.env.local` file in the root directory:

```bash
# PagerDuty Configuration
# For API Token auth: No configuration needed (use token at login)
# For OAuth auth: Add your OAuth credentials below
NEXT_PUBLIC_PAGERDUTY_CLIENT_ID=your_client_id  # Optional (for OAuth only)
PAGERDUTY_CLIENT_SECRET=your_client_secret      # Optional (for OAuth only)

# NextAuth Configuration (Required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret  # Generate with: openssl rand -base64 32

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> 💡 **Using API Token?** You don't need OAuth environment variables. Just generate a NEXTAUTH_SECRET and you're ready to go!

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> 💡 **First time?** Choose your authentication method on the login page:
>
> - **API Token**: Paste your PagerDuty User API Token
> - **OAuth**: Sign in with the OAuth application you created in step 3

## 📖 Documentation

### Setup Guides

- **[API Token Authentication](./docs/setup/api-token-auth.md)** - Simple authentication with PagerDuty User API Token (recommended for getting started)
- **[PagerDuty OAuth Setup](./docs/setup/pagerduty-oauth-setup.md)** - Complete guide to register a PagerDuty OAuth application (recommended for production)
- [Quick Start Guide](./QUICK_START.md) - Get started in minutes

### Project Documentation

- [Project Plan](./PROJECT_PLAN.md) - Detailed project roadmap and architecture
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute to this project
- [API Documentation](./docs/api.md) - API endpoints and usage
- [Architecture Guide](./docs/architecture.md) - System architecture and design decisions
- [Search Architecture](./docs/search-architecture.md) - Progressive search implementation details
- [Styling Architecture](./docs/styling-architecture.md) - MUI styling patterns and best practices
- [Deployment Guide](./docs/deployment.md) - Deployment instructions and CI/CD setup

## 🧪 Testing

See [docs/TESTING.md](./docs/TESTING.md) for comprehensive testing guidance, including:

- How to run unit, E2E, seeded, and unauth tests
- Test structure and best practices
- Performance tips for debugging slow tests
- Known test issues and gaps

Quick commands:

```bash
npm test                      # Run all unit tests
npm run test:watch           # Run tests in watch mode
npm run test:coverage        # Generate coverage report
npm run test:e2e:seeded      # Run E2E tests (pre-authenticated, chromium only)
npm run test:e2e:seeded:all  # Run E2E tests (pre-authenticated, all browsers)
npm run test:e2e:unauth      # Run E2E tests (login flows, all browsers)
```

## 🏗️ Project Structure

```bash
caloohpay-web/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/             # Utilities and helpers
│   ├── hooks/           # Custom React hooks
│   ├── context/         # React context providers
│   └── styles/          # Global styles and themes
├── tests/
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── e2e/             # End-to-end tests
├── public/              # Static assets
└── docs/                # Documentation
```

## 💰 Payment Calculation

The application uses the same calculation logic as the [CalOohPay CLI tool](https://github.com/lonelydev/caloohpay):

- **Weekdays (Mon-Thu)**: £50 per OOH day
- **Weekends (Fri-Sun)**: £75 per OOH day

A day counts as out-of-hours (OOH) if:

1. The shift spans multiple days
2. The shift extends past 17:30 (5:30 PM)
3. The shift is longer than 6 hours

## 🔧 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm test             # Run unit tests
npm run test:e2e     # Run E2E tests
npm run test:coverage # Run tests with coverage
```

## 🚀 Deployment

### Vercel (Recommended - Free Tier)

Deploy to Vercel for **$0/month** hosting:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

**Features**:

- ✅ Free tier: 100GB bandwidth, unlimited requests
- ✅ Built-in DDoS protection
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Zero configuration for Next.js

📖 **Complete Guide**: [docs/deployment/vercel.md](./docs/deployment/vercel.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write or update tests
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Based on the [CalOohPay CLI tool](https://github.com/lonelydev/caloohpay) by [@lonelydev](https://github.com/lonelydev)
- Built with [Next.js](https://nextjs.org/)
- UI components from [Material UI](https://mui.com/)
- Powered by [PagerDuty API](https://developer.pagerduty.com/)

## 📧 Support

If you encounter any issues or have questions:

1. Check the [documentation](./docs/)
2. Search [existing issues](https://github.com/yourusername/caloohpay-web/issues)
3. Create a [new issue](https://github.com/yourusername/caloohpay-web/issues/new)

## 🗺️ Roadmap

- [ ] Multi-currency support
- [ ] Configurable payment rates
- [ ] Historical payment tracking
- [ ] Team analytics dashboard
- [ ] Slack/Teams notifications
- [ ] Mobile app
- [ ] Incident response bonus calculations

---

**Made with ❤️ for engineering teams who deserve fair compensation for their on-call dedication.**
