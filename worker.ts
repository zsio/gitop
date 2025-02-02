/* eslint-disable @typescript-eslint/no-unused-vars */
import "dotenv/config";
import assert from "assert";
import { eq } from "drizzle-orm";
import { GithubTrending } from "@/services/github-trending";

import { Queue, Worker, FlowProducer, FlowChildJob, type ConnectionOptions } from "bullmq";
import { CommonProgrammingLanguage, TrendingPeriod } from "@/types/repo";
import { trendingReposTable, trendingTasksTable } from "@/db/schema";
import db from "@/lib/pg";

assert(process.env.REDIS_HOST, "REDIS_HOST is not set");
assert(process.env.REDIS_PORT, "REDIS_PORT is not set");
assert(process.env.REDIS_PASSWORD, "REDIS_PASSWORD is not set");

const connection: ConnectionOptions = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
};

// 定时执行任务，所有任务的开始。
const GetGithubTrendingStartQueueName = "GET-GITHUB-TRENDING-START-QUEUE";
const RepeatJobSchedulerName = "REPEAT-GET-GITHUB-TRENDING-EVERY";
const RepeatJobSchedulerNameValue = 1000 * 60 * 30;


// 获取排行榜 flow 的 name，开启父子任务
const GetGithubTrendingFlowName = "GET-GITHUB-TRENDING-FLOW";
// 获取所有语言和时间段的任务
const GetGithubTrendingByLanguageAndTimeQueueName = "GET-GITHUB-TRENDING-BY-LANGUAGE-AND-TIME-QUEUE";
// 获取所有语言和时间段的任务完成
const GetGithubTrendingByLanguageAndTimeDoneQueueName = "GET-GITHUB-TRENDING-BY-LANGUAGE-AND-TIME-DONE-QUEUE";


// 获取单个仓库详情的flow, 开启父子任务
const HandleRepoFlowName = "HANDLE-REPO-FLOW";
// 所有仓库处理完成
const HandleRepoDoneQueueName = "HANDLE-REPO-DONE-QUEUE";


// 翻译仓库的description
const TranslateRepoDescriptionQueueName = "TRANSLATE-REPO-DESCRIPTION-QUEUE";


const flowProducer = new FlowProducer({ connection });


async function startWorker() {
  console.log("开始启动脚本");


  const getGithubTrendingQueue = new Queue(GetGithubTrendingStartQueueName, {
    connection,
  });
  await getGithubTrendingQueue.upsertJobScheduler(
    RepeatJobSchedulerName,
    {
      every: RepeatJobSchedulerNameValue, // 每30分钟执行一次
    },
    {
      data: {},
      opts: {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000 * 3,
        }
      },
    }
  );


  const getGithubTrendingStartWorker = new Worker(
    GetGithubTrendingStartQueueName,
    async (job) => {

      console.log(`定时任务： ${job.id} 开始执行`);

      const githubTrending = new GithubTrending();
      const taskId = await githubTrending.startTask();
      if (!taskId) {
        return;
      }

      const allLanguages = Object.values(CommonProgrammingLanguage);

      const sinces = Object.values(TrendingPeriod);

      // 生成所有语言和时间段的单个任务
      const getGithubTrendingFlowList: FlowChildJob[] = allLanguages.flatMap(language => 
        sinces.map(since => ({
          name: `get-github-trending-${language}-${since}`,
          data: { taskId, language, since },
          queueName: GetGithubTrendingByLanguageAndTimeQueueName
        }))
      )

      // 获取所有 trending 列表的总任务
      const flow = await flowProducer.add({
        name: GetGithubTrendingFlowName,
        queueName: GetGithubTrendingByLanguageAndTimeDoneQueueName,
        data: {
          taskId
        },
        children: getGithubTrendingFlowList,
      }, {
        queuesOptions: {
          [GetGithubTrendingByLanguageAndTimeQueueName]: {
            defaultJobOptions: {
              removeOnComplete: true,
              removeOnFail: true,
              attempts: 3,
              backoff: {
                type: "exponential",
                delay: 1000 * 3,
              }
            }
          },
          [GetGithubTrendingByLanguageAndTimeDoneQueueName]: {
            defaultJobOptions: {
              removeOnComplete: true,
              removeOnFail: true,
              attempts: 3,
              backoff: {
                type: "exponential",
                delay: 1000 * 3,
              }
            }
          }
        }
      });

      console.log(`Job ${job.id} completed`);
    },
    { connection, concurrency: 1, limiter: { max: 1, duration: 1000 } }
  );

  getGithubTrendingStartWorker.on("completed", (job) => {
    console.log(`任务： ${job.id} 完成`);
  });

  getGithubTrendingStartWorker.on("failed", (job, err) => {
    console.error(`任务： ${job?.id} 失败，错误： ${err.message}`);
  });

  const getGithubTrendingByLanguageAndTimeWorker = new Worker<{
    language: CommonProgrammingLanguage,
    since: TrendingPeriod,
    taskId: number
  }, undefined, string>(
    GetGithubTrendingByLanguageAndTimeQueueName,
    async (job) => {
      console.log(`任务： ${job.id}，用于获取 ${job.data.language} 的 ${job.data.since} 趋势数据`);
      const githubTrending = new GithubTrending();
      const repos = await githubTrending.fetchTrendingRepos(job.data.since, job.data.language, job.data.taskId);

      console.log(`任务： ${job.id}，获取 ${job.data.language} 的 ${job.data.since} 趋势数据完成，共获取 ${repos.length} 条数据`);

      const insertedRepos = await db
        .insert(trendingReposTable)
        .values(repos)
        .onConflictDoNothing()
        .returning();

      console.log(`任务完成，实际插入到 repos 表的记录数：${insertedRepos.length}`);

    },
    { connection, concurrency: 3, limiter: { max: 5, duration: 1000 }}
  );

  getGithubTrendingByLanguageAndTimeWorker.on("completed", (job) => {
    console.log(`排行榜 - ${job.data.language} - ${job.data.since} - 任务 ${job.id} 完成`);
  });

  getGithubTrendingByLanguageAndTimeWorker.on("failed", (job, err) => {
    console.error(`排行榜 - ${job?.data.language} - ${job?.data.since} - 任务 ${job?.id} 失败，错误： ${err.message}\n${err.stack}`);
  });

  const getGithubTrendingByLanguageAndTimeDoneWorker = new Worker(
    GetGithubTrendingByLanguageAndTimeDoneQueueName,
    async (job) => {
      console.log(`任务： ${job.id} ，name: ${job.name} 所有 get-github-trending 语言和时间段任务组任务完成，开始分开处理单个仓库。`);

      await db
      .update(trendingTasksTable)
      .set({
        status: "done",
        updatedAt: new Date(),
      })
      .where(eq(trendingTasksTable.id, job.data.taskId));
    },
    { connection }
  );

  getGithubTrendingByLanguageAndTimeDoneWorker.on("completed", (job) => {
    console.log(`任务： ${job.id} 完成`);
  });

  getGithubTrendingByLanguageAndTimeDoneWorker.on("failed", (job, err) => {
    console.error(`任务： ${job?.id} 失败，错误： ${err.message}`);
    console.error(err.stack)
  });
}

// 启动 worker
startWorker().catch(console.error);
