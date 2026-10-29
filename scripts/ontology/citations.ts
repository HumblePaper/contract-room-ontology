import type { Schema } from './schema';

export type Level = 'ok' | 'warn' | 'error' | 'skip';

/**
 * One cited URL to check: a `source/*` entry, or a piece (`piece/<slug>`), whose frontmatter here is
 * `{ url, outlet, published }` read from its block and its publication date.
 */
export interface SourceRef { id: string; name: string; frontmatter: Record<string, unknown>; piece?: boolean }

/** A piece file as a SourceRef: its block's url and outlet, its publication date, its title as the name. */
export function pieceRef(f: { path: string; frontmatter: Record<string, unknown> }): SourceRef {
  const block = (f.frontmatter.block ?? {}) as Record<string, unknown>;
  const slug = f.path.match(/([^/]+)\.md$/)?.[1] ?? '';
  return { id: `piece/${slug}`, name: String(f.frontmatter.title ?? ''), piece: true, frontmatter: { url: block.url, outlet: block.outlet, published: f.frontmatter.published } };
}

export interface FetchResult {
  status: number;
  finalUrl: string;
  contentType: string;
  title: string | null;
  error?: string;
}

export interface CheckResult {
  id: string;
  url: string;
  level: Level;
  errors: string[];
  warnings: string[];
  skipReason?: string;
  fetched?: FetchResult;
}

export type FetchFn = (url: string, init: { headers: Record<string, string>; redirect: 'manual'; signal: AbortSignal }) => Promise<Response>;

export const USER_AGENT = 'TheContractRoom-citation-check/1.0';
export const MAX_REDIRECTS = 5;
export const TIMEOUT_MS = 15_000;
export const CONCURRENCY = 4;
export const HOST_GAP_MS = 1000;
export const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Frontmatter ---------------------------------------------------------------

export function isIsoDate(s: string): boolean {
  if (/^\d{4}$/.test(s)) return true;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

export function validateFrontmatter(fm: Record<string, unknown>, schema: Schema): { errors: string[]; warnings: string[] } {
  const problems: string[] = [];
  const warnings: string[] = [];
  const url = fm.url;
  if (typeof url !== 'string' || !url.trim()) problems.push('url is missing');
  else {
    try {
      if (new URL(url).protocol !== 'https:') problems.push(`url must use https: (${url})`);
    } catch {
      problems.push(`url does not parse (${url})`);
    }
  }
  if (typeof fm.publisher !== 'string' || !fm.publisher.trim()) problems.push('publisher is missing or empty');
  const date = fm.date === undefined || fm.date === null ? '' : String(fm.date).trim();
  if (!date) warnings.push('date is missing');
  else if (!isIsoDate(date)) problems.push(`date must be YYYY-MM-DD or YYYY (${date})`);
  const kinds = schema.types.source?.attributes.kind?.values ?? [];
  if (typeof fm.kind !== 'string' || !kinds.includes(fm.kind)) problems.push(`kind must be one of ${kinds.join(', ')} (${String(fm.kind)})`);
  return { errors: problems, warnings };
}

/** A piece's frontmatter: an https url, an outlet and a full publication date. */
export function validatePieceFrontmatter(fm: Record<string, unknown>): { errors: string[]; warnings: string[] } {
  const problems: string[] = [];
  const url = fm.url;
  if (typeof url !== 'string' || !url.trim()) problems.push('url is missing');
  else {
    try {
      if (new URL(url).protocol !== 'https:') problems.push(`url must use https: (${url})`);
    } catch {
      problems.push(`url does not parse (${url})`);
    }
  }
  if (typeof fm.outlet !== 'string' || !fm.outlet.trim()) problems.push('outlet is missing or empty');
  const date = fm.published === undefined || fm.published === null ? '' : String(fm.published).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !isIsoDate(date)) problems.push(`published must be YYYY-MM-DD (${date})`);
  return { errors: problems, warnings: [] };
}

// Fetching ------------------------------------------------------------------

export function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!m) return null;
  const t = m[1]
    .replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ').trim();
  return t || null;
}

export function isHtml(ct: string): boolean { return /\b(text\/html|application\/xhtml\+xml)\b/i.test(ct); }
export function isPdf(ct: string): boolean { return /\bapplication\/pdf\b/i.test(ct); }

export interface FetchDeps {
  fetchFn: FetchFn;
  throttle?: (host: string) => Promise<void>;
}

