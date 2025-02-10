import axios from "axios";
import utils from "./utils";

const DEFAULT_PER_PAGE = 30;

type IGIGetRepoStargazersResItemUser = {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    user_view_type: string;
    site_admin: boolean;
}

type IGetRepoStargazersResItem = {
  starred_at: string;
  user: IGIGetRepoStargazersResItemUser;
};

/**
 * 获取仓库的 Stargazers 信息
 * @param repo - 仓库名称，格式为 "owner/repo"
 * @param token - 可选的 GitHub API 访问令牌
 * @param page - 可选的分页参数
 * @returns Promise<AxiosResponse> - 包含 stargazers 信息的响应
 */
export async function getRepoStargazers(
  repo: string,
  token?: string,
  page?: number
) {
  let url = `https://api.github.com/repos/${repo}/stargazers?per_page=${DEFAULT_PER_PAGE}`;

  if (page !== undefined) {
    url = `${url}&page=${page}`;
  }
  return axios.get<IGetRepoStargazersResItem[]>(url, {
    headers: {
      Accept: "application/vnd.github.v3.star+json",
      Authorization: token ? `token ${token}` : "",
    },
  });
}

type IGetRepoStargazersInfo = {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    private: boolean;
    owner: IGIGetRepoStargazersResItemUser;
    html_url: string;
    description: string;
    url: string;
    topics: string[];
    archive_url: string;
    commits_url: string;
    git_url: string;
    languages_url: string;
    clone_url: string;
    homepage?: string;
    size: number;
    forks_count: number;
    watchers_count: number;
    stargazers_count: number;
    open_issues_count: number;
    language: string;
    default_branch: string;
}


export async function getRepoStargazersInfo(repo: string, token?: string) {
  const { data } = await axios.get<IGetRepoStargazersInfo>(`https://api.github.com/repos/${repo}`, {
    headers: {
      Accept: "application/vnd.github.v3.star+json",
      Authorization: token ? `token ${token}` : "",
    },
  });
  return data;
}

/**
 * 获取仓库的 star 历史记录
 * @param repo - 仓库名称，格式为 "owner/repo"
 * @param token - GitHub API 访问令牌
 * @param maxRequestAmount - 最大请求数量，用于限制 API 调用次数
 * @returns Promise<Array<{date: string, count: number}>> - star 历史记录数组
 * @throws 当仓库不存在或无法访问时抛出错误
 */
export async function getRepoStarRecords(
  repo: string,
  token: string,
  maxRequestAmount: number
) {
  const patchRes = await getRepoStargazers(repo, token);

  const headerLink = patchRes.headers["link"] || "";

  let pageCount = 1;
  const regResult = /next.*&page=(\d*).*last/.exec(headerLink);

  if (regResult) {
    if (regResult[1] && Number.isInteger(Number(regResult[1]))) {
      pageCount = Number(regResult[1]);
    }
  }

  if (pageCount === 1 && patchRes?.data?.length === 0) {
    throw {
      status: patchRes.status,
      data: [],
    };
  }

  const requestPages: number[] = [];
  if (pageCount < maxRequestAmount) {
    requestPages.push(...utils.range(1, pageCount));
  } else {
    utils.range(1, maxRequestAmount).map((i) => {
      requestPages.push(Math.round((i * pageCount) / maxRequestAmount) - 1);
    });
    if (!requestPages.includes(1)) {
      requestPages[0] = 1;
    }
  }

  const resArray = await Promise.all(
    requestPages.map((page) => {
      return getRepoStargazers(repo, token, page);
    })
  );

  const starRecordsMap: Map<string, number> = new Map();

  if (requestPages.length < maxRequestAmount) {
    const starRecordsData: IGetRepoStargazersResItem[] = [];
    resArray.map((res) => {
      const { data } = res;
      starRecordsData.push(...data);
    });
    for (let i = 0; i < starRecordsData.length; ) {
      starRecordsMap.set(
        utils.getDateString(starRecordsData[i].starred_at),
        i + 1
      );
      i += Math.floor(starRecordsData.length / maxRequestAmount) || 1;
    }
  } else {
    resArray.map(({ data }, index) => {
      if (data.length > 0) {
        const starRecord = data[0];
        starRecordsMap.set(
          utils.getDateString(starRecord.starred_at),
          DEFAULT_PER_PAGE * (requestPages[index] - 1)
        );
      }
    });
  }

  const starAmount = await getRepoStargazersInfo(repo, token);
  starRecordsMap.set(utils.getDateString(Date.now()), starAmount.stargazers_count);

  const starRecords: {
    date: string;
    count: number;
  }[] = [];

  starRecordsMap.forEach((v, k) => {
    starRecords.push({
      date: k,
      count: v,
    });
  });

  return starRecords;
}

/**
 * 获取仓库所有者的头像 URL
 * @param repo - 仓库名称，格式为 "owner/repo"
 * @param token - 可选的 GitHub API 访问令牌
 * @returns Promise<string> - 仓库所有者的头像 URL
 */
export async function getRepoLogoUrl(
  repo: string,
  token?: string
): Promise<string> {
  const owner = repo.split("/")[0];
  const { data } = await axios.get(`https://api.github.com/users/${owner}`, {
    headers: {
      Accept: "application/vnd.github.v3.star+json",
      Authorization: token ? `token ${token}` : "",
    },
  });

  return data.avatar_url;
}




/**
 * 获取仓库的 README 文件内容
 * @param repo - 仓库名称，格式为 "owner/repo"
 * @param token - 可选的 GitHub API 访问令牌
 * @returns Promise<string> - 返回 README 文件的原始内容
 * @description 
 * - 使用 GitHub API 获取仓库的 README 文件
 * - 返回的是原始的 markdown 格式内容
 * - 如果仓库没有 README 文件，API 会返回 404 错误
 * - 默认获取主分支上的 README 文件
 */
export async function getRepoReadme(repo: string, token?: string) {
  const { data } = await axios.get<string>(`https://api.github.com/repos/${repo}/readme`, {
    headers: {
      Accept: "application/vnd.github.raw+json",
      Authorization: token ? `token ${token}` : "",
    },
  });

  return data;
}



/**
 * GitHub API 方法集合
 * @namespace
 */
export const api = {
  getRepoStargazers,
  getRepoStargazersInfo,
  getRepoStarRecords,
  getRepoLogoUrl,
  getRepoReadme,
};

export default api;
