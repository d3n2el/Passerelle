/**
 * Deterministic, deliberately conservative shipment arithmetic.
 * No tariff lookup, exchange-rate feed, or legal eligibility decision exists here.
 * All tax rates and valuation bases must be supplied explicitly by the user.
 */
export const RULE_CONFIG = Object.freeze({
  version: '2026-10-mvp.1',
  date: '2026-10-08',
  rates: null,
  maxAmount: 1_000_000_000,
  maxRate: 100,
  maxDecimalPlaces: 6,
  rounding: 'half-up-to-currency-cent',
  supportedCalculationArea: 'gb',
});

export function emptyShipment() {
  return {
    company: '', originPostcode: '', destinationPostcode: '',
    destinationArea: 'gb', experience: 'first',
    description: '', category: 'unsure', hsCode: '',
    originCountry: 'unknown', preferentialOrigin: 'unknown',
    quantity: '', goodsValue: '', currency: 'EUR',
    weight: '', length: '', width: '', height: '',
    incoterm: 'unknown', importer: 'unknown', exporterEori: 'unknown', importerEori: 'unknown',
    plannedDate: '', transportMode: 'unknown', transportCost: '', brokerFee: '', otherCost: '',
    dutyMode: 'unknown', dutyRate: '', customsBase: '',
    vatMode: 'unknown', vatRate: '', vatBase: '', vatTreatment: 'unknown',
    sample: false,
  };
}

/** These are editable illustrations, never verified product codes or tariff rates. */
export function sampleShipment(kind = 'standard') {
  const standard = {
    ...emptyShipment(),
    company: 'Atelier des Rives', originPostcode: '69002', destinationPostcode: 'BS1 4ST',
    description: 'Vases décoratifs en céramique / Decorative ceramic vases',
    category: 'general', hsCode: '691390', originCountry: 'FR',
    quantity: '120', goodsValue: '4800', weight: '180', length: '120', width: '80', height: '110',
    incoterm: 'DAP', importer: 'buyer', exporterEori: 'yes', importerEori: 'unknown',
    transportMode: 'road', transportCost: '320', brokerFee: '85', otherCost: '0',
    dutyMode: 'illustrative', dutyRate: '6', customsBase: '5120',
    vatMode: 'illustrative', vatRate: '20', vatBase: '5512.20', vatTreatment: 'border',
    sample: true,
  };
  if (kind !== 'regulated') return standard;
  return {
    ...standard,
    company: 'Maison du Verger',
    description: 'Biscuits artisanaux avec ingrédients importés / Biscuits with imported ingredients',
    category: 'food', hsCode: '', originCountry: 'unknown', preferentialOrigin: 'unknown',
    quantity: '240', goodsValue: '2400', weight: '96',
    dutyMode: 'unknown', dutyRate: '', customsBase: '',
    vatMode: 'unknown', vatRate: '', vatBase: '', vatTreatment: 'unknown',
  };
}

const DECIMAL = /^[+-]?(?:\d+(?:[.,]\d{1,6})?|[.,]\d{1,6})$/;
const HS_CODE = /^(?:\d{6}|\d{8}|\d{10})$/;
const KNOWN_ORIGINS = new Set(['FR', 'GB', 'CN']);
const STEP_ENUMS = [
  { destinationArea: ['gb', 'ni', 'unknown'], experience: ['first', 'repeat'] },
  {
    category: ['general', 'food', 'plant', 'animal', 'cosmetics', 'chemicals', 'electronics', 'toys', 'medical', 'other', 'unsure'],
    currency: ['EUR', 'GBP'], originCountry: ['FR', 'GB', 'CN', 'other', 'unknown'],
    preferentialOrigin: ['yes', 'no', 'unknown'],
  },
  {
    incoterm: ['unknown', 'EXW', 'FCA', 'DAP', 'DDP'], importer: ['buyer', 'seller', 'unknown'],
    exporterEori: ['yes', 'no', 'unknown'], importerEori: ['yes', 'no', 'unknown'],
    transportMode: ['unknown', 'road', 'air', 'sea', 'rail'],
  },
  { dutyMode: ['unknown', 'illustrative'], vatMode: ['unknown', 'illustrative'], vatTreatment: ['unknown', 'border', 'postponed'] },
];
const blank = (value) => value == null || String(value).trim() === '';

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month - 1];
}

/** Decimal comma OR decimal point; never accept grouping, exponents, or partial parses. */
export function parseNumber(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const raw = String(value).trim();
  if (!DECIMAL.test(raw) || raw.length > 30) return null;
  const parsed = Number(raw.replace(',', '.'));
  return Number.isFinite(parsed) && Math.abs(parsed) <= RULE_CONFIG.maxAmount ? parsed : null;
}

function numericError(value, { required = false, positive = false, rate = false } = {}) {
  if (blank(value)) return required ? 'required' : null;
  const parsed = parseNumber(value);
  if (parsed === null) return 'number';
  if (positive && parsed <= 0) return 'positive';
  if (parsed < 0) return 'nonnegative';
  if (rate && parsed > RULE_CONFIG.maxRate) return 'rate';
  return null;
}

