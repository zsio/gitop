

// 仓库数据
export interface Repo {
  title?: string;
  description?: string;
  programmingLanguage?: string;
  repo_language_color?: string;
  stargazers?: number;
  forks?: number;
  today_stargazers?: number;
  url?: string;
}

export enum TrendingPeriod {
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
}

// 常见编程语言枚举
export enum CommonProgrammingLanguage {
  All = "all",
  Python = "python",
  JavaScript = "javascript",
  Java = "java",
  Go = "go",
  C = "c",
  Cpp = "c++",
  Csharp = "c#",
  TypeScript = "typescript",
  Rust = "rust",
  Swift = "swift",
  PHP = "php",
  Ruby = "ruby",
  Kotlin = "kotlin",
  Dart = "dart",
  Scala = "scala",
  Shell = "shell",
  ObjectiveC = "objective-c",
  R = "r",
  Lua = "lua",
}
