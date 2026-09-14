#!/usr/bin/env node
// Removes zero-byte files (and the entry directories they leave empty) from
// Next.js's on-disk image cache, `<app>/.next/cache/images/<key>/<file>`.
//
// Why: a process killed mid-write (e.g. PM2's SIGKILL after kill_timeout) can
// leave an empty cache file behind. Next.js ≤ 16.2 fed that 0 size into its
// disk LRU on boot, the LRU threw, and from then on EVERY image cache write
// failed — each `_next/image` request was re-encoded from scratch until the
// process ran out of memory (incident of 2026-08-31 → 2026-09-14).
//
// Used two ways:
//   1. As a Node preload before `next start` (see ecosystem.config.cjs):
//        node --require deploy/scripts/clean-image-cache.cjs next start
//      → cleans `process.cwd()/.next/cache/images` in-process, no extra PID.
//   2. From the CLI / deploy.sh with an explicit app directory:
//        node deploy/scripts/clean-image-cache.cjs apps/frontend
//
// Never throws: a failure here must not stop the server from starting.
'use strict';

const fs = require('fs');
const path = require('path');

function cleanImageCache(appDir) {
  const cacheDir = path.join(appDir, '.next', 'cache', 'images');
  let entries;
  try {
    entries = fs.readdirSync(cacheDir);
  } catch {
    return 0; // no cache yet — nothing to do
  }

  let removed = 0;
  for (const key of entries) {
    const dir = path.join(cacheDir, key);
    let files;
    try {
      if (!fs.statSync(dir).isDirectory()) continue;
      files = fs.readdirSync(dir);
    } catch {
      continue;
    }
    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        if (fs.statSync(filePath).size === 0) {
          fs.rmSync(filePath, { force: true });
          removed++;
        }
      } catch {
        // unreadable file: leave it, Next.js skips entries it cannot read
      }
    }
    try {
      if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
    } catch {
      // ignore
    }
  }

  if (removed > 0) {
    console.warn(`[clean-image-cache] removed ${removed} zero-byte file(s) from ${cacheDir}`);
  }
  return removed;
}

const isCli = require.main === module;
const appDir = isCli && process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();

try {
  const removed = cleanImageCache(appDir);
  if (isCli) console.log(`[clean-image-cache] ${appDir}: ${removed} zero-byte file(s) removed`);
} catch (err) {
  console.warn('[clean-image-cache] skipped:', err && err.message);
}

module.exports = cleanImageCache;
