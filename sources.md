# Product assumptions and content review

## Project evidence

All three supplied project documents were read before implementation:

- **europ business group project-3(2).pdf**: the pre-broker preparation gap; owners or office managers in companies with roughly 5–50 employees; bilingual support; a free cost calculator as the entry point; product rules as a specialist boundary.
- **europ business group project-4(2).pdf**: the PESTEL analysis highlights changing rules, shipment-specific preparation, customs valuation, and the distinction between VAT cash flow and permanent costs.
- **europ business group project-5(2).pdf**: the customer gains/pains reinforce time savings, lower administrative stress, accessible support and entering a new market.

These are **project/customer hypotheses**, not proof of demand, tested willingness to pay, validated competitor pricing or current legal requirements. The app does not repeat the documents’ market statistics. The original universal 20% import VAT assumption is deliberately not a rule in the estimator. The proposed broker partnership is not presented as an existing referral network. This release focuses on French sellers shipping B2B physical goods to the UK; the normal estimation route is Great Britain. Northern Ireland triggers a separate review and no automatic import tax calculation.

## Authoritative sources checked

Content/link check date: **2026-10-08**. Checklist configuration: **prep-2026.10.08.1**. This records the implementation review, not a legal review, tariff update, source publication date, guarantee of completeness or future effective date. Official guidance can change. Only narrow preparation points were incorporated; consult the live source and a qualified specialist for the actual shipment.

| Source | Use in this MVP | Deliberate boundary |
| --- | --- | --- |
| [GOV.UK: Import goods into the UK](https://www.gov.uk/import-goods-into-uk) | General import preparation, classification and product checks; distinguishes Great Britain from EU–Northern Ireland movements. | No automatic declaration, licence or certificate determination. |
| [GOV.UK: Finding commodity codes](https://www.gov.uk/guidance/finding-commodity-codes-for-imports-or-exports) | Ask users to confirm product classification with technical information. | Entered HS/code text is not validated against a tariff. |
| [GOV.UK: Introduction to UK–EU rules of origin](https://www.gov.uk/guidance/introduction-to-rules-of-origin-and-claiming-duties-when-trading-between-the-uk-and-eu) | Origin is separate from dispatch; tariff preference needs relevant origin rules and evidence. | French dispatch, stated French origin or a “yes” answer never creates automatic zero duty. |
| [GOV.UK: Customs valuation](https://www.gov.uk/government/collections/working-out-the-customs-value-of-your-imported-goods) | Ask for review of calculation bases and adjustments. | Invoice value is not automatically treated as the statutory customs value. |
| [GOV.UK: Postponed VAT accounting](https://www.gov.uk/guidance/check-when-you-can-account-for-import-vat-on-your-vat-return) | VAT payment timing and recovery depend on the importer’s circumstances; postponed accounting is conditional. | Selecting postponed treatment is an illustrative assumption, not an eligibility decision. No universal VAT rate. |
| [GOV.UK: Customs representation](https://www.gov.uk/guidance/appoint-someone-to-deal-with-customs-on-your-behalf) | Agree responsibilities and what an appointed agent needs; flag seller-as-importer for review. | The app does not appoint an agent or decide representation/registration obligations. |
| [Douane française: EORI registration](https://www.douane.gouv.fr/demarche/enregistrer-votre-entreprise-aupres-de-la-douane-numero-eori) | Prepare company identifiers and check EORI information. | No identifier lookup, automatic validation or assertion that a given user is registered. |
| [GOV.UK: Northern Ireland movements](https://www.gov.uk/guidance/trading-and-moving-goods-in-and-out-of-northern-ireland) | Refer Northern Ireland and uncertain UK routes to a specialist. | No blanket use of the Great Britain import workflow for EU–Northern Ireland shipments. |

The [French customs Brexit FAQ](https://www.douane.gouv.fr/fiche/brexit-entreprises-vos-questions-les-plus-frequentes) was also read for context and navigation. It contains historical implementation material. Historical deadlines, number formats, code lengths and operational promises were not copied into rules.

The French and English strings are interface/preparation copy written for this MVP. They are not official translations of legislation or government guidance, and have not had professional regulatory translation review. Official links retain their original source language.

## Operational boundary and upkeep

A **live HMRC commodity-reference lookup** was added on 9 October 2026. It displays source measures separately and does not select applicable duty/VAT rates. There is no freight, exchange-rate or automatic broker-referral integration. The estimator has no product-specific legal reasoning. Numerical assumptions supplied in an illustrative scenario remain assumptions even when a commodity code is entered. Selecting a general product category does not prove that the product is unregulated.

Checklist rules are deterministic in `src/checklist.js`. Each item explains why it appears and asks for a safe next step. Status starts at “to do” or “check”; users can record their own completion. The output is not a certificate of compliance and does not claim any document is universally legally required. Product categories, uncertain categories, DDP, seller-as-importer and non-GB routes produce conservative review prompts.

Before operational deployment, nominate a customs content owner to review rules and translations, set a periodic review cadence, agree supported routes and product scopes, and integrate a licensed, maintained tariff source with auditable classification, origin, valuation and effective-date handling. Recheck the official sources and refresh both the review date and configuration version when content changes. Add shipment edge cases to tests for each material rule change.

## Integration update — 9 October 2026

Read the current official [Trade Tariff API guide](https://docs.trade-tariff.service.gov.uk/the-trade-tariff-api.html) and its commodity endpoint documentation. The adapter uses the documented public `www.trade-tariff.service.gov.uk/uk/api/commodities/{10-digit-code}` route with the v2 Accept header. Managed OAuth access is implemented from the same documentation and requires operator-provided credentials. The official example commodity lookup returned HTTP 200 and 63 import measures in a live server-side test. No measurement, tariff expression or country group is automatically interpreted as applicable to a user's shipment.

The [HMRC customs-agent register](https://www.gov.uk/guidance/list-of-customs-agents-and-fast-parcel-operators) and [BIFA member search](https://bifa.org/membership/member-search/search-results/) were checked and linked for direct discovery. Their inclusion is not a partnership, endorsement or agreement to handle a request. The interface clearly distinguishes public directories from a real referral network.
