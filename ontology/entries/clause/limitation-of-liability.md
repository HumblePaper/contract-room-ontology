---
id: clause/limitation-of-liability
type: clause
name: Limitation of liability
aliases: [liability cap, LoL, exclusion clause, limitation clause]
summary: The clause that caps or excludes what one party can recover from the other, and the most fought-over term in commercial contracts.
facets:
  party_perspective: [customer, vendor]
protects: [party-role/vendor]
variants:
  - cap at fees paid in a look-back period
  - fixed monetary cap
  - super-cap for data protection breaches
heat: high
relations:
  - rel: implements
    to: concept/risk-allocation
  - rel: implements
    to: concept/consequential-damages
  - rel: has_position
    to: position/liability-cap-twelve-months-fees
    strength: usually
  - rel: has_position
    to: position/liability-cap-twenty-four-months-fees
    strength: sometimes
  - rel: interacts_with
    to: clause/indemnity
    note: An uncapped indemnity defeats the cap unless the cap states that it applies to indemnities.
  - rel: specific_to
    to: jurisdiction/england-and-wales
  - rel: specific_to
    to: jurisdiction/india
  - rel: specific_to
    to: jurisdiction/delaware
  - rel: cites
    to: source/ucta-1977
  - rel: cites
    to: source/indian-contract-act-1872
sources:
  - source/ucta-1977
  - source/indian-contract-act-1872
  - source/delaware-code
status: reviewed
revised: 2026-10-10
confidence: high
---

## Purpose

A limitation of liability clause sets the most that one party can recover from the other. The cap covers claims for breach of contract, negligence and other claims under the agreement. The clause also excludes kinds of loss that neither party wants to bear. It lets each party price its exposure before it signs and insure against it. It also stops a single failure from costing more than the contract is worth. Because it decides who bears a loss that neither party expects, it is the most negotiated term in most commercial contracts.

## How it operates

A limitation of liability clause usually has three parts. The first part excludes named heads of loss (named kinds of loss), typically indirect and consequential loss, lost profits, lost revenue, loss of data and loss of goodwill. The second part sets a financial cap. The cap is most often a multiple of the fees paid or payable in a period before the claim, a fixed sum, or the greater of the two. The third part lists the carve-outs, meaning liabilities that neither the exclusions nor the cap reach. The usual carve-outs are fraud, death or personal injury caused by negligence, breach of confidentiality and the indemnities. The clause may also set a separate, higher cap for a defined category such as data protection breaches, often called a super-cap. A cap may apply per claim, per year or in total over the life of the contract, and the clause should say which.

## Positions

The common positions on the cap run from most favourable to the vendor to most favourable to the customer: the fees paid in the six or twelve months before the claim; the fees paid or payable in the twelve months before the claim; a multiple, such as twice the annual fees or the fees for twenty-four months; a fixed sum sized to the possible loss; and uncapped liability for specified claims. Most SaaS and services contracts start from a cap at twelve months' fees. Twenty-four months' fees is a frequent landing point when the customer is large or the data at risk is sensitive.

## Negotiating it

A negotiator starts by working out the realistic loss scenarios under the contract and comparing them with the proposed cap. A cap far below the realistic loss is a concession, whatever the market says. A vendor argues that the cap must bear some relation to the fees and to its insurance. It adds that unlimited liability to every customer would put its business at risk. A customer argues that the vendor controls the cause of the most likely losses, and that the fees do not measure the harm a failure would do. The usual trades give the customer a higher cap in return for fewer carve-outs, or a super-cap for data protection in return for keeping the general cap at twelve months. On a low-value contract, the customer may get a fixed minimum cap in return for accepting the fee-based formula.

## Pitfalls

The most frequent pitfall is a cap that does not say whether it applies to the indemnities. An uncapped indemnity then defeats the cap. A second pitfall is a cap measured by "fees paid" in the twelve months before the claim. A claim that arises early in the contract, before much has been paid, then meets a very low cap. A third pitfall is an exclusion of "consequential loss" that relies on the phrase alone without naming the heads of loss. That leaves its scope to the governing law. A fourth pitfall is a returned draft in which the counterparty has changed the cap or the carve-outs without marking the change. A full comparison against the draft that was sent will catch it.

## Interactions

The limitation of liability clause interacts most closely with the indemnity clause. Indemnities are commonly carved out of the cap or given their own cap, and the two clauses must give the same answer. The clause also interacts with the definition of Losses and with the insurance clause, which should require cover at least equal to the cap. It interacts with the warranty and exclusive remedy provisions too. Finally, it interacts with the confidentiality and data protection clauses, because their breach is often carved out of the cap or placed under a super-cap.

## Model language pointer

Model language for each position on the cap will be published as a model language item linked from this entry. It will include the vendor's fallback sequence from twelve to twenty-four months' fees as alternatives. Until then, the guide on limitation of liability in SaaS contracts sets out the structure that a well-drafted clause follows.

## By jurisdiction

### England and Wales

Under the Unfair Contract Terms Act 1977 (England and Wales), a business cannot exclude or restrict liability for death or personal injury caused by negligence. Any other exclusion or limitation of liability for negligence must pass the test of reasonableness in section 11. So must an exclusion or limitation for breach where one party deals on the other's written standard terms. Where the clause limits liability to a specified sum, section 11(4) tells the court to consider the resources of the party relying on the cap and how far it could have insured. English courts generally uphold caps negotiated between commercial parties of comparable bargaining power. A party cannot exclude liability for its own fraud. So drafters in England and Wales carve out death and personal injury caused by negligence, and fraud, expressly. They size the cap with insurance cover in mind.

### India

Section 73 of the Indian Contract Act 1872 limits compensation for breach to loss that arose naturally in the usual course of things, and loss the parties knew to be likely when they contracted. It excludes remote and indirect loss. Indian courts generally enforce agreed caps between commercial parties as part of the bargain. Separately, section 74 limits the recovery of any sum named as payable on breach to reasonable compensation not exceeding that sum. A cap that is unconscionable, or that a court considers opposed to public policy under section 23, is at risk where bargaining power was grossly unequal. So Indian-law contracts state the cap as a limit on liability, not as a sum payable on breach. They carve out fraud and wilful misconduct expressly.

### Delaware

Delaware courts enforce limitation of liability clauses between sophisticated commercial parties as written, and they read the clause by its plain terms. A party cannot use the clause to escape liability for its own fraud in making the representations in the contract. Delaware-law agreements commonly make the indemnification provisions, or the remedies the contract states, the sole and exclusive remedy for claims under the agreement. That remedy is subject to the cap and to a carve-out for fraud. The agreements also waive consequential, special and punitive damages, except to the extent paid to a third party.

## By industry

### SaaS

In SaaS agreements the cap is almost always tied to the subscription fees. Twelve months' fees is the vendor's standard. Twenty-four months' fees, or a multiple of annual fees, is the most common concession to enterprise customers. Most SaaS negotiations are decided on how the contract treats data protection and security breaches. Customers ask for uncapped liability for them. Vendors offer a super-cap instead, often a multiple of the general cap or a fixed sum aligned with the vendor's cyber insurance. SaaS vendors also cap service level failures at the service credits (fee discounts for missed service levels). They state that the credits are the customer's sole remedy for failures of availability.
