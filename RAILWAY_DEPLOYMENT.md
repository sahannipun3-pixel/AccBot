# AccBots — Railway Deployment Guide

This document covers everything needed to deploy AccBots to Railway.

---

## Prerequisites

- GitHub repository with AccBots code pushed
- [Railway](https://railway.com) account
- Supabase PostgreSQL project created
- Cloudflare R2 bucket created with public access enabled
- Resend account with a verified sending domain

---

## 1. Prepare Environment Variables

Before deploying, gather the following values:

| Variable | Where to Find |
|---|---|
| `DATABASE_URL` | Supabase → Project Settings → Database → Connection String (Transaction Pooler) |
| `JWT_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_ACCESS_TOKEN_EXPIRY` | Set to `15m` |
| `JWT_REFRESH_TOKEN_EXPIRY` | Set to `7d` |
| `NEXT_PUBLIC_SITE_URL` | Your Railway public domain (set after first deploy) |
| `RESEND_API_KEY` | [Resend Dashboard](https://resend.com/api-keys) |
| `RESEND_FROM_EMAIL` | Your verified Resend sender address |
| `ADMIN_EMAIL` | Email for contact form notifications |
| `R2_ACCOUNT_ID` | Cloudflare Dashboard → Right sidebar (Account ID) |
| `R2_ACCESS_KEY_ID` | Cloudflare → R2 → Manage R2 API Tokens → Create Token |
| `R2_SECRET_ACCESS_KEY` | From above token creation |
| `R2_BUCKET_NAME` | Your R2 bucket name |
| `R2_PUBLIC_URL` | Your R2 public CDN URL (e.g. `https://pub-xxx.r2.dev`) |

---

## 2. Deploy to Railway

### Step 1 — Push to GitHub

```bash
git add .
git commit -m "feat: production-ready Railway deployment"
git push origin main
```

### Step 2 — Create Railway Project

1. Go to [railway.com](https://railway.com)
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. Choose your AccBots repository

### Step 3 — Add Environment Variables

In Railway Dashboard → Your Service → **Variables**, add all variables from the table above.

> ⚠️ **Critical**: Set `NEXT_PUBLIC_SITE_URL` to your Railway domain AFTER the first deploy generates your URL (e.g. `https://accbots.up.railway.app`)

### Step 4 — Verify Build & Start Commands

Railway will auto-detect from `railway.json`:

- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm start`

### Step 5 — Deploy

Railway will automatically trigger a deployment on each push to `main`.

---

## 3. Supabase Database Setup

### Connection String Format

Use the **Transaction Pooler** connection string from Supabase (port 6543):

```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

> ⚠️ **Important**: Use port **6543** (Transaction Pooler), NOT 5432 (Direct). Railway connections to Supabase work best through the pooler.

### Run Migrations

After deploying, run the schema migrations via the Supabase SQL editor:

1. `supabase/schema.sql` — Core tables
2. `supabase/schema_v2.sql` — Additional tables  
3. `supabase/schema_v3.sql` — Expense tracker & ledger tables
4. `supabase/seed.sql` — Seed initial data

### Create Admin User

Use the setup endpoint (one-time use, then disable):

```
GET https://[your-railway-domain]/api/auth/setup-admin
```

---

## 4. Post-Deployment Checklist

- [ ] App loads at Railway domain
- [ ] Login/Signup works
- [ ] Admin dashboard accessible at `/admin`
- [ ] Profile page loads at `/profile`
- [ ] File upload works (test in profile settings)
- [ ] Contact form sends email
- [ ] Password reset email sends
- [ ] `/expense-tracker` loads
- [ ] `/accounts-web` loads
- [ ] Services, testimonials, team load from database

---

## 5. Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Type check
pnpm tsc --noEmit

# Lint
pnpm lint

# Production build test
pnpm build

# Production server test
pnpm start
```

---

## 6. Architecture Reference

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase PostgreSQL via `postgres.js` |
| Auth | Custom JWT (jose + bcryptjs) |
| Storage | Cloudflare R2 (AWS S3 SDK) |
| Email | Resend |
| Deployment | Railway (Nixpacks) |

---

## 7. Security Notes

- All cookies are `HttpOnly`, `Secure`, `SameSite=Lax` in production
- Refresh tokens are hashed (SHA-256) before database storage
- All database queries use parameterized postgres.js queries
- File uploads are validated (type + 5MB limit) and JWT-protected
- No secrets are exposed to the client — all env vars prefixed `NEXT_PUBLIC_` are intentionally public

---

## 8. Troubleshooting

### Build Fails — "DATABASE_URL is missing"
Railway runs `next build` with env vars. Ensure `DATABASE_URL` is set in Railway Variables before triggering a build.

### 500 Error on Login
Check that `JWT_SECRET` is at least 32 characters and matches between builds.

### Images Not Loading
Ensure `R2_PUBLIC_URL` matches the actual public URL of your R2 bucket, and that public access is enabled on the bucket.

### Emails Not Sending
Verify your Resend domain is verified and `RESEND_FROM_EMAIL` matches the verified domain.
