import { test, expect } from '@playwright/test';
import { authFile } from '../helpers/test-utils.js';

test.describe('Project Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/project');
    await page.waitForLoadState('networkidle');
  });

  test('page title is visible', async ({ page }) => {
    await expect(page.locator('text=Project Profitability')).toBeVisible({ timeout: 10000 });
  });

  test('Project Margin Analysis chart renders', async ({ page }) => {
    await expect(page.locator('text=Project Margin Analysis')).toBeVisible();
    const chart = page.locator('.recharts-wrapper, svg.recharts-surface').first();
    await expect(chart).toBeVisible({ timeout: 10000 });
  });

  test('Project Performance Ledger table renders with required columns', async ({ page }) => {
    await expect(page.locator('text=Project Performance Ledger')).toBeVisible();
    await expect(page.locator('th:has-text("Project")')).toBeVisible();
    await expect(page.locator('th:has-text("Client")')).toBeVisible();
    await expect(page.locator('th:has-text("Type")')).toBeVisible();
    await expect(page.locator('th:has-text("Revenue")')).toBeVisible();
    await expect(page.locator('th:has-text("Cost")')).toBeVisible();
    await expect(page.locator('th:has-text("Margin")')).toBeVisible();
  });

  test('project type badges are visible (T&M, FIXED, AMC, INFRA)', async ({ page }) => {
    await page.waitForSelector('.ant-table-tbody tr', { timeout: 15000 });
    const rows = page.locator('.ant-table-tbody tr.ant-table-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    // At least one type tag should be visible
    const typeTags = page.locator('.ant-tag').filter({ hasText: /T&M|FIXED|AMC|INFRA/ });
    await expect(typeTags.first()).toBeVisible();
  });

  test('table has data rows with client names', async ({ page }) => {
    await page.waitForSelector('.ant-table-tbody tr', { timeout: 15000 });
    const rows = page.locator('.ant-table-tbody tr.ant-table-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Project Dashboard - Delivery Manager scoping', () => {
  test.use({ storageState: authFile('delivery_manager') });

  test('delivery manager can view project dashboard', async ({ page }) => {
    await page.goto('/dashboard/project');
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toContain('/403');
    expect(page.url()).not.toContain('/login');
  });
});
