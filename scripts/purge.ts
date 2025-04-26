import { type } from "arktype";
import { EnvironmentVariableManager } from "../src/modules/EnvironmentVariableManager";
import { RedisJobBoardHashStore } from "../src/modules/RedisJobBoardHashStore";

const {
  REDIS_URL
} = new EnvironmentVariableManager(process.env, type({
  REDIS_URL: 'string.url',
})).getAll()

const redisHashStore = new RedisJobBoardHashStore(REDIS_URL)
await redisHashStore.start();
await redisHashStore.purge();
await redisHashStore.stop();

console.log("Database has been successfully purged.");