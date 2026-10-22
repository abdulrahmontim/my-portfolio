import { z } from "zod";
import { Resend } from "resend";

/**
 * Standard email syntax pattern (RFC 5322 compatible syntax check with domain and TLD):
 * Validates standard email syntax structure on both client and server to prevent malformed input.
 * Note: This verifies basic syntax only; it does not verify that the address is active, owned, or real.
 */
export const EMAIL_SYNTAX_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter your name.")
    .max(100, "Name must be 100 characters or less"),
  email: z
    .string()
    .trim()
    .min(1, "Please enter a valid email address.")
    .max(254, "Email must be 254 characters or less")
    .regex(EMAIL_SYNTAX_REGEX, "Please enter a valid email address.")
    .email("Please enter a valid email address."),
  subject: z
    .string()
    .trim()
    .max(150, "Subject must be 150 characters or less")
    .optional()
    .default(""),
  message: z
    .string()
    .trim()
    .min(1, "Please enter a message.")
    .max(5000, "Message must be 5000 characters or less"),
  _hp: z.string().optional().default(""),
  turnstileToken: z.string().optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;

/**
 * Strips carriage returns, newlines, null bytes, and ASCII control characters
 * to prevent email header injection and control character exploits.
 */
export function sanitizeHeader(input: string): string {
  return input.replace(/[\r\n\x00-\x1f\x7f]+/g, " ").trim();
}

/**
 * Escapes HTML characters for safe rendering in HTML email bodies.
 * Prevents HTML/XSS injection attacks (e.g. <script>alert("Hello");</script>).
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitizes error messages for logging and prevents credential leakage
 * (e.g. Redacting RESEND_API_KEY or TURNSTILE_SECRET_KEY if present in error message or stack trace).
 */
export function sanitizeErrorMessage(error: unknown, secretToRedact?: string): string {
  let message = "";
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else {
    try {
      message = JSON.stringify(error);
    } catch {
      message = String(error);
    }
  }

  if (secretToRedact && secretToRedact.length > 5) {
    message = message.replaceAll(secretToRedact, "[REDACTED]");
  }

  // Redact any string resembling a Resend API key (re_...)
  return message.replace(/re_[0-9a-zA-Z_]{10,}/g, "[REDACTED_API_KEY]");
}

/**
 * Sanitizes an IP address string by stripping IPv4 port numbers, enclosing IPv6 brackets,
 * and trimming leading/trailing whitespace.
 */
export function sanitizeIp(ip: string): string {
  let cleaned = ip.trim();
  // Strip port from IPv4 if present (e.g. 203.0.113.195:443 -> 203.0.113.195)
  if (/^(\d{1,3}\.){3}\d{1,3}:\d+$/.test(cleaned)) {
    cleaned = cleaned.replace(/:\d+$/, "");
  }
  // Strip enclosing brackets from IPv6 if present (e.g. [2001:db8::1] -> 2001:db8::1)
  if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned || "anonymous";
}

/**
 * Safely extracts client IP address, prioritizing trusted edge infrastructure headers.
 * On Vercel, `x-vercel-ip` is injected by Vercel edge routers and cannot be spoofed by clients.
 * When present, it supersedes all other headers.
 */
export function extractClientIp(headers: Headers): string {
  // 1. Vercel edge-injected header (overwritten by Vercel edge network; cannot be spoofed)
  const vercelIp = headers.get("x-vercel-ip");
  if (vercelIp && vercelIp.trim()) return sanitizeIp(vercelIp);

  const vercelForwardedFor = headers.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) {
    const parts = vercelForwardedFor.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) return sanitizeIp(parts[0]);
  }

  // 2. Cloudflare Edge header (used when behind Cloudflare proxy without Vercel edge header)
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp && cfIp.trim()) return sanitizeIp(cfIp);

  // 3. Reverse proxy real IP header
  const realIp = headers.get("x-real-ip");
  if (realIp && realIp.trim()) return sanitizeIp(realIp);

  // 4. Fallback to X-Forwarded-For: take first non-empty IP entry
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const parts = forwardedFor.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) return sanitizeIp(parts[0]);
  }

  return "anonymous";
}

