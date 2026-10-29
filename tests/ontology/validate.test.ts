import { describe, it, expect } from 'vitest';
import { loadSchema } from '../../scripts/ontology/schema';
import { parseFile } from '../../scripts/ontology/parse';
import { validate } from '../../scripts/ontology/validate';

const schema = loadSchema('ontology');
const fm = (o: Record<string, unknown>) =>
  '---\n' + Object.entries(o).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n') + '\n---\n';
const sections = (names: string[], text = 'A full sentence about the subject appears here. '.repeat(40)) =>
  names.map((n) => `## ${n}\n${text}\n`).join('\n');

function clauseFile(over: Record<string, unknown> = {}, body?: string, path = 'ontology/entries/clause/limitation-of-liability.md') {
  const base = {
    id: 'clause/limitation-of-liability', type: 'clause', name: 'Limitation of liability', aliases: ['liability cap'],
    summary: 'The clause that caps what one party can recover from the other.', facets: {}, relations: [],
    sources: ['source/ucta-1977'], status: 'reviewed', revised: '2026-10-10', confidence: 'high', heat: 'high'
  };
  return parseFile(path, fm({ ...base, ...over }) + (body ?? sections(schema.types.clause.sections)));
}
function sourceFile() {
  return parseFile('ontology/entries/source/ucta-1977.md', fm({
    id: 'source/ucta-1977', type: 'source', name: 'Unfair Contract Terms Act 1977', aliases: [], summary: 'The UK statute.',
    facets: {}, relations: [], sources: [], status: 'reviewed', revised: '2026-10-10', confidence: 'high',
    kind: 'statute', url: 'https://www.legislation.gov.uk/ukpga/1977/50', publisher: 'legislation.gov.uk', date: '1977-10-26'
  }) + sections(schema.types.source.sections, 'The Act governs exclusion clauses in England and Wales. '.repeat(10)));
}
const corpus = (files: ReturnType<typeof parseFile>[]) => ({ root: 'ontology', schema, files });
const errors = (d: ReturnType<typeof validate>) => d.filter((x) => x.level === 'error').map((x) => x.message);

describe('validate: structure', () => {
  it('accepts a well-formed clause and its source', () => {
    expect(errors(validate(corpus([clauseFile(), sourceFile()])))).toEqual([]);
  });
  it('rejects id that disagrees with path', () => {
    const d = validate(corpus([clauseFile({}, undefined, 'ontology/entries/clause/other.md'), sourceFile()]));
    expect(errors(d).some((m) => m.includes('id') && m.includes('path'))).toBe(true);
  });
  it('rejects unknown attributes and bad enum values', () => {
    const d = validate(corpus([clauseFile({ heat: 'volcanic', bogus: 1 }), sourceFile()]));
    expect(errors(d).some((m) => m.includes('heat'))).toBe(true);
    expect(errors(d).some((m) => m.includes('bogus'))).toBe(true);
  });
  it('accepts headings that differ only by case or trailing punctuation', () => {
    const body = schema.types.clause.sections.map((n) => `## ${n.toUpperCase()}:\n${'The clause does a thing. '.repeat(40)}\n`).join('\n');
    expect(errors(validate(corpus([clauseFile({}, body), sourceFile()])))).toEqual([]);
  });
  it('reports a missing required section', () => {
    const body = sections(schema.types.clause.sections.slice(1));
    expect(errors(validate(corpus([clauseFile({}, body), sourceFile()]))).some((m) => m.includes('Purpose'))).toBe(true);
  });
  it('rejects a relation to a missing target but accepts a variant target', () => {
    const rel = [{ rel: 'cites', to: 'source/missing' }, { rel: 'cites', to: 'source/ucta-1977#jurisdiction=india' }];
    const m = errors(validate(corpus([clauseFile({ relations: rel }), sourceFile()])));
    expect(m.some((x) => x.includes('source/missing'))).toBe(true);
    expect(m.some((x) => x.includes('ucta-1977#'))).toBe(false);
  });
  it('rejects a relation whose domain or range does not fit', () => {
    const rel = [{ rel: 'has_position', to: 'source/ucta-1977' }];
    expect(errors(validate(corpus([clauseFile({ relations: rel }), sourceFile()]))).some((m) => m.includes('range'))).toBe(true);
  });
  it('rejects duplicate ids and alias collisions', () => {
    const dup = clauseFile({}, undefined, 'ontology/entries/clause/limitation-of-liability.md');
    const clash = clauseFile({ id: 'clause/cap', name: 'Cap', aliases: ['Limitation of liability'] }, undefined, 'ontology/entries/clause/cap.md');
    const m = errors(validate(corpus([clauseFile(), dup, clash, sourceFile()])));
    expect(m.some((x) => x.includes('duplicate id'))).toBe(true);
    expect(m.some((x) => x.includes('alias'))).toBe(true);
  });
  it('rejects summaries over 160 characters and facet values outside the vocabulary', () => {
    const d = validate(corpus([clauseFile({ summary: 'x'.repeat(161), facets: { jurisdiction: ['mars'] } }), sourceFile()]));
    expect(errors(d).some((m) => m.includes('summary'))).toBe(true);
    expect(errors(d).some((m) => m.includes('mars'))).toBe(true);
  });
  it('rejects a missing source on a referenced source id', () => {
    const d = validate(corpus([clauseFile({ sources: ['source/nope'] })]));
    expect(errors(d).some((m) => m.includes('source/nope'))).toBe(true);
  });
});

