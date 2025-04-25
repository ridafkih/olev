import redis from "redis";
import xxhash from "@ridafkih/xxhash-wasm"
import { isUrlValid } from "./utils/url";
import { Lever } from "./platforms/lever";

const { REDIS_URL } = process.env;
const [, , url] = process.argv;

if (!isUrlValid(url)) {
  throw Error(`An invalid URL '${url}' was passed.`)  
}

if (!isUrlValid(REDIS_URL)) {
  throw Error(`An invalid \`REDIS_URL\` '${REDIS_URL}' was passed.`)
}

const hash = xxhash().create32()

const lever = new Lever(url)
const listings = await lever.getListings();

for (const listing of listings) {
  const { id, title } = listing;
  hash.update(id + title);
}

const digest = hash.digest().toString(16)

const store = await redis.createClient({ url: REDIS_URL }).connect()
const storedHash = await store.get(url)

if (storedHash === null || storedHash !== digest) {
  console.log([
    "⚠️",
    `'${storedHash}' was stored and failed the check against '${digest}'.`,
    `This hash was generated based off the contents of ${listings.length} listings on '${url}'.`,
    "Saving new value and notifying."
  ].join("\n"))

  await store.set(url, digest);
} else {
  console.log([
    `'${storedHash}' was stored and passed the check against '${digest}'.`,
    `This hash was generated based off the contents of ${listings.length} listings on '${url}'.`,
    "No changes or notifications needed."
  ].join("\n"))
}

await store.disconnect();