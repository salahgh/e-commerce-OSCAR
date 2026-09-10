import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SRC_ROOT = new URL('../../src/', import.meta.url);
const CANDIDATES = ['.ts', '/index.ts'];

function hasExtension(pathname) {
  return /\.[a-z0-9]+$/i.test(pathname);
}

export async function resolve(specifier, context, nextResolve) {
  let target = specifier;
  if (target.startsWith('@/')) target = new URL(target.slice(2), SRC_ROOT).href;

  const isRelative = target.startsWith('./') || target.startsWith('../') || target.startsWith('file:');
  if (isRelative) {
    const [pathPart, query] = target.split('?');
    if (!hasExtension(pathPart)) {
      const base = pathPart.startsWith('file:') ? pathPart : new URL(pathPart, context.parentURL).href;
      for (const suffix of CANDIDATES) {
        const url = base + suffix;
        if (existsSync(fileURLToPath(url))) {
          return nextResolve(query ? `${url}?${query}` : url, context);
        }
      }
    }
  }

  return nextResolve(target, context);
}
