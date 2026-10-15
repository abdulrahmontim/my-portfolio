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

  return (
    <div className="mb-8 space-y-4 p-4 sm:p-5 rounded-lg border border-[var(--bs-border-color,#374151)] bg-body-tertiary">
      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--custom-green)] mr-1">
            Category:
          </span>
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
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              !activeCategory
                ? "bg-[var(--custom-green)] text-white shadow-sm"
                : "border border-[var(--bs-border-color,#374151)] bg-body opacity-85 hover:border-[var(--custom-green)]"
            }`}
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
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[var(--custom-green)] text-white shadow-sm"
                    : "border border-[var(--bs-border-color,#374151)] bg-body opacity-85 hover:border-[var(--custom-green)]"
                }`}
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
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--custom-green)] mr-1">
            Status:
          </span>
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
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              !activeStatus
                ? "bg-[var(--custom-green)] text-white shadow-sm"
                : "border border-[var(--bs-border-color,#374151)] bg-body opacity-85 hover:border-[var(--custom-green)]"
            }`}
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
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[var(--custom-green)] text-white shadow-sm"
                    : "border border-[var(--bs-border-color,#374151)] bg-body opacity-85 hover:border-[var(--custom-green)]"
                }`}
              >
                {stat.label} ({stat.count})
              </button>
            );
          })}
        </div>
      )}

      {/* Tag Filter */}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--bs-border-color,#374151)]/40">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--custom-green)] mr-1">
            Tags:
          </span>
          {tags.map((tag) => {
            const isActive = activeTag === tag.name;
            return (
              <button
                key={tag.name}
                type="button"
                aria-pressed={isActive}
                onClick={() => setFilter("tag", tag.name)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[var(--custom-green)] text-white shadow-sm font-semibold"
                    : "border border-[var(--bs-border-color,#374151)] bg-body opacity-75 hover:opacity-100 hover:border-[var(--custom-green)]"
                }`}
              >
                #{tag.name} ({tag.count})
              </button>
            );
          })}
        </div>
      )}

      {/* Filter Status Summary & Clear Action */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-[var(--bs-border-color,#374151)]/40 text-xs">
          <span className="opacity-80">
            Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> items
          </span>
          <button
            type="button"
            onClick={clearFilters}
            className="text-[var(--custom-green)] hover:underline font-semibold flex items-center gap-1"
          >
            <span>&times; Clear filters</span>
          </button>
        </div>
      )}
    </div>
  );
}