export interface FormattedEmail {
  subject: string;
  text: string;
  html: string;
}

/**
 * Formats contact form data into structured plain text and HTML email representations.
 * All user inputs are safely escaped and sanitized.
 */
export function formatContactEmail(data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): FormattedEmail {
  const safeName = sanitizeHeader(data.name);
  const safeSubject = data.subject ? sanitizeHeader(data.subject) : "";
  const emailSubject = safeSubject
    ? `Portfolio Contact: ${safeSubject}`
    : `Portfolio Contact from ${safeName}`;

  const text = [
    `New contact form submission from your portfolio:`,
    ``,
    `Name: ${safeName}`,
    `Email: ${data.email.trim()}`,
    `Subject: ${safeSubject || "(None provided)"}`,
    ``,
    `Message:`,
    data.message.trim(),
    ``,
    `---`,
    `You can reply directly to this email to contact ${safeName} (${data.email.trim()}).`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #111; background-color: #f9f9f9; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 24px; }
    h2 { margin-top: 0; color: #111; font-size: 20px; border-bottom: 1px solid #eee; padding-bottom: 12px; }
    .field { margin-bottom: 16px; }
    .label { font-weight: 600; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .value { margin-top: 4px; font-size: 15px; color: #111; }
    .message-box { background: #f5f5f5; border: 1px solid #e5e5e5; border-radius: 6px; padding: 16px; white-space: pre-wrap; font-family: inherit; font-size: 15px; color: #222; margin-top: 6px; }
    .footer { margin-top: 24px; font-size: 13px; color: #888; border-top: 1px solid #eee; padding-top: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>New Portfolio Contact Message</h2>
    <div class="field">
      <div class="label">Name</div>
      <div class="value">${escapeHtml(safeName)}</div>
    </div>
    <div class="field">
      <div class="label">Email</div>
      <div class="value"><a href="mailto:${escapeHtml(data.email.trim())}">${escapeHtml(data.email.trim())}</a></div>
    </div>
    ${
      safeSubject
        ? `<div class="field"><div class="label">Subject</div><div class="value">${escapeHtml(safeSubject)}</div></div>`
        : ""
    }
    <div class="field">
      <div class="label">Message</div>
      <div class="message-box">${escapeHtml(data.message.trim())}</div>
    </div>
    <div class="footer">
      This email was sent via the contact form on your portfolio. Reply directly to this email to contact <strong>${escapeHtml(safeName)}</strong>.
    </div>
  </div>
</body>
</html>`;

  return {
    subject: emailSubject,
    text,
    html,
  };
}

// ============================================================================
// Shared & Multi-Window Server-Side Rate Limiter
// Short window: 10 minutes (max 5 requests)
// Daily window: 24 hours (max 20 requests)
// ============================================================================
export const RATE_LIMIT_SHORT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
export const RATE_LIMIT_SHORT_MAX = 5;

export const RATE_LIMIT_DAILY_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
export const RATE_LIMIT_DAILY_MAX = 20;

export interface RateLimitResult {
  limited: boolean;
  retryAfter: number; // in seconds
  reason?: "short" | "daily";
}

interface IpTimestamps {
  shortTimestamps: number[];
  dailyTimestamps: number[];
}

const memoryRateLimitMap = new Map<string, IpTimestamps>();

/**
 * In-memory multi-window rate limiter fallback.
 */
export function isRateLimited(
  ip: string,
  now: number = Date.now(),
  shortWindowMs: number = RATE_LIMIT_SHORT_WINDOW_MS,
  shortMax: number = RATE_LIMIT_SHORT_MAX,
  dailyWindowMs: number = RATE_LIMIT_DAILY_WINDOW_MS,
  dailyMax: number = RATE_LIMIT_DAILY_MAX
): RateLimitResult {
  const record = memoryRateLimitMap.get(ip) || {
    shortTimestamps: [],
    dailyTimestamps: [],
  };

  const recentShort = record.shortTimestamps.filter((t) => now - t < shortWindowMs);
  const recentDaily = record.dailyTimestamps.filter((t) => now - t < dailyWindowMs);

  // Check 10-minute short limit
  if (recentShort.length >= shortMax) {
    const oldest = recentShort[0];
    const retryAfter = Math.max(1, Math.ceil((shortWindowMs - (now - oldest)) / 1000));
    return { limited: true, retryAfter, reason: "short" };
  }

  // Check 24-hour daily limit
  if (recentDaily.length >= dailyMax) {
    const oldest = recentDaily[0];
    const retryAfter = Math.max(1, Math.ceil((dailyWindowMs - (now - oldest)) / 1000));
    return { limited: true, retryAfter, reason: "daily" };
  }

  // Record attempt
  recentShort.push(now);
  recentDaily.push(now);
  memoryRateLimitMap.set(ip, {
    shortTimestamps: recentShort,
    dailyTimestamps: recentDaily,
  });

  // Periodic cleanup if map grows
  if (memoryRateLimitMap.size > 1000) {
    for (const [key, val] of memoryRateLimitMap.entries()) {
      if (val.dailyTimestamps.every((t) => now - t >= dailyWindowMs)) {
        memoryRateLimitMap.delete(key);
      }
    }
  }

  return { limited: false, retryAfter: 0 };
}

export function resetRateLimitStore(): void {
  memoryRateLimitMap.clear();
}

export interface RateLimitOptions {
  shortWindowMs?: number;
  shortMax?: number;
  dailyWindowMs?: number;
  dailyMax?: number;
  upstashUrl?: string;
  upstashToken?: string;
  now?: number;
}

/**
 * Atomic Redis Lua script for multi-window rate limiting.
 * KEYS[1]: shortKey, KEYS[2]: dailyKey
 * ARGV[1]: shortMax, ARGV[2]: dailyMax, ARGV[3]: shortSeconds, ARGV[4]: dailySeconds
 * Returns: { 1, retryAfter, reason } if limited, or { 0, 0, "ok" } if allowed.
 * Atomically checks both counters before any increment, preventing race conditions,
 * missing TTLs, and counter inflation from blocked requests.
 */
export const RATE_LIMIT_LUA_SCRIPT = `
local shortMax = tonumber(ARGV[1])
local dailyMax = tonumber(ARGV[2])
local shortSec = tonumber(ARGV[3])
local dailySec = tonumber(ARGV[4])

local shortVal = redis.call('GET', KEYS[1])
local dailyVal = redis.call('GET', KEYS[2])
local shortCount = shortVal and tonumber(shortVal) or 0
local dailyCount = dailyVal and tonumber(dailyVal) or 0

if shortCount >= shortMax then
  local ttl = redis.call('TTL', KEYS[1])
  if ttl < 0 then
    redis.call('EXPIRE', KEYS[1], shortSec)
    ttl = shortSec
  end
  return { 1, ttl, 'short' }
end

if dailyCount >= dailyMax then
  local ttl = redis.call('TTL', KEYS[2])
  if ttl < 0 then
    redis.call('EXPIRE', KEYS[2], dailySec)
    ttl = dailySec
  end
  return { 1, ttl, 'daily' }
end

local newShort = redis.call('INCR', KEYS[1])
if newShort == 1 then
  redis.call('EXPIRE', KEYS[1], shortSec)
else
  local ttl = redis.call('TTL', KEYS[1])
  if ttl < 0 then
    redis.call('EXPIRE', KEYS[1], shortSec)
  end
end

local newDaily = redis.call('INCR', KEYS[2])
if newDaily == 1 then
  redis.call('EXPIRE', KEYS[2], dailySec)
else
  local ttl = redis.call('TTL', KEYS[2])
  if ttl < 0 then
    redis.call('EXPIRE', KEYS[2], dailySec)
  end
end

return { 0, 0, 'ok' }
`.trim();

/**
 * Checks rate limits for a client IP address.
 * If Upstash Redis REST credentials are provided (UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN),
 * uses an atomic Redis Lua script for distributed persistence across serverless lambdas.
 * Otherwise, falls back to the in-memory multi-window limiter.
 */
export async function checkRateLimit(
  ip: string,
  options: RateLimitOptions = {}
): Promise<RateLimitResult> {
  const shortWindowMs = options.shortWindowMs ?? RATE_LIMIT_SHORT_WINDOW_MS;
  const shortMax = options.shortMax ?? RATE_LIMIT_SHORT_MAX;
  const dailyWindowMs = options.dailyWindowMs ?? RATE_LIMIT_DAILY_WINDOW_MS;
  const dailyMax = options.dailyMax ?? RATE_LIMIT_DAILY_MAX;
  const now = options.now ?? Date.now();

  const upstashUrl = options.upstashUrl ?? process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = options.upstashToken ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const shortKey = `ratelimit:contact:short:${ip}`;
      const dailyKey = `ratelimit:contact:daily:${ip}`;
      const shortSeconds = Math.ceil(shortWindowMs / 1000);
      const dailySeconds = Math.ceil(dailyWindowMs / 1000);

      const response = await fetch(`${upstashUrl}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          "EVAL",
          RATE_LIMIT_LUA_SCRIPT,
          "2",
          shortKey,
          dailyKey,
          String(shortMax),
          String(dailyMax),
          String(shortSeconds),
          String(dailySeconds),
        ]),
      });

      if (response.ok) {
        const data = (await response.json()) as {
          result?: [number, number, string];
        };
        const [isLimited, ttl, reason] = data?.result ?? [0, 0, "ok"];

        if (isLimited === 1) {
          const fallbackSec = reason === "daily" ? dailySeconds : shortSeconds;
          const retryAfter = ttl > 0 ? ttl : fallbackSec;
          return {
            limited: true,
            retryAfter,
            reason: reason === "daily" ? "daily" : "short",
          };
        }

        return { limited: false, retryAfter: 0 };
      }
    } catch (err) {
      console.warn(
        "Upstash Redis rate limit check failed, falling back to memory store:",
        sanitizeErrorMessage(err)
      );
    }
  }

  return isRateLimited(ip, now, shortWindowMs, shortMax, dailyWindowMs, dailyMax);
}

