export interface JobListing {
  id: string;
  title: string;
  group: string;
  category: string;
  attributes: string[];
  link: string;
}

export interface JobBoardPlatform {
  getListings(): Promise<JobListing[]>;
  getDocument(): Promise<Document>;
}
