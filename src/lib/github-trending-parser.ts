import { InsertTrendingRepo } from "@/db/schema";
import * as cheerio from "cheerio";

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