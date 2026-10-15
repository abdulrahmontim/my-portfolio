import { z } from "zod";
import { CATEGORIES, CategoryKey } from "./site";

const categoryKeys = Object.keys(CATEGORIES) as [CategoryKey, ...CategoryKey[]];
export const categorySchema = z.enum(categoryKeys);

export const challengeStatusSchema = z.enum(["planned", "building", "done"]);
export type ChallengeStatus = z.infer<typeof challengeStatusSchema>;

export const challengeDifficultySchema = z.enum(["easy", "medium", "hard"]);
export type ChallengeDifficulty = z.infer<typeof challengeDifficultySchema>;

export const challengeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  week: z.number().int().min(0, "Week must be a non-negative integer"),
  category: categorySchema,
  tags: z.array(z.string()).default([]),
  status: challengeStatusSchema,
  difficulty: challengeDifficultySchema,
  summary: z.string(),
  goal: z.string(),
  publishedAt: z.coerce.date(),
  draft: z.boolean().default(false),
  writeup: z.string().optional(),
  video: z.string().url("Video must be a valid URL").optional(),
});

export type ChallengeFrontmatter = z.infer<typeof challengeSchema>;

export const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string(),
  publishedAt: z.coerce.date(),
  category: categorySchema,
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  challenge: z.string().optional(),
});

export type PostFrontmatter = z.infer<typeof postSchema>;

export function validateChallengeFrontmatter(data: unknown, filePath: string): ChallengeFrontmatter {
  const result = challengeSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `Field "${issue.path.join(".")}": ${issue.message}`)
      .join("; ");
    throw new Error(`Validation failed for file "${filePath}": ${issues}`);
  }
  return result.data;
}

export function validatePostFrontmatter(data: unknown, filePath: string): PostFrontmatter {
  const result = postSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `Field "${issue.path.join(".")}": ${issue.message}`)
      .join("; ");
    throw new Error(`Validation failed for file "${filePath}": ${issues}`);
  }
  return result.data;
}
