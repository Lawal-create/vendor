import IORedis from "ioredis";
import { Logger } from "@app/internal/logger";
import env from "./env";

export async function createRedis(logger: Logger) {
  const redis = new IORedis(env.redis_url, { password: env.redis_password });
  redis.on("error", err => logger.error(err));

  return redis;
}
