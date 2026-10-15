export interface Tokens {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  text: string;
  muted: string;
  primary: string;
  onPrimary: string;
  secondary: string;
  accent: string;
}

export interface Palette {
  name: PaletteName;
  label: string;
  dark: Tokens;
  light: Tokens;
}

export type PaletteName = "signal" | "ember" | "ocean" | "violet";

export const PALETTES: Record<PaletteName, Palette> = {
  signal: {
    name: "signal",
    label: "Signal",
    dark: {
      bg: "#0A0F0D",
      surface: "#111915",
      surface2: "#17221D",
      border: "#23342C",
      text: "#E6F4ED",
      muted: "#8CA397",
      primary: "#00E599",
      onPrimary: "#03140C",
      secondary: "#7B93DB",
      accent: "#F5A623",
    },
    light: {
      bg: "#F6F8FA",
      surface: "#FFFFFF",
      surface2: "#EDF1F5",
      border: "#D0D7DE",
      text: "#0D1117",
      muted: "#57606A",
      primary: "#0B7A4B",
      onPrimary: "#FFFFFF",
      secondary: "#4353B3",
      accent: "#9A5B00",
    },
  },
  ember: {
    name: "ember",
    label: "Ember",
    dark: {
      bg: "#120D0A",
      surface: "#1C1410",
      surface2: "#271C17",
      border: "#3B2A22",
      text: "#F7EFEA",
      muted: "#A8988F",
      primary: "#FF6B35",
      onPrimary: "#1F0A02",
      secondary: "#4EA8DE",
      accent: "#FFB703",
    },
    light: {
      bg: "#FAF8F6",
      surface: "#FFFFFF",
      surface2: "#F2EDE9",
      border: "#DFD5CC",
      text: "#1C1512",
      muted: "#6E6259",
      primary: "#B8450A",
      onPrimary: "#FFFFFF",
      secondary: "#0B6C99",
      accent: "#8C5E00",
    },
  },
  ocean: {
    name: "ocean",
    label: "Ocean",
    dark: {
      bg: "#0A1018",
      surface: "#101A26",
      surface2: "#172435",
      border: "#22344A",
      text: "#E8F1F8",
      muted: "#8FA3B8",
      primary: "#4CC9F0",
      onPrimary: "#04131A",
      secondary: "#B79CFF",
      accent: "#FFD166",
    },
    light: {
      bg: "#F5F8FB",
      surface: "#FFFFFF",
      surface2: "#EBF1F7",
      border: "#CFDAE5",
      text: "#0E1721",
      muted: "#57697A",
      primary: "#0A6C8A",
      onPrimary: "#FFFFFF",
      secondary: "#563FB5",
      accent: "#8C5E00",
    },
  },
  violet: {
    name: "violet",
    label: "Violet",
    dark: {
      bg: "#0D0B14",
      surface: "#15121F",
      surface2: "#1E1A2C",
      border: "#2E2840",
      text: "#EEEAF7",
      muted: "#A097B8",
      primary: "#A78BFA",
      onPrimary: "#120A26",
      secondary: "#5EEAD4",
      accent: "#FBBF24",
    },
    light: {
      bg: "#F8F7FB",
      surface: "#FFFFFF",
      surface2: "#F0EDF6",
      border: "#D8D2E4",
      text: "#161224",
      muted: "#635B77",
      primary: "#5B37B8",
      onPrimary: "#FFFFFF",
      secondary: "#087368",
      accent: "#8A5800",
    },
  },
};

export const DEFAULT_PALETTE: PaletteName = "signal";

export function getActivePaletteName(): PaletteName {
  const envVal = process.env.NEXT_PUBLIC_PALETTE;
  if (envVal && envVal in PALETTES) {
    return envVal as PaletteName;
  }
  return DEFAULT_PALETTE;
}
