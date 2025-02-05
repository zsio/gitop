import { generateObject } from "ai";
import { z } from "zod";
import { deepseek, ollama, openai } from "../llms";

// import { deepseek } from "@ai-sdk/deepseek";


export async function translateGithubRepoDescription(
  repoUsername: string,
  repoName: string,
  desc: string,
  readmeMarkdown: string
) {
  const prompt = `
**任务说明**
你是一个专业的开源项目分析助手，需要完成以下两个结构化任务：

### 任务1：精准翻译（Bilingual Output）
- 输入内容：GitHub仓库描述文本
- 要求：
  √ 保持技术术语准确性
  √ 保留Markdown格式（如有）
  √ 中英对照输出（中文在上，英文在下）
  √ 使用符合技术文档规范的正式语体

待翻译文本：
"""
${desc}
"""

### 任务2：智能摘要（Structured Summary）
基于以下三要素生成项目简介：
1. 仓库名称：${repoUsername}/${repoName}
2. 原描述文本
3. README核心内容（已解析关键信息）

**摘要要求**：
1. 功能定位（20字以内精准定位）
2. 核心价值（技术栈/独特优势/适用场景）
3. 用户价值（能为开发者解决什么问题）
4. 关键特性（最多3个突出特点）
5. 应用场景（典型使用案例）

**处理策略**：
1. 自动过滤README中的安装步骤等非核心内容
2. 识别项目类型（框架/工具/模板库/研究项目等）
3. 提取技术关键词（如AI/Blockchain/Web框架等）
4. 保持口语化表达但专业准确

仓库的 README.md 内容:
----- 
${readmeMarkdown}

-----
`;
  const res = await generateObject({
    model: ollama("deepseek-r1:7b"),
    prompt,
    maxTokens: 600,
    temperature: 0.8,
    schemaName: "translate-result",
    schemaDescription: "翻译和摘要结果, 严格遵循 `json` 输出格式",
    schema: z.object({
      translated_description: z.string().describe("翻译后的仓库描述, 不要换行，不要空行，按照原文翻译一段话即可。"),
      summary: z.string().describe("仓库的用途简介"),
    }),
  });
  return res;
}
