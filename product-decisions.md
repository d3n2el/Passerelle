# Product decisions and evidence

## What was read

All three supplied documents were read before product decisions:

- `europ business group project-3(2).pdf`: the team's comparison of two venture ideas, including the France–UK import/export concept, customer, early competition analysis, commercial wedge, and team fit.
- `europ business group project-4(2).pdf`: the PESTEL analysis of France–UK B2B trade for September 2026–September 2028.
- `europ business group project-5(2).pdf`: the short customer profile with proposed gains and pains.

These are the source of the team's idea and initial assumptions. They are not a tariff database, a legal opinion, evidence of a functioning broker partnership, or a substitute for current official guidance.

## Evidence-to-product mapping

| Project source | Insight or assumption in the document | MVP decision |
| --- | --- | --- |
| Project 3, idea 1, problem and customer | Owners and office/sales managers in businesses with roughly 5–50 employees lack a customs specialist and face uncertainty before quoting or shipping. | A guest-first, four-stage preparation flow with ordinary language, optional company name, and explicit unknown answers. |
| Project 3, proposed angle | A free landed-cost calculator attracts users; a bilingual shipment-specific checklist helps before a broker. | Deliver both an indicative calculator and tailored FR/EN checklist without an account. Monetization is deferred so the demo proves the entire value proposition. |
| Project 3, origin and product rules | Imported ingredients/components complicate origin; incorrect product-rule advice creates legal risk. | Keep country of origin separate from dispatch; never infer preference. Regulated and uncertain categories produce questions for a specialist, not compliance verdicts. |
| Project 3, broker handoff | A partner broker would continue the process after preparation. | Collect a local contact-interest record with clear consent. No partner claims, outgoing messages, referrals, filing, or clearance promises. |
| Project 3, commercial research | Market statistics, competitor positioning, broker/translation fee ranges, and willingness to pay support the early concept. | Treat as research hypotheses. Do not use as landing-page claims, price guarantees, default fees, or evidence of current regulation. |
| Project 4, economic and legal analysis | VAT cash-flow treatment and customs valuation depend on the transaction and importer. | Separate duty and VAT, expose editable rates and bases, show missing amounts, and distinguish an inclusive total from a cash-outlay assumption. |
| Project 4, social analysis | A dense guide is hard to apply, and repeat exporters still need shipment-specific preparation. | Ask about first/repeat shipment; generate reasons and safe next questions from deterministic answer-based rules. |
| Project 4, technological and regulatory analysis | Structured input helps before formal digital customs processes; changing rules create maintenance risk. | Separate domain logic from UI and translations; identify calculation date, configuration version, and source-review provenance. No runtime LLM-generated obligations. |
| Project 4, environmental/product-related analysis | Food, agricultural, and other regulated goods can involve extra certification or checks. | Surface category caution and a specialist next step. Do not estimate unprovided inspection/certification costs or invent product requirements. |
| Project 5, gains and pains | Users want less time, stress, bureaucracy, and initial expense when exploring a market. | Immediate sample/demo access, short stages, visible next steps, plain explanations, editable results, and a portable report. |

## Deliberate scope choices

The founder's requested direction is France to the United Kingdom, despite the team's longer-term two-way idea. The MVP stores origin and destination distinctly, allowing a later route expansion without implying present support for UK-to-France trade.

Within the UK, Great Britain and Northern Ireland are distinguished. Great Britain is the estimate path; Northern Ireland or an unknown territory leads to specialist review. This is an explicit scope guard, not a conclusion that a particular Northern Ireland procedure applies.

The application is a preparation assistant. It neither replaces a customs broker nor sells customs declarations. The checklist is useful without promising that all obligations have been identified. User-marked completion indicates preparation progress only.

The initial app has no backend because the core value can be demonstrated with local deterministic processing. A contact record in the tab is honest and sufficient to demonstrate the final handoff intent until real partners and a transmission service exist.

## Project assumptions versus maintained facts

