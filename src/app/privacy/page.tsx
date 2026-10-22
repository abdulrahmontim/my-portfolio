import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for abdulrahmon.tech detailing data collection, email delivery via Resend, abuse prevention via Cloudflare Turnstile, and data protection practices.",
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
  openGraph: {
    title: "Privacy Policy | Abdulrahmon Sulaimon",
    description:
      "Privacy Policy for abdulrahmon.tech detailing data collection, email delivery via Resend, abuse prevention via Cloudflare Turnstile, and data protection practices.",
    url: `${SITE_URL}/privacy`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Abdulrahmon Sulaimon",
    description:
      "Privacy Policy for abdulrahmon.tech detailing data collection, email delivery via Resend, abuse prevention via Cloudflare Turnstile, and data protection practices.",
  },
};

export default function PrivacyPage() {
  return (
    <div className="w-full max-w-[720px] mx-auto px-6 py-12">
      {/* Return link */}
      <div className="mb-8">
        <Link
          href="/"
          className="text-muted hover:text-primary text-xs font-mono transition-colors inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          &larr; Back to Home
        </Link>
      </div>

      <article className="space-y-10">
        {/* Page Header */}
        <header className="space-y-2 border-b border-border pb-8">
          <div className="font-mono text-[12px] uppercase text-muted tracking-wider">
            Legal
          </div>
          <h1 className="text-[32px] font-semibold text-text leading-[1.2]">
            Privacy Policy
          </h1>
          <p className="font-mono text-[12px] text-muted">
            Effective Date: October 22, 2026
          </p>
        </header>

        {/* 1. Introduction */}
        <section className="space-y-3">
          <h2 className="text-[20px] font-semibold text-text">
            1. Overview
          </h2>
          <p className="text-base text-muted leading-[1.65]">
            This Privacy Policy describes how personal information is handled on{" "}
            <span className="text-text font-medium">abdulrahmon.tech</span>, the personal portfolio and engineering blog of Abdulrahmon Sulaimon.
          </p>
          <p className="text-base text-muted leading-[1.65]">
            The website is designed with a privacy-first mindset: I do not sell, rent, or trade your personal information. Personal data is only collected when you voluntarily submit an inquiry through the contact form or when technically necessary to deliver web pages securely and reliably.
          </p>
        </section>

        {/* 2. Information Collected */}
        <section className="space-y-3">
          <h2 className="text-[20px] font-semibold text-text">
            2. Information Collected
          </h2>
          <div className="space-y-3 text-base text-muted leading-[1.65]">
            <p>
              When using this website, the following types of information may be collected or processed:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-text font-medium">Contact Form Submissions:</strong> When you send a message using the portfolio contact form, you provide your <strong className="text-text font-medium">name</strong>, <strong className="text-text font-medium">email address</strong>, an optional <strong className="text-text font-medium">subject</strong>, and the content of your <strong className="text-text font-medium">message</strong>.
              </li>
              <li>
                <strong className="text-text font-medium">Technical Network Metadata:</strong> When you connect to the website or submit the form, standard network information—such as your <strong className="text-text font-medium">client IP address</strong> and request headers (e.g., <code className="font-mono text-[13px] text-text bg-surface px-1 py-0.5 rounded border border-border">User-Agent</code>)—is processed by hosting servers and security mechanisms strictly to enforce rate limits and prevent spam flooding.
              </li>
              <li>
                <strong className="text-text font-medium">Anti-Spam Verification Data:</strong> The contact form includes an invisible honeypot field (<code className="font-mono text-[13px] text-text bg-surface px-1 py-0.5 rounded border border-border">_hp</code>) that legitimate visitors do not see or fill out. Automated bots that fill this field are silently trapped without processing.
              </li>
            </ul>
          </div>
        </section>

        {/* 3. Purpose of Processing */}
        <section className="space-y-3">
          <h2 className="text-[20px] font-semibold text-text">
            3. Purpose of Processing
          </h2>
          <div className="space-y-2 text-base text-muted leading-[1.65]">
            <p>Submitted information is used exclusively for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>To read, evaluate, and reply to your messages, collaboration proposals, or career opportunities.</li>
              <li>To protect the website, serverless functions, and email infrastructure against automated scrapers, denial-of-service attacks, and spam flooding.</li>
              <li>To maintain the stability, performance, and integrity of the portfolio application.</li>
            </ul>
          </div>
        </section>

        {/* 4. Email Delivery & Service Providers */}
        <section className="space-y-3">
          <h2 className="text-[20px] font-semibold text-text">
            4. Service Providers & Data Sharing
          </h2>
          <div className="space-y-3 text-base text-muted leading-[1.65]">
            <p>
              I rely on trusted third-party cloud infrastructure providers to host and secure this website. These providers process information only as necessary to deliver their respective services:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-text font-medium">Resend (Email Delivery):</strong> Contact form messages are converted into transactional emails and delivered to my personal inbox using the Resend API (Resend, Inc.). Resend processes message content solely for transmission and delivery.
              </li>
              <li>
                <strong className="text-text font-medium">Cloudflare (Invisible Turnstile):</strong> To prevent automated bot submissions without disruptive image CAPTCHAs, the form uses Cloudflare Turnstile in invisible mode. Turnstile evaluates browser environment telemetry to distinguish humans from automated bots. For details, consult the{" "}
                <a
                  href="https://www.cloudflare.com/en-gb/turnstile-privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text underline decoration-border underline-offset-[3px] hover:text-primary hover:decoration-primary transition-colors"
                >
                  Cloudflare Turnstile Privacy Policy
                </a>.
              </li>
              <li>
                <strong className="text-text font-medium">Vercel (Hosting & Edge Infrastructure):</strong> The website and serverless API endpoints are hosted on Vercel Inc. Vercel processes standard HTTP requests and network logs to serve pages and APIs. The site also includes Vercel Web Analytics, which is cookie-free and does not track personal user identities across websites.
              </li>
              <li>
                <strong className="text-text font-medium">Upstash (Rate Limiting Cache):</strong> If distributed Redis caching is configured, client IP identifiers and request counts are processed to enforce rate limits across serverless instances.
              </li>
            </ul>
            <p>
              Your personal information is never sold, rented, or shared with advertisers, data brokers, or marketing networks.
            </p>
          </div>
        </section>

        {/* 5. Data Retention & Security */}
        <section className="space-y-3">
          <h2 className="text-[20px] font-semibold text-text">
            5. Retention and Security Practices
          </h2>
          <div className="space-y-3 text-base text-muted leading-[1.65]">
            <p>
              <strong className="text-text font-medium">Retention:</strong> Contact form submissions delivered to my email inbox are retained for as long as needed to maintain ongoing professional dialogue and project follow-up, or until you request their removal. Security rate-limit counters and duplicate message hashes expire automatically (rate limit windows expire after 10 minutes or 24 hours; idempotency hashes expire after 2 minutes).
            </p>
            <p>
              <strong className="text-text font-medium">Security Controls:</strong> All traffic is encrypted in transit using HTTPS/TLS. Form inputs undergo server-side schema validation via Zod, email header injection sanitization, HTML escaping to prevent cross-site scripting (XSS), and automated credential redaction in server error logs.
            </p>
          </div>
        </section>

        {/* 6. Cookies and Storage */}
        <section className="space-y-3">
          <h2 className="text-[20px] font-semibold text-text">
            6. Cookies and Local Storage
          </h2>
          <p className="text-base text-muted leading-[1.65]">
            This website does not use tracking cookies, advertising beacons, or third-party marketing identifiers. The only client-side storage used is a single browser <code className="font-mono text-[13px] text-text bg-surface px-1 py-0.5 rounded border border-border">localStorage</code> key (<code className="font-mono text-[13px] text-text bg-surface px-1 py-0.5 rounded border border-border">bs-theme</code>), which remembers your preference between dark and light color themes across page visits.
          </p>
        </section>

        {/* 7. Visitor Rights */}
        <section className="space-y-3">
          <h2 className="text-[20px] font-semibold text-text">
            7. Visitor Rights and Requests
          </h2>
          <p className="text-base text-muted leading-[1.65]">
            Depending on your jurisdiction, you may have rights under applicable data protection laws (such as the GDPR or CCPA/CPRA) regarding your personal information. These include the right to request access to the information you submitted, request corrections to inaccurate details, or request that I delete communications received from you.
          </p>
          <p className="text-base text-muted leading-[1.65]">
            To exercise any of these rights, please contact me directly at the email address below. Requests will be addressed promptly.
          </p>
        </section>

        {/* 8. Contact & Inquiries */}
        <section className="space-y-3 border-t border-border pt-8">
          <h2 className="text-[20px] font-semibold text-text">
            8. Contact Information
          </h2>
          <p className="text-base text-muted leading-[1.65]">
            If you have questions, feedback, or concerns regarding this Privacy Policy or how your submitted information is handled, please get in touch:
          </p>
          <div className="pt-1 text-base">
            <p className="text-muted">
              Abdulrahmon Sulaimon &mdash; Backend Software Engineer
            </p>
            <p className="pt-1">
              Email:{" "}
              <a
                href="mailto:abdulrahmonsulaimon60@gmail.com"
                className="text-text underline decoration-border underline-offset-[3px] hover:text-primary hover:decoration-primary transition-colors font-medium"
              >
                abdulrahmonsulaimon60@gmail.com
              </a>
            </p>
            <p className="text-muted pt-1">
              Website:{" "}
              <Link
                href="/"
                className="text-text underline decoration-border underline-offset-[3px] hover:text-primary hover:decoration-primary transition-colors"
              >
                abdulrahmon.tech
              </Link>
            </p>
          </div>
        </section>

        {/* Back navigation at bottom */}
        <div className="pt-6 border-t border-border">
          <Link
            href="/"
            className="text-muted hover:text-primary text-xs font-mono transition-colors inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            &larr; Back to Home
          </Link>
        </div>
      </article>
    </div>
  );
}
