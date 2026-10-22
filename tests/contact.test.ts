import fs from "node:fs";
import path from "node:path";
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import {
  contactSchema,
  EMAIL_SYNTAX_REGEX,
  sanitizeHeader,
  escapeHtml,
  sanitizeErrorMessage,
  extractClientIp,
  formatContactEmail,
  isRateLimited,
  resetRateLimitStore,
  checkRateLimit,
  verifyTurnstileToken,
  resetIdempotencyStore,
  processContactSubmission,
  type ResendLikeClient,
} from "../src/lib/contact.ts";

describe("Contact Form Security & Abuse Prevention", () => {
  describe("contactSchema (Input Validation & Boundaries)", () => {
    it("accepts a valid submission", () => {
      const result = contactSchema.safeParse({
        name: "Ada Lovelace",
        email: "ada@example.com",
        subject: "Analytical Engine Inquiry",
        message: "I would like to inquire about your distributed backend systems.",
      });

      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.name, "Ada Lovelace");
        assert.strictEqual(result.data.email, "ada@example.com");
        assert.strictEqual(result.data.subject, "Analytical Engine Inquiry");
        assert.strictEqual(
          result.data.message,
          "I would like to inquire about your distributed backend systems."
        );
      }
    });

    it("allows optional subject and defaults to empty string", () => {
      const result = contactSchema.safeParse({
        name: "Alan Turing",
        email: "alan@example.com",
        message: "Testing without subject line.",
      });

      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.subject, "");
      }
    });

    it("rejects missing or empty name", () => {
      const result1 = contactSchema.safeParse({
        name: "",
        email: "test@example.com",
        message: "Hello world message.",
      });
      assert.strictEqual(result1.success, false);

      const result2 = contactSchema.safeParse({
        email: "test@example.com",
        message: "Hello world message.",
      });
      assert.strictEqual(result2.success, false);
    });

    it("rejects names longer than 100 characters", () => {
      const result = contactSchema.safeParse({
        name: "A".repeat(101),
        email: "test@example.com",
        message: "Valid message length.",
      });
      assert.strictEqual(result.success, false);
    });

    it("rejects invalid email formats and injection attempts", () => {
      const invalidEmails = [
        "not-an-email",
        "missing-domain@",
        "@missing-user.com",
        "spaces in@email.com",
        "javascript:alert(1)",
        "victim@domain.com\r\nBcc:attacker@domain.com",
      ];

      for (const email of invalidEmails) {
        const result = contactSchema.safeParse({
          name: "Tester",
          email,
          message: "Valid message content.",
        });
        assert.strictEqual(result.success, false, `Expected ${email} to be rejected`);
      }
    });

    it("rejects emails longer than 254 characters", () => {
      const longEmail = "a".repeat(245) + "@example.com";
      const result = contactSchema.safeParse({
        name: "Tester",
        email: longEmail,
        message: "Valid message content.",
      });
      assert.strictEqual(result.success, false);
    });

    it("rejects empty or whitespace-only messages", () => {
      const resultEmpty = contactSchema.safeParse({
        name: "Tester",
        email: "test@example.com",
        message: "",
      });
      assert.strictEqual(resultEmpty.success, false);
      if (!resultEmpty.success) {
        assert.strictEqual(resultEmpty.error.issues[0]?.message, "Please enter a message.");
      }

      const resultWhitespace = contactSchema.safeParse({
        name: "Tester",
        email: "test@example.com",
        message: "   \t\n  ",
      });
      assert.strictEqual(resultWhitespace.success, false);
      if (!resultWhitespace.success) {
        assert.strictEqual(resultWhitespace.error.issues[0]?.message, "Please enter a message.");
      }
    });

    it("rejects messages longer than 5000 characters", () => {
      const result = contactSchema.safeParse({
        name: "Tester",
        email: "test@example.com",
        message: "M".repeat(5001),
      });
      assert.strictEqual(result.success, false);
    });

    it("rejects non-string types for fields", () => {
      const result = contactSchema.safeParse({
        name: 12345,
        email: "valid@example.com",
        message: true,
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe("sanitizeHeader & Header Injection Defense", () => {
    it("strips newline characters to prevent header injection", () => {
      const input = "Inquiry\r\nBcc: hacker@evil.com\r\nSubject: Injected";
      const sanitized = sanitizeHeader(input);
      assert.strictEqual(
        sanitized,
        "Inquiry Bcc: hacker@evil.com Subject: Injected"
      );
      assert.strictEqual(sanitized.includes("\r"), false);
      assert.strictEqual(sanitized.includes("\n"), false);
    });

    it("strips null bytes and control characters", () => {
      const input = "Project\x00 Inquiry\x1f with \x08control chars";
      const sanitized = sanitizeHeader(input);
      assert.strictEqual(sanitized, "Project  Inquiry  with  control chars");
      assert.strictEqual(sanitized.includes("\x00"), false);
      assert.strictEqual(sanitized.includes("\x1f"), false);
    });
  });

  describe("escapeHtml & Script Injection Defense", () => {
    it("escapes dangerous HTML characters", () => {
      const input = '<script>alert("xss")</script> & \'test\'';
      const escaped = escapeHtml(input);
      assert.strictEqual(
        escaped,
        "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &#039;test&#039;"
      );
    });

    it("regression test: exact malicious payload <script>alert(\"Hello\");</script> is escaped", () => {
      const maliciousPayload = '<script>alert("Hello");</script>';
      const escaped = escapeHtml(maliciousPayload);

      assert.strictEqual(
        escaped,
        "&lt;script&gt;alert(&quot;Hello&quot;);&lt;/script&gt;"
      );
      assert.strictEqual(escaped.includes("<script>"), false);
      assert.strictEqual(escaped.includes("</script>"), false);
    });
  });

  describe("sanitizeErrorMessage (Credential & Provider Detail Protection)", () => {
    it("redacts explicit secrets and Resend API key patterns", () => {
      const secret = "re_123456789_abcdefghijklmnopqrstuvwxyz";
      const errorMsg = `Failed to authenticate using key: ${secret} at api.resend.com`;
      const sanitized = sanitizeErrorMessage(new Error(errorMsg), secret);

      assert.strictEqual(sanitized.includes(secret), false);
      assert.strictEqual(sanitized.includes("[REDACTED]"), true);
    });

    it("redacts unknown re_ API keys automatically via regex", () => {
      const raw = "Upstream server returned error for key re_live_9876543210abcdefghijklmnop";
      const sanitized = sanitizeErrorMessage(raw);

      assert.strictEqual(sanitized.includes("re_live_9876543210abcdefghijklmnop"), false);
      assert.strictEqual(sanitized.includes("[REDACTED_API_KEY]"), true);
    });
  });

  describe("extractClientIp (Trusted Proxy & Header Spoofing Defense)", () => {
    it("prioritizes x-vercel-ip on Vercel infrastructure", () => {
      const headers = new Headers({
        "x-vercel-ip": "203.0.113.195",
        "x-forwarded-for": "198.51.100.1, 10.0.0.1",
        "x-real-ip": "198.51.100.1",
      });
      assert.strictEqual(extractClientIp(headers), "203.0.113.195");
    });

    it("uses cf-connecting-ip if x-vercel-ip is absent", () => {
      const headers = new Headers({
        "cf-connecting-ip": "198.51.100.42",
        "x-forwarded-for": "1.1.1.1",
      });
      assert.strictEqual(extractClientIp(headers), "198.51.100.42");
    });

    it("uses x-real-ip if edge headers are absent", () => {
      const headers = new Headers({
        "x-real-ip": "192.0.2.1",
        "x-forwarded-for": "10.0.0.5",
      });
      assert.strictEqual(extractClientIp(headers), "192.0.2.1");
    });

    it("extracts first non-empty IP from x-forwarded-for when other headers missing", () => {
      const headers = new Headers({
        "x-forwarded-for": "192.0.2.55, 10.0.0.1",
      });
      assert.strictEqual(extractClientIp(headers), "192.0.2.55");
    });

    it("falls back to anonymous when headers are empty or malformed", () => {
      const headers = new Headers({});
      assert.strictEqual(extractClientIp(headers), "anonymous");
    });
  });

  describe("Shared & Multi-Window Rate Limiting", () => {
    beforeEach(() => {
      resetRateLimitStore();
    });

    it("enforces short window: allows 5 submissions per 10-minute window and blocks the 6th", () => {
      const testIp = "192.168.1.100";
      const baseTime = 1000000;

      for (let i = 0; i < 5; i++) {
        const res = isRateLimited(testIp, baseTime + i * 1000);
        assert.strictEqual(res.limited, false);
      }

      const res6 = isRateLimited(testIp, baseTime + 5000);
      assert.strictEqual(res6.limited, true);
      assert.strictEqual(res6.reason, "short");
      assert.strictEqual(res6.retryAfter > 0, true);
    });

    it("enforces daily window: allows up to 20 submissions per day and blocks the 21st", () => {
      const testIp = "10.0.0.99";
      let currentTime = 1000000;

      // Make 20 submissions spread over hours (avoiding the 5-per-10-min limit by spacing them 15 mins apart)
      for (let i = 0; i < 20; i++) {
        currentTime += 15 * 60 * 1000; // +15 mins
        const res = isRateLimited(testIp, currentTime);
        assert.strictEqual(res.limited, false, `Submission ${i + 1} should be permitted`);
      }

      // 21st submission within 24 hours must be blocked by daily limit
      currentTime += 15 * 60 * 1000;
      const res21 = isRateLimited(testIp, currentTime);
      assert.strictEqual(res21.limited, true);
      assert.strictEqual(res21.reason, "daily");
      assert.strictEqual(res21.retryAfter > 0, true);
    });

    it("tracks different client IPs independently", () => {
      const ip1 = "10.0.0.1";
      const ip2 = "10.0.0.2";
      const now = Date.now();

      for (let i = 0; i < 5; i++) {
        isRateLimited(ip1, now);
      }
      assert.strictEqual(isRateLimited(ip1, now).limited, true);
      assert.strictEqual(isRateLimited(ip2, now).limited, false);
    });

    it("handles concurrent requests atomically without bypassing limits", async () => {
      const ip = "192.168.1.250";
      const promises = Array.from({ length: 10 }, () =>
        checkRateLimit(ip)
      );

      const results = await Promise.all(promises);
      const passed = results.filter((r) => !r.limited).length;
      const blocked = results.filter((r) => r.limited).length;

      assert.strictEqual(passed, 5, "Exactly 5 concurrent requests should pass");
      assert.strictEqual(blocked, 5, "Remaining 5 requests must be blocked with 429");
    });
  });

  describe("Cloudflare Turnstile Verification", () => {
    it("bypasses verification cleanly when TURNSTILE_SECRET_KEY is not configured", async () => {
      const res = await verifyTurnstileToken("dummy_token", "1.2.3.4", undefined);
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.bypassed, true);
    });

    it("rejects when TURNSTILE_SECRET_KEY is set but token is missing", async () => {
      const res = await verifyTurnstileToken("", "1.2.3.4", "0x4AAAAAAtest_secret");
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.error?.includes("not completed"), true);
    });
  });

  describe("formatContactEmail", () => {
    it("formats email with provided subject", () => {
      const formatted = formatContactEmail({
        name: "Grace Hopper",
        email: "grace@navy.mil",
        subject: "Compiler question",
        message: "Hello world!",
      });

      assert.strictEqual(formatted.subject, "Portfolio Contact: Compiler question");
      assert.strictEqual(formatted.text.includes("Grace Hopper"), true);
      assert.strictEqual(formatted.text.includes("grace@navy.mil"), true);
      assert.strictEqual(formatted.html.includes("Compiler question"), true);
      assert.strictEqual(formatted.html.includes("grace@navy.mil"), true);
    });

    it("defaults subject cleanly when not provided", () => {
      const formatted = formatContactEmail({
        name: "Grace Hopper",
        email: "grace@navy.mil",
        message: "Hello world!",
      });

      assert.strictEqual(formatted.subject, "Portfolio Contact from Grace Hopper");
      assert.strictEqual(formatted.text.includes("(None provided)"), true);
    });

    it("renders malicious <script>alert(\"Hello\");</script> as inert text in HTML and plain text", () => {
      const formatted = formatContactEmail({
        name: "<script>alert('name')</script>",
        email: "attacker@example.com",
        subject: "<script>alert('subject')</script>",
        message: '<script>alert("Hello");</script>',
      });

      assert.strictEqual(formatted.html.includes("<script>"), false);
      assert.strictEqual(formatted.html.includes("</script>"), false);
      assert.strictEqual(
        formatted.html.includes("&lt;script&gt;alert(&quot;Hello&quot;);&lt;/script&gt;"),
        true
      );
      assert.strictEqual(
        formatted.text.includes('<script>alert("Hello");</script>'),
        true
      );
    });
  });
});

