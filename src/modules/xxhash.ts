import type { HashGenerator } from "../interfaces/HashGenerator";
import xxhash, { type XXHash } from "@ridafkih/xxhash-wasm";

export class XXHashGenerator implements HashGenerator {
  private readonly hash: XXHash<number>;

  constructor() {
    this.hash = xxhash().create32();
  }

  private getHexValue(): string {
    return this.hash.digest().toString(16).padStart(8, "0");
  }

  public compare(other: string): boolean {
    return this.getHexValue() === other;
  }

  public toString(): string {
    return this.getHexValue();
  }

  public update(value: string): void {
    this.hash.update(value);
  }
}
