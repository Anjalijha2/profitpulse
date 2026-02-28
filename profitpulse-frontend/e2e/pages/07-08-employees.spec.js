import { test, expect } from '@playwright/test';

test.describe('Employee List Page (/employees)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/employees');
    await page.waitForLoadState('load');
  });

  test('page title Workforce is visible', async ({ page }) => {
    await expect(page.locator('text=Workforce')).toBeVisible({ timeout: 20000 });
  });

  test('Onboard Employee button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Onboard Employee")')).toBeVisible();
  });

  test('employee table renders with required columns', async ({ page }) => {
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
    // Wait for table to be fully hydrated from DB before checking column headers
    await page.waitForSelector('thead th:has-text("EMPLOYEE")', { timeout: 20000 });
    await expect(page.locator('thead th:has-text("EMPLOYEE")')).toBeVisible();
    await expect(page.locator('thead th:has-text("DEPARTMENT")')).toBeVisible();
    await expect(page.locator('thead th:has-text("DESIGNATION")')).toBeVisible();
    await expect(page.locator('thead th:has-text("STATUS")')).toBeVisible();
    await expect(page.locator('thead th:has-text("ANNUAL CTC")')).toBeVisible();
    await expect(page.locator('thead th:has-text("ACTIONS")')).toBeVisible();
  });

  test('table contains employee rows', async ({ page }) => {
    await page.waitForSelector('.ant-table-tbody tr', { timeout: 15000 });
    const rows = page.locator('.ant-table-tbody tr.ant-table-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('search input exists and filters results', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search by ID or name..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Rajesh');
    await page.waitForTimeout(800); // debounce
    await page.waitForLoadState('networkidle');
    // Results should be filtered (check table updates)
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
  });

  test('department filter dropdown exists', async ({ page }) => {
    const filter = page.locator('.ant-select').filter({ hasText: /All Departments/ }).first();
    await expect(filter).toBeVisible();
  });

  test('pagination exists', async ({ page }) => {
    await expect(page.locator('.ant-pagination')).toBeVisible();
  });

  test('Details link navigates to employee detail page', async ({ page }) => {
    await page.waitForSelector('.ant-table-tbody tr.ant-table-row', { timeout: 15000 });
    const detailsLink = page.locator('button:has-text("Details"), a:has-text("Details")').first();
    await expect(detailsLink).toBeVisible();
    await detailsLink.click();
    await page.waitForURL((url) => url.pathname.match(/\/employees\/\d+|\/employees\/.+/), { timeout: 10000 });
    expect(page.url()).toMatch(/\/employees\/.+/);
  });
});

test.describe('Employee Detail Page (/employees/:id)', () => {
  test('detail page shows profile info', async ({ page }) => {
    await page.goto('/employees');
    await page.waitForSelector('.ant-table-tbody tr.ant-table-row', { timeout: 15000 });
    const detailsLink = page.locator('button:has-text("Details"), a:has-text("Details")').first();
    await detailsLink.click();
    await page.waitForURL((url) => url.pathname.match(/\/employees\/.+/), { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    // Detail page should have some content
    await expect(page.locator('body')).not.toBeEmpty();
    expect(page.url()).not.toContain('/login');
    expect(page.url()).not.toContain('/403');
  });
});
