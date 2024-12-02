import { describe, it, expect, vi } from 'vitest';
import { createResultDirectory, RESULT_DIR } from '../index';
import path from 'path';
import * as fsExtra from 'fs-extra';

vi.mock('fs-extra', () => ({
  ensureDir: vi.fn(),
}));

describe('rename function', () => {
  it('should create result directory with the correct path', async () => {
    const inputPath = '/path/to/dir';
    const expectedResultDir = path.join(inputPath, RESULT_DIR);
    await createResultDirectory(inputPath);
    expect(fsExtra.ensureDir).toHaveBeenCalledWith(expectedResultDir);
  });
});