/** Validation uses stable message keys; language belongs exclusively to the UI. */
export function validateStep(data, step) {
  const errors = {};
  for (const [field, options] of Object.entries(STEP_ENUMS[step] || {})) {
    if (!options.includes(data[field])) errors[field] = 'required';
  }
  const checkNumber = (field, options) => {
    const error = numericError(data[field], options);
    if (error) errors[field] = error;
  };
  if (step === 1) {
    if (blank(data.description)) errors.description = 'required';
    checkNumber('quantity', { required: true, positive: true });
    checkNumber('goodsValue', { required: true, positive: true });
    for (const field of ['weight', 'length', 'width', 'height']) checkNumber(field, { positive: true });
    if (!blank(data.hsCode) && !HS_CODE.test(String(data.hsCode).trim())) errors.hsCode = 'hsCode';
  }
  if (step === 2) {
    for (const field of ['transportCost', 'brokerFee', 'otherCost']) checkNumber(field);
    if (!blank(data.plannedDate) && !validDate(data.plannedDate)) errors.plannedDate = 'date';
  }
  if (step === 3) {
    if (data.dutyMode === 'illustrative') {
      checkNumber('dutyRate', { required: true, rate: true });
      checkNumber('customsBase', { required: true });
    }
    if (data.vatMode === 'illustrative') {
      checkNumber('vatRate', { required: true, rate: true });
      checkNumber('vatBase', { required: true });
    }
  }
  return errors;
}

function decimalParts(value) {
  const raw = String(value).trim().replace(',', '.').replace(/^\+/, '');
  const [whole = '', decimals = ''] = raw.split('.');
  return { numerator: BigInt(`${whole || '0'}${decimals}`), denominator: 10n ** BigInt(decimals.length) };
}

function roundRatio(numerator, denominator) {
  // All calculation inputs are validated nonnegative before reaching this helper.
  return (2n * numerator + denominator) / (2n * denominator);
}

function moneyCents(value) {
  const { numerator, denominator } = decimalParts(value);
  return roundRatio(numerator * 100n, denominator);
}

const moneyNumber = (cents) => Number(cents) / 100;
const unknownLine = (missing) => ({ amount: null, kind: 'unknown', missing });

function enteredLine(data, field, positive = false) {
  if (blank(data[field]) || numericError(data[field], { positive })) return unknownLine([field]);
  return { amount: moneyNumber(moneyCents(data[field])), kind: 'entered', missing: [] };
}

function taxLine(data, type) {
  const isDuty = type === 'duty';
  const modeField = isDuty ? 'dutyMode' : 'vatMode';
  const rateField = isDuty ? 'dutyRate' : 'vatRate';
  const baseField = isDuty ? 'customsBase' : 'vatBase';
  const missing = [];
  if (data.destinationArea !== RULE_CONFIG.supportedCalculationArea) missing.push('destinationArea');
  if (data[modeField] !== 'illustrative') missing.push(modeField);
  if (isDuty) {
    if (!HS_CODE.test(String(data.hsCode ?? '').trim())) missing.push('hsCode');
    if (!KNOWN_ORIGINS.has(data.originCountry)) missing.push('originCountry');
  }
  if (data[modeField] === 'illustrative') {
    if (blank(data[rateField]) || numericError(data[rateField], { rate: true })) missing.push(rateField);
    if (blank(data[baseField]) || numericError(data[baseField])) missing.push(baseField);
  }
  if (missing.length) return unknownLine(missing);
  const base = moneyCents(data[baseField]);
  const rate = decimalParts(data[rateField]);
  const cents = roundRatio(base * rate.numerator, rate.denominator * 100n);
  return { amount: moneyNumber(cents), kind: 'illustrative', missing: [] };
}

/**
 * subtotal = sum of currently known lines, including estimated VAT if present.
 * total = all six lines, only when each is known; this is not a seller allocation.
 * cashOutlay = the same total with VAT omitted ONLY for user-selected postponed
 * accounting, whose eligibility must be confirmed externally. If VAT timing is
 * unknown, cashOutlay is unknown. No inference from Incoterm or EORI is made.
 */
export function calculate(data) {
  const lines = {
    goods: enteredLine(data, 'goodsValue', true),
    transport: enteredLine(data, 'transportCost'),
    duty: taxLine(data, 'duty'),
    vat: taxLine(data, 'vat'),
    broker: enteredLine(data, 'brokerFee'),
    other: enteredLine(data, 'otherCost'),
  };
  const sum = (entries) => moneyNumber(entries.reduce((cents, line) => cents + (line.amount === null ? 0n : moneyCents(line.amount)), 0n));
  const allLines = Object.values(lines);
  const subtotal = sum(allLines);
  const total = allLines.every((line) => line.amount !== null) ? subtotal : null;
  const vatExcluded = data.vatTreatment === 'postponed';
  const cashLines = vatExcluded ? [lines.goods, lines.transport, lines.duty, lines.broker, lines.other] : allLines;
  const timingKnown = ['border', 'postponed'].includes(data.vatTreatment);
  const cashOutlay = timingKnown && cashLines.every((line) => line.amount !== null) ? sum(cashLines) : null;
  const missing = [...new Set(allLines.flatMap((line) => line.missing))];
  if (!timingKnown) missing.push('vatTreatment');
  return { lines, subtotal, total, missing, cashOutlay, vatExcluded };
}
