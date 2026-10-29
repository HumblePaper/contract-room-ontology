# Brief: writing one piece

This brief is the procedure for one piece on thecontractroom.com. A piece is one external article, post, report, launch, filing or podcast about legal technology or contracting. We publish our summary, the metadata and the link. Nothing from the piece is republished. The piece lives at `ontology/content/piece/<yyyy>-<mm>-<dd>-<slug>.md` and renders at `/wire/<yyyy>/<mm>/<slug>`. `docs/voice.md` binds every sentence you write.

## Inputs

- A candidate's **url**, **title**, **outlet** and **date**. Treat each as a lead to confirm, not a fact.

Read first: `docs/voice.md`, the pieces section of `docs/ontology.md`, the `piece` kind in `ontology/schema/content.yaml`, and the two seed pieces in `ontology/content/piece/`.

## Steps

1. **Fetch the page.** Open the url. If it does not load, or it loads a different piece, stop and report it. Never invent a URL, and never guess one from a title or a homepage.
2. **Confirm the metadata off the page.** Take the title, the outlet, the author where the page names one, and the publication date as the page prints them. Use the first publication date, not an updated date. Set `kind` to what the piece is: news, analysis, research, guidance, vendor, post, decision, filing or podcast. A company writing about its own product is `vendor`, even in a trade outlet's sponsored slot. Set `paywall` to registration or paywall when the page asks for either.
3. **Write the summary.** One `## Summary` of two to five sentences. Lead with what the piece says, in plain words, with its figures and its base. Then say why it matters to a deal maker, as a fact rather than a flourish. Attribute what is reported: "Canadian Lawyer reports", "the survey found". For a `vendor` or `post` piece, the first sentence names the outlet or says it is a vendor's material or a post. Write the frontmatter `summary` as one line under 160 characters. Quote at most a short phrase, and only words the page prints.
4. **Tag two to five entities** in `about`, most specific first. The first tag sets the group the piece appears under in This week, so choose it with care. Use only ids that exist in `ontology/entries` or `ontology/market`. If the right entity is missing, tag the nearest one and say so in your report.
5. **File it under one desk.** `facets: { desk: [<desk>] }`, one of legal-ai, contract-negotiation, in-house-teams, vendors-and-funding, law-firms or courts-and-regulation: the shelf a deal maker would look on, not the outlet's beat. A fundraise, a launch or a partnership announced by a vendor is vendors-and-funding; a survey of AI adoption is legal-ai; one firm's deployment or pricing is law-firms; a ruling, a bar opinion or a privacy rule is courts-and-regulation; the legal department's budgets, intake and operations are in-house-teams; playbooks, clauses and review practice are contract-negotiation.
6. **Add figures only if they are on the page.** `## Figures` takes bullets written `value, what it is`, such as `- 47%, in-house respondents who felt board pressure to adopt legal AI, up from 18%`. Copy each figure with its base and its meaning. Leave the section out when the page has no figures.
7. **Name the file** with the publication date and a short slug: `2026-10-08-clients-pressure-lawyers-to-adopt-legal-ai.md`. Set `published` to the same date, `revised` to today, `status: reviewed` and `byline: The Contract Room`.
8. **Run the checks.** `npm run ontology:check` must end with `0 errors, 0 warnings`. Then run `npx tsx scripts/citation-check.mts --only piece/<yyyy>-<mm>-<dd>-<slug>`, the file name without `.md` (the checker accepts it with the extension too). A page that refuses scripted reads goes in `ontology/schema/citation-allowlist.txt` with a comment, and the second check reads it by hand.
9. **Second check.** A second writer, who did not write the piece, opens the url and confirms the title, outlet, author, date and kind, every figure, and that each summary sentence says what the page says. Fix what they find before the piece is merged.

## Rules

- Never name our own product or its maker in a piece. A piece about legal technology is about the field.
- Never invent a URL, a date, an author or a figure.
- Summaries are ours. Do not copy the outlet's standfirst or its first paragraph.
- One piece per URL. The validator rejects a second file with the same url.
- A survey's share "feeling pressure to adopt" is not a share "adopting". An expectation is not a finding.
- Say when a report is more than about a year old, and when its publisher sells the product it measures.

## Report

List the file written, the tags and why the first was chosen, any figure left out and why, and anything that could not be confirmed off the page.
