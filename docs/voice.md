# The Contract Room: voice for reference prose

Status: binding for all reference prose on thecontractroom.com. That covers entry bodies and
summaries in `ontology/entries`, `ontology/market` and `ontology/content`, and the site's own
sentences on reference pages. Adopted 10 October 2026 at the founder's direction. The source is
a newsroom house voice, adapted here to a legal reference.

## The house voice, in one line

Plain English, precise and clinical. Write so a smart reader who does not draft contracts for
a living understands each sentence on the first read: a founder, a finance lead, a junior
associate. Lead with the point, say it in everyday words, then back it with the law, the
number or the document. Named parties, named statutes and concrete figures, never
abstraction.

## Write in plain English (this outranks every other rule)

Our readers are clever but many of them are not specialists. If a sentence needs a law degree
or a second read, rewrite it. Being understood on the first read is the goal.

**Plain is not bland.** Plain English removes fog and jargon. It keeps the edge, the rhythm
and the point. Use vivid everyday words and a real contrast, and give each sentence a spine.

**Accuracy outranks plainness.** A legal sentence that becomes plainer but says something
different is wrong. When the plain word would change the legal meaning, keep the meaning and
find another plain sentence. "Reasonable compensation not exceeding that sum" stays, because
section 74 of India's Contract Act says exactly that.