// ============================================================================
// Cloudflare Turnstile Bot Challenge Verification
// ============================================================================
export interface TurnstileVerificationResult {
  success: boolean;
  bypassed?: boolean;
  misconfigured?: boolean;
  error?: string;
}

/**
 * Verifies Cloudflare Turnstile bot verification token with Cloudflare's Siteverify API.
 * In production (NODE_ENV === "production"), TURNSTILE_SECRET_KEY is strictly required and fails closed
 * if missing or empty, rejecting submissions with a 500 configuration error.
 * In non-production environments (development / test), a missing secret gracefully bypasses
 * verification for developer convenience.
 */
export async function verifyTurnstileToken(
  token?: string,
  clientIp?: string,
  secretKey?: string,
  isProduction: boolean = process.env.NODE_ENV === "production"
): Promise<TurnstileVerificationResult> {
  const secret = secretKey ?? process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (isProduction) {
      console.error(
        "Turnstile configuration error: TURNSTILE_SECRET_KEY is missing in production environment."
      );
      return {
        success: false,
        misconfigured: true,
        error:
          "Verification service is temporarily unavailable. Please try again or reach out by email.",
      };
    }
    // Explicitly non-production environment: allow graceful local development bypass
    return { success: true, bypassed: true };
  }

  if (!token || !token.trim()) {
    return {
      success: false,
      error: "Bot verification challenge was not completed. Please try again.",
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secret);
    formData.append("response", token.trim());
    if (clientIp && clientIp !== "anonymous") {
      formData.append("remoteip", clientIp);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    if (!res.ok) {
      return {
        success: false,
        error: "Verification service temporarily unavailable. Please try again.",
      };
    }

    const data = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!data.success) {
      return {
        success: false,
        error: "Bot verification failed or expired. Please refresh and try again.",
      };
    }

    return { success: true };
  } catch (err) {
    console.error("Turnstile verification error:", sanitizeErrorMessage(err, secret));
    return {
      success: false,
      error: "Unable to verify bot challenge. Please check your connection and try again.",
    };
  }
}

