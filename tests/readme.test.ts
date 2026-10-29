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
  it('outline names each entry type with its count', () => {
    expect(t.outline).toMatch(/\| clause \| \d+ \|/);
  });
  it('splice replaces only the marked region', () => {
    const md = 'a\n<!-- market:start -->\nold\n<!-- market:end -->\nb';
    expect(splice(md, 'market', 'new')).toBe('a\n<!-- market:start -->\nnew\n<!-- market:end -->\nb');
  });
});
