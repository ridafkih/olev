import twilio, { type Twilio } from "twilio";
import type { NotificationService } from "../../interfaces/NotificationService";
import type { Notification } from "../../interfaces/Notification";

export class TwilioNotificationService implements NotificationService {
  private readonly client: Twilio;

  constructor(
    private readonly from: string,
    private readonly to: string,
    sid: string,
    accessToken: string,
  ) {
    this.client = twilio(sid, accessToken);
  }

  public async notify(notification: Notification): Promise<void> {
    const tags = Object.values(notification.getTags());
    const hashtags = tags.map((tag) => `#${tag}`).join(", ");

    await this.client.messages.create({
      to: this.to,
      from: this.from,
      body: [notification.getDescription(), hashtags].join("\n\n"),
    });
  }
}
