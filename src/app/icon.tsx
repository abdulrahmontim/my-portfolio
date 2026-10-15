import { ImageResponse } from "next/og";
import { PALETTES } from "@/lib/palettes";
import { ACTIVE_PALETTE } from "@/lib/site";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  const palette = PALETTES[ACTIVE_PALETTE] || PALETTES.signal;
  const { primary, onPrimary, accent } = palette.dark;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="64" height="64" rx="16" fill={primary} />
          <path
            d="M15 49L32 15L49 49M23 38H41"
            stroke={onPrimary}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="32" cy="15" r="5" fill={accent} />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
