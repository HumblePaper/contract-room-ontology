import type { Corpus } from './corpus';
import type { ParsedFile } from './parse';
import { normaliseHeading } from './parse';
import type { AttrDef, Schema } from './schema';

export interface Diagnostic { level: 'error' | 'warning'; path: string; message: string }

const COMMON: Record<string, AttrDef> = {
  id: { type: 'string', required: true }, type: { type: 'string', required: true }, name: { type: 'string', required: true },
  aliases: { type: 'string[]' }, summary: { type: 'string', required: true }, facets: { type: 'object[]' },
  relations: { type: 'object[]' }, sources: { type: 'id[]', ref: ['source'] },
  status: { type: 'enum', values: ['draft', 'reviewed', 'authoritative'], required: true },
  revised: { type: 'string', required: true }, confidence: { type: 'enum', values: ['high', 'medium', 'low'], required: true },
  published: { type: 'string' }
};
const CONTENT_COMMON: Record<string, AttrDef> = {
  id: { type: 'string' }, kind: { type: 'string', required: true }, title: { type: 'string', required: true },
  summary: { type: 'string', required: true }, about: { type: 'id[]', required: true }, facets: { type: 'object[]' },
  sources: { type: 'id[]', ref: ['source'] }, status: { type: 'enum', values: ['draft', 'reviewed', 'authoritative'], required: true },
  published: { type: 'string', required: true }, revised: { type: 'string', required: true }, byline: { type: 'string' },
  block: { type: 'object[]' }
};

export function coreId(id: string): string { return id.split('#')[0]; }

function idFromPath(f: ParsedFile): string | null {
  const m = f.path.match(/ontology\/(entries|market|content)\/([^/]+)\/([^/]+)\.md$/);
  return m ? `${m[2]}/${m[3]}` : null;
}

function checkAttr(path: string, key: string, def: AttrDef, value: unknown, out: Diagnostic[]) {
  const err = (m: string) => out.push({ level: 'error', path, message: `${key}: ${m}` });
  switch (def.type) {
    case 'string': if (typeof value !== 'string') err('must be a string'); break;
    case 'number': if (typeof value !== 'number') err('must be a number'); break;
    case 'boolean': if (typeof value !== 'boolean') err('must be a boolean'); break;
    case 'enum': if (!def.values?.includes(String(value))) err(`must be one of ${def.values?.join(', ')}, got ${value}`); break;
    case 'string[]': if (!Array.isArray(value) || value.some((v) => typeof v !== 'string')) err('must be a list of strings'); break;
    case 'id': if (typeof value !== 'string' || !value.includes('/')) err('must be an id'); break;
    case 'id[]': if (!Array.isArray(value) || value.some((v) => typeof v !== 'string' || !v.includes('/'))) err('must be a list of ids'); break;
    case 'object[]': if (typeof value !== 'object' || value === null) err('must be a list or map'); break;
  }
}

function checkAttributes(f: ParsedFile, defs: Record<string, AttrDef>, out: Diagnostic[]) {
  for (const [k, d] of Object.entries(defs)) {
    if (d.required && f.frontmatter[k] === undefined) out.push({ level: 'error', path: f.path, message: `${k}: required` });
    else if (f.frontmatter[k] !== undefined) checkAttr(f.path, k, d, f.frontmatter[k], out);
  }
  for (const k of Object.keys(f.frontmatter)) if (!defs[k]) out.push({ level: 'error', path: f.path, message: `${k}: unknown attribute` });
}

/** A real calendar date written in full as YYYY-MM-DD. */
export function isFullDate(s: string): boolean {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

/** The first sentence of a run of prose. */
function firstSentence(text: string): string {
  return text.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+/)[0] ?? '';
}

const PIECE_SECTIONS = new Set(['summary', 'figures']);

/**
 * The rules for one piece (an external article, report or post we summarise and link to): an https url, a full
 * publication date that the file name repeats, a Summary section of two to five sentences, an optional Figures
 * section of `value, what it is` bullets, and, for vendor material and posts, a first sentence that says so.
 */
