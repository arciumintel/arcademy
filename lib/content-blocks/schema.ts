import { z } from "zod";

const localeTextSchema = z
  .object({
    en: z.string().min(1),
  })
  .catchall(z.string());

export const headingBlockSchema = z.object({
  type: z.literal("heading"),
  level: z.union([z.literal(2), z.literal(3)]),
  text: localeTextSchema,
});

export const paragraphBlockSchema = z.object({
  type: z.literal("paragraph"),
  text: localeTextSchema,
});

export const calloutBlockSchema = z.object({
  type: z.literal("callout"),
  variant: z.enum(["note", "warning"]),
  text: localeTextSchema,
});

export const codeBlockSchema = z.object({
  type: z.literal("code"),
  language: z.string().min(1).max(40),
  snippet: z.string().max(20000),
});

export const imageBlockSchema = z.object({
  type: z.literal("image"),
  cloudinary_url: z.string().url().max(2048),
  alt: localeTextSchema,
  caption: localeTextSchema.optional(),
});

export const dividerBlockSchema = z.object({
  type: z.literal("divider"),
});

export const contentBlockSchema = z.discriminatedUnion("type", [
  headingBlockSchema,
  paragraphBlockSchema,
  calloutBlockSchema,
  codeBlockSchema,
  imageBlockSchema,
  dividerBlockSchema,
]);

export const lessonBlocksSchema = z.array(contentBlockSchema).min(1).max(200);

export type ContentBlock = z.infer<typeof contentBlockSchema>;
export type LocaleText = z.infer<typeof localeTextSchema>;

export function parseLessonBlocks(input: unknown) {
  return lessonBlocksSchema.safeParse(input);
}
