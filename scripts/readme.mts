import { readFileSync, writeFileSync } from 'node:fs';
import { loadCorpus, type Corpus } from './ontology/corpus';
import { segmentFor } from '../src/lib/reference/routes';

const SITE = 'https://thecontractroom.com';
const RELEASE = 'https://github.com/HumblePaper/contract-room-ontology/releases/download/data';
export const RELEASE_FILES = ['graph.ttl', 'vocab.ttl', 'graph.json', 'search.json', 'jsonld.zip'];

export function splice(md: string, name: string, body: string): string {
  const re = new RegExp(`(<!-- ${name}:start -->\\n)[\\s\\S]*?(<!-- ${name}:end -->)`);
  if (!re.test(md)) throw new Error(`README has no ${name} markers`);
  return md.replace(re, (_m, a: string, b: string) => `${a}${body}\n${b}`);
}

export function renderReadmeTables(corpus: Corpus): { market: string; outline: string; data: string; updated: string } {
  const str = (v: unknown) => (v == null ? '' : String(v));
  const orgs = corpus.files
    .filter((f) => f.kind === 'market' && f.frontmatter.type === 'organisation')
    .sort((a, b) => str(a.frontmatter.name).localeCompare(str(b.frontmatter.name)));
  const rows = orgs.map((f) => {
    const fm = f.frontmatter as Record<string, unknown>;
    const slug = str(fm.id).split('/')[1];
    return `| [${str(fm.name)}](${SITE}/${segmentFor('organisation')}/${slug}) | ${str(fm.kind)} | ${str(fm.hq)} |`;
  });
  const market = ['| Organisation | Kind | Headquarters |', '|---|---|---|', ...rows].join('\n');
  const counts = new Map<string, number>();
  for (const f of corpus.files.filter((f) => f.kind === 'entry')) counts.set(str(f.frontmatter.type), (counts.get(str(f.frontmatter.type)) ?? 0) + 1);
  const outline = ['| Type | Entries |', '|---|---|', ...[...counts].sort().map(([t, n]) => `| [${t}](${SITE}/${segmentFor(t)}) | ${n} |`)].join('\n');
  const data = RELEASE_FILES.map((f) => `- [${f}](${RELEASE}/${f})`).join('\n');
  // the newest revised date in the corpus, so the line changes only when the data does
  const revised = corpus.files.map((f) => str(f.frontmatter.revised).slice(0, 10)).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  const updated = `Last updated ${revised.at(-1) ?? 'never'}`;
  return { market, outline, data, updated };
}

if (process.argv[1]?.endsWith('readme.mts')) {
  const corpus = loadCorpus('ontology');
  const t = renderReadmeTables(corpus);
  const before = readFileSync('README.md', 'utf8');
  let after = before;
  for (const [name, body] of [['market', t.market], ['outline', t.outline], ['data', t.data], ['updated', t.updated]] as const) after = splice(after, name, body);
  if (process.argv.includes('--check')) {
    if (after !== before) { console.error('README.md is stale: run npm run readme'); process.exit(1); }
    console.log('README.md is current');
  } else {
    writeFileSync('README.md', after);
    console.log('README.md updated');
  }
}
