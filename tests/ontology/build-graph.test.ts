import { describe, it, expect } from 'vitest';
import { loadCorpus } from '../../scripts/ontology/corpus';
import { marked } from 'marked';
import { buildGraph, renderMarkdown } from '../../scripts/ontology/build-graph';

const g = buildGraph(loadCorpus('ontology'));
const node = (id: string) => g.nodes.find((n) => n.id === id)!;

describe('buildGraph', () => {
  it('renders sections to html and keeps markdown', () => {
    const n = node('clause/limitation-of-liability');
    expect(n.sections[0].html).toContain('<p>');
    expect(n.sections[0].md.length).toBeGreaterThan(0);
  });
  it('emits inverse edges', () => {
    expect(g.edges.some((e) => e.from === 'clause/limitation-of-liability' && e.rel === 'has_position')).toBe(true);
    expect(g.edges.some((e) => e.to === 'clause/limitation-of-liability' && e.rel === 'position_of')).toBe(true);
  });
  it('emits variants as child nodes linked to the facet entity', () => {
    const v = node('clause/limitation-of-liability#jurisdiction=india');
    expect(v).toBeDefined();
    expect(v.type).toBe('clause');
    expect(g.edges.some((e) => e.from === v.id && e.rel === 'specific_to' && e.to === 'jurisdiction/india')).toBe(true);
  });
  it('carries content items with about ids', () => {
    const c = g.content.find((c) => c.kind === 'how-to')!;
    expect(c.about.length).toBeGreaterThan(0);
    expect(c.block.agent_capable).toBe(true);
  });
  it('escapes raw html in bodies', () => {
    expect(JSON.stringify(g.nodes)).not.toMatch(/<script/i);
  });

  it('escapes raw html tokens but keeps markdown syntax', () => {
    const render = (md: string) => marked.parse(md, { async: false }) as string;
    expect(render('<script>alert(1)</script>')).toContain('&lt;script&gt;');
    expect(render('<script>alert(1)</script>')).not.toMatch(/<script/i);
    expect(render('x <b>y</b> z')).not.toMatch(/<b>/);
    expect(render('> a quoted line')).toContain('<blockquote>');
    expect(render('`a<b`')).toContain('<code>a&lt;b</code>');
  });
  it('renders only safe link and image targets as anchors and images', () => {
    expect(renderMarkdown('[x](javascript:alert(1))')).not.toMatch(/<a/);
    expect(renderMarkdown('[x](javascript:alert(1))')).toContain('x');
    expect(renderMarkdown('[x](JaVaScRiPt:alert(1))')).not.toMatch(/<a/);
    expect(renderMarkdown('[x](data:text/html,hi)')).not.toMatch(/<a/);
    expect(renderMarkdown('![alt text](javascript:alert(1))')).not.toMatch(/<img/);
    expect(renderMarkdown('![alt text](javascript:alert(1))')).toContain('alt text');
    expect(renderMarkdown('[x](https://example.com)')).toContain('<a href="https://example.com"');
    expect(renderMarkdown('[x](mailto:a@example.com)')).toContain('<a href="mailto:a@example.com"');
    expect(renderMarkdown('[x](/clauses/indemnity)')).toContain('<a href="/clauses/indemnity"');
    expect(renderMarkdown('[x](#purpose)')).toContain('<a href="#purpose"');
    expect(renderMarkdown('[x](//evil.example)')).not.toMatch(/<a/);
    expect(renderMarkdown('![a](https://example.com/a.png)')).toContain('<img src="https://example.com/a.png"');
  });
  it('builds variants explicitly without inheriting parent data', () => {
    const v = node('clause/limitation-of-liability#jurisdiction=india');
    expect(v.attributes).toEqual({});
    expect(v.sources).toEqual([]);
    expect(v.slug).toBe('limitation-of-liability--jurisdiction-india');
  });
});
