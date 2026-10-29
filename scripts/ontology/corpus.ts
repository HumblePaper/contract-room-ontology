import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { loadSchema, type Schema } from './schema';
import { parseFile, type ParsedFile } from './parse';

export interface Corpus { root: string; schema: Schema; files: ParsedFile[] }

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.md')) out.push(p);
  }
  return out;
}

export function loadCorpus(root = 'ontology'): Corpus {
  const schema = loadSchema(root);
  const files: ParsedFile[] = [];
  for (const sub of ['entries', 'market', 'content']) {
    let paths: string[] = [];
    try { paths = walk(join(root, sub)); } catch { /* folder may not exist yet */ }
    for (const p of paths) files.push(parseFile(p, readFileSync(p, 'utf8')));
  }
  return { root, schema, files };
}
