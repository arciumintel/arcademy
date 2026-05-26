import { resolveTenantContext } from "@/lib/tenant/context";
import { getProgramBySlug } from "@/lib/tenant/repositories/programs";
import { AppError } from "@/lib/errors";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const ctx = await resolveTenantContext();
    const program = await getProgramBySlug(ctx, slug);
    return Response.json({ program });
  } catch (error) {
    if (error instanceof AppError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
