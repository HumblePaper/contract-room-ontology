# Brief: writing one organisation entry

This brief is the procedure for one organisation entry on thecontractroom.com: a legal technology vendor, a law firm, an association or a software company that the wire's pieces are about. The entry lives at `ontology/market/organisation/<slug>.md` with the id `organisation/<slug>` and renders at `/organisations/<slug>`. `docs/voice.md` binds every sentence you write.

## Inputs

- The organisation's **name** and, where known, its **website**. Treat each as a lead to confirm, not a fact.

Read first: `docs/voice.md`, `docs/ontology.md`, the `organisation` type in `ontology/schema/types.yaml`, the `source` type there, and `ontology/market/organisation/ansys.md` as a worked example of the shape (its deal sections are for a market organisation; a vendor does not need them).

## Steps

1. **Open the organisation's own site.** Confirm the name as the organisation writes it, what it does, where it is based and, where the site says so, when it was founded and who owns it. Never guess a URL.
2. **Find one independent source** for the facts a deal maker cares about: funding, valuation, acquisitions, customer counts, headcount. A press release counts as the organisation's own word, not an independent one. If no independent source exists for a figure, leave the figure out or attribute it plainly to the organisation.
3. **Write a source entry for each page you rely on** at `ontology/entries/source/<slug>.md` (type `source`, kind `website` for a company page, `press-release` for an announcement, `other` for a news story), with `url`, `publisher`, `date` where the page prints one, a `## Citation` section naming the page and a `## What it establishes` section saying what the entry takes from it. Reuse an existing source entry when one already covers the page.
4. **Write the entry.** Frontmatter: `id`, `type: organisation`, `name`, `aliases` (the legal name, former names, the ticker), a `summary` under 160 characters, `kind` (one of `legal technology vendor`, `law firm`, `association`, `software company`, `model developer`, `publisher`), `hq` as city, region, country, `listing` (public or private), `website`, `relations` with one `cites` row per source, `sources` listing the same ids, `status: reviewed`, `revised` today, `confidence` (high when every fact is on the organisation's site or in an independent report, medium otherwise). Body: `## Profile` (required; at least 300 characters: what the organisation does, for whom, where it is, who owns it, which of its products matter to contracting), then as the facts allow `## What it sells`, `## Funding and ownership`, `## Membership`. Every figure carries its source in the sentence ("Reuters reported in September 2026 that…").
5. **Run the checks.** `npm run ontology:check` must end with `0 errors, 0 warnings`. Then `npx tsx scripts/citation-check.mts --only source/<slug>` for each new source. A page that refuses scripted reads goes in `ontology/schema/citation-allowlist.txt` with a comment, and the second check reads it by hand.
6. **Second check.** A second writer, who did not write the entry, opens every cited page and confirms each sentence says what the page says. Fix what they find before the entry is merged.

## Rules

- Never name our own product or its maker. If an organisation's page mentions it, leave that out.
- Never invent a URL, a date, a figure or a founder.
- Say when a figure is the organisation's own claim.
- Write the organisation, not the pitch. "Harvey sells…" not "Harvey is revolutionising…".
- Do not copy the organisation's About page. Say what it is in our words.

## Report

List the files written, the sources, and anything that could not be confirmed off a page.
