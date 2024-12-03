import { describe, it, expect } from 'vitest';
import clean from '../src/clean';

describe('clean', () => {
  it('should remove exact string matches from input', () => {
    const input = 'Hello world! This is a test string.';
    const options = {
      blacklist: ['world', 'test'],
    };
    const result = clean(input, options);
    expect(result).toBe('Hello ! This is a  string.');
  });

  it('should remove regular expression matches from input', () => {
    const input = 'Hello world! This is a test string.';
    const options = {
      blacklist: [/world/, /test/],
    };
    const result = clean(input, options);
    expect(result).toBe('Hello ! This is a  string.');
  });

  it('should handle a mix of strings and regular expressions', () => {
    const input = 'Hello world! This is a test string.';
    const options = {
      blacklist: ['world', /test/],
    };
    const result = clean(input, options);
    expect(result).toBe('Hello ! This is a  string.');
  });

  it('should return the same string if no blacklist items match', () => {
    const input = 'Hello world! This is a test string.';
    const options = {
      blacklist: ['nonexistent'],
    };
    const result = clean(input, options);
    expect(result).toBe('Hello world! This is a test string.');
  });

  it('should remove multiple occurrences of the same word', () => {
    const input = 'test test test';
    const options = {
      blacklist: ['test'],
    };
    const result = clean(input, options);
    expect(result).toBe('  ');
  });

  it('should handle empty input', () => {
    const input = '';
    const options = {
      blacklist: ['test'],
    };
    const result = clean(input, options);
    expect(result).toBe('');
  });

  it('should handle empty blacklist', () => {
    const input = 'Hello world!';
    const options = {
      blacklist: [],
    };
    const result = clean(input, options);
    expect(result).toBe('Hello world!');
  });

  it('should remove all spaces when removeSpaces is true', () => {
    const input = 'Hello    world!    This is a test string.';
    const options = {
      blacklist: ['world', 'test'],
      removeSpaces: true,
    };
    const result = clean(input, options);
    expect(result).toBe('Hello!Thisisastring.');
  });

  it('should not remove spaces when removeSpaces is false', () => {
    const input = 'Hello    world!    This is a test string.';
    const options = {
      blacklist: ['world', 'test'],
      removeSpaces: false,
    };
    const result = clean(input, options);
    expect(result).toBe('Hello    !    This is a  string.');
  });

  it('should not change input if removeSpaces is false and no words match blacklist', () => {
    const input = 'Hello world! This is a test string.';
    const options = {
      blacklist: ['nonexistent'],
      removeSpaces: false,
    };
    const result = clean(input, options);
    expect(result).toBe('Hello world! This is a test string.');
  });

  it('should trim the result if removeSpaces is true', () => {
    const input = '   test test test   ';
    const options = {
      blacklist: ['test'],
      removeSpaces: true,
    };
    const result = clean(input, options);
    expect(result).toBe('');
  });
});
