import type { ElementPropertyExtractor } from "../interfaces/ElementPropertyExtractor";

export class JobListingIDExtractor implements ElementPropertyExtractor {
  extract(element: Element): string {
    const candidate = element.getAttribute("data-qa-posting-id");

    if (!candidate) {
      throw new Error("Attempted to search an element for 'data-qa-posting-id' but no attribute was found.");
    }

    return candidate;
  }
}
