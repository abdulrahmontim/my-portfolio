import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import Skills from "@/components/home/Skills";
import Projects from "@/components/home/Projects";
import HomeChallenge from "@/components/home/HomeChallenge";
import HomeWriting from "@/components/home/HomeWriting";
import Contact from "@/components/home/Contact";
import { siteConfig, SOCIAL_LINKS, SITE_URL } from "@/lib/site";

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
      <Hero />
      <Skills />
      <Projects />
      <HomeChallenge />
      <HomeWriting />
      <Contact />
    </>
  );
}
