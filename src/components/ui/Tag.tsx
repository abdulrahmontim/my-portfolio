import React from "react";
import Link from "next/link";

export interface TagProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
}

export default function Tag({ children, href, className = "" }: TagProps) {
  const classes = `inline-flex items-center text-muted font-mono text-[12px] leading-tight ${
    href ? "hover:text-primary transition-colors cursor-pointer" : ""
  } ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return <span className={classes}>{children}</span>;
}
