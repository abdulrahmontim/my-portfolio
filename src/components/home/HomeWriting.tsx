import Link from "next/link";
import { getAllPosts } from "@/lib/content";
import PostCard from "@/components/PostCard";

export default function HomeWriting() {
  const posts = getAllPosts().slice(0, 3);
  if (posts.length === 0) {
    return null;
  }

  return (
    <section id="writing" className="w-full max-w-[1120px] mx-auto px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <span className="label">Writing</span>
          <h2 className="font-display font-bold text-[36px] text-text">
            Latest from the blog
          </h2>
        </div>
        <Link
          href="/blog"
          className="text-text underline decoration-border underline-offset-[3px] hover:text-primary hover:decoration-primary font-medium text-sm inline-flex items-center gap-1 transition-colors"
        >
          View all posts &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} headingLevel="h3" />
        ))}
      </div>
    </section>
  );
}
