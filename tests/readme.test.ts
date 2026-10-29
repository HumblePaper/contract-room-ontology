import { describe, it, expect } from 'vitest';
import { loadCorpus } from '../scripts/ontology/corpus';
import { renderReadmeTables, splice } from '../scripts/readme';

describe('readme tables', () => {
  const corpus = loadCorpus('ontology');
  const t = renderReadmeTables(corpus);
  it('lists every organisation once with a link to its page', () => {
    const orgs = corpus.files.filter((f) => f.kind === 'market' && f.frontmatter.type === 'organisation');
    for (const o of orgs) expect(t.market).toContain(`https://thecontractroom.com/organisations/${String(o.frontmatter.id).split('/')[1]}`);
    expect(t.market.split('\n').filter((l) => l.startsWith('| [')).length).toBe(orgs.length);
  });
  it('outline names each entry type with its count and links its directory page', () => {
    expect(t.outline).toMatch(/\| \[clause\]\(https:\/\/thecontractroom\.com\/clauses\) \| \d+ \|/);
    expect(t.outline).toContain('[defined-term](https://thecontractroom.com/glossary)');
  });
  it('data lists the five release files as download links', () => {
    for (const f of ['graph.ttl', 'vocab.ttl', 'graph.json', 'search.json', 'jsonld.zip']) {
      expect(t.data).toContain(`- [${f}](https://github.com/HumblePaper/contract-room-ontology/releases/download/data/${f})`);
    }
    expect(t.data.split('\n').length).toBe(5);
  });
  it('last updated is the newest revised date in the corpus', () => {
    const newest = corpus.files.map((f) => String(f.frontmatter.revised ?? '').slice(0, 10)).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().at(-1);
    expect(newest).toBeTruthy();
    expect(t.updated).toBe(`Last updated ${newest}`);
  });
  it('splice replaces only the marked region', () => {
    const md = 'a\n<!-- market:start -->\nold\n<!-- market:end -->\nb';
    expect(splice(md, 'market', 'new')).toBe('a\n<!-- market:start -->\nnew\n<!-- market:end -->\nb');
  });
});
