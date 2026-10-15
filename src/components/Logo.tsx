import React from "react";
import Image from "next/image";

interface LogoProps {
  size?: number | string;
  className?: string;
}

export default function Logo({ size = 32, className = "" }: LogoProps) {
  const numericSize =
    typeof size === "number" ? size : parseInt(size as string, 10) || 32;
  const height = Math.round(numericSize * (1246 / 1505));

  return (
    <Image
      src="/logo.png"
      alt="Abdulrahmon Sulaimon"
      width={numericSize}
      height={height}
      className={`shrink-0 brand-logo dark:invert ${className}`}
      priority
    />
  );
}
