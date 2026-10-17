import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllChallenges, getChallenge, getAdjacentChallenges } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import StatusBadge from "@/components/StatusBadge";
import CategoryBadge from "@/components/CategoryBadge";
import Tag from "@/components/ui/Tag";
import Card from "@/components/ui/Card";
import { getYouTubeId, mdxComponents, mdxRemoteOptions, YouTube } from "@/components/mdx-components";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const instant = false;

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
      type: "article",
      publishedTime: challenge.frontmatter.publishedAt.toISOString(),
      tags: challenge.frontmatter.tags,
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
    <article className="w-full max-w-[1120px] mx-auto px-6 py-12">
      {/* Muted mono back link */}
      <div className="mb-8">
        <Link
          href="/challenges"
          className="font-mono text-xs text-muted hover:text-text transition-colors inline-flex items-center gap-1.5"
        >
          <span>&larr; All challenges</span>
        </Link>
      </div>

      {/* Header metadata */}
      <header className="mb-10 pb-8 border-b border-border">
        {/* Meta row: mono week label, StatusBadge, category Tag, difficulty Tag */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="font-mono text-xs uppercase tracking-wider text-muted font-semibold">
            Week {frontmatter.week}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={frontmatter.status} />
            <CategoryBadge category={frontmatter.category} section="challenges" />
            <Tag>Difficulty: {frontmatter.difficulty}</Tag>
          </div>
        </div>

        <h1 className="font-display font-extrabold text-[36px] sm:text-[44px] lg:text-[52px] text-text max-w-[820px] leading-tight mb-4">
          {frontmatter.title}
        </h1>

        <p className="text-[18px] text-muted leading-relaxed max-w-2xl mb-6">
          {frontmatter.summary}
        </p>

        {/* Definition of Done Box (Card with accent border, mono label in accent, goal in 20px) */}
        <Card isLive={true} className="p-6 my-6">
          <span className="font-mono text-xs uppercase tracking-wider text-accent font-semibold block mb-2">
            Definition of Done
          </span>
          <p className="text-[20px] text-text font-medium leading-relaxed">
            {frontmatter.goal}
          </p>
        </Card>

        {/* Video slot (16:9, rounded 12px, bordered) when video exists */}
        {frontmatter.video && (() => {
          const ytId = getYouTubeId(frontmatter.video);
          if (ytId) {
            return (
              <div className="my-6 overflow-hidden rounded-[12px] border border-border aspect-video">
                <YouTube id={ytId} />
              </div>
            );
          }
          return (
            <div className="my-6 p-4 rounded-[12px] border border-border bg-surface flex items-center justify-between">
              <span className="text-sm font-semibold text-text">Video Demonstration:</span>
              <a
                href={frontmatter.video}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-accent hover:underline"
              >
                Watch Video &rarr;
              </a>
            </div>
          );
        })()}
      </header>

      {/* Main Body Grid with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: MDX Prose */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="prose max-w-none">
            <MDXRemote source={content} components={mdxComponents} options={mdxRemoteOptions} />
          </div>
        </div>

        {/* Right: Sidebar Card (sticky on desktop, below the body on mobile) */}
        <aside className="lg:col-span-4 lg:sticky lg:top-[88px] flex flex-col gap-4">
          <Card className="p-6 flex flex-col gap-5">
            {resolvedWriteup && (
              <div className="flex flex-col gap-2 pb-4 border-b border-border/50">
                <span className="label">Technical Write-up</span>
                <Link
                  href={`/blog/${resolvedWriteup.slug}`}
                  className="text-accent font-semibold text-[15px] hover:underline"
                >
                  {resolvedWriteup.title} &rarr;
                </Link>
              </div>
            )}
            <div className="flex flex-col gap-2.5">
              <span className="label">Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {frontmatter.tags.map((tag) => (
                  <Tag key={tag}>#{tag}</Tag>
                ))}
              </div>
            </div>
          </Card>
        </aside>
      </div>

      {/* Previous / Next Navigation */}
      {(prev || next) && (
        <nav className="mt-16 pt-8 border-t border-border flex flex-wrap items-center justify-between gap-4">
          {prev ? (
            <Link
              href={`/challenges/${prev.slug}`}
              className="group flex flex-col text-left max-w-[45%] no-underline"
            >
              <span className="font-mono text-xs uppercase tracking-wider text-muted font-semibold group-hover:text-primary transition-colors">
                &larr; Previous Challenge
              </span>
              <span className="text-sm font-medium text-text group-hover:underline line-clamp-1 mt-1">
                Week {prev.week}: {prev.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/challenges/${next.slug}`}
              className="group flex flex-col text-right max-w-[45%] no-underline ml-auto"
            >
              <span className="font-mono text-xs uppercase tracking-wider text-muted font-semibold group-hover:text-primary transition-colors">
                Next Challenge &rarr;
              </span>
              <span className="text-sm font-medium text-text group-hover:underline line-clamp-1 mt-1">
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
