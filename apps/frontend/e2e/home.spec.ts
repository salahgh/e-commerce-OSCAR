import { test, expect } from '@playwright/test';
import { stabilize } from './utils';

// The Figma home design (nodes 190-9641 desktop / 477-11265 mobile) is the
// Arabic, RTL layout, so the canonical snapshots are taken on /ar.
const HOME_AR = '/ar';

/** Navigate and wait until the client has hydrated and data has loaded. */
async function gotoHome(page: import('@playwright/test').Page) {
  await page.goto(HOME_AR);
  // Product rails are driven by the shop-api; wait for those requests to settle
  // so the page is both hydrated (handlers attached) and fully populated.
  await page.waitForLoadState('networkidle');
}

test.describe('Home page', () => {
  test('renders RTL Arabic layout', async ({ page }) => {
    await page.goto(HOME_AR);
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
    await expect(html).toHaveAttribute('lang', 'ar');
  });

  test('renders all key sections', async ({ page }, testInfo) => {
    await gotoHome(page);

    // Header: promo bar / banner + category sub-nav (present on all viewports)
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('navigation', { name: /الفئات|categories/i })).toBeVisible();

    // Inline search is part of the desktop header; the mobile header (Figma
    // 477-11265) collapses it, so only assert its visibility on desktop.
    if (testInfo.project.name === 'desktop') {
      await expect(page.getByRole('search')).toBeVisible();
    }

    // At least one product rail with cards (data-driven from shop-api)
    await expect(page.locator('a[href*="/products/"]').first()).toBeVisible();

    // Footer present
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });

  test('search submits and navigates to results', async ({ page }, testInfo) => {
    // The mobile header is not yet adapted to the Figma mobile frame (477-11265);
    // the inline search flow is verified on the desktop layout for now.
    test.skip(testInfo.project.name !== 'desktop', 'mobile header pending Figma 477-11265');

    await gotoHome(page);
    const search = page.getByRole('search').getByRole('searchbox');
    await search.fill('robe');
    await search.press('Enter');
    await expect(page).toHaveURL(/\/search\?q=robe/);
  });

  test('clicking a product navigates to its page', async ({ page }) => {
    await gotoHome(page);
    await page.locator('a[href*="/products/"]').first().click();
    await expect(page).toHaveURL(/\/products\//);
  });

  test('matches Figma visual baseline', async ({ page }, testInfo) => {
    await page.goto(HOME_AR);
    await stabilize(page);
    await expect(page).toHaveScreenshot(`home-ar-${testInfo.project.name}.png`, {
      fullPage: true,
    });
  });
});
