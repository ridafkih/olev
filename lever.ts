import redis from "redis";
import xxhash from "@ridafkih/xxhash-wasm"
import { LogSnag } from 'logsnag';
import { isUrlValid } from "./utils/url";
import { Lever } from "./platforms/lever";
import type { JobListing } from "./types/Platform";

const { REDIS_URL, LOGSNAG_PROJECT_NAME, LOGSNAG_API_KEY } = process.env;
const [, , url] = process.argv;

if (!isUrlValid(url)) {
  throw Error(`An invalid URL '${url}' was passed.`)  
}

if (!isUrlValid(REDIS_URL)) {
  throw Error(`An invalid \`REDIS_URL\` '${REDIS_URL}' was passed.`)
}

if (!LOGSNAG_PROJECT_NAME || !LOGSNAG_API_KEY) {
  throw Error(`Logsnag was misconfigured, with a respective project name and API key set to '${LOGSNAG_PROJECT_NAME}' and '${LOGSNAG_API_KEY}'`)
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

const logsnag = new LogSnag({ token: LOGSNAG_API_KEY, project: LOGSNAG_PROJECT_NAME });

if (storedHash === null || storedHash !== digest) {
  console.log([
    "⚠️",
    `'${storedHash}' was stored and failed the check against '${digest}'.`,
    `This hash was generated based off the contents of ${listings.length} listings on '${url}'.`,
    "Saving new value and notifying."
  ].join("\n"))

  const urlObject = new URL(url);

  await logsnag.track({
    channel: (urlObject.hostname + "_" + urlObject.pathname).replace(/[^a-z0-9_]/g, '_'),
    event: "Listings Change Detected",
    description: `A change was detected in the listings at '${url}', and a new hash ${digest} has been generated and saved.`,
    icon: '📋',
    notify: true,
    tags: { url, platform: 'lever' },
    timestamp: Date.now(),
  })

  await store.set(url, digest);
} else {
  console.log([
    `'${storedHash}' was stored and passed the check against '${digest}'.`,
    `This hash was generated based off the contents of ${listings.length} listings on '${url}'.`,
    "No changes or notifications needed."
  ].join("\n"))
}

await store.disconnect();
