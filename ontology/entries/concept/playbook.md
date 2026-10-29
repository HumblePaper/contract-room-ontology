---
id: concept/playbook
type: concept
name: Negotiation playbook
aliases: [playbook, contract playbook, negotiation guidelines, standard positions]
summary: A legal team's written positions for each recurring clause, with the fallbacks it may offer and who must approve a move beyond them.
relations:
  - rel: specific_to
    to: jurisdiction/england-and-wales
  - rel: specific_to
    to: jurisdiction/india
  - rel: specific_to
    to: jurisdiction/delaware
  - rel: cites
    to: source/sterling-miller-ten-things-contract-playbook
  - rel: cites
    to: source/acc-jobline-contract-negotiation-guide
  - rel: cites
    to: source/thomson-reuters-negotiation-tactics-in-house
  - rel: cites
    to: source/spellbook-contract-playbook-guide
  - rel: cites
    to: source/legistify-ai-clause-intelligence
  - rel: cites
    to: source/conga-ai-in-contracts-2026
  - rel: cites
    to: source/zoho-state-of-contract-management-2026
  - rel: cites
    to: source/cloc-state-of-the-industry-2025
  - rel: cites
    to: source/cloc-state-of-the-industry-2026
  - rel: cites
    to: source/reed-smith-contracting-beyond-legacy-saas
  - rel: cites
    to: source/bar-examiner-aba-formal-opinion-512
  - rel: cites
    to: source/aba-formal-opinion-512
  - rel: cites
    to: source/harvey-contract-review-agents
  - rel: cites
    to: source/ucta-1977
  - rel: cites
    to: source/indian-contract-act-1872
  - rel: cites
    to: source/delaware-code
sources:
  - source/sterling-miller-ten-things-contract-playbook
  - source/acc-jobline-contract-negotiation-guide
  - source/thomson-reuters-negotiation-tactics-in-house
  - source/spellbook-contract-playbook-guide
  - source/cloc-state-of-the-industry-2026
  - source/harvey-contract-review-agents
  - source/bar-examiner-aba-formal-opinion-512
  - source/reed-smith-contracting-beyond-legacy-saas
  - source/ucta-1977
  - source/indian-contract-act-1872
  - source/delaware-code
status: reviewed
revised: 2026-10-10
confidence: medium
---

## Definition

A negotiation playbook is a legal team's written rules for negotiating its recurring contracts. For each clause that comes up often, it records three things. The first is the preferred position, meaning the language the team proposes or accepts without discussion. The second is the fallbacks, meaning the concessions a negotiator may give, in order, without asking anyone. The third is the hard limit and the approval threshold, meaning the point past which a more senior person must sign off or the team walks away. A playbook usually also gives the reason for each position and the argument to make for it. Sterling Miller's guide for in-house lawyers describes the same three parts: each standard clause explained, the fallback clauses the company would accept, and the point at which it walks away.

## Why it matters at the table

A playbook lets a small team negotiate a large volume of contracts consistently. Without one, each lawyer applies a personal view of what is acceptable, and the company ends up with different terms for the same risk. With one, a junior lawyer can close most points alone and escalate only the points that go past a limit.

The playbook is also the standard against which every counterparty markup is reviewed. When the counterparty's paper is the base document, the reviewer reads its whole form against the playbook, clause by clause. When the team's own form is the base, the reviewer checks each change the counterparty made. One convention rates each finding red, amber or green. Red means a point beyond the hard limit, amber a point within the fallbacks, and green a point that meets the preferred position. Review software and AI agents apply the same standard. In the United States, the American Bar Association's Formal Opinion 512 of July 2024 says that a lawyer who uses AI tools keeps the duties of competence, confidentiality and supervision. So a lawyer still reviews what an agent finds.

Departments need that consistency because demand is rising faster than headcount. CLOC's 2026 survey of 135 law departments found demand rising while only 32% expected their number of attorneys to grow. Written playbooks have a limit. Harvey, which sells review agents, argues that a playbook captures a team's stated positions better than its real practice, such as which fallbacks it gives most often.

A playbook needs owners and a routine. The general counsel or a senior commercial lawyer approves it. Sterling Miller recommends an annual review for changes in the contract, the process, customer feedback and the law. The issue lists from past deals show which fallbacks the team gives and how often. He warns against treating a clause accepted once or twice as a new position, because the company may have had no choice.

## How clauses implement it

A playbook does not appear in the contract. It shapes the contract through the positions it sets for each clause. For a limitation of liability clause, a vendor's playbook might set twelve months' fees as the preferred cap. It might allow twenty-four months' fees as a fallback with the commercial counsel's approval, and send anything higher to the general counsel. The [vendor's fallback sequence for limitation of liability](/fallbacks/limitation-of-liability-vendor) records that order of concessions for one clause. The playbook also lists the carve-outs (claims the cap does not reach) that the team will always accept and those it will never accept. When the playbook covers buying AI tools, Reed Smith's guide suggests positions on training data, service levels for accuracy, and the actions an agent may take without human sign-off.

## By jurisdiction

### England and Wales

A playbook's limits for England and Wales must respect the Unfair Contract Terms Act 1977. A business cannot exclude or restrict liability for death or personal injury caused by negligence, so no fallback may give that away. Other exclusions and limits of negligence liability must be reasonable. So must exclusions and limits in a party's written standard terms of business, and a standard form built from a playbook can count as such terms. Where a clause caps liability at a fixed sum, section 11(4) tells the court to consider the resources of the party relying on the cap and how far it could have insured. So the playbook sizes each cap with the company's insurance in mind.

### India

Under section 74 of India's Contract Act 1872, a party can recover no more than reasonable compensation, not exceeding the sum named, when a contract names a sum payable on breach. A playbook for Indian-law contracts states its liability positions as limits on liability, not as sums payable on breach. Its positions on liquidated damages (a pre-agreed sum for breach) should assume that a court may award less than the named sum.

### Delaware

Delaware courts enforce caps and exclusions negotiated between sophisticated commercial parties as written. They will not enforce a provision that protects a party from liability for its own fraud in making the representations in the contract. The Court of Chancery set out that limit in ABRY Partners v F&W Acquisition (2006), as the [Delaware entry](/jurisdictions/delaware) explains. A Delaware-law playbook therefore keeps a fraud carve-out at every step of its fallback sequence.
