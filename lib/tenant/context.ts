import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { query, type TenantSession } from "@/lib/db";

export type TenantContext =
  | { kind: "anonymous"; programId?: string; isStaff: false }
  | {
      kind: "learner";
      userId: string;
      orgIds: string[];
      isStaff: false;
    }
  | {
      kind: "partner";
      userId: string;
      organizationId: string;
      orgIds: string[];
      membershipRole: "author" | "admin";
      isStaff: false;
    }
  | { kind: "staff"; userId: string; orgIds: string[]; isStaff: true }
  | { kind: "system"; jobId: string; isStaff: true };

function parseStaffUserIds() {
  return (process.env.STAFF_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

async function loadOrgIdsForUser(userId: string) {
  const { rows } = await query<{ organization_id: string }>(
    `select organization_id from organization_member where user_id = $1`,
    [userId],
  );
  return rows.map((row) => row.organization_id);
}

export function isStaffUser(userId: string) {
  return parseStaffUserIds().includes(userId);
}

export function toTenantSession(ctx: TenantContext): TenantSession {
  switch (ctx.kind) {
    case "anonymous":
      return { orgIds: [], isStaff: false };
    case "learner":
      return { userId: ctx.userId, orgIds: ctx.orgIds, isStaff: false };
    case "partner":
      return { userId: ctx.userId, orgIds: ctx.orgIds, isStaff: false };
    case "staff":
      return { userId: ctx.userId, orgIds: ctx.orgIds, isStaff: true };
    case "system":
      return { orgIds: [], isStaff: true };
  }
}

export async function resolveTenantContext(): Promise<TenantContext> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return { kind: "anonymous", isStaff: false };
  }

  const userId = session.user.id;
  const orgIds = await loadOrgIdsForUser(userId);

  if (isStaffUser(userId) || session.user.role === "staff") {
    return { kind: "staff", userId, orgIds, isStaff: true };
  }

  return { kind: "learner", userId, orgIds, isStaff: false };
}

export function asSystemContext(jobId: string): TenantContext {
  return { kind: "system", jobId, isStaff: true };
}
