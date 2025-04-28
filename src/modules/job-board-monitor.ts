import { LeverPostingIDExtractor } from "./extractors/lever-posting-id";
import { DocumentHasher } from "./document-hash";
import { TextContentExtractor } from "./extractors/text-content";
import { HashNotification } from "./notifications";
import { RemoteDocument } from "./remote-document";
import { XXHashGenerator } from "./xxhash";
import type { RemoteHashStore } from "./stores/remote-hash-store";
import type { RemoteRateLimitStore } from "./stores/remote-rate-limit-store";
import type { URLWhitelist } from "./url-whitelist";
import type { NotificationService } from "../interfaces/NotificationService";

export class LeverJobBoardMonitor {
  constructor(
    private readonly whitelist: URLWhitelist,
    private readonly rateLimiter: RemoteRateLimitStore,
    private readonly hashStore: RemoteHashStore,
    private readonly notificationServices: NotificationService[],
  ) {}

  private getChannel(url: string): string {
    const { hostname, pathname } = new URL(url);
    return [hostname, pathname].join("_").replace(/[^a-z0-9_]/g, "_");
  }

  async check(url: string): Promise<Response> {
    if (!this.whitelist.isAllowed(url)) {
      return new Response(null, { status: 403 });
    }

    const channel = this.getChannel(url);
    const { hostname: platform } = new URL(url);

    if (await this.rateLimiter.isRateLimited(channel)) {
      return new Response(null, { status: 429 });
    }

    try {
      const document = await RemoteDocument.fromUrl(url);
      const hash = new XXHashGenerator();

      new DocumentHasher(document, hash)
        .updateHash(
          ".posting[data-qa-posting-id]",
          new LeverPostingIDExtractor(),
        )
        .updateHash(".posting h5.posting-name", new TextContentExtractor());

      const isDuplicate = await this.hashStore.checkHash(hash);

      if (!isDuplicate) {
        await this.hashStore.saveHash(hash);
        const notification = new HashNotification(
          "Listings Change Detected",
          false,
        )
          .setChannel(channel)
          .setTags({ url, platform })
          .setDescription(
            `A change was detected in the listings at ${url} and the hash '${hash}' has been saved.`,
          );

        await Promise.all(
          this.notificationServices.map((notificationService) => {
            notification.send(notificationService);
          }),
        );
      }

      await this.rateLimiter.checkpoint(channel);
      return new Response(hash.toString(), { status: 200 });
    } catch (error) {
      console.error(error);
      const failNotification = new HashNotification(
        "Listing Check Failed",
        true,
      )
        .setChannel(channel)
        .setTags({ platform })
        .setDescription(`Something went wrong while checking '${url}'`);

      await Promise.all(
        this.notificationServices.map((notificationService) => {
          failNotification.send(notificationService);
        }),
      );

      return new Response(null, { status: 500 });
    }
  }
}
