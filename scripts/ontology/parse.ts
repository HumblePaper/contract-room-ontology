import { parse as parseYaml } from 'yaml';

export interface ParsedVariant { facet: string; value: string; heading: string; md: string }
export interface ParsedSection { heading: string; md: string; variants: ParsedVariant[] }
export interface ParsedFile {
  path: string;
  kind: 'entry' | 'market' | 'content';
  frontmatter: Record<string, unknown>;
  body: string;
  sections: ParsedSection[];
}

const VARIANT_SECTIONS: Record<string, string> = { 'by jurisdiction': 'jurisdiction', 'by industry': 'industry' };

export function normaliseHeading(h: string): string {
  return h.trim().replace(/[\s:.]+$/g, '').replace(/\s+/g, ' ').toLowerCase();
}

export function slugify(s: string): string {
  return s.trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function kindForPath(path: string): ParsedFile['kind'] {
  if (/(^|\/)ontology\/market\//.test(path)) return 'market';
  if (/(^|\/)ontology\/content\//.test(path)) return 'content';
  return 'entry';
}

export function parseFile(path: string, text: string): ParsedFile {
  text = text.replace(/\r\n?/g, '\n');
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`${path}: missing frontmatter`);
  const frontmatter = (parseYaml(m[1]) ?? {}) as Record<string, unknown>;
  const body = m[2];
  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;
  let variant: ParsedVariant | null = null;
  let inFence = false;
  for (const line of body.split('\n')) {
    const trimmed = line.trim();
    if (trimmed === '```' || trimmed === '~~~') {
      inFence = !inFence;
      if (variant) {
        variant.md += line + '\n';
      } else if (current) {
        current.md += line + '\n';
      }
    } else if (inFence) {
      if (variant) {
        variant.md += line + '\n';
      } else if (current) {
        current.md += line + '\n';
      }
    } else {
      const h2 = line.match(/^## (.+)$/);
      const h3 = line.match(/^### (.+)$/);
      if (h2) {
        current = { heading: h2[1].trim(), md: '', variants: [] };
        variant = null;
        sections.push(current);
      } else if (h3 && current && VARIANT_SECTIONS[normaliseHeading(current.heading)]) {
        variant = { facet: VARIANT_SECTIONS[normaliseHeading(current.heading)], value: slugify(h3[1]), heading: h3[1].trim(), md: '' };
        current.variants.push(variant);
      } else if (variant) {
        variant.md += line + '\n';
      } else if (current) {
        current.md += line + '\n';
      }
    }
  }
  return { path, kind: kindForPath(path), frontmatter, body, sections };
}
