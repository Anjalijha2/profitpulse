import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const AUTH_DIR = path.join('e2e', '.auth');
if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

const users = [
  { role: 'admin', email: 'admin@profitpulse.com', password: 'Admin@123' },
  { role: 'finance', email: 'ritu.finance@profitpulse.com', password: 'Finance@123' },
  { role: 'delivery_manager', email: 'suresh.dm@profitpulse.com', password: 'Delivery@123' },
  { role: 'department_head', email: 'anita.dh@profitpulse.com', password: 'DeptHead@123' },
  { role: 'hr', email: 'pooja.hr@profitpulse.com', password: 'HRUser@123' },
];

for (const user of users) {
  setup(`authenticate as ${user.role}`, async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.locator('input[type="email"], #login_email, input[name="email"], input[id*="email"]').first();
    const passInput = page.locator('input[type="password"], #login_password, input[name="password"], input[id*="password"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill(user.email);
    await passInput.fill(user.password);
    await page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first().click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
    await page.context().storageState({ path: path.join(AUTH_DIR, `${user.role}.json`) });
  });
}
