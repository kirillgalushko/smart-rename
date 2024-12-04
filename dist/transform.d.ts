export interface TransformOptions {
    patternsToRemove?: (string | RegExp)[];
    removeSpaces?: boolean;
}
export declare const transform: (input: string, options: TransformOptions) => string;
export default transform;
