import type { RedisClient } from "./RedisClient";

export class RedisRateLimiter {
  private readonly ratePrefix = "rate_limit:";
  private readonly cooldownPeriodMs: number;

  constructor(
    private readonly client: RedisClient,
    cooldownPeriodMinutes = 15
  ) {
    this.cooldownPeriodMs = cooldownPeriodMinutes * 60 * 1000;
  }

  async isRateLimited(key: string): Promise<boolean> {
    const lastAccessTime = await this.client.getKey(`${this.ratePrefix}${key}`);
    
    if (!lastAccessTime) return false;
    
    const elapsedTime = Date.now() - parseInt(lastAccessTime);
    return elapsedTime < this.cooldownPeriodMs;
  }

  async recordAccess(key: string): Promise<void> {
    await this.client.setKey(`${this.ratePrefix}${key}`, Date.now().toString());
  }
} 