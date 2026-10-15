import test from 'node:test';
import assert from 'node:assert/strict';
import { RULE_CONFIG, emptyShipment, sampleShipment, parseNumber, validateStep, calculate } from '../src/domain.js';

test('configuration contains no universal tariff or VAT rate', () => {
  assert.equal(RULE_CONFIG.rates, null);
  assert.ok(RULE_CONFIG.version);
  assert.ok(RULE_CONFIG.date);
});

test('strict numeric parsing permits local decimal separators, zero, and whitespace', () => {
  for (const [value, expected] of [['12,50', 12.5], ['12.50', 12.5], ['0', 0], [' .5 ', 0.5], ['-1', -1]]) {
    assert.equal(parseNumber(value), expected);
  }
  for (const value of ['', ' ', null, undefined, '1,234.56', '1 000', '1e3', '5 euros', 'Infinity', 'NaN', '0x20', '1.0000001', '1000000001', {}, []]) {
    assert.equal(parseNumber(value), null, String(value));
  }
});

test('required goods validation and unsure paths do not force invented details', () => {
  const shipment = emptyShipment();
  assert.deepEqual(validateStep(shipment, 0), {});
  assert.deepEqual(validateStep(shipment, 1), { description: 'required', quantity: 'required', goodsValue: 'required' });
  Object.assign(shipment, { description: 'Unknown product', quantity: '2', goodsValue: '100', destinationArea: 'unknown' });
  for (const step of [0, 1, 2, 3]) assert.deepEqual(validateStep(shipment, step), {});
  assert.equal(calculate(shipment).lines.duty.amount, null);
  assert.equal(calculate(shipment).lines.vat.amount, null);
});

test('validation rejects malformed, negative, excessive, and zero positive inputs', () => {
  const shipment = { ...sampleShipment(), quantity: '0', goodsValue: '-5', weight: '10kg', width: '-1', hsCode: '123' };
  assert.deepEqual(validateStep(shipment, 1), { quantity: 'positive', goodsValue: 'positive', weight: 'number', width: 'positive', hsCode: 'hsCode' });
  assert.deepEqual(validateStep({ ...shipment, transportCost: '-1', brokerFee: 'x' }, 2), { transportCost: 'nonnegative', brokerFee: 'number' });
  assert.deepEqual(validateStep({ ...shipment, dutyRate: '101', customsBase: '', vatRate: '-1', vatBase: 'x' }, 3), {
    dutyRate: 'rate', customsBase: 'required', vatRate: 'nonnegative', vatBase: 'number',
  });
});

test('standard sample arithmetic is explicit, deterministic and correctly rounded', () => {
  const shipment = sampleShipment();
  for (const step of [0, 1, 2, 3]) assert.deepEqual(validateStep(shipment, step), {});
  const result = calculate(shipment);
  assert.equal(result.lines.goods.amount, 4800);
  assert.equal(result.lines.duty.amount, 307.2);
  assert.equal(result.lines.vat.amount, 1102.44);
  assert.equal(result.total, 6614.64);
  assert.equal(result.cashOutlay, 6614.64);
  assert.equal(result.lines.duty.kind, 'illustrative');
  assert.equal(result.lines.vat.kind, 'illustrative');
  assert.equal(result.lines.transport.kind, 'entered');
  assert.deepEqual(result.missing, []);
  assert.deepEqual(calculate(shipment), result);
  assert.equal(shipment.sample, true);
});

test('decimal half-up arithmetic avoids binary floating-point errors', () => {
  const shipment = { ...sampleShipment(), goodsValue: '1.005', transportCost: '0.1', brokerFee: '0.2', otherCost: '0', customsBase: '0.10', dutyRate: '5', vatBase: '0,10', vatRate: '15' };
  const result = calculate(shipment);
  assert.equal(result.lines.goods.amount, 1.01);
  assert.equal(result.lines.duty.amount, 0.01);
  assert.equal(result.lines.vat.amount, 0.02);
  assert.equal(result.total, 1.34);
});

test('unknown classification, origin, rates or bases never yield a precise duty', () => {
  for (const changes of [{ hsCode: '' }, { hsCode: 'abcdef' }, { originCountry: 'unknown' }, { originCountry: 'other' }, { originCountry: 'EU' }, { dutyMode: 'unknown' }, { dutyRate: '' }, { dutyRate: '101' }, { customsBase: '' }, { customsBase: '-1' }]) {
    const result = calculate({ ...sampleShipment(), ...changes });
    assert.equal(result.lines.duty.amount, null, JSON.stringify(changes));
    assert.equal(result.total, null);
    assert.equal(result.cashOutlay, null);
    assert.ok(result.lines.duty.missing.length);
  }
});

test('preferential origin belief never silently applies a zero duty rate', () => {
  for (const preferentialOrigin of ['yes', 'no', 'unknown']) {
    assert.equal(calculate({ ...sampleShipment(), preferentialOrigin }).lines.duty.amount, 307.2);
    assert.equal(calculate({ ...sampleShipment(), preferentialOrigin, dutyMode: 'unknown' }).lines.duty.amount, null);
  }
});

