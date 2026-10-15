"use client";

import { Suspense, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PostItem } from "@/lib/content";
import { CATEGORIES } from "@/lib/site";
import PostCard from "./PostCard";
import FilterBar, { FilterOption, TagOption } from "./FilterBar";

interface BlogListProps {
  posts: PostItem[];
}

function BlogListInner({ posts }: BlogListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") || "";
  const activeTag = searchParams.get("tag") || "";

  // Derive categories with counts from posts
  const categories: FilterOption[] = useMemo(() => {
    return Object.entries(CATEGORIES)
      .map(([key, label]) => {
        const count = posts.filter((p) => p.frontmatter.category === key).length;
        return { key, label, count };
      })
      .filter((cat) => cat.count > 0);
  }, [posts]);

  // Derive tags with counts from posts
  const tags: TagOption[] = useMemo(() => {
    const map = new Map<string, number>();
    posts.forEach((p) => {
      p.frontmatter.tags?.forEach((t) => {
        map.set(t, (map.get(t) || 0) + 1);
      });
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [posts]);

  // Filtered posts based on active query params
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (activeCategory && post.frontmatter.category !== activeCategory) {
        return false;
      }
      if (activeTag && !post.frontmatter.tags?.includes(activeTag)) {
        return false;
      }
      return true;
    });
  }, [posts, activeCategory, activeTag]);

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-[var(--bs-border-color,#374151)] rounded-lg">
        <p className="text-base opacity-75 high-contrast-text">No articles published yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div>
      <FilterBar
        categories={categories}
        tags={tags}
        totalCount={posts.length}
        filteredCount={filteredPosts.length}
      />

      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[var(--bs-border-color,#374151)] rounded-lg">
          <p className="text-base opacity-85 high-contrast-text mb-3">
            No posts found matching the selected filters.
          </p>
          <button
            type="button"
            onClick={() => router.replace(pathname, { scroll: false })}
            className="btn btn-sm btn-green fw-bold px-4"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BlogList({ posts }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-[var(--bs-border-color,#374151)] rounded-lg">
        <p className="text-base opacity-75 high-contrast-text">No articles published yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      }
    >
      <BlogListInner posts={posts} />
    </Suspense>
  );
}