export async function fetchPage(url: string, deps: FetchDeps): Promise<FetchResult> {
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await deps.throttle?.(new URL(current).host);
    let res: Response;
    try {
      res = await deps.fetchFn(current, {
        headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/pdf;q=0.9,*/*;q=0.5' },
        redirect: 'manual',
        signal: AbortSignal.timeout(TIMEOUT_MS)
      });
    } catch (e) {
      const err = e as Error;
      const msg = err.name === 'TimeoutError' || err.name === 'AbortError' ? `timed out after ${TIMEOUT_MS / 1000}s` : `fetch failed: ${err.message}`;
      return { status: 0, finalUrl: current, contentType: '', title: null, error: msg };
    }
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      await res.body?.cancel().catch(() => {});
      if (hop === MAX_REDIRECTS) return { status: res.status, finalUrl: current, contentType: '', title: null, error: `more than ${MAX_REDIRECTS} redirects` };
      const loc = res.headers.get('location')!;
      try {
        if (/^:|[\s\u0000-\u001f]/.test(loc)) throw new Error('malformed');
        const next = new URL(loc, current);
        if (next.protocol !== 'https:' && next.protocol !== 'http:') throw new Error('scheme');
        current = next.toString();
      } catch {
        return { status: res.status, finalUrl: current, contentType: '', title: null, error: `invalid Location header: ${loc}` };
      }
      continue;
    }
    const contentType = res.headers.get('content-type') ?? '';
    let title: string | null = null;
    if (isHtml(contentType)) {
      try { title = extractTitle((await res.text()).slice(0, 512 * 1024)); } catch { /* body read failed */ }
    } else {
      await res.body?.cancel().catch(() => {});
    }
    return { status: res.status, finalUrl: current, contentType, title };
  }
  return { status: 0, finalUrl: current, contentType: '', title: null, error: 'redirect loop' };
}

// Classification ------------------------------------------------------------

function bareHost(host: string): string { return host.toLowerCase().replace(/^www\./, ''); }

function words(s: string): Set<string> {
  return new Set(s.toLowerCase().match(/[a-z]{4,}/g) ?? []);
}

export function classifyFetch(name: string, citedUrl: string, f: FetchResult): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (f.error) { errors.push(f.error); return { errors, warnings }; }
  if (f.status === 202 || f.status === 204) errors.push(`page could not be verified: status ${f.status}`);
  else if (f.status < 200 || f.status >= 300) errors.push(`final status ${f.status}`);
  const cited = new URL(citedUrl);
  const final = new URL(f.finalUrl);
  if ((final.pathname === '/' || final.pathname === '') && cited.pathname.length > 1) {
    errors.push(`redirected to the homepage (${f.finalUrl}); the page is probably gone`);
  }
  const html = isHtml(f.contentType);
  const pdf = isPdf(f.contentType);
  if (!html && !pdf) errors.push(`content-type is neither HTML nor PDF (${f.contentType || 'none'})`);
  if (bareHost(final.host) !== bareHost(cited.host)) warnings.push(`final host ${final.host} differs from cited host ${cited.host}`);
  if (pdf) warnings.push('PDF, title not checked');
  if (html) {
    if (f.title && /^\s*(error\s*)?404\b|\b404\b\s*[-–:|]?\s*(error|not found)|page not found|^not found\b/i.test(f.title)) errors.push(`title looks like an error page ("${f.title}")`);
    else if (!f.title) warnings.push('page has no title');
    else {
      const nameWords = words(name);
      if (![...words(f.title)].some((w) => nameWords.has(w))) warnings.push(`title "${f.title}" shares no word of four or more letters with the entry name`);
    }
  }
  return { errors, warnings };
}

// Allowlist -----------------------------------------------------------------

