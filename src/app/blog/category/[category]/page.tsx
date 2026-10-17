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
    <div className="w-full max-w-[1120px] mx-auto px-6 py-12">
      <div className="mb-8">
        <Link
          href="/blog"
          className="font-mono text-xs text-muted hover:text-text transition-colors inline-flex items-center gap-1.5"
        >
          <span>&larr; All categories</span>
        </Link>
      </div>

      <header className="mb-10 pb-6 border-b border-border">
        <h1 className="font-display font-bold text-[36px] sm:text-[48px] text-text tracking-tight mb-2 leading-tight">
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
