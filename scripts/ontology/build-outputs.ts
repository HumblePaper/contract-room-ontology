import type { Graph } from '../../src/lib/reference/types';
import { hrefFor, contentHrefFor } from '../../src/lib/reference/routes';

/** The graph as published to the public outputs (graph.json, search.json): drafts and every edge touching one removed. */
export function publicGraph(g: Graph): Graph {
  const draft = new Set([...g.nodes.filter((n) => n.status === 'draft').map((n) => n.id), ...g.content.filter((c) => c.status === 'draft').map((c) => c.id)]);
  const hidden = (id: string) => draft.has(id) || draft.has(id.split('#')[0]);
  return {
    ...g,
    nodes: g.nodes.filter((n) => !hidden(n.id)),
    content: g.content.filter((c) => !hidden(c.id)),
    edges: g.edges.filter((e) => !hidden(e.from) && !hidden(e.to))
  };
}

/** One row per published core node and per published editorial item. */
export function searchIndex(g: Graph) {
  const pub = publicGraph(g);
  return [
    ...pub.nodes.filter((n) => !n.id.includes('#')).map((n) => ({
      id: n.id, type: n.type, name: n.name, aliases: n.aliases, summary: n.summary, facets: n.facets, href: hrefFor(n.id)
    })),
    ...pub.content.map((c) => ({
      id: c.id, type: c.kind, name: c.title, aliases: [] as string[], summary: c.summary, facets: c.facets, href: contentHrefFor(c)
    }))
  ];
}

export function redirects(g: Graph, extra: { from: string; to: string }[]) {
  const seen = new Set<string>();
  const out: { from: string; to: string }[] = [];
  for (const r of extra) if (!seen.has(r.from)) { seen.add(r.from); out.push(r); }
  return out;
}

export function entityIndex(g: Graph) {
  const edgesFrom = (id: string, rel: string) => g.edges.filter((e) => e.from === id && e.rel === rel).map((e) => e.to);
  const pages: { industry: string | null; role: string | null; matter_type: string | null; url: string; hook: string }[] = [];
  for (const m of g.nodes.filter((n) => n.type === 'matter-type' && !n.id.includes('#'))) {
    const industries = edgesFrom(m.id, 'specific_to').filter((t) => t.startsWith('industry/'));
    const roles = edgesFrom(m.id, 'owned_by');
    const combos = (industries.length ? industries : [null]).flatMap((i) => (roles.length ? roles : [null]).map((r) => ({ industry: i, role: r })));
    for (const c of combos) pages.push({ ...c, matter_type: m.id, url: hrefFor(m.id), hook: m.summary });
  }
  for (const c of g.content.filter((c) => c.kind === 'guide' || c.kind === 'how-to')) {
    pages.push({ industry: null, role: null, matter_type: null, url: contentHrefFor(c), hook: c.summary });
  }
  const market = g.nodes.filter((n) => ['organisation', 'team', 'person'].includes(n.type) && !n.id.includes('#')).map((n) => ({
    organisation: n.type === 'organisation' ? n.id : (n.attributes.current_organisation as string) ?? (n.attributes.organisation as string) ?? null,
    team: n.type === 'team' ? n.id : null,
    person: n.type === 'person' ? n.id : null,
    url: hrefFor(n.id)
  }));
  return { pages, market };
}