function checkPiece(f: ParsedFile, block: Record<string, unknown>, out: Diagnostic[]) {
  const err = (message: string) => out.push({ level: 'error', path: f.path, message });
  const warn = (message: string) => out.push({ level: 'warning', path: f.path, message });
  if (typeof block.url === 'string') {
    let https = false;
    try { https = new URL(block.url).protocol === 'https:'; } catch { /* reported below */ }
    if (!https) err(`block.url must be an https URL (${block.url})`);
  }
  const published = String(f.frontmatter.published ?? '');
  if (!isFullDate(published)) err(`published must be a full date, YYYY-MM-DD (${published})`);
  const desk = ((f.frontmatter.facets ?? {}) as Record<string, string[]>).desk ?? [];
  if (desk.length !== 1) err(`a piece carries exactly one desk facet (facets.desk), not ${desk.length}`);
  const file = f.path.match(/ontology\/content\/piece\/([^/]+)\.md$/)?.[1] ?? '';
  const named = file.match(/^(\d{4}-\d{2}-\d{2})-[a-z0-9-]+$/);
  if (!named) err(`a piece file is named <yyyy>-<mm>-<dd>-<slug>.md (${file}.md)`);
  else if (isFullDate(published) && named[1] !== published) err(`file date ${named[1]} does not match published ${published}`);
  for (const s of f.sections) if (!PIECE_SECTIONS.has(normaliseHeading(s.heading))) err(`unexpected section "${s.heading}": a piece has Summary and, optionally, Figures`);
  const summary = f.sections.find((s) => normaliseHeading(s.heading) === 'summary');
  if (!summary) err('missing section "Summary"');
  else {
    const n = summary.md.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+/).filter((x) => x.trim()).length;
    if (n < 2 || n > 5) warn(`Summary has ${n} sentences; a piece's summary runs two to five`);
  }
  const figures = f.sections.find((s) => normaliseHeading(s.heading) === 'figures');
  for (const line of (figures?.md ?? '').split('\n').filter((l) => l.trim())) {
    if (!/^\s*[-*]\s+[^,]+,\s+\S/.test(line)) warn(`Figures line is not "- value, what it is": ${line.trim().slice(0, 60)}`);
  }
  const kind = String(block.kind ?? '');
  if (kind === 'vendor' || kind === 'post') {
    const outlet = String(block.outlet ?? '').toLowerCase();
    const says = (t: string) => {
      const s = firstSentence(t).toLowerCase();
      return (outlet && s.includes(outlet)) || new RegExp(`\\b${kind === 'vendor' ? 'vendor' : 'post'}`).test(s);
    };
    if (!says(String(f.frontmatter.summary ?? '')) && !says(summary?.md ?? '')) {
      warn(`a ${kind} piece names its outlet or says "${kind}" in its summary's first sentence`);
    }
  }
}

/** Two pieces may not share a url, nor the same /wire/<yyyy>/<mm>/<slug> page. */
function checkPieceUniqueness(pieces: ParsedFile[], out: Diagnostic[]) {
  const urls = new Map<string, string>();
  const pages = new Map<string, string>();
  for (const f of pieces) {
    const url = (f.frontmatter.block as Record<string, unknown> | undefined)?.url;
    if (typeof url === 'string') {
      if (urls.has(url)) out.push({ level: 'error', path: f.path, message: `duplicate url ${url} (also in ${urls.get(url)})` });
      else urls.set(url, f.path);
    }
    const file = f.path.match(/([^/]+)\.md$/)?.[1] ?? '';
    const page = `${String(f.frontmatter.published ?? '').slice(0, 7)}/${file.replace(/^\d{4}-\d{2}-\d{2}-/, '')}`;
    if (pages.has(page)) out.push({ level: 'error', path: f.path, message: `same page as ${pages.get(page)} (/wire/${page.replace('-', '/')})` });
    else pages.set(page, f.path);
  }
}

