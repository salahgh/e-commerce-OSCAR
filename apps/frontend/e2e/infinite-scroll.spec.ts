import { test, expect } from '@playwright/test';

/**
 * Infinite scroll on the category detail and search pages. Requires the Vendure
 * backend on :8085 with a seeded catalog (the `men` collection and the term
 * "black" both return well over one page of products).
 */
test.describe('Infinite scroll', () => {
  test('category page loads more products on scroll', async ({ page }) => {
    await page.goto('/ar/categories/men');
    await page.waitForLoadState('networkidle');

    const productLinks = page.locator('main a[href*="/products/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 15_000 });

    // The "Load more" control (fallback + observer target) is present.
    await expect(page.getByRole('button', { name: 'عرض المزيد' })).toBeVisible();

    const before = await productLinks.count();
    // Bring the sentinel into view to trigger the IntersectionObserver auto-load.
    await page.mouse.wheel(0, 4000);
    await expect.poll(() => productLinks.count(), { timeout: 15_000 }).toBeGreaterThan(before);
  });

  test('search results load more on scroll', async ({ page }) => {
    await page.goto('/ar/search?q=black');
    await page.waitForLoadState('networkidle');

    const productLinks = page.locator('main a[href*="/products/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: 'عرض المزيد' })).toBeVisible();

    const before = await productLinks.count();
    await page.mouse.wheel(0, 4000);
    await expect.poll(() => productLinks.count(), { timeout: 15_000 }).toBeGreaterThan(before);
  });
});