**Say plainly what happens.** State who does what, to whom, in ordinary words. Do not gesture
at significance with a meta-sentence ("what matters is", "the real story", "the structure
matters"). Give the reader the fact and let it land.

**Cut the flourishes.** "sits at the heart of", "the battleground of", "a delicate balance".
Replace each with the concrete thing.

**Prefer the plain word.** buy, not acquire (in prose; a deal's name and a defined role such
as "acquirer" keep their form). use, not leverage or utilise. money, not capital (unless the
term is share capital). started, not launched or commenced. before, not prior to. about, not
approximately. If, not in the event that. The ordinary word beats the impressive one.

**Gloss the term of art you cannot avoid.** Some terms are load-bearing: super-cap,
carve-out, reverse triangular merger, specific performance, outside date. Say what each means
once, in about four words, on its first use in the entry. "specific performance" becomes
"specific performance (a court order to carry out the agreement)". If a term cannot be glossed in
about four words and the entry does not need it, cut it.

**One idea per sentence.** Break comma-piled clauses. A reader should never hold three
clauses in mind to reach the verb.

## Core principles

- **Lead with the point.** The first sentence of each section states the claim, not the
  source or the setup. "Most SaaS caps start at twelve months' fees" before "In SaaS and
  services contracts, a cap at twelve months' fees is the most common starting point".
- **Density without abstraction.** Every sentence carries a fact, a rule or a reason. No
  connective filler and no throat-clearing about why something matters.
- **Attribute what is disputed or reported.** "The joint press release valued the deal at
  about US$35bn." A figure that comes from one party's announcement is that party's figure.
- **Human, not generated.** The tells in the blacklist read as machine-written, and so does
  abstraction. Both are banned.

## Sentence mechanics

### Tense

Past tense for what happened: a deal signed, a court decided, a statute was passed. Present
tense for the standing state: what a clause does, what a statute provides, how a negotiation
usually runs. Keep tense consistent within a section.

### Sentence length

Vary length, but never at the cost of clarity. A section usually runs: a clear lead, a short
beat that makes the point stick, then a medium sentence that closes it. Avoid two failures.
The first is the clause pile, a 40-word sentence with three subordinate clauses. The second
is the staccato stub, a run of four-word sentences played for rhythm. Fragments are not
allowed in prose (display copy is different, see below).

### Subjects and pronouns

A sentence names its subject. A pronoun ("it", "they") may carry the subject into the next
sentence or two. When a subject returns after a gap, restate it with enough specification to
stand alone. Do not repeat a long noun phrase in every sentence for its own sake: "A
limitation of liability clause ... A limitation of liability clause ..." becomes "The clause
... It ...". Bare pointer nouns that pretend specificity ("the tool", "the work", "that gap")
stay banned, and the validator warns on them.

## The blacklist

- **No em dashes, ever.** Use a full stop, a comma or a colon, or restructure. En dashes in
  numeric ranges (2024–2026) are fine. The validator fails the build on any em dash.
- **No significance-flagging.** Cut "what matters is", "the real signal", "the real story",
  "the structure matters". The validator warns on these openers.
- **No jargon without a plain gloss** (see above).
- **No "not just X but Y"**, "not only X but Y" or "not merely X but Y". Avoid the parent
  form "it is not X, it is Y" too. The validator fails the build on the first three.
- **No rule-of-three triads** for rhythm. A list of three real items is a list, not a triad.
- **No semicolons joining clauses.** Connect with plain logic ("But", "So", "Because") or
  use two sentences. A colon introducing a list or an explanation is fine. A semicolon
  separating items in a complex list is fine. The validator warns on a semicolon that joins
  two clauses in body prose.
- **No filler tells:** "it's worth noting", "it is worth noting", "underscores" or
  "underscored", "highlights the" or "highlighting", "stands as a testament", "in a world
  where". The validator fails the build on these.
- **No contractions and no exclamation marks** in site prose.

## Name the jurisdiction, and disambiguate currency

The site covers England and Wales, India and Delaware, and a reader may arrive from any of
them. Name the jurisdiction on first reference in every section that states law: "the
Unfair Contract Terms Act 1977 (England and Wales)", "India's Contract Act 1872", "Delaware
courts". Never a bare "the court", "the statute", "the regulator" or "the Act" meaning one
country's institution until that country has been named. No "here", "at home" or "domestic"
framing, and no country-default date formats: write 15 January 2024.

Never a bare "$". Use US$, A$, S$, C$, HK$, ₹, €, RMB or an ISO code. Money written out in
words ("950 million US dollars") also passes. The validator fails the build on "$" followed
by a digit. A verbatim quotation from a source keeps its own wording.

## Rules kept from the earlier standard

These three rules carry over from the site's earlier copy standard. They still bind reference prose.

1. **The reader is never narrated.** The reader receives verbs of doing (review, compare,
   draft, send). The reader never receives verbs of perceiving or reacting (watch, notice,
   realise, feel). No cinematic present ("you open the draft, you notice the cap has moved").
   When a realisation must be conveyed, give it to the document or the process as a fact.
2. **Display copy may be phrasal; prose may not.** Headings, labels, captions, eyebrows,
   buttons, table cells and list values may be phrases. Every sentence in a paragraph is a
   full sentence.
3. **No vendor name on entry pages or in any entry.** A how-to may be marked `agent_capable`
   in its frontmatter; the site decides what, if anything, to say about tooling. Never write a
   product name into an entry. The register check enforces this on rendered pages.

## Worked examples from the seed

### clause/limitation-of-liability, "How it operates"

Before (one sentence, 52 words):

> The third part of a limitation of liability clause lists carve-outs: liabilities to which
> the exclusion and the cap do not apply, such as liability for fraud, for death or personal
> injury caused by negligence, for breach of confidentiality, and for the indemnities.

After:

> The third part lists the carve-outs, meaning liabilities that neither the exclusions nor
> the cap reach. The usual carve-outs are fraud, death or personal injury caused by
> negligence, breach of confidentiality and the indemnities.

The repeated subject becomes "The third part". "Carve-outs" is glossed once. The list moves to
its own sentence, so the reader reaches the verb at once.

### deal/2024-synopsys-ansys, "Structure"

Before:

> A merger of this kind delivers the same result as a purchase of all the target's shares,
> and it is the usual route for acquiring a United States public company because it binds
> all shareholders once the required vote is obtained.

After:

> This kind of merger has the same result as buying all of the target's shares. It is the
> usual way to buy a US public company, because once shareholders approve it by the required
> vote, it binds every shareholder.

Two ideas become two sentences. "Acquiring" becomes "buy", and the reason sits at the end of
the sentence it explains.

### guide/limitation-of-liability-in-saas-contracts, "Why the cap decides SaaS negotiations"

Before:

> The limitation of liability clause is where that mismatch is resolved, and it is therefore
> the clause on which most SaaS negotiations turn. A vendor needs a cap that it can offer
> across its customer base and cover with insurance; an enterprise customer needs a cap that
> bears some relation to the loss it would suffer if the vendor lost its data or its service
> failed.

After:

> The limitation of liability clause settles that mismatch, so most SaaS negotiations turn
> on it. The vendor needs one cap it can offer every customer and insure. An enterprise
> customer needs a cap that bears some relation to its real loss if the vendor loses its data
> or the service fails.

The semicolon becomes a full stop. "Is where that mismatch is resolved" becomes the verb
"settles".

## What the validator enforces, and what is on the writer

- **Enforced** by `npm run ontology:check` (`scripts/ontology/style.ts`): em dashes, "not
  just / not only / not merely ... but", the filler tells, a bare "$" before a digit (all
  errors); a semicolon joining two clauses, the significance-flagging openers and bare
  pointer subjects (warnings). The seed must end with `0 errors, 0 warnings`.
- **Enforced** by `npm run register:check` on rendered pages: em dashes in paragraphs, the
  denylist and the vendor-name rule.
- **On the writer**: plain English above all, leading with the point, glossing, one idea per
  sentence, varied length, tense, jurisdiction on first reference, accuracy, no contractions
  and no exclamation marks. Passing the
  validator is not the same as done.

## Pre-publish checklist

1. Does each section lead with its point, in plain everyday words?
2. Could a smart non-lawyer follow every sentence on the first read? Is each term of art
   glossed once?
3. Is any significance-flagging or flourish left to cut?
4. One idea per sentence, no clause piles, no staccato stubs, length varied?
5. Tense: past for what happened, present for the standing state, consistent in each section?
6. No em dashes, no "not just X but Y", no triads, no semicolon-joined clauses, no filler
   tells, no contractions, no exclamation marks?
7. Jurisdiction named on first reference; currency disambiguated; no bare "$"?
8. Is the reader narrated anywhere? Is any paragraph sentence a fragment?
9. Is every fact, citation, id, relation and heading unchanged from what the sources support?
   Is the legal meaning of every rewritten sentence the same?
10. Run `npm run ontology:check` (must end `0 errors, 0 warnings`) and `npm test`.
