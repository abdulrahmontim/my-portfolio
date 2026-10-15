"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem("bs-theme") as "dark" | "light") || "dark";
}

function getServerSnapshot(): "dark" | "light" {
  return "dark";
}

function ThemeIcon({ theme }: { theme: "dark" | "light" }) {
  if (theme === "light") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const toggleTheme = () => {
    const currentTheme =
      (typeof document !== "undefined" &&
        document.documentElement.getAttribute("data-bs-theme")) ||
      theme;
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-bs-theme", nextTheme);
    localStorage.setItem("bs-theme", nextTheme);
    window.dispatchEvent(new Event("storage"));
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const isChallengesActive =
    pathname === "/challenges" || pathname.startsWith("/challenges/");
  const isBlogActive = pathname === "/blog" || pathname.startsWith("/blog/");

  return (
    <header className="sticky top-0 z-50 h-[68px] border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="max-w-[1120px] mx-auto px-6 h-full flex items-center justify-between">
        {/* Left: Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          aria-label="Home"
          className="flex items-center rounded-lg focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          <Logo size={36} />
        </Link>

        {/* Right (Desktop): Nav links + Theme Toggle + Contact Button */}
        <nav
          className="hidden md:flex items-center gap-6 h-full"
          aria-label="Main navigation"
        >
          <Link
            href="/#skills"
            onClick={closeMenu}
            className="text-[15px] font-medium text-muted hover:text-text transition-colors h-[68px] flex items-center relative focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            Skills
          </Link>
          <Link
            href="/#projects"
            onClick={closeMenu}
            className="text-[15px] font-medium text-muted hover:text-text transition-colors h-[68px] flex items-center relative focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            Projects
          </Link>
          <Link
            href="/challenges"
            onClick={closeMenu}
            aria-current={isChallengesActive ? "page" : undefined}
            className={`text-[15px] font-medium transition-colors h-[68px] flex items-center relative focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
              isChallengesActive
                ? "text-text after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary"
                : "text-muted hover:text-text"
            }`}
          >
            Challenges
          </Link>
          <Link
            href="/blog"
            onClick={closeMenu}
            aria-current={isBlogActive ? "page" : undefined}
            className={`text-[15px] font-medium transition-colors h-[68px] flex items-center relative focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
              isBlogActive
                ? "text-text after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary"
                : "text-muted hover:text-text"
            }`}
          >
            Blog
          </Link>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            id="themeToggle"
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-muted hover:text-text hover:bg-surface border border-border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            aria-label="Toggle Theme"
            title={
              theme === "light"
                ? "Switch to dark theme"
                : "Switch to light theme"
            }
          >
            <ThemeIcon theme={theme} />
          </button>

          {/* Small primary Contact button */}
          <Link
            href="/#contact"
            onClick={closeMenu}
            className="h-[36px] px-5 rounded-[10px] bg-primary text-on-primary font-semibold text-[15px] inline-flex items-center justify-center hover:bg-primary-hover hover:-translate-y-[1px] transition-all focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            Contact
          </Link>
        </nav>

        {/* Mobile Controls (<768px): Theme toggle + Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-muted hover:text-text hover:bg-surface border border-border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            aria-label="Toggle Theme"
            title={
              theme === "light"
                ? "Switch to dark theme"
                : "Switch to light theme"
            }
          >
            <ThemeIcon theme={theme} />
          </button>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-muted hover:text-text hover:bg-surface border border-border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Sheet */}
      {isOpen && (
        <div
          id="mobile-navigation"
          className="absolute top-[68px] left-0 right-0 bg-surface border-b border-border shadow-2xl px-6 py-4 flex flex-col md:hidden animate-in slide-in-from-top-2 duration-150"
        >
          <Link
            href="/#skills"
            onClick={closeMenu}
            className="flex items-center h-[52px] text-[17px] font-medium text-muted hover:text-text border-b border-border/50 transition-colors"
          >
            Skills
          </Link>
          <Link
            href="/#projects"
            onClick={closeMenu}
            className="flex items-center h-[52px] text-[17px] font-medium text-muted hover:text-text border-b border-border/50 transition-colors"
          >
            Projects
          </Link>
          <Link
            href="/challenges"
            onClick={closeMenu}
            aria-current={isChallengesActive ? "page" : undefined}
            className={`flex items-center h-[52px] text-[17px] font-medium border-b border-border/50 transition-colors ${
              isChallengesActive ? "text-primary font-semibold" : "text-muted hover:text-text"
            }`}
          >
            Challenges
          </Link>
          <Link
            href="/blog"
            onClick={closeMenu}
            aria-current={isBlogActive ? "page" : undefined}
            className={`flex items-center h-[52px] text-[17px] font-medium border-b border-border/50 transition-colors ${
              isBlogActive ? "text-primary font-semibold" : "text-muted hover:text-text"
            }`}
          >
            Blog
          </Link>
          <Link
            href="/#contact"
            onClick={closeMenu}
            className="h-[44px] mt-4 flex items-center justify-center bg-primary text-on-primary rounded-[10px] font-semibold text-[15px] hover:bg-primary-hover transition-colors"
          >
            Contact
          </Link>
        </div>
      )}
    </header>
  );
}
