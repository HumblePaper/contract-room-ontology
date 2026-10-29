import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

export interface AttrDef { type: 'string'|'number'|'boolean'|'string[]'|'object[]'|'enum'|'id'|'id[]'; values?: string[]; required?: boolean; ref?: string[] }
export interface TypeDef { attributes: Record<string, AttrDef>; sections: string[]; min_body_chars: number; market?: boolean }
export interface RelationDef { domain: string[]; range: string[]; inverse: string; ordered?: boolean; fields?: string[] }
export interface ContentKindDef { block?: Record<string, AttrDef>; item?: Record<string, AttrDef>; dated_url?: boolean; needs_year?: boolean }
export interface Schema {
  types: Record<string, TypeDef>;
  relations: Record<string, RelationDef>;
  facets: Record<string, string[]>;
  content: Record<string, ContentKindDef>;
  denylist: string[];
}

function yamlFile<T>(root: string, name: string): T {
  return parse(readFileSync(join(root, 'schema', name), 'utf8')) as T;
}

const lines = (text: string) => text.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));

/** The base denylist (schema/denylist.txt, optional) followed by every file named in `extra` (colon-separated). */
export function loadDenylist(root: string, extra: string | undefined = process.env.ONTOLOGY_DENYLIST): string[] {
  const base = join(root, 'schema', 'denylist.txt');
  const out = existsSync(base) ? lines(readFileSync(base, 'utf8')) : [];
  for (const p of (extra ?? '').split(':').map((s) => s.trim()).filter(Boolean)) out.push(...lines(readFileSync(p, 'utf8')));
  return out;
}

export function loadSchema(root: string): Schema {
  const types = yamlFile<Record<string, Partial<TypeDef>>>(root, 'types.yaml');
  for (const [k, v] of Object.entries(types)) {
    v.attributes ??= {};
    if (!v.sections || !v.min_body_chars) throw new Error(`types.yaml: ${k} needs sections and min_body_chars`);
  }
  const content = yamlFile<Record<string, ContentKindDef | null>>(root, 'content.yaml');
  const denylist = loadDenylist(root);
  return {
    types: types as Record<string, TypeDef>,
    relations: yamlFile(root, 'relations.yaml'),
    facets: yamlFile(root, 'facets.yaml'),
    content: Object.fromEntries(Object.entries(content).map(([k, v]) => [k, v ?? {}])),
    denylist
  };
}
