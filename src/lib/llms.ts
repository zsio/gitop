import { createOpenAI } from "@ai-sdk/openai"
import { createOllama } from 'ollama-ai-provider';


// deepseek-chat
// const deepseek = createOpenAI({
//   apiKey: process.env.DEEPSEEK_API_KEY ?? "",
//   baseURL: process.env.DEEPSEEK_BASE_URL ?? "",
// });

export const deepbricks = createOpenAI({
  apiKey: process.env.DEEPBRICKS_API_KEY ?? "",
  baseURL: process.env.DEEPBRICKS_BASE_URL ?? "",
});

export const liaobots = createOpenAI({
  apiKey: process.env.LIAO_API_KEY ?? "",
  baseURL: process.env.LIAO_BASE_URL ?? "",
});


// deepseek-r1:7b
export const ollama = createOllama({
  baseURL: process.env.OLLAMA_BASE_URL ?? "",
});

