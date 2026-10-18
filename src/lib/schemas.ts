import { z } from "zod";
import { CATEGORIES, CategoryKey } from "./site";

const categoryKeys = Object.keys(CATEGORIES) as [CategoryKey, ...CategoryKey[]];
export const categorySchema = z.enum(categoryKeys);

export const postTypeSchema = z.enum(["post", "challenge"]);
export type PostType = z.infer<typeof postTypeSchema>;

export const challengeStatusSchema = z.enum(["planned", "building", "done"]);
export type ChallengeStatus = z.infer<typeof challengeStatusSchema>;

export const challengeDifficultySchema = z.enum(["easy", "medium", "hard"]);
export type ChallengeDifficulty = z.infer<typeof challengeDifficultySchema>;

export const postSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    summary: z.string().min(1, "Summary is required"),
    publishedAt: z.coerce.date(),
    category: categorySchema,
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    type: postTypeSchema.default("post"),

    // Challenge-only optional fields
    goal: z.string().optional(),
    status: challengeStatusSchema.optional(),
    week: z.number().int("Week must be an integer").min(0, "Week must be an integer >= 0").optional(),
    difficulty: challengeDifficultySchema.optional(),
    video: z.string().url("Video must be a valid URL").optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "challenge") {
      if (!data.goal || data.goal.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Field 'goal' is required when type is 'challenge'",
          path: ["goal"],
        });
      }
      if (!data.status) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Field 'status' is required when type is 'challenge'",
          path: ["status"],
        });
      }
    } else if (data.type === "post") {
      const challengeFields = ["goal", "status", "week", "difficulty", "video"] as const;
      for (const field of challengeFields) {
        if (data[field] !== undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Field '${field}' must not be present when type is 'post'`,
            path: [field],
          });
        }
      }
    }
  });

export type PostFrontmatter = z.infer<typeof postSchema>;

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
