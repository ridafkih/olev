import type { ElementPropertyExtractor } from "../../interfaces/ElementPropertyExtractor";

export class AnchorExtractor implements ElementPropertyExtractor {
  constructor() {}

  extract(element: Element): string {
    const candidate = element.getAttribute("href");

    if (!candidate) {
      throw new Error(
        `Attempted to get the attribute 'href' from an element that did not have it.`,
      );
    }

    return candidate;
  }
}
