import type { Metadata } from "next";
import "./bootstrap.min.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  icons: {
    icon: "/favicon.png",
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
      </body>
    </html>
  );
}
