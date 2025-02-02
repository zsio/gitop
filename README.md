# Gitop 项目

Gitop 项目基于 GitHub 趋势数据抓取，使用 Node.js 与 Cheerio 获取数据，并使用 TypeScript 进行类型定义。项目分为两个主要部分：

1. **worker.ts**  
   用于抓取 GitHub 趋势数据并保存到数据库中。该部分使用 [BullMQ](https://docs.bullmq.io/) 来管理任务队列以及 [Drizzle ORM](https://orm.drizzle.team/) 进行数据库操作。

2. **Next.js / Tailwind CSS 前端**  
   用于展示抓取到的 GitHub 趋势数据给用户。前端项目基于 Next.js 框架并使用 Tailwind CSS 进行样式构建。

---

## 特性

- 定时任务自动抓取 GitHub 趋势数据（支持每日、每周、每月）
- 使用 BullMQ 实现父子任务（FlowProducer）和任务调度
- 使用 Drizzle ORM 进行 PostgreSQL 数据库操作
- 前端页面基于 Next.js 与 Tailwind CSS 实现数据展示和响应式设计

---

## 安装

请确保已安装 Node.js 和 npm（或 yarn/ pnpm）。

1. 克隆项目：
   ```bash
   git clone <项目地址>
   ```

2. 安装依赖：
   ```bash
   npm install
   ```
   或者：
   ```bash
   yarn
   ```

3. 配置环境变量  
   在项目根目录下创建 `.env` 文件，参考 `.env.example` 文件配置数据库、Redis 等相关变量。

---

## 使用说明

### 运行 Worker 脚本

Worker 负责定时抓取 GitHub 趋势数据并存储到数据库中。使用以下命令启动 worker 脚本：
```bash
npm run worker
```
该脚本会定时触发任务，每 10 分钟执行一次数据抓取。你可以在 `worker.ts` 中调整任务间隔配置。

### 运行前端开发服务器

前端页面基于 Next.js 框架，请使用以下命令启动开发服务器：
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 来预览前端页面。

---

## 项目结构

- `worker.ts`  
  定时任务脚本，用于抓取 GitHub 趋势数据并存入数据库。

- `src/`  
  - `services/github-trending.ts`：封装了 GitHub 趋势数据抓取与解析逻辑。  
  - `components/`：存放前端组件，例如仓库卡片组件等。  
  - `parser/github-trending-parser.ts`：使用 Cheerio 对 HTML 页面进行数据解析。

- `db/` 和 `lib/pg`  
  数据库相关文件，使用 PostgreSQL 与 Drizzle ORM 作为数据层。

- `next.config.js`  
  Next.js 配置文件，用于前端页面构建。

---

## 开发相关

- 使用 [TypeScript](https://www.typescriptlang.org/) 进行严格的类型检查。
- 使用 [BullMQ](https://docs.bullmq.io/) 排程及任务管理，实现高度可扩展的数据抓取任务。
- 前端采用 [Tailwind CSS](https://tailwindcss.com/) 与 [Next.js](https://nextjs.org/) 构建，提供现代化、响应式的用户界面。

---

## 贡献

欢迎对本项目提出建议或提交 Pull Request。如果你有任何疑问，请在 issue 中讨论。

---

## 部署

- **Worker 部署**  
  请确保服务器上已安装并启动 Redis 和 PostgreSQL，然后运行 `npm run worker` 来启动后端任务。

- **前端部署**  
  你可以使用 [Vercel](https://vercel.com) 或其他支持 Next.js 的服务器进行部署。构建前请运行：
  ```bash
  npm run build
  ```
  然后启动生产环境：
  ```bash
  npm run start
  ```

---

## 许可

本项目采用 MIT 协议，请参阅 [LICENSE](./LICENSE) 文件获取详细信息。
