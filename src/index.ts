import { ensureDir } from 'fs-extra';
import path from 'path';
import log from 'log';

export const RESULT_DIR = 'rename_result';

export const createResultDirectory = async (inputPath: string) => {
  const resultDirPath = path.join(inputPath, RESULT_DIR);
  log.info(`Attempting to create result directory: ${resultDirPath}`);

  try {
    await ensureDir(resultDirPath);
    log.info(`Result directory created successfully: ${resultDirPath}`);
  } catch (error) {
    log.error(`Error creating result directory: ${resultDirPath}`, error);
    throw error;
  }
};

export const rename = async (inputPath: string) => {
  log.info(`Starting the renaming process for inputPath: ${inputPath}`);

  try {
    await createResultDirectory(inputPath);
    log.info('Renaming process completed successfully');
  } catch (error) {
    log.error('Renaming process failed', error);
  }
};
