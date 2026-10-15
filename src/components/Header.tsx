"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";

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

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = () => {
    const currentTheme = (typeof document !== "undefined" && document.documentElement.getAttribute("data-bs-theme")) || theme;
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-bs-theme", nextTheme);
    localStorage.setItem("bs-theme", nextTheme);
    window.dispatchEvent(new Event("storage"));
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg border-bottom sticky-top bg-body">
      <div className="container">
        <Link className="navbar-brand" href="#">
          {/* Plain img used to match exact rendering and CSS inversion transitions */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="AR Logo" height={40} style={{ height: "40px", width: "auto" }} className="brand-logo" />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-controls="navbarNav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`} id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-3 pt-3 pt-lg-0">
            <li className="nav-item">
              <Link className="nav-link fw-medium high-contrast-text" href="/#skills" onClick={closeMenu}>
                Skills
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium high-contrast-text" href="/#projects" onClick={closeMenu}>
                Projects
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium high-contrast-text" href="/challenges" onClick={closeMenu}>
                Challenges
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium high-contrast-text" href="/blog" onClick={closeMenu}>
                Blog
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium high-contrast-text" href="/#contact" onClick={closeMenu}>
                Contact
              </Link>
            </li>
            <li className="nav-item ms-lg-2">
              <button
                className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                id="themeToggle"
                style={{ width: "40px", height: "40px" }}
                aria-label="Toggle Theme"
                onClick={toggleTheme}
              >
                {theme === "light" ? (
                  <svg
                    id="themeIcon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                ) : (
                  <svg
                    id="themeIcon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
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
                )}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
