import { describe, it, expect } from 'vitest';
import { loadSchema } from '../../scripts/ontology/schema';
import { parseFile } from '../../scripts/ontology/parse';
import { styleDiagnostics } from '../../scripts/ontology/style';

const schema = { ...loadSchema('ontology'), denylist: ['Acme Fixture Co', 're:\\bZ9\\b'] };
const file = (path: string, fmLines: string, body: string) => parseFile(path, `---\n${fmLines}\n---\n${body}`);
const run = (f: ReturnType<typeof parseFile>) => styleDiagnostics({ root: 'ontology', schema, files: [f] });

describe('style rules', () => {
  it('flags em dashes as errors in body and frontmatter', () => {
    const d = run(file('ontology/entries/clause/x.md', 'id: clause/x\ntype: clause', '## Purpose\nA cap — the usual one.\n'));
    expect(d.some((x) => x.level === 'error' && x.message.includes('em dash'))).toBe(true);
  });
  it('flags em dashes in frontmatter fields with field path', () => {
    const d = run(file('ontology/entries/clause/x.md', 'id: clause/x\ntype: clause\nname: The rule — updated\nrelations:\n  - to: clause/y\n    note: Applies — see also', 'Clean body.\n'));
    const emDashErrors = d.filter((x) => x.level === 'error' && x.message.includes('em dash'));
    expect(emDashErrors.length).toBe(2);
    expect(emDashErrors.some((x) => x.message.includes('name'))).toBe(true);
    expect(emDashErrors.some((x) => x.message.includes('relations[0].note'))).toBe(true);
  });
  it('produces no em dash errors for clean files', () => {
    const d = run(file('ontology/entries/clause/x.md', 'id: clause/x\ntype: clause\nname: The rule - updated', 'Clean body.\n'));
    expect(d.filter((x) => x.message.includes('em dash')).length).toBe(0);
  });
  it('flags Markdown links and images with a scheme other than http, https or mailto', () => {
    const bad = run(file('ontology/entries/clause/x.md', 'id: clause/x\ntype: clause', 'See [this](javascript:alert(1)) and ![i](data:image/png;base64,AA).\n\n[ref]: vbscript:x\n'));
    const msgs = bad.filter((x) => x.level === 'error').map((x) => x.message);
    expect(msgs).toContain('unsafe link scheme: javascript:alert(1)');
    expect(msgs).toContain('unsafe link scheme: data:image/png;base64,AA');
    expect(msgs).toContain('unsafe link scheme: vbscript:x');
    const good = run(file('ontology/entries/clause/x.md', 'id: clause/x\ntype: clause', 'See [this](https://example.com), [mail](mailto:a@example.com), [here](/clauses/indemnity) and [up](#purpose).\n'));
    expect(good.some((x) => x.message.startsWith('unsafe link scheme'))).toBe(false);
  });
  it('flags denylist literals and regexes anywhere in the file', () => {
    const d = run(file('ontology/entries/clause/x.md', 'id: clause/x\ntype: clause\nname: acme fixture co', '## Purpose\nStream Z9 is fine.\n'));
    expect(d.filter((x) => x.message.includes('denylist')).length).toBe(2);
  });
  it('warns on bare anaphoric subjects', () => {
    const d = run(file('ontology/entries/clause/x.md', 'id: clause/x\ntype: clause', '## Purpose\nThe tool extracts every clause.\n'));
    expect(d.some((x) => x.level === 'warning' && x.message.includes('The tool'))).toBe(true);
  });
  it('rejects disallowed person fields and unsourced facts', () => {
    const d = run(file('ontology/market/person/jane-doe.md', 'id: person/jane-doe\ntype: person\nemail: j@x.com\nhistory:\n  - role: role/general-counsel\n    organisation: organisation/acme\n    from: 2020', '## Current role\nText.\n'));
    expect(d.some((x) => x.level === 'error' && x.message.includes('email'))).toBe(true);
    expect(d.some((x) => x.level === 'error' && x.message.includes('source'))).toBe(true);
  });
  it('accepts a sourced history row', () => {
    const d = run(file('ontology/market/person/jane-doe.md', 'id: person/jane-doe\ntype: person\nhistory:\n  - role: role/general-counsel\n    organisation: organisation/acme\n    from: 2020\n    source: source/acme-leadership-page', '## Current role\nText.\n'));
    expect(d.filter((x) => x.level === 'error')).toEqual([]);
  });
});

