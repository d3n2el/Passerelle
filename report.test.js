import test from 'node:test';
import assert from 'node:assert/strict';
import { contactReport, escapeHtml, shipmentReport } from '../src/report.js';
import { emptyShipment, sampleShipment, RULE_CONFIG } from '../src/domain.js';
import { CONTENT_REVIEWED_AT, generateChecklist, RULE_VERSION } from '../src/checklist.js';
import { tr, date, money } from '../src/i18n.js';

const fixedDate = '2026-10-08T09:00:00.000Z';

test('HTML escaping handles all text and quoted attribute delimiters', () => {
  assert.equal(escapeHtml(`<script x="a&b">'value'</script>`), '&lt;script x=&quot;a&amp;b&quot;&gt;&#39;value&#39;&lt;/script&gt;');
  assert.equal(escapeHtml(null), '');
});

test('shipment report preserves the selected language, illustrative labels and every estimate line', () => {
  for (const lang of ['fr', 'en']) {
    const t = tr(lang);
    const data = sampleShipment();
    const html = shipmentReport(data, lang, {}, fixedDate);
    assert.ok(html.startsWith('<!doctype html>'));
    assert.ok(html.includes(`<html lang="${lang}">`));
    for (const text of [t.reportTitle, t.sampleBanner, t.boundary, t.totalDefinition, t.cashDefinition, t.vatHelp, t.baseHelp, t.assumptionAlert, t.dutyRate, t.customsBase, t.vatRate, t.vatBase, t.formula, t.border, ...Object.values(t.lineLabels)]) {
      assert.ok(html.includes(escapeHtml(text)), text);
    }
    assert.ok(html.includes(escapeHtml(money(6614.64, 'EUR', lang))));
    assert.ok(html.includes(escapeHtml(money(5512.2, 'EUR', lang))));
    assert.ok(html.includes(RULE_CONFIG.version));
    assert.ok(html.includes(RULE_VERSION));
    assert.ok(html.includes(date(CONTENT_REVIEWED_AT, lang)));
    assert.ok(!html.includes('undefined'));
    assert.ok(!html.includes('NaN'));
    assert.doesNotMatch(html, /<script|<link|<iframe|<img/i);
    assert.match(html, /@media print/);
    assert.match(html, /@page/);
  }
});

test('report includes input details and translated enums without rendering optional blanks', () => {
  const data = { ...sampleShipment(), company: '', originCountry: 'other', plannedDate: '2026-11-04', preferentialOrigin: 'yes' };
  const html = shipmentReport(data, 'en', {}, fixedDate);
  assert.ok(html.includes(tr('en').originOther));
  assert.ok(html.includes(tr('en').DAP));
  assert.ok(html.includes(tr('en').buyer));
  assert.ok(html.includes(tr('en').road));
  assert.ok(html.includes('4 November 2026'));
  assert.ok(html.includes('691390'));
  assert.ok(html.includes('69002'));
  assert.ok(html.includes('BS1 4ST'));
  assert.ok(!html.includes(`<dt>${tr('en').company}</dt>`));
  assert.ok(!html.includes('>originOther<'));
  assert.ok(!html.includes('>illustrative<'));
});

test('incomplete and regulated reports preserve unknown amounts and specialist next steps', () => {
  const t = tr('en');
  const html = shipmentReport(sampleShipment('regulated'), 'en', {}, fixedDate);
  for (const text of [t.knownSubtotal, t.subtotalDefinition, t.incomplete, t.notCalculated, t.hsCode, t.originCountry, t.productCaution, t.dutyUnknownReason]) {
    assert.ok(html.includes(escapeHtml(text)), text);
  }
  assert.ok(html.includes('Have the product rules reviewed'));
  assert.ok(html.includes(money(2805, 'EUR', 'en')));
  const ni = shipmentReport({ ...sampleShipment(), destinationArea: 'ni' }, 'en', {}, fixedDate);
  assert.ok(ni.includes(escapeHtml(t.routeCaution)));
  assert.ok(ni.includes('Get this route reviewed'));
});

