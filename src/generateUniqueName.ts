import log from 'log';

export type FormatCounterFn = (name: string, counter: number) => string;

export const defaultFormatCounter: FormatCounterFn = (name, counter) =>
  `${name} (${counter})`;

export const generateUniqueName = (
  name: string,
  uniqNamesSet: Set<string>,
  formatCounter: FormatCounterFn = defaultFormatCounter
) => {
  log.info(`Attempting to generate uniq name for: ${name}`);
  let uniqueName = name;
  let counter = 2;

  while (uniqNamesSet.has(uniqueName)) {
    log.info(`${uniqueName} is already taken, increase counter`);
    uniqueName = formatCounter(name, counter);
    counter++;
  }

  log.info(`Uniq name for ${name} is ${uniqueName}`);
  return uniqueName;
};
