import type { Metadata } from "next";
import { getAllPosts } from "@/lib/content";
import PostCard from "@/components/PostCard";

export const metadata: Metadata = {
  title: "Blog | Abdulrahmon Sulaimon",
  description:
    "Writing on electronics, software architecture, backend engineering, psychology, and learning in public.",
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

      {posts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[var(--bs-border-color,#374151)] rounded-lg">
          <p className="text-base opacity-75 high-contrast-text">No articles published yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
