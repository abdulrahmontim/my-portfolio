import React from "react";
import Link from "next/link";

export interface TagProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
}

export default function Tag({ children, href, className = "" }: TagProps) {
  const classes = `inline-flex items-center rounded-[6px] bg-secondary-tint text-secondary font-mono text-[12px] font-medium px-2.5 py-0.5 leading-tight ${
    href ? "hover:opacity-80 transition-opacity cursor-pointer" : ""
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
