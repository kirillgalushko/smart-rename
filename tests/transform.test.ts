import { describe, it, expect } from 'vitest';
import transform from '../src/transform';

describe('transform', () => {
  it('should remove exact string matches from input', () => {
    const input = 'Hello world! This is a test string.';
    const options = {
      patternsToRemove: ['world', 'test'],
    };
    const result = transform(input, options);
    expect(result).toBe('Hello ! This is a  string.');
  });

  it('should remove regular expression matches from input', () => {
    const input = 'Hello world! This is a test string.';
    const options = {
      patternsToRemove: [/world/, /test/],
    };
    const result = transform(input, options);
    expect(result).toBe('Hello ! This is a  string.');
  });

  it('should handle a mix of strings and regular expressions', () => {
    const input = 'Hello world! This is a test string.';
    const options = {
      patternsToRemove: ['world', /test/],
    };
    const result = transform(input, options);
    expect(result).toBe('Hello ! This is a  string.');
  });

  it('should return the same string if no patternsToRemove items match', () => {
    const input = 'Hello world! This is a test string.';
    const options = {
      patternsToRemove: ['nonexistent'],
    };
    const result = transform(input, options);
    expect(result).toBe('Hello world! This is a test string.');
  });

  it('should remove multiple occurrences of the same word', () => {
    const input = 'test test test';
    const options = {
      patternsToRemove: ['test'],
    };
    const result = transform(input, options);
    expect(result).toBe('  ');
  });

  it('should handle empty input', () => {
    const input = '';
    const options = {
      patternsToRemove: ['test'],
    };
    const result = transform(input, options);
    expect(result).toBe('');
  });

  it('should handle empty patternsToRemove', () => {
    const input = 'Hello world!';
    const options = {
      patternsToRemove: [],
    };
    const result = transform(input, options);
    expect(result).toBe('Hello world!');
  });

  it('should remove all spaces when removeSpaces is true', () => {
    const input = 'Hello    world!    This is a test string.';
    const options = {
      patternsToRemove: ['world', 'test'],
      removeSpaces: true,
    };
    const result = transform(input, options);
    expect(result).toBe('Hello!Thisisastring.');
  });

  it('should not remove spaces when removeSpaces is false', () => {
    const input = 'Hello    world!    This is a test string.';
    const options = {
      patternsToRemove: ['world', 'test'],
      removeSpaces: false,
    };
    const result = transform(input, options);
    expect(result).toBe('Hello    !    This is a  string.');
  });

  it('should not change input if removeSpaces is false and no words match patternsToRemove', () => {
    const input = 'Hello world! This is a test string.';
    const options = {
      patternsToRemove: ['nonexistent'],
      removeSpaces: false,
    };
    const result = transform(input, options);
    expect(result).toBe('Hello world! This is a test string.');
  });

  it('should trim the result if removeSpaces is true', () => {
    const input = '   test test test   ';
    const options = {
      patternsToRemove: ['test'],
      removeSpaces: true,
    };
    const result = transform(input, options);
    expect(result).toBe('');
  });
});
