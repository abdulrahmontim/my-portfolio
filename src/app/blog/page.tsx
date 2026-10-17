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
    <div className="w-full max-w-[720px] mx-auto px-6 py-12">
      <header className="mb-8">
        <h1 className="text-[32px] font-semibold leading-[1.2] text-text">
          Blog
        </h1>
      </header>

      <BlogList posts={posts} />
    </div>
  );
}
