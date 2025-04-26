import xxhash from "@ridafkih/xxhash-wasm";
import type { HashGenerator } from "../types/HashGenerator";

export class XXHashGenerator<T extends unknown[]> implements HashGenerator {
  private readonly hash = xxhash().create32();
  
  constructor(
    private readonly data: T,
    private readonly extract: (value: T[number]) => string
  ) {}

  public toString(): string {
    for (const element of this.data) {
      const component = this.extract(element);
      this.hash.update(component);
    }

    return this.hash.digest().toString(16);
  }
}