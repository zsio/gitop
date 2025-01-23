import { CommonProgrammingLanguage, TrendingPeriod } from "@/types/repo";
import { GithubTrending } from "@/services/github-trending";

describe("GithubTrending buildUrl", () => {
  let githubTrending: GithubTrending;

  beforeEach(() => {
    githubTrending = new GithubTrending();
  });

  it("should return base url without params", () => {
    const url = githubTrending.buildUrl(TrendingPeriod.Daily, CommonProgrammingLanguage.All);
    expect(url).toBe("https://github.com/trending?since=daily");
  });

  it("should add since param", () => {
    const url = githubTrending.buildUrl(TrendingPeriod.Daily, CommonProgrammingLanguage.All);
    expect(url).toBe("https://github.com/trending?since=daily");
  });

  it("should add language param", () => {
    const url = githubTrending.buildUrl(undefined, CommonProgrammingLanguage.TypeScript);
    expect(url).toBe("https://github.com/trending/typescript?since=daily");
  });

  it("should add both since and language params", () => {
    const url = githubTrending.buildUrl(TrendingPeriod.Weekly, CommonProgrammingLanguage.TypeScript);
    expect(url).toBe("https://github.com/trending/typescript?since=weekly");
  });

  it("should add c# language param", () => {
    const url = githubTrending.buildUrl(TrendingPeriod.Weekly, CommonProgrammingLanguage.Csharp);
    expect(url).toBe("https://github.com/trending/c%23?since=weekly");
  });

  it("should add objective-c language param", () => {
    const url = githubTrending.buildUrl(TrendingPeriod.Weekly, CommonProgrammingLanguage.ObjectiveC);
    expect(url).toBe("https://github.com/trending/objective-c?since=weekly");
  });
});
