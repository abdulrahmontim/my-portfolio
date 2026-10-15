import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const fontDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const fontSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-mono",
  display: "swap",
});
import { PALETTES } from "@/lib/palettes";
import { siteConfig, SITE_URL, ACTIVE_PALETTE } from "@/lib/site";

const palette = PALETTES[ACTIVE_PALETTE] || PALETTES.signal;
const themeCss = `
:root {
  --bg: ${palette.dark.bg};
  --surface: ${palette.dark.surface};
  --surface2: ${palette.dark.surface2};
  --border: ${palette.dark.border};
  --text: ${palette.dark.text};
  --muted: ${palette.dark.muted};
  --primary: ${palette.dark.primary};
  --on-primary: ${palette.dark.onPrimary};
  --secondary: ${palette.dark.secondary};
  --accent: ${palette.dark.accent};
}
[data-bs-theme="light"], html[data-bs-theme="light"] {
  --bg: ${palette.light.bg};
  --surface: ${palette.light.surface};
  --surface2: ${palette.light.surface2};
  --border: ${palette.light.border};
  --text: ${palette.light.text};
  --muted: ${palette.light.muted};
  --primary: ${palette.light.primary};
  --on-primary: ${palette.light.onPrimary};
  --secondary: ${palette.light.secondary};
  --accent: ${palette.light.accent};
}
`;

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;

const verification: Metadata["verification"] = {};
if (googleVerification) {
  verification.google = googleVerification;
}
if (bingVerification) {
  verification.other = {
    "msvalidate.01": bingVerification,
  };
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: siteConfig.title,
    template: "%s | Abdulrahmon Sulaimon",
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  alternates: {
    types: {
      "application/rss+xml": `${SITE_URL}/rss.xml`,
    },
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: SITE_URL,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  ...(Object.keys(verification).length > 0 ? { verification } : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-bs-theme="dark"
      className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body>
        <Script src="/theme-init.js" strategy="beforeInteractive" />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main-content" tabIndex={-1} className="w-full flex-1 focus:outline-none">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
