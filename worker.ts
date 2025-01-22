import { parseRepoData } from "@/parser/github-trending-parser";
import { GithubTrending } from "@/services/github-trending";
import * as fs from "fs";

// 读取本地HTML文件
const html = fs.readFileSync("./demo.html", "utf-8");
const repoData = parseRepoData(html);
console.log(repoData);

const githubTrending = new GithubTrending();
console.log(githubTrending.buildUrl());
