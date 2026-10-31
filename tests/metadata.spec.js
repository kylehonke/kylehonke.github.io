import { test, expect } from 'playwright/test';
import { routes, notFoundRoute, pageTitle, canonicalUrl, isIndexable } from '../src/routes.js';

async function expectMetadata(page, route) {
    await expect(page).toHaveTitle(pageTitle(route));
    const values = [
        ['meta[name="description"]', 'content', route.description],
        ['meta[name="robots"]', 'content', isIndexable(route) ? null : 'noindex'],
        ['link[rel="canonical"]', 'href', route === notFoundRoute ? null : canonicalUrl(route)],
        ['meta[property="og:url"]', 'content', route === notFoundRoute ? null : canonicalUrl(route)],
        ['meta[property="og:title"]', 'content', pageTitle(route)],
        ['meta[property="og:description"]', 'content', route.description],
    ];
    await expect(page.locator('head title')).toHaveCount(1);
    for (const [selector, attribute, value] of values) {
        const tags = page.locator(`head ${selector}`);
        await expect(tags).toHaveCount(value === null ? 0 : 1);
        if (value !== null) await expect(tags).toHaveAttribute(attribute, value);
    }
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://kylehonke.github.io/og-image.png');
}

const home = routes.find(route => route.path === '/');
const about = routes.find(route => route.path === '/about');
const storm = routes.find(route => route.path === '/extras/storm');

for (const start of [storm, about]) {
    test(`${start.title} → Home → back → forward`, async ({ page }) => {
        await page.goto(`${start.path}/`);
        await expectMetadata(page, start);
        // A reload would discard this marker and mask the original bug.
        await page.evaluate(() => { window.navigationMarker = true; });
        await page.getByRole('link', { name: 'Home', exact: true }).click();
        await expectMetadata(page, home);
        await page.goBack();
        await expectMetadata(page, start);
        await page.goForward();
        await expectMetadata(page, home);
        expect(await page.evaluate(() => window.navigationMarker)).toBe(true);
    });
}

test('Home → Storm through React links', async ({ page }) => {
    await page.goto('/');
    await expectMetadata(page, home);
    await page.getByRole('link', { name: 'Extras', exact: true }).click();
    await page.getByRole('link', { name: /Storm/ }).click();
    await expectMetadata(page, storm);
});

test('unknown route clears canonical and Open Graph URL, and Home restores them', async ({ page }) => {
    await page.goto('/about/');
    await expectMetadata(page, about);
    // BrowserRouter consumes popstate for history traversal, including unknown URLs.
    await page.evaluate(() => {
        window.history.pushState({}, '', '/missing-page/');
        window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await expectMetadata(page, notFoundRoute);
    await page.getByRole('link', { name: 'Home', exact: true }).click();
    await expectMetadata(page, home);
});

test('empty description replaces stale content and repeated synchronization deduplicates tags', async ({ page }) => {
    await page.goto('/about/');
    await expectMetadata(page, about);
    await page.evaluate(() => {
        for (const tag of document.head.querySelectorAll('meta[name="description"], meta[name="robots"], link[rel="canonical"], meta[property^="og:"]')) {
            if (['og:type', 'og:site_name'].includes(tag.getAttribute('property')) || tag.getAttribute('property')?.startsWith('og:image')) continue;
            document.head.append(tag.cloneNode(true));
        }
        window.history.pushState({}, '', '/extras/food/');
        window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await expectMetadata(page, routes.find(route => route.path === '/extras/food'));
    await page.getByRole('link', { name: 'Home', exact: true }).click();
    await expectMetadata(page, home);
});

for (const route of [...routes, notFoundRoute]) {
    test(`static HTML metadata: ${route.path}`, async ({ browser }) => {
        const context = await browser.newContext({ javaScriptEnabled: false });
        const page = await context.newPage();
        await page.goto(`http://127.0.0.1:4173${route === notFoundRoute ? '/404.html' : route.path === '/' ? '/' : `${route.path}/`}`);
        await expectMetadata(page, route);
        await context.close();
    });
}
