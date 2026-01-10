import { z } from "zod";
import { TOPICS } from "./constants";

/**
 * Centralized Zod validation schemas for API routes.
 * All user input should be validated through these schemas.
 */

// Topic enum from constants
const TopicEnum = z.enum(TOPICS as [string, ...string[]]);
export type TopicType = z.infer<typeof TopicEnum>;

/**
 * Validate that a URL is a safe HTTP(S) URL.
 * Blocks javascript:, data:, and other potentially dangerous protocols.
 */
export const safeUrlSchema = z
  .string()
  .url("Must be a valid URL")
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" || parsed.protocol === "http:";
      } catch {
        return false;
      }
    },
    { message: "URL must use HTTP or HTTPS protocol" }
  );

// Game creation/update schema
export const gameSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  link: safeUrlSchema,
  topic: TopicEnum,
  description: z
    .string()
    .max(500, "Description too long")
    .optional()
    .default(""),
});

// Game submission schema (from community)
export const submissionSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  link: safeUrlSchema,
  topic: TopicEnum,
  description: z.string().max(500, "Description too long").optional(),
});

// List creation schema
export const listSchema = z.object({
  name: z
    .string()
    .min(1, "List name is required")
    .max(100, "List name too long")
    .trim(),
  color: z.string().optional(),
});

// Race creation schema
export const raceSchema = z.object({
  name: z
    .string()
    .min(1, "Race name is required")
    .max(50, "Race name too long"),
  gameIds: z.array(z.string()).min(1, "At least one game required"),
  guestName: z.string().min(1).max(30).optional(),
});

// Bulk action schema for admin
export const bulkActionSchema = z.object({
  action: z.enum(["archive", "unarchive", "delete", "update"]),
  gameIds: z.array(z.string()).min(1, "No games selected"),
  // For update action, only allow specific safe fields
  data: z
    .object({
      topic: TopicEnum.optional(),
      archived: z.boolean().optional(),
      embedSupported: z.boolean().optional(),
    })
    .optional(),
});

// Helper to parse with nice error messages
export function parseWithError<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errorMessage = result.error.issues
    .map((issue) => issue.message)
    .join(", ");
  return { success: false, error: errorMessage };
}
