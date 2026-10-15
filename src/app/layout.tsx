import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./bootstrap.min.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteConfig, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: siteConfig.title,
    template: "%s | Abdulrahmon Sulaimon",
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.png",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-bs-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('bs-theme')||'dark';document.documentElement.setAttribute('data-bs-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <Header />
        <div className="container">
          {children}
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
