import { calculate, parseNumber, RULE_CONFIG } from './domain.js';
import { generateChecklist, getComplexity, CONTENT_REVIEWED_AT, RULE_VERSION } from './checklist.js';
import { tr, money, date, number } from './i18n.js';

/** Escape every value inserted into a text node or quoted HTML attribute. */
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character]));
}

const e = escapeHtml;
const hasValue = value => value !== null && value !== undefined && String(value).trim() !== '';
const supportedLanguage = lang => lang === 'en' ? 'en' : 'fr';
const validStatuses = new Set(['todo', 'check', 'complete', 'na']);
const monetaryFields = new Set(['goodsValue', 'transportCost', 'brokerFee', 'otherCost', 'customsBase', 'vatBase']);
const numericFields = new Set(['quantity', 'weight', 'length', 'width', 'height']);
const rateFields = new Set(['dutyRate', 'vatRate']);
const enumFields = new Set(['destinationArea', 'experience', 'category', 'originCountry', 'preferentialOrigin', 'incoterm', 'importer', 'exporterEori', 'importerEori', 'transportMode', 'dutyMode', 'vatMode', 'vatTreatment']);
const inputFields = [
  'company', 'originPostcode', 'destinationPostcode', 'destinationArea', 'experience',
  'description', 'category', 'hsCode', 'originCountry', 'preferentialOrigin',
  'quantity', 'goodsValue', 'currency', 'weight', 'length', 'width', 'height',
  'incoterm', 'importer', 'exporterEori', 'importerEori', 'plannedDate', 'transportMode',
  'transportCost', 'brokerFee', 'otherCost', 'dutyMode', 'dutyRate', 'customsBase',
  'vatMode', 'vatRate', 'vatBase', 'vatTreatment',
];

function displayDate(value, lang) {
  return hasValue(value) && !Number.isNaN(new Date(value).getTime()) ? date(value, lang) : tr(lang).unknown;
}

function enumLabel(field, value, t) {
  let key = value;
  if (field === 'originCountry' && value === 'other') key = 'originOther';
  if ((field === 'dutyMode' || field === 'vatMode') && value === 'unknown') key = 'leaveUnknown';
  return typeof t[key] === 'string' ? t[key] : t.unknown;
}

function displayValue(field, value, data, lang) {
  const t = tr(lang);
  if (enumFields.has(field)) return enumLabel(field, value, t);
  if (field === 'plannedDate') return displayDate(value, lang);
  const parsed = parseNumber(value);
  if (monetaryFields.has(field) && parsed !== null) return money(parsed, data.currency, lang);
  if (numericFields.has(field) && parsed !== null) return number(parsed, lang);
  if (rateFields.has(field) && parsed !== null) return `${number(parsed, lang)} %`;
  return String(value);
}

const row = (label, value) => `<div class="detail-row"><dt>${e(label)}</dt><dd>${e(value)}</dd></div>`;
const paragraph = value => `<p>${e(value)}</p>`;

function route(data, t) {
  return `${t.france} → ${t.uk} · ${enumLabel('destinationArea', data.destinationArea, t)}`;
}

export const reportStyles = `
  :root{color-scheme:light;font-family:Arial,Helvetica,sans-serif;color:#172e2b;background:#eef3f0}
  *{box-sizing:border-box}body{margin:0;font-size:14px;line-height:1.55}
  main{max-width:900px;margin:32px auto;background:#fff;padding:44px 52px;border:1px solid #d9e3dc}
  h1,h2,h3,p{margin-top:0}h1{font-size:29px;line-height:1.2;margin-bottom:14px}
  h2{font-size:21px;line-height:1.3;margin-bottom:14px}h3{font-size:16px;line-height:1.4;margin-bottom:8px}
  p{margin-bottom:10px}header{border-bottom:3px solid #24584b;padding-bottom:22px;margin-bottom:26px}
  .brand{font-size:18px;font-weight:700;letter-spacing:.02em;margin-bottom:12px}
  .meta{color:#4a5d58;font-size:12px}.meta p{margin:3px 0}section{margin-top:28px}
  .notice,.caution,.summary{padding:16px 20px;border:1px solid #b9cdc2;border-radius:8px;background:#f0f6f2}
  .caution{background:#fbf5e8;border-color:#dcc68b}.notice p:last-child,.caution p:last-child,.summary p:last-child{margin-bottom:0}
  .summary{margin-top:18px}.amount{font-size:26px;font-weight:700;margin:6px 0 10px;font-variant-numeric:tabular-nums}
  .line-list,.details{margin:0}.line-row,.detail-row{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:18px;padding:9px 0;border-bottom:1px solid #e1e8e3}
  dt{font-weight:600}dd{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}.line-row dd{text-align:right;font-variant-numeric:tabular-nums}
  .kind{display:block;color:#4a5d58;font-size:12px;font-weight:400}.formula{padding:12px 16px;background:#f6f8f6;border-left:3px solid #8cae9e;margin-top:14px}
  .formula .details .detail-row{grid-template-columns:minmax(0,1.2fr) minmax(0,1fr)}
  .checklist{list-style:none;padding:0;margin:0}.check-item{padding:18px 0;border-bottom:1px solid #cedbd2;break-inside:avoid;page-break-inside:avoid}
  .check-meta{font-size:12px;color:#405b51;margin-bottom:7px}.check-item p{margin-bottom:8px}
  .check-item strong{font-weight:600}.status{display:inline-block;border:1px solid #a1b9ad;border-radius:4px;padding:2px 7px;margin:0 0 10px}
  a{color:#21594b;text-decoration:underline;overflow-wrap:anywhere}.source{font-size:12px}.source-url{display:block;font-size:11px;overflow-wrap:anywhere}
  ul{padding-left:20px}li{margin-bottom:5px}footer{margin-top:28px;padding-top:16px;border-top:1px solid #cedbd2;font-size:12px;color:#405b51}
  @media(max-width:600px){main{margin:0;padding:26px 20px;border:0}.line-row,.detail-row{gap:10px}.detail-row{grid-template-columns:1fr}.line-row{grid-template-columns:minmax(0,1.2fr) minmax(0,1fr)}h1{font-size:25px}}
  @page{size:A4;margin:16mm}
  @media print{body{background:#fff;font-size:10pt;line-height:1.45}main{max-width:none;margin:0;padding:0;border:0}h1{font-size:23pt}h2{font-size:15pt}h3{font-size:12pt}h1,h2,h3{break-after:avoid;page-break-after:avoid}section{margin-top:18px}.notice,.caution,.summary,.formula,.detail-row,.line-row{break-inside:avoid;page-break-inside:avoid}.check-item{padding:12px 0}a{color:inherit}.meta,.source{font-size:9pt}.source-url{font-size:8pt}p{orphans:3;widows:3}}
`;

