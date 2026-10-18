import { getAllPosts } from "@/lib/content";
import { CATEGORIES, CategoryKey, SITE_URL } from "@/lib/site";

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

export async function GET() {
  const posts = getAllPosts().slice(0, 20);

  const itemsXml = posts
    .map((post) => {
      const categoryLabel =
        CATEGORIES[post.frontmatter.category as CategoryKey] || post.frontmatter.category;
      return `    <item>
      <title>${escapeXml(post.frontmatter.title)}</title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <pubDate>${post.frontmatter.publishedAt.toUTCString()}</pubDate>
      <description>${escapeXml(post.frontmatter.summary)}</description>
      <category>${escapeXml(categoryLabel)}</category>
    </item>`;
    })
    .join("\n");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Abdulrahmon Sulaimon | Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Articles on backend engineering, electronics, embedded systems, and learning by Abdulrahmon Sulaimon.</description>
    <language>en-US</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${itemsXml ? `${itemsXml}\n  ` : "  "}</channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