describe('validate: robustness', () => {
  it('keeps the first file for a duplicate id and names it', () => {
    const second = clauseFile({}, undefined, 'ontology/entries/clause/limitation-of-liability.md');
    const rel = clauseFile({ id: 'clause/fourth', name: 'Fourth', aliases: [], relations: [{ rel: 'related_to', to: 'clause/limitation-of-liability' }] }, undefined, 'ontology/entries/clause/fourth.md');
    const first = clauseFile({}, undefined, 'ontology/entries/clause/first-copy.md');
    const m = errors(validate(corpus([first, second, rel, sourceFile()])));
    expect(m.some((x) => x.includes('duplicate id') && x.includes('first-copy.md'))).toBe(true);
    expect(m.some((x) => x.includes('does not exist') && x.includes('limitation-of-liability'))).toBe(false);
  });
  it('reports one about error for a string about', () => {
    const f = parseFile('ontology/content/guide/x.md', fm({ kind: 'guide', title: 'T', summary: 's', about: 'clause/x', facets: {}, sources: [], status: 'draft', published: '2026-10-10', revised: '2026-10-10' }) + 'body\n');
    const m = errors(validate(corpus([f]))).filter((x) => x.startsWith('about'));
    expect(m.length).toBe(1);
  });
  it('rejects a non-list facet without throwing', () => {
    const d = validate(corpus([clauseFile({ facets: { jurisdiction: 5 } }), sourceFile()]));
    expect(errors(d).some((m) => m.includes('facet jurisdiction: must be a list'))).toBe(true);
  });
  describe('content items', () => {
    const contentFile = (path: string, over: Record<string, unknown> = {}) =>
      parseFile(path, fm({
        kind: 'guide', title: 'Limitation of liability in SaaS contracts', summary: 'How the cap works.', about: ['clause/limitation-of-liability'],
        facets: {}, sources: ['source/ucta-1977'], status: 'reviewed', published: '2026-10-10', revised: '2026-10-10', ...over
      }) + '## Body\nA full sentence about the subject appears here.\n');
    const contentErrors = (f: ReturnType<typeof parseFile>) => errors(validate(corpus([clauseFile(), sourceFile(), f])));
    it('accepts a clean content file', () => {
      expect(contentErrors(contentFile('ontology/content/guide/limitation-of-liability-in-saas.md'))).toEqual([]);
    });
    it('rejects a content source that does not exist', () => {
      const m = contentErrors(contentFile('ontology/content/guide/x.md', { sources: ['source/missing-act'] }));
      expect(m).toContain('source source/missing-act does not exist');
    });
    it('rejects a content kind that does not match its folder', () => {
      const m = contentErrors(contentFile('ontology/content/how-to/x.md'));
      expect(m.some((x) => x.startsWith('kind does not match folder'))).toBe(true);
    });
    it('rejects a content slug that is not kebab-case', () => {
      const m = contentErrors(contentFile('ontology/content/guide/Bad_Slug.md'));
      expect(m.some((x) => x.startsWith('slug is not kebab-case'))).toBe(true);
    });
  });
});

