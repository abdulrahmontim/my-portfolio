"use client";

import { useState, useId, useEffect, useRef } from "react";
import { EMAIL_SYNTAX_REGEX } from "@/lib/contact";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
  _hp: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
  _hp: "",
};

function formatCooldownNotice(seconds: number): string {
  if (seconds >= 60) {
    const minutes = Math.ceil(seconds / 60);
    return ` Please wait ${minutes} minute${minutes === 1 ? "" : "s"} before trying again.`;
  }
  return ` Please wait ${seconds} second${seconds === 1 ? "" : "s"} before trying again.`;
}

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const nameId = useId();
  const emailId = useId();
  const subjectId = useId();
  const messageId = useId();
  const hpId = useId();
  const turnstileContainerId = useId();

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const successPanelRef = useRef<HTMLDivElement>(null);

  // Rate limiting cooldown timer state & synchronous submit guard
  const [cooldownSeconds, setCooldownSeconds] = useState<number | null>(null);
  const cooldownEndRef = useRef<number | null>(null);
  const isSubmittingRef = useRef<boolean>(false);

  // Invisible Turnstile execution and widget references
  const widgetIdRef = useRef<string | null>(null);
  const turnstileResolveRef = useRef<((token: string) => void) | null>(null);
  const turnstileRejectRef = useRef<((reason: Error) => void) | null>(null);

  // Live countdown timer and sessionStorage synchronization
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedUntil = window.sessionStorage?.getItem("portfolio_contact_cooldown_until");
      if (storedUntil) {
        const remainingMs = parseInt(storedUntil, 10) - Date.now();
        if (remainingMs > 0) {
          const remainingSec = Math.ceil(remainingMs / 1000);
          cooldownEndRef.current = parseInt(storedUntil, 10);
          setTimeout(() => {
            setCooldownSeconds(remainingSec);
            setServerError(
              `Too many requests. Please wait a while before sending another message.${formatCooldownNotice(remainingSec)}`
            );
          }, 0);
        } else {
          window.sessionStorage.removeItem("portfolio_contact_cooldown_until");
        }
      }
    } catch {
      // ignore sessionStorage access errors
    }
  }, []);

  useEffect(() => {
    if (cooldownSeconds === null || cooldownSeconds <= 0) return;

    const interval = setInterval(() => {
      if (cooldownEndRef.current) {
        const remainingMs = cooldownEndRef.current - Date.now();
        const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
        if (remainingSec <= 0) {
          setCooldownSeconds(null);
          cooldownEndRef.current = null;
          try {
            window.sessionStorage?.removeItem("portfolio_contact_cooldown_until");
          } catch {
            // ignore sessionStorage error
          }
          setServerError(null);
        } else {
          setCooldownSeconds(remainingSec);
          setServerError(
            `Too many requests. Please wait a while before sending another message.${formatCooldownNotice(remainingSec)}`
          );
        }
      } else {
        setCooldownSeconds(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  useEffect(() => {
    if (status === "success") {
      successPanelRef.current?.focus();
    }
  }, [status]);

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // Cloudflare Invisible Turnstile integration
  useEffect(() => {
    if (!turnstileSiteKey || typeof window === "undefined") return;

    let isMounted = true;

    const renderWidget = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cf = (window as any).turnstile;
      const el = document.getElementById(turnstileContainerId);
      if (cf && el && !widgetIdRef.current) {
        try {
          widgetIdRef.current = cf.render(el, {
            sitekey: turnstileSiteKey,
            size: "invisible",
            execution: "execute",
            callback: (token: string) => {
              if (turnstileResolveRef.current) {
                turnstileResolveRef.current(token);
                turnstileResolveRef.current = null;
              }
            },
            "error-callback": () => {
              if (turnstileRejectRef.current) {
                turnstileRejectRef.current(new Error("Turnstile challenge failed"));
                turnstileRejectRef.current = null;
              }
            },
            "expired-callback": () => {
              if (widgetIdRef.current && cf) {
                try {
                  cf.reset(widgetIdRef.current);
                } catch {
                  // ignore reset error
                }
              }
            },
          });
        } catch {
          // ignore duplicate render attempt
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).turnstile) {
      renderWidget();
    } else {
      const scriptId = "cf-turnstile-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (isMounted) renderWidget();
        };
        document.head.appendChild(script);
      }
    }

    return () => {
      isMounted = false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cf = (window as any).turnstile;
      if (widgetIdRef.current && cf) {
        try {
          cf.remove(widgetIdRef.current);
        } catch {
          // ignore cleanup errors
        }
        widgetIdRef.current = null;
      }
    };
  }, [turnstileSiteKey, turnstileContainerId]);

  const resetTurnstile = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cf = typeof window !== "undefined" ? (window as any).turnstile : undefined;
    if (cf && widgetIdRef.current) {
      try {
        cf.reset(widgetIdRef.current);
      } catch {
        // ignore reset error
      }
    }
  };

  const obtainTurnstileToken = async (): Promise<string | undefined> => {
    if (!turnstileSiteKey) return undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cf = typeof window !== "undefined" ? (window as any).turnstile : undefined;
    const widgetId = widgetIdRef.current;

    if (!cf || !widgetId) {
      // If Turnstile is uninitialized or blocked, pass undefined so server validates configuration
      return undefined;
    }

    return new Promise<string>((resolve, reject) => {
      turnstileResolveRef.current = resolve;
      turnstileRejectRef.current = reject;

      try {
        cf.reset(widgetId);
        cf.execute(widgetId);
      } catch (err) {
        turnstileResolveRef.current = null;
        turnstileRejectRef.current = null;
        reject(err instanceof Error ? err : new Error(String(err)));
        return;
      }

      // Safety timeout: 15s so the form is never indefinitely locked
      setTimeout(() => {
        if (turnstileResolveRef.current) {
          turnstileResolveRef.current = null;
          turnstileRejectRef.current = null;
          reject(new Error("Turnstile verification timed out. Please try again."));
        }
      }, 15000);
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific error when the user edits that field
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (status === "submitting" || isSubmittingRef.current || (cooldownSeconds !== null && cooldownSeconds > 0)) {
      return;
    }

    // Client-side validation: reject empty or whitespace-only values
    const errors: Record<string, string> = {};
    if (!form.name.trim()) {
      errors.name = "Please enter your name.";
    }
    const trimmedEmail = form.email.trim();
    if (!trimmedEmail || !EMAIL_SYNTAX_REGEX.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!form.message.trim()) {
      errors.message = "Please enter a message.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setServerError(null);

      // Focus the first invalid field
      if (errors.name) {
        nameRef.current?.focus();
      } else if (errors.email) {
        emailRef.current?.focus();
      } else if (errors.message) {
        messageRef.current?.focus();
      }
      return;
    }

    isSubmittingRef.current = true;
    setStatus("submitting");
    setFieldErrors({});
    setServerError(null);

    let token: string | undefined;
    try {
      token = await obtainTurnstileToken();
    } catch (err) {
      isSubmittingRef.current = false;
      setStatus("error");
      resetTurnstile();
      setServerError(
        err instanceof Error && err.message.includes("timed out")
          ? "Verification challenge timed out. Please check your connection and try again."
          : "Bot verification was unsuccessful. Please try again or reach out by email."
      );
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          turnstileToken: token || undefined,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        isSubmittingRef.current = false;
        setStatus("error");
        resetTurnstile();
        if (data?.fieldErrors) {
          setFieldErrors(data.fieldErrors);
          if (data.fieldErrors.name) nameRef.current?.focus();
          else if (data.fieldErrors.email) emailRef.current?.focus();
          else if (data.fieldErrors.message) messageRef.current?.focus();
        }

        // Check if rate limited with Retry-After header
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          const retrySeconds = retryAfter ? parseInt(retryAfter, 10) : 600;
          const validCooldownSec = !isNaN(retrySeconds) && retrySeconds > 0 ? retrySeconds : 600;

          cooldownEndRef.current = Date.now() + validCooldownSec * 1000;
          setCooldownSeconds(validCooldownSec);
          try {
            window.sessionStorage?.setItem(
              "portfolio_contact_cooldown_until",
              String(cooldownEndRef.current)
            );
          } catch {
            // ignore sessionStorage error
          }

          setServerError(
            (data?.error ||
              "Too many requests. Please wait a while before sending another message.") +
              formatCooldownNotice(validCooldownSec)
          );
          return;
        }

        setServerError(
          data?.error ||
            "Unable to deliver your message at this time. Please try again or reach out by email."
        );
        return;
      }

      // Success: clear form fields
      isSubmittingRef.current = false;
      setStatus("success");
      setForm(INITIAL_FORM);
      resetTurnstile();
    } catch {
      isSubmittingRef.current = false;
      setStatus("error");
      resetTurnstile();
      setServerError(
        "Network connection error. Please check your internet connection or email directly."
      );
    }
  };

  const handleReset = () => {
    setStatus("idle");
    if (!cooldownSeconds || cooldownSeconds <= 0) {
      setServerError(null);
    }
    setFieldErrors({});
    setForm(INITIAL_FORM);
    resetTurnstile();
    setTimeout(() => {
      nameRef.current?.focus();
    }, 0);
  };

  if (status === "success") {
    return (
      <div className="space-y-6">
        <div
          role="status"
          aria-live="polite"
          tabIndex={-1}
          ref={successPanelRef}
          className="success-panel-enter border border-border bg-surface rounded-lg p-6 sm:p-7 space-y-5 focus:outline-none focus:ring-1 focus:ring-primary/40"
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0"
              aria-hidden="true"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="space-y-1.5 pt-0.5">
              <h3 className="text-[18px] sm:text-[20px] font-semibold text-text leading-snug">
                Message sent!
              </h3>
              <p className="text-base text-muted leading-[1.65]">
                Thanks for reaching out. Your message has been sent successfully.
              </p>
            </div>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-border bg-bg text-text rounded text-sm font-medium hover:border-primary hover:text-primary transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              <span aria-hidden="true">&larr;</span> Send another message
            </button>
          </div>
        </div>

        <p className="text-sm text-muted">
          Prefer email?{" "}
          <a
            href="mailto:abdulrahmonsulaimon60@gmail.com"
            className="text-text underline decoration-border underline-offset-[3px] hover:text-primary hover:decoration-primary transition-colors break-words"
          >
            abdulrahmonsulaimon60@gmail.com
          </a>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5"
    >
      {serverError && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3.5 border border-[#b91c1c]/40 dark:border-[#f87171]/40 bg-surface rounded text-sm font-medium text-[#b91c1c] dark:text-[#f87171]"
        >
          {serverError}
        </div>
      )}

      {/* Honeypot field for anti-spam bot trap */}
      <div
        className="hidden"
        aria-hidden="true"
        style={{
          display: "none",
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        <label htmlFor={hpId}>Do not fill this field</label>
        <input
          id={hpId}
          type="text"
          name="_hp"
          value={form._hp}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Name & Email Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor={nameId}
            className="block font-mono text-[12px] uppercase text-muted tracking-wider"
          >
            Name
          </label>
          <input
            ref={nameRef}
            id={nameId}
            type="text"
            name="name"
            required
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? `${nameId}-error` : undefined}
            disabled={status === "submitting"}
            autoComplete="name"
            maxLength={100}
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            className={`w-full bg-bg border ${
              fieldErrors.name
                ? "border-[#b91c1c] dark:border-[#f87171] focus:border-[#b91c1c] dark:focus:border-[#f87171] focus:ring-1 focus:ring-[#b91c1c] dark:focus:ring-[#f87171]"
                : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
            } rounded px-3.5 py-2 text-base text-text placeholder:text-muted focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          />
          {fieldErrors.name && (
            <p
              id={`${nameId}-error`}
              role="alert"
              className="text-sm font-medium text-[#b91c1c] dark:text-[#f87171] pt-1.5"
            >
              {fieldErrors.name}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={emailId}
            className="block font-mono text-[12px] uppercase text-muted tracking-wider"
          >
            Email
          </label>
          <input
            ref={emailRef}
            id={emailId}
            type="email"
            name="email"
            required
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? `${emailId}-error` : undefined}
            disabled={status === "submitting"}
            autoComplete="email"
            maxLength={254}
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            className={`w-full bg-bg border ${
              fieldErrors.email
                ? "border-[#b91c1c] dark:border-[#f87171] focus:border-[#b91c1c] dark:focus:border-[#f87171] focus:ring-1 focus:ring-[#b91c1c] dark:focus:ring-[#f87171]"
                : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
            } rounded px-3.5 py-2 text-base text-text placeholder:text-muted focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          />
          {fieldErrors.email && (
            <p
              id={`${emailId}-error`}
              role="alert"
              className="text-sm font-medium text-[#b91c1c] dark:text-[#f87171] pt-1.5"
            >
              {fieldErrors.email}
            </p>
          )}
        </div>
      </div>

      {/* Subject Field */}
      <div className="space-y-1.5">
        <label
          htmlFor={subjectId}
          className="block font-mono text-[12px] uppercase text-muted tracking-wider"
        >
          Subject (Optional)
        </label>
        <input
          id={subjectId}
          type="text"
          name="subject"
          disabled={status === "submitting"}
          maxLength={150}
          placeholder="Subject of your message"
          value={form.subject}
          onChange={handleChange}
          className={`w-full bg-bg border ${
            fieldErrors.subject
              ? "border-[#b91c1c] dark:border-[#f87171] focus:border-[#b91c1c] dark:focus:border-[#f87171] focus:ring-1 focus:ring-[#b91c1c] dark:focus:ring-[#f87171]"
              : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
          } rounded px-3.5 py-2 text-base text-text placeholder:text-muted focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
        />
        {fieldErrors.subject && (
          <p
            id={`${subjectId}-error`}
            role="alert"
            className="text-sm font-medium text-[#b91c1c] dark:text-[#f87171] pt-1.5"
          >
            {fieldErrors.subject}
          </p>
        )}
      </div>

      {/* Message Field */}
      <div className="space-y-1.5">
        <label
          htmlFor={messageId}
          className="block font-mono text-[12px] uppercase text-muted tracking-wider"
        >
          Message
        </label>
        <textarea
          ref={messageRef}
          id={messageId}
          name="message"
          rows={5}
          required
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? `${messageId}-error` : undefined}
          disabled={status === "submitting"}
          maxLength={5000}
          placeholder="Write your message here..."
          value={form.message}
          onChange={handleChange}
          className={`w-full bg-bg border ${
            fieldErrors.message
              ? "border-[#b91c1c] dark:border-[#f87171] focus:border-[#b91c1c] dark:focus:border-[#f87171] focus:ring-1 focus:ring-[#b91c1c] dark:focus:ring-[#f87171]"
              : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
          } rounded px-3.5 py-2 text-base text-text placeholder:text-muted focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors resize-y`}
        />
        {fieldErrors.message && (
          <p
            id={`${messageId}-error`}
            role="alert"
            className="text-sm font-medium text-[#b91c1c] dark:text-[#f87171] pt-1.5"
          >
            {fieldErrors.message}
          </p>
        )}
      </div>

      {/* Invisible Turnstile Container (zero layout space) */}
      {turnstileSiteKey && (
        <div id={turnstileContainerId} aria-hidden="true" />
      )}

      {/* Submit Button & Secondary Direct Contact */}
      <div className="pt-2 space-y-4">
        <button
          type="submit"
          disabled={status === "submitting" || (cooldownSeconds !== null && cooldownSeconds > 0)}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-on-primary font-medium rounded hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-base"
        >
          {cooldownSeconds !== null && cooldownSeconds > 0 ? (
            <span>
              Please wait ({cooldownSeconds >= 60 ? `${Math.ceil(cooldownSeconds / 60)}m` : `${cooldownSeconds}s`})
            </span>
          ) : status === "submitting" ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Sending...</span>
            </span>
          ) : (
            <span>Send Message &rarr;</span>
          )}
        </button>

        <p className="text-sm text-muted">
          Prefer email?{" "}
          <a
            href="mailto:abdulrahmonsulaimon60@gmail.com"
            className="text-text underline decoration-border underline-offset-[3px] hover:text-primary hover:decoration-primary transition-colors break-words"
          >
            abdulrahmonsulaimon60@gmail.com
          </a>
        </p>
      </div>
    </form>
  );
}
