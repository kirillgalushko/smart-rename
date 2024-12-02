import { describe, it, expect, vi, Mock } from 'vitest';
import {
  createResultDirectory,
  getFilesInDirectory,
  RESULT_DIR,
} from '../index';
import path from 'path';
import * as fsExtra from 'fs-extra';

vi.mock('fs-extra', () => ({
  ensureDir: vi.fn(),
  readdir: vi.fn(),
}));

describe('createResultDirectory', () => {
  it('should create result directory with the correct path', async () => {
    const inputPath = '/path/to/dir';
    const expectedResultDir = path.join(inputPath, RESULT_DIR);
    await createResultDirectory(inputPath);
    expect(fsExtra.ensureDir).toHaveBeenCalledWith(expectedResultDir);
  });
});

describe('getFilesInDirectory', () => {
  it('should return paths for all files in the directory', async () => {
    const dirPath = '/path/to/dir';
    const mockFiles = [
      { name: 'file1.txt', isFile: () => true } as fsExtra.Dirent,
      { name: 'file2.txt', isFile: () => true } as fsExtra.Dirent,
      { name: 'folder1', isFile: () => false } as fsExtra.Dirent,
    ];
    (vi.mocked(fsExtra.readdir) as Mock).mockResolvedValue(mockFiles);
    const files = await getFilesInDirectory(dirPath);
    expect(files).toEqual([
      path.join(dirPath, 'file1.txt'),
      path.join(dirPath, 'file2.txt'),
    ]);
  });

  it('should return an empty array if there are no files', async () => {
    const dirPath = '/path/to/dir';
    const mockFiles = [{ name: 'folder1', isFile: () => false }];
    (vi.mocked(fsExtra.readdir) as Mock).mockResolvedValue(mockFiles);
    const files = await getFilesInDirectory(dirPath);
    expect(files).toEqual([]);
  });
});
