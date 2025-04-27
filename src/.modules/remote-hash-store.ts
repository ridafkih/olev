import type { Hash } from "../.interfaces/Hash";
import type { KeyValueRemoteStore } from "../.interfaces/KeyValueRemoteStore";

export class RemoteHashStore {
  constructor(
    private readonly database: KeyValueRemoteStore,
  ) {}
  
  public async saveHash(hash: Hash): Promise<void> {
    await this.database.set(hash.toString(), hash.toString());
  }

  public async checkHash(hash: Hash): Promise<boolean> {
    const value = await this.database.get(hash.toString());
    return value === hash.toString();
  }
}
