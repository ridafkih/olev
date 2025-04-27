import { createClient, type RedisClientType } from "redis";

export class RedisClient {
  private readonly client: RedisClientType;

  constructor(private readonly redisUrlString: string) {
    this.client = createClient({ url: this.redisUrlString });
  }

  public async start(): Promise<void> {
    await this.client.connect();
  }

  public async stop(): Promise<void> {
    await this.client.disconnect();
  }

  public async setKey(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  public getKey(key: string): Promise<string | null> {
    return this.client.get(key);
  }
}
