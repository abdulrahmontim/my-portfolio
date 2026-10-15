import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts } from "@/lib/content";
import { CATEGORIES, CategoryKey, SITE_URL } from "@/lib/site";
import PostCard from "@/components/PostCard";

interface PageProps {
  params: Promise<{ category: string }>;
}

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
  const title = `${label} - Blog | Abdulrahmon Sulaimon`;
  const description = `Articles and writing on ${label} by Abdulrahmon Sulaimon.`;
  const url = `${SITE_URL}/blog/category/${category}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
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
    <div className="py-8 sm:py-12">
      <div className="mb-6">
        <Link
          href="/blog"
          className="text-sm font-semibold text-[var(--custom-green)] hover:underline inline-flex items-center gap-1.5"
        >
          <span>&larr; All categories</span>
        </Link>
      </div>

      <header className="mb-10 pb-6 border-b border-[var(--bs-border-color,#374151)]">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 high-contrast-text">
          {label}
        </h1>
        <p className="text-sm opacity-75 font-mono">
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
