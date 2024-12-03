import { describe, it, expect, vi, Mock } from 'vitest';
import {
  createOutputDirectory,
  getFilesInDirectory,
  getRenamedFilesMap,
  generateUniqueFilename,
  ensureUniqueFilenamesMap,
  OUTPUT_DIR_NAME,
} from '../index';
import path from 'path';
import * as fsExtra from 'fs-extra';

vi.mock('fs-extra', () => ({
  ensureDir: vi.fn(),
  readdir: vi.fn(),
  pathExists: vi.fn(),
}));

const normalizePaths = (paths: string[]) => {
  return paths.map((p) => path.normalize(p));
};

describe('createOutputDirectory', () => {
  it('should create result directory with the correct path', async () => {
    const inputPath = '/path/to/dir';
    const expectedResultDir = path.join(inputPath, '../', OUTPUT_DIR_NAME);
    await createOutputDirectory(inputPath);
    expect(fsExtra.ensureDir).toHaveBeenCalledWith(expectedResultDir);
  });
  it('should return a path to created directory', async () => {
    const inputPath = '/path/to/dir';
    const expectedResultDir = path.join(inputPath, '../', OUTPUT_DIR_NAME);
    const createdDir = await createOutputDirectory(inputPath);
    expect(createdDir).toMatch(expectedResultDir);
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

describe('getRenamedFilesMap', () => {
  it('should correctly return a map of cleaned filenames', () => {
    const filePaths = normalizePaths([
      '/dir/file1.txt',
      '/dir/testfile2.JPG',
      '/dir/file3test.PNG',
    ]);

    const expectedResult = new Map([
      [filePaths[0], path.normalize('/dir/file1.txt')],
      [filePaths[1], path.normalize('/dir/file2.JPG')],
      [filePaths[2], path.normalize('/dir/file3.PNG')],
    ]);

    const clean = (filename: string) => {
      return filename.replace('test', '');
    };

    const result = getRenamedFilesMap(filePaths, clean);

    expect(result).toEqual(expectedResult);
  });
});

describe('generateUniqueFilename', () => {
  it('should return the same path if it is unique', () => {
    const uniqNamesSet = new Set<string>(['/dir/file1.txt']);
    const filePath = '/dir/file2.txt';
    const result = generateUniqueFilename(uniqNamesSet, filePath);
    expect(path.normalize(result)).toBe(path.normalize(filePath));
  });

  it('should return a path with a counter if the file already exists', () => {
    const uniqNamesSet = new Set<string>(['/dir/file.txt']);
    const filePath = '/dir/file.txt';
    const result = generateUniqueFilename(uniqNamesSet, filePath);
    expect(result).toBe(path.normalize('/dir/file (2).txt'));
  });

  it('should increment the counter if multiple files with the same name exist', () => {
    const uniqNamesSet = new Set<string>(
      normalizePaths([
        '/dir/file.txt',
        '/dir/file (2).txt',
        '/dir/file (3).txt',
      ])
    );
    const filePath = path.normalize('/dir/file.txt');
    const result = generateUniqueFilename(uniqNamesSet, filePath);
    expect(result).toBe(path.normalize('/dir/file (4).txt'));
  });
});

describe('ensureUniqueFilenamesMap', () => {
  it('should not change unique filenames', () => {
    const filenamesMap = new Map<string, string>([
      ['/dir/file1.txt', '/dir/file1.txt'],
      ['/dir/file2.txt', '/dir/file2.txt'],
    ]);

    ensureUniqueFilenamesMap(filenamesMap);

    expect(Array.from(filenamesMap.entries())).toEqual([
      ['/dir/file1.txt', '/dir/file1.txt'],
      ['/dir/file2.txt', '/dir/file2.txt'],
    ]);
  });

  it('should add postfix for duplicate filenames', () => {
    const filenamesMap = new Map<string, string>([
      ['/dir/file1.txt', '/dir/file.txt'],
      ['/dir/file2.txt', '/dir/file.txt'],
    ]);

    ensureUniqueFilenamesMap(filenamesMap);

    expect(Array.from(filenamesMap.entries())).toEqual([
      ['/dir/file1.txt', '/dir/file.txt'],
      ['/dir/file2.txt', path.normalize('/dir/file (2).txt')],
    ]);
  });

  it('should handle multiple duplicates correctly', () => {
    const filenamesMap = new Map<string, string>([
      ['/dir/file1.txt', '/dir/file1.txt'],
      ['/dir/file2.txt', '/dir/file1.txt'],
      ['/dir/file3.txt', '/dir/file1.txt'],
    ]);

    ensureUniqueFilenamesMap(filenamesMap);

    expect(Array.from(filenamesMap.entries())).toEqual([
      ['/dir/file1.txt', '/dir/file1.txt'],
      ['/dir/file2.txt', path.normalize('/dir/file1 (2).txt')],
      ['/dir/file3.txt', path.normalize('/dir/file1 (3).txt')],
    ]);
  });
});
