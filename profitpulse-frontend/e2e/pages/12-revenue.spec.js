import { test, expect } from '@playwright/test';

test.describe('Revenue Page', () => {
  test('revenue page is accessible at /revenue', async ({ page }) => {
    await page.goto('/revenue');
    await page.waitForLoadState('networkidle');
    // Should not redirect to login or 403
    expect(page.url()).not.toContain('/login');
    expect(page.url()).not.toContain('/403');
  });

  test('revenue page renders content', async ({ page }) => {
    await page.goto('/revenue');
    await page.waitForLoadState('networkidle');
    // Page should have some visible content
    await expect(page.locator('body')).not.toBeEmpty();
    // Try to find a heading or table
    const heading = page.locator('h1, h2, h3, h4, .page-title').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('revenue table contains ₹ values if data exists', async ({ page }) => {
    await page.goto('/revenue');
    await page.waitForLoadState('networkidle');
    const table = page.locator('.ant-table');
    const tableExists = await table.count();
    if (tableExists > 0) {
      await expect(table).toBeVisible();
      const tableText = await table.textContent();
      expect(tableText).toMatch(/₹|Revenue|Amount/);
    }
  });

  test('revenue page has filter or search controls', async ({ page }) => {
    await page.goto('/revenue');
    await page.waitForLoadState('networkidle');
    const controls = page.locator('.ant-select, input[type="text"], .ant-picker').first();
    await expect(controls).toBeVisible({ timeout: 10000 });
  });
});
