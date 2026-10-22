import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import {
  contactSchema,
  sanitizeHeader,
  escapeHtml,
  formatContactEmail,
  isRateLimited,
  resetRateLimitStore,
  processContactSubmission,
  type ResendLikeClient,
} from "../src/lib/contact.ts";

describe("Contact Form Validation & Utilities", () => {
  describe("contactSchema", () => {
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

    it("rejects invalid email formats", () => {
      const invalidEmails = [
        "not-an-email",
        "missing-domain@",
        "@missing-user.com",
        "spaces in@email.com",
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

    it("rejects messages shorter than 5 characters", () => {
      const result = contactSchema.safeParse({
        name: "Tester",
        email: "test@example.com",
        message: "Hi",
      });
      assert.strictEqual(result.success, false);
    });

    it("rejects messages longer than 5000 characters", () => {
      const result = contactSchema.safeParse({
        name: "Tester",
        email: "test@example.com",
        message: "M".repeat(5001),
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe("sanitizeHeader", () => {
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
  });

  describe("escapeHtml", () => {
    it("escapes dangerous HTML characters", () => {
      const input = '<script>alert("xss")</script> & \'test\'';
      const escaped = escapeHtml(input);
      assert.strictEqual(
        escaped,
        "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &#039;test&#039;"
      );
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
  });

  describe("Rate Limiter", () => {
    beforeEach(() => {
      resetRateLimitStore();
    });

    it("allows up to 5 requests per window and blocks the 6th", () => {
      const testIp = "192.168.1.100";
      for (let i = 0; i < 5; i++) {
        assert.strictEqual(isRateLimited(testIp), false);
      }
      assert.strictEqual(isRateLimited(testIp), true);
    });

    it("tracks different IPs independently", () => {
      const ip1 = "10.0.0.1";
      const ip2 = "10.0.0.2";

      for (let i = 0; i < 5; i++) {
        isRateLimited(ip1);
      }
      assert.strictEqual(isRateLimited(ip1), true);
      assert.strictEqual(isRateLimited(ip2), false);
    });
  });
});

describe("processContactSubmission (Service Layer & Mocked Resend)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    resetRateLimitStore();
  });

  it("returns 500 when RESEND_API_KEY or CONTACT_EMAIL is missing", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_EMAIL;

    const result = await processContactSubmission({
      name: "Test User",
      email: "test@example.com",
      message: "Valid test message here.",
    });

    assert.strictEqual(result.status, 500);
    assert.strictEqual(result.data.success, false);
    assert.strictEqual(
      result.data.error?.includes("temporarily unavailable"),
      true
    );
  });

  it("returns 400 with field errors for invalid input", async () => {
    const result = await processContactSubmission(
      {
        name: "",
        email: "bad-email",
        message: "hi",
      },
      {
        apiKey: "re_mock_key",
        toEmail: "owner@example.com",
      }
    );

    assert.strictEqual(result.status, 400);
    assert.strictEqual(result.data.success, false);
    assert.strictEqual(Boolean(result.data.fieldErrors?.name), true);
    assert.strictEqual(Boolean(result.data.fieldErrors?.email), true);
    assert.strictEqual(Boolean(result.data.fieldErrors?.message), true);
  });

  it("silently accepts honeypot submissions with 200 without sending email", async () => {
    let emailSent = false;
    const mockResend: ResendLikeClient = {
      emails: {
        send: async () => {
          emailSent = true;
          return { data: { id: "mock_id" }, error: null };
        },
      },
    };

    const result = await processContactSubmission(
      {
        name: "Spam Bot",
        email: "bot@spammer.com",
        message: "Spam message buy our product.",
        _hp: "I am a bot",
      },
      {
        apiKey: "re_mock_key",
        toEmail: "owner@example.com",
        resendClient: mockResend,
      }
    );

    assert.strictEqual(result.status, 200);
    assert.strictEqual(result.data.success, true);
    assert.strictEqual(emailSent, false, "Email must not be sent for honeypot submissions");
  });

  it("rejects payloads over 64KB with 413", async () => {
    const result = await processContactSubmission(
      {
        name: "Test",
        email: "test@example.com",
        message: "Short",
      },
      {
        contentLength: 70000,
        apiKey: "re_mock_key",
        toEmail: "owner@example.com",
      }
    );

    assert.strictEqual(result.status, 413);
    assert.strictEqual(result.data.success, false);
    assert.strictEqual(result.data.error?.includes("Payload too large"), true);
  });

  it("successfully sends an email via mocked Resend with replyTo and verified from", async () => {
    let capturedPayload: unknown = null;
    const mockResend: ResendLikeClient = {
      emails: {
        send: async (payload) => {
          capturedPayload = payload;
          return { data: { id: "resend_msg_12345" }, error: null };
        },
      },
    };

    const result = await processContactSubmission(
      {
        name: "Marie Curie",
        email: "marie@sorbonne.fr",
        subject: "Radiation Research",
        message: "Inquiring about potential collaboration on backend telemetry.",
      },
      {
        apiKey: "re_mock_key",
        toEmail: "owner@example.com",
        fromEmail: "Portfolio Contact <contact@abdulrahmon.tech>",
        clientIp: "192.168.1.50",
        resendClient: mockResend,
      }
    );

    assert.strictEqual(result.status, 200);
    assert.strictEqual(result.data.success, true);
    assert.strictEqual(result.data.id, "resend_msg_12345");

    const sent = capturedPayload as {
      from: string;
      to: string;
      replyTo: string;
      subject: string;
      text: string;
      html: string;
    };
    assert.ok(sent);
    assert.strictEqual(sent.from, "Portfolio Contact <contact@abdulrahmon.tech>");
    assert.strictEqual(sent.to, "owner@example.com");
    assert.strictEqual(sent.replyTo, "marie@sorbonne.fr");
    assert.strictEqual(sent.subject, "Portfolio Contact: Radiation Research");
    assert.strictEqual(sent.text.includes("Marie Curie"), true);
    assert.strictEqual(sent.html.includes("Marie Curie"), true);
  });

  it("returns 502 when Resend reports an error without leaking credentials", async () => {
    const mockResend: ResendLikeClient = {
      emails: {
        send: async () => {
          return {
            data: null,
            error: new Error("Resend domain unverified: test error"),
          };
        },
      },
    };

    const result = await processContactSubmission(
      {
        name: "Test User",
        email: "user@example.com",
        message: "Hello world testing error handling.",
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
      result.data.error?.includes("test error"),
      false,
      "Internal provider details must not leak to visitor"
    );
  });

  it("returns 429 when rate limit is exceeded", async () => {
    const ip = "1.2.3.4";
    const mockResend: ResendLikeClient = {
      emails: {
        send: async () => ({ data: { id: "id" }, error: null }),
      },
    };

    const options = {
      apiKey: "re_mock_key",
      toEmail: "owner@example.com",
      clientIp: ip,
      resendClient: mockResend,
    };

    const payload = {
      name: "Burst User",
      email: "burst@example.com",
      message: "Testing burst rate limiting.",
    };

    for (let i = 0; i < 5; i++) {
      const res = await processContactSubmission(payload, options);
      assert.strictEqual(res.status, 200);
    }

    const blocked = await processContactSubmission(payload, options);
    assert.strictEqual(blocked.status, 429);
    assert.strictEqual(blocked.data.success, false);
    assert.strictEqual(
      blocked.data.error?.includes("Too many requests"),
      true
    );
  });
});
