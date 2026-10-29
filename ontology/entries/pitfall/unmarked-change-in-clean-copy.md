---
id: pitfall/unmarked-change-in-clean-copy
type: pitfall
name: Unmarked change in clean copy
aliases: [unmarked change, stealth edit, untracked change]
summary: A change the counterparty makes to a draft without showing it as a tracked change, which passes into the signed agreement unless a comparison catches it.
occurs_in: [workflow/bilateral-negotiation]
detected_by: [task/review-counterparty-markup]
severity: high
relations:
  - rel: occurs_in
    to: workflow/bilateral-negotiation
  - rel: detected_by
    to: task/review-counterparty-markup
  - rel: cites
    to: source/word-legal-blackline
sources:
  - source/word-legal-blackline
status: reviewed
revised: 2026-10-10
confidence: high
---

## The pattern

An unmarked change is a change to the text of a draft that the counterparty neither shows as a tracked change nor mentions. It may appear in a returned markup where most edits are tracked and one is not. It may also appear in a clean execution copy (the final version for signature) that should reflect only the agreed changes. The receiving party reviews what it is shown. So an unmarked change can pass into the signed agreement without anyone on the receiving side having read it.

## How it happens

Many unmarked changes are accidents. A lawyer turns tracking off to fix formatting and forgets to turn it back on, a document is built from an older precedent, or a clean copy is made from the wrong version. Some unmarked changes are deliberate. Either way the effect is the same. A party that signs an agreement is generally bound by its terms whether or not it read them, so the risk falls on the party that did not check.

## How to detect it

The reliable test is a full comparison of the returned document against the version the party sent. Run it with a comparison tool such as Word's legal blackline, rather than reading the counterparty's tracked changes. A full comparison shows every difference between the two texts, whether or not the counterparty marked it. The same check applies to the execution version, which should be compared against the last agreed draft before anyone signs.

## How to fix it

When a comparison finds an unmarked change, the reviewing party treats it like any other proposed change. It accepts, rejects or counters the change in its markup and records it in the issue list. The reviewing party should also tell the counterparty that the change was unmarked and ask for a fresh draft with every change tracked. That corrects the record and discourages a repeat. If an unmarked change is found only after signature, the remedy depends on the governing law and the facts. It may take rectification (a court order correcting the document) or a negotiated amendment. Both cost far more than the comparison that would have caught the change.
