"use client";

import { useState, useId } from "react";

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

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const nameId = useId();
  const emailId = useId();
  const subjectId = useId();
  const messageId = useId();
  const hpId = useId();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user edits
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

    if (status === "submitting") return;

    // Client-side quick validation
    const errors: Record<string, string> = {};
    if (!form.name.trim()) {
      errors.name = "Please enter your name.";
    }
    if (!form.email.trim()) {
      errors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (!form.message.trim()) {
      errors.message = "Please enter a message.";
    } else if (form.message.trim().length < 5) {
      errors.message = "Message must be at least 5 characters.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setGeneralError("Please fix the errors indicated below.");
      return;
    }

    setStatus("submitting");
    setFieldErrors({});
    setGeneralError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        setStatus("error");
        if (data?.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        }
        setGeneralError(
          data?.error ||
            "Unable to deliver your message at this time. Please try again or reach out by email."
        );
        return;
      }

      // Success: clear form fields
      setStatus("success");
      setSuccessMessage(
        data.message ||
          "Thank you! Your message has been sent successfully. I will get back to you soon."
      );
      setForm(INITIAL_FORM);
    } catch {
      setStatus("error");
      setGeneralError(
        "Network connection error. Please check your internet connection or email directly."
      );
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setSuccessMessage(null);
    setGeneralError(null);
    setFieldErrors({});
    setForm(INITIAL_FORM);
  };

  if (status === "success") {
    return (
      <div
        role="alert"
        className="p-6 border border-border bg-surface rounded-lg space-y-4"
      >
        <div className="font-mono text-[12px] uppercase text-muted tracking-wider">
          Message Sent
        </div>
        <p className="text-base text-text leading-[1.65]">
          {successMessage}
        </p>
        <div>
          <button
            type="button"
            onClick={handleReset}
            className="text-text underline decoration-border underline-offset-[3px] hover:text-primary hover:decoration-primary transition-colors text-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            &larr; Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="border border-border bg-surface rounded-lg p-6 space-y-5"
    >
      {generalError && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3.5 border border-border bg-bg rounded text-sm text-text"
        >
          <span className="font-mono text-[12px] uppercase text-muted tracking-wider block mb-1">
            Notice
          </span>
          {generalError}
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
            Name <span className="text-primary" aria-hidden="true">*</span>
          </label>
          <input
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
            placeholder="Ada Lovelace"
            value={form.name}
            onChange={handleChange}
            className="w-full bg-bg border border-border rounded px-3.5 py-2 text-base text-text placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
          {fieldErrors.name && (
            <p
              id={`${nameId}-error`}
              className="text-xs font-mono text-muted pt-0.5"
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
            Email <span className="text-primary" aria-hidden="true">*</span>
          </label>
          <input
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
            placeholder="ada@example.com"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-bg border border-border rounded px-3.5 py-2 text-base text-text placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
          {fieldErrors.email && (
            <p
              id={`${emailId}-error`}
              className="text-xs font-mono text-muted pt-0.5"
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
          Subject <span className="text-muted font-normal text-[11px]">(Optional)</span>
        </label>
        <input
          id={subjectId}
          type="text"
          name="subject"
          disabled={status === "submitting"}
          maxLength={150}
          placeholder="Role inquiry / System architecture discussion"
          value={form.subject}
          onChange={handleChange}
          className="w-full bg-bg border border-border rounded px-3.5 py-2 text-base text-text placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        />
        {fieldErrors.subject && (
          <p
            id={`${subjectId}-error`}
            className="text-xs font-mono text-muted pt-0.5"
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
          Message <span className="text-primary" aria-hidden="true">*</span>
        </label>
        <textarea
          id={messageId}
          name="message"
          rows={5}
          required
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? `${messageId}-error` : undefined}
          disabled={status === "submitting"}
          maxLength={5000}
          placeholder="Hi Abdulrahmon, I'd like to discuss an engineering role / project..."
          value={form.message}
          onChange={handleChange}
          className="w-full bg-bg border border-border rounded px-3.5 py-2 text-base text-text placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors resize-y"
        />
        {fieldErrors.message && (
          <p
            id={`${messageId}-error`}
            className="text-xs font-mono text-muted pt-0.5"
          >
            {fieldErrors.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-on-primary font-medium rounded hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-base"
        >
          {status === "submitting" ? (
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
      </div>
    </form>
  );
}
