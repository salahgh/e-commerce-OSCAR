#!/usr/bin/env node
// Drives `chrome --headless --dump-dom` against the dev server (port 3001)
// for each (locale, route) combo and runs targeted i18n assertions on the
// rendered HTML. Reports a punch-list of regressions.

import { spawn } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.BASE_URL ?? 'http://localhost:3001';
const PROFILE = join(tmpdir(), 'oscar-i18n-verify');

const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/login', name: 'login' },
  { path: '/register', name: 'register' },
  { path: '/products', name: 'products' },
  { path: '/cart', name: 'cart' },
];

const LOCALES = [
  {
    code: 'fr',
    prefix: '',
    dir: 'ltr',
    // Words that should appear on the page (any one)
    expects: {
      home: ['Collection 2026', 'OSCAR NAJAR', 'Acheter maintenant', 'Produits en vedette'],
      login: ['Connexion', 'Accédez à votre compte', 'Se souvenir de moi', 'Se connecter'],
      register: ['Créer un compte', 'Rejoignez OSCAR', 'Créer mon compte'],
      products: ['Tous les produits'],
      cart: ['Votre panier', 'Votre panier est vide'],
    },
    // Wrong-language leak detectors (these strings should NOT appear)
    wrongLeaks: ['Welcome to OSCAR', 'Sign in', 'Sign out', 'Shop now', 'Open menu', 'مرحبا', 'تسجيل الدخول', 'الرئيسية'],
  },
  {
    code: 'en',
    prefix: '/en',
    dir: 'ltr',
    expects: {
      home: ['Collection 2026', 'OSCAR NAJAR', 'Shop now', 'Featured products'],
      login: ['Sign in', 'OSCAR Najar account', 'Remember me'],
      register: ['Create account', 'Join OSCAR Najar', 'Create my account'],
      products: ['All products'],
      cart: ['Your cart', 'Your cart is empty'],
    },
    wrongLeaks: ['Bienvenue', 'Accédez à votre compte', 'Se connecter', 'Se souvenir', 'Acheter maintenant', 'Toutes les wilayas', 'مرحبا', 'تسجيل الدخول'],
  },
  {
    code: 'ar',
    prefix: '/ar',
    dir: 'rtl',
    expects: {
      home: ['تشكيلة 2026', 'OSCAR NAJAR', 'تسوّق الآن', 'منتجات مختارة'],
      login: ['تسجيل الدخول', 'OSCAR Najar', 'تذكّرني'],
      register: ['إنشاء حساب', 'انضم إلى OSCAR Najar'],
      products: ['كل المنتجات'],
      cart: ['سلة التسوق', 'سلتك فارغة', 'عرض المنتجات'],
    },
    wrongLeaks: ['Bienvenue', 'Connexion', 'Welcome to OSCAR', 'Sign in', 'Acheter maintenant', 'Shop now'],
  },
];

function dumpDom(url) {
  return new Promise((resolve, reject) => {
    const args = [
      '--headless=new',
      '--dump-dom',
      '--disable-gpu',
      '--no-first-run',
      '--disable-extensions',
      `--user-data-dir=${PROFILE}`,
      '--virtual-time-budget=8000',
      url,
    ];
    const proc = spawn(CHROME, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (b) => (stdout += b.toString('utf8')));
    proc.stderr.on('data', (b) => (stderr += b.toString('utf8')));
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code !== 0 && !stdout) reject(new Error(`chrome exit ${code}: ${stderr.slice(0, 500)}`));
      else resolve(stdout);
    });
  });
}

function htmlAttrs(html) {
  const m = html.match(/<html[^>]*>/);
  if (!m) return { lang: null, dir: null };
  const tag = m[0];
  const lang = tag.match(/\blang="([^"]*)"/)?.[1] ?? null;
  const dir = tag.match(/\bdir="([^"]*)"/)?.[1] ?? null;
  return { lang, dir };
}

function findMissingKeys(html) {
  // next-intl wraps missing keys in console errors but renders them as the raw key
  // path. Catch literal patterns like "Layout.header.openMenu" appearing as text.
  const patterns = [
    /\b(?:Layout|HomePage|ProductsPage|ProductPage|CartPage|NotFoundPage|TopBar|Cart|ProductCard|QuantityStepper|auth)\.[a-zA-Z.]+\b/g,
  ];
  const found = new Set();
  for (const pat of patterns) {
    let m;
    while ((m = pat.exec(html))) found.add(m[0]);
  }
  return [...found];
}

function htmlText(html) {
  // Strip tags + scripts/styles, decode common entities, collapse whitespace
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ');
}

async function verify() {
  await rm(PROFILE, { recursive: true, force: true });
  await mkdir(PROFILE, { recursive: true });

  const failures = [];
  let total = 0;

  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      total++;
      const url = `${BASE}${locale.prefix}${route.path}`;
      process.stdout.write(`▸ [${locale.code}] ${route.path.padEnd(12)} → ${url}\n`);
      let html;
      try {
        html = await dumpDom(url);
      } catch (err) {
        failures.push({ url, locale: locale.code, route: route.name, kind: 'fetch', detail: err.message });
        continue;
      }

      const { lang, dir } = htmlAttrs(html);
      const text = htmlText(html);

      // Assert <html lang>
      if (lang !== locale.code) {
        failures.push({ url, locale: locale.code, route: route.name, kind: 'lang', detail: `expected lang="${locale.code}", got lang="${lang}"` });
      }
      // Assert <html dir>
      if (dir !== locale.dir) {
        failures.push({ url, locale: locale.code, route: route.name, kind: 'dir', detail: `expected dir="${locale.dir}", got dir="${dir}"` });
      }
      // Assert at least one expected string
      const expects = locale.expects[route.name] ?? [];
      const matchedExpected = expects.filter((s) => text.includes(s));
      if (expects.length > 0 && matchedExpected.length === 0) {
        failures.push({ url, locale: locale.code, route: route.name, kind: 'missing-text', detail: `none of ${JSON.stringify(expects)} appeared in rendered text` });
      }
      // Assert wrong-language leaks
      const leaks = locale.wrongLeaks.filter((s) => text.includes(s));
      if (leaks.length > 0) {
        failures.push({ url, locale: locale.code, route: route.name, kind: 'wrong-language-leak', detail: `unexpected strings present: ${JSON.stringify(leaks)}` });
      }
      // Detect raw key paths
      const rawKeys = findMissingKeys(text);
      if (rawKeys.length > 0) {
        failures.push({ url, locale: locale.code, route: route.name, kind: 'raw-key-rendered', detail: `raw translation keys appeared as text: ${JSON.stringify(rawKeys)}` });
      }
    }
  }

  console.log('\n══════════════════════════════════════════════════════');
  console.log(`Result: ${total - failures.length} / ${total} checks passed`);
  if (failures.length === 0) {
    console.log('✅  All i18n verifications passed.');
  } else {
    console.log(`❌  ${failures.length} failure(s):\n`);
    for (const f of failures) {
      console.log(`  [${f.locale}] ${f.route.padEnd(10)} ${f.kind.padEnd(22)} ${f.detail}`);
      console.log(`      ${f.url}`);
    }
    process.exitCode = 1;
  }
}

verify().catch((err) => {
  console.error('verify failed:', err);
  process.exit(2);
});
