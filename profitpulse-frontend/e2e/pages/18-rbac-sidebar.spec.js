import { test, expect } from '@playwright/test';
import { authFile } from '../helpers/test-utils.js';

// ─── Admin ────────────────────────────────────────────────────────────────────
test.describe('Sidebar — Admin sees everything', () => {
  test.use({ storageState: authFile('admin') });

  test('admin sees Dashboard menu', async ({ page }) => {
    await page.goto('/dashboard/executive');
    await page.waitForLoadState('load');
    await expect(page.locator('.ant-menu-item, .ant-menu-submenu').filter({ hasText: 'Dashboard' })).toBeVisible({ timeout: 10000 });
  });

  test('admin sees Administration submenu', async ({ page }) => {
    await page.goto('/dashboard/executive');
    await page.waitForLoadState('load');
    await expect(page.locator('.ant-menu-item, .ant-menu-submenu').filter({ hasText: 'Administration' })).toBeVisible({ timeout: 10000 });
  });

  test('admin sees Data Hub submenu', async ({ page }) => {
    await page.goto('/dashboard/executive');
    await page.waitForLoadState('load');
    await expect(page.locator('.ant-menu-item, .ant-menu-submenu').filter({ hasText: 'Data Hub' })).toBeVisible({ timeout: 10000 });
  });

  test('admin can navigate to all 5 dashboard sub-routes', async ({ page }) => {
    const routes = ['/dashboard/executive', '/dashboard/employee', '/dashboard/project', '/dashboard/department', '/dashboard/client'];
    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('load');
      const url = page.url();
      expect(url).toContain(route);
      // Should NOT be on 403
      expect(url).not.toContain('/403');
    }
  });
});

// ─── Finance ──────────────────────────────────────────────────────────────────
test.describe('Sidebar — Finance role', () => {
  test.use({ storageState: authFile('finance') });

  test('finance sees Dashboard menu', async ({ page }) => {
    await page.goto('/dashboard/executive');
    await page.waitForLoadState('load');
    await expect(page.locator('.ant-menu-item, .ant-menu-submenu').filter({ hasText: 'Dashboard' })).toBeVisible({ timeout: 10000 });
  });

  test('finance does NOT see Administration menu', async ({ page }) => {
    await page.goto('/dashboard/executive');
    await page.waitForLoadState('load');
    const adminMenu = page.locator('.ant-menu-submenu-title', { hasText: 'Administration' });
    await expect(adminMenu).not.toBeVisible();
  });

  test('finance can access executive dashboard', async ({ page }) => {
    await page.goto('/dashboard/executive');
    await page.waitForLoadState('load');
    expect(page.url()).not.toContain('/403');
    await expect(page.locator('text=Executive Overview')).toBeVisible({ timeout: 10000 });
  });

  test('finance cannot access employee dashboard (/403 redirect)', async ({ page }) => {
    await page.goto('/dashboard/employee');
    await page.waitForLoadState('load');
    const url = page.url();
    const has403 = await page.locator('text=403').isVisible().catch(() => false);
    expect(has403 || url.includes('/403')).toBe(true);
  });
});

// ─── Delivery Manager ─────────────────────────────────────────────────────────
test.describe('Sidebar — Delivery Manager role', () => {
  test.use({ storageState: authFile('delivery_manager') });

  test('delivery manager lands on project dashboard after login', async ({ page }) => {
    await page.goto('/');
    // Wait for RBAC store to load and redirect (waitForLoadState('load') is not enough)
    await page.waitForURL((url) => url.pathname.includes('/dashboard/project'), { timeout: 15000 })
      .catch(async () => {
        // If redirect didn't happen, check current URL for debugging
        console.log('delivery_manager redirect not fired; current URL:', page.url());
      });
    expect(page.url()).toContain('/dashboard/project');
  });

  test('delivery manager does NOT see Administration menu', async ({ page }) => {
    await page.goto('/dashboard/project');
    await page.waitForLoadState('load');
    const adminMenu = page.locator('.ant-menu-submenu-title', { hasText: 'Administration' });
    await expect(adminMenu).not.toBeVisible();
  });

  test('delivery manager cannot access executive dashboard', async ({ page }) => {
    await page.goto('/dashboard/executive');
    await page.waitForLoadState('load');
    const url = page.url();
    const has403 = await page.locator('text=403').isVisible().catch(() => false);
    expect(has403 || url.includes('/403')).toBe(true);
  });

  test('delivery manager can access project dashboard', async ({ page }) => {
    await page.goto('/dashboard/project');
    await page.waitForLoadState('load');
    expect(page.url()).not.toContain('/403');
    await expect(page.locator('text=Project Profitability')).toBeVisible({ timeout: 10000 });
  });
});

