import type { Notification } from "./Notification";

export interface NotificationService {
  notify(notification: Notification): Promise<void>;
}