import { describe, it, expect } from "vitest";
import { config } from "dotenv";
import path from "node:path";

config({ path: path.resolve(process.cwd(), ".env") });
config({ path: path.resolve(process.cwd(), ".env.local") });

import { withTenantTransaction } from "@/lib/db";

describe("withTenantTransaction", () => {
  it("sets session vars inside transaction", async () => {
    const result = await withTenantTransaction(
      { userId: "staff-1", orgIds: [], isStaff: true },
      async (client) => {
        const { rows } = await client.query<{ is_staff: string }>(
          "select current_setting('app.is_staff', true) as is_staff",
        );
        return rows[0]?.is_staff;
      },
    );
    expect(result).toBe("true");
  });
});
