import { readFileSync, writeFileSync } from 'node:fs';
import { loadCorpus, type Corpus } from './ontology/corpus';

const SITE = 'https://thecontractroom.com';
// Copied from the site's src/lib/reference/routes.ts SEGMENTS map.
const SEGMENT: Record<string, string> = {
  workflow: 'workflows', 'matter-type': 'matters', stage: 'stages', task: 'tasks',
  'work-product': 'work-products', deadline: 'deadlines', 'triggering-event': 'events',
  'deal-type': 'deals', 'deal-structure': 'structures', 'party-role': 'party-roles',
  'document-type': 'documents', 'model-form': 'forms', 'document-part': 'document-parts',
  clause: 'clauses', position: 'positions', 'fallback-sequence': 'fallbacks',
  'defined-term': 'glossary', concept: 'concepts',
  issue: 'issues', argument: 'arguments', tactic: 'tactics', pitfall: 'pitfalls',
  'market-practice': 'market-practice', precedent: 'precedents',
  function: 'functions', role: 'roles', counterparty: 'counterparties',
  'approval-authority': 'approval-authorities', 'operating-model': 'operating-models',
  'org-structure': 'org-structures', metric: 'metrics',
  jurisdiction: 'jurisdictions', statute: 'statutes', regulator: 'regulators',
  industry: 'industries', risk: 'risks', tool: 'tools', standard: 'standards', source: 'sources',
  organisation: 'organisations', team: 'teams', person: 'people', deal: 'transactions'
};

export function splice(md: string, name: string, body: string): string {
  const re = new RegExp(`(<!-- ${name}:start -->\\n)[\\s\\S]*?(<!-- ${name}:end -->)`);
  if (!re.test(md)) throw new Error(`README has no ${name} markers`);
  return md.replace(re, (_m, a: string, b: string) => `${a}${body}\n${b}`);
}

export function renderReadmeTables(corpus: Corpus): { market: string; outline: string } {
  const str = (v: unknown) => (v == null ? '' : String(v));
  const orgs = corpus.files
    .filter((f) => f.kind === 'market' && f.frontmatter.type === 'organisation')
    .sort((a, b) => str(a.frontmatter.name).localeCompare(str(b.frontmatter.name)));
  const rows = orgs.map((f) => {
    const fm = f.frontmatter as Record<string, unknown>;
    const slug = str(fm.id).split('/')[1];
    return `| [${str(fm.name)}](${SITE}/${SEGMENT.organisation}/${slug}) | ${str(fm.kind)} | ${str(fm.hq)} |`;
  });
  const market = ['| Organisation | Kind | Headquarters |', '|---|---|---|', ...rows].join('\n');
  const counts = new Map<string, number>();
  for (const f of corpus.files.filter((f) => f.kind === 'entry')) counts.set(str(f.frontmatter.type), (counts.get(str(f.frontmatter.type)) ?? 0) + 1);
  const outline = ['| Type | Entries |', '|---|---|', ...[...counts].sort().map(([t, n]) => `| ${t} | ${n} |`)].join('\n');
  return { market, outline };
}

if (process.argv[1]?.endsWith('readme.mts')) {
  const corpus = loadCorpus('ontology');
  const t = renderReadmeTables(corpus);
  const before = readFileSync('README.md', 'utf8');
  const after = splice(splice(before, 'market', t.market), 'outline', t.outline);
  if (process.argv.includes('--check')) {
    if (after !== before) { console.error('README.md is stale: run npm run readme'); process.exit(1); }
    console.log('README.md is current');
  } else {
    writeFileSync('README.md', after);
    console.log('README.md updated');
  }
}
