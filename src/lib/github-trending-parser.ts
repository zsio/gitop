import { InsertTrendingRepo } from "@/db/schema";
import { generateObject } from "ai";
import * as cheerio from "cheerio";
import { liaobots } from "./llms";
import { z } from "zod";

// 添加一个辅助函数来提取数字
function extractNumber(str: string): number {
  const matches = str.match(/\d+/g);
  if (!matches) return 0;
  return parseInt(matches.join(""));
}

export function parseRepoData(html: string, taskId: number, sinces: string, language: string): InsertTrendingRepo[] {
  const $ = cheerio.load(html);
  const $rows = $(".Box .Box-row");

  const repoData: InsertTrendingRepo[] = [];

  $rows.each((index, element) => {
    const $row = $(element);

    const title = $row.find("h2").text();
    const trimmedTitle = title.replaceAll(" ", "").replaceAll("\n", "");

    const description = $row.children("p").text()?.trim();

    const programmingLanguage = $row
      .find('span[itemprop="programmingLanguage"]')
      .text();

    const repoLanguageColor = $row
      .find("span.repo-language-color")
      .attr("style")
      ?.match(/background-color:\s*([^;]+)/)?.[1]
      ?.trim() || null;
      

    const octicon_star = $row.find(".octicon-star").parent("a").text();
    const stargazers = extractNumber(octicon_star);

    const octicon_fork = $row.find(".octicon-repo-forked").parent("a").text();
    const forks = extractNumber(octicon_fork);
    
    const today_star = $row
      .find(".octicon-star")
      .parent("span.float-sm-right")
      .text();
    const today_stargazers = extractNumber(today_star);

    const user = trimmedTitle.split("/")[0];
    const name = trimmedTitle.split("/")[1];

    repoData.push({
      user,
      name,
      taskId: taskId,
      filterLanguage: language,
      filterSinces: sinces,
      description,
      programmingLanguage,
      repoLanguageColor: repoLanguageColor || '',
      stargazers,
      forks,
      todayStargazers: today_stargazers,
      order: index,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  });

  return repoData as InsertTrendingRepo[];
} 


export async function summarizeGithubRepo(
  repoName: string,
  desc: string,
  readmeMarkdown: string,
  language: string = "zh-CN"
) {
  const prompt = `
**任务说明**
你是一个专业的开源项目分析助手，需要完成以下两个结构化任务：

### 任务1：根据 description 和 readme.md 内容，生成一个简短的仓库说明
三五句话总结这个仓库的用途。

### 任务2：根据 readme.md 和 description，生成一个详细的仓库说明
为开发者提供一个详细的仓库说明，帮助他们了解这个仓库的用途、特点、优势、适用场景等。

仓库名称：${repoName}

仓库的 description：
"""
${desc}
"""

仓库的 README.md 内容:
----------
${readmeMarkdown}
----------


注意：生成的结果中，除了专有名词，都需要使用 ${language} 语言。
`;
  const res = await generateObject({
    model: liaobots("gpt-4o-mini"),  // gpt-4o-mini   o1-mini  claude-3-5-sonnet-20241022  gemini-2.0-flash-exp
    prompt,
    maxTokens: 600,
    temperature: 0.8,
    schemaName: "summary-github-repo",
    schemaDescription: "仓库的简要说明和详细说明",
    schema: z.object({
      description: z.string().describe("仓库的简要说明"),
      summary: z.string().describe("仓库的详细说明"),
    }),
  });
  return res;
}