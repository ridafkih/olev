import { type } from "arktype";
import { EnvironmentVariableManager } from "./environment";
import { LogSnagNotificationService } from "./notification-providers/logsnag";
import { TwilioNotificationService } from "./notification-providers/twilio";
import { Redis } from "./redis";
import { RemoteHashStore } from "./stores/remote-hash-store";
import { RemoteRateLimitStore } from "./stores/remote-rate-limit-store";
import { URLWhitelist } from "./url-whitelist";
import type { NotificationService } from "../interfaces/NotificationService";

export class ServiceFactory {
  static async create() {
    const env = new EnvironmentVariableManager(
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

    const redis = new Redis(env.REDIS_URL);
    await redis.start();

    const notifiers: NotificationService[] = [
      new LogSnagNotificationService(env.LOGSNAG_PROJECT_NAME, env.LOGSNAG_API_KEY),
      new TwilioNotificationService(
        env.TWILIO_NUMBER_SENDER,
        env.TWILIO_NUMBER_RECIPIENT,
        env.TWILIO_SID,
        env.TWILIO_ACCESS_TOKEN,
      ),
    ];

    return {
      notifiers,
      whitelist: new URLWhitelist(env.WHITELIST_URLS),
      rateLimiter: new RemoteRateLimitStore(redis, 1),
      hashStore: new RemoteHashStore(redis),
    };
  }
}
