import { describe, it, expect } from 'vitest';
import {
  generateUniqueName,
  type FormatCounterFn,
} from '../src/generateUniqueName';

describe('generateUniqueName', () => {
  describe('when using the default formatCounter', () => {
    it('should return the same name if it is unique', () => {
      const uniqNamesSet = new Set<string>(['file1']);
      const name = 'file2';
      const result = generateUniqueName(name, uniqNamesSet);
      expect(result).toBe(name);
    });

    it('should return name with a counter if name is already taken', () => {
      const uniqNamesSet = new Set<string>(['name']);
      const name = 'name';
      const result = generateUniqueName(name, uniqNamesSet);
      expect(result).toBe('name (2)');
    });

    it('should increment the counter if multiple names with the same value exist', () => {
      const uniqNamesSet = new Set<string>(['test', 'test (2)', 'test (3)']);
      const name = 'test';
      const result = generateUniqueName(name, uniqNamesSet);
      expect(result).toBe('test (4)');
    });
  });

  describe('when using a custom formatCounter function', () => {
    it('should use custom counter format function', () => {
      const uniqNamesSet = new Set<string>(['file']);
      const name = 'file';
      const customFormat: FormatCounterFn = (name, counter) =>
        `${name}-v${counter}`;
      const result = generateUniqueName(name, uniqNamesSet, customFormat);
      expect(result).toBe('file-v2');
    });

    it('should not modify the name if it is unique and formatCounter is passed', () => {
      const uniqNamesSet = new Set<string>(['file1']);
      const name = 'file2';
      const customFormat: FormatCounterFn = (name, counter) =>
        `${name}-v${counter}`;
      const result = generateUniqueName(name, uniqNamesSet, customFormat);
      expect(result).toBe(name);
    });

    it('should correctly handle incrementing counter with custom format for multiple duplicates', () => {
      const uniqNamesSet = new Set<string>(['file', 'file-v2', 'file-v3']);
      const name = 'file';
      const customFormat: FormatCounterFn = (name, counter) =>
        `${name}-v${counter}`;
      const result = generateUniqueName(name, uniqNamesSet, customFormat);
      expect(result).toBe('file-v4');
    });
  });
});
