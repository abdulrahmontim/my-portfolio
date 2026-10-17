import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAdjacentPosts, getAllPosts, getPost } from "@/lib/content";
import { calculateReadingTime } from "@/lib/reading-time";
import { SITE_URL } from "@/lib/site";
import CategoryBadge from "@/components/CategoryBadge";
import Tag from "@/components/ui/Tag";
import Card from "@/components/ui/Card";
import { mdxComponents, mdxRemoteOptions } from "@/components/mdx-components";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const instant = false;

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
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(frontmatter.publishedAt);

  const { prev, next } = getAdjacentPosts(slug);

  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: frontmatter.title,
    description: frontmatter.summary,
    datePublished: frontmatter.publishedAt.toISOString(),
    author: {
      "@type": "Person",
      name: "Abdulrahmon Sulaimon",
      url: SITE_URL,
    },
    url: `${SITE_URL}/blog/${post.slug}`,
    keywords: frontmatter.tags.join(", "),
  };

  return (
    <article className="w-full max-w-[720px] mx-auto px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />

      {/* Muted mono back link */}
      <div className="mb-6">
        <Link
          href="/blog"
          className="text-muted hover:text-primary text-xs font-mono transition-colors inline-flex items-center gap-1.5"
        >
          <span>&larr; Blog</span>
        </Link>
      </div>

      {/* Header metadata */}
      <header className="mb-10 pb-8 border-b border-border">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-muted">
            <time dateTime={frontmatter.publishedAt.toISOString()}>
              {formattedDate}
            </time>
            <span>&bull;</span>
            <span>{readingTime} min read</span>
          </div>
          <CategoryBadge category={frontmatter.category} section="blog" />
        </div>

        <h1 className="text-[32px] font-semibold text-text leading-[1.2] mb-4">
          {frontmatter.title}
        </h1>

        <p className="text-[18px] text-muted leading-relaxed max-w-2xl mb-6">
          {frontmatter.summary}
        </p>

        {frontmatter.tags && frontmatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {frontmatter.tags.map((tag) => (
              <Tag key={tag}>#{tag}</Tag>
            ))}
          </div>
        )}
      </header>

      {/* Cross-link box if part of challenge */}
      {resolvedChallenge && (
        <Card className="mb-10 p-5">
          <span className="font-mono text-xs uppercase tracking-wider text-muted font-semibold block mb-1">
            Part of a Challenge
          </span>
          <div className="text-[15px] text-text">
            This article was written as the technical write-up for{" "}
            <Link
              href={`/challenges/${resolvedChallenge.slug}`}
              className="font-medium text-text underline decoration-border hover:text-primary hover:decoration-primary inline-flex items-center gap-1"
            >
              <span>{resolvedChallenge.title} &rarr;</span>
            </Link>
          </div>
        </Card>
      )}

      {/* MDX Content Body */}
      <div className="prose max-w-3xl">
        <MDXRemote source={content} components={mdxComponents} options={mdxRemoteOptions} />
      </div>

      {/* Previous / Next Navigation */}
      {(prev || next) && (
        <nav className="mt-16 pt-8 border-t border-border flex flex-wrap items-center justify-between gap-4 max-w-3xl">
          {prev ? (
            <Link
              href={`/blog/${prev.slug}`}
              className="group flex flex-col text-left max-w-[45%] no-underline"
            >
              <span className="font-mono text-xs uppercase tracking-wider text-muted font-semibold group-hover:text-primary transition-colors">
                &larr; Previous Post
              </span>
              <span className="text-sm font-medium text-text group-hover:underline line-clamp-1 mt-1">
                {prev.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/blog/${next.slug}`}
              className="group flex flex-col text-right max-w-[45%] no-underline ml-auto"
            >
              <span className="font-mono text-xs uppercase tracking-wider text-muted font-semibold group-hover:text-primary transition-colors">
                Next Post &rarr;
              </span>
              <span className="text-sm font-medium text-text group-hover:underline line-clamp-1 mt-1">
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
