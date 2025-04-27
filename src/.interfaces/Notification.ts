import type { NotificationService } from "./NotificationService";

export interface Notification {
  getTitle(): string;
  getIcon(): string;
  getTags(): Record<string, string>;
  getChannel(): string;
  getDescription(): string;
  setChannel(channel: string): void;
  setDescription(description: string): void;
  setTags(tags: Record<string, string>): void;
  send(service: NotificationService): Promise<void>;
}
