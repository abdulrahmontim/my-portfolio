import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAdjacentChallenges, getAllChallenges, getChallenge } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import CategoryBadge from "@/components/CategoryBadge";
import StatusBadge from "@/components/StatusBadge";
import { mdxComponents, mdxRemoteOptions, getYouTubeId, YouTube } from "@/components/mdx-components";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const challenges = getAllChallenges();
  if (challenges.length === 0) {
    return [{ slug: "_empty" }];
  }
  return challenges.map((challenge) => ({
    slug: challenge.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const challenge = getChallenge(slug);

  if (!challenge) {
    return {
      title: "Challenge Not Found",
    };
  }

  const docTitle = `Week ${challenge.frontmatter.week}: ${challenge.frontmatter.title}`;
  const ogTitle = `${docTitle} | Abdulrahmon Sulaimon`;
  const description =
    challenge.frontmatter.summary.length > 155
      ? `${challenge.frontmatter.summary.slice(0, 152)}...`
      : challenge.frontmatter.summary;
  const url = `${SITE_URL}/challenges/${challenge.slug}`;

  return {
    title: docTitle,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: ogTitle,
      description,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
  };
}

export default async function ChallengeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const challenge = getChallenge(slug);

  if (!challenge) {
    notFound();
  }

  const { frontmatter, content, resolvedWriteup } = challenge;
  const { prev, next } = getAdjacentChallenges(slug);

  return (
    <article className="py-8 sm:py-12 max-w-3xl mx-auto">
      {/* Back button */}
      <div className="mb-8">
        <Link
          href="/challenges"
          className="text-sm font-semibold text-[var(--custom-green)] hover:underline inline-flex items-center gap-1.5"
        >
          <span>&larr; All challenges</span>
        </Link>
      </div>

      {/* Header metadata */}
      <header className="mb-8 pb-6 border-b border-[var(--bs-border-color,#374151)]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="text-sm font-bold uppercase tracking-wider text-[var(--custom-green)]">
            Week {frontmatter.week}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={frontmatter.status} />
            <CategoryBadge category={frontmatter.category} section="challenges" />
            <span className="text-xs px-2.5 py-0.5 rounded-full border border-[var(--bs-border-color,#374151)] opacity-75 capitalize">
              Difficulty: {frontmatter.difficulty}
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 leading-tight high-contrast-text">
          {frontmatter.title}
        </h1>

        <p className="text-lg opacity-85 leading-relaxed high-contrast-text mb-4">
          {frontmatter.summary}
        </p>

        {frontmatter.tags && frontmatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {frontmatter.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full text-xs bg-[var(--bs-border-color,#374151)]/20 opacity-80"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Highlighted "Goal" Block (Definition of Done) */}
      <div className="mb-8 p-5 rounded-lg border border-[var(--custom-green)]/30 bg-[var(--custom-green)]/5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--custom-green)]">
            Definition of Done (Goal)
          </span>
        </div>
        <p className="text-base font-medium high-contrast-text mb-0 leading-relaxed">
          {frontmatter.goal}
        </p>
      </div>

      {/* Optional Video Link / YouTube Embed */}
      {frontmatter.video && (() => {
        const ytId = getYouTubeId(frontmatter.video);
        if (ytId) {
          return (
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--custom-green)] block mb-2">
                Video Demonstration
              </span>
              <YouTube id={ytId} />
            </div>
          );
        }
        return (
          <div className="mb-8 p-4 rounded-lg border border-[var(--bs-border-color,#374151)] bg-body-tertiary flex items-center justify-between">
            <span className="text-sm font-semibold">Video Demonstration:</span>
            <a
              href={frontmatter.video}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-[var(--custom-green)] hover:underline"
            >
              Watch Video &rarr;
            </a>
          </div>
        );
      })()}

      {/* Cross-link box if it has a writeup */}
      {resolvedWriteup && (
        <aside className="deep-dive-box mb-8 p-4 rounded-r-lg border-l-4 border-[var(--custom-green)] bg-[var(--custom-green)]/5">
          <span className="text-xs uppercase font-bold tracking-wider text-[var(--custom-green)] block mb-1">
            Technical Write-Up Available
          </span>
          <div className="text-base font-medium">
            Read the full write-up for this challenge:{" "}
            <Link
              href={`/blog/${resolvedWriteup.slug}`}
              className="font-bold text-[var(--custom-green)] hover:underline"
            >
              {resolvedWriteup.title} &rarr;
            </Link>
          </div>
        </aside>
      )}

      {/* MDX Content Body */}
      <div className="prose dark:prose-invert max-w-none">
        <MDXRemote source={content} components={mdxComponents} options={mdxRemoteOptions} />
      </div>

      {/* Previous / Next Navigation */}
      {(prev || next) && (
        <nav className="mt-12 pt-8 border-t border-[var(--bs-border-color,#374151)] flex flex-wrap items-center justify-between gap-4">
          {prev ? (
            <Link
              href={`/challenges/${prev.slug}`}
              className="group flex flex-col text-left max-w-[45%] text-decoration-none no-underline"
            >
              <span className="text-xs uppercase tracking-wider text-[var(--custom-green)] font-semibold">
                &larr; Previous Challenge
              </span>
              <span className="text-sm font-medium high-contrast-text group-hover:underline line-clamp-1">
                Week {prev.week}: {prev.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/challenges/${next.slug}`}
              className="group flex flex-col text-right max-w-[45%] text-decoration-none no-underline ml-auto"
            >
              <span className="text-xs uppercase tracking-wider text-[var(--custom-green)] font-semibold">
                Next Challenge &rarr;
              </span>
              <span className="text-sm font-medium high-contrast-text group-hover:underline line-clamp-1">
                Week {next.week}: {next.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      )}
    </article>
  );
}
