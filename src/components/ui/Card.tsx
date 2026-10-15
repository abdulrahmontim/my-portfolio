import React from "react";
import Link from "next/link";

export interface CardProps {
  href?: string;
  isLive?: boolean;
  className?: string;
  children: React.ReactNode;
  id?: string;
}

export default function Card({
  href,
  isLive = false,
  className = "",
  children,
  id,
}: CardProps) {
  const baseClasses =
    "rounded-[16px] p-6 bg-surface border transition-all duration-200 block";

  const borderClass = isLive ? "border-accent-border" : "border-border";

  const hoverClasses = href
    ? "hover:-translate-y-[3px] hover:border-primary hover:bg-surface2 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
    : "";

  const combinedClasses = `${baseClasses} ${borderClass} ${hoverClasses} ${className}`.trim();

  if (href) {
    const isExternal =
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("mailto:");

    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={combinedClasses}
          id={id}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={combinedClasses} id={id}>
        {children}
      </Link>
    );
  }

  return (
    <div className={combinedClasses} id={id}>
      {children}
    </div>
  );
}
