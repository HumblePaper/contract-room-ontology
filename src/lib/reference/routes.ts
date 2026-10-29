const SEGMENTS: Record<string, string> = {
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
const TYPES: Record<string, string> = Object.fromEntries(Object.entries(SEGMENTS).map(([t, s]) => [s, t]));

const CONTENT_SEGMENTS: Record<string, string> = {
  guide: 'guides', 'how-to': 'how-to', explainer: 'explainers', 'model-language': 'model-language',
  comparison: 'comparisons', ranking: 'rankings', checklist: 'checklists', matrix: 'matrices',
  'market-report': 'market', 'precedent-note': 'precedent-notes', note: 'notes', update: 'updates',
  calculator: 'calculators', question: 'questions', 'reading-list': 'reading', timeline: 'timelines',
  'organisation-profile': 'organisation-profiles', 'team-profile': 'team-profiles',
  'person-profile': 'person-profiles', 'deal-page': 'deal-pages', 'league-table': 'league-tables',
  'career-path': 'career-paths', 'org-chart': 'org-charts', piece: 'wire'
};

export const ALL_TYPES = Object.keys(SEGMENTS);
export const ALL_CONTENT_KINDS = Object.keys(CONTENT_SEGMENTS);

export function segmentFor(type: string): string {
  const s = Object.hasOwn(SEGMENTS, type) ? SEGMENTS[type] : undefined;
  if (!s) throw new Error(`unknown type ${type}`);
  return s;
}
export function typeForSegment(segment: string): string | null {
  return Object.hasOwn(TYPES, segment) ? TYPES[segment] : null;
}
export function splitId(id: string): { type: string; slug: string; variant: string | null } {
  const [core, variant = null] = id.split('#');
  const i = core.indexOf('/');
  return { type: core.slice(0, i), slug: core.slice(i + 1), variant };
}
export function hrefFor(id: string): string {
  const { type, slug, variant } = splitId(id);
  const base = `/${segmentFor(type)}/${slug}`;
  return variant ? `${base}?${variant}` : base;
}
/** A piece's slug without the `yyyy-mm-dd-` prefix its file name carries. */
export function pieceSlug(slug: string): string {
  return slug.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}
export function contentHrefFor(c: { kind: string; slug: string; published: string }): string {
  const seg = Object.hasOwn(CONTENT_SEGMENTS, c.kind) ? CONTENT_SEGMENTS[c.kind] : undefined;
  if (!seg) throw new Error(`unknown content kind ${c.kind}`);
  const [y, m] = c.published.split('-');
  // a piece's file name starts with its date; the page carries the year and month in the path instead
  if (c.kind === 'piece') return `/${seg}/${y}/${m}/${pieceSlug(c.slug)}`;
  if (c.kind === 'note' || c.kind === 'update') return `/${seg}/${y}/${m}/${c.slug}`;
  if (c.kind === 'market-report') return `/${seg}/${y}/${c.slug}`;
  return `/${seg}/${c.slug}`;
}

/** Every entry segment (/clauses, /positions, ...) and every editorial segment (/guides, /notes, ...). */
export const ALL_SEGMENTS = Object.values(SEGMENTS);
export const ALL_CONTENT_SEGMENTS = Object.values(CONTENT_SEGMENTS);
const KINDS_BY_SEGMENT: Record<string, string> = Object.fromEntries(Object.entries(CONTENT_SEGMENTS).map(([k, s]) => [s, k]));

export function contentSegmentFor(kind: string): string {
  const s = Object.hasOwn(CONTENT_SEGMENTS, kind) ? CONTENT_SEGMENTS[kind] : undefined;
  if (!s) throw new Error(`unknown content kind ${kind}`);
  return s;
}
export function kindForSegment(segment: string): string | null {
  return Object.hasOwn(KINDS_BY_SEGMENT, segment) ? KINDS_BY_SEGMENT[segment] : null;
}
