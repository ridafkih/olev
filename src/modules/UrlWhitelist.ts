export class UrlWhitelist {
  private readonly whitelistedUrls: string[];

  constructor(whitelistString?: string) {
    this.whitelistedUrls = whitelistString ? 
      whitelistString.split(',').map(url => url.trim()) : [];
  }

  isAllowed(url: string): boolean {
    if (this.whitelistedUrls.length === 0) {
      return true;
    }
    
    return this.whitelistedUrls.includes(url);
  }
} 