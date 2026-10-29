# Brief: building a reading list

This brief is the procedure for one reading list on thecontractroom.com. A reading list is an annotated bibliography for one topic. It lives at `ontology/content/reading-list/<slug>.md` and renders at `/reading/<slug>`. Follow every step in order. `docs/voice.md` binds every sentence you write.

## Inputs

- **Topic**: one line, such as "AI contract review against a playbook".
- **About ids**: the entities the list is about, such as `task/review-counterparty-markup`. An id that does not exist yet becomes a new spine entry (step 5).
- **Seed pieces**: what the requester has in mind. Seeds are leads, not settled entries.

Read first: `docs/voice.md`, `docs/ontology.md`, `ontology/README.md`, the `source` type and each about id's type in `ontology/schema/types.yaml`, the `reading-list` kind in `content.yaml`, `relations.yaml`, and one existing entry of each type you will write.

## Step 1: search and select

Aim for eight to twelve pieces. Apply this standard:

- **Balance.** Mix practitioner pieces (law firms, bar bodies, in-house lawyers), press (the FT, Reuters, Law.com, Artificial Lawyer, Legal IT Insider), research with a stated method, and vendor material. No category should dominate.
- **Vendor cap.** At most two vendor marketing pieces per list. A trade-press rewrite of a vendor's launch counts toward the cap. A vendor survey with a stated sample counts as research, but its note names the publisher as a seller.
- **Jurisdictions.** Where the topic touches law or professional duties, include at least one piece for England and Wales and look for India and Delaware. Say in the report when none was found.
- **No padding.** Every piece must bear directly on the topic. Leave out a piece that is merely nearby, such as a litigation tool on a contracts list.

## Step 2: verify

- Fetch every page. The URL must resolve and the page must say what your note says.
- Record the publisher, the author where named, the date (and whether it is a first or an updated date) and one line on what the piece establishes.
- **Blocked pages.** If a page refuses scripted reads, cite a verified secondary report of it, name the primary in its own entry, add the primary's URL to `ontology/schema/citation-allowlist.txt` with a comment, and set `confidence: medium`. If nothing verifies a piece, leave it out and list it in the report.
- **Attribution.** Quote only words the page prints inside quotation marks, as the speaker's. A publication's paraphrase is the publication's, without quotation marks. Never join two sentences into one quotation. Say whose words a secondary report uses.
- Copy each figure with its base and its meaning. A share of respondents "feeling pressure to adopt" is not a share "adopting". An expectation is not a finding.
- At most 40 words quoted from any piece. Every summary is in your own words.
- A benchmark or report older than about a year states its age in the note.
- Do not call a publisher "independent" when it sells a related service. Say what it is independent of.
- "Many", "most" and "typically" are market claims. Each needs a source, or cut it.

## Step 3: source entries

- One `ontology/entries/source/<slug>.md` per piece, slug `<publisher>-<subject>`.
- Frontmatter: `kind` from the enum in `types.yaml`, `url`, `publisher`, `date` (quoted ISO date or year), `sources` naming itself, `status: reviewed`, `revised`, `confidence`.
- Sections: `## Citation` (who, what, when, any paywall, block or syndication) and `## What it establishes` (the claims, the sample for a survey, and a line saying the publisher sells the product where it does). Over 400 characters.

## Step 4: the reading list item

- Frontmatter: `kind: reading-list`, `title`, `summary` under 160 characters, `about[]`, `facets`, `sources[]` with every source id, `status: reviewed`, `published`, `revised`, `byline: The Contract Room`.
- `block.items[]`: `{ source, note }` only. The renderer takes the name and link from the source entry.
- **Notes.** One full sentence that leads with what the piece establishes, says who is speaking where it matters, and flags a vendor or a registration wall.
  - Good: "An independent benchmark found legal AI tools ahead of lawyers on document questions but behind them on redlining, 65.0% against 79.7%."
  - Weak: "Useful survey on AI, which is the key data on this list." It names no finding and claims importance instead of showing it.
- Body: an opening of about 120 words on the topic and what the list covers, with each term of art glossed. Then one `## <heading>` per sub-theme with a sentence on each piece. Then `## What to read first`.
- **What to read first.** Three pieces, each independent of any vendor, free to read and verified by a direct read. Say why each one.

## Step 5: spine entries

- Write each missing about id with every required section, over the type's minimum length.
- **Relations checklist.** Add every relation the schema allows: `supports_workflow` for a tool, `specific_to` for each jurisdiction a `By jurisdiction` section covers, and `cites` for each source the entry relies on. Where the schema has no relation (a tool to a concept, say), link the entries in the body. Add `cites` back from existing entries the new sources support. Every new source needs an inbound relation.
- **No unsourced market claims.** A statement about what the market does, how vendors price or what most departments do needs a cited source, attributed in the sentence. Otherwise cut it.
- **Statements of law** follow the existing clause and jurisdiction entries and their sources. Flag each new one in the report for a lawyer's read.
- A tool category entry describes the category and its evaluation criteria and names no product. Products come later, with the rankings. The site's own product name appears only where `docs/voice.md` allows it, never in a list or an entry.

## Step 6: validate and build

```
npm run ontology:check          # 0 errors, 0 warnings
npx tsx scripts/citation-check.mts   # 0 errors
npm test && npm run check && npm run build
npm run ontology:build && npm run ontology:load:local
rm -rf .wrangler/state/v3/cache
npx wrangler pages dev .svelte-kit/cloudflare --local --port 8788
```

Curl `/reading/<slug>` and each new entry page for a 200, confirm the front door counts the list, then stop the server. Tests that count seed items may need their expected numbers raised. Never run `ontology:load` (the remote database) and never deploy.

## Step 7: voice checklist

Run the pre-publish checklist in `docs/voice.md` on every file. In short: lead with the point, gloss each term of art once, one idea per sentence, no em dashes, no "not just X but Y", no filler tells, no contractions, jurisdiction named on first reference, US$ and not a bare "$", and every figure matching its page.

## Step 8: second check

Before the list is called done, an independent verifier who did not write it reads every cited page and checks each quotation, figure, date and attribution against it. Fix every discrepancy the verifier finds, or remove the claim.

## Step 9: commit and report

- Commit in steps: sources and spine entries, then the list. Plain subjects, no co-author trailers.
- The report lists every source with URL, publisher, date and note, the new entries, the verification output, what could not be verified and was left out, the statements of law to review, and concerns.
