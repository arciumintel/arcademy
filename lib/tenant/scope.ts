import { ForbiddenError, NotFoundError } from "@/lib/errors";
import type { TenantContext } from "@/lib/tenant/context";

type AccessLevel = "read" | "write" | "publish";

export async function requireProgramAccess(
  ctx: TenantContext,
  programId: string,
  level: AccessLevel,
) {
  void level;
  if (ctx.kind === "staff" || ctx.kind === "system") {
    return;
  }

  if (ctx.kind === "anonymous") {
    throw new ForbiddenError();
  }

  const { rows } = await import("@/lib/db").then(({ query }) =>
    query<{ organization_id: string; hub_status: string }>(
      `select organization_id, hub_status::text as hub_status from program where id = $1`,
      [programId],
    ),
  );

  const program = rows[0];
  if (!program) {
    throw new NotFoundError();
  }

  if (ctx.orgIds.includes(program.organization_id)) {
    return;
  }

  if (
    ctx.kind === "learner" &&
    (program.hub_status === "listed" || program.hub_status === "featured")
  ) {
    return;
  }

  throw new ForbiddenError();
}

export async function requireOrganizationAccess(
  ctx: TenantContext,
  organizationId: string,
  level: AccessLevel,
) {
  void level;
  if (ctx.kind === "staff" || ctx.kind === "system") {
    return;
  }

  if (ctx.kind === "anonymous") {
    throw new ForbiddenError();
  }

  if (!ctx.orgIds.includes(organizationId)) {
    throw new ForbiddenError();
  }
}
