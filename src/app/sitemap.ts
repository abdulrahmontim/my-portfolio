import type { MetadataRoute } from "next";
import { getAllChallenges, getAllPosts } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const challenges = getAllChallenges();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/challenges`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.frontmatter.publishedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const challengeRoutes: MetadataRoute.Sitemap = challenges.map((challenge) => ({
    url: `${SITE_URL}/challenges/${challenge.slug}`,
    lastModified: challenge.frontmatter.publishedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const postCategories = Array.from(new Set(posts.map((p) => p.frontmatter.category)));
  const challengeCategories = Array.from(new Set(challenges.map((c) => c.frontmatter.category)));

  const postCategoryRoutes: MetadataRoute.Sitemap = postCategories.map((category) => ({
    url: `${SITE_URL}/blog/category/${category}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const challengeCategoryRoutes: MetadataRoute.Sitemap = challengeCategories.map((category) => ({
    url: `${SITE_URL}/challenges/category/${category}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...postRoutes,
    ...challengeRoutes,
    ...postCategoryRoutes,
    ...challengeCategoryRoutes,
  ];
}
