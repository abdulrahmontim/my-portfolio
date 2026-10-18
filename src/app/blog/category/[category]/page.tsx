import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts } from "@/lib/content";
import { CATEGORIES, CategoryKey, SITE_URL } from "@/lib/site";
import BlogList from "@/components/BlogList";

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
  const allPosts = getAllPosts();
  const categoryPosts = allPosts.filter((p) => p.frontmatter.category === categoryKey);

  if (categoryPosts.length === 0) {
    notFound();
  }

  return (
    <div className="w-full max-w-[720px] mx-auto px-6 py-12">
      <header className="mb-8">
        <h1 className="text-[32px] font-semibold leading-[1.2] text-text">
          Blog
        </h1>
      </header>

      <BlogList posts={allPosts} initialCategory={categoryKey} />
    </div>
  );
}
