import { createClient } from "redis"
import { isUrlValid } from "./utils/url";

const { REDIS_URL } = process.env;

if (!isUrlValid(REDIS_URL)) {
  throw Error(`An invalid \`REDIS_URL\` '${REDIS_URL}' was passed.`)
}

const store = await createClient({ url: REDIS_URL }).connect()
await store.flushAll()
await store.flushDb()

await store.disconnect()