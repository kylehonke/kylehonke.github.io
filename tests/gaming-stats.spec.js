import { test, expect } from 'playwright/test';
import { execFile } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, stat, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const runNode = promisify(execFile);
const imageBase = 'https://shared.fastly.steamstatic.com/community_assets/images/';
const equippedPath = '/IPlayerService/GetProfileItemsEquipped/v1/';
const retroPath = '/API/API_GetUserSummary.php';
const equippedItems = {
    animated_avatar: { image_small: 'items/avatar.gif', image_large: 'items/avatar.jpg' },
    avatar_frame: { image_small: 'items/frame.png', image_large: 'items/frame-static.png' },
};
const cachedCosmetics = {
    animatedAvatar: { animatedUrl: 'https://example.com/old-avatar.gif', staticUrl: 'https://example.com/old-avatar.jpg' },
    avatarFrame: { animatedUrl: 'https://example.com/old-frame.png', staticUrl: 'https://example.com/old-frame-static.png' },
};

function removeTemporaryDirectory(directory) {
    const cleanupTarget = resolve(directory);
    if (dirname(cleanupTarget) !== resolve(tmpdir()) || !basename(cleanupTarget).startsWith('portfolio-gaming-stats-')) {
        throw new Error('Refusing to clean up an unexpected temporary directory.');
    }
    return rm(cleanupTarget, { recursive: true, force: true });
}

async function runStats({ replies = {}, previous = null, twice = false } = {}) {
    const directory = await mkdtemp(join(tmpdir(), 'portfolio-gaming-stats-'));
    try {
        await mkdir(join(directory, 'scripts'));
        await mkdir(join(directory, 'public'));
        const script = join(directory, 'scripts', 'fetch-stats.mjs');
        const output = join(directory, 'public', 'stats.json');
        const mock = join(directory, 'mock-fetch.mjs');
        await copyFile(new URL('../scripts/fetch-stats.js', import.meta.url), script);
        if (previous) await writeFile(output, JSON.stringify(previous));
        await writeFile(join(directory, 'replies.json'), JSON.stringify({
            '/IPlayerService/GetOwnedGames/v0001/': { body: { response: { games: [
                { appid: 1, name: 'Fresh game', playtime_forever: 120, img_icon_url: 'game-icon' },
            ] } } },
            '/ISteamUser/GetPlayerSummaries/v0002/': { body: { response: { players: [
                { profileurl: 'https://steamcommunity.com/id/example/', avatarfull: 'https://example.com/avatar.jpg' },
            ] } } },
            '/IPlayerService/GetRecentlyPlayedGames/v0001/': { body: { response: { games: [{ name: 'Fresh game' }] } } },
            [equippedPath]: { body: { response: equippedItems } },
            [retroPath]: { body: { TotalPoints: 10, TotalSoftcorePoints: 5, UserPic: '/UserPic/example.png' } },
            ...replies,
        }));
        await writeFile(mock, `
            import { readFile } from 'node:fs/promises';
            const replies = JSON.parse(await readFile(new URL('./replies.json', import.meta.url), 'utf8'));
            globalThis.fetch = async input => {
                const reply = replies[new URL(input).pathname];
                if (!reply || reply.reject) throw new Error('Mock request failed');
                return { ok: !reply.status || reply.status === 200, status: reply.status || 200, json: async () => reply.body };
            };
        `);
        const options = {
            cwd: directory,
            timeout: 10000,
            env: {
                ...process.env,
                STEAM_API_KEY: 'test-steam-key', STEAM_ID: '123',
                XBOX_API_KEY: '', XBOX_XUID: '',
                RETRO_API_KEY: 'test-retro-key', RETRO_USER: 'example',
            },
        };
        const first = await runNode(process.execPath, ['--import', pathToFileURL(mock).href, script], options);
        const contents = await readFile(output, 'utf8');
        if (!twice) return { stats: JSON.parse(contents), stdout: first.stdout };

        // An old modification time proves the second run skipped writing, without relying on timing.
        const unchangedTime = new Date('2000-01-01T00:00:00.000Z');
        await utimes(output, unchangedTime, unchangedTime);
        const second = await runNode(process.execPath, ['--import', pathToFileURL(mock).href, script], options);
        return {
            stats: JSON.parse(contents),
            stdout: second.stdout,
            contents,
            secondContents: await readFile(output, 'utf8'),
            modifiedAt: (await stat(output)).mtime.toISOString(),
        };
    } finally {
        await removeTemporaryDirectory(directory);
    }
}

