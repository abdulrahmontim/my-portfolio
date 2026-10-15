import { siteConfig } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="py-4 mt-2 border-top text-center high-contrast-text">
      <p className="mb-0 fw-medium">&copy; 2026 {siteConfig.name}. All rights reserved.</p>
    </footer>
  );
}
