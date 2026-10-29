import type { Graph, ReferenceNode, ContentItem } from './types';
import { hrefFor, contentHrefFor } from './routes';

// Minimal shape of the ontology schema; declared inline so src/ never depends on scripts/.
type VocabSchema = { types: Record<string, unknown>; relations: Record<string, { inverse: string }> };

const DOMAIN = 'https://thecontractroom.com';
const ORG_TYPES = new Set(['organisation', 'regulator']);

export function jsonLd(n: ReferenceNode | ContentItem, g: Graph): Record<string, unknown> {
  void g;
  if ('kind' in n) {
    return {
      '@context': 'https://schema.org', '@type': n.kind === 'question' ? 'FAQPage' : 'Article',
      headline: n.title, description: n.summary, datePublished: n.published, dateModified: n.revised,
      author: { '@type': 'Organization', name: 'The Contract Room' }, url: DOMAIN + contentHrefFor(n),
      ...(n.kind === 'piece' && typeof n.block.url === 'string'
        ? { citation: { '@type': 'CreativeWork', url: n.block.url, name: n.title, ...(typeof n.block.outlet === 'string' ? { publisher: { '@type': 'Organization', name: n.block.outlet } } : {}), ...(typeof n.block.author === 'string' ? { author: { '@type': 'Person', name: n.block.author } } : {}) } }
        : {}),
      ...(n.kind === 'question' ? { mainEntity: [{ '@type': 'Question', name: String(n.block.question), acceptedAnswer: { '@type': 'Answer', text: String(n.block.answer) } }] } : {}),
      about: n.about.map((id) => ({ '@id': DOMAIN + hrefFor(id) }))
    };
  }
  const url = DOMAIN + hrefFor(n.id);
  if (ORG_TYPES.has(n.type)) return { '@context': 'https://schema.org', '@type': 'Organization', '@id': url, name: n.name, alternateName: n.aliases, description: n.summary, url, sameAs: n.attributes.website };
  if (n.type === 'person') {
    const org = n.attributes.current_organisation ? { '@type': 'Organization', '@id': DOMAIN + hrefFor(String(n.attributes.current_organisation)) } : undefined;
    return { '@context': 'https://schema.org', '@type': 'Person', '@id': url, name: n.name, description: n.summary, url, worksFor: org };
  }
  return {
    '@context': 'https://schema.org', '@type': 'DefinedTerm', '@id': url, name: n.name, alternateName: n.aliases, description: n.summary, url,
    inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'The Contract Room reference', url: DOMAIN + '/' + hrefFor(n.id).split('/')[1] },
    dateModified: n.revised
  };
}

function iri(id: string): string { return `<${DOMAIN}${hrefFor(id).replace('?', '#')}>`; }
function lit(s: string): string { return JSON.stringify(s); }

export function turtle(g: Graph): string {
  const lines = ['@prefix cr: <https://thecontractroom.com/vocab#> .', '@prefix schema: <https://schema.org/> .', ''];
  for (const n of g.nodes) {
    lines.push(`${iri(n.id)} a cr:${n.type.replace(/-/g, '_')} ; schema:name ${lit(n.name)} ; schema:description ${lit(n.summary)} .`);
  }
  for (const e of g.edges) lines.push(`${iri(e.from)} cr:${e.rel} ${iri(e.to)} .`);
  return lines.join('\n') + '\n';
}

export function vocabTurtle(schema: VocabSchema): string {
  const lines = ['@prefix cr: <https://thecontractroom.com/vocab#> .', '@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .', '@prefix owl: <http://www.w3.org/2002/07/owl#> .', ''];
  for (const t of Object.keys(schema.types)) lines.push(`cr:${t.replace(/-/g, '_')} a owl:Class ; rdfs:label ${lit(t)} .`);
  for (const [r, d] of Object.entries(schema.relations)) lines.push(`cr:${r} a owl:ObjectProperty ; owl:inverseOf cr:${d.inverse} ; rdfs:label ${lit(r)} .`);
  return lines.join('\n') + '\n';
}
