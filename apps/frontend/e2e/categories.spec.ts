import { test, expect } from '@playwright/test';

/**
 * Verifies categories are backend-driven and unified through CategoryCircles,
 * and that the category breadcrumb reflects the real collection ancestry.
 * Requires the Vendure backend on :8085 with a seeded catalog (collections).
 */
test.describe('Categories — backend-driven & unified', () => {
  test('header category nav links target real category slugs (not a hardcoded list)', async ({ page }) => {
    await page.goto('/ar');
    await page.waitForLoadState('networkidle');

    const navLinks = page.locator('header nav[aria-label] a[href*="/categories/"]');
    await expect(navLinks.first()).toBeVisible({ timeout: 15_000 });
    expect(await navLinks.count()).toBeGreaterThan(0);

    // Every header category link must point at a specific slug, e.g. /ar/categories/men —
    // the old hardcoded nav pointed every item at the bare /categories list.
    const hrefs = await navLinks.evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''));
    for (const href of hrefs) expect(href).toMatch(/\/categories\/[^/]+$/);
  });

  test('category detail breadcrumb includes the parent collection (full ancestry)', async ({ page }) => {
    await page.goto('/ar/categories/men-shirts');
    await page.waitForLoadState('networkidle');

    // The breadcrumb (inside <main>, distinct from the header nav) must link to the
    // parent category — proving it is built from Vendure's collection.breadcrumbs.
    const parentCrumb = page.locator('main a[href$="/categories/men"]');
    await expect(parentCrumb.first()).toBeVisible({ timeout: 15_000 });
  });
});
