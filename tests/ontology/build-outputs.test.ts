import { describe, it, expect } from 'vitest';
import { loadCorpus } from '../../scripts/ontology/corpus';
import { buildGraph } from '../../scripts/ontology/build-graph';
import { searchIndex, redirects, entityIndex, publicGraph } from '../../scripts/ontology/build-outputs';
import { jsonLd, turtle } from '../../scripts/ontology/build-jsonld';

const corpus = loadCorpus('ontology');
const g = buildGraph(corpus);

describe('build outputs', () => {
  it('search index has one row per core node with href', () => {
    const idx = searchIndex(g);
    expect(idx.filter((r) => r.type === 'clause').length).toBeGreaterThan(0);
    expect(idx.every((r) => !r.id.includes('#'))).toBe(true);
    expect(idx.find((r) => r.id === 'clause/limitation-of-liability')!.href).toBe('/clauses/limitation-of-liability');
  });
  it('puts pieces in the search index and graph.json, and keeps draft pieces out', () => {
    const idx = searchIndex(g);
    const row = idx.find((r) => r.id === 'piece/2026-10-08-clients-pressure-lawyers-to-adopt-legal-ai');
    expect(row).toMatchObject({ type: 'piece', name: 'Clients pressure firm and in-house lawyers to adopt legal AI: DISCO survey', href: '/wire/2026/10/clients-pressure-lawyers-to-adopt-legal-ai' });
    expect(publicGraph(g).content.some((c) => c.kind === 'piece')).toBe(true);
    const drafted = { ...g, content: g.content.map((c) => (c.kind === 'piece' ? { ...c, status: 'draft' as const } : c)) };
    expect(publicGraph(drafted).content.some((c) => c.kind === 'piece')).toBe(false);
    expect(searchIndex(drafted).some((r) => r.type === 'piece')).toBe(false);
  });
  it('gives a piece JSON-LD citing the original', () => {
    const p = g.content.find((c) => c.kind === 'piece' && c.slug === 'vals-legal-ai-report')!;
    const ld = jsonLd(p, g) as Record<string, any>;
    expect(ld['@type']).toBe('Article');
    expect(ld.url).toBe('https://thecontractroom.com/wire/2025/02/vals-legal-ai-report');
    expect(ld.citation.url).toBe('https://www.vals.ai/industry-reports/vlair-2-27-25');
  });
  it('redirects include renames from redirects.yaml', () => {
    const r = redirects(g, [{ from: '/clauses/lol', to: '/clauses/limitation-of-liability' }]);
    expect(r).toContainEqual({ from: '/clauses/lol', to: '/clauses/limitation-of-liability' });
  });
  it('entity index lists matter types by industry and market rows with public facts only', () => {
    const o = entityIndex(g);
    expect(o.pages.some((p) => p.matter_type === 'matter-type/enterprise-sale-on-customer-paper' && p.industry === 'industry/saas')).toBe(true);
    expect(JSON.stringify(o.market)).not.toMatch(/email|phone/);
  });
  it('json-ld for a clause is a DefinedTerm with alternateName', () => {
    const ld = jsonLd(g.nodes.find((n) => n.id === 'clause/limitation-of-liability')!, g);
    expect(ld['@type']).toBe('DefinedTerm');
    expect(ld.alternateName).toContain('liability cap');
    expect(ld.url).toBe('https://thecontractroom.com/clauses/limitation-of-liability');
  });
  it('json-ld for an organisation is an Organization and for a person a Person without contact fields', () => {
    const p = jsonLd(g.nodes.find((n) => n.type === 'person') ?? g.nodes.find((n) => n.type === 'organisation')!, g);
    expect(['Person', 'Organization']).toContain(p['@type']);
    expect(JSON.stringify(p)).not.toMatch(/email|telephone/);
  });
  it('turtle names every core node and edge', () => {
    const t = turtle(g);
    expect(t).toContain('<https://thecontractroom.com/clauses/limitation-of-liability>');
    expect(t).toContain('cr:has_position');
  });
  it('search index includes every published editorial item with its href', () => {
    const row = searchIndex(g).find((r) => r.id === 'guide/limitation-of-liability-in-saas-contracts');
    expect(row).toMatchObject({ type: 'guide', name: 'Limitation of liability in SaaS contracts', aliases: [], href: '/guides/limitation-of-liability-in-saas-contracts' });
  });
  it('drafts leave the search index and the published graph, with every edge that touches them', () => {
    const draftId = 'clause/indemnity';
    const draftContent = 'question/is-a-twelve-month-cap-market-for-saas';
    const withDraft = {
      ...g,
      nodes: g.nodes.map((n) => (n.id.split('#')[0] === draftId ? { ...n, status: 'draft' as const } : n)),
      content: g.content.map((c) => (c.id === draftContent ? { ...c, status: 'draft' as const } : c))
    };
    expect(g.edges.some((e) => e.from === draftId || e.to.split('#')[0] === draftId)).toBe(true);
    const idx = searchIndex(withDraft);
    expect(idx.some((r) => r.id === draftId || r.id === draftContent)).toBe(false);
    const pub = publicGraph(withDraft);
    expect(pub.nodes.some((n) => n.id.split('#')[0] === draftId)).toBe(false);
    expect(pub.content.some((c) => c.id === draftContent)).toBe(false);
    expect(pub.edges.some((e) => e.from.split('#')[0] === draftId || e.to.split('#')[0] === draftId)).toBe(false);
    expect(pub.nodes.length).toBe(g.nodes.filter((n) => n.id.split('#')[0] !== draftId).length);
    expect(pub.edges.length).toBeGreaterThan(0);
  });
  it('a draft matter type yields no entity index page row and a draft node no Turtle triple naming it', () => {
    const draftMatter = 'matter-type/enterprise-sale-on-customer-paper';
    const draftClause = 'clause/indemnity';
    const drafts = new Set([draftMatter, draftClause]);
    const withDraft = { ...g, nodes: g.nodes.map((n) => (drafts.has(n.id.split('#')[0]) ? { ...n, status: 'draft' as const } : n)) };
    expect(entityIndex(withDraft).pages.some((p) => p.matter_type === draftMatter)).toBe(true);
    expect(turtle(withDraft)).toContain('<https://thecontractroom.com/clauses/indemnity');
    const pub = publicGraph(withDraft);
    expect(entityIndex(pub).pages.some((p) => p.matter_type === draftMatter)).toBe(false);
    expect(entityIndex(pub).pages.length).toBeGreaterThan(0);
    const t = turtle(pub);
    expect(t).not.toContain('<https://thecontractroom.com/clauses/indemnity');
    expect(t).not.toContain('<https://thecontractroom.com/matters/enterprise-sale-on-customer-paper');
    expect(t).toContain('<https://thecontractroom.com/clauses/limitation-of-liability>');
  });
});
