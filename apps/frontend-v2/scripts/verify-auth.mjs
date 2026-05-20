#!/usr/bin/env node
// Quick sanity check that the 4 newly built auth pages render.

import { spawn } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://localhost:3001';
const PROFILE = join(tmpdir(), 'oscar-verify-auth');

const cases = [
  { url: '/forgot-password', expectAny: ['Mot de passe oublié', 'Forgot password', 'نسيت كلمة المرور'] },
  { url: '/reset-password',  expectAny: ['Lien invalide', 'Invalid', 'رابط غير صالح'] },
  { url: '/reset-password?token=fake', expectAny: ['Nouveau mot de passe', 'New password', 'كلمة مرور جديدة'] },
  { url: '/verification-pending', expectAny: ['Vérifiez votre email', 'Verify your email', 'تحقق من بريدك'] },
  { url: '/verification-pending?email=test%40example.com', expectAny: ['test@example.com'] },
  { url: '/verify',  expectAny: ['Lien invalide', 'Invalid', 'رابط غير صالح'] },
  { url: '/verify?token=fake', expectAny: ['Vérification', 'Verification', 'التحقق', 'Le jeton', 'token', 'الرمز'] },
];

function dumpDom(url) {
  return new Promise((resolve, reject) => {
    const proc = spawn(CHROME, [
      '--headless=new', '--dump-dom', '--disable-gpu', '--no-first-run',
      '--disable-extensions', `--user-data-dir=${PROFILE}`,
      '--virtual-time-budget=8000', url,
    ], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    proc.stdout.on('data', (b) => (stdout += b.toString('utf8')));
    proc.on('error', reject);
    proc.on('close', () => resolve(stdout));
  });
}

function text(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
}

await rm(PROFILE, { recursive: true, force: true });
await mkdir(PROFILE, { recursive: true });

let pass = 0, fail = 0;
for (const c of cases) {
  const html = await dumpDom(`${BASE}${c.url}`);
  const t = text(html);
  const hit = c.expectAny.find((s) => t.includes(s));
  if (hit) {
    pass++;
    console.log(`✓ ${c.url.padEnd(50)} → "${hit}"`);
  } else {
    fail++;
    console.log(`✗ ${c.url.padEnd(50)} — none of ${JSON.stringify(c.expectAny)} found`);
    console.log(`    body preview: ${t.slice(0, 200).trim()}`);
  }
}
console.log(`\n${pass} / ${pass + fail} passed`);
process.exit(fail > 0 ? 1 : 0);
