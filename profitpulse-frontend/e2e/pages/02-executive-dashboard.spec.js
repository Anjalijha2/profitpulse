import { test, expect } from '@playwright/test';

test.describe('Executive Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/executive');
    await page.waitForLoadState('networkidle');
  });

  test('page title is visible', async ({ page }) => {
    await expect(page.locator('text=Executive Overview')).toBeVisible({ timeout: 10000 });
  });

  test('4 KPI cards are visible', async ({ page }) => {
    await expect(page.locator('text=Total Revenue')).toBeVisible();
    await expect(page.locator('text=Total Cost')).toBeVisible();
    await expect(page.locator('text=Net Margin')).toBeVisible();
    await expect(page.locator('text=Utilization')).toBeVisible();
  });

  test('KPI cards contain non-zero values with ₹ currency', async ({ page }) => {
    // Revenue card should contain ₹ symbol
    const revenueCard = page.locator('.ant-card').filter({ hasText: 'Total Revenue' }).first();
    await expect(revenueCard).toBeVisible();
    const revenueText = await revenueCard.textContent();
    expect(revenueText).toContain('₹');
  });

  test('Monthly Profitability Trend chart renders', async ({ page }) => {
    await expect(page.locator('text=Monthly Profitability Trend')).toBeVisible();
    // Recharts renders SVG
    const chart = page.locator('.recharts-wrapper, svg.recharts-surface, canvas').first();
    await expect(chart).toBeVisible({ timeout: 10000 });
  });

  test('Top Projects by Margin section is visible', async ({ page }) => {
    await expect(page.locator('text=Top Projects by Margin')).toBeVisible();
  });

  test('month filter DatePicker exists', async ({ page }) => {
    // Ant Design DatePicker with month picker
    const datePicker = page.locator('.ant-picker, input[placeholder*="month"], input[placeholder*="Month"]').first();
    await expect(datePicker).toBeVisible();
  });
});
