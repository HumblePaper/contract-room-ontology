---
kind: piece
title: "Building an AI-powered contract intelligence platform with Amazon Quick and Amazon Bedrock AgentCore"
summary: "Vendor post: AWS engineers describe a build that extracts contract data into a database with two agents, at about US$0.014 per contract in model costs."
about:
  - tool/ai-contract-agents
facets:
  desk: [contract-negotiation]
status: reviewed
published: 2026-09-29
revised: 2026-10-15
byline: The Contract Room
block:
  url: "https://aws.amazon.com/blogs/machine-learning/building-an-ai-powered-contract-intelligence-platform-with-amazon-quick-and-amazon-bedrock-agentcore/"
  outlet: "AWS Machine Learning Blog"
  author: "Konala McGrath, Hugo Tse, Alberto Alonso and Nitish Chaudhari"
  kind: vendor
  language: en
---

## Summary

This is a vendor engineering post from Amazon Web Services. The authors argue that retrieval over documents handles portfolio-wide questions badly, so their design pulls contract terms into a database and keeps the documents for lookups. Two agents work independently, one extracting and one verifying, and a third tool settles disagreements about signatures. The authors estimate a cost of about US$349 a month for 1,000 contracts, most of it analytics licensing, with model and signature-detection cost near US$0.014 per contract.

## Figures

- US$0.014, model and signature-detection cost per contract, as estimated by the authors
- US$349, estimated monthly cost for 1000 contracts, as estimated by the authors
