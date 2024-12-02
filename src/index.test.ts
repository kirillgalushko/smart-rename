import { describe, it, expect, vi } from 'vitest';
import rename from './index';

describe('rename function', () => {
  it('should call console.log with "rename"', () => {
    const logSpy = vi.spyOn(console, 'log');
    rename();
    expect(logSpy).toHaveBeenCalledWith('rename');
    logSpy.mockRestore();
  });
});
