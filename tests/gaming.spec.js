import { test, expect } from 'playwright/test';

const asset = name => `https://images.example.test/${name}`;
const avatarImage = '<svg xmlns="http://www.w3.org/2000/svg" width="184" height="184"><rect width="184" height="184" fill="#5eead4"/><circle cx="92" cy="76" r="36" fill="#4a5568"/></svg>';
const frameImage = '<svg xmlns="http://www.w3.org/2000/svg" width="224" height="224"><rect x="6" y="6" width="212" height="212" rx="12" fill="none" stroke="#e53e3e" stroke-width="12"/></svg>';

function gamingStats() {
    return {
        steam: {
            profileUrl: 'https://steamcommunity.com/id/example/',
            avatar: asset('steam-avatar.jpg'),
            animatedAvatar: { animatedUrl: asset('steam-animated.gif'), staticUrl: asset('steam-equipped.jpg') },
            avatarFrame: { animatedUrl: asset('steam-frame-animated.png'), staticUrl: asset('steam-frame-static.png') },
            lastPlayed: 'A favorite game',
            games: [
                { name: 'An exceptionally long game title that wraps comfortably inside a narrow gaming card', playtime_forever: 6001, icon: asset('game-1.png') },
                { name: 'LongUnbrokenGameTitleThatStillNeedsToFitInsideEveryGamingCard', playtime_forever: 4500, icon: asset('game-2.png') },
                { name: 'A third favorite', playtime_forever: 1800, icon: asset('game-3.png') },
                { name: 'Not displayed', playtime_forever: 1200, icon: asset('game-4.png') },
            ],
        },
        xbox: {
            gamertag: 'testPlayer',
            gamerscore: 1234567,
            gamerPictureUrl: asset('xbox-avatar.png'),
            recentGames: [
                { titleId: '1', title: 'A long recent Xbox game title that should wrap gracefully', playtimeHours: '123h' },
                { titleId: '2', title: 'Another recent game', playtimeHours: '4h' },
            ],
        },
        retro: {
            user: 'retroPlayer',
            avatar: asset('retro-avatar.png'),
            hardcorePoints: 123456,
            softcorePoints: 456789,
            lastGame: { title: 'The Legend of Zelda: Ocarina of Time', consoleName: 'Nintendo 64' },
            recentAchievements: Array.from({ length: 4 }, (_, index) => ({
                title: index === 0 ? 'An achievement title with enough words to wrap onto several lines' : `Achievement ${index + 1}`,
                game: index === 0 ? 'The Legend of Zelda: A Link to the Past' : 'Another game with a lengthy title',
                points: 10 + index,
                dateAwarded: '2026-11-12T13:58:27Z',
                badgeUrl: asset(`badge-${index + 1}.png`),
                hardcore: true,
            })),
        },
    };
}

async function mockGaming(page, stats = gamingStats(), failedAssets = new Set()) {
    await page.route('**/stats.json', route => route.fulfill({ json: stats }));
    await page.route('https://images.example.test/**', route => {
        const name = new URL(route.request().url()).pathname.slice(1);
        return failedAssets.has(name)
            ? route.fulfill({ status: 404, body: '' })
            : route.fulfill({ contentType: 'image/svg+xml', body: name.includes('frame') ? frameImage : avatarImage });
    });
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    await page.goto('/extras/gaming');
    await expect(page.locator('.stat-card')).toHaveCount(3);
}

async function expectLoadedSource(image, src) {
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate(element => element.currentSrc)).toBe(src);
    await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth > 0)).toBe(true);
}

const midpoint = box => box.x + box.width / 2;

async function expectCentered(element, container) {
    const [elementBox, containerBox] = await Promise.all([element.boundingBox(), container.boundingBox()]);
    expect(elementBox).not.toBeNull();
    expect(containerBox).not.toBeNull();
    expect(Math.abs(midpoint(elementBox) - midpoint(containerBox))).toBeLessThanOrEqual(1);
}

async function expectTextCentered(element, container) {
    const [textBox, containerBox] = await Promise.all([
        element.evaluate(node => {
            const range = document.createRange();
            range.selectNodeContents(node);
            const box = range.getBoundingClientRect();
            return { x: box.x, width: box.width };
        }),
        container.boundingBox(),
    ]);
    expect(Math.abs(midpoint(textBox) - midpoint(containerBox))).toBeLessThanOrEqual(1);
}

async function expectWithin(element, container) {
    const [elementBox, containerBox] = await Promise.all([element.boundingBox(), container.boundingBox()]);
    expect(elementBox).not.toBeNull();
    expect(containerBox).not.toBeNull();
    expect(elementBox.x).toBeGreaterThanOrEqual(containerBox.x - 1);
    expect(elementBox.x + elementBox.width).toBeLessThanOrEqual(containerBox.x + containerBox.width + 1);
}

