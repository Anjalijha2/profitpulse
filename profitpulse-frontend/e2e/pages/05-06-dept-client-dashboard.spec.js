import { test, expect } from '@playwright/test';

test.describe('Department Dashboard (/dashboard/department)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/department');
    await page.waitForLoadState('networkidle');
  });

  test('page title is visible', async ({ page }) => {
    await expect(page.locator('text=Department Intelligence')).toBeVisible({ timeout: 10000 });
  });

  test('Department P&L chart renders', async ({ page }) => {
    await expect(page.locator('text=Department P&L Comparison')).toBeVisible();
    const chart = page.locator('.recharts-wrapper, svg.recharts-surface').first();
    await expect(chart).toBeVisible({ timeout: 10000 });
  });

  test('Department Statistics table renders with required columns', async ({ page }) => {
    await expect(page.locator('text=Department Statistics')).toBeVisible();
    await expect(page.locator('th:has-text("Department")')).toBeVisible();
    await expect(page.locator('th:has-text("HC")')).toBeVisible();
    await expect(page.locator('th:has-text("Revenue")')).toBeVisible();
    await expect(page.locator('th:has-text("Cost")')).toBeVisible();
    await expect(page.locator('th:has-text("Margin")')).toBeVisible();
  });

  test('table contains department rows', async ({ page }) => {
    await page.waitForSelector('.ant-table-tbody tr', { timeout: 15000 });
    const rows = page.locator('.ant-table-tbody tr.ant-table-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Client Dashboard (/dashboard/client)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/client');
    await page.waitForLoadState('networkidle');
  });

  test('page title is visible', async ({ page }) => {
    await expect(page.locator('text=Client Portfolio')).toBeVisible({ timeout: 10000 });
  });

  test('Top Clients chart renders', async ({ page }) => {
    await expect(page.locator('text=Top Clients by Revenue')).toBeVisible();
    const chart = page.locator('.recharts-wrapper, svg.recharts-surface').first();
    await expect(chart).toBeVisible({ timeout: 10000 });
  });

  test('Client Performance Ledger table renders with required columns', async ({ page }) => {
    await expect(page.locator('text=Client Performance Ledger')).toBeVisible();
    await expect(page.locator('th:has-text("Client")')).toBeVisible();
    await expect(page.locator('th:has-text("Industry")')).toBeVisible();
    await expect(page.locator('th:has-text("Projects")')).toBeVisible();
    await expect(page.locator('th:has-text("Revenue")')).toBeVisible();
    await expect(page.locator('th:has-text("Cost")')).toBeVisible();
    await expect(page.locator('th:has-text("Margin")')).toBeVisible();
  });

  test('table has client rows with ₹ revenue values', async ({ page }) => {
    await page.waitForSelector('.ant-table-tbody tr', { timeout: 15000 });
    const rows = page.locator('.ant-table-tbody tr.ant-table-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    const tableText = await page.locator('.ant-table').textContent();
    expect(tableText).toContain('₹');
  });

  test('pagination exists', async ({ page }) => {
    const pagination = page.locator('.ant-pagination');
    await expect(pagination).toBeVisible();
  });
});
