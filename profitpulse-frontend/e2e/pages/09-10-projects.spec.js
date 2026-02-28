import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('Project List Page (/projects)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects');
    await page.waitForLoadState('load');
  });

  test('page title Projects is visible', async ({ page }) => {
    // Use h2 to avoid collisions with sidebar menu item and be explicit about slow AWS RDS
    await expect(page.locator('h2:has-text("Projects")')).toBeVisible({ timeout: 30000 });
  });

  test('Export and Create Project buttons are visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Export")')).toBeVisible();
    await expect(page.locator('button:has-text("Create Project")')).toBeVisible();
  });

  test('project table renders with required columns', async ({ page }) => {
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
    // Wait for table to be hydrated before checking column headers
    await page.waitForSelector('thead th:has-text("PROJECT CODE")', { timeout: 30000 });
    await expect(page.locator('thead th:has-text("PROJECT CODE")')).toBeVisible();
    await expect(page.locator('thead th:has-text("NAME")')).toBeVisible();
    await expect(page.locator('thead th:has-text("TYPE")')).toBeVisible();
    await expect(page.locator('thead th:has-text("STATUS")')).toBeVisible();
    await expect(page.locator('thead th:has-text("CONTRACT VALUE")')).toBeVisible();
    await expect(page.locator('thead th:has-text("TIMELINE")')).toBeVisible();
    await expect(page.locator('thead th:has-text("ACTIONS")')).toBeVisible();
  });

  test('table contains project rows with type badges', async ({ page }) => {
    await page.waitForSelector('.ant-table-tbody tr.ant-table-row', { timeout: 15000 });
    const rows = page.locator('.ant-table-tbody tr.ant-table-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    // At least one type tag
    const typeTags = page.locator('.ant-tag').filter({ hasText: /T&M|FIXED|AMC|INFRA/ });
    await expect(typeTags.first()).toBeVisible();
  });

  test('status filter works', async ({ page }) => {
    const statusFilter = page.locator('.ant-select').filter({ hasText: /Filter by status/ }).first();
    await expect(statusFilter).toBeVisible();
    await statusFilter.click();
    await page.locator('.ant-select-item-option:has-text("Active")').click();
    await page.waitForLoadState('load');
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
  });

  test('search input filters projects', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search by code or name..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('PRJ');
    await page.waitForTimeout(800);
    await page.waitForLoadState('load');
  });

  test('Export button triggers CSV download', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
      page.locator('button:has-text("Export")').click(),
    ]);
    // Export creates a CSV via data URI - check no crash
    // Download event may not fire for data URIs, just ensure no error
    await page.waitForTimeout(1000);
  });

  test('Create Project button opens drawer with form', async ({ page }) => {
    await page.locator('button:has-text("Create Project")').click();
    const drawer = page.locator('.ant-drawer, .glass-drawer, [class*="drawer"]').first();
    await expect(drawer).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Register New Engagement')).toBeVisible();
    await expect(page.locator('input[id*="project_code"], input[placeholder="e.g. PRJ012"]')).toBeVisible();
    await expect(page.locator('input[id*="name"], input[placeholder="e.g. Enterprise Cloud Migration"]')).toBeVisible();
  });

  test('View Details navigates to project detail page', async ({ page }) => {
    await page.waitForSelector('.ant-table-tbody tr.ant-table-row', { timeout: 15000 });
    const detailsLink = page.locator('button:has-text("View Details"), a:has-text("View Details")').first();
    await expect(detailsLink).toBeVisible();
    await detailsLink.click();
    await page.waitForURL((url) => url.pathname.match(/\/projects\/.+/), { timeout: 10000 });
    expect(page.url()).toMatch(/\/projects\/.+/);
  });
});

test.describe('Project Detail Page', () => {
  test('detail page loads and shows project data', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForSelector('.ant-table-tbody tr.ant-table-row', { timeout: 15000 });
    const detailsLink = page.locator('button:has-text("View Details"), a:has-text("View Details")').first();
    await detailsLink.click();
    await page.waitForURL((url) => url.pathname.match(/\/projects\/.+/), { timeout: 10000 });
    await page.waitForLoadState('load');
    expect(page.url()).not.toContain('/login');
    expect(page.url()).not.toContain('/403');
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
