import type { Metadata } from "next";
import { getAllPosts } from "@/lib/content";
import BlogList from "@/components/BlogList";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog",
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
    <div className="w-full max-w-[1120px] mx-auto px-6 py-12">
      <header className="mb-10 pb-6 border-b border-border">
        <h1 className="font-display font-bold text-[36px] sm:text-[48px] text-text tracking-tight mb-3 leading-tight">
          Blog &amp; Writing
        </h1>
        <p className="text-muted text-[17px] max-w-2xl leading-relaxed">
          Thoughts, technical deep dives, and reflections across backend systems, electronics, and engineering.
        </p>
      </header>

      <BlogList posts={posts} />
    </div>
  );
}
