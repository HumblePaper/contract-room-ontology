---
id: task/review-counterparty-markup
type: task
name: Review counterparty markup
aliases: [review returned draft, turn the draft]
summary: Comparing a returned draft with the draft sent, reviewing every change against the playbook and recording the open points.
inputs:
  - the draft as sent
  - the draft as returned
  - the playbook
outputs:
  - a comparison of the two drafts
  - an issue list
  - a responsive markup
skill_required: Close reading against a playbook, with judgement on which changes matter
automatable: partly
relations:
  - rel: produces
    to: work-product/issue-list
  - rel: cites
    to: source/word-legal-blackline
  - rel: cites
    to: source/acc-jobline-contract-negotiation-guide
  - rel: cites
    to: source/bar-examiner-aba-formal-opinion-512
sources:
  - source/word-legal-blackline
  - source/acc-jobline-contract-negotiation-guide
  - source/bar-examiner-aba-formal-opinion-512
status: reviewed
revised: 2026-10-10
confidence: high
---

## Procedure

Compare the returned draft against the exact version that was sent, using a document comparison function such as Word's legal blackline. Do not rely on the counterparty's tracked changes. Review every difference the comparison shows, including changes to definitions, cross-references, schedules and formatting that can change meaning. Mark each change as accepted, rejected or countered, and check each one against the [negotiation playbook](/concepts/playbook). Record every open point in the issue list with the clause reference, each side's position and the proposed response.

## Inputs

A review of a counterparty markup needs the draft as it was sent, the draft as it came back, and the playbook or standard positions. If the negotiation has already run for more than one round, it also needs the current issue list.

## Outputs

A review of a counterparty markup produces a comparison document showing every change, an updated issue list, and the markup to send back to the counterparty.

## Quality checks

The reviewer confirms that the comparison was run against the version actually sent, and that the number of changes in the comparison matches the number the counterparty marked. The reviewer also confirms that every change in the comparison appears either as accepted in the markup or as an item in the issue list. Where an [AI contract agent](/tools/ai-contract-agents) did the first review against the playbook, the reviewer checks each of its findings against the clause text before relying on it. In the United States, the American Bar Association's Formal Opinion 512 treats that check as part of the lawyer's duty of competence.

## Common errors

The most common error is reviewing only the counterparty's tracked changes, which misses any change made without tracking. Other errors are comparing against the wrong base version, ignoring changes to defined terms that alter clauses elsewhere, and updating the markup without updating the issue list.
