import type { Notification } from "../.interfaces/Notification";
import type { NotificationService } from "../.interfaces/NotificationService";

export class HashNotification implements Notification {
  private readonly icon: string;

  private channel: string;
  private description: string;
  private tags: Record<string, string>;
  
  constructor(
    private readonly title: string,
    isError: boolean,
  ) {
    this.icon = isError ? "🚨" : "📋";
  }

  getChannel(): string {
    return this.channel;
  }

  getDescription(): string {
    return this.description;
  }

  getIcon(): string {
    return this.icon;
  }

  getTags(): Record<string, string> {
    return this.tags;
  }

  getTitle(): string {
    return this.title;
  }

  setChannel(channel: string): void {
    this.channel = channel;
  }

  setDescription(description: string): void {
    this.description = description;
  }

  setTags(tags: Record<string, string>): void {
    this.tags = tags;
  }

  async send(service: NotificationService): Promise<void> {
    await service.notify(this);
  }
}