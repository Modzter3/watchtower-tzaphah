import { Worker } from "bullmq";
import IORedis from "ioredis";
import { processArticleClassification } from "@/lib/queue/process-one";

const url = process.env.REDIS_URL;

if (!url) {
  console.error("REDIS_URL is required to run the BullMQ worker.");
  process.exit(1);
}

const connection = new IORedis(url, { maxRetriesPerRequest: null });

export const classificationWorker = new Worker(
  "article-classification",
  async (job) => {
    const { articleId } = job.data as { articleId: string };
    const result = await processArticleClassification(articleId);
    if (!result.ok) throw new Error(result.error);
    return { success: true };
  },
  { connection },
);

classificationWorker.on("failed", (job, err) => {
  console.error("Job failed", job?.id, err);
});
