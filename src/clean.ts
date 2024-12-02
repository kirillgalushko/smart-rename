export interface CleanOptions {
  blacklist: (string | RegExp)[];
  removeSpaces?: boolean;
}

export const clean = (input: string, options: CleanOptions) => {
  const { blacklist, removeSpaces } = options;

  let result = input;

  blacklist.forEach((pattern) => {
    result = result.replace(new RegExp(pattern, 'g'), '');
  });

  if (removeSpaces) {
    result = result.replace(/\s+/g, '').trim();
  }

  return result;
};

export default clean;
