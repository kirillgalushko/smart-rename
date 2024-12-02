import { ensureDir, readdir } from 'fs-extra';
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

export const getFilesInDirectory = async (
  dirPath: string
): Promise<string[]> => {
  log.info(`Attempting to get files in directory: ${dirPath}`);
  try {
    const files = await readdir(dirPath, { withFileTypes: true });
    const filePaths = files
      .filter((file) => file.isFile())
      .map((file) => path.join(dirPath, file.name));

    log.info(`Files found in directory: ${filePaths.length}`);
    return filePaths;
  } catch (error) {
    log.error(`Error reading directory: ${dirPath}`, error);
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
