# Passerelle

A bilingual, guest-first preparation assistant for French businesses planning B2B goods shipments to the United Kingdom. It turns a small set of shipment details into a transparent indicative estimate, a tailored preparation checklist, and a locally recorded specialist-contact request.

**This MVP has a live HMRC tariff-reference lookup. It does not automatically select applicable rates or determine legal, customs, tax, origin, or product-compliance outcomes.** It does not file declarations, book transport, or contact a broker. Rates and valuation bases are user-entered illustrative assumptions. Missing information remains visibly missing.

## Try the demo

Extract the delivery archive and open **Passerelle.html** in a current desktop or mobile browser. This self-contained file includes the full application and needs no installation. Local-file draft storage may be restricted by a browser; the app reports that and remains usable in the current tab.

For development, use the modular sources and the local server below. Rebuild the standalone demo with `npm run build`; the generated file is `dist/Passerelle.html`.

## Run locally

Use Node.js 22 or newer. The application has no runtime npm dependencies.

```sh
npm run dev
```

Open <http://localhost:3000>. The development server listens on `0.0.0.0`, allowing previews from the surrounding development environment.

```sh
npm test
npm run check
npm run build
```

- `test` runs calculation, validation, checklist, report, server and controller/render integration tests using Node's built-in test runner. The controller harness does not simulate browser layout.
- `check` checks JavaScript syntax and localization consistency.
- `build` produces a static deployable application in `dist/`, plus `dist/Passerelle.html`, a self-contained offline demo. Serve `dist/` at a web origin root (asset paths are root-relative).

Browser journey checks use Playwright. For a separate local checkout:

```sh
npm install --save-dev playwright
npx playwright install chromium
npm run test:e2e
```

The workspace can alternatively set `PLAYWRIGHT_MODULE` to an existing Playwright package path. Browser checks need the local application server running. Set `BASE_URL` to change the target; `CHROMIUM_EXECUTABLE` can select an installed Chromium executable. The suite uses isolated browser contexts with only fictional sample data. Test commands describe available checks, rather than asserting a result; see the delivery report for checks actually executed.

## Demo journey

1. Start in French, switch to English at any point, or try a clearly labelled sample shipment. A second sample illustrates regulated-goods caution.
2. Complete four short stages: company and route, goods, sale and transport, then calculation assumptions. Unknown answers are valid where specialist input may be needed.
3. Review separate goods, transport, duty, import VAT, clearance, and other-cost lines. A known subtotal replaces a misleading complete total when inputs are missing.
4. Review the prioritized checklist, reasons, questions to confirm, and complexity explanation. Change item statuses, edit the shipment, print, or download the standalone HTML report.
5. Prepare a specialist-contact note and download it as standalone HTML to send yourself to a professional of your choice. Contact details are held in current-tab memory, and the separate exported file is under your control; there is no live broker network or automatic transmission.

Language changes preserve entered data. Draft persistence is an explicit user action, and reset removes the saved shipment draft. Contact details are not stored in that draft.

## Stack and implementation choices

The provided workspace contained the three project PDFs and no existing application, package manifest, or framework conventions. Passerelle therefore uses native semantic HTML, CSS, and JavaScript ES modules, a small Node.js HTTP development server, and Node's built-in test runner. There is no framework compilation layer, database, account requirement, paid service, or external font dependency.

This stack keeps a small demo easy to run, inspect, and deploy as static files. The calculation engine, input validation, checklist rules, localization, and presentation are separated so that a reviewed rule or a tariff integration can be introduced without rewriting the user journey. A real backend should be added only when there is an agreed purpose for storing or transmitting shipment and contact data.

## Scope and estimation boundaries

- Direction is France to the UK. Standard estimates are limited to Great Britain; Northern Ireland and an uncertain UK destination receive a specialist-review path rather than a Great Britain calculation.
- Each estimate uses one selected currency throughout. There is no exchange-rate feed or currency conversion. Changing currency changes the denomination, so entered amounts must be checked.
- Transport, clearance, and other costs have no fabricated market defaults. Enter a known amount, explicitly enter zero if appropriate, or leave the amount unknown.
- Customs duty is not inferred from a category or French dispatch. An illustrative manual duty calculation requires a supplied rate and valuation base plus known classification and origin. The app does not validate the tariff classification or preferential-origin entitlement.
- Import VAT uses the rate and base explicitly entered by the user. Neither a universal 20% rate nor a universal valuation base is assumed. Zero is meaningful; a blank field is unknown.
- A total including estimated VAT is distinct from a possible cash-outlay view. Postponed accounting and potential recovery depend on the importing business and circumstances; selecting an assumption does not establish eligibility or recoverability.
- The estimate is a shipment-level illustration, not an allocation of charges to seller or buyer. The parties must confirm responsibility under the agreed sale terms.
- Regulated and uncertain product categories trigger a specialist check. There is no automatic compliance, safety, labelling, sanitary, or certification determination.
- Checklist completion is the user's preparation status, not approval to ship.

