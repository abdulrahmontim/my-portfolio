# Theming & Palette System

This site features a centralized, token-based palette system. Every color across the entire site is controlled through design tokens mapped to CSS custom properties.

## Golden Rule
**Colours live ONLY in `src/lib/palettes.ts`.**
No hex, rgb, hsl, or arbitrary color values are permitted in page files, components, or style sheets.

---

## Available Palettes
1. **signal** (default) - Modern terminal emerald/mint primary with slate surfaces and amber accents.
2. **ember** - Warm charcoal with fiery orange primary, blue secondary, and gold accents.
3. **ocean** - Deep navy with cyan primary, soft purple secondary, and warm amber accents.
4. **violet** - Dark amethyst with lavender primary, teal secondary, and golden amber accents.

Each palette defines both a `dark` mode and a `light` mode token set satisfying WCAG AA contrast (minimum 4.5:1 for body and text elements).

---

## How to Switch Palettes

### Option 1: Environment Variable (Recommended for Deployments)
Set the `NEXT_PUBLIC_PALETTE` environment variable in your local `.env.local` or in Vercel project settings:
```bash
NEXT_PUBLIC_PALETTE=ember
# Options: signal | ember | ocean | violet
```

### Option 2: Default Setting in Code
Edit `src/lib/palettes.ts` and update `DEFAULT_PALETTE`:
```typescript
export const DEFAULT_PALETTE: PaletteName = "signal";
```

---

## How to Add a New Palette
1. Open `src/lib/palettes.ts`.
2. Add your new palette name to the `PaletteName` type union:
   ```typescript
   export type PaletteName = "signal" | "ember" | "ocean" | "violet" | "nord";
   ```
3. Add a corresponding palette definition entry to `PALETTES` with both `dark` and `light` token sets:
   ```typescript
   nord: {
     name: "nord",
     label: "Nord",
     dark: {
       bg: "#2E3440",
       surface: "#3B4252",
       surface2: "#434C5E",
       border: "#4C566A",
       text: "#ECEFF4",
       muted: "#D8DEE9",
       primary: "#88C0D0",
       onPrimary: "#2E3440",
       secondary: "#81A1C1",
       accent: "#EBCB8B",
     },
     light: {
       ...
     },
   },
   ```
4. Verify all text and interactive tokens achieve at least 4.5:1 contrast against their respective backgrounds.
