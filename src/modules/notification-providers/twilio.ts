import twilio, { type Twilio } from "twilio";
import type { NotificationService } from "../../interfaces/NotificationService";
import type { Notification } from "../../interfaces/Notification";

export class TwilioNotificationService implements NotificationService {
    private readonly client: Twilio
    
    constructor(
        private readonly from: string,
        private readonly to: string,
        sid: string,
        accessToken: string,
    ) {
        this.client = twilio(sid, accessToken);
    }
    
    public async notify(notification: Notification): Promise<void> {
        await this.client.messages.create({
            to: this.to,
            from: this.from,
            body: [
                `${notification.getIcon()} ${notification.getTitle()}`,
                notification.getChannel(),
                notification.getDescription(),
                Object.values(notification.getTags()).map((tag) => {
                    return `#${tag}`;
                }).join(", ")
            ].join("\n\n")
        })
    }
}
