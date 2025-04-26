export interface JobBoardHashStore {
  checkKey(key: string, digest: string): Promise<boolean>;
  setKey(key: string, value: string): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
}