The report identifies its calculation date and configuration version. Official guidance links are recorded separately from the team's research assumptions in [docs/sources.md](docs/sources.md). Source verification concerns the linked guidance; it does not validate a shipment or provide live tariff data. The interpretation and French interface wording still require professional review before operational use.

## Privacy and security

The MVP processes shipment calculations in the browser. Its read-only `/api/tariff` endpoint sends only a user-requested 10-digit commodity code to HMRC. It has no analytics, third-party fonts, contact-delivery integration or database. The Node server serves the app and proxies HMRC reference lookups; production hosting still needs operational review.

Saving a draft writes shipment information to this browser's local storage. Reset removes it. The contact-interest form is held separately in tab memory and is not included in saved shipment drafts or shipment reports. Its separate HTML download contains the contact note and a minimal shipment reference for the user to transmit manually. Downloading or printing creates a file or printout under the user's control. Opening an official reference leaves the application for the source website.

Do not use a shared browser to retain commercially sensitive drafts. The privacy note explains the actual MVP behavior and does not claim a completed legal compliance review. Production operation needs an agreed retention policy, access controls, hosting/security review, and an explicit consent and transmission flow before any broker receives data.

## Project evidence and next steps

[docs/product-decisions.md](docs/product-decisions.md) maps product choices to all three supplied project documents and distinguishes hypotheses from verified guidance.

The most important operational next step is a customs-specialist review of the calculation model, valuation assumptions, checklist conditions, and translated copy. Then extend the HMRC reference lookup into a professionally reviewed shipment-specific rate-selection engine with effective dates, provenance and failure behavior; establish a content review owner and update cadence; and validate example shipments against broker-prepared cases. Any real introduction workflow needs a real partner, a defined service promise, and a transparent consent-based data-sharing process.

## Verification at delivery — 9 October 2026

- `npm test`: **48 passed**, including deterministic arithmetic, explicit unknowns, route/product rules, calendar dates, HTML escaping, report completeness, language-state preservation, consent invalidation after edits, draft reset, and static-server boundaries.
- `npm run check`: passed JavaScript syntax checks, French/English key/type parity, and 21 bilingual checklist scenarios. There is no TypeScript or ESLint configuration; this is a plain JavaScript project.
- `npm run build`: passed; modular static app and standalone HTML generated.
- `npm run test:e2e`: attempted, **blocked before tests ran** because the standard Chromium download was invalid. An alternative Chromium package installed, but its process exited with SIGTRAP before a page could open. The earlier remote browser attempt also timed out. No browser, mobile-layout, screenshot, or printed-page visual pass is claimed. The included five-journey Playwright suite is ready to run after browser installation.

Before a live demo or release, run that browser suite and review the desktop/mobile screenshots and print PDF in `tmp/qa/`. A customs professional must also review the model, source interpretation and translations before business reliance.

## Live tariff lookup and broker discovery — 9 October 2026

Run `npm run dev` to enable the read-only HMRC lookup in step 4. The standalone HTML and static-only hosting retain the estimator but cannot call the Node proxy. The lookup requires a complete 10-digit UK commodity code; it does not pad a six-digit sample code. It shows current GB import measures, geographical scopes, duty expressions, condition counts, exclusion lists, source links, retrieval time and adapter version. Measures are deliberately **not filtered by origin or applied to calculations**. Verify the full source, quotas, additional codes, conditions, classification and shipment-date treatment with a specialist. Live reference results are not included in the manual-scenario report.

The default uses HMRC's documented rate-limited public endpoint with `Accept: application/vnd.hmrc.2.0+json`. Successful lookups are cached for up to 24 hours (maximum 200 entries); uncached traffic is limited to one request per second per server process. Unknown codes, authentication failures, rate limits, malformed data and timeouts never become zero duty. A live adapter smoke test succeeded for HMRC's example commodity `0101210000`, returning 63 import measures. This proves connectivity/schema handling, not the applicability of any measure to a shipment.

For production, configure `TARIFF_CLIENT_ID` and `TARIFF_CLIENT_SECRET` as **server environment secrets** from the HMRC Developer Portal. Do not put them in client files or paste them into chat. The adapter uses the documented OAuth client-credentials endpoint, caches tokens, and refreshes once on a 401 response. Credentialed production access has contract tests but has not been live-tested without your account credentials. In an environment that requires an outbound proxy, use a compatible Node release and set `NODE_USE_ENV_PROXY=1` with your existing proxy settings.

The handoff now links to the verified HMRC customs-agent register and BIFA member directory. **These are real directories, not a contracted Passerelle referral network.** No broker has agreed to receive referrals, and no delivery endpoint or mailbox has been configured. A real network requires agreed partners, service coverage, recipient details, consent/data-sharing terms and a supported delivery integration. The app keeps manual contact-note export available until that exists.

Official integration documentation: <https://docs.trade-tariff.service.gov.uk/the-trade-tariff-api.html> (retrieved 9 October 2026). API adapter: `integrations/tariff.mjs`; bilingual connection copy and directory links: `src/connections.js`.
