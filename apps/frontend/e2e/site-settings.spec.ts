import { test, expect } from '@playwright/test';

// Verifies the storefront renders channel site-content settings (seeded on the
// default channel) in the header and footer. The values come from the backend
// `activeChannel.customFields` via SiteSettingsProvider.
test.describe('Site settings', () => {
  test('header promo reflects the configured free-shipping text', async ({ page }) => {
    await page.goto('/ar');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('banner')).toContainText('شحن مجاني');
  });

  test('footer shows the configured contact email', async ({ page }) => {
    await page.goto('/ar');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('contentinfo')).toContainText('contact@oscarfashion.dz');
  });
});
