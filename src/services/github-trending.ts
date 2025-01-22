
import { parseRepoData } from "@/parser/github-trending-parser";
import { CommonProgrammingLanguage, Repo, TrendingPeriod } from "@/types/repo";

export class GithubTrending {
  private url: string = "https://github.com/trending";
  private proxys: string[] = ["https://ghfast.top/", "https://gh-proxy.com/"];
  private sinces: string[] = Object.values(TrendingPeriod);

  public buildUrl(
    sinces: TrendingPeriod = TrendingPeriod.Daily,
    language?: CommonProgrammingLanguage
  ): string {
    const url = new URL(this.url);
    if (language) {
      url.pathname = `${url.pathname}/${language}`;
    }
    if (sinces) {
      url.searchParams.set("since", sinces);
    }
    return url.toString();
  }

  public async fetchTrendingHtml(
    sinces: TrendingPeriod = TrendingPeriod.Daily,
    language?: CommonProgrammingLanguage
  ): Promise<string> {
    const url = this.buildUrl(sinces, language);
    let html = "";

    for (const proxy of this.proxys) {
      const response = await fetch(`${proxy}${url}`);
      if (!response.ok) {
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
    language?: CommonProgrammingLanguage
  ): Promise<Repo[]> {
    const html = await this.fetchTrendingHtml(sinces, language);
    return parseRepoData(html);
  }
}
