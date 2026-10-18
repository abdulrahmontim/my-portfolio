import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
  --border: ${palette.dark.border};
  --text: ${palette.dark.text};
  --muted: ${palette.dark.muted};
  --primary: ${palette.dark.primary};
  --on-primary: ${palette.dark.onPrimary};
}
[data-bs-theme="light"], html[data-bs-theme="light"] {
  --bg: ${palette.light.bg};
  --surface: ${palette.light.surface};
  --border: ${palette.light.border};
  --text: ${palette.light.text};
  --muted: ${palette.light.muted};
  --primary: ${palette.light.primary};
  --on-primary: ${palette.light.onPrimary};
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
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
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
      className={`${fontSans.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("bs-theme")||"dark";document.documentElement.setAttribute("data-bs-theme",t);}catch(e){}`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
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
