export class URLWhitelist {
  private readonly whitelistedUrls: string[];
  
  /**
   * @param whitelist A comma-delimited string of URLs to whitelist.
   */
  constructor(whitelistString?: string) {
    this.whitelistedUrls = whitelistString ? 
      whitelistString.split(',').map(url => url.trim()) : [];
  }

  public isAllowed(url: string): boolean {
    if (this.whitelistedUrls.length === 0) {
      return true;
    }

    return this.whitelistedUrls.includes(url);
  }
}