test('publishes equipped animated and static image URLs without changing game stats', async () => {
    const { stats } = await runStats();
    expect(stats.steam.animatedAvatar).toEqual({ animatedUrl: `${imageBase}items/avatar.gif`, staticUrl: `${imageBase}items/avatar.jpg` });
    expect(stats.steam.avatarFrame).toEqual({ animatedUrl: `${imageBase}items/frame.png`, staticUrl: `${imageBase}items/frame-static.png` });
    expect(stats.steam.avatar).toBe('https://example.com/avatar.jpg');
    expect(stats.steam.games[0]).toMatchObject({ name: 'Fresh game', playtime_forever: 120 });
    expect(stats.retro.avatar).toBe('https://media.retroachievements.org/UserPic/example.png');
});

for (const [failure, reply] of [
    ['network failure', { reject: true }],
    ['HTTP failure', { status: 503 }],
    ['missing response envelope', { body: {} }],
    ['invalid response envelope', { body: { response: [] } }],
    ['invalid image URL', { body: { response: { animated_avatar: { image_small: 'https://[' } } } }],
]) {
    test(`retains cached cosmetics on ${failure} while publishing fresh games`, async () => {
        const { stats } = await runStats({
            previous: { steam: { ...cachedCosmetics, games: [{ name: 'Old game' }] } },
            replies: { [equippedPath]: reply },
        });
        expect(stats.steam).toMatchObject(cachedCosmetics);
        expect(stats.steam.games[0].name).toBe('Fresh game');
    });
}

test('successful unequipping clears cached cosmetics', async () => {
    const { stats } = await runStats({
        previous: { steam: cachedCosmetics },
        replies: { [equippedPath]: { body: { response: {} } } },
    });
    expect(stats.steam.animatedAvatar).toBeNull();
    expect(stats.steam.avatarFrame).toBeNull();
});

test('older snapshots without cosmetics keep the static avatar when equipped items are unavailable', async () => {
    const { stats } = await runStats({
        previous: { steam: { avatar: 'https://example.com/old-avatar.jpg' } },
        replies: { [equippedPath]: { reject: true } },
    });
    expect(stats.steam.animatedAvatar).toBeNull();
    expect(stats.steam.avatarFrame).toBeNull();
    expect(stats.steam.avatar).toBe('https://example.com/avatar.jpg');
});

test('preserves absolute image URLs and tolerates missing optional assets', async () => {
    const { stats } = await runStats({ replies: {
        [equippedPath]: { body: { response: {
            animated_avatar: { image_small: 'https://example.com/animated.gif' },
        } } },
        [retroPath]: { body: { UserPic: 'https://example.com/retro.png' } },
    } });
    expect(stats.steam.animatedAvatar).toEqual({ animatedUrl: 'https://example.com/animated.gif', staticUrl: null });
    expect(stats.steam.avatarFrame).toBeNull();
    expect(stats.retro.avatar).toBe('https://example.com/retro.png');
});

test('missing Retro picture stays optional', async () => {
    const { stats } = await runStats({ replies: { [retroPath]: { body: { TotalPoints: 10 } } } });
    expect(stats.retro.avatar).toBeNull();
});

test('unchanged cosmetics and stats skip rewriting the public snapshot', async () => {
    const result = await runStats({ twice: true });
    expect(result.stdout).toContain('No stat changes; leaving stats.json untouched.');
    expect(result.secondContents).toBe(result.contents);
    expect(result.modifiedAt).toBe('2000-01-01T00:00:00.000Z');
});
