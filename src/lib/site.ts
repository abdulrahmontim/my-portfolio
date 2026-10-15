export const siteConfig = {
  name: "Abdulrahmon Sulaimon",
  title: "Abdulrahmon Sulaimon | Backend Engineer",
  description:
    "I'm a Computer Engineering student with a background in electronics building scalable, production-grade backend systems specializing in Python, FastAPI, Django.",
  url: "https://abdulrahmon-sulaimon.vercel.app",
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
