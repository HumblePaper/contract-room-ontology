---
id: stage/first-markup-review
type: stage
name: First markup review
aliases: [first-turn review, initial markup]
summary: The stage in which a party reviews the counterparty's draft for the first time and sends back its markup and issue list.
order: 1
entry_condition: The counterparty's draft has been received and the deal particulars are known
exit_condition: The markup and issue list have been sent to the counterparty
typical_duration: Two to five business days
relations:
  - rel: comprises
    to: task/review-counterparty-markup
  - rel: cites
    to: source/word-legal-blackline
sources:
  - source/word-legal-blackline
status: reviewed
revised: 2026-10-10
confidence: high
---

## What happens

In the first markup review, the reviewing party reads the counterparty's whole draft against its playbook. It marks every change it needs and explains its significant changes in comments. It also prepares an issue list of the points that will need negotiation. If the counterparty has sent back the reviewing party's own draft, the review starts with a full comparison against the version that was sent.

## Inputs and outputs

A first markup review starts from the counterparty's draft, the reviewing party's playbook and standard terms, the deal particulars from the business team, and any earlier version of the draft. It produces a marked-up draft and an issue list. Where the business team must decide a point, it also produces a short note of the decisions needed.

## Decisions taken

The reviewer decides whether to accept, reject or counter each departure from the playbook, and makes any counter with a fallback position. The reviewer also decides which of those moves, including a move to a fallback, need approval from the general counsel or the business owner before the markup goes out.

## Exit criteria

The first markup review ends when the markup and the issue list have been checked against each other and sent to the counterparty, with every required approval recorded.
