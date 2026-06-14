import { test, expect } from '@playwright/test';

/**
 * Verifies the home media carousels consume the channel-configured images and
 * navigate. Requires the Vendure backend on :8085 seeded with site content
 * (heroImages ≥ 2, reviewImages = 5) — see `pnpm --filter @oscar/backend seed:site-content`.
 *
 * Navigation is driven via the pagination dots (locale-independent aria-labels)
 * rather than the prev/next arrows (the reviews arrows use translated labels).
 */
test.describe('Home media carousels', () => {
  test('hero carousel renders multiple configured images and navigates', async ({ page }) => {
    await page.goto('/ar');
    await page.waitForLoadState('networkidle');

    const hero = page.locator('main section').first();
    const heroImg = hero.locator('img').first();
    await expect(heroImg).toBeVisible();

    // Client-fetched settings provide ≥2 hero images → multiple dots appear.
    const dots = hero.getByRole('button', { name: /Aller à la diapo/ });
    await expect(dots.first()).toBeVisible({ timeout: 15_000 });
    expect(await dots.count()).toBeGreaterThan(1);

    const before = await heroImg.getAttribute('src');
    await dots.nth(1).click();
    await expect(heroImg).not.toHaveAttribute('src', before ?? '');
  });

  test('reviews carousel renders the configured set and navigates via dots', async ({ page }) => {
    await page.goto('/ar');
    await page.waitForLoadState('networkidle');

    const reviews = page.locator('main section').last();
    const dots = reviews.getByRole('button', { name: /Aller à la diapo/ });
    await expect(dots.first()).toBeVisible({ timeout: 15_000 });
    expect(await dots.count()).toBe(5);

    // Position 2 of the coverflow is the centered review.
    const centered = reviews.locator('img').nth(2);
    const before = await centered.getAttribute('src');
    await dots.nth(1).click();
    await expect(centered).not.toHaveAttribute('src', before ?? '');
  });
});
