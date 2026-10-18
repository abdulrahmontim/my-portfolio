import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAdjacentPosts, getAllPosts, getPost } from "@/lib/content";
import { calculateReadingTime } from "@/lib/reading-time";
import { SITE_URL } from "@/lib/site";
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

async function MDXBody({ content }: { content: string }) {
  "use cache";
  return (
    <div className="prose">
      <MDXRemote
        source={content}
        components={mdxComponents}
        options={mdxRemoteOptions}
      />
    </div>
  );
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  const { frontmatter, content } = post;
  const readingTime = calculateReadingTime(content);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(frontmatter.publishedAt);

  const { prev, next } = getAdjacentPosts(slug);
  const isBuilding = frontmatter.status === "building";

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

      {/* Small muted "← Blog" link */}
      <div className="mb-6">
        <Link
          href="/blog"
          className="text-muted hover:text-primary text-xs font-mono transition-colors inline-flex items-center gap-1.5"
        >
          &larr; Blog
        </Link>
      </div>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-[32px] font-semibold text-text leading-[1.2] mb-3">
          {frontmatter.title}
        </h1>

        {/* Mono meta line: date · category · N min read, plus Challenge · Week N · status */}
        <div className="font-mono text-[12px] text-muted flex flex-wrap items-center gap-x-2 gap-y-1 mb-3">
          <time dateTime={frontmatter.publishedAt.toISOString()}>
            {formattedDate}
          </time>
          <span>·</span>
          <span className="capitalize">{frontmatter.category}</span>
          <span>·</span>
          <span>{readingTime} min read</span>
          {frontmatter.type === "challenge" && (
            <>
              <span>·</span>
              <span>Challenge</span>
              {frontmatter.week !== undefined && (
                <>
                  <span>·</span>
                  <span>Week {frontmatter.week}</span>
                </>
              )}
              {frontmatter.status && (
                <>
                  <span>·</span>
                  <span
                    className={
                      isBuilding ? "text-primary font-medium" : "text-muted"
                    }
                  >
                    {frontmatter.status}
                  </span>
                </>
              )}
            </>
          )}
        </div>

        {/* Tags as plain muted #tag text */}
        {frontmatter.tags && frontmatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-3 font-mono text-[12px] text-muted">
            {frontmatter.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        )}
      </header>

      {/* For challenges, a "Goal" block */}
      {frontmatter.type === "challenge" && frontmatter.goal && (
        <div className="py-4 my-8 border-y border-border space-y-2">
          <div className="font-mono text-[12px] uppercase text-muted tracking-wider">
            Goal
          </div>
          <p className="text-base text-text leading-[1.65]">
            {frontmatter.goal}
          </p>
        </div>
      )}

      {/* 16:9 video if present */}
      {frontmatter.type === "challenge" && frontmatter.video && (
        <div className="my-8 aspect-video w-full overflow-hidden border border-border">
          <iframe
            src={frontmatter.video}
            title={`${frontmatter.title} video`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* MDX prose */}
      <MDXBody content={content} />

      {/* Simple previous/next row */}
      {(prev || next) && (
        <nav className="mt-16 pt-8 border-t border-border flex items-center justify-between gap-4">
          {prev ? (
            <Link
              href={`/blog/${prev.slug}`}
              className="group flex flex-col text-left max-w-[48%] no-underline"
            >
              <span className="font-mono text-[12px] text-muted group-hover:text-primary transition-colors">
                &larr; Previous
              </span>
              <span className="text-sm text-text group-hover:text-primary transition-colors line-clamp-1 mt-1">
                {prev.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/blog/${next.slug}`}
              className="group flex flex-col text-right max-w-[48%] no-underline ml-auto"
            >
              <span className="font-mono text-[12px] text-muted group-hover:text-primary transition-colors">
                Next &rarr;
              </span>
              <span className="text-sm text-text group-hover:text-primary transition-colors line-clamp-1 mt-1">
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
