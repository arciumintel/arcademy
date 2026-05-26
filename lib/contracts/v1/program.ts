import type { ContentBlock } from "@/lib/content-blocks/schema";
import type { PublicQuiz } from "@/lib/quiz/public";

export type ProgramCatalogItem = {
  slug: string;
  title: string;
  tagline: string | null;
  hubStatus: "listed" | "featured";
  featuredRank: number | null;
};

export type PublicLessonPayload = {
  slug: string;
  title: Record<string, string>;
  blocks: ContentBlock[];
  quiz: PublicQuiz | null;
};
