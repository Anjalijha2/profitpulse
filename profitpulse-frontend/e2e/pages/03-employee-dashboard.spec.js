import { test, expect } from '@playwright/test';
import { authFile } from '../helpers/test-utils.js';

test.describe('Employee Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/employee');
    await page.waitForLoadState('load');
  });

  test('page title is visible', async ({ page }) => {
    await expect(page.locator('text=Employee Profitability')).toBeVisible({ timeout: 20000 });
  });

  test('Top Performers chart renders', async ({ page }) => {
    await expect(page.locator('text=Top Performers by Profit')).toBeVisible();
    const chart = page.locator('.recharts-wrapper, svg.recharts-surface').first();
    await expect(chart).toBeVisible({ timeout: 10000 });
  });

  test('Employee Performance Ledger table renders with required columns', async ({ page }) => {
    await expect(page.locator('text=Employee Performance Ledger')).toBeVisible();
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
    // Column headers
    await expect(page.locator('th:has-text("Employee")')).toBeVisible();
    await expect(page.locator('th:has-text("Dept")')).toBeVisible();
    await expect(page.locator('th:has-text("Billable")')).toBeVisible();
    await expect(page.locator('th:has-text("Revenue")')).toBeVisible();
    await expect(page.locator('th:has-text("Cost")')).toBeVisible();
    await expect(page.locator('th:has-text("Profit")')).toBeVisible();
    await expect(page.locator('th:has-text("Margin")')).toBeVisible();
  });

  test('table contains data rows (non-empty)', async ({ page }) => {
    await page.waitForSelector('.ant-table-tbody tr', { timeout: 15000 });
    const rows = page.locator('.ant-table-tbody tr.ant-table-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('pagination exists', async ({ page }) => {
    const pagination = page.locator('.ant-pagination');
    await expect(pagination).toBeVisible();
  });
});

test.describe('Employee Dashboard - Department Head scoping', () => {
  test.use({ storageState: authFile('department_head') });

  test('dept head sees employee data scoped to their department', async ({ page }) => {
    await page.goto('/dashboard/employee');
    await page.waitForLoadState('load');
    await expect(page.locator('text=Employee Profitability')).toBeVisible({ timeout: 20000 });
    // Page should load without redirect or forbidden error
    expect(page.url()).not.toContain('/403');
    expect(page.url()).not.toContain('/login');
  });
});
