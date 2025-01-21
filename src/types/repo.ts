

// 仓库数据
export interface RepoData {
  title?: string;
  description?: string;
  programmingLanguage?: string;
  repo_language_color?: string;
  stargazers?: number;
  forks?: number;
  today_stargazers?: number;
}

// 常见编程语言枚举
export enum ProgrammingLanguage {
  JavaScript = "JavaScript",
  TypeScript = "TypeScript",
  Python = "Python",
  Java = "Java",
  C = "C",
  Cpp = "C++",
  Csharp = "C#",
  Go = "Go",
  Rust = "Rust",
  Swift = "Swift",
}
