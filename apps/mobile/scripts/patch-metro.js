/**
 * Patch @expo/metro-config@55.0.11 bug: metro-transform-worker.js
 * calls `transformer.rtransform()` but the babel transformer exports `transform()`.
 * This fixes the typo until the upstream package is updated.
 */
const fs = require('fs');
const path = require('path');

const file = path.join(
  __dirname,
  '..',
  'node_modules',
  '@expo',
  'metro-config',
  'build',
  'transform-worker',
  'metro-transform-worker.js'
);

if (!fs.existsSync(file)) {
  console.log('[patch-metro] metro-transform-worker.js not found, skipping.');
  process.exit(0);
}

let content = fs.readFileSync(file, 'utf8');

if (content.includes('transformer.rtransform(')) {
  content = content.replace('transformer.rtransform(', 'transformer.transform(');
  fs.writeFileSync(file, content, 'utf8');
  console.log('[patch-metro] Fixed transformer.rtransform -> transformer.transform');
} else {
  console.log('[patch-metro] Already patched or not needed.');
}
