import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { EMAIL_LINK } from "@/lib/site";

export default function Contact() {
  return (
    <section id="contact" className="w-full max-w-[1120px] mx-auto px-6 py-16">
      <Card className="text-center p-8 sm:p-12 max-w-2xl mx-auto flex flex-col items-center gap-4">
        <h2 className="font-display font-bold text-[32px] sm:text-[40px] text-text leading-tight">
          Let&apos;s build something reliable.
        </h2>
        <p className="text-muted text-[17px] leading-relaxed max-w-md">
          Open to backend engineering roles and internships.
        </p>
        <div className="pt-2">
          <Button href={EMAIL_LINK} variant="primary">
            Say hello &rarr;
          </Button>
        </div>
      </Card>
    </section>
  );
}
