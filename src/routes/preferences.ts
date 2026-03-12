import { Hono } from "hono";
import { eq, and, sql } from "drizzle-orm";
import db from "../db/index.ts";
import { users, overrides } from "../db/schema.ts";
import { Mode, Project } from "../enums.ts";
import { DEFAULT_MODE } from "../constants.ts";
import { wipeUserData } from "../wipe.ts";

const validModes = new Set<string>(Object.values(Mode));
const validProjects = new Set<string>(Object.values(Project));

const preferences = new Hono();

// GET /preferences/:userId — get mode + project overrides
preferences.get("/:userId", async (c) => {
  const { userId } = c.req.param();

  const [user] = await db.select().from(users).where(eq(users.userId, userId));

  const projectOverrides = await db
    .select({ project: overrides.project, mode: overrides.mode })
    .from(overrides)
    .where(eq(overrides.userId, userId));

  return c.json({
    user_id: userId,
    mode: (user?.mode as Mode) ?? DEFAULT_MODE,
    overrides: Object.fromEntries(projectOverrides.map((r) => [r.project, r.mode])),
  });
});

// PUT /preferences/:userId — set global mode
preferences.put("/:userId", async (c) => {
  const { userId } = c.req.param();
  const body = await c.req.json<{ mode: Mode; reason?: string }>();

  if (!validModes.has(body.mode)) {
    return c.json({ error: `Invalid mode. Valid: ${[...validModes].join(", ")}` }, 400);
  }

  await db
    .insert(users)
    .values({ userId, mode: body.mode, reason: body.reason })
    .onConflictDoUpdate({
      target: users.userId,
      set: { mode: body.mode, reason: body.reason, updatedAt: sql`(unixepoch())` },
    });

  // Wipe data from all projects when switching to opt_out_collection
  let wipeResults: Record<string, { ok: boolean; error?: string }> | undefined;
  if (body.mode === Mode.OptOutCollection) {
    await db.delete(overrides).where(eq(overrides.userId, userId));
    wipeResults = await wipeUserData(userId);
  }

  return c.json({ ok: true, wipe_results: wipeResults });
});

// DELETE /preferences/:userId — reset everything
preferences.delete("/:userId", async (c) => {
  const { userId } = c.req.param();
  await db.delete(users).where(eq(users.userId, userId));
  await db.delete(overrides).where(eq(overrides.userId, userId));
  return c.json({ ok: true });
});

// PUT /preferences/:userId/:project — set project override
preferences.put("/:userId/:project", async (c) => {
  const { userId, project } = c.req.param();

  if (!validProjects.has(project)) {
    return c.json({ error: `Invalid project. Valid: ${[...validProjects].join(", ")}` }, 400);
  }

  const body = await c.req.json<{ mode: Mode; reason?: string }>();

  if (!validModes.has(body.mode)) {
    return c.json({ error: `Invalid mode. Valid: ${[...validModes].join(", ")}` }, 400);
  }

  await db
    .insert(overrides)
    .values({ userId, project, mode: body.mode, reason: body.reason })
    .onConflictDoUpdate({
      target: [overrides.userId, overrides.project],
      set: { mode: body.mode, reason: body.reason, updatedAt: sql`(unixepoch())` },
    });

  return c.json({ ok: true });
});

// DELETE /preferences/:userId/:project — remove project override
preferences.delete("/:userId/:project", async (c) => {
  const { userId, project } = c.req.param();
  await db
    .delete(overrides)
    .where(and(eq(overrides.userId, userId), eq(overrides.project, project)));
  return c.json({ ok: true });
});

export default preferences;
