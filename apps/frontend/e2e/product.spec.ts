import { test, expect } from '@playwright/test';
import { stabilize } from './utils';

// A stable seed product (perfume catalogue). Single-variant, so size/colour
// chips do not render — only the universal PDP chrome is asserted here.
const PRODUCT_AR = '/ar/products/lancome-absolue-foundation';

async function gotoProduct(page: import('@playwright/test').Page) {
  await page.goto(PRODUCT_AR);
  await page.waitForLoadState('networkidle');
}

test.describe('Product page', () => {
  test('renders the product detail (RTL)', async ({ page }) => {
    await gotoProduct(page);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Quantity + actions
    await expect(page.getByRole('button', { name: /أضف إلى السلة/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /اشتري الآن/ })).toBeVisible();
  });

  test('add to cart opens the mini-cart', async ({ page }) => {
    await gotoProduct(page);
    await page.getByRole('button', { name: /أضف إلى السلة/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('shows a related-products rail', async ({ page }) => {
    await gotoProduct(page);
    await expect(page.getByRole('heading', { name: /قد يعجبك أيضا/ })).toBeVisible();
    await expect(page.locator('a[href*="/products/"]').first()).toBeVisible();
  });

  test('matches Figma visual baseline', async ({ page }, testInfo) => {
    await page.goto(PRODUCT_AR);
    await stabilize(page);
    await expect(page).toHaveScreenshot(`product-ar-${testInfo.project.name}.png`, {
      fullPage: true,
    });
  });
});
