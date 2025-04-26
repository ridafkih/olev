import { NextResponse } from "next/server"
import { type } from "arktype";
import { LeverPlatform } from "../../platforms/LeverPlatform";
import { RedisJobBoardHashStore } from "../../modules/RedisJobBoardHashStore";
import { LogSnagJobListingNotificationService } from "../../modules/LogSnagJobListingNotificationService";
import { EnvironmentVariableManager } from "../../modules/EnvironmentVariableManager";
import { XXHashGenerator } from "../../modules/XXHashGenerator";

const {
  LOGSNAG_API_KEY,
  LOGSNAG_PROJECT_NAME,
  REDIS_URL
} = new EnvironmentVariableManager(process.env, type({
  REDIS_URL: 'string.url',
  LOGSNAG_PROJECT_NAME: 'string',
  LOGSNAG_API_KEY: 'string',
})).getAll()

const redisHashStore = new RedisJobBoardHashStore(REDIS_URL)
await redisHashStore.start();

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url")
  const { hostname, pathname } = url !== null ? new URL(url) : {}

  if (!url || !hostname || pathname) {
    throw Error(`Invalid URL has been passed into the 'url' query parameter.`)
  }

  const channel = [hostname, pathname].join("_").replace(/[^a-z0-9_]/g, '_')
  const notificationService = new LogSnagJobListingNotificationService(LOGSNAG_API_KEY, LOGSNAG_PROJECT_NAME, channel, "lever")

  try {
    const lever = new LeverPlatform(url)

    const listings = await lever.getListings();
    const hash = new XXHashGenerator(listings, ({ id, title }) => id + title).toString();

    const matches = await redisHashStore.checkKey(url, hash);

    if (matches) {
      await Promise.all([
        redisHashStore.setKey(url, hash),
        notificationService.notifyChangeDetected(url, hash),
      ]);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Support submission failed:', error)
    notificationService.notifyCheckFailed(url)
    return NextResponse.json(null, { status: 500 })
  } finally {
    redisHashStore.stop()
  }
} 