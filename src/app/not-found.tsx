import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="w-full max-w-[1120px] mx-auto px-6 py-24 sm:py-32 text-center flex flex-col items-center">
      <span className="label mb-3">404 &bull; Page Not Found</span>
      <h1 className="font-display font-extrabold text-[36px] sm:text-[48px] text-text tracking-tight mb-4 leading-tight">
        Lost in the circuits?
      </h1>
      <p className="text-muted text-[17px] max-w-md mx-auto mb-8 leading-relaxed">
        The page you are looking for does not exist, has been moved, or is still a prototype on the breadboard.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button href="/" variant="primary">
          Home
        </Button>
        <Button href="/blog" variant="ghost">
          Blog
        </Button>
        <Button href="/challenges" variant="ghost">
          Challenges
        </Button>
      </div>
    </div>
  );
}
