import { type } from "arktype";
import { EnvironmentVariableManager } from "../src/modules/EnvironmentVariableManager";
import { RedisClient } from "../src/modules/RedisClient";

const {
  REDIS_URL
} = new EnvironmentVariableManager(process.env, type({
  REDIS_URL: 'string.url',
})).getAll()

const redisClient = new RedisClient(REDIS_URL);
await redisClient.start();
await redisClient.purge();
await redisClient.stop();

console.log("Database has been successfully purged.");