import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadSchema, loadDenylist } from '../../scripts/ontology/schema';

const schema = loadSchema('ontology');

describe('schema', () => {
  it('every relation has a known domain, range and inverse', () => {
    for (const [name, r] of Object.entries(schema.relations)) {
      for (const d of r.domain) expect(d === '*' || schema.types[d], `${name} domain ${d}`).toBeTruthy();
      for (const d of r.range) expect(schema.types[d], `${name} range ${d}`).toBeDefined();
      expect(r.inverse, name).toBeTruthy();
    }
  });
  it('every type has sections and a minimum length', () => {
    for (const [t, d] of Object.entries(schema.types)) {
      expect(d.sections.length, t).toBeGreaterThan(0);
      expect(d.min_body_chars, t).toBeGreaterThan(0);
    }
  });
});

describe('loadDenylist', () => {
  const root = mkdtempSync(join(tmpdir(), 'ont-'));
  mkdirSync(join(root, 'schema'));
  it('returns an empty list when schema/denylist.txt is absent and no extra file is given', () => {
    expect(loadDenylist(root, '')).toEqual([]);
  });
  it('appends every file named in the extra list, skipping comments and blanks', () => {
    const a = join(root, 'a.txt');
    const b = join(root, 'b.txt');
    writeFileSync(a, '# comment\nAcme Fixture Co\n\n');
    writeFileSync(b, 're:\\bZ9\\b\n');
    expect(loadDenylist(root, `${a}:${b}`)).toEqual(['Acme Fixture Co', 're:\\bZ9\\b']);
  });
  it('reads schema/denylist.txt first when it exists', () => {
    writeFileSync(join(root, 'schema', 'denylist.txt'), 'Base Name\n');
    const a = join(root, 'a.txt');
    expect(loadDenylist(root, a)).toEqual(['Base Name', 'Acme Fixture Co']);
  });
});
