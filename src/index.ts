import { ensureDir, readdir, copy, rename, remove } from 'fs-extra';
import path from 'path';
import log from 'log';
import { clean, CleanOptions } from './clean';

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

export const generateUniqueFilename = (
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

export const ensureUniqueFilenamesMap = (filenamesMap: Map<string, string>) => {
  log.info(`Prepare uniq filenames in map`);
  try {
    const uniqFilenames = new Set<string>();
    filenamesMap.forEach((filePath, key) => {
      if (uniqFilenames.has(filePath)) {
        const uniqFilename = generateUniqueFilename(uniqFilenames, filePath);
        uniqFilenames.add(uniqFilename);
        filenamesMap.set(key, uniqFilename);
      }
      uniqFilenames.add(filePath);
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
}

export const smartRename = async (
  inputPath: string,
  options: SmartRenameOptions
) => {
  const { outputPath, ...cleanOptions } = options;
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
    ensureUniqueFilenamesMap(cleanFilenames);
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
