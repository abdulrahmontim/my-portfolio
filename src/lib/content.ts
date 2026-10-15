import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  ChallengeFrontmatter,
  PostFrontmatter,
  validateChallengeFrontmatter,
  validatePostFrontmatter,
} from "./schemas";

export interface ResolvedRef {
  slug: string;
  title: string;
}

export interface ChallengeItem {
  slug: string;
  frontmatter: ChallengeFrontmatter;
  content: string;
  filePath: string;
  resolvedWriteup?: ResolvedRef;
}

export interface PostItem {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
  filePath: string;
  resolvedChallenge?: ResolvedRef;
}

const isProduction = process.env.NODE_ENV === "production";

function getMdxFiles(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  return fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => path.join(dirPath, file));
}

function loadAllRawData() {
  const challengesDir = path.join(process.cwd(), "content", "challenges");
  const blogDir = path.join(process.cwd(), "content", "blog");
  const draftChallengesDir = path.join(process.cwd(), "content", "drafts", "challenges");
  const draftBlogDir = path.join(process.cwd(), "content", "drafts", "blog");

  // Collect challenge files
  let challengeFilePaths = getMdxFiles(challengesDir);
  if (!isProduction) {
    challengeFilePaths = challengeFilePaths.concat(getMdxFiles(draftChallengesDir));
  }

  // Collect blog files
  let blogFilePaths = getMdxFiles(blogDir);
  if (!isProduction) {
    blogFilePaths = blogFilePaths.concat(getMdxFiles(draftBlogDir));
  }

  // Parse and validate challenges
  const rawChallenges: Array<{
    slug: string;
    filePath: string;
    frontmatter: ChallengeFrontmatter;
    content: string;
  }> = [];

  for (const filePath of challengeFilePaths) {
    const rawContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(rawContent);
    const slug = path.basename(filePath, ".mdx");
    const frontmatter = validateChallengeFrontmatter(data, filePath);
    rawChallenges.push({ slug, filePath, frontmatter, content });
  }

  // Parse and validate posts
  const rawPosts: Array<{
    slug: string;
    filePath: string;
    frontmatter: PostFrontmatter;
    content: string;
  }> = [];

  for (const filePath of blogFilePaths) {
    const rawContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(rawContent);
    const slug = path.basename(filePath, ".mdx");
    const frontmatter = validatePostFrontmatter(data, filePath);

    // Filter out draft posts in production
    if (isProduction && frontmatter.draft) {
      continue;
    }

    rawPosts.push({ slug, filePath, frontmatter, content });
  }

  // Integrity checks & cross-referencing
  const postMap = new Map(rawPosts.map((p) => [p.slug, p]));
  const challengeMap = new Map(rawChallenges.map((c) => [c.slug, c]));

  // Check challenges referencing writeups
  const challenges: ChallengeItem[] = rawChallenges.map((c) => {
    let resolvedWriteup: ResolvedRef | undefined;
    if (c.frontmatter.writeup) {
      const referencedPost = postMap.get(c.frontmatter.writeup);
      if (!referencedPost) {
        throw new Error(
          `Integrity check failed: Challenge in "${c.filePath}" references writeup slug "${c.frontmatter.writeup}", but no matching post was found.`
        );
      }
      resolvedWriteup = {
        slug: referencedPost.slug,
        title: referencedPost.frontmatter.title,
      };
    }
    return {
      slug: c.slug,
      frontmatter: c.frontmatter,
      content: c.content,
      filePath: c.filePath,
      resolvedWriteup,
    };
  });

  // Check posts referencing challenges
  const posts: PostItem[] = rawPosts.map((p) => {
    let resolvedChallenge: ResolvedRef | undefined;
    if (p.frontmatter.challenge) {
      const referencedChallenge = challengeMap.get(p.frontmatter.challenge);
      if (!referencedChallenge) {
        throw new Error(
          `Integrity check failed: Post in "${p.filePath}" references challenge slug "${p.frontmatter.challenge}", but no matching challenge was found.`
        );
      }
      resolvedChallenge = {
        slug: referencedChallenge.slug,
        title: referencedChallenge.frontmatter.title,
      };
    }
    return {
      slug: p.slug,
      frontmatter: p.frontmatter,
      content: p.content,
      filePath: p.filePath,
      resolvedChallenge,
    };
  });

  // Sort challenges by week descending
  challenges.sort((a, b) => b.frontmatter.week - a.frontmatter.week);

  // Sort posts by publishedAt newest first
  posts.sort(
    (a, b) => b.frontmatter.publishedAt.getTime() - a.frontmatter.publishedAt.getTime()
  );

  return { challenges, posts };
}

export function getAllChallenges(): ChallengeItem[] {
  const { challenges } = loadAllRawData();
  return challenges;
}

export function getChallenge(slug: string): ChallengeItem | null {
  const challenges = getAllChallenges();
  return challenges.find((c) => c.slug === slug) || null;
}

export function getCurrentChallenge(): ChallengeItem | null {
  const challenges = getAllChallenges();
  if (challenges.length === 0) return null;
  const building = challenges.find((c) => c.frontmatter.status === "building");
  return building || challenges[0];
}

export function getAllPosts(): PostItem[] {
  const { posts } = loadAllRawData();
  return posts;
}

export function getPost(slug: string): PostItem | null {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug) || null;
}
