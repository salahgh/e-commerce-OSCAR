import { test, expect } from '@playwright/test';
import { stabilize } from './utils';

const PRODUCT_AR = '/ar/products/lancome-absolue-foundation';
const CART_AR = '/ar/cart';

async function addItemAndOpenCart(page: import('@playwright/test').Page) {
  await page.goto(PRODUCT_AR);
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /أضف إلى السلة/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible(); // mini-cart confirms add
  await page.goto(CART_AR);
  await page.waitForLoadState('networkidle');
}

test.describe('Cart page', () => {
  test('shows the empty state when no items', async ({ page }) => {
    await page.goto(CART_AR);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/سلتك فارغة/)).toBeVisible();
  });

  test('lists added items with summary and checkout link', async ({ page }) => {
    await addItemAndOpenCart(page);
    await expect(page.getByRole('heading', { name: /سلة التسوق/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /ملخص الطلبية/ })).toBeVisible();
    const checkout = page.getByRole('link', { name: /تأكيد الطلب/ });
    await expect(checkout).toHaveAttribute('href', /\/checkout/);
  });

  test('matches Figma visual baseline (with item)', async ({ page }, testInfo) => {
    await addItemAndOpenCart(page);
    await stabilize(page);
    await expect(page).toHaveScreenshot(`cart-ar-${testInfo.project.name}.png`, { fullPage: true });
  });
});
