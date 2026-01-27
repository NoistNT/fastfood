## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## 🔧 Environment Setup

Before running the application, you need to configure environment variables. This project uses multiple `.env` files for different environments.

### 📋 Required Files

1. **`.env.local`** - Your personal development environment (not committed to git)
2. **`.env.development.local`** - Development environment overrides
3. **`.env.production.local`** - Production environment overrides

### 🚀 Quick Setup

1. **Copy the example file:**

   ```bash
   cp .env.local.example .env.local
   ```

2. **Fill in your values** in `.env.local`

### 🔑 Required Environment Variables

| Variable               | Description                    | Where to Get                                                          | Example                                          |
| ---------------------- | ------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------ |
| `DB_URL`               | PostgreSQL database connection | Local PostgreSQL or cloud provider                                    | `postgresql://user:pass@localhost:5432/fastfood` |
| `NEXT_PUBLIC_BASE_URL` | Your app's base URL            | Your domain                                                           | `http://localhost:3000`                          |
| `SESSION_SECRET`       | JWT encryption key             | Generate randomly                                                     | `your-32-char-secret-here`                       |
| `MP_ACCESS_TOKEN`      | MercadoPago payment token      | [MercadoPago Dashboard](https://www.mercadopago.com/developers/panel) | `TEST-123456789...`                              |
| `RESEND_API_KEY`       | Email service API key          | [Resend Dashboard](https://resend.com)                                | `re_123456789...`                                |

### 🎯 Optional Environment Variables

| Variable                   | Description             | Default | Use Case                    |
| -------------------------- | ----------------------- | ------- | --------------------------- |
| `UPSTASH_REDIS_REST_URL`   | Redis for rate limiting | -       | Production rate limiting    |
| `UPSTASH_REDIS_REST_TOKEN` | Redis authentication    | -       | Production rate limiting    |
| `SENTRY_DSN`               | Error tracking          | -       | Production error monitoring |
| `LOG_LEVEL`                | Logging verbosity       | `info`  | Development debugging       |

### 🔐 CI/CD Environment Variables

For automated deployments with Vercel, add these to your `.env.local`:

```bash
# Vercel Integration (Required for CI/CD)
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_vercel_org_id_here
VERCEL_PROJECT_ID=your_vercel_project_id_here
VERCEL_URL=https://your-app-name.vercel.app

# Deployment Notifications
DEPLOYMENT_NOTIFICATION_EMAIL=admin@yourdomain.com
```

### 📚 Getting Vercel Tokens

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Navigate to Settings → Integrations**
3. **Create a new integration or copy existing tokens**
4. **VERCEL_TOKEN**: Your personal access token
5. **VERCEL_ORG_ID**: Your organization/team ID
6. **VERCEL_PROJECT_ID**: Your project ID

### 🧪 Testing Your Setup

After configuring your environment variables:

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm db:push

# Seed the database (optional)
pnpm db:seed

# Start development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to verify everything works.

### 🚨 Common Issues

**Database Connection Failed**

- Ensure PostgreSQL is running locally
- Check your `DB_URL` format
- Verify database user permissions

**MercadoPago Not Working**

- Use `TEST-` tokens for development
- Check your MercadoPago dashboard for correct tokens

**Emails Not Sending**

- Verify your `RESEND_API_KEY`
- Check the [Resend Dashboard](https://resend.com) for API key status

## 🚀 CI/CD Pipeline

This project uses a comprehensive CI/CD pipeline with GitHub Actions and Vercel for automated deployments.

### 📋 Workflows

- **`ci.yml`** - Main CI pipeline with linting, testing, and build verification
- **`security.yml`** - Weekly security audits and dependency scanning
- **`visual-regression.yml`** - Visual regression testing for UI consistency
- **`vercel-preview.yml`** - Automatic preview deployments for pull requests
- **`vercel-production.yml`** - Production deployments with quality gates
- **`monitoring.yml`** - Health monitoring and automated alerts

### 🔐 Required Secrets

Add these secrets to your GitHub repository settings:

```bash
# Vercel Configuration
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
VERCEL_URL=https://your-app.vercel.app

# Email Notifications (Resend)
RESEND_API_KEY=your_resend_api_key
DEPLOYMENT_NOTIFICATION_EMAIL=your-email@example.com
```

### 🔄 Deployment Flow

1. **Push to `main`** → Production deployment with full quality gates
2. **Pull Request** → Preview deployment for testing
3. **Weekly** → Security audit and dependency checks
4. **Every 30 min** → Health monitoring with email alerts

### 🧪 Quality Gates

All deployments must pass:

- ✅ Code linting and TypeScript checking
- ✅ Unit test suite (374+ tests)
- ✅ E2E test suite with Playwright
- ✅ Visual regression testing
- ✅ Performance audits (Lighthouse 90+ scores)
- ✅ Security vulnerability scanning
- ✅ Health check verification

### 📊 Monitoring

- **Health Checks**: Automatic monitoring every 30 minutes
- **Performance**: Lighthouse CI with automated regression detection
- **Security**: Weekly dependency audits
- **Deployments**: Email notifications via Resend

### 🎯 Commands

```bash
# Run full test suite locally
pnpm test:run

# Run E2E tests
pnpm test:e2e

# Run visual regression tests
pnpm test:visual

# Run performance audit
pnpm test:performance

# Run security audit
pnpm audit
```

## Logging

This application uses Winston for comprehensive logging with the following setup:

### Log Files

- **Error Logs** (`error-logs/error-YYYY-MM-DD.log`): Tracked in git for post-mortem analysis
- **Combined Logs** (`logs/combined-YYYY-MM-DD.log`): All log levels (ignored in git)
- **HTTP Logs** (`logs/http-YYYY-MM-DD.log`): API request logs (ignored in git)

### Environment Configuration

- **Development**: Debug level logging with console output
- **Production**: Warn level logging, file-only output
- **Custom Level**: Set `LOG_LEVEL` environment variable to override defaults

### Error Tracking

Errors are automatically sent to Sentry in production environments when `SENTRY_DSN` is configured. Use `SENTRY_DEV=true` to enable Sentry in development.

### Log Levels

- `error`: Application errors
- `warn`: Warnings
- `info`: General information
- `http`: HTTP requests
- `debug`: Detailed debugging information

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
