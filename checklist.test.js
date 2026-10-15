import test from 'node:test';
import assert from 'node:assert/strict';
import { generateChecklist, getComplexity, SOURCES, RULE_VERSION, CONTENT_REVIEWED_AT } from '../src/checklist.js';

const prepared = {
  destinationArea: 'gb', experience: 'repeat', category: 'general', hsCode: '940360',
  originCountry: 'FR', preferentialOrigin: 'no', incoterm: 'DAP', importer: 'buyer',
  exporterEori: 'yes', importerEori: 'yes', dutyMode: 'illustrative', vatMode: 'illustrative',
  vatTreatment: 'border', transportCost: '100', brokerFee: '50',
};
const ids = (data) => generateChecklist(data).map((item) => item.id);

test('core preparation remains present for a well-described repeated shipment', () => {
  const items = ids(prepared);
  for (const id of ['classification', 'origin', 'responsibilities', 'invoice-packing', 'customs-preparation', 'transport', 'valuation-rates', 'vat-treatment']) {
    assert.ok(items.includes(id), id);
  }
  assert.ok(!items.includes('company-registration'));
  assert.ok(!items.includes('product-review'));
  assert.ok(!items.includes('missing-costs'));
  assert.equal(getComplexity(prepared).level, 'standard');
  assert.match(getComplexity(prepared, 'en').description, /does not validate/);
});

test('all regulated and uncertain categories get a specialist prompt', () => {
  for (const category of ['food', 'plant', 'animal', 'cosmetics', 'chemicals', 'electronics', 'toys', 'medical', 'other', 'unsure', undefined, 'unexpected']) {
    const shipment = { ...prepared, category };
    const item = generateChecklist(shipment, 'en').find((entry) => entry.id === 'product-review');
    assert.equal(item.priority, 'high', category);
    assert.equal(item.kind, 'Specialist review', category);
    assert.match(item.nextStep, /specialist/);
    assert.equal(getComplexity(shipment).level, 'review', category);
  }
  assert.ok(ids({ ...prepared, regulated: true }).includes('product-review'));
});

test('Northern Ireland and unknown destination never inherit a GB customs and VAT checklist', () => {
  for (const destinationArea of ['ni', 'unknown', undefined]) {
    const shipment = { ...prepared, destinationArea };
    const items = ids(shipment);
    assert.ok(items.includes('route-review'));
    assert.ok(!items.includes('customs-preparation'));
    assert.ok(!items.includes('vat-treatment'));
    assert.equal(getComplexity(shipment).level, 'review');
    assert.match(generateChecklist(shipment, 'en')[0].description, /different framework/);
  }
});

test('unknown origin, classification and responsibilities remain actionable', () => {
  const shipment = { ...prepared, hsCode: '', originCountry: 'unknown', importer: 'unknown', incoterm: 'unknown' };
  const items = generateChecklist(shipment);
  for (const id of ['classification', 'origin', 'missing-responsibilities']) {
    assert.equal(items.find((item) => item.id === id).priority, 'high');
  }
  assert.equal(getComplexity(shipment).level, 'check');
  for (const originCountry of ['EU', 'other']) {
    assert.equal(generateChecklist({ ...prepared, originCountry }).find((item) => item.id === 'origin').priority, 'high');
  }
});

test('first shipments and missing EORI details trigger company setup', () => {
  for (const override of [{ experience: 'first' }, { exporterEori: 'no' }, { importerEori: 'unknown' }]) {
    assert.ok(ids({ ...prepared, ...override }).includes('company-registration'));
  }
});

test('DDP or the French seller acting as importer triggers specialist review', () => {
  for (const override of [{ incoterm: 'DDP' }, { importer: 'seller' }]) {
    const shipment = { ...prepared, ...override };
    assert.ok(ids(shipment).includes('seller-importer'));
    assert.equal(getComplexity(shipment).level, 'review');
  }
});

test('claimed preferential origin adds verification instead of approval', () => {
  const shipment = { ...prepared, preferentialOrigin: 'yes' };
  const item = generateChecklist(shipment, 'en').find((entry) => entry.id === 'preferential-origin');
  assert.equal(item.status, 'check');
  assert.match(item.description, /does not establish eligibility/);
  assert.ok(!ids(prepared).includes('preferential-origin'));
  assert.ok(!ids({ ...prepared, preferentialOrigin: 'unknown' }).includes('preferential-origin'));
});

test('zero fees are known but blank, missing or unknown fees remain missing', () => {
  assert.ok(!ids({ ...prepared, transportCost: '0', brokerFee: '0' }).includes('missing-costs'));
  assert.ok(!ids({ ...prepared, transportCost: 0, brokerFee: 0 }).includes('missing-costs'));
  for (const value of ['', undefined, null, 'unknown']) {
    assert.ok(ids({ ...prepared, transportCost: value }).includes('missing-costs'));
    assert.ok(ids({ ...prepared, brokerFee: value }).includes('missing-costs'));
  }
});

test('French and English have identical rules, complete copy and stable identifiers', () => {
  const shipment = { ...prepared, category: 'food', incoterm: 'DDP', experience: 'first', preferentialOrigin: 'yes', transportCost: '' };
  const fr = generateChecklist(shipment, 'fr');
  const en = generateChecklist(shipment, 'en');
  assert.deepEqual(fr.map((item) => item.id), en.map((item) => item.id));
  assert.equal(new Set(fr.map((item) => item.id)).size, fr.length);
  for (let index = 0; index < fr.length; index += 1) {
    for (const key of ['title', 'description', 'reason', 'nextStep', 'category', 'kind']) {
      assert.ok(fr[index][key].length > 0);
      assert.ok(en[index][key].length > 0);
      if (key !== 'category') assert.notEqual(fr[index][key], en[index][key]);
    }
    assert.ok(['todo', 'check'].includes(fr[index].status));
  }
  assert.deepEqual(generateChecklist(shipment, 'unsupported'), fr);
});

test('output is deterministic, prioritized and does not mutate inputs', () => {
  const shipment = Object.freeze({ ...prepared, category: 'unsure', importer: 'unknown' });
  const first = generateChecklist(shipment);
  assert.deepEqual(first, generateChecklist(shipment));
  assert.deepEqual(shipment, { ...prepared, category: 'unsure', importer: 'unknown' });
  const priorityOrder = { high: 0, medium: 1, normal: 2 };
  const priorities = first.map((item) => priorityOrder[item.priority]);
  assert.deepEqual(priorities, [...priorities].sort());
  first[0].source.title = 'Changed by caller';
  assert.notEqual(generateChecklist(shipment)[0].source.title, 'Changed by caller');
});

test('empty input is safe and source metadata identifies maintained guidance', () => {
  assert.ok(generateChecklist().length > 0);
  assert.equal(getComplexity().level, 'review');
  assert.match(RULE_VERSION, /^prep-/);
  assert.equal(CONTENT_REVIEWED_AT, '2026-10-08');
  for (const source of Object.values(SOURCES)) {
    assert.match(source.url, /^https:\/\/www\.(gov\.uk|douane\.gouv\.fr)\//);
  }
});
