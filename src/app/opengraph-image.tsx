import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/site";

export const alt = "Abdulrahmon Sulaimon | Backend Software Engineer";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
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
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#2ecc71",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Portfolio & Engineering Journal
          </div>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Abdulrahmon Sulaimon
          </div>
          <div
            style={{
              fontSize: "32px",
              color: "#9ca3af",
              fontWeight: 500,
            }}
          >
            Backend Software Engineer
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span>Python</span>
            <span>&bull;</span>
            <span>FastAPI</span>
            <span>&bull;</span>
            <span>Django</span>
            <span>&bull;</span>
            <span>Electronics</span>
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
