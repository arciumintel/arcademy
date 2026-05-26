import { z } from "zod";

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug.");

export function parseSlug(input: string) {
  return slugSchema.safeParse(input);
}
