import type { Graph } from '../../src/lib/reference/types';

const q = (v: unknown): string => (v === undefined || v === null ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const CHUNK = 400;
// SQLite (and D1, at about 100 KB) rejects very long statements, so a blob over this many characters is stored as
// rows `key.0`, `key.1`, ... that concatenate back to the original. Smaller blobs keep their plain key.
const BLOB_PART = 32000;

function blobRows(key: string, json: string): [string, string][] {
  if (json.length <= BLOB_PART) return [[key, json]];
  const rows: [string, string][] = [];
  for (let i = 0; i < json.length; ) {
    let end = Math.min(i + BLOB_PART, json.length);
    const last = json.charCodeAt(end - 1);
    if (end < json.length && last >= 0xd800 && last <= 0xdbff) end -= 1; // never split a surrogate pair
    rows.push([`${key}.${rows.length}`, json.slice(i, end)]);
    i = end;
  }
  return rows;
}

/** Every reference table and its columns, in one place: the fill inserts and the swap both use these lists. */
export const COLUMNS: Record<string, string[]> = {
  ref_nodes: ['id', 'core_id', 'type', 'slug', 'name', 'summary', 'status', 'revised', 'confidence', 'json'],
  ref_aliases: ['alias', 'node_id'],
  ref_facets: ['node_id', 'facet', 'value'],
  ref_edges: ['from_id', 'rel', 'to_id', 'inverse', 'strength', 'note', 'since', 'capacity', 'ord'],
  ref_content: ['id', 'kind', 'slug', 'title', 'summary', 'status', 'published', 'revised', 'json'],
  ref_content_about: ['content_id', 'node_id'],
  ref_redirects: ['from_path', 'to_path'],
  ref_blobs: ['key', 'json']
};
const TABLES = Object.keys(COLUMNS);
const insertNext = (t: string, values: unknown[]): string => `INSERT INTO ${t}_next (${COLUMNS[t].join(', ')}) VALUES (${values.map(q).join(', ')})`;

/**
 * The reload as an ordered list of SQL files, built as a generation swap:
 *   1. file 0 truncates the `_next` tables;
 *   2. the following files insert the whole graph into the `_next` tables, at most CHUNK statements each;
 *   3. the LAST file swaps: for each table it deletes the live rows and copies in the `_next` rows, empties the `_next`
 *      tables, and records the generation in ref_meta.
 * The swap file is meant to be atomic with respect to readers (old generation or new, never an empty or partial table).
 * Known: D1 runs batched statements transactionally, and a file cannot contain BEGIN or COMMIT itself. To confirm on a
 * scratch database before the first remote swap: whether `wrangler d1 execute --remote --file` wraps the whole file.
 * ontology-load.mts checks the live node count against ref_meta after the swap. Files 0 to n-2 touch only `_next`
 * tables, so a failure there leaves the live site untouched. The swap file must be applied last, after every other file.
 */
export function d1Sql(g: Graph, redirects: { from: string; to: string }[], blobs: Record<string, string> = {}, now: Date = new Date()): string[] {
  const stmts: string[] = [];
  for (const n of g.nodes) {
    stmts.push(insertNext('ref_nodes', [n.id, n.id.split('#')[0], n.type, n.slug, n.name, n.summary, n.status, n.revised, n.confidence, JSON.stringify(n)]));
    for (const a of n.aliases) stmts.push(insertNext('ref_aliases', [a.toLowerCase(), n.id]));
    for (const [f, vs] of Object.entries(n.facets)) for (const v of vs) stmts.push(insertNext('ref_facets', [n.id, f, v]));
  }
  for (const e of g.edges) stmts.push(insertNext('ref_edges', [e.from, e.rel, e.to, e.inverse, e.strength, e.note, e.since, e.capacity, e.order]));
  for (const c of g.content) {
    stmts.push(insertNext('ref_content', [c.id, c.kind, c.slug, c.title, c.summary, c.status, c.published, c.revised, JSON.stringify(c)]));
    for (const a of c.about) stmts.push(insertNext('ref_content_about', [c.id, a.split('#')[0]]));
    // content facets (a piece's desk) share ref_facets; entity facet counts join ref_nodes, so content rows never reach them
    for (const [f, vs] of Object.entries(c.facets ?? {})) for (const v of vs) stmts.push(insertNext('ref_facets', [c.id, f, v]));
  }
  for (const r of redirects) stmts.push(insertNext('ref_redirects', [r.from, r.to]));
  for (const [key, json] of Object.entries(blobs).flatMap(([k, v]) => blobRows(k, v))) stmts.push(insertNext('ref_blobs', [key, json]));
  const files: string[] = [TABLES.map((t) => `DELETE FROM ${t}_next`).join(';\n') + ';\n'];
  for (let i = 0; i < stmts.length; i += CHUNK) files.push(stmts.slice(i, i + CHUNK).join(';\n') + ';\n');
  const swap = [
    ...TABLES.flatMap((t) => [`DELETE FROM ${t}`, `INSERT INTO ${t} (${COLUMNS[t].join(', ')}) SELECT ${COLUMNS[t].join(', ')} FROM ${t}_next`]),
    ...TABLES.map((t) => `DELETE FROM ${t}_next`),
    `INSERT OR REPLACE INTO ref_meta (key, value) VALUES ('generation', ${q(now.toISOString())})`,
    `INSERT OR REPLACE INTO ref_meta (key, value) VALUES ('node_count', ${q(String(g.nodes.length))})`
  ];
  files.push(swap.join(';\n') + ';\n');
  return files;
}
