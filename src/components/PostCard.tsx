import Link from "next/link";
import { PostItem } from "@/lib/content";
import { calculateReadingTime } from "@/lib/reading-time";
import CategoryBadge from "./CategoryBadge";

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
    <article className="border border-[var(--bs-border-color,#374151)] rounded-lg p-6 bg-body-tertiary hover:border-[var(--custom-green)] transition-all duration-300 flex flex-col h-full group">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs opacity-75 font-mono">
          <time dateTime={frontmatter.publishedAt.toISOString()}>
            {formattedDate}
          </time>
          <span>&bull;</span>
          <span>{readingTime} min read</span>
        </div>
        <CategoryBadge category={frontmatter.category} section="blog" />
      </div>

      <HeadingTag className="text-xl font-bold mb-2 group-hover:text-[var(--custom-green)] transition-colors">
        <Link href={`/blog/${slug}`} className="hover:underline text-inherit no-underline">
          {frontmatter.title}
        </Link>
      </HeadingTag>

      <p className="text-sm opacity-80 mb-4 line-clamp-3 flex-grow">
        {frontmatter.summary}
      </p>

      {resolvedChallenge && (
        <div className="mb-4 text-xs font-medium text-[var(--custom-green)]">
          <Link
            href={`/challenges/${resolvedChallenge.slug}`}
            className="hover:underline inline-flex items-center gap-1"
          >
            <span>Part of challenge: {resolvedChallenge.title} &rarr;</span>
          </Link>
        </div>
      )}

      {frontmatter.tags && frontmatter.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-4 border-t border-[var(--bs-border-color,#374151)]/50 mt-auto">
          {frontmatter.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded text-[11px] bg-[var(--bs-border-color,#374151)]/20 opacity-80"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
