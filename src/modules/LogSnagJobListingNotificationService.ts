import LogSnag from "logsnag"
import type { JobListingNotificationService } from "../types/JobListingNotificationService"

export class LogSnagJobListingNotificationService implements JobListingNotificationService {
  private readonly client: LogSnag;
  
  constructor(
    token: string,
    project: string,
    private readonly channel: string,
    private readonly platform: string,
  ) {
    this.client = new LogSnag({ project, token })
  }
  
  public async notifyChangeDetected(url: string, digest: string): Promise<void> {
    await this.client.track({
      channel: this.channel,
      event: "Listings Change Detected",
      description: `A change was detected in the listings at '${url}', and a new hash ${digest} has been generated and saved.`,
      icon: '📋',
      notify: true,
      tags: { url, platform: this.platform },
    })
  }

  public async notifyCheckFailed(identifier: string): Promise<void> {
    await this.client.track({
      event: 'Listing Check Failed',
      description: `Something went wrong with checking the listings when checking '${identifier}'`,
      channel: "failures",
      icon: "🚨",
      notify: true,
      tags: { platform: this.platform }
    })
  }
}