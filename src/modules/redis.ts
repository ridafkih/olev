import { createClient, type RedisClientType } from "redis";
import type { KeyValueRemoteStore } from "../interfaces/KeyValueRemoteStore";

export class Redis implements KeyValueRemoteStore {
  private readonly client: RedisClientType;

  constructor(private readonly url: string) {
    this.client = createClient({ url });
  }

  public async get(key: string): Promise<string | null> {
    const value = await this.client.get(key);
    return value ?? null;
  }

  public async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  public async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  public async purge(): Promise<void> {
    await this.client.flushAll();
  }

  public async start(): Promise<void> {
    await this.client.connect();
  }

  public async stop(): Promise<void> {
    await this.client.disconnect();
  }
}
