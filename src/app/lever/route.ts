import { type } from "arktype";
import { EnvironmentVariableManager } from "../../modules/environment";
import { URLWhitelist } from "../../modules/url-whitelist";
import { Redis } from "../../modules/redis";
import { LogSnagNotificationService } from "../../modules/notification-providers/logsnag";
import { TwilioNotificationService } from "../../modules/notification-providers/twilio";
import { HashNotification } from "../../modules/notifications";
import { RemoteDocument } from "../../modules/remote-document";
import { RemoteHashStore } from "../../modules/stores/remote-hash-store";
import { RemoteRateLimitStore } from "../../modules/stores/remote-rate-limit-store";
import { DocumentHasher } from "../../modules/document-hash";
import { XXHashGenerator } from "../../modules/xxhash";
import { LeverPostingIDExtractor } from "../../modules/extractors/lever-posting-id";
import { TextContentExtractor } from "../../modules/extractors/text-content";

const {
  LOGSNAG_API_KEY,
  LOGSNAG_PROJECT_NAME,
  REDIS_URL,
  WHITELIST_URLS,
  TWILIO_SID,
  TWILIO_ACCESS_TOKEN,
  TWILIO_NUMBER_SENDER,
  TWILIO_NUMBER_RECIPIENT,
} = new EnvironmentVariableManager(
  process.env,
  type({
    REDIS_URL: "string.url",
    LOGSNAG_PROJECT_NAME: "string",
    LOGSNAG_API_KEY: "string",
    WHITELIST_URLS: "string?",
    TWILIO_SID: "string",
    TWILIO_ACCESS_TOKEN: "string",
    TWILIO_NUMBER_SENDER: "string",
    TWILIO_NUMBER_RECIPIENT: "string",
  }),
).getAll();

const redisClient = new Redis(REDIS_URL);
await redisClient.start();

const whitelist = new URLWhitelist(WHITELIST_URLS);
const rateLimiter = new RemoteRateLimitStore(redisClient, 1);
const redisHashStore = new RemoteHashStore(redisClient);

const logSnagNotificationService = new LogSnagNotificationService(
  LOGSNAG_PROJECT_NAME,
  LOGSNAG_API_KEY,
);

const twilioNotificationService = new TwilioNotificationService(
  TWILIO_NUMBER_SENDER,
  TWILIO_NUMBER_RECIPIENT,
  TWILIO_SID,
  TWILIO_ACCESS_TOKEN,
);

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const jobBoardUrlString = requestUrl.searchParams.get("url");

  if (!jobBoardUrlString) {
    return new Response(null, { status: 400 });
  }

  const { hostname: jobBoardHostname, pathname: jobBoardPathname } = new URL(
    jobBoardUrlString,
  );

  const channel = [jobBoardHostname, jobBoardPathname]
    .join("_")
    .replace(/[^a-z0-9_]/g, "_");

  if (!whitelist.isAllowed(jobBoardUrlString)) {
    return new Response(null, { status: 403 });
  }

  const isRateLimited = await rateLimiter.isRateLimited(channel);

  if (isRateLimited) {
    return new Response(null, { status: 429 });
  }

  try {
    const document = await RemoteDocument.fromUrl(jobBoardUrlString);

    const hash = new XXHashGenerator();
    new DocumentHasher(document, hash)
      .updateHash(".posting[data-qa-posting-id]", new LeverPostingIDExtractor())
      .updateHash(".posting h5.posting-name", new TextContentExtractor());

    const matches = await redisHashStore.checkHash(hash);

    if (!matches) {
      await redisHashStore.saveHash(hash);
      const notification = new HashNotification(
        "Listings Change Detected",
        false,
      )
        .setChannel(channel)
        .setTags({ url: jobBoardUrlString, platform: jobBoardHostname })
        .setDescription(
          `A change was detected in the listings at ${jobBoardUrlString} and the hash '${hash.toString()}' has been generated and saved.`,
        );

      await Promise.all([
        notification.send(logSnagNotificationService),
        notification.send(twilioNotificationService),
      ]);
    }

    await rateLimiter.checkpoint(channel);
    return new Response(hash.toString(), { status: 200 });
  } catch (error) {
    console.error(error);

    await new HashNotification("Listing Check Failed", true)
      .setChannel(channel)
      .setDescription(
        `Something went wrong with checking the listings when checking '${jobBoardUrlString}'`,
      )
      .setTags({ platform: jobBoardHostname })
      .send(logSnagNotificationService);

    return new Response(null, { status: 500 });
  }
}
