import { test, expect } from '@playwright/test';

// Following TDD and Browser Automation rules
// (User-Facing Locator Pattern, Auto-Wait Pattern, Test Isolation Pattern)

test.describe('MAFIS Homepage', () => {
    test('should have the correct title and SEO metadata', async ({ page }) => {
        await page.goto('/');

        // Check title
        await expect(page).toHaveTitle(/MAFIS/);

        // Verify meta description
        const metaDescription = page.locator('meta[name="description"]');
        await expect(metaDescription).toHaveAttribute('content', /MAFIS/);
    });

    test('hero section should display main calls to action', async ({ page }) => {
        await page.goto('/');

        const thesisButton = page.getByRole('link', { name: /Read the thesis/i });
        const simulatorButton = page.getByRole('link', { name: /Try Simulator/i });

        await expect(thesisButton).toBeVisible();
        await expect(simulatorButton).toBeVisible();
    });

    test('feature pillars should be present', async ({ page }) => {
        await page.goto('/');

        await expect(page.getByText('Entity Component System', { exact: true })).toBeVisible();
        await expect(page.getByText('Blazing Fast', { exact: true })).toBeVisible();
        await expect(page.getByText('WebAssembly', { exact: true })).toBeVisible();
    });

    test('gap section blockquote should be present', async ({ page }) => {
        await page.goto('/');

        const blockquote = page.locator('.gap-quote');
        await expect(blockquote).toBeVisible();
        await expect(blockquote).toContainText('when things go wrong');
    });

    test('thesis section should have canvases', async ({ page }) => {
        await page.goto('/');

        const thesisScenes = page.locator('#thesis-scenes canvas');
        // Each SingleGrid renders 2 canvases (grid + sparkline), so 4 total
        // client:only="react" components need extra time to hydrate
        await expect(thesisScenes).toHaveCount(4, { timeout: 15000 });
    });

    test('scorecard should display Robustness metric', async ({ page }) => {
        await page.goto('/');

        const robustness = page.getByText('Robustness');
        await expect(robustness).toBeVisible();
    });

    test('cascade section should have canvas and depth text', async ({ page }) => {
        await page.goto('/');

        const cascadeCanvas = page.locator('#cascade-scene canvas');
        // client:only="react" component needs extra time to hydrate
        await expect(cascadeCanvas).toHaveCount(1, { timeout: 15000 });

        const depthText = page.getByText('CASCADE DEPTH');
        await expect(depthText).toBeVisible();
    });

    test('bevy community credit should be visible', async ({ page }) => {
        await page.goto('/');

        const bevyCredit = page.locator('.bevy-credit');
        await expect(bevyCredit).toBeVisible();
        await expect(bevyCredit).toContainText('Bevy');
    });

    test('section labels should be present', async ({ page }) => {
        await page.goto('/');

        const labels = page.locator('.section-label');
        await expect(labels).toHaveCount(4);
    });
});
