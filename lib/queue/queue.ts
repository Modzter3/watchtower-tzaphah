import { Queue } from "bullmq";
import IORedis from "ioredis";
import { getUpstashRestRedis } from "@/lib/queue/redis";

let classificationQueue: Queue | null = null;

function getBullConnection(): IORedis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  return new IORedis(url, { maxRetriesPerRequest: null });
}

export function getClassificationQueue(): Queue | null {
  if (classificationQueue) return classificationQueue;
  const connection = getBullConnection();
  if (!connection) return null;
  classificationQueue = new Queue("article-classification", { connection });
  return classificationQueue;
}

export async function queueArticleForClassification(
  articleId: string,
): Promise<void> {
  try {
    const queue = getClassificationQueue();
    if (queue) {
      await queue.add(
        "classify",
        { articleId },
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 2000 },
        },
      );
      return;
    }

    const redis = getUpstashRestRedis();
    if (redis) {
      await redis.rpush("tzaphah:classification_queue", articleId);
      return;
    }
  } catch (e) {
    console.error("queueArticleForClassification:", e);
  }

  /* No queue backend or queue failed: article stays QUEUED for process-queue cron. */
}
