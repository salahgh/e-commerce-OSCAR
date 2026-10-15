/**
 * One-off repair of the collection (category) tree through the admin API.
 *
 *   pnpm --filter @oscar/backoffice repair:collections            # dry run: prints the plan
 *   pnpm --filter @oscar/backoffice repair:collections -- --apply # executes it
 *
 * Environment:
 *   ADMIN_API_URL          default https://api.oscarfashion.dz/admin-api
 *   SUPERADMIN_USERNAME / SUPERADMIN_PASSWORD   or   ADMIN_TOKEN (a bearer token)
 *
 * The plan comes from src/lib/collection-repair.ts (unit-tested). Vendure
 * recomputes collection contents in a background job after each update, so
 * storefront counts catch up a little after the script finishes.
 */

import { planRepairs, type RepairAction, type RepairCollection } from '../src/lib/collection-repair';
import type { FilterArg, FilterInput } from '../src/lib/collection-filters';

const API = process.env.ADMIN_API_URL ?? 'https://api.oscarfashion.dz/admin-api';
const APPLY = process.argv.includes('--apply');

let token = process.env.ADMIN_TOKEN ?? '';

async function gql<T = any>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ query, variables }),
  });
  const fresh = res.headers.get('vendure-auth-token');
  if (fresh) token = fresh;
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('\n'));
  return json.data as T;
}

async function login() {
  if (token) return;
  const { SUPERADMIN_USERNAME: u, SUPERADMIN_PASSWORD: p } = process.env;
  if (!u || !p) throw new Error('Set ADMIN_TOKEN, or SUPERADMIN_USERNAME and SUPERADMIN_PASSWORD');
  const data = await gql<{ login: { __typename: string; message?: string } }>(
    `mutation($u:String!,$p:String!){ login(username:$u,password:$p){ __typename ... on ErrorResult { message } } }`,
    { u, p },
  );
  if (data.login.__typename !== 'CurrentUser') throw new Error(`Login failed: ${data.login.message}`);
  if (!token) throw new Error('Login succeeded but no vendure-auth-token header came back; is bearer auth enabled?');
}

async function fetchAll<T>(field: string, selection: string): Promise<T[]> {
  const items: T[] = [];
  for (let skip = 0; ; skip += 100) {
    const data = await gql<Record<string, { items: T[]; totalItems: number }>>(
      `{ ${field}(options:{take:100,skip:${skip}}) { totalItems items { ${selection} } } }`,
    );
    items.push(...data[field].items);
    if (items.length >= data[field].totalItems || data[field].items.length === 0) break;
  }
  return items;
}

async function main() {
  await login();

  const collections = await fetchAll<RepairCollection>(
    'collections',
    'id name slug parentId isPrivate inheritFilters filters { code args { name value } } translations { languageCode name slug description }',
  );
  const products = await fetchAll<{ id: string; enabled: boolean }>('products', 'id enabled');
  const existing = new Set(products.filter((p) => p.enabled).map((p) => p.id));

  const plan = planRepairs(collections, existing);

  console.log(`\n${collections.length} collections, ${existing.size} enabled products.\n`);
  console.log(`Plan: ${plan.actions.length} action(s)\n`);
  for (const a of plan.actions) {
    if (a.type === 'update-filters') {
      const ids = JSON.parse(
        a.filters.find((f: FilterInput) => f.code === 'product-id-filter')?.arguments.find((x: FilterArg) => x.name === 'productIds')?.value ?? '[]',
      );
      console.log(`  [filters]  ${a.name} (#${a.id}) -> ${ids.length} products: ${a.reason}`);
    } else if (a.type === 'stop-inheriting') {
      console.log(`  [no-inherit]  ${a.name} (#${a.id}): ${a.reason}`);
    } else if (a.type === 'set-private') {
      console.log(`  [${a.isPrivate ? 'hide' : 'publish'}]  ${a.name} (#${a.id}): ${a.reason}`);
    } else {
      console.log(`  [rename]   ${JSON.stringify(a.name)} (#${a.id}) -> ${JSON.stringify(a.translations.map((t: { name: string }) => t.name))}`);
    }
  }

  console.log(`\nReport only (needs a human):`);
  console.log(`  products in no collection: ${plan.report.productsInNoCollection.length}${plan.report.productsInNoCollection.length ? ' -> ids ' + plan.report.productsInNoCollection.join(', ') : ''}`);
  console.log(`  collections missing translations: ${plan.report.missingTranslations.length}`);
  for (const m of plan.report.missingTranslations) console.log(`    ${m.name} (#${m.id}): missing ${m.missing.join(', ')}`);

  if (!APPLY) {
    console.log('\nDry run. Re-run with --apply to execute.');
    return;
  }

  console.log('\nApplying...');
  let done = 0;
  for (const a of plan.actions) {
    await apply(a);
    done += 1;
    console.log(`  ${done}/${plan.actions.length} ${a.type} ${a.name}`);
  }
  console.log('\nDone. Vendure is now recomputing collection contents in the background.');
}

async function apply(a: RepairAction) {
  const input: Record<string, unknown> = { id: a.id };
  if (a.type === 'update-filters') input.filters = a.filters;
  if (a.type === 'set-private') input.isPrivate = a.isPrivate;
  if (a.type === 'stop-inheriting') input.inheritFilters = false;
  if (a.type === 'rename') input.translations = a.translations;
  await gql(`mutation($input: UpdateCollectionInput!) { updateCollection(input:$input) { id } }`, { input });
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
