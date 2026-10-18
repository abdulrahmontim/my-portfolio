import Link from "next/link";

export default function NotFound() {
  return (
    <div className="w-full max-w-[720px] mx-auto px-6 py-16 flex flex-col items-start gap-4">
      <span className="label">404 &bull; Page Not Found</span>
      <h1 className="text-[32px] leading-[1.2] font-semibold text-text">
        Page not found
      </h1>
      <p className="text-muted text-[16px] leading-[1.65]">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex items-center gap-4 pt-2">
        <Link
          href="/"
          className="text-text underline decoration-border underline-offset-[3px] hover:text-primary hover:decoration-primary transition-colors"
        >
          &larr; Home
        </Link>
        <Link
          href="/blog"
          className="text-text underline decoration-border underline-offset-[3px] hover:text-primary hover:decoration-primary transition-colors"
        >
          Blog
        </Link>
      </div>
    </div>
  );
}
