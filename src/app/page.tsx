import type { Metadata } from "next";
import { siteConfig, SITE_URL, SOCIAL_LINKS } from "@/lib/site";
import { projects } from "@/data/projects";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: {
    absolute: siteConfig.title,
  },
  description: siteConfig.description,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: SITE_URL,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

export default function Home() {
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Abdulrahmon Sulaimon",
    url: SITE_URL,
    jobTitle: "Backend Software Engineer",
    sameAs: SOCIAL_LINKS.map((link) => link.url),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <div className="max-w-[720px] mx-auto px-6 py-12 space-y-14">
        {/* 1. Intro */}
        <section className="space-y-4">
          <h1 className="text-[32px] leading-[1.2] font-semibold text-text">
            Abdulrahmon Sulaimon
          </h1>
          <p className="text-base text-muted leading-[1.65]">
            Backend Software Engineer
          </p>
          <p className="text-base text-text leading-[1.65]">
            I build scalable, production-grade backend systems with Python, FastAPI and Django.
          </p>
          <p className="text-base text-muted leading-[1.65]">
            Python · FastAPI · Django · PostgreSQL · Redis · C/C++ · SQL
          </p>
          <div className="flex flex-wrap items-center gap-6 pt-2 text-base">
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text underline decoration-border underline-offset-[3px] hover:text-primary hover:decoration-primary transition-colors"
            >
              GitHub
            </a>
            <a
              href={siteConfig.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text underline decoration-border underline-offset-[3px] hover:text-primary hover:decoration-primary transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={siteConfig.links.email}
              className="text-text underline decoration-border underline-offset-[3px] hover:text-primary hover:decoration-primary transition-colors"
            >
              Email
            </a>
          </div>
        </section>

        {/* 2. Work */}
        <section id="work" className="space-y-6">
          <div className="font-mono text-[12px] uppercase text-muted tracking-wider">
            Work
          </div>
          <div className="divide-y divide-border">
            {projects.map((project) => (
              <div
                key={project.title}
                className="py-6 first:pt-0 last:pb-0 space-y-2"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-[17px] leading-[1.4] font-semibold text-text">
                    {project.title}
                  </h3>
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text underline decoration-border underline-offset-[3px] hover:text-primary hover:decoration-primary transition-colors text-sm shrink-0"
                  >
                    Repo ↗
                  </a>
                </div>
                <p className="text-base text-muted leading-[1.65]">
                  {project.description}
                </p>
                <div className="text-sm text-muted">
                  {project.stack.join(" · ")}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Contact */}
        <section id="contact" className="space-y-6">
          <div className="font-mono text-[12px] uppercase text-muted tracking-wider">
            Contact
          </div>
          <p className="text-base text-muted leading-[1.65]">
            Open to backend engineering roles. Reach out using the form below or email me directly at{" "}
            <a
              href={siteConfig.links.email}
              className="text-text underline decoration-border underline-offset-[3px] hover:text-primary hover:decoration-primary transition-colors text-base"
            >
              {siteConfig.links.email.replace("mailto:", "")}
            </a>.
          </p>
          <ContactForm />
        </section>
      </div>
    </>
  );
}