describe('voice rules', () => {
  const body = (b: string, fm = '') => run(file('ontology/entries/clause/x.md', `id: clause/x\ntype: clause${fm}`, b));
  const errs = (d: ReturnType<typeof run>) => d.filter((x) => x.level === 'error').map((x) => x.message);
  const warns = (d: ReturnType<typeof run>) => d.filter((x) => x.level === 'warning').map((x) => x.message);

  it('errors on "not just / not only / not merely ... but"', () => {
    for (const s of ['The cap is not just a number but a price.', 'It covers not only fraud but also wilful default.', 'It is not merely drafting, but negotiation.']) {
      expect(errs(body(`## Purpose\n${s}\n`)).some((m) => m.startsWith('"not just / not only / not merely ... but"'))).toBe(true);
    }
    expect(errs(body('## Purpose\nThe cap applies to all claims but not to fraud. It is not only a cap.\n')).some((m) => m.includes('not merely'))).toBe(false);
  });
  it('errors on the same form in a frontmatter summary', () => {
    expect(errs(body('Clean body.\n', '\nsummary: Not just a cap but a price.')).some((m) => m.includes('not merely') && m.includes('summary'))).toBe(true);
  });
  it('errors on each filler tell', () => {
    for (const t of ["It's worth noting that caps vary.", 'It is worth noting that caps vary.', 'The case underscores the point.', 'The clause highlights the risk.', 'The deal stands as a testament to scale.', 'In a world where data leaks, caps matter.']) {
      expect(errs(body(`## Purpose\n${t}\n`)).some((m) => m.startsWith('filler tell'))).toBe(true);
    }
    expect(errs(body('## Purpose\nThe highlights of the year were few.\n')).some((m) => m.startsWith('filler tell'))).toBe(false);
  });
  it('errors on a bare "$" before a digit and accepts disambiguated currency', () => {
    expect(errs(body('## Purpose\nThe fee was $950m.\n')).some((m) => m.startsWith('bare "$"'))).toBe(true);
    expect(errs(body('## Purpose\nThe fee was ($ 950m).\n')).some((m) => m.startsWith('bare "$"'))).toBe(true);
    expect(errs(body('Clean.\n', '\nsummary: A $35bn deal.')).some((m) => m.startsWith('bare "$"') && m.includes('summary'))).toBe(true);
    const ok = body('## Purpose\nFees of US$950m, A$1m, S$2m, C$3m, HK$4m, ₹5 crore, €6m, RMB 7m and USD 8m.\n');
    expect(errs(ok).some((m) => m.startsWith('bare "$"'))).toBe(false);
  });
  it('warns on a semicolon joining two clauses in body prose', () => {
    expect(warns(body('## Purpose\nA vendor wants a low cap; a customer wants a high one.\n')).some((m) => m.startsWith('semicolon'))).toBe(true);
  });
  it('does not warn on semicolons separating list items after a colon, or in table rows', () => {
    const d = body('## Positions\nThe positions are: the fees paid in the prior twelve months; the fees paid or payable in the prior twelve months; and a fixed sum.\n\n| a; b c d e | f; g h i j |\n');
    expect(warns(d).some((m) => m.startsWith('semicolon'))).toBe(false);
  });
  it('does not warn on a semicolon in a heading', () => {
    const d = body('## A vendor wants a low cap; a customer wants a high one\nClean prose follows here.\n');
    expect(warns(d).some((m) => m.startsWith('semicolon'))).toBe(false);
  });
  it('exempts excerpt and quote fields from the voice errors', () => {
    const d = body('Clean body.\n', '\nexcerpt: The fee was $950m, not just a number but a price.\nquote: It is worth noting the $5 fee.');
    expect(errs(d)).toEqual([]);
    const notExempt = body('Clean body.\n', '\nnote: The fee was $950m.');
    expect(errs(notExempt).some((m) => m.startsWith('bare "$"') && m.includes('note'))).toBe(true);
  });
  it('ignores a dollar sign inside an inline code span', () => {
    expect(errs(body('## Purpose\nThe template variable `$1` is replaced on export.\n')).some((m) => m.startsWith('bare "$"'))).toBe(false);
  });
  it('checks "not just ... but" within one paragraph, not across paragraphs', () => {
    expect(errs(body('## Purpose\nThe cap is not just a number\n\nBut the next paragraph starts here.\n')).some((m) => m.includes('not merely'))).toBe(false);
  });
  it('catches the "underscored" and "highlighting" variants', () => {
    for (const t of ['The case underscored the point.', 'The case is highlighting a risk.']) {
      expect(errs(body(`## Purpose\n${t}\n`)).some((m) => m.startsWith('filler tell'))).toBe(true);
    }
  });
  it('warns on significance-flagging openers', () => {
    for (const s of ['What matters is the cap.', 'The real signal is the carve-out.', 'The real story is the fee.', 'The structure matters more than the price.']) {
      expect(warns(body(`## Purpose\nA cap exists. ${s}\n`)).some((m) => m.startsWith('significance-flagging'))).toBe(true);
    }
  });
  it('keeps clean prose clean', () => {
    const d = body('## Purpose\nA limitation of liability clause caps what one party can recover. It also excludes some kinds of loss, such as lost profits.\n');
    expect(d).toEqual([]);
  });
});
