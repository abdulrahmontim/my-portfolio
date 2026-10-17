"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface FilterOption {
  key: string;
  label: string;
  count: number;
}

export interface TagOption {
  name: string;
  count: number;
}

interface FilterBarProps {
  categories: FilterOption[];
  tags: TagOption[];
  statuses?: FilterOption[];
  totalCount: number;
  filteredCount: number;
}

export default function FilterBar({
  categories,
  tags,
  statuses,
  totalCount,
  filteredCount,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") || "";
  const activeTag = searchParams.get("tag") || "";
  const activeStatus = searchParams.get("status") || "";

  const hasActiveFilters = Boolean(activeCategory || activeTag || activeStatus);

  const setFilter = (key: "category" | "tag" | "status", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentValue = params.get(key);

    if (currentValue === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  const clearFilters = () => {
    router.replace(pathname, { scroll: false });
  };

  const chipActiveClasses =
    "border-b-2 border-primary text-text font-mono text-xs font-medium pb-0.5 cursor-pointer";
  const chipInactiveClasses =
    "text-muted hover:text-text font-mono text-xs font-medium pb-0.5 transition-colors cursor-pointer";

  return (
    <div className="mb-8 space-y-4 p-5 rounded-[16px] border border-border bg-surface">
      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="label mr-1">Category:</span>
          <button
            type="button"
            aria-pressed={!activeCategory}
            onClick={() => {
              if (activeCategory) {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("category");
                const qs = params.toString();
                router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
              }
            }}
            className={!activeCategory ? chipActiveClasses : chipInactiveClasses}
          >
            All ({totalCount})
          </button>
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                aria-pressed={isActive}
                onClick={() => setFilter("category", cat.key)}
                className={isActive ? chipActiveClasses : chipInactiveClasses}
              >
                {cat.label} ({cat.count})
              </button>
            );
          })}
        </div>
      )}

      {/* Status Filter (challenges only) */}
      {statuses && statuses.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="label mr-1">Status:</span>
          <button
            type="button"
            aria-pressed={!activeStatus}
            onClick={() => {
              if (activeStatus) {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("status");
                const qs = params.toString();
                router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
              }
            }}
            className={!activeStatus ? chipActiveClasses : chipInactiveClasses}
          >
            All
          </button>
          {statuses.map((stat) => {
            const isActive = activeStatus === stat.key;
            return (
              <button
                key={stat.key}
                type="button"
                aria-pressed={isActive}
                onClick={() => setFilter("status", stat.key)}
                className={isActive ? chipActiveClasses : chipInactiveClasses}
              >
                {stat.label} ({stat.count})
              </button>
            );
          })}
        </div>
      )}

      {/* Tag Filter */}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/50">
          <span className="label mr-1">Tags:</span>
          {tags.map((tag) => {
            const isActive = activeTag === tag.name;
            return (
              <button
                key={tag.name}
                type="button"
                aria-pressed={isActive}
                onClick={() => setFilter("tag", tag.name)}
                className={isActive ? chipActiveClasses : chipInactiveClasses}
              >
                #{tag.name} ({tag.count})
              </button>
            );
          })}
        </div>
      )}

      {/* Filter Status Summary & Clear Action */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs font-mono">
          <span className="text-muted">
            Showing <strong className="text-text">{filteredCount}</strong> of <strong className="text-text">{totalCount}</strong> items
          </span>
          <button
            type="button"
            onClick={clearFilters}
            className="text-muted hover:text-text hover:underline font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>&times; Clear filters</span>
          </button>
        </div>
      )}
    </div>
  );
}
