import { text, integer, sqliteTable, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  userId: text("user_id").primaryKey(),
  mode: text("mode").notNull().default("opt_in"),
  reason: text("reason"),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const overrides = sqliteTable(
  "overrides",
  {
    userId: text("user_id").notNull(),
    project: text("project").notNull(),
    mode: text("mode").notNull(),
    reason: text("reason"),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [primaryKey({ columns: [table.userId, table.project] })],
);
