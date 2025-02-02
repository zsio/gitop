import { desc, eq } from "drizzle-orm";
import {
  trendingTasksTable,
  trendingReposTable,
  InsertTrendingRepo,
} from "@/db/schema";
import db from "@/lib/pg";
import { parseRepoData } from "@/lib/github-trending-parser";
import { CommonProgrammingLanguage, TrendingPeriod } from "@/types/repo";
import dayjs from "dayjs";

export const mirror_url = ["https://bgithub.xyz", "https://github.xiaohei.me"];

export class GithubTrending {
  private url: string = "https://github.com/trending";
  private proxys: string[] = ["https://ghfast.top/", "https://gh-proxy.com/"];
  private sinces: TrendingPeriod[] = Object.values(TrendingPeriod);

  public buildUrl(sinces: string, language: string): string {
    const url = new URL(this.url);
    if (language !== CommonProgrammingLanguage.All) {
      url.pathname = `${url.pathname}/${language}`;
    }
    if (sinces) {
      url.searchParams.set("since", sinces);
    }
    return url.toString();
  }

  public async fetchTrendingHtml(
    sinces: string = TrendingPeriod.Daily,
    language: string
  ): Promise<string> {
    const url = this.buildUrl(sinces, language);
    let html = "";

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch trending repos");
    }
    html = await response.text();

    if (!html) {
      throw new Error("Failed to fetch trending repos");
    }

    return html;
  }

  public async fetchTrendingRepos(
    sinces: string = TrendingPeriod.Daily,
    language: string,
    taskId: number
  ): Promise<InsertTrendingRepo[]> {
    const html = await this.fetchTrendingHtml(sinces, language);
    return parseRepoData(html, taskId, sinces, language);
  }

  public async startTask(): Promise<number | undefined> {
    // 查询最新任务的创建时间
    const lastTask = await db.query.trendingTasksTable.findFirst({
      orderBy: desc(trendingTasksTable.createdAt),
    });

    if (lastTask) {
      const lastCreatedAt = lastTask.createdAt;
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      if (lastCreatedAt > twoHoursAgo) {
        console.log(`距离上次任务未超过2小时，跳过本次任务。${lastCreatedAt}`);
        return
      }
    }

    const task = await db
      .insert(trendingTasksTable)
      .values({
        name: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return task?.[0]?.id;
  }

  public async run(taskId: number) {

    const all_languages = [
      CommonProgrammingLanguage.All,
      CommonProgrammingLanguage.JavaScript,
    ];
    for (const language of all_languages) {
      const all_promises = [];
      for (const sinces of this.sinces) {
        all_promises.push(this.fetchTrendingRepos(sinces, language, taskId));
      }
      const [daily_repos, weekly_repos, monthly_repos] = await Promise.all(
        all_promises
      );

      // 插入所有仓库数据
      const all_repos_data = [
        ...daily_repos,
        ...weekly_repos,
        ...monthly_repos,
      ];

      console.log(
        `插入 ${all_repos_data.length} 条数据, 任务ID: ${taskId}\n 其中：\ndaily: ${daily_repos.length}, weekly: ${weekly_repos.length}, monthly: ${monthly_repos.length}`
      );

      console.log(all_repos_data);

      try {
        const inserted_repos = await db
          .insert(trendingReposTable)
          .values(all_repos_data)
          .onConflictDoNothing()
          .returning();
        console.log(`实际插入到 repos 表的记录数：${inserted_repos.length}`);
      } catch (error) {
        console.error("插入数据时发生错误：", error);
        throw error;
      }
    }

    // 更新任务状态
    await db
      .update(trendingTasksTable)
      .set({
        status: "done",
        updatedAt: new Date(),
      })
      .where(eq(trendingTasksTable.id, taskId));
  }
}
