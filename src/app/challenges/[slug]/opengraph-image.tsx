import { ImageResponse } from "next/og";
import { getChallenge } from "@/lib/content";
import { CATEGORIES, CategoryKey, SITE_URL } from "@/lib/site";

export const alt = "Challenge | Abdulrahmon Sulaimon";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const challenge = getChallenge(slug);

  const title = challenge ? challenge.frontmatter.title : "Engineering Challenge";
  const truncatedTitle = title.length > 70 ? `${title.slice(0, 70)}...` : title;
  const categoryLabel = challenge
    ? (CATEGORIES[challenge.frontmatter.category as CategoryKey] || challenge.frontmatter.category)
    : "Engineering";
  const weekNumber = challenge ? challenge.frontmatter.week : 1;
  const status = challenge ? challenge.frontmatter.status.toUpperCase() : "IN PROGRESS";
  const displayUrl = SITE_URL.replace(/^https?:\/\//, "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          backgroundColor: "#0d1117",
          color: "#ffffff",
          fontFamily: "sans-serif",
          borderTop: "8px solid #2ecc71",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "#2ecc71",
                letterSpacing: "0.05em",
              }}
            >
              WEEK {weekNumber}
            </span>
            <span
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#2ecc71",
                backgroundColor: "rgba(46, 204, 113, 0.12)",
                padding: "6px 16px",
                borderRadius: "9999px",
                border: "1px solid rgba(46, 204, 113, 0.3)",
              }}
            >
              {categoryLabel}
            </span>
            <span
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#8b949e",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid #30363d",
              }}
            >
              STATUS: {status}
            </span>
          </div>

          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              marginTop: "10px",
            }}
          >
            {truncatedTitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "32px",
            borderTop: "1px solid #21262d",
            fontSize: "22px",
            color: "#8b949e",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontWeight: 600, color: "#e5e7eb" }}>Abdulrahmon Sulaimon</span>
            <span>&bull;</span>
            <span>Engineering Challenges</span>
          </div>
          <div style={{ color: "#2ecc71", fontWeight: 600 }}>
            {displayUrl}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
