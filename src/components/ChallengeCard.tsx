import Link from "next/link";
import { ChallengeItem } from "@/lib/content";
import CategoryBadge from "./CategoryBadge";
import StatusBadge from "./StatusBadge";

interface ChallengeCardProps {
  challenge: ChallengeItem;
}

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const { slug, frontmatter, resolvedWriteup } = challenge;

  return (
    <article className="border border-[var(--bs-border-color,#374151)] rounded-lg p-6 bg-body-tertiary hover:border-[var(--custom-green)] transition-all duration-300 flex flex-col h-full group">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--custom-green)]">
          Week {frontmatter.week}
        </span>
        <div className="flex items-center gap-2">
          <StatusBadge status={frontmatter.status} />
          <CategoryBadge category={frontmatter.category} />
        </div>
      </div>

      <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--custom-green)] transition-colors">
        <Link href={`/challenges/${slug}`} className="hover:underline text-inherit no-underline">
          {frontmatter.title}
        </Link>
      </h3>

      <p className="text-sm opacity-80 mb-4 line-clamp-3 flex-grow">
        {frontmatter.summary}
      </p>

      {resolvedWriteup && (
        <div className="mb-4 text-xs font-medium text-[var(--custom-green)]">
          <Link
            href={`/blog/${resolvedWriteup.slug}`}
            className="hover:underline inline-flex items-center gap-1"
          >
            <span>Read write-up: {resolvedWriteup.title} &rarr;</span>
          </Link>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-[var(--bs-border-color,#374151)]/50 mt-auto text-xs">
        <span className="capitalize opacity-75">
          Difficulty: <strong className="opacity-100">{frontmatter.difficulty}</strong>
        </span>
        {frontmatter.tags && frontmatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
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
      </div>
    </article>
  );
}