export function validate(corpus: Corpus): Diagnostic[] {
  const { schema, files } = corpus;
  const out: Diagnostic[] = [];
  const nodes = files.filter((f) => f.kind !== 'content');
  const content = files.filter((f) => f.kind === 'content');
  const byId = new Map<string, ParsedFile>();
  const names = new Map<string, string>();

  for (const f of nodes) {
    const id = String(f.frontmatter.id ?? '');
    const type = String(f.frontmatter.type ?? '');
    const def = schema.types[type];
    if (!def) { out.push({ level: 'error', path: f.path, message: `type: unknown type ${type}` }); continue; }
    const fromPath = idFromPath(f);
    if (fromPath !== id) out.push({ level: 'error', path: f.path, message: `id ${id} does not match path (${fromPath})` });
    if (!/^[a-z0-9-]+\/[a-z0-9-]+$/.test(id)) out.push({ level: 'error', path: f.path, message: `id ${id} is not type/kebab-slug` });
    if (byId.has(id)) out.push({ level: 'error', path: f.path, message: `duplicate id ${id} (also defined in ${byId.get(id)!.path})` });
    else byId.set(id, f);
    checkAttributes(f, { ...COMMON, ...def.attributes }, out);
    const summary = String(f.frontmatter.summary ?? '');
    if (summary.length > 160) out.push({ level: 'error', path: f.path, message: `summary is ${summary.length} characters; the limit is 160` });
    const have = new Set(f.sections.map((s) => normaliseHeading(s.heading)));
    for (const s of def.sections) if (!have.has(normaliseHeading(s))) out.push({ level: 'error', path: f.path, message: `missing section "${s}"` });
    const status = String(f.frontmatter.status);
    const bodyChars = f.sections.reduce((n, s) => n + s.md.replace(/\s+/g, ' ').trim().length + s.variants.reduce((m, v) => m + v.md.length, 0), 0);
    if (status !== 'draft' && bodyChars < def.min_body_chars) out.push({ level: 'error', path: f.path, message: `body is ${bodyChars} characters; ${def.min_body_chars} required above draft` });
    const facets = (f.frontmatter.facets ?? {}) as Record<string, string[]>;
    for (const [facet, values] of Object.entries(facets)) {
      if (!schema.facets[facet]) { out.push({ level: 'error', path: f.path, message: `unknown facet ${facet}` }); continue; }
      if (facet === 'desk') { out.push({ level: 'error', path: f.path, message: 'desk is a facet of pieces only' }); continue; }
      if (!Array.isArray(values)) { out.push({ level: 'error', path: f.path, message: `facet ${facet}: must be a list` }); continue; }
      for (const v of values) if (!schema.facets[facet].includes(v)) out.push({ level: 'error', path: f.path, message: `facet ${facet}: ${v} is not in the vocabulary` });
    }
    for (const s of f.sections) for (const v of s.variants) {
      if (!schema.facets[v.facet]?.includes(v.value)) out.push({ level: 'error', path: f.path, message: `variant "${v.heading}" is not a ${v.facet} value` });
    }
    const name = String(f.frontmatter.name ?? '').toLowerCase();
    if (names.has(name) && names.get(name) !== id) out.push({ level: 'error', path: f.path, message: `name "${name}" collides with ${names.get(name)}` });
    names.set(name, id);
    for (const a of (f.frontmatter.aliases as string[] | undefined) ?? []) {
      const al = a.toLowerCase();
      if (names.has(al) && names.get(al) !== id) out.push({ level: 'error', path: f.path, message: `alias "${a}" collides with ${names.get(al)}` });
      names.set(al, id);
    }
  }

  for (const f of nodes) {
    const type = String(f.frontmatter.type);
    for (const r of (f.frontmatter.relations as { rel: string; to: string; order?: number }[] | undefined) ?? []) {
      const def = schema.relations[r.rel];
      if (!def) { out.push({ level: 'error', path: f.path, message: `unknown relation ${r.rel}` }); continue; }
      const target = byId.get(coreId(r.to));
      if (!target) { out.push({ level: 'error', path: f.path, message: `${r.rel}: target ${r.to} does not exist` }); continue; }
      if (!def.domain.includes('*') && !def.domain.includes(type)) out.push({ level: 'error', path: f.path, message: `${r.rel}: domain ${type} is not allowed` });
      const tt = String(target.frontmatter.type);
      if (!def.range.includes(tt)) out.push({ level: 'error', path: f.path, message: `${r.rel}: range ${tt} is not allowed (target ${r.to})` });
      if (def.ordered && typeof r.order !== 'number') out.push({ level: 'error', path: f.path, message: `${r.rel}: ordered relation needs order` });
    }
    for (const s of (f.frontmatter.sources as string[] | undefined) ?? []) {
      if (!byId.has(s)) out.push({ level: 'error', path: f.path, message: `source ${s} does not exist` });
    }
    for (const [k, d] of Object.entries(schema.types[type]?.attributes ?? {})) {
      if (!d.ref) continue;
      const vals = ([] as unknown[]).concat(f.frontmatter[k] ?? []);
      for (const v of vals) {
        const t = byId.get(coreId(String(v)));
        if (!t) out.push({ level: 'error', path: f.path, message: `${k}: ${v} does not exist` });
        else if (!d.ref.includes(String(t.frontmatter.type))) out.push({ level: 'error', path: f.path, message: `${k}: ${v} must be one of ${d.ref.join(', ')}` });
      }
    }
  }

  for (const f of content) {
    const kind = String(f.frontmatter.kind ?? '');
    const def = schema.content[kind];
    if (!def) { out.push({ level: 'error', path: f.path, message: `kind: unknown content kind ${kind}` }); continue; }
    checkAttributes(f, CONTENT_COMMON, out);
    const where = f.path.match(/ontology\/content\/([^/]+)\/([^/]+)\.md$/);
    if (!where) out.push({ level: 'error', path: f.path, message: 'content path must be ontology/content/<kind>/<slug>.md' });
    else {
      if (where[1] !== kind) out.push({ level: 'error', path: f.path, message: `kind does not match folder (${kind} in ${where[1]}/)` });
      if (!/^[a-z0-9-]+$/.test(where[2])) out.push({ level: 'error', path: f.path, message: `slug is not kebab-case (${where[2]})` });
    }
    for (const s of (f.frontmatter.sources as string[] | undefined) ?? []) {
      if (!s.startsWith('source/') || !byId.has(s)) out.push({ level: 'error', path: f.path, message: `source ${s} does not exist` });
    }
    const rawAbout = f.frontmatter.about;
    const about = Array.isArray(rawAbout) ? (rawAbout as string[]) : [];
    if (Array.isArray(rawAbout) && about.length === 0) out.push({ level: 'error', path: f.path, message: 'about: at least one entity required' });
    for (const a of about) if (!byId.has(coreId(a))) out.push({ level: 'error', path: f.path, message: `about: ${a} does not exist` });
    // two ids with one core id would write the same ref_content_about row twice
    const cores = new Map<string, string>();
    for (const a of about) {
      const c = coreId(a);
      if (cores.has(c)) out.push({ level: 'error', path: f.path, message: `about: ${a} and ${cores.get(c)} name the same entity ${c}` });
      else cores.set(c, a);
    }
    const block = (f.frontmatter.block ?? {}) as Record<string, unknown>;
    for (const [k, d] of Object.entries(def.block ?? {})) {
      if (d.required && block[k] === undefined) out.push({ level: 'error', path: f.path, message: `block.${k}: required` });
      else if (block[k] !== undefined) checkAttr(f.path, `block.${k}`, d, block[k], out);
    }
    // each entry of block.items is checked against the kind's item fields (a reading list's source, optional title and url, note)
    if (def.item && Array.isArray(block.items)) {
      block.items.forEach((it, i) => {
        const o = (typeof it === 'object' && it !== null ? it : {}) as Record<string, unknown>;
        for (const [k, d] of Object.entries(def.item ?? {})) {
          if (d.required && o[k] === undefined) out.push({ level: 'error', path: f.path, message: `block.items[${i}].${k}: required` });
          else if (o[k] !== undefined) checkAttr(f.path, `block.items[${i}].${k}`, d, o[k], out);
        }
        if (typeof o.source === 'string' && !byId.has(o.source)) out.push({ level: 'error', path: f.path, message: `block.items[${i}].source ${o.source} does not exist` });
      });
    }
    if (def.needs_year && typeof block.year !== 'number' && typeof block.period !== 'string') out.push({ level: 'error', path: f.path, message: 'a dated kind needs block.year or block.period' });
    const summary = String(f.frontmatter.summary ?? '');
    if (summary.length > 160) out.push({ level: 'error', path: f.path, message: `summary is ${summary.length} characters; the limit is 160` });
    // content facets are checked against the vocabularies as entity facets are
    const facets = (f.frontmatter.facets ?? {}) as Record<string, string[]>;
    for (const [facet, values] of Object.entries(facets)) {
      if (!schema.facets[facet]) { out.push({ level: 'error', path: f.path, message: `unknown facet ${facet}` }); continue; }
      if (!Array.isArray(values)) { out.push({ level: 'error', path: f.path, message: `facet ${facet} must be a list` }); continue; }
      for (const v of values) if (!schema.facets[facet].includes(v)) out.push({ level: 'error', path: f.path, message: `facet ${facet}: ${v} is not in the vocabulary` });
    }
    if (kind === 'piece') checkPiece(f, block, out);
  }
  checkPieceUniqueness(content.filter((f) => f.frontmatter.kind === 'piece'), out);

  // Orphans: warning until the catalogue is complete.
  const inbound = new Set<string>();
  for (const f of nodes) for (const r of (f.frontmatter.relations as { to: string }[] | undefined) ?? []) inbound.add(coreId(r.to));
  for (const f of content) for (const a of (f.frontmatter.about as string[] | undefined) ?? []) inbound.add(coreId(a));
  for (const f of nodes) {
    const id = String(f.frontmatter.id);
    const hasOut = ((f.frontmatter.relations as unknown[] | undefined) ?? []).length > 0;
    if (!inbound.has(id) && !hasOut) out.push({ level: 'warning', path: f.path, message: `orphan: ${id} has no relations in or out` });
  }
  return out;
}