// ─── Department Head ──────────────────────────────────────────────────────────
test.describe('Sidebar — Department Head role', () => {
  test.use({ storageState: authFile('department_head') });

  test('dept head lands on department dashboard after login', async ({ page }) => {
    await page.goto('/');
    // Wait for RBAC store to load and redirect (waitForLoadState('load') is not enough)
    await page.waitForURL((url) => url.pathname.includes('/dashboard/department'), { timeout: 15000 })
      .catch(async () => {
        // If redirect didn't happen, check current URL for debugging
        console.log('dept_head redirect not fired; current URL:', page.url());
      });
    expect(page.url()).toContain('/dashboard/department');
  });

  test('dept head does NOT see Administration menu', async ({ page }) => {
    await page.goto('/dashboard/department');
    await page.waitForLoadState('load');
    const adminMenu = page.locator('.ant-menu-submenu-title', { hasText: 'Administration' });
    await expect(adminMenu).not.toBeVisible();
  });

  test('dept head can access employee dashboard', async ({ page }) => {
    await page.goto('/dashboard/employee');
    await page.waitForLoadState('load');
    expect(page.url()).not.toContain('/403');
    await expect(page.locator('text=Employee Profitability')).toBeVisible({ timeout: 10000 });
  });

  test('dept head cannot access executive dashboard', async ({ page }) => {
    await page.goto('/dashboard/executive');
    await page.waitForLoadState('load');
    const url = page.url();
    const has403 = await page.locator('text=403').isVisible().catch(() => false);
    expect(has403 || url.includes('/403')).toBe(true);
  });

  test('dept head cannot access client dashboard', async ({ page }) => {
    await page.goto('/dashboard/client');
    await page.waitForLoadState('load');
    const url = page.url();
    const has403 = await page.locator('text=403').isVisible().catch(() => false);
    expect(has403 || url.includes('/403')).toBe(true);
  });
});

// ─── HR ───────────────────────────────────────────────────────────────────────
test.describe('Sidebar — HR role', () => {
  test.use({ storageState: authFile('hr') });

  test('HR lands on employee dashboard after login', async ({ page }) => {
    await page.goto('/');
    // Wait for RBAC store to load and redirect (waitForLoadState('load') is not enough)
    await page.waitForURL((url) => url.pathname.includes('/dashboard/employee'), { timeout: 15000 })
      .catch(async () => {
        // If redirect didn't happen, check current URL for debugging
        console.log('HR redirect not fired; current URL:', page.url());
      });
    expect(page.url()).toContain('/dashboard/employee');
  });

  test('HR does NOT see Administration menu', async ({ page }) => {
    await page.goto('/dashboard/employee');
    await page.waitForLoadState('load');
    const adminMenu = page.locator('.ant-menu-submenu-title', { hasText: 'Administration' });
    await expect(adminMenu).not.toBeVisible();
  });

  test('HR can access employee dashboard', async ({ page }) => {
    await page.goto('/dashboard/employee');
    await page.waitForLoadState('load');
    expect(page.url()).not.toContain('/403');
    await expect(page.locator('text=Employee Profitability')).toBeVisible({ timeout: 10000 });
  });

  test('HR cannot access executive dashboard', async ({ page }) => {
    await page.goto('/dashboard/executive');
    await page.waitForLoadState('load');
    const url = page.url();
    const has403 = await page.locator('text=403').isVisible().catch(() => false);
    expect(has403 || url.includes('/403')).toBe(true);
  });

  test('HR cannot access client dashboard', async ({ page }) => {
    await page.goto('/dashboard/client');
    await page.waitForLoadState('load');
    const url = page.url();
    const has403 = await page.locator('text=403').isVisible().catch(() => false);
    expect(has403 || url.includes('/403')).toBe(true);
  });
});