| Topic | Treatment in this MVP |
| --- | --- |
| “20% import VAT” in Project 3's concept description | Not adopted as a universal rate. VAT rate and base are explicit editable user assumptions; unknown remains unknown. |
| Shipping from France | Does not establish French/EU origin or preferential tariff entitlement. Origin and preference are separately collected and flagged for confirmation. |
| Goods value plus freight as a universal base | Not adopted. The user supplies valuation bases; the app makes the arithmetic transparent without deciding which costs belong in a legal base. |
| Customs and VAT requirements mentioned in Project 4 | General themes guide checklist questions. Applicable legal conclusions require current sources and sufficient shipment facts; the app avoids claiming a verified legal document list. |
| Postponed import VAT accounting | A selectable planning assumption, with eligibility and treatment to confirm. It does not automatically make VAT recoverable or a permanent saving. |
| Customs-barrier statistics and market size | Not republished as verified current facts. They remain team research assumptions requiring separate validation. |
| Competitor prices, strengths, and gaps | Not used as current commercial facts or marketing comparisons. |
| Willingness to pay and promised administrative savings | Hypotheses to test with target users, not validated outcomes or guarantees. |
| Partner network | Not configured. No endorsements or partner identity are invented. |
| Official references | Maintained in the dedicated source configuration and source notes with review dates. A checked reference is not a live rate or shipment-specific ruling. |

## Calculation policy

All entered monetary amounts share the selected currency. There is no silent FX conversion or transport-price engine. Sample amounts are explicitly illustrative and editable.

Blank, zero, calculated, user-entered, and confirmation-needed amounts are distinct states. A blank fee is not silently converted into free clearance. A missing duty rate is not zero duty. Unknown classification or origin prevents a precise duty result even when other amounts are available.

Duty and VAT arithmetic is deterministic and independently testable. Rates and valuation bases remain visible in the result and report. An incomplete estimate shows a known subtotal and what must be supplied, rather than a misleading final landed cost. The total is a shipment-level picture, not a statement that the seller or buyer will pay every line.

Changing a cost or shipment answer recomputes the result and the relevant checklist. Incoterm and importer answers identify responsibility questions without pretending that the app has reviewed the contract.

## Content and language policy

French is the default. English is a full interface option, and changing the interface language preserves shipment data. Monetary, numeric, and date displays use locale-aware formatting. Official references may remain in their source language.

Interface translations are product copy, not certified regulatory translations. A qualified reviewer should approve the legal meaning and limits of both language versions before the application is relied upon operationally.

Checklist items come from structured rules. Each presents its reason, preparation status, and safe next step. Product categories trigger caution; they do not produce invented labelling or certification instructions. Any future rule that asserts a specific legal obligation must carry a reviewed applicability condition, an official source, an effective date, and a review owner.

## Demo and acceptance focus

The standard sample demonstrates the estimate and checklist. The regulated sample demonstrates caution and specialist routing. Both show that all rates and amounts are examples rather than official tariff results.

Meaningful verification covers missing/unknown inputs, required-field validation, rounding and arithmetic, false-precision prevention, editable VAT assumptions, conditional checklist generation, French and English journeys, language-state preservation, printable/downloadable reporting, mobile layout, and key navigation. Actual executed checks belong in the delivery report; this document does not assert that unrun checks passed.

## What to validate next

1. Have a qualified customs practitioner review the supported transaction scope, valuation inputs, checklist logic, duty/VAT boundaries, and bilingual wording against representative shipments.
2. Integrate a maintained authoritative tariff source, including classification and origin dependencies, effective dates, review provenance, clear unsupported cases, and safe outage behavior.
3. Assign a named content owner and scheduled review process. Regulatory changes should produce a traceable configuration revision and targeted regression cases.
4. Test the flow with French owners and operations staff in 5–50-person businesses, including first exporters, repeat shippers, imported-component producers, and regulated categories.
5. Agree the real broker/specialist service and its data-sharing terms before enabling contact delivery. Add necessary backend security, retention, deletion, and access controls before collecting persistent personal information.
6. Validate demand and pricing separately. The team's free-calculator/paid-checklist hypothesis is intentionally not treated as a proven business model.
