"use client";

import { useEffect, useRef } from "react";

export default function PrivacyNotice() {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== "undefined" && window.location.hash === "#privacy") {
        if (detailsRef.current) {
          detailsRef.current.open = true;
          detailsRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  return (
    <details
      ref={detailsRef}
      id="privacy"
      className="group pt-6 border-t border-border scroll-mt-24 text-sm text-muted"
    >
      <summary className="cursor-pointer select-none text-xs font-mono uppercase tracking-wider text-muted hover:text-text transition-colors flex items-center justify-between list-none">
        <span>Privacy Notice</span>
        <span
          className="text-[10px] text-muted group-open:rotate-180 transition-transform duration-200"
          aria-hidden="true"
        >
          ▼
        </span>
      </summary>
      <div className="pt-3 space-y-2 text-xs leading-[1.65] text-muted">
        <p>
          The contact form collects your name, email address, message, and an optional subject line to receive and respond to inquiries.
        </p>
        <p>
          Messages are delivered using <span className="text-text font-medium">Resend</span>. This website is hosted on <span className="text-text font-medium">Vercel</span>, which may process standard HTTP request data as part of serving pages and API routes.
        </p>
        <p>
          To detect and prevent automated abuse without intrusive verification challenges, this form integrates <span className="text-text font-medium">Cloudflare Turnstile</span> in invisible mode. For details on how Cloudflare evaluates telemetry, see the{" "}
          <a
            href="https://www.cloudflare.com/en-gb/turnstile-privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text underline decoration-border underline-offset-[2px] hover:text-primary hover:decoration-primary transition-colors"
          >
            Cloudflare Turnstile Privacy Policy
          </a>.
        </p>
        <p>
          If you have questions about your submitted information, you can reach out directly via email at{" "}
          <a
            href="mailto:abdulrahmonsulaimon60@gmail.com"
            className="text-text underline decoration-border underline-offset-[2px] hover:text-primary hover:decoration-primary transition-colors"
          >
            abdulrahmonsulaimon60@gmail.com
          </a>.
        </p>
      </div>
    </details>
  );
}
