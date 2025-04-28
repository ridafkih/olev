import { LogSnag } from "logsnag";
import type { Notification } from "../../interfaces/Notification";
import type { NotificationService } from "../../interfaces/NotificationService";

export class LogSnagNotificationService implements NotificationService {
  private readonly client: LogSnag;

  constructor(project: string, token: string) {
    this.client = new LogSnag({ project, token });
  }

  async notify(notification: Notification): Promise<void> {
    await this.client.track({
      event: notification.getTitle(),
      channel: notification.getChannel(),
      description: notification.getDescription(),
      icon: notification.getIcon(),
      tags: notification.getTags(),
      notify: true,
    });
  }
}
