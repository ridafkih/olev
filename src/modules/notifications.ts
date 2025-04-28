import type { Notification } from "../interfaces/Notification";
import type { NotificationService } from "../interfaces/NotificationService";

export class HashNotification implements Notification {
  private readonly icon: string;

  private channel?: string;
  private description?: string;
  private tags?: Record<string, string>;

  constructor(
    private readonly title: string,
    isError: boolean,
  ) {
    this.icon = isError ? "🚨" : "📋";
  }

  getChannel(): string {
    if (!this.channel) {
      throw new Error("Channel is not set");
    }

    return this.channel;
  }

  getDescription(): string {
    if (!this.description) {
      throw new Error("Description is not set");
    }

    return this.description;
  }

  getIcon(): string {
    return this.icon;
  }

  getTags(): Record<string, string> {
    return this.tags ?? {};
  }

  getTitle(): string {
    return this.title;
  }

  setChannel(channel: string): this {
    this.channel = channel;
    return this;
  }

  setDescription(description: string): this {
    this.description = description;
    return this;
  }

  setTags(tags: Record<string, string>): this {
    this.tags = tags;
    return this;
  }

  async send(service: NotificationService): Promise<void> {
    await service.notify(this);
  }
}
