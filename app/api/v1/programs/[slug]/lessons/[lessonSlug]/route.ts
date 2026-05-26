import { resolveTenantContext } from "@/lib/tenant/context";
import { getPublishedLessonVersion } from "@/lib/tenant/repositories/programs";
import { AppError } from "@/lib/errors";
import type { PublicLessonPayload } from "@/lib/contracts/v1/program";

type Params = {
  params: Promise<{ slug: string; lessonSlug: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const { slug, lessonSlug } = await params;
    const ctx = await resolveTenantContext();
    const lesson = await getPublishedLessonVersion(ctx, {
      programSlug: slug,
      lessonSlug,
    });
    const payload: PublicLessonPayload = {
      slug: lesson.slug,
      title: lesson.title,
      blocks: lesson.blocks,
      quiz: lesson.quiz,
    };
    return Response.json({ lesson: payload });
  } catch (error) {
    if (error instanceof AppError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
