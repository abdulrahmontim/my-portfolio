import React from "react";

interface LogoProps {
  size?: number | string;
  className?: string;
}

export default function Logo({ size = 32, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="16" fill="var(--primary)" />
      <path
        d="M15 49 32 15 49 49M23 38h18"
        stroke="var(--on-primary)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="32" cy="15" r="5" fill="var(--accent)" />
    </svg>
  );
}
