import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { smartRename } from '../../index';

const TEST_RESULT_DIR_NAME = 'test_result';

describe('e2e', () => {
  const mocksDir = path.resolve(__dirname, 'mocks');
  const testResultDir = path.resolve(__dirname, TEST_RESULT_DIR_NAME);

  beforeEach(async () => {
    await fs.remove(testResultDir);
    await fs.copy(mocksDir, testResultDir);
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    await fs.remove(testResultDir);
  });

  it('should execute basic functionality', async () => {
    console.log(testResultDir);
    await smartRename(testResultDir, {
      blacklist: [
        /-svgrepo-com/g,
        /-logo/g,
        /-color/g,
        /-icon/g,
        /_\- logo/g,
        /\d{1,}x\d{1,}/g,
        /\(.*?\)/g,
        /_.*/g,
        /id[^\s]*/g,
        /^-|-$/g,
      ],
      removeSpaces: true,
    });
    const resultFiles = await fs.readdir(testResultDir);
    expect(resultFiles).toMatchSnapshot();
  });
});
