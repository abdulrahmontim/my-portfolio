import type { Metadata } from "next";
import { getAllPosts } from "@/lib/content";
import BlogList from "@/components/BlogList";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog | Abdulrahmon Sulaimon",
  description:
    "Writing on electronics, software architecture, backend engineering, psychology, and learning in public.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: "Blog | Abdulrahmon Sulaimon",
    description:
      "Writing on electronics, software architecture, backend engineering, psychology, and learning in public.",
    url: `${SITE_URL}/blog`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Abdulrahmon Sulaimon",
    description:
      "Writing on electronics, software architecture, backend engineering, psychology, and learning in public.",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="py-8 sm:py-12">
      <header className="mb-10 pb-6 border-b border-[var(--bs-border-color,#374151)]">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 high-contrast-text">
          Blog & Writing
        </h1>
        <p className="text-base sm:text-lg opacity-80 max-w-2xl high-contrast-text">
          Thoughts, technical deep dives, and reflections across backend systems, electronics, and engineering.
        </p>
      </header>

      <BlogList posts={posts} />
    </div>
  );
}
