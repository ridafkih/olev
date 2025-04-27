import type { NotificationService } from "./NotificationService";

export interface Notification {
  getTitle(): string;
  getIcon(): string;
  getTags(): Record<string, string>;
  getChannel(): string;
  getDescription(): string;
  setChannel(channel: string): this;
  setDescription(description: string): this;
  setTags(tags: Record<string, string>): this;
  send(service: NotificationService): Promise<void>;
}
