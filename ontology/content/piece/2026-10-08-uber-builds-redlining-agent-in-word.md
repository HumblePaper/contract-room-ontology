---
kind: piece
title: "Scaling AI in Legal: Building Uber's Redlining Agent"
summary: "Vendor post: Uber's team describes a Word add-in that reads counterparty edits and proposes replies; it reports 91% accuracy and 20% faster review."
about:
  - task/review-counterparty-markup
  - tool/ai-contract-agents
facets:
  desk: [contract-negotiation]
status: reviewed
published: 2026-10-08
revised: 2026-10-15
byline: The Contract Room
block:
  url: "https://www.uber.com/blog/building-ubers-redlining-agent"
  outlet: "Uber Engineering blog"
  author: "Austin Greco, Meghana Somasundara and Frank Tenente"
  kind: vendor
  language: en
---

## Summary

This is Uber's own account of a tool it built for itself. The Legal Redlining Agent is a Microsoft Word add-in that finds the edits a counterparty made, works out what each edit is meant to do, and suggests whether to accept, reject or counter it under Uber's positions. Uber says its first approach, retrieval over a rules library, failed on weak matching and poor tone, so the team added a feedback loop and later let the agent draft counter-proposals from past feedback. Uber reports an average contract review time cut by more than 20% and 91% accuracy in the agent's decisions, both its own measures with no outside check stated.

## Figures

- 91%, accuracy of the agent's decisions, as reported by Uber
- over 20%, reduction in average contract review time, as reported by Uber
