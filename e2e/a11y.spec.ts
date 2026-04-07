import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROUTES = ['/', '/uses', '/stack'] as const;

for (const route of ROUTES) {
  test(`a11y: ${route} has no critical or serious WCAG2AA violations`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    if (blocking.length > 0) {
      console.log(JSON.stringify(blocking, null, 2));
    }

    expect(blocking).toEqual([]);
  });
}

test('a11y: skip-to-main link is reachable via keyboard', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement?.textContent ?? '');
  expect(focused.toLowerCase()).toContain('skip');
});
