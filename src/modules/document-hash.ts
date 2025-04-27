import type { ElementPropertyExtractor } from "../interfaces/ElementPropertyExtractor";
import type { HashGenerator } from "../interfaces/HashGenerator";
import { RemoteDocument } from "./remote-document";

export class DocumentHasher {
  constructor(private readonly remoteDocument: RemoteDocument) {}
  
  async hash(
    selector: string,
    extractor: ElementPropertyExtractor,
    hashGenerator: HashGenerator,
  ): Promise<string> {
    const elements = this.remoteDocument.getDocument().querySelectorAll(selector);
    const values = Array.from(elements).map(extractor.extract);

    for (const value of values) {
      hashGenerator.update(value);
    }

    return hashGenerator.toString();
  }
}
