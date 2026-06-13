import { test, expect } from '@playwright/test';

// The favoris/wishlist page lives in the account section and is auth-gated
// (per product decision). Unauthenticated visitors are redirected to login.
//
// The authenticated grid layout (Figma 288-10095: heading + 4-col ProductCard
// grid) was verified manually via the Playwright MCP; a committed visual
// baseline is intentionally omitted here to avoid a brittle login/seed fixture.
test.describe('Wishlist page', () => {
  test('redirects unauthenticated visitors to login', async ({ page }) => {
    await page.goto('/ar/user/wishlist');
    await expect(page).toHaveURL(/\/login/);
  });
});
