'use server'

import { and, desc, eq } from "drizzle-orm";
import db from "@/lib/pg";
import { trendingTasksTable, trendingReposTable } from "@/db/schema";

export async function getRepos(sinces: string, language='all') {
    return db.query.trendingReposTable.findMany({
        where: and(
            eq(trendingReposTable.filterSinces, sinces),
            eq(trendingReposTable.filterLanguage, language), 
            eq(trendingReposTable.taskId,
                db.select({ id: trendingTasksTable.id })
                  .from(trendingTasksTable)
                  .orderBy(desc(trendingTasksTable.createdAt))
                  .limit(1)
            )
        )
    });
}

