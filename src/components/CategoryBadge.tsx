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
      className={`inline-flex items-center rounded-[6px] bg-secondary-tint text-secondary font-mono text-[12px] font-medium px-2.5 py-0.5 leading-tight hover:opacity-80 transition-opacity no-underline ${className}`}
    >
      {label}
    </Link>
  );
}
