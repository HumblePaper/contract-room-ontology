---
id: clause/indemnity
type: clause
name: Indemnity
aliases: [indemnification, indemnity clause, hold harmless]
summary: The clause by which one party promises to make good specified losses of the other, most often losses arising from third-party claims.
facets:
  party_perspective: [customer, vendor]
protects: [party-role/customer]
variants:
  - intellectual property infringement indemnity
  - data protection indemnity
  - general third-party claims indemnity
heat: high
relations:
  - rel: implements
    to: concept/risk-allocation
  - rel: interacts_with
    to: clause/limitation-of-liability
    note: The cap must state whether it applies to indemnities, or an uncapped indemnity will defeat it.
  - rel: specific_to
    to: jurisdiction/england-and-wales
  - rel: specific_to
    to: jurisdiction/india
  - rel: cites
    to: source/indian-contract-act-1872
sources:
  - source/indian-contract-act-1872
  - source/ucta-1977
status: reviewed
revised: 2026-10-10
confidence: high
---

## Purpose

An indemnity is a promise by one party to make good specified losses that the other party suffers, whether or not the indemnifying party has breached the contract. In commercial contracts, indemnities mainly move the cost of third-party claims to the party best placed to prevent or defend them. A typical example is a claim that the vendor's software infringes a patent. A claim under an indemnity may be treated as a claim in debt for the specified losses rather than a claim for damages. Under English law, whether the rules on remoteness and mitigation apply to it depends on the wording and is not settled. That is why careful drafters deal with both expressly.

## How it operates

An indemnity clause names the indemnifying party, the protected parties, the events that trigger the indemnity and the losses covered. It usually defines the losses by reference to the defined term Losses. The clause then sets the procedure. The protected party must notify the claim promptly and give the indemnifying party control of the defence and any settlement. It must also cooperate in the defence and make no admission without consent. In a software contract, an intellectual property indemnity usually lets the vendor get a licence, change the software so that it no longer infringes, or end the contract and refund prepaid fees. It excludes claims caused by the customer's changes to the software or by combining it with other products.

## Positions

A customer asks for indemnities against intellectual property infringement, breach of data protection law, breach of confidentiality and the vendor's negligence, all outside the cap. A vendor offers an intellectual property indemnity only, with the standard exclusions. It asks for that indemnity to sit within the general cap or a super-cap (a higher cap for named claims). A common landing point is an uncapped intellectual property indemnity, a data protection indemnity within a super-cap, and mutual indemnities for each party's breach of law.

## Negotiating it

A negotiator settles which claims are indemnified first, and the cap second. The value of each indemnity depends on whether the limitation of liability clause reaches it. A vendor resists indemnities that cover its own breach of contract, because such an indemnity turns every breach into an uncapped debt claim. A customer resists conduct-of-claims terms that let the vendor settle claims in a way that harms the customer's business. It asks for a right to approve any settlement that puts obligations on it.

## Pitfalls

The most damaging pitfall is a contradiction between two clauses. The indemnity clause carves the indemnity out of the cap, while the limitation of liability clause says that the cap applies to all liability under the contract. A second pitfall is an indemnity for "any breach of this agreement", which turns the whole contract into an uncapped debt. A third pitfall is a defined term Losses that includes consequential loss, in a contract that excludes consequential loss elsewhere.

## Interactions

The indemnity clause interacts first with the limitation of liability clause, which must say whether the cap applies to the indemnities. It also interacts with the definition of Losses, which sets what the indemnity covers, and with the insurance clause and the conduct-of-claims and notice provisions. In acquisition agreements the indemnity also interacts with the rules for warranty claims, the disclosure letter, and any escrow or warranty and indemnity insurance.

## Model language pointer

Model language for the intellectual property indemnity and the data protection indemnity, with the procedure for conduct of claims, will be published as a model language item linked from this entry.

## By jurisdiction

### England and Wales

English courts read an indemnity strictly against the party relying on it. An indemnity will not cover losses caused by the protected party's own negligence unless the words make that clear. English law has not settled whether a claim under an indemnity is a claim in debt or a claim for damages. An indemnity against loss is often read as a promise to hold the protected party harmless, meaning to keep it from suffering the loss at all. A breach of that promise gives rise to a claim for unliquidated damages (damages the court assesses), as the House of Lords' decision in The Fanti and The Padre Island shows. So whether remoteness and mitigation apply to an indemnity claim depends on the wording, and careful drafters state whether they apply. English courts enforce express procedural conditions in an indemnity, such as prompt notice, as written. An indemnity that in substance excludes or restricts a party's liability for negligence can fall within section 2 of the Unfair Contract Terms Act 1977. It gets there through the wider meaning of exclusion in section 13.

### India

Sections 124 and 125 of the Indian Contract Act 1872 define a contract of indemnity and the rights of the indemnity holder. The statutory definition refers to loss caused by the conduct of the promisor or any other person, and commercial indemnities are drafted more widely than that. Indian courts have held that an indemnity holder may enforce the indemnity once its liability has become absolute, without first paying the third-party claim.

## By industry

### SaaS

SaaS vendors almost always give an intellectual property indemnity against claims that the service infringes third-party rights. It excludes customer data, customer changes, and combinations with products the vendor did not supply. Enterprise customers increasingly ask for a data protection indemnity as well. It covers regulatory fines and third-party claims arising from the vendor's breach of the data processing agreement. The negotiation of that indemnity usually turns on the size of the super-cap.