test('platform pictures follow headers, keep their shapes, and show the complete Steam frame', async ({ page }) => {
    const stats = gamingStats();
    await mockGaming(page, stats);
    for (const platform of ['steam', 'xbox', 'retro']) {
        const card = page.getByRole('region', { name: platform, exact: true });
        const picture = card.locator(':scope > .stat-card-header + .profile-picture');
        await expect(picture).toHaveCount(1);
        const image = picture.locator('.profile-picture-image');
        await expect(image).toHaveAttribute('alt', /\S+/);
        await expectCentered(image, card);
        if (platform === 'xbox') {
            await expect(picture).toHaveClass(/profile-picture--round/);
            await expect(image).toHaveCSS('border-radius', '50%');
        } else {
            await expect(picture).not.toHaveClass(/profile-picture--round/);
            const radius = await image.evaluate(element => Number.parseFloat(getComputedStyle(element).borderRadius));
            expect(radius).toBe(0);
        }
    }

    const steam = page.getByRole('region', { name: 'steam', exact: true });
    const stage = steam.locator('.profile-picture-stage');
    const image = steam.locator('.profile-picture-image');
    const frame = steam.locator('.profile-picture-frame');
    await expectLoadedSource(image, stats.steam.animatedAvatar.animatedUrl);
    await expectLoadedSource(frame, stats.steam.avatarFrame.animatedUrl);
    await expect(frame).toHaveAttribute('alt', '');
    const [imageBox, frameBox, stageBox] = await Promise.all([image.boundingBox(), frame.boundingBox(), stage.boundingBox()]);
    expect(frameBox.width / imageBox.width).toBeCloseTo(224 / 184, 2);
    expect(frameBox.height / imageBox.height).toBeCloseTo(224 / 184, 2);
    expect(Math.abs(midpoint(frameBox) - midpoint(imageBox))).toBeLessThanOrEqual(1);
    expect(frameBox.y).toBeGreaterThanOrEqual(stageBox.y - 1);
    expect(frameBox.y + frameBox.height).toBeLessThanOrEqual(stageBox.y + stageBox.height + 1);
    await expectWithin(frame, stage);
    await expect(steam.locator('.profile-picture + .stat-label')).toHaveText('Most Played');
    await expect(steam.locator('.stat-label + .steam-games')).toHaveCount(1);
    await expect(steam.locator('.steam-games > li')).toHaveCount(3);
    await expect(page.locator('.retro-unlocks > li')).toHaveCount(3);
});

for (const reducedMotion of ['no-preference', 'reduce']) {
    test(`Steam keeps its equipped animations with reduced motion set to ${reducedMotion}`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion });
        const stats = gamingStats();
        await mockGaming(page, stats);
        const steam = page.getByRole('region', { name: 'steam', exact: true });
        await expectLoadedSource(steam.locator('.profile-picture-image'), stats.steam.animatedAvatar.animatedUrl);
        await expectLoadedSource(steam.locator('.profile-picture-frame'), stats.steam.avatarFrame.animatedUrl);
    });
}

test('failed animated layers independently fall back to their static versions', async ({ page }) => {
    const stats = gamingStats();
    await mockGaming(page, stats, new Set(['steam-animated.gif', 'steam-frame-animated.png']));
    const steam = page.getByRole('region', { name: 'steam', exact: true });
    await expectLoadedSource(steam.locator('.profile-picture-image'), stats.steam.animatedAvatar.staticUrl);
    await expectLoadedSource(steam.locator('.profile-picture-frame'), stats.steam.avatarFrame.staticUrl);
});

test('failed equipped avatars use the existing Steam avatar', async ({ page }) => {
    const stats = gamingStats();
    await mockGaming(page, stats, new Set(['steam-animated.gif', 'steam-equipped.jpg']));
    const steam = page.getByRole('region', { name: 'steam', exact: true });
    await expectLoadedSource(steam.locator('.profile-picture-image'), stats.steam.avatar);
    await expectLoadedSource(steam.locator('.profile-picture-frame'), stats.steam.avatarFrame.animatedUrl);
});

test('failed frame layers leave the avatar and reserved layout intact', async ({ page }) => {
    const stats = gamingStats();
    const failures = new Set();
    await mockGaming(page, stats, failures);
    const steam = page.getByRole('region', { name: 'steam', exact: true });
    await expectLoadedSource(steam.locator('.profile-picture-frame'), stats.steam.avatarFrame.animatedUrl);
    const before = await steam.locator('.profile-picture-stage').boundingBox();
    failures.add('steam-frame-animated.png');
    failures.add('steam-frame-static.png');
    await page.reload();
    await expectLoadedSource(steam.locator('.profile-picture-image'), stats.steam.animatedAvatar.animatedUrl);
    await expect(steam.locator('.profile-picture-frame')).toHaveCount(0);
    const after = await steam.locator('.profile-picture-stage').boundingBox();
    expect(after.width).toBeCloseTo(before.width, 1);
    expect(after.height).toBeCloseTo(before.height, 1);
});

