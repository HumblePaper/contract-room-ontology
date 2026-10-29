import { describe, it, expect } from 'vitest';
import { parseLoadArgs } from '../../scripts/ontology/load-args';

describe('ontology-load arguments', () => {
  it('names no target without a flag', () => {
    expect(parseLoadArgs([])).toBeNull();
    expect(parseLoadArgs(['--verbose'])).toBeNull();
  });
  it('reads --local and --remote', () => {
    expect(parseLoadArgs(['--local'])).toBe('local');
    expect(parseLoadArgs(['--remote'])).toBe('remote');
  });
  it('refuses both flags at once', () => {
    expect(parseLoadArgs(['--local', '--remote'])).toBeNull();
  });
});
