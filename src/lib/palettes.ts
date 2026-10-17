export interface Tokens {
  bg: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  primary: string;
  onPrimary: string;
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
      border: "#23342C",
      text: "#E6F4ED",
      muted: "#8CA397",
      primary: "#00E599",
      onPrimary: "#03140C",
    },
    light: {
      bg: "#F6F8FA",
      surface: "#FFFFFF",
      border: "#D0D7DE",
      text: "#0D1117",
      muted: "#57606A",
      primary: "#0B7A4B",
      onPrimary: "#FFFFFF",
    },
  },
  ember: {
    name: "ember",
    label: "Ember",
    dark: {
      bg: "#120D0A",
      surface: "#1C1410",
      border: "#3B2A22",
      text: "#F7EFEA",
      muted: "#A8988F",
      primary: "#FF6B35",
      onPrimary: "#1F0A02",
    },
    light: {
      bg: "#FAF8F6",
      surface: "#FFFFFF",
      border: "#DFD5CC",
      text: "#1C1512",
      muted: "#6E6259",
      primary: "#B8450A",
      onPrimary: "#FFFFFF",
    },
  },
  ocean: {
    name: "ocean",
    label: "Ocean",
    dark: {
      bg: "#0A1018",
      surface: "#101A26",
      border: "#22344A",
      text: "#E8F1F8",
      muted: "#8FA3B8",
      primary: "#4CC9F0",
      onPrimary: "#04131A",
    },
    light: {
      bg: "#F5F8FB",
      surface: "#FFFFFF",
      border: "#CFDAE5",
      text: "#0E1721",
      muted: "#57697A",
      primary: "#0A6C8A",
      onPrimary: "#FFFFFF",
    },
  },
  violet: {
    name: "violet",
    label: "Violet",
    dark: {
      bg: "#0D0B14",
      surface: "#15121F",
      border: "#2E2840",
      text: "#EEEAF7",
      muted: "#A097B8",
      primary: "#A78BFA",
      onPrimary: "#120A26",
    },
    light: {
      bg: "#F8F7FB",
      surface: "#FFFFFF",
      border: "#D8D2E4",
      text: "#161224",
      muted: "#635B77",
      primary: "#5B37B8",
      onPrimary: "#FFFFFF",
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
