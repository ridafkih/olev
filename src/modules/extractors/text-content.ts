import type { ElementPropertyExtractor } from "../../interfaces/ElementPropertyExtractor";

export class TextContentExtractor implements ElementPropertyExtractor {
  extract(element: Element): string {
    return element.textContent || "";
  }
}
