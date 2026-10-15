"use client";

import Link from "next/link";
import { PostItem } from "@/lib/content";
import { calculateReadingTime } from "@/lib/reading-time";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";

interface PostCardProps {
  post: PostItem;
  headingLevel?: "h2" | "h3";
}

export default function PostCard({ post, headingLevel = "h2" }: PostCardProps) {
  const { slug, frontmatter, content, resolvedChallenge } = post;
  const readingTime = calculateReadingTime(content);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(frontmatter.publishedAt);
  const HeadingTag = headingLevel;

  return (
    <Card href={`/blog/${slug}`} className="flex flex-col h-full group">
      {/* Mono meta row: category · date · N min read */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 font-mono text-xs text-muted">
          <span className="capitalize">{frontmatter.category}</span>
          <span>&middot;</span>
          <time dateTime={frontmatter.publishedAt.toISOString()}>
            {formattedDate}
          </time>
          <span>&middot;</span>
          <span>{readingTime} min read</span>
        </div>
      </div>

      <HeadingTag className="font-display font-bold text-[22px] text-text mb-2 group-hover:text-primary transition-colors leading-snug">
        {frontmatter.title}
      </HeadingTag>

      <p className="text-muted text-[15px] leading-relaxed mb-4 line-clamp-3 flex-grow">
        {frontmatter.summary}
      </p>

      {resolvedChallenge && (
        <div className="mb-4">
          <Link
            href={`/challenges/${resolvedChallenge.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="text-accent hover:underline text-xs font-semibold inline-flex items-center gap-1"
          >
            {resolvedChallenge.week !== undefined ? (
              <span>Part of week {resolvedChallenge.week} &rarr;</span>
            ) : (
              <span>Part of challenge: {resolvedChallenge.title} &rarr;</span>
            )}
          </Link>
        </div>
      )}

      {frontmatter.tags && frontmatter.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-4 border-t border-border/50 mt-auto">
          {frontmatter.tags.map((tag) => (
            <Tag key={tag}>#{tag}</Tag>
          ))}
        </div>
      )}
    </Card>
  );
}
