import { type } from "arktype";
import { EnvironmentVariableManager } from "../../modules/environment";
import { URLWhitelist } from "../../modules/url-whitelist";
import { Redis } from "../../modules/redis";
import { LogSnagNotificationService, LogSnagUtilities } from "../../modules/logsnag";
import { RemoteRateLimitStore } from "../../modules/remote-rate-limiter";
import { HashNotification } from "../../modules/notifications";
import { RemoteDocument } from "../../modules/remote-document";
import { DocumentHasher } from "../../modules/document-hash";
import { XXHash } from "../../modules/xxhash";
import { JobListingIDExtractor } from "../../modules/lever";
import { RemoteHashStore } from "../../modules/remote-hash-store";

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

const redisClient = new Redis(REDIS_URL)
await redisClient.start()

const whitelist = new URLWhitelist(WHITELIST_URLS)
const rateLimiter = new RemoteRateLimitStore(redisClient, 10);
const redisHashStore = new RemoteHashStore(redisClient);

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const jobBoardUrlString = requestUrl.searchParams.get("url")

  if (!jobBoardUrlString) {
    return new Response(null, { status: 400 });
  }

  const {
    hostname: jobBoardHostname,
    pathname: jobBoardPathname,
  } = new URL(jobBoardUrlString);

  const channel = LogSnagUtilities.getChannelName(jobBoardHostname, jobBoardPathname);

  if (!whitelist.isAllowed(channel)) {
    return new Response(null, { status: 403 });
  }

  const isRateLimited = await rateLimiter.isRateLimited(channel);

  if (isRateLimited) {
    return new Response(null, { status: 429 });
  }

  const notificatonService = new LogSnagNotificationService(
    LOGSNAG_PROJECT_NAME,
    LOGSNAG_API_KEY
  );

  try {
    const document = await RemoteDocument.fromUrl(jobBoardUrlString);

    const hash = new XXHash();
    const remoteDocumentHasher = new DocumentHasher(document);
    const digest = await remoteDocumentHasher.hash('[data-qa-posting-id]', new JobListingIDExtractor(), hash);

    const matches = await redisHashStore.checkHash(digest);

    if (!matches) {
      await redisHashStore.saveHash(digest);
      await new HashNotification("Listings Change Detected", false)
        .setChannel(channel)
        .setDescription(`A change was detected in the listings at '${jobBoardUrlString}', and a new hash '${digest}' has been generated and saved.`)
        .setTags({ url: jobBoardUrlString, platform: jobBoardHostname })
        .send(notificatonService)
    }

    await rateLimiter.checkpoint(channel);
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error(error);

    await new HashNotification("Listing Check Failed", true)
      .setChannel(channel)
      .setDescription(`Something went wrong with checking the listings when checking '${jobBoardUrlString}'`)
      .setTags({ platform: jobBoardHostname })
      .send(notificatonService);

    return new Response(null, { status: 500 });
  }
}