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
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith("_") || entry.name === "_templates") {
      continue;
    }
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...getMdxFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".mdx") && !entry.name.startsWith("_")) {
      files.push(fullPath);
    }
  }
  return files;
}

function loadAllRawData() {
  const challengesDir = path.join(process.cwd(), "content", "challenges");
  const blogDir = path.join(process.cwd(), "content", "blog");
  const draftChallengesDir = path.join(process.cwd(), "content", "drafts", "challenges");
  const draftBlogDir = path.join(process.cwd(), "content", "drafts", "blog");

  const regularChallengeFiles = getMdxFiles(challengesDir);
  const devDraftChallengeFiles = (!isProduction && fs.existsSync(draftChallengesDir))
    ? getMdxFiles(draftChallengesDir)
    : [];

  const regularBlogFiles = getMdxFiles(blogDir);
  const devDraftBlogFiles = (!isProduction && fs.existsSync(draftBlogDir))
    ? getMdxFiles(draftBlogDir)
    : [];

  interface RawChallenge {
    slug: string;
    filePath: string;
    frontmatter: ChallengeFrontmatter;
    content: string;
    isDraft: boolean;
  }

  const allRawChallenges: RawChallenge[] = [];

  for (const filePath of regularChallengeFiles) {
    const rawContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(rawContent);
    const slug = path.basename(filePath, ".mdx");
    const frontmatter = validateChallengeFrontmatter(data, filePath);
    allRawChallenges.push({
      slug,
      filePath,
      frontmatter,
      content,
      isDraft: Boolean(frontmatter.draft),
    });
  }

  for (const filePath of devDraftChallengeFiles) {
    const rawContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(rawContent);
    const slug = path.basename(filePath, ".mdx");
    const frontmatter = validateChallengeFrontmatter(data, filePath);
    allRawChallenges.push({
      slug,
      filePath,
      frontmatter,
      content,
      isDraft: true,
    });
  }

  interface RawPost {
    slug: string;
    filePath: string;
    frontmatter: PostFrontmatter;
    content: string;
    isDraft: boolean;
  }

  const allRawPosts: RawPost[] = [];

  for (const filePath of regularBlogFiles) {
    const rawContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(rawContent);
    const slug = path.basename(filePath, ".mdx");
    const frontmatter = validatePostFrontmatter(data, filePath);
    allRawPosts.push({
      slug,
      filePath,
      frontmatter,
      content,
      isDraft: Boolean(frontmatter.draft),
    });
  }

  for (const filePath of devDraftBlogFiles) {
    const rawContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(rawContent);
    const slug = path.basename(filePath, ".mdx");
    const frontmatter = validatePostFrontmatter(data, filePath);
    allRawPosts.push({
      slug,
      filePath,
      frontmatter,
      content,
      isDraft: true,
    });
  }

  const allPostsMap = new Map(allRawPosts.map((p) => [p.slug, p]));
  const allChallengesMap = new Map(allRawChallenges.map((c) => [c.slug, c]));

  // Integrity checks
  // 1. Challenges referencing writeups
  for (const c of allRawChallenges) {
    if (c.frontmatter.writeup) {
      const targetPost = allPostsMap.get(c.frontmatter.writeup);
      if (!targetPost) {
        throw new Error(
          `Integrity check failed: Challenge in "${c.filePath}" references writeup slug "${c.frontmatter.writeup}", but no matching post was found.`
        );
      }
      if (isProduction && !c.isDraft && targetPost.isDraft) {
        throw new Error(
          `"${c.filePath}" is published but links to unpublished "${c.frontmatter.writeup}"`
        );
      }
    }
  }

  // 2. Posts referencing challenges
  for (const p of allRawPosts) {
    if (p.frontmatter.challenge) {
      const targetChallenge = allChallengesMap.get(p.frontmatter.challenge);
      if (!targetChallenge) {
        throw new Error(
          `Integrity check failed: Post in "${p.filePath}" references challenge slug "${p.frontmatter.challenge}", but no matching challenge was found.`
        );
      }
      if (isProduction && !p.isDraft && targetChallenge.isDraft) {
        throw new Error(
          `"${p.filePath}" is published but links to unpublished "${p.frontmatter.challenge}"`
        );
      }
    }
  }

  // Filter for production vs dev
  const activeChallenges = isProduction
    ? allRawChallenges.filter((c) => !c.isDraft)
    : allRawChallenges;

  const activePosts = isProduction
    ? allRawPosts.filter((p) => !p.isDraft)
    : allRawPosts;

  const activePostMap = new Map(activePosts.map((p) => [p.slug, p]));
  const activeChallengeMap = new Map(activeChallenges.map((c) => [c.slug, c]));

  const challenges: ChallengeItem[] = activeChallenges.map((c) => {
    let resolvedWriteup: ResolvedRef | undefined;
    if (c.frontmatter.writeup) {
      const referencedPost = activePostMap.get(c.frontmatter.writeup);
      if (referencedPost) {
        resolvedWriteup = {
          slug: referencedPost.slug,
          title: referencedPost.frontmatter.title,
        };
      }
    }
    return {
      slug: c.slug,
      frontmatter: c.frontmatter,
      content: c.content,
      filePath: c.filePath,
      resolvedWriteup,
    };
  });

  const posts: PostItem[] = activePosts.map((p) => {
    let resolvedChallenge: ResolvedRef | undefined;
    if (p.frontmatter.challenge) {
      const referencedChallenge = activeChallengeMap.get(p.frontmatter.challenge);
      if (referencedChallenge) {
        resolvedChallenge = {
          slug: referencedChallenge.slug,
          title: referencedChallenge.frontmatter.title,
        };
      }
    }
    return {
      slug: p.slug,
      frontmatter: p.frontmatter,
      content: p.content,
      filePath: p.filePath,
      resolvedChallenge,
    };
  });

  challenges.sort((a, b) => b.frontmatter.week - a.frontmatter.week);
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
