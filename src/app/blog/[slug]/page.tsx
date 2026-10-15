import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAdjacentPosts, getAllPosts, getPost } from "@/lib/content";
import { calculateReadingTime } from "@/lib/reading-time";
import { SITE_URL } from "@/lib/site";
import CategoryBadge from "@/components/CategoryBadge";
import { mdxComponents, mdxRemoteOptions } from "@/components/mdx-components";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  if (posts.length === 0) {
    return [{ slug: "_empty" }];
  }
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const docTitle = post.frontmatter.title;
  const ogTitle = `${post.frontmatter.title} | Abdulrahmon Sulaimon`;
  const description =
    post.frontmatter.summary.length > 155
      ? `${post.frontmatter.summary.slice(0, 152)}...`
      : post.frontmatter.summary;
  const url = `${SITE_URL}/blog/${post.slug}`;

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
      publishedTime: post.frontmatter.publishedAt.toISOString(),
      tags: post.frontmatter.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  const { frontmatter, content, resolvedChallenge } = post;
  const readingTime = calculateReadingTime(content);
  const { prev, next } = getAdjacentPosts(slug);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(frontmatter.publishedAt);

  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: frontmatter.title,
    description: frontmatter.summary,
    datePublished: frontmatter.publishedAt.toISOString(),
    dateModified: frontmatter.publishedAt.toISOString(),
    url: `${SITE_URL}/blog/${slug}`,
    image: `${SITE_URL}/blog/${slug}/opengraph-image`,
    author: {
      "@type": "Person",
      name: "Abdulrahmon Sulaimon",
      url: SITE_URL,
    },
  };

  return (
    <article className="py-8 sm:py-12 max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />

      {/* Back button */}
      <div className="mb-8">
        <Link
          href="/blog"
          className="text-sm font-semibold text-[var(--custom-green)] hover:underline inline-flex items-center gap-1.5"
        >
          <span>&larr; All posts</span>
        </Link>
      </div>

      {/* Header metadata */}
      <header className="mb-8 pb-6 border-b border-[var(--bs-border-color,#374151)]">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm opacity-75 font-mono">
            <time dateTime={frontmatter.publishedAt.toISOString()}>
              {formattedDate}
            </time>
            <span>&bull;</span>
            <span>{readingTime} min read</span>
          </div>
          <CategoryBadge category={frontmatter.category} section="blog" />
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

      {/* Cross-link box if part of challenge */}
      {resolvedChallenge && (
        <aside className="deep-dive-box mb-8 p-4 rounded-r-lg border-l-4 border-[var(--custom-green)] bg-[var(--custom-green)]/5">
          <span className="text-xs uppercase font-bold tracking-wider text-[var(--custom-green)] block mb-1">
            Part of a Challenge
          </span>
          <div className="text-base font-medium">
            This article was written as the technical write-up for{" "}
            <Link
              href={`/challenges/${resolvedChallenge.slug}`}
              className="font-bold text-[var(--custom-green)] hover:underline"
            >
              {resolvedChallenge.title} &rarr;
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
              href={`/blog/${prev.slug}`}
              className="group flex flex-col text-left max-w-[45%] text-decoration-none no-underline"
            >
              <span className="text-xs uppercase tracking-wider text-[var(--custom-green)] font-semibold">
                &larr; Previous Post
              </span>
              <span className="text-sm font-medium high-contrast-text group-hover:underline line-clamp-1">
                {prev.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/blog/${next.slug}`}
              className="group flex flex-col text-right max-w-[45%] text-decoration-none no-underline ml-auto"
            >
              <span className="text-xs uppercase tracking-wider text-[var(--custom-green)] font-semibold">
                Next Post &rarr;
              </span>
              <span className="text-sm font-medium high-contrast-text group-hover:underline line-clamp-1">
                {next.title}
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
