import { integer, pgTable, timestamp, varchar, text} from "drizzle-orm/pg-core";

export const tasksTable = pgTable("tasks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  status: varchar({ length: 255 }).notNull(),
  created_at: timestamp().notNull(),
  updated_at: timestamp().notNull(),
});

export const trendingRecordsTable = pgTable("trending_records", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  task_id: integer().notNull(),
  language: varchar({ length: 255 }).notNull(),
  sinces: varchar({ length: 255 }).notNull(),
  created_at: timestamp().notNull(),
});

export const reposTable = pgTable("repos", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  task_id: integer().notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  programmingLanguage: varchar({ length: 255 }).notNull(),
  stargazers: integer().notNull(),
  forks: integer().notNull(),
  today_stargazers: integer().notNull(),
  created_at: timestamp().notNull(),
});

export type InsertRepo = typeof reposTable.$inferInsert;
export type SelectRepo = typeof reposTable.$inferSelect;