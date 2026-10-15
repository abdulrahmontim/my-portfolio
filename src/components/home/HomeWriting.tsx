import Link from "next/link";
import { getAllPosts } from "@/lib/content";
import PostCard from "@/components/PostCard";

export default function HomeWriting() {
  const posts = getAllPosts().slice(0, 3);
  if (posts.length === 0) {
    return null;
  }

  return (
    <section id="writing" className="py-5 border-top">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <h2 className="fw-bold section-title high-contrast-text mb-0">Latest Writing</h2>
        <Link href="/blog" className="text-green fw-bold text-decoration-none d-none d-sm-inline-block">
          View all posts &rarr;
        </Link>
      </div>

      <div className="row g-4">
        {posts.map((post) => (
          <div key={post.slug} className="col-12 col-md-6 col-lg-4 d-flex">
            <div className="w-100">
              <PostCard post={post} />
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-4 pt-2 d-sm-none">
        <Link href="/blog" className="btn btn-outline-green fw-bold px-4 py-2">
          View all posts &rarr;
        </Link>
      </div>
    </section>
  );
}
