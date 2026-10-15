import assert from 'node:assert/strict';
import { copyFile, lstat, mkdir, readdir, rm } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runChecks } from './check.mjs';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(projectRoot, 'dist');
const inputs = ['index.html', 'src', 'public'];

// Copy exact bytes in a stable order. Symlinks are rejected so a build never
// includes files from outside the explicitly selected source directories.
async function copyTree(source, target) {
  const info = await lstat(source);
  assert.ok(!info.isSymbolicLink(), `Build input is a symlink: ${relative(projectRoot, source)}`);
  if (info.isDirectory()) {
    await mkdir(target, { recursive: true });
    const entries = (await readdir(source)).sort();
    for (const entry of entries) await copyTree(join(source, entry), join(target, entry));
  } else {
    assert.ok(info.isFile(), `Unsupported build input: ${relative(projectRoot, source)}`);
    await copyFile(source, target);
  }
}

await runChecks();
// Validate required inputs before replacing this project's generated output.
for (const input of inputs) {
  const info = await lstat(join(projectRoot, input));
  assert.ok(!info.isSymbolicLink(), `Build input is a symlink: ${input}`);
}
assert.equal(dirname(output), projectRoot);
assert.equal(relative(projectRoot, output), 'dist');
await rm(output, { recursive: true, force: true });
await mkdir(output);
for (const input of inputs) await copyTree(join(projectRoot, input), join(output, input));
console.log('Build complete: dist/ contains the static app (index.html, src/, public/).');
const { buildStandalone } = await import('./standalone.mjs');
await buildStandalone(join(output, 'Passerelle.html'));
console.log('Offline demo included: dist/Passerelle.html (open directly in a browser).');
