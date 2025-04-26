export interface JobListingNotificationService {
  /**
   * Should be called when a change has been detected on the job board.
   * @param digest The hash that was derived from listing contents and used to detect the change.
   */
  notifyChangeDetected(url: string, digest: string): Promise<void>;
  /**
   * Should be called when we failed to fetch or validate changed listings.
   * @param identifier Anything that we can use to identify where the request is going to.
   */
  notifyCheckFailed(identifier: string): Promise<void>;
}
