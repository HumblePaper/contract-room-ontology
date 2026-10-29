import { describe, it, expect } from 'vitest';
import { parseFile, normaliseHeading } from '../../scripts/ontology/parse';

const text = `---
id: clause/limitation-of-liability
type: clause
name: Limitation of liability
---

## Purpose
A cap.

## By jurisdiction
### England and Wales
UCTA applies.
### India
Sections 73 and 74 apply.

## Pitfalls:
Watch the indemnity.
`;

describe('parseFile', () => {
  const f = parseFile('ontology/entries/clause/limitation-of-liability.md', text);
  it('classifies by path', () => expect(f.kind).toBe('entry'));
  it('reads frontmatter', () => expect(f.frontmatter.id).toBe('clause/limitation-of-liability'));
  it('splits level-2 sections and keeps text', () => {
    expect(f.sections.map((s) => s.heading)).toEqual(['Purpose', 'By jurisdiction', 'Pitfalls:']);
    expect(f.sections[0].md.trim()).toBe('A cap.');
  });
  it('reads level-3 headings under By jurisdiction as jurisdiction variants', () => {
    const v = f.sections[1].variants;
    expect(v.map((x) => x.value)).toEqual(['england-and-wales', 'india']);
    expect(v[0].facet).toBe('jurisdiction');
    expect(v[1].md.trim()).toBe('Sections 73 and 74 apply.');
  });
  it('normalises headings for comparison', () => {
    expect(normaliseHeading('Pitfalls:')).toBe('pitfalls');
    expect(normaliseHeading('  How It Operates ')).toBe('how it operates');
  });
  it('classifies market and content paths', () => {
    expect(parseFile('ontology/market/person/x.md', text).kind).toBe('market');
    expect(parseFile('ontology/content/guide/x.md', text).kind).toBe('content');
  });
  it('handles CRLF line endings', () => {
    const crlfText = text.replace(/\n/g, '\r\n');
    const f2 = parseFile('ontology/entries/clause/limitation-of-liability.md', crlfText);
    expect(f2.frontmatter.id).toBe('clause/limitation-of-liability');
    expect(f2.sections.map((s) => s.heading)).toEqual(['Purpose', 'By jurisdiction', 'Pitfalls:']);
  });
  it('ignores headings inside fenced code blocks', () => {
    const fencedText = `---
id: test/fenced
type: test
---

## Real section

\`\`\`
## Not a heading
Some code
\`\`\`

More text in section.
`;
    const f2 = parseFile('ontology/entries/test/fenced.md', fencedText);
    expect(f2.sections.length).toBe(1);
    expect(f2.sections[0].heading).toBe('Real section');
    expect(f2.sections[0].md).toContain('## Not a heading');
    expect(f2.sections[0].md).toContain('Some code');
  });
});
