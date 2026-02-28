import { test, expect } from '@playwright/test';

test.describe('Report Center (/reports)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
  });

  test('page title and subtitle are visible', async ({ page }) => {
    await expect(page.locator('text=Report Center')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Generate standard and custom Excel intelligence reports.')).toBeVisible();
  });

  test('Report Type select is visible with default value', async ({ page }) => {
    const select = page.locator('.ant-select').first();
    await expect(select).toBeVisible();
    // Default value is project_profitability — label text shown in the selector
    await expect(page.locator('.ant-select-selection-item')).toContainText('Project Profitability Master');
  });

  test('Report Type dropdown has all four options', async ({ page }) => {
    // Open the select
    await page.locator('.ant-select').first().click();
    await expect(page.locator('.ant-select-item-option', { hasText: 'Project Profitability Master' })).toBeVisible();
    await expect(page.locator('.ant-select-item-option', { hasText: 'Employee Profitability Summary' })).toBeVisible();
    await expect(page.locator('.ant-select-item-option', { hasText: 'Department Profitability Summary' })).toBeVisible();
    await expect(page.locator('.ant-select-item-option', { hasText: 'Employee Utilization Summary' })).toBeVisible();
    // Close dropdown
    await page.keyboard.press('Escape');
  });

  test('From Month and To Month date pickers are visible', async ({ page }) => {
    await expect(page.locator('text=From Month')).toBeVisible();
    await expect(page.locator('text=To Month')).toBeVisible();
    const datePickers = page.locator('.ant-picker');
    const count = await datePickers.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('Generate & Download Excel button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Generate & Download Excel")')).toBeVisible();
  });

  test('form submits without crashing (download attempt)', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
    await page.locator('button:has-text("Generate & Download Excel")').click();
    // Either a download occurs or an error message appears — page should not crash
    await page.waitForTimeout(3000);
    const is404 = await page.locator('text=404').isVisible().catch(() => false);
    expect(is404).toBe(false);
  });
});
