# FastFood - Restaurant Management System

A comprehensive Next.js application for restaurant management with dashboard, orders, products, and customer management.

## Quick Start

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.local.example .env.local
# Edit .env.local with your configuration

# Database setup
pnpm db:push
pnpm db:seed

# Start development
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Setup

### Required Files

- `.env.local` - Your development environment (not committed)
- `.env.development.local` - Development overrides
- `.env.production.local` - Production overrides

### Required Variables

| Variable               | Description           | Example                                          |
| ---------------------- | --------------------- | ------------------------------------------------ |
| `DB_URL`               | PostgreSQL connection | `postgresql://user:pass@localhost:5432/fastfood` |
| `NEXT_PUBLIC_BASE_URL` | App base URL          | `http://localhost:3000`                          |
| `SESSION_SECRET`       | JWT encryption key    | `your-32-char-secret-here`                       |
| `MP_ACCESS_TOKEN`      | MercadoPago token     | `TEST-123456789...`                              |
| `RESEND_API_KEY`       | Email service API     | `re_123456789...`                                |

### Optional Variables

| Variable                   | Description             | Default |
| -------------------------- | ----------------------- | ------- |
| `UPSTASH_REDIS_REST_URL`   | Redis for rate limiting | -       |
| `UPSTASH_REDIS_REST_TOKEN` | Redis auth              | -       |
| `SENTRY_DSN`               | Error tracking          | -       |
| `LOG_LEVEL`                | Logging verbosity       | `info`  |

## Project Structure

```
app/
├── api/           # API routes
├── dashboard/     # Admin dashboard
├── login/         # Authentication pages
├── products/      # Product catalog
├── order/         # Order management
└── profile/       # User profiles

modules/
├── auth/          # Authentication system
├── core/          # Shared components
├── dashboard/     # Dashboard components
├── orders/        # Order management
├── products/      # Product management
└── users/         # User management

lib/               # Utilities and helpers
db/                # Database schema and migrations
```

## Features

- **Dashboard**: Analytics, orders, customers, inventory management
- **Orders**: Complete order lifecycle with status tracking
- **Products**: Product catalog with availability management
- **Authentication**: Secure login/register with password reset
- **Payments**: MercadoPago integration
- **Notifications**: Email notifications via Resend
- **Internationalization**: English/Spanish support
- **Testing**: Unit tests, E2E tests, visual regression testing

## CI/CD Pipeline

### Workflows

- `ci.yml` - Main pipeline with linting, testing, build
- `security.yml` - Weekly security audits
- `visual-regression.yml` - UI consistency testing
- `vercel-preview.yml` - PR preview deployments
- `vercel-production.yml` - Production deployments
- `monitoring.yml` - Health monitoring

### Quality Gates

- Code linting and TypeScript checking
- Unit test suite
- E2E test suite
- Visual regression testing
- Performance audits (Lighthouse 90+)
- Security vulnerability scanning

## Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:push          # Push schema changes
pnpm db:seed          # Seed database
pnpm db:studio        # Open Drizzle Studio

# Testing
pnpm test:run         # Run all tests
pnpm test:e2e         # E2E tests
pnpm test:visual      # Visual regression tests
pnpm test:performance # Performance audit

# Code Quality
pnpm lint             # ESLint
pnpm type-check       # TypeScript checking
pnpm audit            # Security audit
```

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Manual Deployment

```bash
# Build
pnpm build

# Start
pnpm start
```

## Monitoring & Logging

- **Winston**: Structured logging with file rotation
- **Sentry**: Error tracking in production
- **Health Checks**: Automated monitoring
- **Performance**: Lighthouse CI integration

## Support

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [MercadoPago Docs](https://www.mercadopago.com/developers)
