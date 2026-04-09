import { Redis } from "@upstash/redis";

let restClient: Redis | null = null;

export function getUpstashRestRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!restClient) {
    restClient = new Redis({ url, token });
  }
  return restClient;
}
