# Ontology

This folder holds the source of The Contract Room's reference work: a typed graph of the deal-making domain and the editorial items written about it. Every node is one Markdown file with YAML frontmatter.

- `schema/` holds the entity types (`types.yaml`), relation types (`relations.yaml`), facet vocabularies (`facets.yaml`), and editorial kinds (`content.yaml`). This repo ships no denylist. The site that renders the reference adds its own and passes it to the validator through `ONTOLOGY_DENYLIST`.
- `entries/<type>/<slug>.md` holds the domain catalogue: workflows, matter types, deal types, documents, clauses, positions, concepts, roles, jurisdictions, industries and sources.
- `market/<type>/<slug>.md` holds the market layer: real organisations, teams, people and public deals, each fact cited to a public source.
- `content/<kind>/<slug>.md` holds editorial items (guides, how-tos, questions and the other kinds), each about at least one entity.

The required sections for each type are in `schema/types.yaml`. Body prose follows `docs/voice.md`: plain English, lead with the point, one idea per sentence, no fragments and no em dashes.

## Commands

- `npm run check` validates every file against the schema, the relation domains and ranges, the style rules and the denylist. It must end with `0 errors`.
- `npm run build` builds the graph and its outputs (graph, search index, redirects, JSON-LD and Turtle).

## The data rule

The catalogue is built from public and general professional knowledge, and the market layer is built from cited public sources such as EDGAR filings and official statute texts. Nothing from client material or the founder's fixture corpus enters this folder: no company or person names from that material, no internal codes, no planted examples and no document text. The site enforces the rule with a private denylist, and every entry must cite at least one `source/...` entry.