function documentHtml(title, lang, content) {
  return `<!doctype html>
<html lang="${supportedLanguage(lang)}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="referrer" content="no-referrer"><title>${e(title)} — Passerelle</title><style>${reportStyles}</style></head>
<body><main>${content}</main></body></html>`;
}

function taxAssumption(data, result, type, lang) {
  const t = tr(lang);
  const duty = type === 'duty';
  const rateField = duty ? 'dutyRate' : 'vatRate';
  const baseField = duty ? 'customsBase' : 'vatBase';
  const modeField = duty ? 'dutyMode' : 'vatMode';
  const line = result.lines[type];
  const base = hasValue(data[baseField]) ? displayValue(baseField, data[baseField], data, lang) : t.kindLabels.unknown;
  const rate = hasValue(data[rateField]) ? displayValue(rateField, data[rateField], data, lang) : t.kindLabels.unknown;
  return `<div class="formula"><h3>${e(duty ? t.dutyHeading : t.vatHeading)} · ${e(t.toConfirm)}</h3>
    <dl class="details">${row(t[modeField], enumLabel(modeField, data[modeField], t))}${row(t[baseField], base)}${row(t[rateField], rate)}</dl>
    ${line.amount === null ? paragraph(t.notCalculated) : `<p><strong>${e(t.formula)}:</strong> ${e(base)} × ${e(rate)} = ${e(money(line.amount, data.currency, lang))}</p>`}
    ${paragraph(duty ? t.dutyHelp : t.vatHelp)}${duty && line.amount === null ? paragraph(t.dutyUnknownReason) : ''}
  </div>`;
}

