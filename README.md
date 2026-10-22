# Abdulrahmon Sulaimon - Portfolio

Personal portfolio and technical writing site for Abdulrahmon Sulaimon, Backend Software Engineer. Built with Next.js (App Router), TypeScript, Tailwind CSS, and Resend.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm

### Installation

```bash
git clone https://github.com/abdulrahmontim/my-portfolio.git
cd my-portfolio
npm install
```

### Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the site.

### Build and Lint

```bash
npm run lint
npm run build
```

---

## Contact Form Configuration (Resend)

The portfolio includes a production-ready contact form located on the home page (`/#contact`). Form submissions are processed by the server-side API route at `/api/contact` and delivered via [Resend](https://resend.com).

### 1. Obtain a Resend API Key

1. Sign up or log in at [resend.com](https://resend.com).
2. Navigate to **API Keys** in the sidebar.
3. Click **Create API Key**, name it (e.g. `Portfolio Contact Form`), and grant it "Full Access" or "Sending access".
4. Copy the generated key (`re_...`).

### 2. Verify a Sending Domain (Production)

1. In the Resend dashboard, navigate to **Domains** and click **Add Domain** (e.g. `abdulrahmon.tech`).
2. Add the provided DNS records (DKIM, SPF, MX) to your DNS provider (e.g. Cloudflare, Namecheap, Vercel).
3. Once verified, you can send emails from any address on that domain, such as `contact@abdulrahmon.tech` or `notifications@abdulrahmon.tech`.
4. *Local Testing / Sandbox*: If you do not have a custom domain verified yet, you can test with Resend's free testing sender `onboarding@resend.dev` (delivers only to the email address associated with your Resend account).

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory (this file is ignored by Git):

```env
# Resend API Key
RESEND_API_KEY=re_your_api_key_here

# Destination email where visitor messages will be sent
CONTACT_EMAIL=your-email@example.com

# Verified sender address
# For sandbox testing:
RESEND_FROM_EMAIL=Portfolio Contact <onboarding@resend.dev>
# For production with verified domain:
# RESEND_FROM_EMAIL=Contact Form <contact@abdulrahmon.tech>
```

### 4. Optional: Distributed Rate Limiting (Upstash Redis)

For production deployments on serverless platforms (e.g. Vercel), instances scale across multiple regions. By default, the contact form uses an in-memory multi-window rate limiter enforcing:
- Maximum 5 requests per IP per 10-minute window
- Maximum 20 requests per IP per 24-hour day
- Standard HTTP `429 Too Many Requests` status with `Retry-After` response header

To enforce persistent, atomic rate limiting across all serverless lambdas:
1. Create a free database at [console.upstash.com](https://console.upstash.com).
2. Copy the REST URL and REST Token.
3. Add to `.env.local` and Vercel environment variables:
   ```env
   UPSTASH_REDIS_REST_URL=https://your-upstash-instance.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token
   ```
4. If omitted or unreachable, the system automatically and safely falls back to the in-memory multi-window limiter.

### 5. Optional: Cloudflare Turnstile (Bot Protection)

Cloudflare Turnstile provides privacy-friendly CAPTCHA protection without user friction. If configured:
1. Create a Turnstile widget in the [Cloudflare Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile).
2. Add your domain (`abdulrahmon.tech` and `localhost` for testing).
3. Add environment variables:
   ```env
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAA_your_site_key
   TURNSTILE_SECRET_KEY=0x4AAAAAA_your_secret_key
   ```
4. When configured, Turnstile tokens are strictly verified server-side with Cloudflare's Siteverify API (`https://challenges.cloudflare.com/turnstile/v0/siteverify`).
5. *Note*: If omitted, Turnstile is bypassed cleanly without breaking form submissions or local testing.

### 6. Security & Anti-Abuse Defenses

- **Multi-Window Rate Limiting**: Dual-window rate limits (5 per 10 min, 20 per day) with dynamic `Retry-After` headers.
- **Honeypot Protection**: An off-screen, inaccessible honeypot field (`_hp`) silently traps automated bots with a `200 OK` response without invoking Resend or consuming email quotas.
- **Idempotency Deduplication**: In-memory hash cache prevents duplicate email sends within 2 minutes if the user double-clicks or experiences connection retries.
- **Cross-Origin Validation**: Protects against unauthorized cross-origin POST requests from malicious external websites.
- **Injection Prevention**: All user inputs (name, subject, message) are strictly HTML-escaped using entity encoding to neutralize XSS and script injection attacks (e.g. `<script>alert("Hello");</script>`).
- **Header Injection Defense**: Subject and name fields are sanitized to remove carriage returns (`\r`), newlines (`\n`), null bytes (`\0`), and ASCII control characters.
- **Payload Limits**: Requests exceeding 64KB are rejected immediately with `413 Payload Too Large`.
- **Credential Protection**: The Resend API key and Turnstile secret key are never exposed to client-side bundles, frontend responses, or server logs.
- **Safe Sender & Routing**: Emails are strictly sent `from` the verified domain or sandbox sender with the visitor's address set exclusively as `replyTo`.

### 7. Deploying to Vercel

When deploying to Vercel:
1. Go to your project settings in the [Vercel Dashboard](https://vercel.com).
2. Navigate to **Settings** > **Environment Variables**.
3. Add:
   - `RESEND_API_KEY` (Secret)
   - `CONTACT_EMAIL`
   - `RESEND_FROM_EMAIL`
   - `UPSTASH_REDIS_REST_URL` (Optional)
   - `UPSTASH_REDIS_REST_TOKEN` (Optional)
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (Optional)
   - `TURNSTILE_SECRET_KEY` (Optional)
4. Redeploy or trigger a new deployment for changes to take effect.
