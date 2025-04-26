import LogSnag from "logsnag"
import { NextResponse } from "next/server"
import xxhash from "@ridafkih/xxhash-wasm";
import { createClient } from "redis"
import { isUrlValid } from "../../../utils/url";
import { Lever } from "../../../platforms/lever";

const { REDIS_URL, LOGSNAG_PROJECT_NAME, LOGSNAG_API_KEY } = process.env;
const logsnag = LOGSNAG_API_KEY && LOGSNAG_PROJECT_NAME
  ? new LogSnag({
    project: LOGSNAG_PROJECT_NAME,
    token: LOGSNAG_API_KEY,
  })
  : undefined

if (!logsnag) {
  console.warn("LogSnag is not configured, so you will not receive notifications on this endpoint.")
}

if (!isUrlValid(REDIS_URL)) {
  throw Error(`An invalid \`REDIS_URL\` '${REDIS_URL}' was passed.`)
}

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url")
  const store = await createClient({ url: REDIS_URL }).connect()

  try {
    if (!url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const platformUrl = new URL(url)
    const channel = (platformUrl.hostname + "_" + platformUrl.pathname)
      .replace(/[^a-z0-9_]/g, '_')
    
    const hash = xxhash().create32()
    const lever = new Lever(platformUrl.toString())
    const listings = await lever.getListings();

    for (const listing of listings) {
      const { id, title } = listing;
      hash.update(id + title);
    }

    const digest = hash.digest().toString(16)
    const storedHash = await store.get(url)

    if (storedHash === null || storedHash !== digest) {
      await store.set(url, digest);
      logsnag?.track({
        channel,
        event: "Listings Change Detected",
        description: `A change was detected in the listings at '${url}', and a new hash ${digest} has been generated and saved.`,
        icon: '📋',
        notify: true,
        tags: { url, platform: 'lever' },
      })
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Support submission failed:', error)

    logsnag?.track({
      event: 'Listing Check Failed',
      description: `Something went wrong with checking the listings when checking '${url}'`,
      channel: "failures",
      icon: "🚨",
      notify: true,
    })

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    store.disconnect()
  }
} 