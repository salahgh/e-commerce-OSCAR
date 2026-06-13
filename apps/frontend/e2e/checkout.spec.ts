import { test, expect } from '@playwright/test';

const PRODUCT_AR = '/ar/products/lancome-absolue-foundation';
const CHECKOUT_AR = '/ar/checkout';

// Full order completion (address → shipping → COD → confirmation) was verified
// manually via the Playwright MCP; the automated specs cover the page shell and
// the empty-cart guard without mutating real orders on every run.
test.describe('Checkout page', () => {
  test('shows the empty-cart state when there are no items', async ({ page }) => {
    await page.goto(CHECKOUT_AR);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/سلتك فارغة|أضف منتجات/)).toBeVisible();
  });

  test('renders the three single-page sections with an item', async ({ page }) => {
    await page.goto(PRODUCT_AR);
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /أضف إلى السلة/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.goto(CHECKOUT_AR);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /ملخص الطلبية/ })).toBeVisible();
    await expect(page.getByText(/تفاصيل الشحن/)).toBeVisible();
    await expect(page.getByText(/طريقة التوصيل/)).toBeVisible();
    await expect(page.getByText(/طريقة الدفع/)).toBeVisible();
    await expect(page.getByRole('button', { name: /تأكيد الطلب/ })).toBeVisible();
  });
});
