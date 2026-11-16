import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const APP_DIR = path.dirname(new URL(import.meta.url).pathname);
const ROOT_DIR = path.resolve(APP_DIR, '..');

test('TEST.VIDEO.ChromaWaveform manifest validation', () => {
  const manifestPath = path.join(ROOT_DIR, 'display.json');
  assert.ok(fs.existsSync(manifestPath), 'display.json must exist');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.name, "Chroma Waveform & Saturation Monitor");
  assert.equal(manifest.group, "Test & Measurement");
  assert.ok(manifest.app.includes('index.html'), 'Manifest must target index.html');
});

test('TEST.VIDEO.ChromaWaveform entrypoint exists', () => {
  const htmlPath = path.join(ROOT_DIR, 'index.html');
  const jsPath = path.join(ROOT_DIR, 'js', 'app.js');
  assert.ok(fs.existsSync(htmlPath), 'index.html entrypoint must exist');
  assert.ok(fs.existsSync(jsPath), 'js/app.js script must exist');
});