test('missing or broken pictures produce stable placeholders without broken frames', async ({ page }) => {
    const stats = gamingStats();
    stats.retro.avatar = null;
    await mockGaming(page, stats, new Set([
        'steam-animated.gif', 'steam-equipped.jpg', 'steam-avatar.jpg',
        'steam-frame-animated.png', 'steam-frame-static.png', 'xbox-avatar.png',
    ]));
    for (const platform of ['steam', 'xbox', 'retro']) {
        const card = page.getByRole('region', { name: platform, exact: true });
        const placeholder = card.locator('.profile-picture-placeholder');
        await expect(placeholder).toBeVisible();
        await expectCentered(placeholder, card);
        await expect(card.locator('img.profile-picture-image')).toHaveCount(0);
    }
    await expect(page.locator('.profile-picture-frame')).toHaveCount(0);
});

test('older stats snapshots still show existing Steam and Xbox images', async ({ page }) => {
    const stats = gamingStats();
    delete stats.steam.animatedAvatar;
    delete stats.steam.avatarFrame;
    delete stats.retro.avatar;
    await mockGaming(page, stats);
    await expectLoadedSource(page.getByRole('region', { name: 'steam', exact: true }).locator('.profile-picture-image'), stats.steam.avatar);
    await expectLoadedSource(page.getByRole('region', { name: 'xbox', exact: true }).locator('.profile-picture-image'), stats.xbox.gamerPictureUrl);
    await expect(page.getByRole('region', { name: 'retro', exact: true }).locator('.profile-picture-placeholder')).toBeVisible();
    await expect(page.locator('.profile-picture-frame')).toHaveCount(0);
    await expect(page.locator('.retro-last-game')).toContainText(stats.retro.lastGame.title);
});

for (const width of [320, 768, 1280]) {
    test(`gaming cards wrap and keep compact centered stats at ${width}px`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 1000 });
        await mockGaming(page);
        const cards = page.locator('.stat-card');
        for (const card of await cards.all()) {
            const box = await card.boundingBox();
            expect(box.x).toBeGreaterThanOrEqual(0);
            expect(box.x + box.width).toBeLessThanOrEqual(width);
            for (const text of await card.locator('.stat-text-stack > *, .stat-figure > *, .xbox-game .game-name, .xbox-game .stat-meta').all()) {
                await expectWithin(text, card);
            }
        }

        for (const figure of await page.locator('.stat-figure').all()) {
            const value = figure.locator(':scope > p');
            const label = figure.locator(':scope > span');
            await expectTextCentered(value, figure);
            await expectTextCentered(label, figure);
            const [valueBox, labelBox, fontSize] = await Promise.all([
                value.boundingBox(), label.boundingBox(), label.evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize)),
            ]);
            const gap = labelBox.y - valueBox.y - valueBox.height;
            expect(gap).toBeGreaterThanOrEqual(-1);
            expect(gap).toBeLessThanOrEqual(fontSize / 2);
        }
        await expectCentered(page.locator('.xbox-gamerscore'), page.getByRole('region', { name: 'xbox', exact: true }));
        const retro = page.getByRole('region', { name: 'retro', exact: true });
        const figureBoxes = await retro.locator('.stat-figure').evaluateAll(elements => elements.map(element => {
            const box = element.getBoundingClientRect();
            return { left: box.left, right: box.right };
        }));
        const retroBox = await retro.boundingBox();
        const groupMidpoint = (Math.min(...figureBoxes.map(box => box.left)) + Math.max(...figureBoxes.map(box => box.right))) / 2;
        expect(Math.abs(groupMidpoint - midpoint(retroBox))).toBeLessThanOrEqual(1);

        for (const stack of await page.locator('.stat-text-stack').all()) {
            const spacing = await stack.evaluate(element => {
                const children = [...element.children];
                return children.slice(1).map((child, index) => ({
                    gap: child.getBoundingClientRect().top - children[index].getBoundingClientRect().bottom,
                    fontSize: Number.parseFloat(getComputedStyle(child).fontSize),
                }));
            });
            for (const { gap, fontSize } of spacing) {
                expect(gap).toBeGreaterThanOrEqual(-1);
                expect(gap).toBeLessThanOrEqual(fontSize / 2);
            }
        }
        const lastPlayed = page.locator('.retro-last-game');
        await expect(lastPlayed.locator('p')).toHaveCount(3);
        const paragraphSpacing = await lastPlayed.locator('p').evaluateAll(elements => elements.map(element => {
            const style = getComputedStyle(element);
            return { top: Number.parseFloat(style.marginTop), fontSize: Number.parseFloat(style.fontSize) };
        }));
        for (const { top, fontSize } of paragraphSpacing) expect(top).toBeCloseTo(fontSize, 1);
        await page.locator('.stats-grid').screenshot({ path: testInfo.outputPath(`gaming-${width}.png`) });
    });
}