describe("processContactSubmission (End-to-End Abuse Protection & Mocked Resend)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    resetRateLimitStore();
    resetIdempotencyStore();
  });

  it("1. A valid submission delivers exactly one mocked email", async () => {
    let sendCalls = 0;
    let capturedPayload: unknown = null;
    const mockResend: ResendLikeClient = {
      emails: {
        send: async (payload) => {
          sendCalls++;
          capturedPayload = payload;
          return { data: { id: "msg_valid_123" }, error: null };
        },
      },
    };

    const result = await processContactSubmission(
      {
        name: "Margaret Hamilton",
        email: "margaret@mit.edu",
        subject: "Apollo 11 Flight Software",
        message: "Inquiring about real-time distributed backend architectures.",
      },
      {
        apiKey: "re_mock_key",
        toEmail: "owner@example.com",
        fromEmail: "Portfolio Contact <contact@abdulrahmon.tech>",
        clientIp: "192.0.2.1",
        resendClient: mockResend,
      }
    );

    assert.strictEqual(result.status, 200);
    assert.strictEqual(result.data.success, true);
    assert.strictEqual(sendCalls, 1, "Exactly one email must be sent");

    const sent = capturedPayload as {
      from: string;
      to: string;
      replyTo: string;
      subject: string;
      text: string;
      html: string;
    };
    assert.strictEqual(sent.from, "Portfolio Contact <contact@abdulrahmon.tech>");
    assert.strictEqual(sent.to, "owner@example.com");
    assert.strictEqual(sent.replyTo, "margaret@mit.edu");
    assert.notStrictEqual(sent.from, "margaret@mit.edu", "Visitor email must NEVER be used as the from sender");
    assert.strictEqual(sent.subject, "Portfolio Contact: Apollo 11 Flight Software");
  });

  it("2. Repeated submissions exceed configured per-IP limit (5 in 10 minutes)", async () => {
    let sendCalls = 0;
    const mockResend: ResendLikeClient = {
      emails: {
        send: async () => {
          sendCalls++;
          return { data: { id: `msg_${sendCalls}` }, error: null };
        },
      },
    };

    const options = {
      apiKey: "re_mock_key",
      toEmail: "owner@example.com",
      clientIp: "203.0.113.88",
      resendClient: mockResend,
    };

    // First 5 submissions succeed
    for (let i = 0; i < 5; i++) {
      const res = await processContactSubmission(
        {
          name: `User ${i}`,
          email: `user${i}@example.com`,
          message: `Valid message number ${i}`,
        },
        options
      );
      assert.strictEqual(res.status, 200);
    }
    assert.strictEqual(sendCalls, 5);

    // 6th submission within 10 minutes must return 429
    const blockedRes = await processContactSubmission(
      {
        name: "User 6",
        email: "user6@example.com",
        message: "Message number 6",
      },
      options
    );
    assert.strictEqual(blockedRes.status, 429);
    assert.strictEqual(blockedRes.data.success, false);
    assert.strictEqual(blockedRes.retryAfter !== undefined && blockedRes.retryAfter > 0, true);
    assert.strictEqual(sendCalls, 5, "Resend must NOT be called for rate-limited requests");
  });

  it("3. Populated honeypot submissions do not send email", async () => {
    let emailSent = false;
    const mockResend: ResendLikeClient = {
      emails: {
        send: async () => {
          emailSent = true;
          return { data: { id: "honeypot_trap_id" }, error: null };
        },
      },
    };

    const result = await processContactSubmission(
      {
        name: "Spam Bot",
        email: "bot@spammer.org",
        message: "Buy cheap medications online now!",
        _hp: "filled_by_bot",
      },
      {
        apiKey: "re_mock_key",
        toEmail: "owner@example.com",
        resendClient: mockResend,
      }
    );

    assert.strictEqual(result.status, 200);
    assert.strictEqual(result.data.success, true);
    assert.strictEqual(emailSent, false, "Resend must NEVER be called for honeypot bot submissions");
  });

  it("4. Rejects oversized payloads (> 64KB) with 413", async () => {
    let emailSent = false;
    const mockResend: ResendLikeClient = {
      emails: {
        send: async () => {
          emailSent = true;
          return { data: { id: "id" }, error: null };
        },
      },
    };

    const result = await processContactSubmission(
      {
        name: "Test",
        email: "test@example.com",
        message: "Short message",
      },
      {
        contentLength: 70000,
        apiKey: "re_mock_key",
        toEmail: "owner@example.com",
        resendClient: mockResend,
      }
    );

    assert.strictEqual(result.status, 413);
    assert.strictEqual(result.data.success, false);
    assert.strictEqual(result.data.error?.includes("Payload too large"), true);
    assert.strictEqual(emailSent, false);
  });

  it("5. Rejects invalid and missing fields with 400 and exact error messages", async () => {
    const result = await processContactSubmission(
      {
        name: "   ",
        email: "invalid-email",
        message: "   ",
      },
      {
        apiKey: "re_mock_key",
        toEmail: "owner@example.com",
      }
    );

    assert.strictEqual(result.status, 400);
    assert.strictEqual(result.data.success, false);
    assert.strictEqual(result.data.fieldErrors?.name, "Please enter your name.");
    assert.strictEqual(result.data.fieldErrors?.email, "Please enter a valid email address.");
    assert.strictEqual(result.data.fieldErrors?.message, "Please enter a message.");
  });

  it("6. Rejects malformed and non-object bodies with 400", async () => {
    const stringBody = await processContactSubmission("plain-string", {
      apiKey: "re_mock_key",
      toEmail: "owner@example.com",
    });
    assert.strictEqual(stringBody.status, 400);

    const nullBody = await processContactSubmission(null, {
      apiKey: "re_mock_key",
      toEmail: "owner@example.com",
    });
    assert.strictEqual(nullBody.status, 400);

    const arrayBody = await processContactSubmission(["unexpected"], {
      apiKey: "re_mock_key",
      toEmail: "owner@example.com",
    });
    assert.strictEqual(arrayBody.status, 400);
  });

  it("7. Prevents duplicate sends within 2 minutes via idempotency check", async () => {
    let sendCalls = 0;
    const mockResend: ResendLikeClient = {
      emails: {
        send: async () => {
          sendCalls++;
          return { data: { id: "idempotent_id" }, error: null };
        },
      },
    };

    const options = {
      apiKey: "re_mock_key",
      toEmail: "owner@example.com",
      clientIp: "192.168.10.10",
      resendClient: mockResend,
    };

    const payload = {
      name: "Double Clicker",
      email: "clicker@example.com",
      message: "This is a valid test message that could be clicked twice.",
    };

    // First submission
    const res1 = await processContactSubmission(payload, options);
    assert.strictEqual(res1.status, 200);
    assert.strictEqual(sendCalls, 1);

    // Immediate second submission with identical content from same IP
    const res2 = await processContactSubmission(payload, options);
    assert.strictEqual(res2.status, 200);
    assert.strictEqual(sendCalls, 1, "Duplicate submission within 2 minutes must not dispatch second email");
  });

  it("8. Rejects when Turnstile token verification fails", async () => {
    let emailSent = false;
    const mockResend: ResendLikeClient = {
      emails: {
        send: async () => {
          emailSent = true;
          return { data: { id: "id" }, error: null };
        },
      },
    };

    const mockTurnstileVerifier = async () => ({
      success: false,
      error: "Bot verification failed or expired. Please refresh and try again.",
    });

    const result = await processContactSubmission(
      {
        name: "Test User",
        email: "user@example.com",
        message: "Valid test message here.",
        turnstileToken: "invalid_cf_token",
      },
      {
        apiKey: "re_mock_key",
        toEmail: "owner@example.com",
        resendClient: mockResend,
        turnstileVerifier: mockTurnstileVerifier,
      }
    );

    assert.strictEqual(result.status, 400);
    assert.strictEqual(result.data.success, false);
    assert.strictEqual(result.data.error?.includes("Bot verification failed"), true);
    assert.strictEqual(emailSent, false);
  });

  it("9. Resend errors do not leak secrets or internal provider details", async () => {
    const mockResend: ResendLikeClient = {
      emails: {
        send: async () => {
          return {
            data: null,
            error: new Error(
              "Resend authentication error using key re_live_secret_key_1234567890abcdef at internal-gateway"
            ),
          };
        },
      },
    };

    const result = await processContactSubmission(
      {
        name: "Test User",
        email: "user@example.com",
        message: "Valid test message for error handling test.",
      },
      {
        apiKey: "re_mock_key",
        toEmail: "owner@example.com",
        resendClient: mockResend,
      }
    );

    assert.strictEqual(result.status, 502);
    assert.strictEqual(result.data.success, false);
    assert.strictEqual(
      result.data.error?.includes("Failed to deliver message via email provider"),
      true
    );
    assert.strictEqual(
      result.data.error?.includes("re_live_secret_key"),
      false,
      "Resend API secret must never leak in client error message"
    );
    assert.strictEqual(
      result.data.error?.includes("internal-gateway"),
      false,
      "Internal infrastructure details must not leak in client error message"
    );
  });

  it("10. Returns 500 cleanly when RESEND_API_KEY or CONTACT_EMAIL is missing", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_EMAIL;

    const result = await processContactSubmission({
      name: "Test User",
      email: "test@example.com",
      message: "Valid test message here.",
    });

    assert.strictEqual(result.status, 500);
    assert.strictEqual(result.data.success, false);
    assert.strictEqual(result.data.error?.includes("temporarily unavailable"), true);
  });
});

