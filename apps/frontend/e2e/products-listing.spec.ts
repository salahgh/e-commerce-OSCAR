import { test, expect } from '@playwright/test';
import { stabilize } from './utils';

const LISTING_AR = '/ar/products';

async function gotoListing(page: import('@playwright/test').Page) {
  await page.goto(LISTING_AR);
  await page.waitForLoadState('networkidle');
}

test.describe('Products listing', () => {
  test('renders toolbar, title and product grid (RTL)', async ({ page }) => {
    await gotoListing(page);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { name: /جميع المنتجات/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /السعر/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /الترتيب/ })).toBeVisible();
    await expect(page.locator('a[href*="/products/"]').first()).toBeVisible();
  });

  test('opens the price-filter modal', async ({ page }) => {
    await gotoListing(page);
    await page.getByRole('button', { name: /السعر/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/السعر \(دج\)/)).toBeVisible();
  });

  test('opens the sort modal', async ({ page }) => {
    await gotoListing(page);
    await page.getByRole('button', { name: /الترتيب/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/الأحدث/)).toBeVisible();
  });

  test('matches Figma visual baseline', async ({ page }, testInfo) => {
    await page.goto(LISTING_AR);
    await stabilize(page);
    await expect(page).toHaveScreenshot(`products-ar-${testInfo.project.name}.png`, {
      fullPage: true,
    });
  });
});
