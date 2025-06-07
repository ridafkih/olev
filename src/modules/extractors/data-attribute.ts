import type { ElementPropertyExtractor } from "../../interfaces/ElementPropertyExtractor";

export class DataAttributeExtractor implements ElementPropertyExtractor {
  constructor(private readonly dataAttributeName: string) {}

  extract(element: Element): string {
    const candidate = element.getAttribute(`[${this.dataAttributeName}]`);

    if (!candidate) {
      throw new Error(
        `Attempted to get the attribute '${this.dataAttributeName}' from an element that did not have it.`,
      );
    }

    return candidate;
  }
}
