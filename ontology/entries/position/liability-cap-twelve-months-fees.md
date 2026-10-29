---
id: position/liability-cap-twelve-months-fees
type: position
name: Liability cap at twelve months' fees
aliases: [12-month fees cap, annual fees cap, cap at fees paid in the preceding twelve months]
summary: Each party's total liability is capped at the fees paid or payable under the contract in the twelve months before the claim arose.
facets:
  party_perspective: [vendor]
  industry: [saas]
strength: middle
favours: [party-role/vendor]
market_frequency: The most common cap in SaaS and services contracts on vendor paper, by practitioner consensus.
relations:
  - rel: favours
    to: party-role/vendor
  - rel: falls_back_to
    to: position/liability-cap-twenty-four-months-fees
    order: 1
  - rel: cites
    to: source/ucta-1977
sources:
  - source/ucta-1977
status: reviewed
revised: 2026-10-10
confidence: medium
---

## Statement

Each party's total aggregate liability arising out of or in connection with the agreement, whether in contract, tort (including negligence) or otherwise, is limited to the total fees paid and payable by the customer under the agreement in the twelve months immediately before the event giving rise to the claim. The cap is subject to the agreed carve-outs.

## Rationale

A cap at twelve months' fees ties the vendor's exposure to a year of revenue from the customer. A year is the period on which the vendor prices its service and buys its insurance. The vendor can then offer the same terms to every customer without its total exposure growing faster than its revenue. Counting fees "payable" as well as fees "paid" protects the customer from a very low cap when a claim arises early in the contract.

## When it holds

A cap at twelve months' fees usually holds when the contract is on the vendor's paper, the customer is small or mid-market, the data is not highly sensitive, and the vendor offers a separate super-cap (a higher cap for named claims) for data protection breaches. It also holds where the customer cannot show a realistic loss that would exceed a year's fees.

## What it costs

For the customer, a cap at twelve months' fees can leave a serious data breach or a failed implementation largely uncompensated. Those losses can be many times the annual fee. For the vendor, holding the position against an enterprise customer can slow the sale. It may also need concessions elsewhere, such as a higher super-cap or wider carve-outs.

## Fallback from and to

A vendor reaches the twelve-month cap by falling back from its opening position: the fees paid in the previous six or twelve months, without the word "payable". When the customer will not accept twelve months, the vendor's next step is a cap at twenty-four months' fees. That is usually the vendor's floor.
