import { describe, it, expect, vi, Mock } from 'vitest';
import {
  createResultDirectory,
  getFilesInDirectory,
  getCleanedFilesMap,
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

describe('getCleanedFilesMap', () => {
  it('should correctly return a map of cleaned filenames', () => {
    const filePaths = [
      '/dir/file1.txt',
      '/dir/testfile2.JPG',
      '/dir/file3test.PNG',
    ].map((fp) => path.normalize(fp));

    const expectedResult = new Map([
      [filePaths[0], path.normalize('/dir/file1.txt')],
      [filePaths[1], path.normalize('/dir/file2.JPG')],
      [filePaths[2], path.normalize('/dir/file3.PNG')],
    ]);

    const clean = (filename: string) => {
      return filename.replace('test', '');
    };

    const result = getCleanedFilesMap(filePaths, clean);

    expect(result).toEqual(expectedResult);
  });
});
