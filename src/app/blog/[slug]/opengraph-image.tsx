import { ImageResponse } from "next/og";
import { getPost } from "@/lib/content";
import { CATEGORIES, CategoryKey, SITE_URL, ACTIVE_PALETTE } from "@/lib/site";
import { PALETTES } from "@/lib/palettes";

export const alt = "Blog Post | Abdulrahmon Sulaimon";
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
  const post = getPost(slug);

  const title = post ? post.frontmatter.title : "Blog Post";
  const truncatedTitle = title.length > 70 ? `${title.slice(0, 70)}...` : title;
  const categoryLabel = post
    ? (CATEGORIES[post.frontmatter.category as CategoryKey] || post.frontmatter.category)
    : "Engineering";
  const displayUrl = SITE_URL.replace(/^https?:\/\//, "");

  const palette = PALETTES[ACTIVE_PALETTE] || PALETTES.signal;
  const { bg, text, muted, primary, border } = palette.dark;

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
          backgroundColor: bg,
          color: text,
          fontFamily: "sans-serif",
          borderTop: `8px solid ${primary}`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: primary,
                padding: "6px 16px",
                borderRadius: "9999px",
                border: `1px solid ${border}`,
              }}
            >
              {categoryLabel}
            </span>
            <span style={{ fontSize: "20px", color: muted }}>Blog Article</span>
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
            borderTop: `1px solid ${border}`,
            fontSize: "22px",
            color: muted,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontWeight: 600, color: text }}>Abdulrahmon Sulaimon</span>
            <span>&bull;</span>
            <span>Backend Software Engineer</span>
          </div>
          <div style={{ color: primary, fontWeight: 600 }}>
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
