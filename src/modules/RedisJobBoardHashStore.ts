import type { JobBoardHashStore } from "../types/JobBoardHashStore";
import type { RedisClient } from "./RedisClient";

export class RedisJobBoardHashStore implements JobBoardHashStore {
  constructor(
    private readonly client: RedisClient,
    private readonly hash: string,
  ) {}

  public async saveHash(value: string): Promise<void> {
    await this.client.setKey(this.hash, value)
  }

  public async checkHash(digest: string): Promise<boolean> {
    return this.client.getKey(this.hash).then((value) => value === digest);
  }
}
