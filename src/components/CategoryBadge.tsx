import Link from "next/link";
import { CATEGORIES, CategoryKey } from "@/lib/site";

interface CategoryBadgeProps {
  category: CategoryKey;
  section?: "blog" | "challenges";
  href?: string;
  className?: string;
}

export default function CategoryBadge({
  category,
  section = "blog",
  href,
  className = "",
}: CategoryBadgeProps) {
  const label = CATEGORIES[category] || category;
  const targetHref = href || `/${section}/category/${category}`;

  return (
    <Link
      href={targetHref}
      className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[var(--custom-green)]/10 text-[var(--custom-green)] border border-[var(--custom-green)]/20 hover:bg-[var(--custom-green)]/20 transition-colors text-decoration-none no-underline ${className}`}
    >
      {label}
    </Link>
  );
}
