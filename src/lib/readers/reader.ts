export interface Reader {
  list(): string[] | Promise<string[]>;
  read(name: string): string | Promise<string>;
  readSync(name: string): string;
  readAnyOf(filenames: string[]): string | Promise<string | undefined>;
  readSyncAnyOf(filenames: string[]): string | undefined;
}
