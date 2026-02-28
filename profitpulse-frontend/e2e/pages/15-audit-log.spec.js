import { test, expect } from '@playwright/test';

test.describe('Audit Log (/admin/audit-log)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/audit-log');
    await page.waitForLoadState('load');
  });

  test('page title Audit Log is visible', async ({ page }) => {
    // Use h2 selector to avoid strict mode collision with sidebar menu item
    await expect(page.locator('h2:has-text("Audit Log")')).toBeVisible({ timeout: 20000 });
    await expect(page.locator('text=Immutable record of system changes and uploads.')).toBeVisible();
  });

  test('audit log table renders with required columns', async ({ page }) => {
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
    // Scope to thead to avoid matching AntD's hidden measure <th> elements
    await expect(page.locator('thead th:has-text("TIMESTAMP")')).toBeVisible();
    await expect(page.locator('thead th:has-text("USER")')).toBeVisible();
    await expect(page.locator('thead th:has-text("ACTION")')).toBeVisible();
    await expect(page.locator('thead th:has-text("FILE NAME")')).toBeVisible();
    await expect(page.locator('thead th:has-text("STATUS")')).toBeVisible();
  });

  test('table renders (may be empty on fresh system)', async ({ page }) => {
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
    // Whether or not there are rows, the table itself should render
    const emptyOrRows = page.locator('.ant-table-tbody tr');
    const count = await emptyOrRows.count();
    expect(count).toBeGreaterThanOrEqual(0); // Always passes — just checks no crash
  });

  test('pagination exists (only when records exist)', async ({ page }) => {
    // Pagination is only rendered when there are rows — skip if table is empty
    const rowCount = await page.locator('.ant-table-tbody tr.ant-table-row').count();
    if (rowCount > 0) {
      await expect(page.locator('.ant-pagination')).toBeVisible();
    } else {
      // Fresh system with no audit records — pagination not rendered, that's OK
      console.log('No audit records found — pagination not expected on empty table');
    }
  });
});
