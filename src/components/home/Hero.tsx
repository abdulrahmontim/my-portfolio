import Pill from "@/components/ui/Pill";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="relative w-full py-16 sm:py-24 dot-grid border-b border-border">
      <div className="max-w-[1120px] mx-auto px-6 flex flex-col items-start gap-6">
        <Pill />
        <h1 className="text-[40px] sm:text-[56px] lg:text-[72px] font-extrabold text-text tracking-tight leading-[1.05] max-w-[860px]">
          Backend systems that hold up when things go wrong.
        </h1>
        <p className="text-[18px] sm:text-[20px] text-muted max-w-[620px] leading-relaxed">
          I&apos;m Abdulrahmon Sulaimon. I build with Python, FastAPI and Django, and my electronics background shapes how I think about failure.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button href="/#projects" variant="primary">
            See my work &rarr;
          </Button>
          <Button href="/challenges" variant="secondary">
            This week&apos;s challenge
          </Button>
          <Button href="/blog" variant="ghost">
            Read the blog
          </Button>
        </div>
      </div>
    </section>
  );
}
