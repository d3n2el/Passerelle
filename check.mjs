import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectionCopy } from '../src/connections.js';
import { locales } from '../src/i18n.js';
import { generateChecklist, getComplexity } from '../src/checklist.js';
import { emptyShipment, sampleShipment } from '../src/domain.js';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

async function scriptsIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    const path = join(directory, entry.name);
    assert.ok(!entry.isSymbolicLink(), `Do not follow a source symlink: ${relative(projectRoot, path)}`);
    if (entry.isDirectory()) files.push(...await scriptsIn(path));
    else if (/\.(?:js|mjs)$/.test(entry.name)) files.push(path);
  }
  return files;
}

function localeShape(value, path = '') {
  assert.ok(value !== null, `Null localization value at ${path}`);
  if (typeof value === 'string') {
    assert.ok(value.trim(), `Empty localization string at ${path}`);
    return 'string';
  }
  if (Array.isArray(value)) return value.map((entry, index) => localeShape(entry, `${path}[${index}]`));
  assert.equal(typeof value, 'object', `Unexpected localization type at ${path}`);
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, localeShape(value[key], `${path}.${key}`)]));
}

function checkLocalizedRules() {
  const baseline = sampleShipment();
  const scenarios = [emptyShipment(), baseline, sampleShipment('regulated')];
  for (const category of ['general', 'food', 'plant', 'animal', 'cosmetics', 'chemicals', 'electronics', 'toys', 'medical', 'other', 'unsure']) {
    scenarios.push({ ...baseline, category });
  }
  for (const destinationArea of ['gb', 'ni', 'unknown']) scenarios.push({ ...baseline, destinationArea });
  for (const override of [{ incoterm: 'DDP' }, { importer: 'seller' }, { preferentialOrigin: 'yes' }, { hsCode: '', originCountry: 'unknown' }]) {
    scenarios.push({ ...baseline, ...override });
  }
  for (const scenario of scenarios) {
    const translated = {};
    for (const lang of ['fr', 'en']) {
      const items = generateChecklist(scenario, lang);
      assert.ok(items.length, `Checklist must not be empty (${lang})`);
      assert.equal(new Set(items.map((item) => item.id)).size, items.length, 'Checklist IDs must be unique');
      for (const item of items) {
        for (const key of ['id', 'title', 'description', 'reason', 'nextStep', 'category', 'kind']) {
          assert.equal(typeof item[key], 'string', `${item.id}.${key} must be text (${lang})`);
          assert.ok(item[key].trim(), `${item.id}.${key} must not be blank (${lang})`);
        }
        assert.ok(['high', 'medium', 'normal'].includes(item.priority), `${item.id} priority`);
        assert.ok(['todo', 'check'].includes(item.status), `${item.id} must not automatically be approved`);
        if (item.source) {
          const url = new URL(item.source.url);
          assert.equal(url.protocol, 'https:');
          assert.ok(['www.gov.uk', 'www.douane.gouv.fr'].includes(url.hostname), `${item.id} official source host`);
          assert.ok(item.source.title?.trim(), `${item.id} source title`);
        }
      }
      const complexity = getComplexity(scenario, lang);
      assert.ok(['review', 'check', 'standard'].includes(complexity.level));
      assert.ok(complexity.title?.trim() && complexity.description?.trim());
      translated[lang] = items.map(({ id, priority, status }) => ({ id, priority, status }));
    }
    assert.deepEqual(translated.fr, translated.en, 'Switching language must preserve checklist decisions');
  }
  return scenarios.length;
}

export async function runChecks() {
  const files = [join(projectRoot, 'server.mjs'), ...await scriptsIn(join(projectRoot, 'integrations')), ...await scriptsIn(join(projectRoot, 'src')), ...await scriptsIn(join(projectRoot, 'scripts'))];
  for (const file of files) {
    try {
      execFileSync(process.execPath, ['--check', file], { encoding: 'utf8', stdio: 'pipe' });
    } catch (error) {
      throw new Error(`Syntax check failed: ${relative(projectRoot, file)}\n${error.stderr || error.message}`);
    }
  }
  assert.deepEqual(Object.keys(locales).sort(), ['en', 'fr']);
  assert.deepEqual(localeShape(locales.fr, 'fr'), localeShape(locales.en, 'en'), 'French and English locale keys/types differ');
  assert.deepEqual(localeShape(connectionCopy.fr),localeShape(connectionCopy.en));
  const scenarios = checkLocalizedRules();
  console.log(`Checks passed: ${files.length} JavaScript files; FR/EN locale key and type parity; ${scenarios} bilingual checklist scenarios.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await runChecks();
}
