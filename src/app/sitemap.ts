import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

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
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.frontmatter.publishedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const postCategories = Array.from(new Set(posts.map((p) => p.frontmatter.category)));

  const postCategoryRoutes: MetadataRoute.Sitemap = postCategories.map((category) => ({
    url: `${SITE_URL}/blog/category/${category}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...postRoutes,
    ...postCategoryRoutes,
  ];
}
