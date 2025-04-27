export interface HashGenerator {
  toString(): string;
  update(value: string): void;
  compare(other: string): boolean;
}
