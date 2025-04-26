import { createClient, type RedisClientType } from "redis";

export class RedisRateLimiter {
  private started: boolean = false;
  private readonly client: RedisClientType;
  private readonly ratePrefix = "rate_limit:";
  private readonly cooldownPeriodMs: number;

  constructor(redisUrl: string, cooldownPeriodMinutes = 15) {
    this.client = createClient({ url: redisUrl });
    this.cooldownPeriodMs = cooldownPeriodMinutes * 60 * 1000;
  }

  private assertStarted(callerMethodName: string) {
    if (!this.started)
      throw Error(`Ensure \`RedisRateLimiter#start\` has resolved before using \`RedisRateLimiter#${callerMethodName}\`.`)
  }

  async isRateLimited(key: string): Promise<boolean> {
    this.assertStarted("isRateLimited");
    const lastAccessTime = await this.client.get(`${this.ratePrefix}${key}`);
    
    if (!lastAccessTime) return false;
    
    const elapsedTime = Date.now() - parseInt(lastAccessTime);
    return elapsedTime < this.cooldownPeriodMs;
  }

  async recordAccess(key: string): Promise<void> {
    this.assertStarted("recordAccess");
    await this.client.set(`${this.ratePrefix}${key}`, Date.now().toString());
  }

  async start(): Promise<void> {
    await this.client.connect();
    this.started = true;
  }

  async stop(): Promise<void> {
    return this.client.disconnect();
  }
} 