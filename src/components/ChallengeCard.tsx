import Link from "next/link";
import { ChallengeItem } from "@/lib/content";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";
import StatusBadge from "./StatusBadge";
import CategoryBadge from "./CategoryBadge";

interface ChallengeCardProps {
  challenge: ChallengeItem;
  headingLevel?: "h2" | "h3";
}

export default function ChallengeCard({ challenge, headingLevel = "h2" }: ChallengeCardProps) {
  const { slug, frontmatter, resolvedWriteup } = challenge;
  const HeadingTag = headingLevel;

  return (
    <Card href={`/challenges/${slug}`} className="flex flex-col h-full group">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="font-mono text-xs uppercase tracking-wider text-muted font-semibold">
          Week {frontmatter.week}
        </span>
        <div className="flex items-center gap-2">
          <StatusBadge status={frontmatter.status} />
          <CategoryBadge category={frontmatter.category} section="challenges" />
        </div>
      </div>

      <HeadingTag className="font-display font-bold text-[22px] text-text mb-2 group-hover:text-primary transition-colors leading-snug">
        {frontmatter.title}
      </HeadingTag>

      <p className="text-muted text-[15px] leading-relaxed mb-4 line-clamp-3 flex-grow">
        {frontmatter.summary}
      </p>

      {resolvedWriteup && (
        <div className="mb-4">
          <Link
            href={`/blog/${resolvedWriteup.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="text-accent hover:underline text-xs font-semibold inline-flex items-center gap-1"
          >
            <span>Read write-up: {resolvedWriteup.title} &rarr;</span>
          </Link>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-border/50 mt-auto text-xs">
        <span className="font-mono text-xs text-muted capitalize">
          Difficulty: <strong className="text-text font-semibold">{frontmatter.difficulty}</strong>
        </span>
        {frontmatter.tags && frontmatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {frontmatter.tags.map((tag) => (
              <Tag key={tag}>#{tag}</Tag>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
