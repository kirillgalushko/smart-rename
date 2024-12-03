import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import fs from 'fs-extra';
import path, { basename } from 'path';
import { smartRename } from '../../src/index';

const TEST_RESULT_DIR_NAME = 'test_result';

const patternsToRemove = [
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
  /audioblocks-/g,
];

describe('e2e', () => {
  const mocksDir = path.resolve(__dirname, 'mocks');
  const testResultDir = path.resolve(__dirname, TEST_RESULT_DIR_NAME);

  beforeEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    await fs.remove(testResultDir);
    await fs.copy(mocksDir, testResultDir);
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    await fs.remove(testResultDir);
  });

  it('should execute basic functionality', async () => {
    await smartRename(testResultDir, {
      patternsToRemove,
      removeSpaces: true,
    });
    const resultFiles = await fs.readdir(testResultDir);
    expect(resultFiles).toMatchSnapshot();
  });

  it('should correctly transform filenames', async () => {
    await smartRename(testResultDir, {
      transform: (filename) => {
        const prefix = 'prefix-';
        const postfix = '-postfix';
        return prefix + filename + postfix;
      },
    });
    const resultFiles = await fs.readdir(testResultDir);
    expect(resultFiles).toMatchSnapshot();
  });

  it('should correctly transform filenames after removing patterns', async () => {
    await smartRename(testResultDir, {
      patternsToRemove,
      removeSpaces: true,
      transform: (filename) => {
        const prefix = 'prefix-';
        const postfix = '-postfix';
        return prefix + filename + postfix;
      },
    });
    const resultFiles = await fs.readdir(testResultDir);
    expect(resultFiles).toMatchSnapshot();
  });

  it('should correctly add custom counter', async () => {
    await smartRename(testResultDir, {
      patternsToRemove,
      removeSpaces: true,
      formatCounter: (name, counter) => {
        return `${name}__${counter}`;
      },
    });
    const resultFiles = await fs.readdir(testResultDir);
    expect(resultFiles).toMatchSnapshot();
  });

  it('should correctly handle multiple run', async () => {
    const run = async () =>
      smartRename(testResultDir, {
        patternsToRemove,
        removeSpaces: true,
      });
    await run();
    await run();
    await run();
    const resultFiles = await fs.readdir(testResultDir);
    expect(resultFiles).toMatchSnapshot();
  });
});
