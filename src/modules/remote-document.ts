import { JSDOM } from "jsdom";

export class RemoteDocument {
  constructor(private readonly document: Document) {}

  public getDocument(): Document {
    return this.document;
  }

  public getElements(selector: string): Element[] {
    return Array.from(this.document.querySelectorAll(selector));
  }

  static async fromUrl(url: string): Promise<RemoteDocument> {
    const { window } = new JSDOM(url);
    const document = window.document;

    return new RemoteDocument(document);
  }
}