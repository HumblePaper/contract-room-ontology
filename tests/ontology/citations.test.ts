import { describe, it, expect } from 'vitest';
import {
  cacheGet, cachePut, classifyFetch, extractTitle, fetchPage, makeThrottle, parseAllowlist, runChecks, summarise,
  validateFrontmatter, validatePieceFrontmatter, pieceRef, unusedAllowlistEntries, USER_AGENT, CACHE_TTL_MS,
  type Cache, type CheckResult, type FetchFn, type FetchResult, type SourceRef
} from '../../scripts/ontology/citations';
import type { Schema } from '../../scripts/ontology/schema';

const schema = {
  types: { source: { attributes: { kind: { type: 'enum', values: ['statute', 'form', 'website', 'other'] } }, sections: [], min_body_chars: 0 } }
} as unknown as Schema;

const good = { kind: 'statute', url: 'https://www.example.gov/a/b', publisher: 'Example Office', date: '1977' };

describe('validateFrontmatter', () => {
  it('accepts a complete entry, with a year or a full date, string or number', () => {
    expect(validateFrontmatter(good, schema).errors).toEqual([]);
    expect(validateFrontmatter({ ...good, date: '2024-03-09' }, schema).errors).toEqual([]);
    expect(validateFrontmatter({ ...good, date: 1977 }, schema).errors).toEqual([]);
  });
  it('rejects missing or unparseable urls and non-https schemes', () => {
    expect(validateFrontmatter({ ...good, url: undefined }, schema).errors[0]).toMatch(/url is missing/);
    expect(validateFrontmatter({ ...good, url: 'not a url' }, schema).errors[0]).toMatch(/does not parse/);
    expect(validateFrontmatter({ ...good, url: 'http://example.com/x' }, schema).errors[0]).toMatch(/https/);
  });
  it('rejects empty publisher, bad dates and unknown kinds', () => {
    expect(validateFrontmatter({ ...good, publisher: '  ' }, schema).errors[0]).toMatch(/publisher/);
    expect(validateFrontmatter({ ...good, date: '9 March 2024' }, schema).errors[0]).toMatch(/date/);
    expect(validateFrontmatter({ ...good, date: '2024-02-31' }, schema).errors[0]).toMatch(/date/);
    expect(validateFrontmatter({ ...good, kind: 'blog' }, schema).errors[0]).toMatch(/kind/);
  });
  it('treats a missing date as a warning, not an error', () => {
    const v = validateFrontmatter({ ...good, date: undefined }, schema);
    expect(v.errors).toEqual([]);
    expect(v.warnings[0]).toMatch(/date is missing/);
  });
});

describe('extractTitle', () => {
  it('reads and tidies the title', () => {
    expect(extractTitle('<html><head><TITLE>\n  A &amp; B\n  page </TITLE>')).toBe('A & B page');
    expect(extractTitle('<html></html>')).toBeNull();
  });
});

const page = (over: Partial<FetchResult> = {}): FetchResult => ({
  status: 200, finalUrl: 'https://www.example.gov/a/b', contentType: 'text/html; charset=utf-8', title: 'Unfair Contract Terms Act 1977', ...over
});
const cited = 'https://www.example.gov/a/b';
const name = 'Unfair Contract Terms Act 1977';

