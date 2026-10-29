import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { loadCorpus } from './ontology/corpus';
import { formatLine, parseAllowlist, pieceRef, runChecks, summarise, unusedAllowlistEntries, type Cache, type SourceRef } from './ontology/citations';

const args = process.argv.slice(2);
const value = (n: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };

const only = value('--only');
const jsonPath = value('--json');
const noCache = args.includes('--no-cache');
const CACHE_PATH = '.cache/citations.json';

const corpus = loadCorpus('ontology');
let sources: SourceRef[] = corpus.files
  .filter((f) => typeof f.frontmatter.id === 'string' && (f.frontmatter.id as string).startsWith('source/'))
  .map((f) => ({ id: f.frontmatter.id as string, name: String(f.frontmatter.name ?? ''), frontmatter: f.frontmatter }));
// pieces are checked alongside the sources, under the same rules, allowlist and cache
sources.push(...corpus.files.filter((f) => f.kind === 'content' && f.frontmatter.kind === 'piece').map(pieceRef));
const allowPath = 'ontology/schema/citation-allowlist.txt';
const allowlist = parseAllowlist(existsSync(allowPath) ? readFileSync(allowPath, 'utf8') : '');
const unused = unusedAllowlistEntries(allowlist, sources);
for (const u of unused) console.log(`WARN  allowlist: ${u} matches no source url`);
if (only) {
  // a piece may be named by its id, its file name, or either with the .md extension
  const name = only.replace(/\.md$/, '');
  sources = sources.filter((s) => s.id === name || s.id === `source/${name}` || s.id === `piece/${name}`);
  if (!sources.length) { console.error(`no source entry or piece matches ${only}`); process.exit(2); }
}

let cache: Cache = {};
if (!noCache && existsSync(CACHE_PATH)) {
  try { cache = JSON.parse(readFileSync(CACHE_PATH, 'utf8')) as Cache; } catch { cache = {}; }
}

const results = await runChecks(sources, {
  schema: corpus.schema,
  allowlist,
  cache: noCache ? undefined : cache,
  fetchFn: (u, init) => fetch(u, init)
});
for (const r of results) console.log(formatLine(r));

if (!noCache) {
  mkdirSync(dirname(CACHE_PATH), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + '\n');
}
if (jsonPath) {
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, JSON.stringify(results, null, 2) + '\n');
}

const { line, exitCode } = summarise(results, unused.length);
console.log(line);
process.exit(exitCode);
