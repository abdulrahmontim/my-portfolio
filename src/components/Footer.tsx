import Link from "next/link";
import { SOCIAL_LINKS } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border mt-auto py-8">
      <div className="max-w-[720px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
        <div className="flex items-center gap-3">
          <span>&copy; 2026 Abdulrahmon Sulaimon</span>
          <span aria-hidden="true">·</span>
          <Link
            href="/privacy"
            className="text-text underline decoration-border underline-offset-[3px] hover:text-primary hover:decoration-primary transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
        <div className="flex items-center gap-6">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text underline decoration-border underline-offset-[3px] hover:text-primary hover:decoration-primary transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
