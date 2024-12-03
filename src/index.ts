import { ensureDir, readdir, copy, rename, remove } from 'fs-extra';
import path from 'path';
import log from 'log';
import { clean, CleanOptions } from './clean';
import {
  defaultFormatCounter,
  FormatCounterFn,
  generateUniqueName,
} from 'src/generateUniqueName';

export const OUTPUT_DIR_NAME = 'temp_rename_result';

export const createOutputDirectory = async (
  inputPath: string,
  outputPath?: string
): Promise<string> => {
  const outputDirPath =
    outputPath || path.join(inputPath, '../', OUTPUT_DIR_NAME);
  log.info(`Attempting to create result directory: ${outputDirPath}`);

  try {
    await ensureDir(outputDirPath);
    log.info(`Result directory created successfully: ${outputDirPath}`);
    return outputDirPath;
  } catch (error) {
    log.error(`Error creating result directory: ${outputDirPath}`, error);
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

export const getRenamedFilesMap = (
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

export const ensureUniqueFilenamesMap = (
  filenamesMap: Map<string, string>,
  formatCounter: FormatCounterFn = defaultFormatCounter
) => {
  log.info(`Prepare uniq filenames in map`);
  try {
    const uniqFileNames = new Set<string>();
    filenamesMap.forEach((filePath, key) => {
      const dir = path.dirname(filePath);
      const fileName = path.basename(filePath);
      if (uniqFileNames.has(fileName)) {
        const uniqueFileName = generateUniqueName(
          fileName,
          uniqFileNames,
          (nameToFormat, counter) => {
            const ext = path.extname(nameToFormat);
            const baseName = path.basename(filePath, ext);
            return formatCounter(baseName, counter) + ext;
          }
        );
        const uniqueFilePath = path.join(dir, uniqueFileName);
        uniqFileNames.add(uniqueFileName);
        filenamesMap.set(key, uniqueFilePath);
      }
      uniqFileNames.add(fileName);
    });
    log.info(`Preparing uniq filenames finished`);
  } catch (error) {
    log.error('Error during preparing of uniq names:', error);
    throw error;
  }
};

export const copyRenamedFilesToOutputDirectory = async (
  filesMap: Map<string, string>,
  outputDirPath: string
) => {
  log.info(
    `Starting copy process of renamed files to result dir: ${outputDirPath}`
  );
  try {
    for (const [oldFilePath, newFilePath] of filesMap) {
      const newPath = path.resolve(outputDirPath, path.basename(newFilePath));
      log.info(`Attemt to copy ${oldFilePath} to ${newPath}`);
      await copy(oldFilePath, newPath);
      log.info(`Successful copy of ${oldFilePath} to ${newFilePath}`);
    }
    log.info(`Finished copy process to result dir: ${outputDirPath}`);
  } catch (error) {
    log.error('Moving results to input directory failed:', error);
    throw error;
  }
};

export const moveRenameResultToInputDirectory = async (
  inputPath: string,
  outputDirPath: string
) => {
  try {
    log.info(`Cleaning input path: ${inputPath}`);
    await remove(inputPath);
    log.info(`Rename result directory ${outputDirPath} to ${inputPath}`);
    await rename(outputDirPath, inputPath);
  } catch (error) {
    log.error('Moving results to input directory failed:', error);
    throw error;
  }
};

export interface SmartRenameOptions extends CleanOptions {
  outputPath?: string;
  formatCounter?: FormatCounterFn;
}

export const smartRename = async (
  inputPath: string,
  options: SmartRenameOptions
) => {
  const { outputPath, formatCounter, ...cleanOptions } = options;
  log.info(`Starting the renaming process for inputPath: ${inputPath}`);

  try {
    const outputDirPath = await createOutputDirectory(
      inputPath,
      options.outputPath
    );
    const filesInDirectory = await getFilesInDirectory(inputPath);
    const cleanFilenames = await getRenamedFilesMap(
      filesInDirectory,
      (fileName) => clean(fileName, cleanOptions)
    );
    ensureUniqueFilenamesMap(cleanFilenames, formatCounter);
    await copyRenamedFilesToOutputDirectory(cleanFilenames, outputDirPath);
    if (!options.outputPath) {
      await moveRenameResultToInputDirectory(inputPath, outputDirPath);
    }
    log.info('Renaming process completed successfully');
  } catch (error) {
    log.error('Renaming process failed', error);
    throw error;
  }
};
