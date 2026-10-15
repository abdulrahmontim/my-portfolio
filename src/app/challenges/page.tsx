import type { Metadata } from "next";
import { getAllChallenges } from "@/lib/content";
import ChallengeCard from "@/components/ChallengeCard";

export const metadata: Metadata = {
  title: "Challenges | Abdulrahmon Sulaimon",
  description:
    "Self-set learn-and-build engineering projects across electronics, embedded systems, and software.",
};

export default function ChallengesPage() {
  const challenges = getAllChallenges();

  return (
    <div className="py-8 sm:py-12">
      <header className="mb-10 pb-6 border-b border-[var(--bs-border-color,#374151)]">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 high-contrast-text">
          Engineering Challenges
        </h1>
        <p className="text-base sm:text-lg opacity-80 max-w-2xl high-contrast-text">
          Self-set learn-and-build projects designed to explore new concepts from first principles—spanning power electronics, embedded firmware, and distributed systems.
        </p>
      </header>

      {challenges.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[var(--bs-border-color,#374151)] rounded-lg">
          <p className="text-base opacity-75 high-contrast-text">No challenges logged yet. Stay tuned!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.slug} challenge={challenge} />
          ))}
        </div>
      )}
    </div>
  );
}
