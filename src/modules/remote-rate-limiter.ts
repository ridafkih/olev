import { KeyValueRemoteStore } from "../interfaces/KeyValueRemoteStore";

export class RemoteRateLimitStore {
  private readonly cooldownMs: number;
  
  constructor(
    private readonly database: KeyValueRemoteStore,
    cooldownMinutes: number,
  ) {
    this.cooldownMs = cooldownMinutes * 60 * 1000;
  }
  
  public async checkpoint(identifier: string): Promise<void> {
    const now = new Date();
    const nextCheckpoint = new Date(now.getTime() + this.cooldownMs);
    const value = nextCheckpoint.toISOString();

    await this.database.set(identifier, value);
  }

  public async isRateLimited(identifier: string): Promise<boolean> {
    const value = await this.database.get(identifier);

    if (!value) {
      return false;
    }

    const date = new Date(value);
    return date.getTime() > Date.now();
  }
}