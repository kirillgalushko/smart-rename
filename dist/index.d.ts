import { TransformOptions } from './transform';
import { FormatCounterFn } from './generateUniqueName';
export declare const OUTPUT_DIR_NAME = "temp_rename_result";
export declare const createOutputDirectory: (inputPath: string, outputPath?: string) => Promise<string>;
export declare const getFilesInDirectory: (dirPath: string) => Promise<string[]>;
export declare const getRenamedFilesMap: (filePaths: string[], transform: (fileName: string) => string) => Map<string, string>;
export declare const ensureUniqueFilenamesMap: (filenamesMap: Map<string, string>, formatCounter?: FormatCounterFn) => void;
export declare const copyRenamedFilesToOutputDirectory: (filesMap: Map<string, string>, outputDirPath: string) => Promise<void>;
export declare const moveRenameResultToInputDirectory: (inputPath: string, tempDirPath: string) => Promise<void>;
export type TransformFn = (filename: string) => string;
export interface SmartRenameOptions extends TransformOptions {
    outputPath?: string;
    formatCounter?: FormatCounterFn;
    transform?: TransformFn;
}
export declare const smartRename: (inputPath: string, options: SmartRenameOptions) => Promise<void>;
