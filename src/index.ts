import { ensureDir, readdir, copy } from 'fs-extra';
import path from 'path';
import log from 'log';
import { clean, CleanOptions } from './clean';

export const RESULT_DIR = 'rename_result';

export const createResultDirectory = async (
  inputPath: string
): Promise<string> => {
  const resultDirPath = path.join(inputPath, RESULT_DIR);
  log.info(`Attempting to create result directory: ${resultDirPath}`);

  try {
    await ensureDir(resultDirPath);
    log.info(`Result directory created successfully: ${resultDirPath}`);
    return resultDirPath;
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

export const getCleanedFilesMap = (
  filePaths: string[],
  clean: (input: string) => string
): Map<string, string> => {
  log.info(`Attempting to create a map of cleaned filenames`);
  try {
    const cleanedPaths = new Map<string, string>();
    for (const oldPath of filePaths) {
      const extname = path.extname(oldPath);
      const baseName = path.basename(oldPath, extname);
      const newBaseName = clean(baseName);
      const newPath = path.join(path.dirname(oldPath), newBaseName + extname);
      cleanedPaths.set(oldPath, newPath);
    }
    log.info(`Cleaned filenames map size: ${cleanedPaths.size}`);
    return cleanedPaths;
  } catch (error) {
    log.error(`Error while creating a map of cleaned filenames`, error);
    throw error;
  }
};

export const getUniqueFilename = (
  uniqNamesSet: Set<string>,
  filePath: string
) => {
  log.info(`Attempting to generate uniq name for: ${filePath}`);
  let uniqueName = filePath;
  let counter = 2;

  while (uniqNamesSet.has(uniqueName)) {
    const ext = path.extname(filePath);
    const dir = path.dirname(filePath);
    const baseName = path.basename(filePath, ext);
    uniqueName = path.join(dir, `${baseName} (${counter})${ext}`);
    counter++;
  }

  log.info(`Uniq name for ${filePath} is ${uniqueName}`);
  return uniqueName;
};

export const prepareUniqFilenamesMap = (filenamesMap: Map<string, string>) => {
  log.info(`Prepare uniq filenames in map`);
  const uniqFilenames = new Set<string>();
  filenamesMap.forEach((filePath, key) => {
    if (uniqFilenames.has(filePath)) {
      const uniqFilename = getUniqueFilename(uniqFilenames, filePath);
      uniqFilenames.add(uniqFilename);
      filenamesMap.set(key, uniqFilename);
    }
    uniqFilenames.add(filePath);
  });
};

export const copyFilesToResultDirectory = async (
  filesMap: Map<string, string>,
  resultDirPath: string
) => {
  filesMap.forEach(async (oldFilePath, newFilePath) => {
    await copy(
      oldFilePath,
      path.resolve(resultDirPath, path.basename(newFilePath))
    );
  });
};

export const rename = async (inputPath: string, cleanOptions: CleanOptions) => {
  log.info(`Starting the renaming process for inputPath: ${inputPath}`);

  try {
    const resultDirPath = await createResultDirectory(inputPath);
    const filesInDirectory = await getFilesInDirectory(inputPath);
    const cleanFilenames = await getCleanedFilesMap(
      filesInDirectory,
      (fileName) => clean(fileName, cleanOptions)
    );
    prepareUniqFilenamesMap(cleanFilenames);
    await copyFilesToResultDirectory(cleanFilenames, resultDirPath);
    log.info('Renaming process completed successfully');
  } catch (error) {
    log.error('Renaming process failed', error);
  }
};