describe('classifyFetch', () => {
  it('passes a clean page', () => expect(classifyFetch(name, cited, page())).toEqual({ errors: [], warnings: [] }));
  it('errors on non-2xx', () => expect(classifyFetch(name, cited, page({ status: 404 })).errors[0]).toMatch(/status 404/));
  it('errors when a deep link lands on the homepage', () => {
    expect(classifyFetch(name, cited, page({ finalUrl: 'https://www.example.gov/' })).errors.join()).toMatch(/homepage/);
    expect(classifyFetch(name, cited, page({ finalUrl: 'https://www.example.gov' })).errors.join()).toMatch(/homepage/);
  });
  it('does not flag the homepage when the cited url was the homepage', () => {
    const r = classifyFetch('Delaware Code', 'https://delcode.example.gov/', page({ finalUrl: 'https://delcode.example.gov/', title: 'Delaware Code Online' }));
    expect(r.errors).toEqual([]);
  });
  it('errors on a content-type that is neither HTML nor PDF', () => {
    expect(classifyFetch(name, cited, page({ contentType: 'application/json' })).errors.join()).toMatch(/neither HTML nor PDF/);
  });
  it('errors on error-page titles, case-insensitively', () => {
    for (const t of ['404 Error', '404 Not Found', 'Page NOT FOUND', 'Not Found - Unfair Contract Terms', 'Error 404']) {
      expect(classifyFetch(name, cited, page({ title: t })).errors.join()).toMatch(/error page/);
    }
  });
  it('does not treat a 404 inside a legitimate title as an error page', () => {
    for (const t of ['Section 404 of Sarbanes-Oxley', 'Rule 404 - Federal Rules of Evidence']) {
      expect(classifyFetch('Sarbanes Oxley Evidence Rules', cited, page({ title: t })).errors).toEqual([]);
    }
  });
  it('errors on 202 and 204 as unverifiable, but only warns on a 200 with no title', () => {
    for (const status of [202, 204]) {
      expect(classifyFetch(name, cited, page({ status })).errors).toEqual([`page could not be verified: status ${status}`]);
    }
    const r = classifyFetch(name, cited, page({ title: null }));
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual(['page has no title']);
  });
  it('warns when the final host differs, but ignores a www prefix', () => {
    expect(classifyFetch(name, cited, page({ finalUrl: 'https://other.example.org/a/b' })).warnings.join()).toMatch(/differs/);
    expect(classifyFetch(name, 'https://example.gov/a/b', page({ finalUrl: 'https://www.example.gov/a/b' })).warnings).toEqual([]);
  });
  it('warns when the title shares no four-letter word with the name', () => {
    expect(classifyFetch(name, cited, page({ title: 'Welcome to the portal' })).warnings.join()).toMatch(/shares no word/);
    expect(classifyFetch(name, cited, page({ title: 'Terms of use' })).warnings).toEqual([]);
  });
  it('warns on a PDF and skips the title check', () => {
    const r = classifyFetch(name, cited, page({ contentType: 'application/pdf', title: null }));
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual(['PDF, title not checked']);
  });
  it('reports a transport error as an error', () => {
    expect(classifyFetch(name, cited, page({ status: 0, error: 'timed out after 15s' })).errors).toEqual(['timed out after 15s']);
  });
});

describe('allowlist', () => {
  it('ignores comments and blanks', () => {
    const a = parseAllowlist('# paywalled\nhttps://a.example/x  # trailing\n\n  https://b.example/y\n');
    expect([...a]).toEqual(['https://a.example/x', 'https://b.example/y']);
  });
});

describe('cache', () => {
  const r = page();
  it('hits inside the TTL and misses outside it', () => {
    const c: Cache = {};
    cachePut(c, cited, r, 1000);
    expect(cacheGet(c, cited, 1000 + CACHE_TTL_MS - 1)).toEqual(r);
    expect(cacheGet(c, cited, 1000 + CACHE_TTL_MS)).toBeNull();
    expect(cacheGet(c, 'https://other.example/', 2000)).toBeNull();
  });
  it('does not cache 429 or 5xx responses', () => {
    const c: Cache = {};
    for (const status of [429, 500, 503]) cachePut(c, cited, page({ status }), 1);
    expect(c).toEqual({});
    cachePut(c, cited, page({ status: 404 }), 1);
    expect(Object.keys(c)).toEqual([cited]);
  });
  it('does not cache transport errors', () => {
    const c: Cache = {};
    cachePut(c, cited, page({ status: 0, error: 'boom' }), 1);
    expect(c).toEqual({});
  });
});

const html = (title: string, status = 200, ct = 'text/html') =>
  new Response(`<html><title>${title}</title></html>`, { status, headers: { 'content-type': ct } });
const redirect = (to: string) => new Response(null, { status: 301, headers: { location: to } });

