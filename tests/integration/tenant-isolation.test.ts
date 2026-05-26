import { describe, it, expect, beforeAll } from "vitest";
import { config } from "dotenv";
import path from "node:path";
import pg from "pg";

config({ path: path.resolve(process.cwd(), ".env") });
config({ path: path.resolve(process.cwd(), ".env.local") });

import { getLessonProgress } from "@/lib/tenant/repositories/lessons";
import { getPublishedLessonVersion, listListedPrograms } from "@/lib/tenant/repositories/programs";
import { ForbiddenError } from "@/lib/errors";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

describe("tenant isolation", () => {
  let lessonVersionId: string;

  beforeAll(async () => {
    if (!connectionString) {
      throw new Error("DATABASE_URL_UNPOOLED is required for integration tests");
    }

    const client = new pg.Client({ connectionString });
    await client.connect();
    try {
      await client.query("begin");
      await client.query(
        `SELECT set_config('app.is_staff', 'true', true),
                set_config('app.current_user_id', '', true),
                set_config('app.current_org_ids', '', true)`,
      );

      const lesson = await client.query<{ id: string }>(
        `select lv.id
         from lesson_version lv
         join track t on t.id = lv.track_id
         join program p on p.active_published_version_id = t.curriculum_version_id
         where p.slug = 'arcium' and lv.slug = 'welcome'
         limit 1`,
      );
      lessonVersionId = lesson.rows[0]?.id;
      if (!lessonVersionId) {
        throw new Error("Run npm run db:seed-arcium before integration tests");
      }

      await client.query(
        `insert into "user" ("id", "name", "email", "emailVerified", "username", "role")
         values
           ('user-a', 'User A', 'user-a@test.local', true, 'user-a', 'user'),
           ('user-b', 'User B', 'user-b@test.local', true, 'user-b', 'user')
         on conflict ("id") do nothing`,
      );

      await client.query(
        `insert into lesson_progress (user_id, lesson_version_id, started_at)
         values ('user-b', $1, now())
         on conflict (user_id, lesson_version_id) do nothing`,
        [lessonVersionId],
      );

      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      await client.end();
    }
  });

  it("user A cannot read user B lesson progress", async () => {
    await expect(
      getLessonProgress({ kind: "learner", userId: "user-a", orgIds: [], isStaff: false }, lessonVersionId),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("anonymous can read listed published lessons", async () => {
    const lesson = await getPublishedLessonVersion(
      { kind: "anonymous", isStaff: false },
      { programSlug: "arcium", lessonSlug: "welcome" },
    );
    expect(lesson.slug).toBe("welcome");
    expect(lesson.blocks.length).toBeGreaterThan(0);
    expect(lesson.quiz?.questions[0]).not.toHaveProperty("correctAnswer");
  });

  it("lists arcium on the public catalog", async () => {
    const programs = await listListedPrograms({ kind: "anonymous", isStaff: false });
    expect(programs.some((program) => program.slug === "arcium")).toBe(true);
  });
});
