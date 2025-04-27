export interface Hash {
  toString(): string;
  update(value: string): void;
  compare(other: string): boolean;
}
