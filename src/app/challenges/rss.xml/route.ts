import { getAllChallenges } from "@/lib/content";
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
  const challenges = getAllChallenges().slice(0, 20);

  const itemsXml = challenges
    .map((challenge) => {
      const categoryLabel =
        CATEGORIES[challenge.frontmatter.category as CategoryKey] || challenge.frontmatter.category;
      const title = `Week ${challenge.frontmatter.week}: ${challenge.frontmatter.title}`;
      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${SITE_URL}/challenges/${challenge.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/challenges/${challenge.slug}</guid>
      <pubDate>${challenge.frontmatter.publishedAt.toUTCString()}</pubDate>
      <description>${escapeXml(challenge.frontmatter.summary)}</description>
      <category>${escapeXml(categoryLabel)}</category>
    </item>`;
    })
    .join("\n");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Abdulrahmon Sulaimon | Challenges</title>
    <link>${SITE_URL}/challenges</link>
    <description>Self-set engineering challenges across electronics, embedded systems, and software by Abdulrahmon Sulaimon.</description>
    <language>en-US</language>
    <atom:link href="${SITE_URL}/challenges/rss.xml" rel="self" type="application/rss+xml"/>
${itemsXml ? `${itemsXml}\n  ` : "  "}</channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
