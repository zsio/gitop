import { integer, pgTable, timestamp, varchar, text, index, jsonb} from "drizzle-orm/pg-core";

export const trendingTasksTable = pgTable(
  'trending_tasks',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 255 }).notNull(),
    status: varchar('status', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
  }
);


export const trendingReposTable = pgTable(
  'trending_repos',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    filterLanguage: varchar('filter_language', { length: 30 }),
    filterSinces: varchar('filter_sinces', { length: 30 }),
    taskId: integer('task_id').notNull(),
    user: varchar('user', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    programmingLanguage: varchar('programming_language', { length: 255 }),
    repoLanguageColor: varchar('repo_language_color', { length: 255 }),
    stargazers: integer('stargazers').notNull(),
    forks: integer('forks').notNull(),
    todayStargazers: integer('today_stargazers'),
    order: integer('order').notNull(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
  },
  (table) => [
    index('filter_language_sinces_idx').on(table.filterLanguage, table.filterSinces),
    index('task_id_idx').on(table.taskId),
    index('name_idx').on(table.name),
    index('user_idx').on(table.user)
  ]
);

export type InsertTrendingRepo = typeof trendingReposTable.$inferInsert;
export type SelectTrendingRepo = typeof trendingReposTable.$inferSelect;


export const repoDetailTable = pgTable(
  "repo_detail",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    user: varchar("user", { length: 50 }),
    name: varchar("name", { length: 50 }),
    apiResponse: jsonb("api_response"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  }
);

export type InsertRepoDetail = typeof repoDetailTable.$inferInsert;