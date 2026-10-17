import Card from "@/components/ui/Card";
import StatusBadge from "@/components/StatusBadge";
import { getCurrentChallenge } from "@/lib/content";

export default function HomeChallenge() {
  const currentChallenge = getCurrentChallenge();
  if (!currentChallenge) {
    return null;
  }

  const { slug, frontmatter } = currentChallenge;

  return (
    <section id="challenges" className="w-full max-w-[1120px] mx-auto px-6 py-10">
      <div className="flex flex-col gap-4">
        <span className="label">This week&apos;s challenge</span>
        <Card href={`/challenges/${slug}`} className="p-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="label">
                This week &middot; Week {frontmatter.week}
              </span>
              <StatusBadge status={frontmatter.status} />
            </div>

            <h3 className="font-display font-bold text-[28px] sm:text-[34px] text-text leading-tight group-hover:text-primary transition-colors">
              {frontmatter.title}
            </h3>

            <p className="text-[17px] text-muted leading-relaxed max-w-3xl">
              {frontmatter.summary}
            </p>

            <div className="pt-2">
              <span className="text-text font-medium text-[15px] underline decoration-border hover:text-primary hover:decoration-primary inline-flex items-center gap-1.5">
                Follow the build &rarr;
              </span>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
