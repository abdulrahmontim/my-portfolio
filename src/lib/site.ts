const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://abdulrahmon-sulaimon.vercel.app";
export const SITE_URL = rawSiteUrl.replace(/\/+$/, "");

export const siteConfig = {
  name: "Abdulrahmon Sulaimon",
  title: "Abdulrahmon Sulaimon | Backend Software Engineer (Python, FastAPI, Django)",
  description:
    "Abdulrahmon Sulaimon is a Backend Software Engineer specializing in Python, FastAPI, and Django, building scalable systems with an electronics background.",
  url: SITE_URL,
  links: {
    github: "https://github.com/abdulrahmontim",
    linkedin: "https://www.linkedin.com/in/abdulrahmon-sulaimon",
    youtube: "https://www.youtube.com/@abdulrahmontim",
    email: "mailto:abdulrahmonsulaimon60@gmail.com",
  },
};

export const SOCIAL_LINKS = [
  { name: "GitHub", url: "https://github.com/abdulrahmontim" },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/abdulrahmon-sulaimon" },
  { name: "YouTube", url: "https://www.youtube.com/@abdulrahmontim" },
] as const;

export const EMAIL_LINK = "mailto:abdulrahmonsulaimon60@gmail.com";

export const CATEGORIES = {
  electronics: "Electronics",
  embedded: "Embedded",
  software: "Software",
  psychology: "Psychology",
  career: "Career & Learning",
  other: "Other",
} as const;

export type CategoryKey = keyof typeof CATEGORIES;
