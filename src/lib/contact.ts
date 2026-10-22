import { z } from "zod";
import { Resend } from "resend";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(254, "Email must be 254 characters or less"),
  subject: z
    .string()
    .trim()
    .max(150, "Subject must be 150 characters or less")
    .optional()
    .default(""),
  message: z
    .string()
    .trim()
    .min(5, "Message must be at least 5 characters")
    .max(5000, "Message must be 5000 characters or less"),
  _hp: z.string().optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;

/**
 * Strips carriage returns and newlines to prevent email header injection attacks.
 */
export function sanitizeHeader(input: string): string {
  return input.replace(/[\r\n]+/g, " ").trim();
}

/**
 * Escapes HTML characters for safe rendering in HTML email bodies.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export interface FormattedEmail {
  subject: string;
  text: string;
  html: string;
}

/**
 * Formats contact form data into structured plain text and HTML email representations.
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

// In-memory sliding window rate limiter
// Protects against rapid spam bursts; resets gracefully across serverless warm instances
const ipRequests = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = ipRequests.get(ip) || [];
  const recentTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recentTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  recentTimestamps.push(now);
  ipRequests.set(ip, recentTimestamps);

  // Periodic cleanup if map grows large
  if (ipRequests.size > 500) {
    for (const [key, times] of ipRequests.entries()) {
      if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) {
        ipRequests.delete(key);
      }
    }
  }

  return false;
}

export function resetRateLimitStore(): void {
  ipRequests.clear();
}

export interface ContactServiceResult {
  status: number;
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
  clientIp?: string;
  contentLength?: number;
  resendClient?: ResendLikeClient;
}

export async function processContactSubmission(
  body: unknown,
  options: ContactServiceOptions = {}
): Promise<ContactServiceResult> {
  // 1. Content-Length check
  if (options.contentLength && options.contentLength > 65536) {
    return {
      status: 413,
      data: {
        success: false,
        error: "Payload too large. Please shorten your message.",
      },
    };
  }

  // 2. Client IP rate limiting
  const ip = options.clientIp || "anonymous";
  if (isRateLimited(ip)) {
    return {
      status: 429,
      data: {
        success: false,
        error: "Too many requests. Please wait a minute before sending another message.",
      },
    };
  }

  // 3. Validation
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

  const { name, email, subject, message, _hp } = parseResult.data;

  // 4. Honeypot check: If filled, silently accept without dispatching email
  if (_hp && _hp.trim().length > 0) {
    return {
      status: 200,
      data: {
        success: true,
        message: "Your message has been received.",
      },
    };
  }

  // 5. Config check
  const apiKey = options.apiKey ?? process.env.RESEND_API_KEY;
  const toEmail = options.toEmail ?? process.env.CONTACT_EMAIL;
  const fromEmail =
    options.fromEmail ??
    process.env.RESEND_FROM_EMAIL ??
    "Portfolio Contact <onboarding@resend.dev>";

  if (!apiKey || !toEmail) {
    console.error(
      "Contact form error: RESEND_API_KEY or CONTACT_EMAIL is missing."
    );
    return {
      status: 500,
      data: {
        success: false,
        error: "Contact service is temporarily unavailable. Please reach out directly by email.",
      },
    };
  }

  // 6. Format email
  const formatted = formatContactEmail({ name, email, subject, message });

  // 7. Send email via Resend
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
      console.error("Resend API error:", resendError);
      return {
        status: 502,
        data: {
          success: false,
          error: "Failed to deliver message via email provider. Please try again or email directly.",
        },
      };
    }

    return {
      status: 200,
      data: {
        success: true,
        message: "Thank you! Your message has been sent successfully. I will get back to you soon.",
        id: resendData?.id,
      },
    };
  } catch (error) {
    console.error("Unhandled Resend exception:", error);
    return {
      status: 500,
      data: {
        success: false,
        error: "An unexpected error occurred while processing your request. Please try again.",
      },
    };
  }
}
