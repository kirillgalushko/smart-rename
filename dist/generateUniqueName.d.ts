export type FormatCounterFn = (name: string, counter: number) => string;
export declare const defaultFormatCounter: FormatCounterFn;
export declare const generateUniqueName: (name: string, uniqNamesSet: Set<string>, formatCounter?: FormatCounterFn) => string;
