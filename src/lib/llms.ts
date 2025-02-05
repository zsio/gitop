import { createOpenAI } from "@ai-sdk/openai"
import { deepseek } from "@ai-sdk/deepseek"
import { createOllama } from 'ollama-ai-provider';


// deepseek-chat
// const deepseek = createOpenAI({
//   apiKey: process.env.DEEPSEEK_API_KEY ?? "",
//   baseURL: process.env.DEEPSEEK_BASE_URL ?? "",
// });

const openai = createOpenAI({
  apiKey: process.env.DEEPBRICKS_API_KEY ?? "",
  baseURL: process.env.DEEPBRICKS_BASE_URL ?? "",
});

// deepseek-r1:7b
const ollama = createOllama({
  baseURL: process.env.OLLAMA_BASE_URL ?? "",
});

export { deepseek, openai, ollama };
