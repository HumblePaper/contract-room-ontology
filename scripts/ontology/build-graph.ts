import { marked } from 'marked';
import type { Corpus } from './corpus';
import type { ParsedFile } from './parse';
import { coreId } from './validate';
import { pieceSlug } from '../../src/lib/reference/routes';
import type { Graph, GraphEdge, ReferenceNode, ContentItem, Section, Relation } from '../../src/lib/reference/types';

const COMMON_KEYS = new Set(['id', 'type', 'name', 'aliases', 'summary', 'facets', 'relations', 'sources', 'status', 'revised', 'confidence', 'published']);

function escapeHtml(text: string): string { return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
/** Link and image targets allowed on the page: http, https, mailto, root-relative (`/x`, not `//x`) and fragments. */
export function isSafeHref(href: string): boolean {
  const h = href.trim();
  return /^(https?:|mailto:)/i.test(h) || /^\/(?!\/)/.test(h) || h === '/' || h.startsWith('#');
}
// Raw HTML tokens (block or inline) are escaped, never emitted; Markdown syntax is untouched. A link or image with
// any other target (javascript:, data:, a bare relative path) loses its anchor: a link renders its text, an image its alt.
// Returning false hands a safe link or image to marked's default renderer.
marked.use({
  renderer: {
    html(token) { return escapeHtml(token.text); },
    link(token) { return isSafeHref(token.href) ? false : this.parser.parseInline(token.tokens); },
    image(token) { return isSafeHref(token.href) ? false : escapeHtml(token.text); }
  }
});
export function renderMarkdown(md: string): string { return marked.parse(md, { async: false }) as string; }
const render = renderMarkdown;

function sectionsOf(f: ParsedFile): Section[] {
  return f.sections.map((s) => ({
    heading: s.heading, md: s.md.trim(), html: render(s.md),
    variants: s.variants.map((v) => ({ facet: v.facet, value: v.value, heading: v.heading, md: v.md.trim(), html: render(v.md) }))
  }));
}

function nodeOf(f: ParsedFile): ReferenceNode {
  const fm = f.frontmatter;
  const id = String(fm.id);
  const attributes: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fm)) if (!COMMON_KEYS.has(k)) attributes[k] = v;
  return {
    id, type: String(fm.type), slug: id.slice(id.indexOf('/') + 1), name: String(fm.name),
    aliases: (fm.aliases as string[]) ?? [], summary: String(fm.summary), facets: (fm.facets as Record<string, string[]>) ?? {},
    attributes, relations: (fm.relations as Relation[]) ?? [], sources: (fm.sources as string[]) ?? [],
    status: fm.status as ReferenceNode['status'], revised: String(fm.revised), confidence: fm.confidence as ReferenceNode['confidence'],
    sections: sectionsOf(f)
  };
}

function contentOf(f: ParsedFile): ContentItem {
  const fm = f.frontmatter;
  const m = f.path.match(/content\/([^/]+)\/([^/]+)\.md$/)!;
  return {
    // a piece keeps its dated file name in its id; its slug drops the date, which its URL carries as year and month
    id: `${m[1]}/${m[2]}`, kind: String(fm.kind), slug: m[1] === 'piece' ? pieceSlug(m[2]) : m[2], title: String(fm.title), summary: String(fm.summary),
    about: (fm.about as string[]) ?? [], facets: (fm.facets as Record<string, string[]>) ?? {}, sources: (fm.sources as string[]) ?? [],
    status: fm.status as ContentItem['status'], published: String(fm.published), revised: String(fm.revised),
    byline: String(fm.byline ?? 'The Contract Room'), block: (fm.block as Record<string, unknown>) ?? {}, sections: sectionsOf(f)
  };
}

export function buildGraph(corpus: Corpus): Graph {
  const nodes: ReferenceNode[] = [];
  const content: ContentItem[] = [];
  const edges: GraphEdge[] = [];
  for (const f of corpus.files) (f.kind === 'content' ? content.push(contentOf(f)) : nodes.push(nodeOf(f)));
  const ids = new Set(nodes.map((n) => n.id));

  const variants: ReferenceNode[] = [];
  for (const n of nodes) for (const s of n.sections) for (const v of s.variants) {
    const vid = `${n.id}#${v.facet}=${v.value}`;
    variants.push({
      id: vid, type: n.type, slug: `${n.slug}--${v.facet}-${v.value}`, name: `${n.name} (${v.heading})`, aliases: [], summary: n.summary,
      facets: { [v.facet]: [v.value] }, attributes: {}, relations: [], sources: [],
      status: n.status, revised: n.revised, confidence: n.confidence,
      sections: [{ heading: s.heading, md: v.md, html: v.html, variants: [] }]
    });
    const facetEntity = `${v.facet}/${v.value}`;
    if (ids.has(facetEntity)) edges.push({ from: vid, rel: 'specific_to', to: facetEntity, inverse: 'has_specific' });
  }

  for (const n of nodes) for (const r of n.relations) {
    const def = corpus.schema.relations[r.rel];
    const base = { strength: r.strength, note: r.note, since: r.since, capacity: r.capacity, order: r.order };
    edges.push({ from: n.id, rel: r.rel, to: r.to, inverse: def.inverse, ...base });
    edges.push({ from: coreId(r.to), rel: def.inverse, to: n.id, inverse: r.rel, ...base });
  }
  for (const n of nodes) for (const s of n.sources) {
    edges.push({ from: n.id, rel: 'cites', to: s, inverse: 'cited_by' });
    edges.push({ from: s, rel: 'cited_by', to: n.id, inverse: 'cites' });
  }
  return { generated: new Date().toISOString(), vocab: 'https://thecontractroom.com/vocab#', nodes: [...nodes, ...variants], content, edges };
}
