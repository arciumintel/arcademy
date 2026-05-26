import { resolveTenantContext } from "@/lib/tenant/context";
import { listListedPrograms } from "@/lib/tenant/repositories/programs";
import type { ProgramCatalogItem } from "@/lib/contracts/v1/program";

export async function GET() {
  const ctx = await resolveTenantContext();
  const programs = await listListedPrograms(ctx);
  const payload: ProgramCatalogItem[] = programs.map((program) => ({
    slug: program.slug,
    title: program.title,
    tagline: program.tagline,
    hubStatus: program.hubStatus,
    featuredRank: program.featuredRank,
  }));
  return Response.json({ programs: payload });
}