// ============================================================================
// Idempotency & Duplicate Submission Protection
// Prevents duplicate emails when users double-click or network re-posts occur
// ============================================================================
const recentSubmissions = new Map<string, { timestamp: number; id: string }>();
const IDEMPOTENCY_WINDOW_MS = 2 * 60 * 1000; // 2 minutes

export function createSubmissionHash(
  ip: string,
  name: string,
  email: string,
  message: string
): string {
  const str = `${ip.trim()}|${name.trim()}|${email.trim().toLowerCase()}|${message.trim()}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}

export function resetIdempotencyStore(): void {
  recentSubmissions.clear();
}

// ============================================================================
// Contact Service Layer
// ============================================================================
export interface ContactServiceResult {
  status: number;
  retryAfter?: number;
  data: {
    success: boolean;
    message?: string;
    error?: string;
    fieldErrors?: Record<string, string>;
    id?: string;
  };
}

export interface SendEmailPayload {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}

export interface ResendLikeClient {
  emails: {
    send: (
      payload: SendEmailPayload
    ) => Promise<{ data: { id: string } | null; error: Error | null }>;
  };
}

export interface ContactServiceOptions {
  apiKey?: string;
  toEmail?: string;
  fromEmail?: string;
  turnstileSecretKey?: string;
  isProduction?: boolean;
  clientIp?: string;
  contentLength?: number;
  resendClient?: ResendLikeClient;
  rateLimitCheck?: (ip: string) => Promise<RateLimitResult> | RateLimitResult;
  turnstileVerifier?: (
    token?: string,
    clientIp?: string,
    secret?: string,
    isProduction?: boolean
  ) => Promise<TurnstileVerificationResult>;
}

export async function processContactSubmission(
  body: unknown,
  options: ContactServiceOptions = {}
): Promise<ContactServiceResult> {
  const ip = sanitizeIp(options.clientIp || "anonymous");

  // 1. Content-Length check (> 64KB rejected with 413)
  if (options.contentLength && options.contentLength > 65536) {
    return {
      status: 413,
      data: {
        success: false,
        error: "Payload too large. Please shorten your message.",
      },
    };
  }

  // 2. Schema Validation (Input boundaries and field validation)
  // Validation errors (400) do NOT consume rate limit quota
  const parseResult = contactSchema.safeParse(body);
  if (!parseResult.success) {
    const fieldErrors: Record<string, string> = {};
    parseResult.error.issues.forEach((err) => {
      const fieldName = err.path.join(".");
      if (!fieldErrors[fieldName]) {
        fieldErrors[fieldName] = err.message;
      }
    });
    return {
      status: 400,
      data: {
        success: false,
        error: "Please check the form for errors.",
        fieldErrors,
      },
    };
  }

  const { name, email, subject, message, _hp, turnstileToken } = parseResult.data;

  // 3. Honeypot check: If filled, silently accept with 200 without dispatching email
  // Bots trapped by honeypot do not consume rate limit quota
  if (_hp && _hp.trim().length > 0) {
    return {
      status: 200,
      data: {
        success: true,
        message: "Your message has been received.",
      },
    };
  }

  // 4. Idempotency Check (prevent duplicate sends within 2 minutes)
  // Re-submitting identical payload does not consume additional rate limit quota
  const submissionHash = createSubmissionHash(ip, name, email, message);
  const now = Date.now();
  const cached = recentSubmissions.get(submissionHash);
  if (cached && now - cached.timestamp < IDEMPOTENCY_WINDOW_MS) {
    return {
      status: 200,
      data: {
        success: true,
        message: "Thank you! Your message has been sent successfully. I will get back to you soon.",
        id: cached.id,
      },
    };
  }

  // 5. Client IP rate limiting (5 per 10min, 20 per day)
  const rateLimitCheckFn = options.rateLimitCheck ?? checkRateLimit;
  const rateLimitResult = await rateLimitCheckFn(ip);
  if (rateLimitResult.limited) {
    return {
      status: 429,
      retryAfter: rateLimitResult.retryAfter,
      data: {
        success: false,
        error: "Too many requests. Please wait a while before sending another message.",
      },
    };
  }

  // 6. Cloudflare Turnstile Verification
  // In production, fails closed with 500 if unconfigured; in development, bypasses cleanly.
  // Challenge failures (400) consume quota to prevent bot flood attacks.
  const turnstileVerifierFn = options.turnstileVerifier ?? verifyTurnstileToken;
  const isProduction = options.isProduction ?? (process.env.NODE_ENV === "production");
  const turnstileRes = await turnstileVerifierFn(
    turnstileToken,
    ip,
    options.turnstileSecretKey,
    isProduction
  );
  if (!turnstileRes.success) {
    const isMisconfigured = Boolean(turnstileRes.misconfigured);
    return {
      status: isMisconfigured ? 500 : 400,
      data: {
        success: false,
        error:
          turnstileRes.error ||
          (isMisconfigured
            ? "Verification service is temporarily unavailable. Please reach out directly by email."
            : "Bot verification failed."),
      },
    };
  }

  // 7. Config check
  const apiKey = options.apiKey ?? process.env.RESEND_API_KEY;
  const toEmail = options.toEmail ?? process.env.CONTACT_EMAIL;
  const fromEmail =
    options.fromEmail ??
    process.env.RESEND_FROM_EMAIL ??
    "Portfolio Contact <onboarding@resend.dev>";

  if (!apiKey || !toEmail) {
    console.error("Contact form error: RESEND_API_KEY or CONTACT_EMAIL is missing.");
    return {
      status: 500,
      data: {
        success: false,
        error: "Contact service is temporarily unavailable. Please reach out directly by email.",
      },
    };
  }

  // 8. Format email
  const formatted = formatContactEmail({ name, email, subject, message });

  // 9. Send email via Resend
  try {
    const resend = options.resendClient ?? (new Resend(apiKey) as unknown as ResendLikeClient);
    const { data: resendData, error: resendError } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: formatted.subject,
      text: formatted.text,
      html: formatted.html,
    });

    if (resendError) {
      console.error("Resend API error:", sanitizeErrorMessage(resendError, apiKey));
      return {
        status: 502,
        data: {
          success: false,
          error: "Failed to deliver message via email provider. Please try again or email directly.",
        },
      };
    }

    const messageId = resendData?.id || "sent";

    // Cache successful submission for idempotency
    recentSubmissions.set(submissionHash, {
      timestamp: now,
      id: messageId,
    });

    return {
      status: 200,
      data: {
        success: true,
        message: "Thank you! Your message has been sent successfully. I will get back to you soon.",
        id: messageId,
      },
    };
  } catch (error) {
    console.error("Unhandled Resend exception:", sanitizeErrorMessage(error, apiKey));
    return {
      status: 500,
      data: {
        success: false,
        error: "An unexpected error occurred while processing your request. Please try again.",
      },
    };
  }
}
