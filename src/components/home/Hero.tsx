import Link from "next/link";
import { siteConfig } from "@/lib/site";

export default function Hero() {
  return (
    <section className="py-5 my-4 border-bottom">
      <div className="row align-items-center">
        <div className="col-lg-9">
          <h1 className="display-4 fw-bold high-contrast-text mb-2">{siteConfig.name}</h1>
          <h2 className="h3 fw-bold text-green mb-3">Backend Software Engineer</h2>

          <p className="fs-5 high-contrast-text mb-4" style={{ maxWidth: "800px", lineHeight: "1.6" }}>
            I&apos;m a Computer Engineering student with a background that started before university, in electronics, and now shows up in my engineering philosophy: I care about what happens when things go wrong, not just when they work.<br /><br />
            I build scalable, production-grade backend systems specializing in Python, FastAPI, Django.
          </p>

          <div className="d-flex flex-wrap gap-3">
            <Link href="/#contact" className="btn btn-green fw-bold px-4 py-2">Get in Touch</Link>
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-green fw-bold px-4 py-2"
            >
              GitHub
            </a>
            <a
              href={siteConfig.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-green fw-bold px-4 py-2"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
