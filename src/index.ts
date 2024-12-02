import { ensureDir } from 'fs-extra';
import path from 'path';

export const RESULT_DIR = 'rename_result';

export const createResultDirectory = async (inputPath: string) => {
  const resultDirPath = path.join(inputPath, RESULT_DIR);
  await ensureDir(resultDirPath);
};

export const rename = async (inputPath: string) => {
  await createResultDirectory(inputPath);
};