/** A self-contained, printable shipment report. Contact data is intentionally excluded. */
export function shipmentReport(data, lang, statuses = {}, calculatedAt = new Date().toISOString()) {
  lang = supportedLanguage(lang);
  const t = tr(lang);
  const result = calculate(data);
  const items = generateChecklist(data, lang);
  const complexity = getComplexity(data, lang);
  const inputs = inputFields.filter(field => hasValue(data[field])).map(field => row(t[field], displayValue(field, data[field], data, lang))).join('');
  const lines = Object.entries(result.lines).map(([key, line]) => `<div class="line-row"><dt>${e(t.lineLabels[key])}<span class="kind">${e(t.kindLabels[line.kind])}${line.kind === 'illustrative' ? ` · ${e(t.toConfirm)}` : ''}</span></dt><dd>${line.amount === null ? e(t.notCalculated) : e(money(line.amount, data.currency, lang))}</dd></div>`).join('');
  const checklist = items.map(item => {
    const status = validStatuses.has(statuses[item.id]) ? statuses[item.id] : item.status;
    return `<li class="check-item"><div class="check-meta">${e(t.priority[item.priority])} · ${e(item.category)} · ${e(item.kind)}</div>
      <h3>${e(item.title)}</h3><div class="status">${e(t.statusLabel)}: ${e(t.status[status])}</div>
      ${paragraph(item.description)}<p><strong>${e(t.reason)}:</strong> ${e(item.reason)}</p><p><strong>${e(t.nextAction)}:</strong> ${e(item.nextStep)}</p>
      ${item.source ? `<p class="source">${e(t.officialSource)}: <a href="${e(item.source.url)}" rel="noreferrer">${e(item.source.title)}</a><span class="source-url">${e(item.source.url)}</span></p>` : ''}</li>`;
  }).join('');

  const body = `<header><div class="brand">Passerelle</div><h1>${e(t.reportTitle)}</h1><p>${e(route(data, t))}</p>
    <div class="meta"><p>${e(t.calculatedOn)}: ${e(displayDate(calculatedAt, lang))}</p><p>${e(t.configuration)}: ${e(RULE_CONFIG.version)} / ${e(RULE_VERSION)}</p><p>${e(t.contentReview)}: ${e(displayDate(CONTENT_REVIEWED_AT, lang))}</p></div></header>
    ${data.sample ? `<aside class="caution">${paragraph(t.sampleBanner)}</aside>` : ''}
    <section><h2>${e(t.estimateTitle)}</h2><p>${e(result.total === null ? t.incomplete : t.scenario)} · ${e(t.illustrativeRates)}</p><dl class="line-list">${lines}</dl>
      <div class="summary"><h3>${e(result.total === null ? t.knownSubtotal : t.estimatedTotal)}</h3><p class="amount">${e(money(result.total ?? result.subtotal, data.currency, lang))}</p>${paragraph(result.total === null ? t.subtotalDefinition : t.totalDefinition)}${result.total === null ? paragraph(t.totalDefinition) : ''}</div>
      <div class="summary"><h3>${e(t.cashOutlay)}</h3>${result.cashOutlay === null ? paragraph(t.cashUnknown) : `<p class="amount">${e(money(result.cashOutlay, data.currency, lang))}</p>`}${paragraph(t.cashDefinition)}${result.vatExcluded ? paragraph(t.vatExcluded) : ''}<p><strong>${e(t.vatTreatment)}:</strong> ${e(enumLabel('vatTreatment', data.vatTreatment, t))}</p>${paragraph(t.pvaHelp)}</div>
    </section>
    <section><h2>${e(t.includedTitle)}</h2>${paragraph(t.includedText)}</section>
    <section><h2>${e(t.assumptionsTitle)}</h2><div class="caution">${paragraph(t.assumptionAlert)}${paragraph(t.baseHelp)}</div>${taxAssumption(data, result, 'duty', lang)}${taxAssumption(data, result, 'vat', lang)}
      <h3>${e(t.missingTitle)}</h3>${result.missing.length ? `${paragraph(t.missingText)}<ul>${result.missing.map(field => `<li>${e(t[field] || t.toConfirm)}</li>`).join('')}</ul>` : paragraph(t.noMissing)}
    </section>
    <section class="caution"><h2>${e(complexity.title)}</h2>${paragraph(complexity.description)}${data.destinationArea !== 'gb' ? paragraph(t.routeCaution) : ''}${data.category !== 'general' ? paragraph(t.productCaution) : ''}${data.incoterm === 'DDP' || data.importer === 'seller' ? paragraph(t.sellerCaution) : ''}</section>
    <section><h2>${e(t.reportInputs)}</h2><dl class="details">${inputs}</dl></section>
    <section><h2>${e(t.checklistTitle)}</h2>${paragraph(t.checklistText)}<ol class="checklist">${checklist}</ol></section>
    <section class="notice">${paragraph(t.boundary)}${paragraph(t.noLegalTotal)}</section>
    <footer>${paragraph(t.reportNotice)}${paragraph(t.sourceOriginal)}</footer>`;
  return documentHtml(t.reportTitle, lang, body);
}

/** Manual handoff note; never embeds costs, EORI information, or a full shipment file. */
export function contactReport(contact, data, lang, preparedAt = new Date().toISOString()) {
  lang = supportedLanguage(lang);
  const t = tr(lang);
  const languageName = contact.language === 'fr' ? t.languageFrench : contact.language === 'en' ? t.languageEnglish : t.unknown;
  const details = [
    ['contactName', contact.name], ['contactEmail', contact.email], ['contactCompany', contact.company],
    ['contactLanguage', languageName], ['contactNote', contact.note],
  ].filter(([, value]) => hasValue(value)).map(([key, value]) => row(t[key], value)).join('');
  const reference = [
    ...(hasValue(data.company) ? [row(t.company, data.company)] : []),
    ...(hasValue(data.description) ? [row(t.description, data.description)] : []),
    row(t.yourRoute, route(data, t)),
  ].join('');
  const body = `<header><div class="brand">Passerelle</div><h1>${e(t.contactFileTitle)}</h1><p class="meta">${e(t.contactPreparedAt)}: ${e(displayDate(preparedAt, lang))}</p></header>
    <div class="notice">${paragraph(t.contactText)}${paragraph(t.contactSuccess)}${paragraph(t.contactSuccessText)}</div>
    <section><dl class="details">${details}</dl></section>
    <section><h2>${e(t.contactConsentRecorded)}</h2>${paragraph(contact.consent === true ? t.contactConsent : t.no)}</section>
    <section><h2>${e(t.contactReference)}</h2><dl class="details">${reference}</dl>${data.sample ? `<div class="caution">${paragraph(t.sampleBanner)}</div>` : ''}</section>
    <section class="notice">${paragraph(t.boundary)}</section><footer>${paragraph(t.reportNotice)}</footer>`;
  return documentHtml(t.contactFileTitle, lang, body);
}
