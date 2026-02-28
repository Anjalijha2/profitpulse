import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(__dirname, '..', '..', 'fixtures');

test.describe('Upload Center (/upload)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/upload');
    await page.waitForLoadState('load');
  });

  test('page title Upload Center is visible', async ({ page }) => {
    // Use h2 to avoid strict mode collision with sidebar nav item "Upload Center"
    await expect(page.locator('h2:has-text("Upload Center")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Bulk upload employee, timesheet, and revenue data.')).toBeVisible();
  });

  test('3 upload type cards are visible', async ({ page }) => {
    await expect(page.locator('text=Employee Data')).toBeVisible();
    await expect(page.locator('text=Timesheet Data')).toBeVisible();
    await expect(page.locator('text=Revenue Records')).toBeVisible();
  });

  test('steps navigation shows 3 steps', async ({ page }) => {
    await expect(page.locator('text=Choose Data Type')).toBeVisible();
    await expect(page.locator('text=Upload File')).toBeVisible();
    await expect(page.locator('text=Done')).toBeVisible();
  });

  test('Employee Data card is selected by default with FY selector', async ({ page }) => {
    // Employee Data card should be pre-selected (highlighted border)
    const fySelector = page.locator('text=Financial Year');
    await expect(fySelector).toBeVisible();
    // FY select should exist
    const fySelect = page.locator('.ant-select').filter({ hasText: /FY/ }).first();
    await expect(fySelect).toBeVisible();
  });

  test('clicking Timesheet Data shows month picker', async ({ page }) => {
    await page.locator('text=Timesheet Data').click();
    await expect(page.locator('text=Reporting Month')).toBeVisible();
  });

  test('clicking Revenue Records shows month picker', async ({ page }) => {
    await page.locator('text=Revenue Records').click();
    await expect(page.locator('text=Reporting Month')).toBeVisible();
  });

  test('Next Upload File button advances to step 1', async ({ page }) => {
    await page.locator('button:has-text("Next: Upload File")').click();
    await expect(page.locator('text=Need the template?')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Drop your file here')).toBeVisible();
  });

  test('Download template link exists and triggers download (>1KB)', async ({ page }) => {
    await page.locator('button:has-text("Next: Upload File")').click();
    await expect(page.locator('text=Download employees_template.xlsx')).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 10000 }),
      page.locator('text=Download employees_template.xlsx').click(),
    ]);
    expect(download.suggestedFilename()).toContain('template');
    const filePath = await download.path();
    const { size } = fs.statSync(filePath);
    expect(size).toBeGreaterThan(1000); // Must be > 1KB, not 9 bytes
  });

  test('file upload dragger zone exists', async ({ page }) => {
    await page.locator('button:has-text("Next: Upload File")').click();
    const dragger = page.locator('.ant-upload-drag, [class*="dragger"], input[type="file"]').first();
    await expect(dragger).toBeVisible({ timeout: 5000 });
  });

  test('upload sample employee file shows validation result', async ({ page }) => {
    await page.locator('button:has-text("Next: Upload File")').click();
    await expect(page.locator('.ant-upload-drag, input[type="file"]').first()).toBeVisible({ timeout: 5000 });

    const fileInput = page.locator('input[type="file"]').first();
    const sampleFile = path.join(FIXTURES, 'employee_master_2025.xlsx');
    await fileInput.setInputFiles(sampleFile);

    // Wait for validation result (either validating, errors, or success)
    // Use .or() to combine three separate locators (comma in text= is NOT an OR operator)
    const checking = page.locator('text=Checking for errors...');
    const noErrors = page.locator('text=No errors found');
    const foundErrors = page.locator('[class*="Found"], text=Found').first();
    // Any one of these states should appear within 20s
    await expect(checking.or(noErrors).or(foundErrors)).toBeVisible({ timeout: 20000 });
  });

  test('Back to Data Type button returns to step 0', async ({ page }) => {
    await page.locator('button:has-text("Next: Upload File")').click();
    await expect(page.locator('text=Drop your file here')).toBeVisible();
    await page.locator('button:has-text("Back to Data Type")').click();
    await expect(page.locator('text=Employee Data')).toBeVisible();
  });
});
