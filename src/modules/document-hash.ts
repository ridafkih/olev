import type { ElementPropertyExtractor } from "../interfaces/ElementPropertyExtractor";
import type { HashGenerator } from "../interfaces/HashGenerator";
import { RemoteDocument } from "./remote-document";

export class DocumentHasher {
  constructor(
    private readonly remoteDocument: RemoteDocument,
    private readonly hashGenerator: HashGenerator,
  ) {}

  updateHash(selector: string, extractor: ElementPropertyExtractor): this {
    const elements = this.remoteDocument
      .getDocument()
      .querySelectorAll(selector);

    const values = Array.from(elements).map(extractor.extract);

    for (const value of values) {
      this.hashGenerator.update(value);
    }

    return this;
  }
}