test('VAT timing is visible and never silently changes the tax-inclusive total', () => {
  const t = tr('en');
  const html = shipmentReport({ ...sampleShipment(), vatTreatment: 'postponed' }, 'en', {}, fixedDate);
  for (const text of [t.postponed, t.vatExcluded, t.pvaHelp, t.totalDefinition, money(6614.64, 'EUR', 'en'), money(5512.2, 'EUR', 'en')]) {
    assert.ok(html.includes(escapeHtml(text)), text);
  }
});

test('checklist export retains user statuses, reasons, next steps and original source links', () => {
  const data = sampleShipment();
  const html = shipmentReport(data, 'en', { classification: 'complete', origin: 'na' }, fixedDate);
  assert.ok(html.includes('Status: Complete'));
  assert.ok(html.includes('Status: Not applicable'));
  for (const item of generateChecklist(data, 'en')) {
    for (const text of [item.title, item.reason, item.nextStep]) assert.ok(html.includes(escapeHtml(text)), text);
    if (item.source) assert.ok(html.includes(`href="${escapeHtml(item.source.url)}"`));
  }
});

test('shipment export escapes hostile user text and excludes unapproved contact properties', () => {
  const payload = `<img src=x onerror="alert('unsafe')">&`;
  const data = { ...sampleShipment(), company: payload, description: payload, originPostcode: payload, contact: { email: 'private@example.com' }, email: 'private@example.com' };
  const html = shipmentReport(data, 'en', { classification: payload }, fixedDate);
  assert.ok(html.includes(escapeHtml(payload)));
  assert.ok(!html.includes(payload));
  assert.ok(!html.includes('private@example.com'));
  assert.doesNotMatch(html, /<img|<script/i);
  assert.ok(html.includes('Status: Check'));
});

test('contact note is bilingual, explicit about manual sharing and limited to a minimal shipment reference', () => {
  const contact = { name: 'Camille Dupont', email: 'camille@example.com', company: 'Demo SARL', language: 'fr', note: 'Please review the importer.', consent: true };
  const data = { ...sampleShipment(), originPostcode: 'PRIVATE-POSTCODE', hsCode: '999999', goodsValue: '987654.32' };
  for (const lang of ['fr', 'en']) {
    const t = tr(lang);
    const html = contactReport(contact, data, lang, fixedDate);
    for (const text of [t.contactFileTitle, t.contactConsent, t.contactSuccess, t.contactText, t.contactSuccessText, t.boundary, t.contactReference, t.contactLanguage, t.sampleBanner, 'Français', 'Camille Dupont', 'camille@example.com', 'Demo SARL', data.description, data.company]) {
      assert.ok(html.includes(escapeHtml(text)), text);
    }
    assert.ok(html.includes(`<html lang="${lang}">`));
    assert.ok(!html.includes('PRIVATE-POSTCODE'));
    assert.ok(!html.includes('999999'));
    assert.ok(!html.includes('987654.32'));
    assert.ok(!html.includes('undefined'));
    assert.doesNotMatch(html, /<script|<link|<iframe|<img/i);
  }
});

test('contact export escapes every free-text field and never claims consent when absent', () => {
  const payload = `</dd><script>alert("x&y")</script><dd>'`;
  const contact = { name: payload, email: payload, company: payload, language: 'bad', note: payload, consent: false };
  const html = contactReport(contact, { ...emptyShipment(), company: payload, description: payload }, 'en', 'invalid');
  assert.ok(html.includes(escapeHtml(payload)));
  assert.ok(!html.includes(payload));
  assert.doesNotMatch(html, /<script/i);
  assert.ok(!html.includes(escapeHtml(tr('en').contactConsent)));
  assert.ok(html.includes(`<p>${tr('en').no}</p>`));
});
