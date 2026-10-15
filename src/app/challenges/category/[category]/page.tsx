import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllChallenges } from "@/lib/content";
import { CATEGORIES, CategoryKey, SITE_URL } from "@/lib/site";
import ChallengeCard from "@/components/ChallengeCard";

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const challenges = getAllChallenges();
  const activeCategories = Array.from(new Set(challenges.map((c) => c.frontmatter.category)));
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
  const title = `${label} - Challenges | Abdulrahmon Sulaimon`;
  const description = `Engineering challenges on ${label} by Abdulrahmon Sulaimon.`;
  const url = `${SITE_URL}/challenges/category/${category}`;

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

export default async function ChallengeCategoryPage({ params }: PageProps) {
  const { category } = await params;
  if (!(category in CATEGORIES)) {
    notFound();
  }
  const categoryKey = category as CategoryKey;
  const label = CATEGORIES[categoryKey];
  const allChallenges = getAllChallenges();
  const challenges = allChallenges.filter((c) => c.frontmatter.category === categoryKey);

  if (challenges.length === 0) {
    notFound();
  }

  return (
    <div className="py-8 sm:py-12">
      <div className="mb-6">
        <Link
          href="/challenges"
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
          {challenges.length} {challenges.length === 1 ? "challenge" : "challenges"} in this category
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map((challenge) => (
          <ChallengeCard key={challenge.slug} challenge={challenge} />
        ))}
      </div>
    </div>
  );
}
