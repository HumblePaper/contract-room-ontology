---
id: tool/ai-contract-agents
type: tool
name: AI contract agents
aliases: [contract review agents, legal AI agents, agentic contract review]
summary: Software that takes a contract task as a goal and carries out its steps, such as intake, review against a playbook or a first markup, for a lawyer to approve.
kind: category
category: Contract review and negotiation
relations:
  - rel: supports_workflow
    to: workflow/bilateral-negotiation
  - rel: supports_workflow
    to: task/review-counterparty-markup
  - rel: cites
    to: source/law-com-in-house-teams-ai-agents-risk
  - rel: cites
    to: source/artificial-lawyer-att-openai-legal-workflows
  - rel: cites
    to: source/lawyer-monthly-att-reliance-on-law-firms
  - rel: cites
    to: source/artificial-lawyer-legalon-in-house-agents
  - rel: cites
    to: source/artificial-lawyer-checkbox-first-pass
  - rel: cites
    to: source/pulse-2-chamelio-series-a
  - rel: cites
    to: source/google-cloud-cooley-redaction-agent
  - rel: cites
    to: source/artificial-lawyer-openai-astra-for-law
  - rel: cites
    to: source/legal-it-insider-ft-innovative-lawyers-europe-2026
  - rel: cites
    to: source/harvey-contract-review-agents
  - rel: cites
    to: source/canadian-lawyer-disco-ai-survey-2026
  - rel: cites
    to: source/conga-ai-in-contracts-2026
  - rel: cites
    to: source/vals-legal-ai-report-2025
  - rel: cites
    to: source/bar-council-generative-ai-guidance
  - rel: cites
    to: source/reed-smith-contracting-beyond-legacy-saas
sources:
  - source/law-com-in-house-teams-ai-agents-risk
  - source/artificial-lawyer-legalon-in-house-agents
  - source/artificial-lawyer-checkbox-first-pass
  - source/google-cloud-cooley-redaction-agent
  - source/harvey-contract-review-agents
  - source/canadian-lawyer-disco-ai-survey-2026
  - source/conga-ai-in-contracts-2026
  - source/vals-legal-ai-report-2025
  - source/reed-smith-contracting-beyond-legacy-saas
status: reviewed
revised: 2026-10-10
confidence: medium
---

## What it does

An AI contract agent takes a contract task as a goal and carries out the steps to finish it. A chat assistant answers one prompt at a time. An agent plans the steps, reads the documents, checks them against the team's rules and returns a finished piece of work for a lawyer to approve. The tasks vendors describe are narrow and repeated. Launch announcements describe agents that answer intake requests from the business and gather the missing facts. They describe agents that review an incoming contract against the team's [negotiation playbook](/concepts/playbook), its written positions and fallbacks, and score its risk. Vendors also describe agents that propose a first markup of a counterparty's draft, and agents that approve a low-risk contract meeting the playbook and escalate the rest to a lawyer. People still check the output. In Conga's 2026 survey of 250 contract professionals, 92% said their organisation still requires a person to review AI output.

## Where it fits

AI contract agents sit at the front of the bilateral negotiation workflow, the exchange of drafts between two parties. In vendors' descriptions, an intake agent sits before the lawyer and sorts what comes in. A review agent, as vendors describe it, sits at the review of each counterparty markup. It compares the returned draft with the playbook and drafts the issue list and the response. Trade reports of AT&T's programme describe a general counsel using agents to handle more work in house and to rely less on outside firms. Some agents are sold to run inside the company's existing contract management software. Others are sold as a replacement for it. Launch announcements also describe model makers selling legal configurations of their general models, with specialist vendors connecting through plugins.

## Evaluation criteria

A legal team should judge an AI contract agent on these points.

- **Fidelity to the playbook.** The agent applies the team's actual positions, fallbacks and approval thresholds, and it says which rule each finding comes from.
- **Measured accuracy on the team's own contracts.** The team tests the agent on a sample of its own past drafts, with known answers, before it relies on the agent. Published benchmarks cover only the tasks vendors chose to enter. In the Vals Legal AI Report of February 2025, where vendors opted into tasks, lawyers beat the best tool at redlining, 79.7% to 65.0%.
- **Completeness of review.** The agent works from a full comparison against the draft that was sent, so it finds changes the counterparty did not mark.
- **Grounding.** Every finding points to the clause text it rests on, so a lawyer can check it in seconds.
- **Scoped permissions.** The team controls what the agent may read, what it may change and what it may send. Nothing leaves the company without a lawyer's approval.
- **Audit trail.** The agent logs what it read, what it proposed and who approved each step, so the team can reconstruct any decision later.
- **Confidentiality and security.** Contract text and client information stay within the terms agreed with the vendor, including any limits on training the vendor's models. The vendor holds an independent security certification, such as ISO/IEC 27001 or a SOC 2 report, and shares it.
- **Jurisdiction and language coverage.** The agent handles the governing laws and languages of the team's contracts, such as England and Wales, India and Delaware, and says where it does not.
- **Integration.** The agent works where the lawyers work, in Microsoft Word and in the team's contract management software, without copying documents between systems.
- **Maintenance.** The team can update the playbook when its positions change, and the agent's output changes with it.

Price matters too. Canadian Lawyer's report of the 2026 DISCO survey says legal AI pricing has moved from annual subscriptions to charges based on use, which makes the annual cost harder to predict. A team buying an agent also needs contract terms for it, such as the actions the agent may take and service levels for accuracy. Reed Smith's guide on contracting for AI sets those out.

## Ranking pointer

The Contract Room has not yet ranked products in this category. A ranking will score named products against the criteria above, and it will be published under rankings when it is ready. Until then, this entry describes the category only and names no product.
