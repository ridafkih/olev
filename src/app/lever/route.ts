import { type } from "arktype";
import { NextResponse } from "next/server"
import { LeverPlatform } from "../../platforms/LeverPlatform";
import { RedisJobBoardHashStore } from "../../modules/RedisJobBoardHashStore";
import { LogSnagJobListingNotificationService } from "../../modules/LogSnagJobListingNotificationService";
import { EnvironmentVariableManager } from "../../modules/EnvironmentVariableManager";
import { XXHashGenerator } from "../../modules/XXHashGenerator";
import { RedisRateLimiter } from "../../modules/RedisRateLimiter";
import { UrlWhitelist } from "../../modules/UrlWhitelist";
import { RedisClient } from "../../modules/RedisClient";

const {
  LOGSNAG_API_KEY,
  LOGSNAG_PROJECT_NAME,
  REDIS_URL,
  WHITELIST_URLS
} = new EnvironmentVariableManager(process.env, type({
  REDIS_URL: 'string.url',
  LOGSNAG_PROJECT_NAME: 'string',
  LOGSNAG_API_KEY: 'string',
  WHITELIST_URLS: 'string?'
})).getAll()

const urlWhitelist = new UrlWhitelist(WHITELIST_URLS);
const redisClient = new RedisClient(REDIS_URL);

await redisClient.start();

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url")
  const { hostname, pathname } = url !== null ? new URL(url) : {}

  if (!url || !hostname || !pathname) {
    throw Error(`Invalid URL has been passed into the 'url' query parameter.`)
  }

  if (!urlWhitelist.isAllowed(url)) {
    return new NextResponse(null, { status: 403 });
  }

  const rateLimiter = new RedisRateLimiter(redisClient)

  if (await rateLimiter.isRateLimited(url)) {
    return new NextResponse(null, { status: 429 });
  }

  const channel = [hostname, pathname].join("_").replace(/[^a-z0-9_]/g, '_')
  const notificationService = new LogSnagJobListingNotificationService(LOGSNAG_API_KEY, LOGSNAG_PROJECT_NAME, channel, "lever")

  try {
    const lever = new LeverPlatform(url)

    const listings = await lever.getListings();
    const hash = new XXHashGenerator(listings, ({ id, title }) => id + title).toString();

    const redisHashStore = new RedisJobBoardHashStore(redisClient, hash)
    const matches = await redisHashStore.checkHash(hash);

    if (!matches) {
      await Promise.all([
        redisHashStore.saveHash(hash),
        notificationService.notifyChangeDetected(url, hash),
      ]);
    }

    await rateLimiter.recordAccess(url);
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    notificationService.notifyCheckFailed(url)
    return NextResponse.json(null, { status: 500 })
  }
} 