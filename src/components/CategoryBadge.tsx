import { CATEGORIES, CategoryKey } from "@/lib/site";

interface CategoryBadgeProps {
  category: CategoryKey;
  className?: string;
}

export default function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  const label = CATEGORIES[category] || category;

  return (
    <span
      className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[var(--custom-green)]/10 text-[var(--custom-green)] border border-[var(--custom-green)]/20 ${className}`}
    >
      {label}
    </span>
  );
}
