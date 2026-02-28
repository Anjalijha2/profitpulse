import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('renders login form with all required fields', async ({ page }) => {
    await expect(page.locator('text=Welcome back')).toBeVisible();
    await expect(page.locator('text=Sign in to your intelligent dashboard')).toBeVisible();
    await expect(page.locator('input[placeholder="Email address"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In to Workspace")')).toBeVisible();
  });

  test('valid admin login redirects to dashboard', async ({ page }) => {
    await page.locator('input[placeholder="Email address"]').fill('admin@profitpulse.com');
    await page.locator('input[placeholder="Password"]').fill('Admin@123');
    await page.locator('button:has-text("Sign In to Workspace")').click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
    expect(page.url()).not.toContain('/login');
  });

  test('wrong password shows error message', async ({ page }) => {
    await page.locator('input[placeholder="Email address"]').fill('admin@profitpulse.com');
    await page.locator('input[placeholder="Password"]').fill('WrongPassword123');
    await page.locator('button:has-text("Sign In to Workspace")').click();
    // Ant Design Alert or antd message notification — AWS RDS can be slow; 40s timeout
    const errorLocator = page.locator('.ant-alert, .ant-message-notice, [class*="error"], [role="alert"]');
    await expect(errorLocator.first()).toBeVisible({ timeout: 40000 });
  });

  test('non-existent email shows error', async ({ page }) => {
    await page.locator('input[placeholder="Email address"]').fill('nobody@profitpulse.com');
    await page.locator('input[placeholder="Password"]').fill('Admin@123');
    await page.locator('button:has-text("Sign In to Workspace")').click();
    const errorLocator = page.locator('.ant-alert, .ant-message-notice, [class*="error"], [role="alert"]');
    await expect(errorLocator.first()).toBeVisible({ timeout: 40000 });
  });

  test('direct /dashboard without login redirects to /login', async ({ page }) => {
    await page.goto('/dashboard/executive');
    await page.waitForURL((url) => url.pathname.includes('/login'), { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  test('login as finance user succeeds', async ({ page }) => {
    await page.locator('input[placeholder="Email address"]').fill('ritu.finance@profitpulse.com');
    await page.locator('input[placeholder="Password"]').fill('Finance@123');
    await page.locator('button:has-text("Sign In to Workspace")').click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
    expect(page.url()).not.toContain('/login');
  });

  test('login as delivery_manager succeeds', async ({ page }) => {
    await page.locator('input[placeholder="Email address"]').fill('suresh.dm@profitpulse.com');
    await page.locator('input[placeholder="Password"]').fill('Delivery@123');
    await page.locator('button:has-text("Sign In to Workspace")').click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
    expect(page.url()).not.toContain('/login');
  });

  test('login as department_head succeeds', async ({ page }) => {
    await page.locator('input[placeholder="Email address"]').fill('anita.dh@profitpulse.com');
    await page.locator('input[placeholder="Password"]').fill('DeptHead@123');
    await page.locator('button:has-text("Sign In to Workspace")').click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
    expect(page.url()).not.toContain('/login');
  });

  test('login as hr user succeeds', async ({ page }) => {
    await page.locator('input[placeholder="Email address"]').fill('pooja.hr@profitpulse.com');
    await page.locator('input[placeholder="Password"]').fill('HRUser@123');
    await page.locator('button:has-text("Sign In to Workspace")').click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
    expect(page.url()).not.toContain('/login');
  });
});
