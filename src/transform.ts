export interface TransformOptions {
  patternsToRemove: (string | RegExp)[];
  removeSpaces?: boolean;
}

export const transform = (input: string, options: TransformOptions) => {
  const { patternsToRemove, removeSpaces } = options;

  let result = input;

  patternsToRemove.forEach((pattern) => {
    result = result.replace(new RegExp(pattern, 'g'), '');
  });

  if (removeSpaces) {
    result = result.replace(/\s+/g, '').trim();
  }

  return result;
};

export default transform;
