import React from "react";
import Link from "next/link";

export interface CardProps {
  href?: string;
  className?: string;
  children: React.ReactNode;
  id?: string;
}

export default function Card({
  href,
  className = "",
  children,
  id,
}: CardProps) {
  const baseClasses =
    "rounded-[16px] p-6 bg-surface border border-border block";

  const hoverClasses = href
    ? "cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
    : "";

  const combinedClasses = `${baseClasses} ${hoverClasses} ${className}`.trim();

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