test('Northern Ireland and unidentified destination suspend tax calculation', () => {
  for (const destinationArea of ['ni', 'unknown']) {
    const result = calculate({ ...sampleShipment(), destinationArea });
    assert.equal(result.lines.duty.amount, null);
    assert.equal(result.lines.vat.amount, null);
    assert.equal(result.total, null);
    assert.ok(result.missing.includes('destinationArea'));
  }
});

test('VAT never defaults to twenty percent or derives a base from an Incoterm', () => {
  for (const changes of [{ vatMode: 'unknown' }, { vatRate: '' }, { vatBase: '' }, { vatRate: 'foo' }, { vatBase: '-1' }]) {
    const result = calculate({ ...sampleShipment(), ...changes });
    assert.equal(result.lines.vat.amount, null);
    assert.equal(result.total, null);
  }
  assert.equal(calculate({ ...sampleShipment(), vatRate: '5', vatBase: '1000', incoterm: 'DDP' }).lines.vat.amount, 50);
  assert.equal(calculate({ ...sampleShipment(), vatRate: '0' }).lines.vat.amount, 0);
});

test('unknown costs stay unknown; only known values contribute to the subtotal', () => {
  const result = calculate({ ...emptyShipment(), goodsValue: '100', transportCost: '20' });
  assert.equal(result.subtotal, 120);
  assert.equal(result.total, null);
  assert.equal(result.lines.broker.amount, null);
  assert.equal(result.lines.other.amount, null);
  assert.ok(result.missing.includes('brokerFee'));
  assert.ok(result.missing.includes('otherCost'));
  assert.equal(calculate({ ...sampleShipment(), transportCost: '' }).total, null);
});

test('postponed accounting is a separate explicit cash timing assumption', () => {
  const postponed = calculate({ ...sampleShipment(), vatTreatment: 'postponed' });
  assert.equal(postponed.total, 6614.64);
  assert.equal(postponed.cashOutlay, 5512.2);
  assert.equal(postponed.vatExcluded, true);
  const unknownTiming = calculate({ ...sampleShipment(), vatTreatment: 'unknown' });
  assert.equal(unknownTiming.total, 6614.64);
  assert.equal(unknownTiming.cashOutlay, null);
  assert.ok(unknownTiming.missing.includes('vatTreatment'));
  const unknownVat = calculate({ ...sampleShipment(), vatTreatment: 'postponed', vatMode: 'unknown' });
  assert.equal(unknownVat.total, null);
  assert.equal(unknownVat.cashOutlay, 5512.2);
});

test('sample regulated shipment is incomplete and does not imply tariff certainty', () => {
  const shipment = sampleShipment('regulated');
  assert.equal(shipment.category, 'food');
  assert.equal(shipment.sample, true);
  const result = calculate(shipment);
  assert.equal(result.lines.duty.amount, null);
  assert.equal(result.lines.vat.amount, null);
  assert.equal(result.total, null);
  assert.equal(result.subtotal, 2805);
});

test('language is not a calculation input and calculation never mutates user data', () => {
  const shipment = Object.freeze(sampleShipment());
  assert.deepEqual(calculate({ ...shipment, language: 'fr' }), calculate({ ...shipment, language: 'en' }));
  calculate(shipment);
  assert.equal(shipment.goodsValue, '4800');
});

test('all enum inputs reject unsupported values while preserving explicit unsure paths', () => {
  const fieldsByStep = [
    ['destinationArea', 'experience'],
    ['category', 'currency', 'originCountry', 'preferentialOrigin'],
    ['incoterm', 'importer', 'exporterEori', 'importerEori', 'transportMode'],
    ['dutyMode', 'vatMode', 'vatTreatment'],
  ];
  for (const [step, fields] of fieldsByStep.entries()) {
    for (const field of fields) {
      for (const invalid of ['', 'unexpected', null]) {
        const errors = validateStep({ ...sampleShipment(), [field]: invalid }, step);
        assert.equal(errors[field], 'required', `${field}: ${invalid}`);
      }
    }
  }
  const unknown = { ...emptyShipment(), description: 'Sample', quantity: '1', goodsValue: '1', destinationArea: 'unknown' };
  for (const step of [0, 1, 2, 3]) assert.deepEqual(validateStep(unknown, step), {});
});

test('optional shipment dates validate actual calendar dates, including leap years', () => {
  for (const plannedDate of ['', '2026-10-08', '2028-02-29', '2000-02-29']) {
    assert.deepEqual(validateStep({ ...sampleShipment(), plannedDate }, 2), {});
  }
  for (const plannedDate of ['2026-02-29', '2026-02-31', '1900-02-29', '2026-04-31', '2026-13-01', '2026-00-01', '2026-01-00', '0000-01-01', '2026-1-1', '10/08/2026', '2026-10-08T12:00:00Z']) {
    assert.deepEqual(validateStep({ ...sampleShipment(), plannedDate }, 2), { plannedDate: 'date' }, plannedDate);
  }
});
