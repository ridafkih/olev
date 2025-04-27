export interface KeyValueRemoteStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  purge(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
}