export function parseAllowlist(text: string): Set<string> {
  return new Set(text.split('\n').map((l) => l.replace(/#.*$/, '').trim()).filter(Boolean));
}

// Cache ---------------------------------------------------------------------

export interface CacheEntry { fetchedAt: number; result: FetchResult }
export type Cache = Record<string, CacheEntry>;

export function cacheGet(cache: Cache, url: string, now: number, ttl = CACHE_TTL_MS): FetchResult | null {
  const e = cache[url];
  if (!e || typeof e.fetchedAt !== 'number') return null;
  if (now - e.fetchedAt >= ttl || e.fetchedAt > now) return null;
  return e.result;
}

export function cachePut(cache: Cache, url: string, result: FetchResult, now: number): void {
  if (result.error || result.status === 429 || result.status >= 500) return; // transient failures are retried on the next run
  cache[url] = { fetchedAt: now, result };
}

export function unusedAllowlistEntries(allowlist: Set<string>, sources: SourceRef[]): string[] {
  const urls = new Set(sources.map((s) => s.frontmatter.url));
  return [...allowlist].filter((u) => !urls.has(u));
}

// Running -------------------------------------------------------------------

export interface RunOptions {
  schema: Schema;
  allowlist: Set<string>;
  cache?: Cache;
  fetchFn: FetchFn;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
  concurrency?: number;
  hostGapMs?: number;
}

export function makeThrottle(now: () => number, sleep: (ms: number) => Promise<void>, gap: number) {
  const next = new Map<string, number>();
  return async (host: string) => {
    const t = now();
    const slot = Math.max(t, next.get(host) ?? 0);
    next.set(host, slot + gap);
    if (slot > t) await sleep(slot - t);
  };
}

export async function checkSource(src: SourceRef, opts: RunOptions, throttle: (h: string) => Promise<void>): Promise<CheckResult> {
  const now = opts.now ?? Date.now;
  const url = typeof src.frontmatter.url === 'string' ? src.frontmatter.url : '';
  const base: CheckResult = { id: src.id, url, level: 'ok', errors: [], warnings: [] };
  const fmv = src.piece ? validatePieceFrontmatter(src.frontmatter) : validateFrontmatter(src.frontmatter, opts.schema);
  base.errors.push(...fmv.errors);
  base.warnings.push(...fmv.warnings);
  if (url && opts.allowlist.has(url)) {
    if (base.errors.length) return { ...base, level: 'error' };
    return { ...base, level: 'skip', skipReason: 'allowlisted' };
  }
  let urlOk = false;
  try { urlOk = new URL(url).protocol === 'https:'; } catch { /* reported above */ }
  if (urlOk) {
    let fetched = opts.cache ? cacheGet(opts.cache, url, now()) : null;
    if (!fetched) {
      fetched = await fetchPage(url, { fetchFn: opts.fetchFn, throttle });
      if (opts.cache) cachePut(opts.cache, url, fetched, now());
    }
    base.fetched = fetched;
    const c = classifyFetch(src.name, url, fetched);
    base.errors.push(...c.errors);
    base.warnings.push(...c.warnings);
  }
  base.level = base.errors.length ? 'error' : base.warnings.length ? 'warn' : 'ok';
  return base;
}

export async function runChecks(sources: SourceRef[], opts: RunOptions): Promise<CheckResult[]> {
  const now = opts.now ?? Date.now;
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const throttle = makeThrottle(now, sleep, opts.hostGapMs ?? HOST_GAP_MS);
  const results: CheckResult[] = new Array(sources.length);
  let i = 0;
  const worker = async () => {
    while (i < sources.length) {
      const idx = i++;
      results[idx] = await checkSource(sources[idx], opts, throttle);
    }
  };
  await Promise.all(Array.from({ length: Math.min(opts.concurrency ?? CONCURRENCY, sources.length) }, worker));
  return results;
}

// Output --------------------------------------------------------------------

export function formatLine(r: CheckResult): string {
  if (r.level === 'skip') return `SKIP  ${r.id}: skipped (${r.skipReason})`;
  const label = r.level === 'ok' ? 'OK   ' : r.level === 'warn' ? 'WARN ' : 'ERROR';
  const f = r.fetched;
  const detail = f && !f.error ? ` [${f.status} ${f.contentType.split(';')[0] || 'no content-type'}]` : '';
  const reasons = [...r.errors, ...r.warnings].join('; ');
  return `${label} ${r.id}${detail}${reasons ? `: ${reasons}` : ''}`;
}

export function summarise(results: CheckResult[], extraWarnings = 0): { line: string; exitCode: number } {
  const errors = results.filter((r) => r.level === 'error').length;
  const warnings = results.filter((r) => r.level === 'warn').length + extraWarnings;
  const skipped = results.filter((r) => r.level === 'skip').length;
  return { line: `${results.length} sources, ${errors} errors, ${warnings} warnings, ${skipped} skipped`, exitCode: errors ? 1 : 0 };
}
