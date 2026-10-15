import Link from "next/link";
import Logo from "@/components/Logo";
import { siteConfig, SOCIAL_LINKS, EMAIL_LINK } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-border mt-20">
      <div className="max-w-[1120px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Column 1: Brand (2fr) */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Logo size={28} />
              <span className="font-display font-bold text-lg text-text">
                {siteConfig.name}
              </span>
            </div>
            <p className="text-sm text-muted max-w-sm leading-relaxed">
              Backend engineer building reliable systems, and learning electronics by building it.
            </p>
          </div>

          {/* Column 2: Explore (1fr) */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[12px] uppercase tracking-wider text-muted font-medium">
              Explore
            </span>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link
                  href="/#projects"
                  className="text-muted hover:text-text transition-colors"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/challenges"
                  className="text-muted hover:text-text transition-colors"
                >
                  Challenges
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-muted hover:text-text transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/rss.xml"
                  prefetch={false}
                  className="text-muted hover:text-text transition-colors"
                >
                  RSS
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Elsewhere (1fr) */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[12px] uppercase tracking-wider text-muted font-medium">
              Elsewhere
            </span>
            <ul className="flex flex-col gap-2.5 text-sm">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-text transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={EMAIL_LINK}
                  className="text-muted hover:text-text transition-colors"
                >
                  Email
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <span>&copy; 2026 {siteConfig.name}</span>
          <span>Built with Next.js</span>
        </div>
      </div>
    </footer>
  );
}
