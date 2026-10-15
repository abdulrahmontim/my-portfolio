import Link from "next/link";
import { getCurrentChallenge } from "@/lib/content";
import StatusBadge from "@/components/StatusBadge";
import CategoryBadge from "@/components/CategoryBadge";

export default function HomeChallenge() {
  const currentChallenge = getCurrentChallenge();
  if (!currentChallenge) {
    return null;
  }

  const { slug, frontmatter } = currentChallenge;

  return (
    <section id="challenges" className="py-5 border-top">
      <h2 className="fw-bold section-title high-contrast-text mb-4">This Week&apos;s Challenge</h2>

      <div className="card project-card bg-body-tertiary border">
        <div className="card-body p-4 p-md-5 d-flex flex-column">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <span className="text-green fw-bold text-uppercase small">
              Week {frontmatter.week}
            </span>
            <div className="d-flex align-items-center gap-2">
              <StatusBadge status={frontmatter.status} />
              <CategoryBadge category={frontmatter.category} section="challenges" />
            </div>
          </div>

          <h3 className="h4 fw-bold card-title high-contrast-text mb-3">
            <Link href={`/challenges/${slug}`} className="text-inherit text-decoration-none">
              {frontmatter.title}
            </Link>
          </h3>

          <p className="card-text high-contrast-text mb-4 fs-5 opacity-90 leading-relaxed">
            {frontmatter.summary}
          </p>

          <div className="p-3 rounded border border-success border-opacity-25 bg-success bg-opacity-10 mb-4">
            <strong className="text-green d-block small text-uppercase fw-bold mb-1">
              Definition of Done (Goal):
            </strong>
            <span className="high-contrast-text">{frontmatter.goal}</span>
          </div>

          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-auto pt-3 border-top">
            <Link href={`/challenges/${slug}`} className="btn btn-green fw-bold px-4 py-2">
              View Challenge &rarr;
            </Link>
            <Link href="/challenges" className="text-green fw-bold text-decoration-none">
              All Challenges &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
