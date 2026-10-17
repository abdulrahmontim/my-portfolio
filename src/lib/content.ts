import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  PostFrontmatter,
  PostType,
  validatePostFrontmatter,
} from "./schemas";

export interface PostItem {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
  filePath: string;
}

export interface AdjacentItem {
  slug: string;
  title: string;
  type?: PostType;
  week?: number;
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

function loadAllPosts(): PostItem[] {
  const blogDir = path.join(process.cwd(), "content", "blog");
  const draftBlogDir = path.join(process.cwd(), "content", "drafts", "blog");

  const regularBlogFiles = getMdxFiles(blogDir);
  const devDraftBlogFiles = (!isProduction && fs.existsSync(draftBlogDir))
    ? getMdxFiles(draftBlogDir)
    : [];

  const allPosts: PostItem[] = [];

  for (const filePath of regularBlogFiles) {
    const rawContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(rawContent);
    const slug = path.basename(filePath, ".mdx");
    const frontmatter = validatePostFrontmatter(data, filePath);
    allPosts.push({
      slug,
      filePath,
      frontmatter,
      content,
    });
  }

  for (const filePath of devDraftBlogFiles) {
    const rawContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(rawContent);
    const slug = path.basename(filePath, ".mdx");
    const frontmatter = validatePostFrontmatter(
      { ...data, draft: true },
      filePath
    );
    allPosts.push({
      slug,
      filePath,
      frontmatter,
      content,
    });
  }

  // Filter out drafts in production
  const activePosts = isProduction
    ? allPosts.filter((p) => !p.frontmatter.draft)
    : allPosts;

  // Sort newest first
  activePosts.sort(
    (a, b) => b.frontmatter.publishedAt.getTime() - a.frontmatter.publishedAt.getTime()
  );

  return activePosts;
}

export function getAllPosts(options?: { type?: PostType }): PostItem[] {
  const posts = loadAllPosts();
  if (options?.type) {
    return posts.filter((p) => p.frontmatter.type === options.type);
  }
  return posts;
}

export function getPost(slug: string): PostItem | null {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug) || null;
}

export function getAdjacentPosts(slug: string): {
  prev: AdjacentItem | null;
  next: AdjacentItem | null;
} {
  const posts = getAllPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) {
    return { prev: null, next: null };
  }
  // posts is sorted descending by publishedAt (newest first)
  // prev = older post (earlier in time, higher index)
  // next = newer post (later in time, lower index)
  const prev =
    index < posts.length - 1
      ? {
          slug: posts[index + 1].slug,
          title: posts[index + 1].frontmatter.title,
          type: posts[index + 1].frontmatter.type,
          week: posts[index + 1].frontmatter.week,
        }
      : null;
  const next =
    index > 0
      ? {
          slug: posts[index - 1].slug,
          title: posts[index - 1].frontmatter.title,
          type: posts[index - 1].frontmatter.type,
          week: posts[index - 1].frontmatter.week,
        }
      : null;
  return { prev, next };
}
