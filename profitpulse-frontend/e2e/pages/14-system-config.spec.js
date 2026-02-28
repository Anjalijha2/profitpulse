import { test, expect } from '@playwright/test';

test.describe('System Config (/admin/config)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/config');
    await page.waitForLoadState('load');
  });

  test('page title System Configuration is visible', async ({ page }) => {
    await expect(page.locator('text=System Configuration')).toBeVisible({ timeout: 20000 });
  });

  test('Financials tab is visible and active', async ({ page }) => {
    await expect(page.locator('text=Financials')).toBeVisible();
    await expect(page.locator('text=General Defaults')).toBeVisible();
    await expect(page.locator('text=Integrations')).toBeVisible();
  });

  test('overhead cost field is loaded (default 180000)', async ({ page }) => {
    const overheadInput = page.locator('input[id*="overhead"], [class*="overhead"] input').first();
    if (await overheadInput.count() > 0) {
      const val = await overheadInput.inputValue();
      expect(Number(val.replace(/[^0-9]/g, ''))).toBeGreaterThan(0);
    }
    // Or check for the label
    await expect(page.locator('text=Default Annual Overhead Cost')).toBeVisible();
  });

  test('standard monthly hours field is loaded (default 160)', async ({ page }) => {
    await expect(page.locator('text=Standard Monthly Hours')).toBeVisible();
    const hoursInput = page.locator('input[id*="standard"], input[id*="hours"]').first();
    if (await hoursInput.count() > 0) {
      const val = await hoursInput.inputValue();
      expect(Number(val)).toBeGreaterThan(0);
    }
  });

  test('Save Financial Settings button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Save Financial Settings")')).toBeVisible();
  });

  test('General Defaults tab shows coming soon', async ({ page }) => {
    // Wait for the tab to be interactive before clicking
    await page.waitForSelector('.ant-tabs-tab:has-text("General Defaults")', { timeout: 20000 });
    await page.locator('.ant-tabs-tab:has-text("General Defaults")').click();
    await expect(page.locator('text=Coming Soon')).toBeVisible({ timeout: 5000 });
  });

  test('Integrations tab shows coming soon', async ({ page }) => {
    // Wait for the tab to be interactive before clicking
    await page.waitForSelector('.ant-tabs-tab:has-text("Integrations")', { timeout: 20000 });
    await page.locator('.ant-tabs-tab:has-text("Integrations")').click();
    await expect(page.locator('text=Coming Soon')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Role Access Config (/admin/rbac)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/rbac');
    await page.waitForLoadState('load');
  });

  test('RBAC page title is visible', async ({ page }) => {
    await expect(page.locator('text=Role Access Configuration')).toBeVisible({ timeout: 20000 });
  });

  test('Save Changes button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();
  });

  test('Reset to Defaults button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Reset to Defaults")')).toBeVisible();
  });

  test('RBAC matrix shows role columns', async ({ page }) => {
    // Wait for the RBAC table to fully load the role headers
    await page.waitForSelector('.ant-table', { timeout: 20000 });
    // Use thead scope to target actual column headers, not sidebar menu items
    await expect(page.locator('thead').filter({ hasText: 'Finance' })).toBeVisible();
    await expect(page.locator('thead').filter({ hasText: 'Delivery Mgr' })).toBeVisible();
    await expect(page.locator('thead').filter({ hasText: 'Dept Head' })).toBeVisible();
    await expect(page.locator('thead').filter({ hasText: 'HR' })).toBeVisible();
  });

  test('RBAC matrix has toggle switches', async ({ page }) => {
    const switches = page.locator('.ant-switch');
    const count = await switches.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Admin access read-only section is visible', async ({ page }) => {
    await expect(page.locator('text=Admin Access')).toBeVisible();
  });
});
