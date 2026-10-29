---
id: matter-type/enterprise-sale-on-customer-paper
type: matter-type
name: Enterprise sale on customer paper
aliases: [customer paper deal, sale on customer form]
summary: The matter in which a vendor's legal team negotiates an enterprise customer's own form of contract to close a sale.
cadence: always-on
trigger: An enterprise customer's procurement team sends its own master agreement for the vendor to review
owner_function: function/legal
documents_in_play: [document-type/master-services-agreement]
relations:
  - rel: uses_workflow
    to: workflow/bilateral-negotiation
  - rel: has_stage
    to: stage/first-markup-review
    order: 1
  - rel: specific_to
    to: industry/saas
  - rel: cites
    to: source/ucta-1977
sources:
  - source/ucta-1977
status: reviewed
revised: 2026-10-10
confidence: high
---

## Overview

An enterprise sale on customer paper is a sale in which a large customer makes the vendor sign the customer's own master agreement instead of the vendor's standard terms. The vendor's legal team must review a document it did not draft. It has to find every term that departs from the vendor's positions and negotiate the ones that matter, within the time the sales team has to close the deal. In most SaaS and services businesses these sales arrive in a steady stream, and the vendor's legal team handles many of them at once.

## Stages

An enterprise sale on customer paper starts with intake, in which the sales team submits the customer's form and the deal particulars. In the first markup review, the vendor's counsel reviews the customer's form against the playbook and returns a markup and issue list. Later rounds of negotiation follow, open points are escalated for approval, and the parties sign. Each later round repeats the review of the returned draft.

## Documents

The central document in an enterprise sale on customer paper is the customer's master services agreement or master purchase agreement. A data processing agreement, an information security schedule, a supplier code of conduct and an order form or statement of work often come with it. The vendor's own playbook and standard terms are the benchmark for reviewing the customer's form.

## Who is involved

The vendor's commercial counsel or contracts manager runs the negotiation, and the general counsel approves departures beyond the playbook. The vendor's sales team owns the relationship and the timetable. The vendor's security and privacy teams answer the customer's questionnaires. On the customer's side, procurement usually leads, and the customer's legal, security and privacy teams review their own sections.

## Deadlines

The deadlines in an enterprise sale on customer paper are commercial, not legal: the end of the vendor's sales quarter and the customer's budget or project start date. The customer's form may also set notice periods for renewal and termination, which the vendor must record once the agreement is signed.

## Pitfalls

The most frequent pitfalls are accepting an uncapped indemnity that defeats the vendor's liability cap, missing an unmarked change in a returned draft, and agreeing to the customer's audit and security terms without checking that the vendor can comply. Another is accepting a most favoured customer pricing clause (a promise of the best price given to anyone) that the sales team did not price.

## Metrics

Legal teams measure the matter by cycle time from receipt of the customer's form to signature, the number of negotiation rounds, the share of deals signed within the playbook, and the number and value of approved departures.

## By industry

### SaaS

In SaaS, customer paper is often written for on-premises software or professional services and fits a hosted subscription poorly. So the vendor's counsel must adapt the terms on acceptance testing, source code escrow and service levels. The cap on liability and the treatment of data protection breaches are the points most often escalated.

## By jurisdiction

### England and Wales

Section 3 of the Unfair Contract Terms Act 1977 (England and Wales) applies when an English-law agreement is made on one party's written standard terms of business. It makes the exclusions and limitations in those terms pass a test of reasonableness. That limits how far an enterprise customer's form can limit the customer's own liability.

### India

Enterprise customer forms governed by Indian law often provide for arbitration seated in the customer's city. They also attract stamp duty under the relevant state law. The vendor's counsel should check both before signature.