describe('validate: pieces', () => {
  const body = '## Summary\n\nCanadian Lawyer reports a survey of 104 legal professionals. Pressure to adopt legal AI rose in a year.\n\n## Figures\n\n- 47%, in-house respondents who felt board pressure\n';
  // a key set to undefined is left out of the file
  const defined = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
  const piece = (over: Record<string, unknown> = {}, blockOver: Record<string, unknown> = {}, path = 'ontology/content/piece/2026-10-08-disco-survey.md', text = body) =>
    parseFile(path, fm(defined({
      kind: 'piece', title: 'Clients pressure lawyers to adopt legal AI', summary: 'Canadian Lawyer on a DISCO survey of 104 legal professionals.',
      about: ['clause/limitation-of-liability'], facets: { desk: ['legal-ai'] }, status: 'reviewed', published: '2026-10-08', revised: '2026-10-15', byline: 'The Contract Room',
      block: defined({ url: 'https://www.example.com/a', outlet: 'Canadian Lawyer', kind: 'news', ...blockOver }), ...over
    })) + text);
  const all = (files: ReturnType<typeof parseFile>[]) => validate(corpus([clauseFile(), sourceFile(), ...files]));
  const errs = (files: ReturnType<typeof parseFile>[]) => errors(all(files));
  const warns = (files: ReturnType<typeof parseFile>[]) => all(files).filter((x) => x.level === 'warning' && x.path.includes('/piece/')).map((x) => x.message);

  it('accepts a well-formed piece', () => {
    expect(errs([piece()])).toEqual([]);
    expect(warns([piece()])).toEqual([]);
  });
  it('requires an https url', () => {
    expect(errs([piece({}, { url: 'http://www.example.com/a' })]).some((m) => m.includes('https'))).toBe(true);
    expect(errs([piece({}, { url: 'not a url' })]).some((m) => m.includes('https'))).toBe(true);
  });
  it('rejects two pieces with the same url', () => {
    const m = errs([piece(), piece({ published: '2026-10-09' }, {}, 'ontology/content/piece/2026-10-09-other.md')]);
    expect(m.some((x) => x.includes('duplicate url https://www.example.com/a'))).toBe(true);
  });
  it('rejects two pieces that would share a page', () => {
    const m = errs([piece(), piece({ published: '2026-10-20' }, { url: 'https://www.example.com/b' }, 'ontology/content/piece/2026-10-20-disco-survey.md')]);
    expect(m.some((x) => x.includes('same page'))).toBe(true);
  });
  it('requires a full YYYY-MM-DD publication date that the file name repeats', () => {
    expect(errs([piece({ published: '2026-10' })]).some((m) => m.includes('published must be a full date'))).toBe(true);
    expect(errs([piece({ published: '2026-02-31' }, {}, 'ontology/content/piece/2026-02-31-disco-survey.md')]).some((m) => m.includes('published must be a full date'))).toBe(true);
    expect(errs([piece({ published: '2026-10-09' })]).some((m) => m.includes('does not match published'))).toBe(true);
    expect(errs([piece({}, {}, 'ontology/content/piece/disco-survey.md')]).some((m) => m.includes('<yyyy>-<mm>-<dd>-<slug>'))).toBe(true);
  });
  it('requires at least one tagged entity', () => {
    expect(errs([piece({ about: [] })]).some((m) => m.includes('about: at least one entity'))).toBe(true);
    expect(errs([piece({ about: undefined })]).some((m) => m.includes('about: required'))).toBe(true);
  });
  it('rejects two about ids that name the same entity', () => {
    const m = errs([piece({ about: ['clause/limitation-of-liability', 'clause/limitation-of-liability#jurisdiction=india'] })]);
    expect(m.some((x) => x.includes('name the same entity clause/limitation-of-liability'))).toBe(true);
  });
  it('requires the block fields and checks the kind and paywall enums', () => {
    expect(errs([piece({}, { outlet: undefined })]).some((m) => m.includes('block.outlet: required'))).toBe(true);
    expect(errs([piece({}, { kind: 'blog' })]).some((m) => m.includes('block.kind'))).toBe(true);
    expect(errs([piece({}, { paywall: 'sometimes' })]).some((m) => m.includes('block.paywall'))).toBe(true);
  });
  it('requires a Summary section and allows only Summary and Figures', () => {
    expect(errs([piece({}, {}, undefined, '## Figures\n\n- 1, one\n')]).some((m) => m.includes('missing section "Summary"'))).toBe(true);
    expect(errs([piece({}, {}, undefined, body + '\n## Background\n\nMore.\n')]).some((m) => m.includes('unexpected section "Background"'))).toBe(true);
  });
  it('warns when a vendor or post piece does not say so in its first sentence', () => {
    const quiet = '## Summary\n\nA new contract tool reads markups. It suggests edits.\n';
    expect(warns([piece({ summary: 'A tool that reads markups.' }, { kind: 'vendor', outlet: 'Acme' }, undefined, quiet)]).some((m) => m.includes('vendor piece'))).toBe(true);
    const said = '## Summary\n\nIn a vendor announcement, Acme says its tool reads markups. It suggests edits.\n';
    expect(warns([piece({ summary: 'A tool that reads markups.' }, { kind: 'vendor', outlet: 'Acme' }, undefined, said)])).toEqual([]);
    expect(warns([piece({ summary: 'Acme on its new markup reader.' }, { kind: 'vendor', outlet: 'Acme' }, undefined, quiet)])).toEqual([]);
  });
});
