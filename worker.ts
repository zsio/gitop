import { RepoData } from "@/types/repo";
import * as cheerio from "cheerio";
import * as fs from "fs";


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const GithubProxys = [
  "https://ghfast.top",
  "https://gh-proxy.com"
]

// 读取本地HTML文件
const html = fs.readFileSync("./demo.html", "utf-8");


function parseRepoData(html: string): RepoData[] {
  const $ = cheerio.load(html);
  const $rows = $(".Box .Box-row");

  // 添加一个辅助函数来提取数字
  function extractNumber(str: string): number {
    const matches = str.match(/\d+/g);
    if (!matches) return 0;
    return parseInt(matches.join(""));
  }

  const repoData: RepoData[] = [];

  $rows.each((index, element) => {
    const $row = $(element);

    const title = $row.find("h2").text();
    const trimmedTitle = title.replaceAll(" ", "").replaceAll("\n", "");

    const description = $row.children("p").text()?.trim();

    const programmingLanguage = $row
      .find('span[itemprop="programmingLanguage"]')
      .text();

    const repo_language_color = $row
      .find("span.repo-language-color")
      .attr("style");

    const octicon_star = $row.find(".octicon-star").parent("a").text();
    const stargazers = extractNumber(octicon_star);


    const octicon_fork = $row.find(".octicon-repo-forked").parent("a").text();
    const forks = extractNumber(octicon_fork);
    
    const today_star = $row
      .find(".octicon-star")
      .parent("span.float-sm-right")
      .text();
    const today_stargazers = extractNumber(today_star);

    repoData.push({
      title: trimmedTitle,
      description,
      programmingLanguage,
      repo_language_color,
      stargazers,
      forks,
      today_stargazers,
    });
  });

  return repoData;
}

const repoData = parseRepoData(html);
console.log(repoData);
