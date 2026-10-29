import type { Corpus } from './corpus';
import type { Diagnostic } from './validate';

const ANAPHORA = ['the tool', 'the work', 'that gap', 'the note', 'the demonstrations', 'the demonstration', 'the software', 'the system'];
const PERSON_BANNED = ['email', 'phone', 'address', 'mobile', 'linkedin_url'];

function compile(denylist: string[]): { label: string; re: RegExp }[] {
  return denylist.map((d) =>
    d.startsWith('re:') ? { label: d, re: new RegExp(d.slice(3), 'i') } : { label: d, re: new RegExp(d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
  );
}

function walkStringsInFrontmatter(obj: unknown, path: string = ''): { path: string; value: string }[] {
  const results: { path: string; value: string }[] = [];
  if (typeof obj === 'string') {
    results.push({ path: path || 'value', value: obj });
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      const itemPath = path ? `${path}[${i}]` : `[${i}]`;
      results.push(...walkStringsInFrontmatter(item, itemPath));
    });
  } else if (obj !== null && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      const fieldPath = path ? `${path}.${key}` : key;
      results.push(...walkStringsInFrontmatter(value, fieldPath));
    }
  }
  return results;
}

const NOT_JUST_BUT = /\bnot\s+(?:just|only|merely)\b[^.!?]*?\bbut\b/i;
const FILLER = [/\bit['’]s worth noting\b/i, /\bit is worth noting\b/i, /\bunderscore[sd]\b/i, /\bhighlights the\b/i, /\bhighlighting\b/i, /\bstands as a testament\b/i, /\bin a world where\b/i];
const BARE_DOLLAR = /(^|[^A-Za-z])\$\s?\d/;
const SIGNIFICANCE = [/\bwhat matters is\b/i, /\bthe real signal\b/i, /\bthe real story\b/i, /\bthe structure matters\b/i];
/** Frontmatter fields that quote a source verbatim and so keep its wording. */
const VERBATIM_FIELDS = /(^|\.)(excerpt|quote)$/;

/** The voice rules that are errors, applied to one paragraph or field. Inline code spans are ignored for the currency check. Returns messages without location. */
export function voiceErrors(text: string): string[] {
  const out: string[] = [];
  if (NOT_JUST_BUT.test(text)) out.push('"not just / not only / not merely ... but": state the point directly');
  for (const re of FILLER) {
    const m = re.exec(text);
    if (m) out.push(`filler tell "${m[0]}": cut it and state the fact`);
  }
  if (BARE_DOLLAR.test(text.replace(/`[^`]*`/g, ''))) out.push('bare "$" before an amount: write US$, A$, S$, C$, HK$, ₹, €, RMB or an ISO code');
  return out;
}

/** Body prose with fenced code, headings and table rows removed, one paragraph or list item per entry. */
function proseLines(body: string): string[] {
  const out: string[] = [];
  let fenced = false;
  for (const line of body.split('\n')) {
    if (/^\s*```/.test(line)) { fenced = !fenced; continue; }
    if (fenced || /^\s*#/.test(line) || /^\s*\|/.test(line) || !line.trim()) continue;
    out.push(line);
  }
  return out;
}

/** True when a sentence uses a semicolon to join two clauses rather than to separate items in a list introduced by a colon. */
export function semicolonJoinsClauses(sentence: string): boolean {
  const i = sentence.indexOf(';');
  if (i < 0) return false;
  if (sentence.slice(0, i).includes(':')) return false;
  const words = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;
  const parts = sentence.split(';');
  return parts.length === 2 && words(parts[0]) >= 3 && words(parts[1]) >= 3;
}

const SAFE_SCHEMES = new Set(['http', 'https', 'mailto']);

/** Targets of inline Markdown links and images (one level of balanced parentheses kept), and of reference-style link definitions. */
function markdownTargets(body: string): string[] {
  const out: string[] = [];
  for (const m of body.matchAll(/!?\[[^\]]*\]\(\s*<?((?:[^()\s>]|\([^()\s]*\))+)/g)) out.push(m[1]);
  for (const m of body.matchAll(/^\s{0,3}\[[^\]]+\]:\s*<?(\S+?)>?(\s|$)/gm)) out.push(m[1]);
  return out;
}

/** A link target that names a scheme other than http, https or mailto (javascript:, data:, vbscript:, ...). */
export function unsafeLinkTargets(body: string): string[] {
  return markdownTargets(body).filter((t) => {
    const m = /^([a-z][a-z0-9+.-]*):/i.exec(t.replace(/[\u0000-\u0020]/g, ''));
    return m !== null && !SAFE_SCHEMES.has(m[1].toLowerCase());
  });
}

export function styleDiagnostics(corpus: Corpus): Diagnostic[] {
  const out: Diagnostic[] = [];
  const deny = compile(corpus.schema.denylist);
  for (const f of corpus.files) {
    const whole = JSON.stringify(f.frontmatter) + '\n' + f.body;
    if (/—/.test(f.body)) out.push({ level: 'error', path: f.path, message: 'em dash in prose; use a full sentence or a colon' });
    for (const { path: fieldPath, value } of walkStringsInFrontmatter(f.frontmatter)) {
      if (/—/.test(value)) out.push({ level: 'error', path: f.path, message: `em dash in frontmatter field ${fieldPath}` });
    }
    const prose = proseLines(f.body);
    for (const m of new Set(prose.flatMap((para) => voiceErrors(para)))) out.push({ level: 'error', path: f.path, message: `${m} (body)` });
    for (const { path: fieldPath, value } of walkStringsInFrontmatter(f.frontmatter)) {
      if (VERBATIM_FIELDS.test(fieldPath)) continue;
      for (const m of voiceErrors(value)) out.push({ level: 'error', path: f.path, message: `${m} (frontmatter field ${fieldPath})` });
    }
    for (const line of prose) {
      for (const sentence of line.split(/(?<=[.!?])\s+/)) {
        if (semicolonJoinsClauses(sentence)) out.push({ level: 'warning', path: f.path, message: `semicolon joining two clauses: "${sentence.trim().slice(0, 80)}"; use two sentences or "but", "so", "because"` });
        for (const re of SIGNIFICANCE) {
          const m = re.exec(sentence);
          if (m) out.push({ level: 'warning', path: f.path, message: `significance-flagging "${m[0]}": state the concrete fact instead` });
        }
      }
    }
    for (const t of unsafeLinkTargets(f.body)) out.push({ level: 'error', path: f.path, message: `unsafe link scheme: ${t}` });
    for (const d of deny) if (d.re.test(whole)) out.push({ level: 'error', path: f.path, message: `denylist match: ${d.label}` });
    for (const a of ANAPHORA) {
      const re = new RegExp(`(^|[.!?]\\s+)${a}\\b`, 'im');
      if (re.test(f.body)) out.push({ level: 'warning', path: f.path, message: `bare anaphoric subject "${a[0].toUpperCase() + a.slice(1)}": restate the subject with its specification` });
    }
    if (f.frontmatter.type === 'person') {
      for (const k of Object.keys(f.frontmatter)) {
        if (PERSON_BANNED.includes(k) || k.startsWith('inferred_')) out.push({ level: 'error', path: f.path, message: `person field ${k} is not allowed` });
      }
      const history = (f.frontmatter.history as Record<string, unknown>[] | undefined) ?? [];
      history.forEach((h, i) => { if (!h.source) out.push({ level: 'error', path: f.path, message: `history[${i}] has no source` }); });
      for (const k of ['current_role', 'current_organisation', 'admissions', 'education']) {
        if (f.frontmatter[k] !== undefined && !f.frontmatter[`${k}_source`] && !(f.frontmatter.sources as string[] | undefined)?.length) {
          out.push({ level: 'error', path: f.path, message: `${k} needs a source (${k}_source or sources[])` });
        }
      }
    }
  }
  return out;
}
