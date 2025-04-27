export interface JobBoardHashStore {
  checkHash(key: string, digest: string): Promise<boolean>;
  saveHash(key: string, value: string): Promise<void>;
}