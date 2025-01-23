import { uniqBy } from "es-toolkit";
import { reposTable, tasksTable, trendingRecordsTable } from "@/db/schema";
import db from "@/libs/pg";
import { parseRepoData } from "@/parser/github-trending-parser";
import { CommonProgrammingLanguage, Repo, TrendingPeriod } from "@/types/repo";
import dayjs from "dayjs";
import { eq, sql } from "drizzle-orm";

export class GithubTrending {
  private url: string = "https://github.com/trending";
  private mirror_url: string[] = ["https://bgithub.xyz", "https://github.xiaohei.me"];
  private proxys: string[] = ["https://ghfast.top/", "https://gh-proxy.com/"];
  private sinces: TrendingPeriod[] = Object.values(TrendingPeriod);

  public buildUrl(
    sinces: TrendingPeriod = TrendingPeriod.Daily,
    language: CommonProgrammingLanguage
  ): string {
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
    sinces: TrendingPeriod = TrendingPeriod.Daily,
    language: CommonProgrammingLanguage
  ): Promise<string> {
    const url = this.buildUrl(sinces, language);
    let html = "";

    for (const mirror of this.mirror_url) {
      const trending_url = url.replace('https://github.com', mirror);
      const response = await fetch(trending_url);
      if (!response.ok) {
        console.error(`${trending_url}请求失败`);
        continue;
      }
      html = await response.text();
      break;
    }

    if (!html) {
      throw new Error("Failed to fetch trending repos");
    }

    return html;
  }

  public async fetchTrendingRepos(
    sinces: TrendingPeriod = TrendingPeriod.Daily,
    language: CommonProgrammingLanguage
  ): Promise<Repo[]> {
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 3000;
    while (retryCount < maxRetries) {
      try {
        const html = await this.fetchTrendingHtml(sinces, language);
        return parseRepoData(html);
      } catch (error) {
        retryCount++;
        if (retryCount === maxRetries) {
          console.error("请求仓库失败\n", error);
          return [];
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    return [];
  }

  public async run() {

    // 创建任务
    const task = await db.insert(tasksTable).values({
      name: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    }).returning();

    if (!task[0].id) {
      throw new Error('创建任务失败');
    }

    const task_id = task[0].id;

    const all_languages = [CommonProgrammingLanguage.All];
    for (const language of all_languages) {
      const all_promises = [];
      for (const sinces of this.sinces) {
        all_promises.push(this.fetchTrendingRepos(sinces, language));
      }
      const [daily_repos, weekly_repos, monthly_repos] = await Promise.all(all_promises);
      // 插入数据
      const all_repos = [
        ...daily_repos.map(repo => ({
          task_id,
          language: repo.programmingLanguage || '',
          sinces: TrendingPeriod.Daily,
          created_at: new Date()
        })),
        ...weekly_repos.map(repo => ({
          task_id,
          language: repo.programmingLanguage || '',
          sinces: TrendingPeriod.Weekly,
          created_at: new Date()
        })),
        ...monthly_repos.map(repo => ({
          task_id,
          language: repo.programmingLanguage || '',
          sinces: TrendingPeriod.Monthly,
          created_at: new Date()
        }))
      ];
      await db.insert(trendingRecordsTable).values(all_repos).onConflictDoNothing();

      // 插入所有仓库数据
      const all_repos_data = uniqBy([...daily_repos, ...weekly_repos, ...monthly_repos], repo => repo.title)
        .map(repo => ({
          task_id,
          name: repo.title || '',
          description: repo.description || '', 
          programmingLanguage: repo.programmingLanguage || '',
          stargazers: repo.stargazers || 0,
          forks: repo.forks || 0,
          today_stargazers: repo.today_stargazers || 0,
          created_at: new Date()
        }));

      console.log(`插入 ${all_repos_data.length} 条数据, 任务ID: ${task_id}\n 其中：\ndaily: ${daily_repos.length}, weekly: ${weekly_repos.length}, monthly: ${monthly_repos.length}`);

      try {
        const inserted_repos = await db.insert(reposTable)
          .values(all_repos_data)
          .onConflictDoNothing()
          .returning();
        console.log(`实际插入到 repos 表的记录数：${inserted_repos.length}`);
      } catch (error) {
        console.error('插入数据时发生错误：', error);
        throw error;
      }
    }

    // 更新任务状态
    await db.update(tasksTable).set({
      status: 'completed',
      updated_at: new Date(),
    }).where(eq(tasksTable.id, task_id));
  }

}
