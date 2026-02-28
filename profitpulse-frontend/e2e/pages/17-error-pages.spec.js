import { test, expect } from '@playwright/test';
import { authFile } from '../helpers/test-utils.js';

test.describe('Error Pages — 404 & 403', () => {
  test('navigating to a nonexistent route shows 404 page', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-xyz');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=404')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Looks like you\'re lost')).toBeVisible();
  });

  test('404 page has Go Back and Return Home buttons', async ({ page }) => {
    await page.goto('/nonexistent-route-abc');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("Go Back")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Return Home")')).toBeVisible();
  });

  test('/403 route shows forbidden page', async ({ page }) => {
    await page.goto('/403');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=403')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Access Restricted')).toBeVisible();
  });

  test('403 page has Go Back and Return to Dashboard buttons', async ({ page }) => {
    await page.goto('/403');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("Go Back")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Return to Dashboard")')).toBeVisible();
  });

  test.describe('HR role cannot access admin pages', () => {
    test.use({ storageState: authFile('hr') });

    test('HR accessing /admin/users is redirected to /403', async ({ page }) => {
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');
      // Should redirect to /403 — either URL changes or 403 content visible
      const url = page.url();
      const has403Content = await page.locator('text=403').isVisible().catch(() => false);
      const redirected = url.includes('/403') || url.includes('/login');
      expect(has403Content || redirected).toBe(true);
    });

    test('HR accessing /admin/config is blocked', async ({ page }) => {
      await page.goto('/admin/config');
      await page.waitForLoadState('networkidle');
      const url = page.url();
      const has403Content = await page.locator('text=403').isVisible().catch(() => false);
      const redirected = url.includes('/403') || url.includes('/login');
      expect(has403Content || redirected).toBe(true);
    });
  });

  test.describe('Delivery Manager cannot access admin pages', () => {
    test.use({ storageState: authFile('delivery_manager') });

    test('Delivery Manager accessing /admin/audit-log is blocked', async ({ page }) => {
      await page.goto('/admin/audit-log');
      await page.waitForLoadState('networkidle');
      const url = page.url();
      const has403Content = await page.locator('text=403').isVisible().catch(() => false);
      const redirected = url.includes('/403') || url.includes('/login');
      expect(has403Content || redirected).toBe(true);
    });
  });
});
