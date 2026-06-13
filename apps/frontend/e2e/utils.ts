import type { Page } from '@playwright/test';

/**
 * Bring a page to a visually stable state before snapshotting:
 * wait for network to settle, webfonts to load, and freeze animations.
 */
export async function stabilize(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts?.ready);
  await page.addStyleTag({
    content: `*, *::before, *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
      caret-color: transparent !important;
    }`,
  });
  // Settle layout after font swap / lazy images entering the viewport.
  await page.waitForTimeout(400);
}
