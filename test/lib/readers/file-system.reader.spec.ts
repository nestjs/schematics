import { vi } from 'vitest';
import * as fs from 'fs';
import { FileSystemReader, Reader } from '../../../src/lib/readers/index.js';

vi.mock('fs', () => ({
  readFileSync: vi.fn().mockReturnValue('content'),
  promises: {
    readdir: vi.fn().mockResolvedValue([]),
    readFile: vi.fn().mockResolvedValue('content'),
  },
}));

const dir: string = process.cwd();
const reader: Reader = new FileSystemReader(dir);

describe('File System Reader', () => {
  afterAll(() => {
    vi.clearAllMocks();
  });
  it('should use fs.promises.readdir when list', async () => {
    await reader.list();
    expect(fs.promises.readdir).toHaveBeenCalled();
  });
  it('should use fs.promises.readFile when read', async () => {
    await reader.read('filename');
    expect(fs.promises.readFile).toHaveBeenCalled();
  });
  
  describe('readAnyOf tests', () => {
    it('should call readFile when running readAnyOf fn', async () => {
      const filenames: string[] = ['file1', 'file2', 'file3'];
      await reader.readAnyOf(filenames);
      
      expect(fs.promises.readFile).toHaveBeenCalled();
    });
    
    it('should return undefined when no file is passed', async () => {
      const content = await reader.readAnyOf([]);
      expect(content).toEqual(undefined);
    });
  });
  
  describe('readSyncAnyOf tests', () => {
    it('should call readFileSync when running readSyncAnyOf fn', async () => {
      const filenames: string[] = ['file1', 'file2', 'file3'];
      reader.readSyncAnyOf(filenames);
      
      expect(fs.readFileSync).toHaveBeenCalled();
    });
    
    it('should return undefined when no file is passed', async () => {
      const content = reader.readSyncAnyOf([]);
      expect(content).toEqual(undefined);
    });
  });
});
