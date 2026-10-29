import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { loadCorpus } from './ontology/corpus';
import { validate } from './ontology/validate';
import { styleDiagnostics } from './ontology/style';
import { buildGraph } from './ontology/build-graph';
import { searchIndex, redirects, outreachIndex, publicGraph } from './ontology/build-outputs';
import { jsonLd, turtle, vocabTurtle } from './ontology/build-jsonld';
import { d1Sql } from './ontology/build-d1';

const corpus = loadCorpus('ontology');
const errors = [...validate(corpus), ...styleDiagnostics(corpus)].filter((d) => d.level === 'error');
if (errors.length) { for (const e of errors) console.error(`ERROR ${e.path}: ${e.message}`); process.exit(1); }

const g = buildGraph(corpus);
// every public output (graph.json, search.json, outreach-index.json, JSON-LD, Turtle) carries no draft node, item or edge;
// the D1 tables keep drafts for preview hosts
const pub = publicGraph(g);
const out = 'build';
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'jsonld'), { recursive: true });
mkdirSync(join(out, 'd1'), { recursive: true });

const renames = existsSync('ontology/redirects.yaml') ? (parse(readFileSync('ontology/redirects.yaml', 'utf8')) as { from: string; to: string }[]) : [];
writeFileSync(join(out, 'graph.json'), JSON.stringify(pub));
writeFileSync(join(out, 'search.json'), JSON.stringify(searchIndex(g)));
writeFileSync(join(out, 'redirects.json'), JSON.stringify(redirects(g, renames)));
writeFileSync(join(out, 'outreach-index.json'), JSON.stringify(outreachIndex(pub), null, 1));
for (const n of [...pub.nodes.filter((n) => !n.id.includes('#')), ...pub.content]) {
  writeFileSync(join(out, 'jsonld', n.id.replace('/', '__') + '.json'), JSON.stringify(jsonLd(n, pub)));
}
writeFileSync(join(out, 'graph.ttl'), turtle(pub));
writeFileSync(join(out, 'vocab.ttl'), vocabTurtle(corpus.schema));
const sql = d1Sql(g, redirects(g, renames), { 'search.json': JSON.stringify(searchIndex(g)), 'graph.json': JSON.stringify(pub) });
sql.forEach((s, i) => writeFileSync(join(out, 'd1', `${String(i).padStart(3, '0')}.sql`), s));
console.log(`${g.nodes.length} nodes, ${g.content.length} content items, ${g.edges.length} edges, ${sql.length} sql files`);
