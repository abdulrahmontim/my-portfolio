import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPost } from "@/lib/content";
import CategoryBadge from "@/components/CategoryBadge";
import { mdxComponents } from "@/components/mdx-components";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
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

  return {
    title: `${post.frontmatter.title} | Abdulrahmon Sulaimon`,
    description: post.frontmatter.summary,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  const { frontmatter, content, resolvedChallenge } = post;
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(frontmatter.publishedAt);

  return (
    <article className="py-8 sm:py-12 max-w-3xl mx-auto">
      {/* Back button */}
      <div className="mb-8">
        <Link
          href="/blog"
          className="text-sm font-semibold text-[var(--custom-green)] hover:underline inline-flex items-center gap-1.5"
        >
          <span>&larr; Back to all articles</span>
        </Link>
      </div>

      {/* Header metadata */}
      <header className="mb-8 pb-6 border-b border-[var(--bs-border-color,#374151)]">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <time
            dateTime={frontmatter.publishedAt.toISOString()}
            className="text-sm opacity-75 font-mono"
          >
            {formattedDate}
          </time>
          <CategoryBadge category={frontmatter.category} />
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
        <MDXRemote source={content} components={mdxComponents} />
      </div>
    </article>
  );
}
