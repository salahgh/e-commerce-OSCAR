// Entry for `node --import ./scripts/node-test/register.mjs --test`.
// Node 22 strips TypeScript types natively but never guesses file extensions,
// so this registers a resolver that maps extensionless relative imports and
// the `@/` alias onto their .ts sources. No bundler, no extra dependencies.
import { register } from 'node:module';

register('./resolve-ts.mjs', import.meta.url);
