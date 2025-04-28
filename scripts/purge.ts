import { type } from "arktype";
import { EnvironmentVariableManager } from "../src/modules/environment";
import { Redis } from "../src/modules/redis";

const { REDIS_URL } = new EnvironmentVariableManager(
  process.env,
  type({
    REDIS_URL: "string.url",
  }),
).getAll();

const redisClient = new Redis(REDIS_URL);
await redisClient.start();
await redisClient.purge();
await redisClient.stop();

console.log("Database has been successfully purged.");
