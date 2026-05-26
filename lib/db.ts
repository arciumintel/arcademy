import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

declare global {
  var __arcintelPool: Pool | undefined;
}

export type TenantSession = {
  userId?: string;
  orgIds: string[];
  isStaff: boolean;
};

function getConnectionString() {
  const connectionString =
    process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL is not set.");
  }

  return connectionString.replace("sslmode=require", "sslmode=verify-full");
}

function getPool() {
  if (globalThis.__arcintelPool) {
    return globalThis.__arcintelPool;
  }

  const pool = new Pool({ connectionString: getConnectionString() });

  if (process.env.NODE_ENV !== "production") {
    globalThis.__arcintelPool = pool;
  }

  return pool;
}

export const db = {
  query: <T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ) => getPool().query<T>(text, params),
  connect: () => getPool().connect(),
} as const;

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  return db.query<T>(text, params);
}

export function toTenantSession(session: TenantSession) {
  return session;
}

export async function withTenantTransaction<T>(
  session: TenantSession,
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `SELECT set_config('app.current_user_id', $1, true),
              set_config('app.current_org_ids', $2, true),
              set_config('app.is_staff', $3, true)`,
      [
        session.userId ?? "",
        `{${session.orgIds.join(",")}}`,
        session.isStaff ? "true" : "false",
      ],
    );
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
