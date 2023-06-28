import { Knex } from "knex";
import { Redis } from "ioredis";

export async function isHealthy(pg: Knex, redis: Redis) {
  if (redis.status !== "ready") {
    throw new Error("redis is not ready");
  }

  try {
    await pg.raw("select now()");
  } catch (err) {
    throw new Error("postgres is not ready");
  }
}
