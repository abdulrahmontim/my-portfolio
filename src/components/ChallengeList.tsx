"use client";

import { Suspense, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChallengeItem } from "@/lib/content";
import { CATEGORIES } from "@/lib/site";
import ChallengeCard from "./ChallengeCard";
import FilterBar, { FilterOption, TagOption } from "./FilterBar";
import Button from "@/components/ui/Button";

interface ChallengeListProps {
  challenges: ChallengeItem[];
}

function ChallengeListInner({ challenges }: ChallengeListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") || "";
  const activeTag = searchParams.get("tag") || "";
  const activeStatus = searchParams.get("status") || "";

  // Derive categories with counts from challenges
  const categories: FilterOption[] = useMemo(() => {
    return Object.entries(CATEGORIES)
      .map(([key, label]) => {
        const count = challenges.filter((c) => c.frontmatter.category === key).length;
        return { key, label, count };
      })
      .filter((cat) => cat.count > 0);
  }, [challenges]);

  // Derive statuses with counts from challenges
  const statuses: FilterOption[] = useMemo(() => {
    const statusKeys = ["planned", "building", "done"] as const;
    return statusKeys
      .map((key) => {
        const count = challenges.filter((c) => c.frontmatter.status === key).length;
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        return { key, label, count };
      })
      .filter((stat) => stat.count > 0);
  }, [challenges]);

  // Derive tags with counts from challenges
  const tags: TagOption[] = useMemo(() => {
    const map = new Map<string, number>();
    challenges.forEach((c) => {
      c.frontmatter.tags?.forEach((t) => {
        map.set(t, (map.get(t) || 0) + 1);
      });
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [challenges]);

  // Filtered challenges based on query params
  const filteredChallenges = useMemo(() => {
    return challenges.filter((challenge) => {
      if (activeCategory && challenge.frontmatter.category !== activeCategory) {
        return false;
      }
      if (activeTag && !challenge.frontmatter.tags?.includes(activeTag)) {
        return false;
      }
      if (activeStatus && challenge.frontmatter.status !== activeStatus) {
        return false;
      }
      return true;
    });
  }, [challenges, activeCategory, activeTag, activeStatus]);

  if (challenges.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-border rounded-[16px] bg-surface">
        <p className="text-base text-muted">No challenges logged yet. Stay tuned!</p>
      </div>
    );
  }

  return (
    <div>
      <FilterBar
        categories={categories}
        statuses={statuses}
        tags={tags}
        totalCount={challenges.length}
        filteredCount={filteredChallenges.length}
      />

      {filteredChallenges.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-[16px] bg-surface flex flex-col items-center gap-4">
          <p className="text-base text-muted">
            No challenges found matching the selected filters.
          </p>
          <Button
            size="sm"
            variant="primary"
            onClick={() => router.replace(pathname, { scroll: false })}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard key={challenge.slug} challenge={challenge} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChallengeList({ challenges }: ChallengeListProps) {
  if (challenges.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-border rounded-[16px] bg-surface">
        <p className="text-base text-muted">No challenges logged yet. Stay tuned!</p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.slug} challenge={challenge} />
          ))}
        </div>
      }
    >
      <ChallengeListInner challenges={challenges} />
    </Suspense>
  );
}