describe('fetchPage', () => {
  it('sends the honest user agent and follows redirects to the final url', async () => {
    const seen: Array<{ url: string; ua: string }> = [];
    const f: FetchFn = async (url, init) => {
      seen.push({ url, ua: init.headers['user-agent'] });
      return url.endsWith('/old') ? redirect('/new') : html('Unfair Contract Terms Act');
    };
    const r = await fetchPage('https://x.example/old', { fetchFn: f });
    expect(r).toMatchObject({ status: 200, finalUrl: 'https://x.example/new', title: 'Unfair Contract Terms Act' });
    expect(seen.map((s) => s.ua)).toEqual([USER_AGENT, USER_AGENT]);
    expect(USER_AGENT).not.toMatch(/@/);
  });
  it('stops after five redirects', async () => {
    let n = 0;
    const f: FetchFn = async () => redirect(`/r${++n}`);
    const r = await fetchPage('https://x.example/start', { fetchFn: f });
    expect(r.error).toMatch(/more than 5 redirects/);
    expect(n).toBe(6);
  });
  it('returns an error result, not a crash, on an invalid Location header', async () => {
    const f: FetchFn = async () => redirect('://bad');
    const r = await fetchPage('https://x.example/a', { fetchFn: f });
    expect(r.error).toMatch(/invalid Location header: :\/\/bad/);
  });
  it('turns a thrown fetch into an error result', async () => {
    const f: FetchFn = async () => { throw new Error('ECONNREFUSED'); };
    expect((await fetchPage('https://x.example/', { fetchFn: f })).error).toMatch(/ECONNREFUSED/);
  });
});

describe('throttle', () => {
  it('spaces requests to one host by the gap and leaves other hosts alone', async () => {
    let t = 0;
    const slept: number[] = [];
    const th = makeThrottle(() => t, async (ms) => { slept.push(ms); t += ms; }, 1000);
    await th('a.example');
    await th('a.example');
    await th('b.example');
    await th('a.example');
    expect(slept).toEqual([1000, 1000]);
  });
});

const src = (id: string, name: string, url: string): SourceRef => ({ id, name, frontmatter: { ...good, url } });

describe('runChecks', () => {
  const noSleep = async () => {};
  it('skips allowlisted urls without fetching them', async () => {
    let calls = 0;
    const f: FetchFn = async () => { calls++; return html('x'); };
    const [r] = await runChecks([src('source/a', 'Alpha', 'https://p.example/a')], {
      schema, allowlist: new Set(['https://p.example/a']), fetchFn: f, sleep: noSleep
    });
    expect(r.level).toBe('skip');
    expect(calls).toBe(0);
  });
  it('still validates frontmatter for allowlisted sources, skipping only the fetch', async () => {
    const f: FetchFn = async () => { throw new Error('should not fetch'); };
    const bad: SourceRef = { id: 'source/a', name: 'Alpha', frontmatter: { ...good, url: 'https://p.example/a', date: 'last week' } };
    const [r] = await runChecks([bad], { schema, allowlist: new Set(['https://p.example/a']), fetchFn: f, sleep: noSleep });
    expect(r.level).toBe('error');
    expect(r.errors.join()).toMatch(/date/);
  });
  it('reports allowlist lines that match no source url', () => {
    const sources = [src('source/a', 'Alpha', 'https://p.example/a')];
    expect(unusedAllowlistEntries(new Set(['https://p.example/a', 'https://gone.example/z']), sources)).toEqual(['https://gone.example/z']);
  });
  it('uses the cache and does not refetch inside the TTL', async () => {
    let calls = 0;
    const f: FetchFn = async () => { calls++; return html('Alpha source'); };
    const cache: Cache = {};
    const opts = { schema, allowlist: new Set<string>(), fetchFn: f, sleep: noSleep, cache, now: () => 5000 };
    await runChecks([src('source/a', 'Alpha source', 'https://p.example/a')], opts);
    await runChecks([src('source/a', 'Alpha source', 'https://p.example/a')], opts);
    expect(calls).toBe(1);
  });
  it('limits concurrency to four', async () => {
    let active = 0, peak = 0;
    const f: FetchFn = async () => {
      active++; peak = Math.max(peak, active);
      await new Promise((r) => setTimeout(r, 5));
      active--;
      return html('Alpha source');
    };
    const sources = Array.from({ length: 10 }, (_, i) => src(`source/s${i}`, 'Alpha source', `https://h${i}.example/a`));
    await runChecks(sources, { schema, allowlist: new Set(), fetchFn: f, sleep: noSleep });
    expect(peak).toBe(4);
  });
  it('reports frontmatter problems without fetching when the url is unusable', async () => {
    let calls = 0;
    const f: FetchFn = async () => { calls++; return html('x'); };
    const [r] = await runChecks([src('source/a', 'Alpha', 'http://p.example/a')], { schema, allowlist: new Set(), fetchFn: f, sleep: noSleep });
    expect(r.level).toBe('error');
    expect(calls).toBe(0);
  });
});

