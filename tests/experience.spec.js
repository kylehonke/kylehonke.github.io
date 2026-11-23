import { test, expect } from 'playwright/test';
import { readFileSync } from 'node:fs';
import { experienceAt } from '../src/experience/timeline.js';

const data = JSON.parse(readFileSync(new URL('../src/data/experience.json', import.meta.url)));
const snapshot = experienceAt(data, '2026-11-19');
const rows = [...snapshot.now, ...snapshot.previously];
const transition = rows.flatMap(row => row.transitions)[0];

test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: new Date('2026-11-19T18:00:00Z') });
});

test('both sections are ordered and tiles start collapsed', async ({ page }) => {
    await page.goto('/experience/');
    for (const [heading, entries] of Object.entries(snapshot)) {
        const region = page.getByRole('region', { name: heading, exact: true });
        await expect(region).toHaveCount(entries.length ? 1 : 0);
        await expect(region.locator('.experience-name')).toHaveText(entries.map(row => row.title));
    }
    await expect(page.locator('details[open]')).toHaveCount(0);
});

test('keyboard disclosure and navigation between linked roles', async ({ page }) => {
    test.skip(!transition, 'No published role transition to follow');
    await page.goto('/experience/');
    const current = page.locator('#experience-' + transition.to.id), earlier = page.locator('#experience-' + transition.from.id);
    await current.locator('summary').focus();
    await page.keyboard.press('Enter');
    const previousLink = current.getByRole('button', { name: transition.from.title, exact: true });
    await previousLink.focus();
    await page.keyboard.press('Enter');
    await expect(earlier.locator('summary')).toBeFocused();
    await expect(earlier).toHaveAttribute('open', '');
    await earlier.getByRole('button', { name: transition.to.title, exact: true }).click();
    await expect(current.locator('summary')).toBeFocused();
});

test('an open tab refreshes across the Chicago date boundary', async ({ page }) => {
    test.skip(!transition, 'No published handoff to exercise');
    // UTC noon is always on the same calendar day in Chicago. Resolve local
    // midnight by checking the two possible UTC offsets (standard and daylight).
    const utcDate = transition.date;
    const five = new Date(utcDate + 'T05:00:00Z');
    const atFive = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' }).format(five);
    const midnight = atFive === utcDate ? five : new Date(utcDate + 'T06:00:00Z');
    const start = new Date(midnight.getTime() - 60000);
    await page.clock.setSystemTime(start);
    await page.goto('/experience/');
    const target = page.locator('#experience-' + transition.to.id);
    await expect(target).toHaveCount(0);
    await page.clock.fastForward(61000);
    await expect(target).toBeVisible();
});

test('mobile navigation, disclosures, direct load and history', async ({ page, request }) => {
    await page.setViewportSize({ width: 320, height: 750 });
    await page.goto('/about/');
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByRole('link')).toHaveText(['Home', 'About', 'Experience', 'Projects', 'Resume', 'Extras']);
    await nav.getByRole('link', { name: 'Experience' }).click();
    await expect(page).toHaveTitle('Experience | Kyle Honke');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/experience\/$/);
    const disclosure = page.locator('.experience-entry summary').first();
    if (await disclosure.count()) {
        await disclosure.click();
        await expect(page.locator('details[open]')).toHaveCount(1);
    }
    const fits = await page.locator('nav a, .experience-top, .experience-name, .experience-dates').evaluateAll(nodes =>
        nodes.every(node => node.getBoundingClientRect().left >= 0 && node.getBoundingClientRect().right <= window.innerWidth));
    expect(fits).toBe(true);
    await page.goBack();
    await expect(page).toHaveTitle('About | Kyle Honke');
    await page.goForward();
    await expect(page).toHaveTitle('Experience | Kyle Honke');
    expect(await (await request.get('/sitemap.xml')).text()).toContain('<loc>https://kylehonke.github.io/experience/</loc>');
});
