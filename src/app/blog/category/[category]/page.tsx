import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts } from "@/lib/content";
import { CATEGORIES, CategoryKey, SITE_URL } from "@/lib/site";
import PostCard from "@/components/PostCard";

interface PageProps {
  params: Promise<{ category: string }>;
}

export const instant = false;

export async function generateStaticParams() {
  const posts = getAllPosts();
  const activeCategories = Array.from(new Set(posts.map((p) => p.frontmatter.category)));
  if (activeCategories.length === 0) {
    return [{ category: "_empty" }];
  }
  return activeCategories.map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  if (!(category in CATEGORIES)) {
    return {
      title: "Category Not Found",
    };
  }
  const categoryKey = category as CategoryKey;
  const label = CATEGORIES[categoryKey];
  const docTitle = `${label} Posts`;
  const ogTitle = `${label} Posts | Abdulrahmon Sulaimon`;
  const description = `Articles and writing on ${label} by Abdulrahmon Sulaimon.`;
  const url = `${SITE_URL}/blog/category/${category}`;

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

export default async function BlogCategoryPage({ params }: PageProps) {
  const { category } = await params;
  if (!(category in CATEGORIES)) {
    notFound();
  }
  const categoryKey = category as CategoryKey;
  const label = CATEGORIES[categoryKey];
  const allPosts = getAllPosts();
  const posts = allPosts.filter((p) => p.frontmatter.category === categoryKey);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="w-full max-w-[720px] mx-auto px-6 py-12">
      <div className="mb-6">
        <Link
          href="/blog"
          className="text-text underline decoration-border underline-offset-[3px] hover:text-primary hover:decoration-primary font-mono text-xs transition-colors inline-flex items-center gap-1.5"
        >
          <span>&larr; All categories</span>
        </Link>
      </div>

      <header className="mb-8 pb-4 border-b border-border">
        <h1 className="text-[32px] font-semibold leading-[1.2] text-text mb-2">
          {label}
        </h1>
        <p className="text-xs font-mono text-muted">
          {posts.length} {posts.length === 1 ? "article" : "articles"} in this category
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