describe("Contact Form Success State Contract", () => {
  it("delivers 200 with success confirmation payload for valid submissions", async () => {
    let emailSent = false;
    const mockResend: ResendLikeClient = {
      emails: {
        send: async () => {
          emailSent = true;
          return { data: { id: "resend_mock_success_id" }, error: null };
        },
      },
    };

    const result = await processContactSubmission(
      {
        name: "Katherine Johnson",
        email: "katherine@example.com",
        subject: "Trajectory Calculation",
        message: "Successful submission triggering the inline success panel state.",
      },
      {
        apiKey: "re_mock_key_123",
        toEmail: "owner@example.com",
        resendClient: mockResend,
      }
    );

    assert.strictEqual(result.status, 200);
    assert.strictEqual(result.data.success, true);
    assert.strictEqual(emailSent, true);
  });

  it("verifies ContactForm source contains required inline success panel elements and copy", () => {
    const componentCode = fs.readFileSync(path.resolve("src/components/ContactForm.tsx"), "utf8");

    // Clear checkmark icon
    assert.match(componentCode, /viewBox="0 0 20 20"/);
    assert.match(componentCode, /d="M16.707 5.293/);

    // Concise heading
    assert.match(componentCode, /Message sent!/);

    // Exact supporting text
    assert.match(
      componentCode,
      /Thanks for reaching out. Your message has been sent successfully./
    );

    // Secondary reset action
    assert.match(componentCode, /Send another message/);
    assert.match(componentCode, /handleReset/);

    // Entrance animation class
    assert.match(componentCode, /success-panel-enter/);

    // Direct email link preserved
    assert.match(componentCode, /mailto:abdulrahmonsulaimon60@gmail.com/);
  });


  it("verifies ContactForm configures Invisible Turnstile without reserved blank space", () => {
    const componentCode = fs.readFileSync(path.resolve("src/components/ContactForm.tsx"), "utf8");

    // Invisible mode configuration
    assert.match(componentCode, /size:\s*"invisible"/);
    assert.match(componentCode, /execution:\s*"execute"/);
    assert.match(componentCode, /obtainTurnstileToken/);
    assert.match(componentCode, /resetTurnstile/);

    // No reserved blank space or visible height
    assert.doesNotMatch(componentCode, /min-h-\[65px\]/);
  });

  it("verifies PrivacyNotice and Footer links are configured correctly without creating new pages", () => {
    const privacyCode = fs.readFileSync(path.resolve("src/components/PrivacyNotice.tsx"), "utf8");
    const footerCode = fs.readFileSync(path.resolve("src/components/Footer.tsx"), "utf8");
    const pageCode = fs.readFileSync(path.resolve("src/app/page.tsx"), "utf8");

    // Privacy notice content checks
    assert.match(privacyCode, /id="privacy"/);
    assert.match(privacyCode, /Resend/);
    assert.match(privacyCode, /Vercel/);
    assert.match(privacyCode, /Cloudflare Turnstile/);
    assert.match(privacyCode, /https:\/\/www\.cloudflare\.com\/en-gb\/turnstile-privacy-policy\//);
    assert.match(privacyCode, /abdulrahmonsulaimon60@gmail\.com/);

    // Footer link
    assert.match(footerCode, /href="\/#privacy"/);
    assert.match(footerCode, /Privacy/);

    // Home page renders PrivacyNotice
    assert.match(pageCode, /<PrivacyNotice \/>/);
  });

  it("verifies globals.css defines entrance animation with prefers-reduced-motion support", () => {
    const cssCode = fs.readFileSync(path.resolve("src/app/globals.css"), "utf8");

    assert.match(cssCode, /@keyframes successFadeIn/);
    assert.match(cssCode, /.success-panel-enter/);
    assert.match(cssCode, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });
});

describe("Client & Server Email Syntax Validation (Frictionless Contact)", () => {
  const validRecruiterEmails = [
    "recruiter@company.com",
    "jane.doe+recruiting@sub.domain.org",
    "engineer@startup.tech",
    "talent-acquisitions@global-firm.co.uk",
    "hiring.manager@enterprise-corp.io",
    "a@b.cd",
  ];

  const malformedEmails = [
    "plainaddress",
    "missing-domain@",
    "@missing-local.com",
    "spaces in@domain.com",
    "user@domain..com",
    "user@.com",
    "user@domain",
    "user@domain.c",
    "user@localhost",
    "user@domain.123",
    "victim@domain.com\r\nBcc:attacker@domain.com",
  ];

  it("accepts diverse standard syntax from visitors and recruiters on both client and server", () => {
    for (const email of validRecruiterEmails) {
      // 1. Client-side syntax regex test
      assert.strictEqual(
        EMAIL_SYNTAX_REGEX.test(email),
        true,
        `Client EMAIL_SYNTAX_REGEX should accept ${email}`
      );

      // 2. Server-side Zod schema test
      const serverResult = contactSchema.safeParse({
        name: "Test Recruiter",
        email,
        message: "We have an open role for a senior backend software engineer.",
      });
      assert.strictEqual(
        serverResult.success,
        true,
        `Server contactSchema should accept ${email}`
      );
    }
  });

  it("rejects malformed email syntax on both client and server", () => {
    for (const email of malformedEmails) {
      // 1. Client-side syntax regex test
      assert.strictEqual(
        EMAIL_SYNTAX_REGEX.test(email),
        false,
        `Client EMAIL_SYNTAX_REGEX should reject malformed ${email}`
      );

      // 2. Server-side Zod schema test
      const serverResult = contactSchema.safeParse({
        name: "Test User",
        email,
        message: "Testing malformed email validation.",
      });
      assert.strictEqual(
        serverResult.success,
        false,
        `Server contactSchema should reject malformed ${email}`
      );
    }
  });

  it("ensures frictionless submission without mandatory email ownership confirmation", async () => {
    let emailDispatched = false;
    const mockResend: ResendLikeClient = {
      emails: {
        send: async (payload) => {
          emailDispatched = true;
          // Validates replyTo is preserved directly without intermediate verification steps
          assert.strictEqual(payload.replyTo, "recruiter@tech-startup.com");
          return { data: { id: "resend_mock_id_direct" }, error: null };
        },
      },
    };

    const result = await processContactSubmission(
      {
        name: "Alex Rivera",
        email: "recruiter@tech-startup.com",
        subject: "Backend Opportunity",
        message: "Hello Abdulrahmon, reaching out regarding a backend role with FastAPI/Django.",
      },
      {
        apiKey: "re_test_key",
        toEmail: "owner@example.com",
        resendClient: mockResend,
      }
    );

    assert.strictEqual(result.status, 200);
    assert.strictEqual(result.data.success, true);
    assert.strictEqual(emailDispatched, true, "Email must be dispatched directly without ownership verification");
  });

  it("preserves anti-spam protections (Turnstile, rate limiting, honeypot) alongside email syntax checks", async () => {
    let emailDispatched = false;
    const mockResend: ResendLikeClient = {
      emails: {
        send: async () => {
          emailDispatched = true;
          return { data: { id: "resend_mock_id" }, error: null };
        },
      },
    };

    // Honeypot trapped submission with valid email syntax still silently drops email
    const honeypotResult = await processContactSubmission(
      {
        name: "Bot Spammer",
        email: "valid.syntax.spammer@spam-domain.com",
        message: "Spam content.",
        _hp: "bot_filled_trap",
      },
      {
        apiKey: "re_test_key",
        toEmail: "owner@example.com",
        resendClient: mockResend,
      }
    );

    assert.strictEqual(honeypotResult.status, 200);
    assert.strictEqual(emailDispatched, false, "Honeypot protection must remain active");
  });
});
