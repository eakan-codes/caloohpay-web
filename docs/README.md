# CaloohPay Documentation

Welcome to the comprehensive documentation for CaloohPay - a web application for calculating on-call payments based on PagerDuty schedules.

## 📚 Documentation Structure

This documentation is organized into the following sections:

### [Setup](./setup/)

Guides for setting up external services and dependencies:

- **[PagerDuty OAuth Setup](./setup/pagerduty-oauth-setup.md)** - Complete guide for creating a PagerDuty OAuth application and obtaining credentials

### [Configuration](./configuration/)

Application configuration and architecture documentation:

- **[NextAuth Setup](./configuration/nextauth-setup.md)** - NextAuth.js v5 configuration, JWT strategy, token refresh, and session management

### [Contributing](./contributing/)

Guides for contributors and developers:

- **[Getting Started](./contributing/getting-started.md)** - Comprehensive onboarding guide for new contributors, including environment setup, development workflow, and coding conventions

## 🚀 Quick Start

If you're new to the project:

1. **Set up your environment**: Follow the [Getting Started Guide](./contributing/getting-started.md)
2. **Configure PagerDuty**: Set up OAuth credentials using the [PagerDuty OAuth Setup Guide](./setup/pagerduty-oauth-setup.md)
3. **Understand authentication**: Review the [NextAuth Configuration Guide](./configuration/nextauth-setup.md)

## 📖 Additional Documentation

Root-level documentation files:

- [README.md](../README.md) - Project overview and quick start
- [AUTHENTICATION.md](../AUTHENTICATION.md) - Authentication flow diagrams
- [PROJECT_PLAN.md](../PROJECT_PLAN.md) - Project planning and roadmap
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) - Community code of conduct
- [QUICK_START.md](../QUICK_START.md) - Quick start guide

## 🎯 Documentation Goals

This documentation aims to:

1. **Enable new contributors** to set up and start contributing quickly
2. **Explain configuration** of all external services and APIs
3. **Document architecture** and design decisions
4. **Provide troubleshooting** guides for common issues
5. **Maintain accuracy** with up-to-date information

## 🤝 Contributing to Documentation

Documentation improvements are always welcome! When contributing documentation:

1. Follow the existing structure and formatting
2. Use clear, concise language
3. Include code examples where helpful
4. Add troubleshooting sections for complex topics
5. Keep documentation up-to-date with code changes

### Documentation Standards

- Use Markdown for all documentation
- Include table of contents for long documents
- Use code blocks with language specification
- Add diagrams where helpful (Mermaid supported)
- Link between related documentation pages

## 📝 Documentation Roadmap

Future documentation planned:

- **Architecture Guide** - System architecture and design patterns
- **API Reference** - Detailed API endpoint documentation
- **Deployment Guide** - Production deployment instructions
- **Testing Guide** - Comprehensive testing strategies
- **Performance Guide** - Performance optimization tips

## 🔍 Finding Information

### By Role

**New Contributors**:

1. Start with [Getting Started](./contributing/getting-started.md)
2. Follow [PagerDuty OAuth Setup](./setup/pagerduty-oauth-setup.md)
3. Review [NextAuth Configuration](./configuration/nextauth-setup.md)

**Operators/Admins**:

1. Review [PagerDuty OAuth Setup](./setup/pagerduty-oauth-setup.md)
2. Check [NextAuth Configuration](./configuration/nextauth-setup.md) for production deployment
3. See root [README](../README.md) for deployment instructions

**Developers**:

1. See [Getting Started](./contributing/getting-started.md) for development workflow
2. Review [NextAuth Configuration](./configuration/nextauth-setup.md) for API integration
3. Check code comments and tests for implementation details

### By Task

**Setting up development environment**:

- [Getting Started - Development Environment Setup](./contributing/getting-started.md#development-environment-setup)

**Configuring PagerDuty**:

- [PagerDuty OAuth Setup](./setup/pagerduty-oauth-setup.md)

**Understanding authentication**:

- [NextAuth Configuration](./configuration/nextauth-setup.md)
- [Authentication Flow](../AUTHENTICATION.md)

**Writing code**:

- [Getting Started - Code Style and Conventions](./contributing/getting-started.md#code-style-and-conventions)

**Running tests**:

- [Getting Started - Testing](./contributing/getting-started.md#testing)

**Creating pull requests**:

- [Getting Started - Pull Request Process](./contributing/getting-started.md#pull-request-process)

## 🆘 Getting Help

If you can't find what you're looking for:

1. **Search** the documentation (Cmd/Ctrl + F)
2. **Check** [GitHub Issues](../../issues) for known problems
3. **Ask** in [GitHub Discussions](../../discussions)
4. **Create** a new issue if you've found a documentation gap

## 📄 License

This documentation is part of the CaloohPay project and follows the same license as the main project.

---

**Last Updated**: 2024
**Maintainer**: CaloohPay Contributors
