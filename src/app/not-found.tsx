import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 sm:py-28 text-center max-w-xl mx-auto px-4">
      <p className="text-sm font-bold uppercase tracking-wider text-[var(--custom-green)] mb-3">
        404 &bull; Page Not Found
      </p>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight high-contrast-text mb-4">
        Lost in the circuits?
      </h1>
      <p className="text-base sm:text-lg opacity-80 high-contrast-text mb-8 leading-relaxed">
        The page you are looking for does not exist, has been moved, or is still a prototype on the breadboard.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="px-4 py-2 rounded-md font-medium bg-[var(--custom-green)] text-white hover:opacity-90 transition-opacity no-underline"
        >
          Return Home
        </Link>
        <Link
          href="/blog"
          className="px-4 py-2 rounded-md font-medium border border-[var(--bs-border-color,#374151)] hover:border-[var(--custom-green)] transition-colors no-underline text-inherit"
        >
          Read Blog
        </Link>
        <Link
          href="/challenges"
          className="px-4 py-2 rounded-md font-medium border border-[var(--bs-border-color,#374151)] hover:border-[var(--custom-green)] transition-colors no-underline text-inherit"
        >
          View Challenges
        </Link>
      </div>
    </div>
  );
}
