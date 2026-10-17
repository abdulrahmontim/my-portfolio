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
      className={`inline-flex items-center text-muted font-mono text-[12px] font-medium leading-tight hover:text-primary transition-colors no-underline ${className}`}
    >
      {label}
    </Link>
  );
}