describe('summarise', () => {
  const r = (level: CheckResult['level']): CheckResult => ({ id: 'source/x', url: '', level, errors: [], warnings: [] });
  it('counts levels and exits 1 on any error', () => {
    const s = summarise([r('ok'), r('warn'), r('error'), r('skip'), r('skip')]);
    expect(s.line).toBe('5 sources, 1 errors, 1 warnings, 2 skipped');
    expect(s.exitCode).toBe(1);
  });
  it('adds unused-allowlist warnings to the warning total', () => {
    expect(summarise([r('ok')], 2).line).toBe('1 sources, 0 errors, 2 warnings, 0 skipped');
  });
  it('exits 0 with warnings and skips only', () => {
    expect(summarise([r('ok'), r('warn'), r('skip')])).toEqual({ line: '3 sources, 0 errors, 1 warnings, 1 skipped', exitCode: 0 });
  });
});

describe('pieces in the citation check', () => {
  const file = { path: 'ontology/content/piece/2026-10-08-disco-survey.md', frontmatter: { kind: 'piece', title: 'Clients pressure lawyers to adopt legal AI', published: '2026-10-08', block: { url: 'https://p.example/disco', outlet: 'Canadian Lawyer', kind: 'news' } } };
  it('reads a piece file as a citation labelled piece/<slug>', () => {
    expect(pieceRef(file)).toEqual({ id: 'piece/2026-10-08-disco-survey', name: 'Clients pressure lawyers to adopt legal AI', piece: true, frontmatter: { url: 'https://p.example/disco', outlet: 'Canadian Lawyer', published: '2026-10-08' } });
  });
  it('checks a piece url, outlet and full date', () => {
    expect(validatePieceFrontmatter(pieceRef(file).frontmatter).errors).toEqual([]);
    expect(validatePieceFrontmatter({ url: 'http://p.example/x', outlet: 'X', published: '2026-10-08' }).errors[0]).toMatch(/https/);
    expect(validatePieceFrontmatter({ url: 'https://p.example/x', outlet: '', published: '2026-10-08' }).errors[0]).toMatch(/outlet/);
    expect(validatePieceFrontmatter({ url: 'https://p.example/x', outlet: 'X', published: '2026' }).errors[0]).toMatch(/published/);
  });
  it('fetches pieces under the same rules, allowlist and cache as sources', async () => {
    let calls = 0;
    const f: FetchFn = async () => { calls++; return new Response('<title>Clients pressure lawyers on legal AI</title>', { status: 200, headers: { 'content-type': 'text/html' } }); };
    const cache: Cache = {};
    const opts = { schema, allowlist: new Set<string>(), fetchFn: f, sleep: async () => {}, cache, now: () => 5000 };
    const [r] = await runChecks([pieceRef(file)], opts);
    expect(r.level).toBe('ok');
    await runChecks([pieceRef(file)], opts);
    expect(calls).toBe(1);
    const [skipped] = await runChecks([pieceRef(file)], { ...opts, allowlist: new Set(['https://p.example/disco']) });
    expect(skipped.level).toBe('skip');
    expect(unusedAllowlistEntries(new Set(['https://p.example/disco']), [pieceRef(file)])).toEqual([]);
  });
});
