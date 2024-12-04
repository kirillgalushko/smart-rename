import * as fs from 'fs-extra';
import path from 'path';
import log from 'log';
import { transform, TransformOptions } from './transform';
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
    await fs.ensureDir(outputDirPath);
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
    const files = await fs.readdir(dirPath, { withFileTypes: true });
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
  transform: (fileName: string) => string
): Map<string, string> => {
  log.info(`Attempting to create a map of renamed filenames`);
  try {
    const transformedPaths = new Map<string, string>();
    for (const oldPath of filePaths) {
      const extension = path.extname(oldPath);
      const baseName = path.basename(oldPath, extension);
      const newBaseName = transform(baseName);
      const newPath = path.join(path.dirname(oldPath), newBaseName + extension);
      transformedPaths.set(oldPath, newPath);
    }
    log.info(`Renamed filenames map size: ${transformedPaths.size}`);
    return transformedPaths;
  } catch (error) {
    log.error(`Error while creating a map of renamed filenames`, error);
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
      await fs.copy(oldFilePath, newPath);
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
  tempDirPath: string
) => {
  try {
    log.info(`Cleaning input path: ${inputPath}`);
    const items = await fs.readdir(inputPath, { withFileTypes: true });
    const filesToRemove = items.filter(item => item.isFile()).map(item => path.join(inputPath, item.name));
    for (const file of filesToRemove) {
      log.info(`Removing file: ${file}`);
      await fs.remove(file);
    }

    const filesInTempDir = await fs.readdir(tempDirPath, { withFileTypes: true });
    for (const file of filesInTempDir) {
      if (file.isFile()) {
        const oldPath = path.join(tempDirPath, file.name);
        const newPath = path.join(inputPath, file.name);
        log.info(`Moving file from ${oldPath} to ${newPath}`);
        await fs.move(oldPath, newPath);
      }
    }
    log.info('Remove temp directory:', tempDirPath)
    await fs.remove(tempDirPath)
    log.info(`Renamed files moved to input directory: ${inputPath}`);
  } catch (error) {
    log.error('Moving results to input directory failed:', error);
    throw error;
  }
};

export type TransformFn = (filename: string) => string;

export interface SmartRenameOptions extends TransformOptions {
  outputPath?: string;
  formatCounter?: FormatCounterFn;
  transform?: TransformFn;
}

const processDirectory = async (inputPath: string, options: SmartRenameOptions) => {
  const {
    outputPath,
    formatCounter,
    transform: customTransform,
    ...transformOptions
  } = options;

  const outputDirPath = await createOutputDirectory(
    inputPath,
    options.outputPath
  );
  const filesInDirectory = await getFilesInDirectory(inputPath);
  const transformFilenames = await getRenamedFilesMap(
    filesInDirectory,
    (fileName) => {
      let transformResult = transform(fileName, transformOptions);
      if (customTransform) {
        transformResult = customTransform(transformResult);
      }
      return transformResult;
    }
  );
  ensureUniqueFilenamesMap(transformFilenames, formatCounter);
  await copyRenamedFilesToOutputDirectory(transformFilenames, outputDirPath);
  if (!options.outputPath) {
    await moveRenameResultToInputDirectory(inputPath, outputDirPath);
  }
}

const renameFilesInDirectory = async (inputPath: string, options: SmartRenameOptions) => {
  const directories = await fs.readdir(inputPath, { withFileTypes: true });
  const subDirs = directories.filter((item) => item.isDirectory()).map((item) => path.join(inputPath, item.name));
  for (const subDir of subDirs) {
    await renameFilesInDirectory(subDir, options);
  }
  await processDirectory(inputPath, options);
}

export const smartRename = async (
  inputPath: string,
  options: SmartRenameOptions
) => {
  log.info(`Starting the renaming process for inputPath: ${inputPath}`);
  try {
    await renameFilesInDirectory(inputPath, options);
    log.info('Renaming process completed successfully');
  } catch (error) {
    log.error('Renaming process failed', error);
    throw error;
  }
};
