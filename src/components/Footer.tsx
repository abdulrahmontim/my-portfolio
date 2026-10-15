import Link from "next/link";
import { siteConfig, SOCIAL_LINKS, EMAIL_LINK } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="py-4 mt-2 border-top text-center high-contrast-text">
      <div className="d-flex flex-wrap justify-content-center align-items-center gap-2">
        <span className="fw-medium">&copy; 2026 {siteConfig.name}. All rights reserved.</span>
        <span className="d-none d-sm-inline opacity-50">&bull;</span>
        <div className="d-inline-flex flex-wrap justify-content-center align-items-center gap-2">
          {SOCIAL_LINKS.map((link, idx) => (
            <span key={link.name} className="d-inline-flex align-items-center gap-2">
              {idx > 0 && <span className="opacity-50">&bull;</span>}
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green text-decoration-none fw-medium"
              >
                {link.name}
              </a>
            </span>
          ))}
          <span className="opacity-50">&bull;</span>
          <a
            href={EMAIL_LINK}
            className="text-green text-decoration-none fw-medium"
          >
            Email
          </a>
          <span className="opacity-50">&bull;</span>
          <Link
            href="/rss.xml"
            prefetch={false}
            className="text-green text-decoration-none fw-medium"
          >
            RSS
          </Link>
        </div>
      </div>
    </footer>
  );
}
