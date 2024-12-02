interface CleanOptions {
    blacklist: (string | RegExp)[];
    removeSpaces?: boolean;
}
export declare const clean: (input: string, options: CleanOptions) => string;
export default clean;
