import React from "react";
import Link from "next/link";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "sm";
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "default",
  href,
  target,
  rel,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold text-[15px] rounded-[10px] px-5 transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 select-none no-underline";

  const sizeClasses = size === "sm" ? "h-[36px]" : "h-[44px]";

  const variantClasses = {
    primary:
      "bg-primary text-on-primary hover:bg-primary-hover hover:-translate-y-px active:translate-y-0",
    secondary:
      "bg-transparent border border-secondary text-secondary hover:bg-secondary-tint",
    ghost:
      "bg-transparent text-text hover:text-primary",
  }[variant];

  const combinedClasses = `${baseClasses} ${sizeClasses} ${variantClasses} ${className}`.trim();

  if (href) {
    const isExternal =
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("mailto:");

    if (isExternal) {
      return (
        <a
          href={href}
          target={target}
          rel={rel || (target === "_blank" ? "noopener noreferrer" : undefined)}
          className={combinedClasses}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
}
