import { JSDOM } from "jsdom"
import type { JobListing, Platform } from "../types/Platform";

enum LeverClassNames {
  POSTINGS_GROUP = 'postings-group',
  GROUP_HEADER = 'large-category-header',
  CATEGORY_HEADER = 'posting-category-title',
  POSTING = 'posting',
  POSTING_CATEGORIES = 'posting-categories'
}

export class Lever implements Platform {
  constructor(private readonly url: string) {}
  
  public async getDocument(): Promise<Document> {
    const text = await fetch(this.url)
      .then((response) => response.text());

    const { window } = new JSDOM(text);
    return window.document;
  }
  
  public async getListings(): Promise<JobListing[]> {
    const document = await this.getDocument();
    const groups = document.getElementsByClassName(LeverClassNames.POSTINGS_GROUP);

    const listings: JobListing[] = []
    let groupTitle: string | undefined;

    for (const group of groups) {
      const children = group.children;

      let categoryTitle: string | undefined;

      for (const child of children) {
        if (child.classList.contains(LeverClassNames.GROUP_HEADER)) {
          groupTitle = child.textContent ?? undefined;
        }

        if (child.classList.contains(LeverClassNames.CATEGORY_HEADER)) {
          categoryTitle = child.textContent ?? undefined
        }

        if (child.classList.contains(LeverClassNames.POSTING)) {
          if (!groupTitle)
            throw Error("Do not have `groupTitle` before processing a posting.")

          if (!categoryTitle)
            throw Error("Do not have `category` before processing a posting.");

          const id = child.getAttribute("data-qa-posting-id");
          const anchor = child.querySelector("a");
          console.log({ anchor})
          
          const link = anchor?.getAttribute("href")
          const title = anchor?.querySelector("h5")?.textContent;
          const attributes = [...anchor?.getElementsByClassName(LeverClassNames.POSTING_CATEGORIES) ?? []]
            .reduce<string[]>((accumulator, { textContent }) => {
              if (textContent) accumulator.push(textContent)
              return accumulator;
            }, [])
          
          if (!id) {
            throw Error("The `href` attribute of the anchor in a posting was not valid.")
          }

          if (!link) {
            throw Error("The `href` attribute of the anchor in a posting was not valid.")
          }

          if (!title) {
            throw Error("The `href` attribute of the anchor in a posting was not valid.")
          }

          listings.push({
            id,
            title,
            link,
            attributes,
            group: groupTitle,
            category: categoryTitle,
          })
        }
      }
    }
      
    return []
  }
}