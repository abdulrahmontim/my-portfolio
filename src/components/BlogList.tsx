"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PostItem } from "@/lib/content";
import { CATEGORIES } from "@/lib/site";

interface BlogListProps {
  posts: PostItem[];
  initialCategory?: string;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function BlogListInner({ posts, initialCategory }: BlogListProps) {
  const searchParams = useSearchParams();
  const activeType = searchParams.get("type");
  const queryCategory = searchParams.get("category");
  const activeCategory = initialCategory || queryCategory || "";

  // Derive categories that have posts
  const categoriesWithPosts = useMemo(() => {
    return Object.entries(CATEGORIES)
      .map(([key, label]) => {
        const count = posts.filter((p) => p.frontmatter.category === key).length;
        return { key, label, count };
      })
      .filter((cat) => cat.count > 0);
  }, [posts]);

  // Filter posts based on active type or category
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (activeType === "challenge") {
        if (post.frontmatter.type !== "challenge") return false;
      }
      if (activeCategory) {
        if (post.frontmatter.category !== activeCategory) return false;
      }
      return true;
    });
  }, [posts, activeType, activeCategory]);

  const isAllActive = !activeType && !activeCategory;

  return (
    <div>
      {/* Filter row: plain text options */}
      <div className="flex flex-wrap items-center gap-6 text-sm mb-10 pb-3 border-b border-border">
        <Link
          href="/blog"
          className={
            isAllActive
              ? "text-text underline decoration-2 decoration-primary underline-offset-[6px] font-medium"
              : "text-muted hover:text-text transition-colors"
          }
        >
          All
        </Link>
        <Link
          href="/blog?type=challenge"
          className={
            activeType === "challenge"
              ? "text-text underline decoration-2 decoration-primary underline-offset-[6px] font-medium"
              : "text-muted hover:text-text transition-colors"
          }
        >
          Challenges
        </Link>
        {categoriesWithPosts.map((cat) => (
          <Link
            key={cat.key}
            href={`/blog/category/${cat.key}`}
            className={
              activeCategory === cat.key
                ? "text-text underline decoration-2 decoration-primary underline-offset-[6px] font-medium"
                : "text-muted hover:text-text transition-colors"
            }
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <p className="text-muted text-base py-8">
          No posts found.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {filteredPosts.map((post) => {
            const formattedDate = formatDate(post.frontmatter.publishedAt);
            const isBuilding = post.frontmatter.status === "building";

            return (
              <div
                key={post.slug}
                className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6"
              >
                {/* Fixed-width date column */}
                <time
                  dateTime={post.frontmatter.publishedAt.toISOString()}
                  className="w-28 shrink-0 font-mono text-[12px] text-muted"
                >
                  {formattedDate}
                </time>

                {/* Post details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group inline-block"
                    >
                      <h3 className="text-[17px] leading-[1.4] font-semibold text-text group-hover:text-primary transition-colors">
                        {post.frontmatter.title}
                      </h3>
                    </Link>

                    {post.frontmatter.type === "challenge" && (
                      <span className="inline-flex items-center gap-1.5 font-mono text-[12px]">
                        <span className="text-muted">Challenge</span>
                        {post.frontmatter.week !== undefined && (
                          <>
                            <span className="text-muted">·</span>
                            <span className="text-muted">
                              Week {post.frontmatter.week}
                            </span>
                          </>
                        )}
                        {post.frontmatter.status && (
                          <>
                            <span className="text-muted">·</span>
                            <span
                              className={
                                isBuilding
                                  ? "text-primary font-medium"
                                  : "text-muted"
                              }
                            >
                              {post.frontmatter.status}
                            </span>
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <p className="text-muted text-base leading-[1.65] truncate">
                    {post.frontmatter.summary}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function BlogList(props: BlogListProps) {
  return (
    <Suspense
      fallback={
        <div className="py-8 text-muted text-sm">
          Loading posts...
        </div>
      }
    >
      <BlogListInner {...props} />
    </Suspense>
  );
}
