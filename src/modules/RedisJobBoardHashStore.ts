import { createClient, type RedisClientType } from "redis";
import type { JobBoardHashStore } from "../types/JobBoardHashStore";

export class RedisJobBoardHashStore implements JobBoardHashStore {
  private started: boolean = false;

  private readonly client;
  
  constructor(private readonly redisUrlString: string) {
    this.client = createClient({ url: this.redisUrlString });
  }

  private assertStarted(callerMethodName: string) {
    if (!this.started)
      throw Error(`Ensure \`RedisJobBoardHashStore#start\` has resolved before using \`RedisJobBoardHashStore#${callerMethodName}\`.`)
  }

  public async setKey(key: string, value: string): Promise<void> {
    this.assertStarted("setKey");
    await this.client.set(key, value)
  }

  public checkKey(key: string, digest: string): Promise<boolean> {
    this.assertStarted("checkKey");
    return this.client.get(key).then((value) => value === digest);
  }

  public async start(): Promise<void> {
    await this.client.connect()
    this.started = true;
  }

  public stop(): Promise<void> {    
    return this.client.disconnect()
  }
}