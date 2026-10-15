import type { Metadata } from "next";
import { getAllChallenges } from "@/lib/content";
import ChallengeList from "@/components/ChallengeList";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Challenges",
  description:
    "Self-set learn-and-build engineering projects across electronics, embedded systems, and software.",
  alternates: {
    canonical: `${SITE_URL}/challenges`,
  },
  openGraph: {
    title: "Challenges | Abdulrahmon Sulaimon",
    description:
      "Self-set learn-and-build engineering projects across electronics, embedded systems, and software.",
    url: `${SITE_URL}/challenges`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Challenges | Abdulrahmon Sulaimon",
    description:
      "Self-set learn-and-build engineering projects across electronics, embedded systems, and software.",
  },
};

export default function ChallengesPage() {
  const challenges = getAllChallenges();

  return (
    <div className="w-full max-w-[1120px] mx-auto px-6 py-12">
      <header className="mb-10 pb-6 border-b border-border">
        <h1 className="font-display font-bold text-[36px] sm:text-[48px] text-text tracking-tight mb-3 leading-tight">
          Engineering Challenges
        </h1>
        <p className="text-muted text-[17px] max-w-2xl leading-relaxed">
          Self-set learn-and-build projects designed to explore new concepts from first principles—spanning power electronics, embedded firmware, and distributed systems.
        </p>
      </header>

      <ChallengeList challenges={challenges} />
    </div>
  );
}
